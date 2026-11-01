import { useCallback, useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { MatchmakingCommand, MatchmakingMode, MatchmakingState, PublicRoomAuthProof } from "@xiangqi/shared";
import { getApiBaseUrl } from "../../shared/api.js";
import { isSfxEnabled } from "../../shared/preferences.js";

type Intent = { queueId: string; bootId: string };
type Input = { userId: string | null; getProof: () => Promise<PublicRoomAuthProof>; onMatched: (roomId: string) => void };
export interface Matchmaking {
  state: MatchmakingState | null;
  open: boolean;
  error: string | null;
  pending: boolean;
  connected: boolean;
  seconds: number | null;
  join: (mode: MatchmakingMode) => void;
  cancel: () => void;
  confirm: () => void;
  decline: () => void;
  retry: () => void;
  sync: () => void;
  dismiss: () => void;
}
const unavailable = "Chưa thể kết nối tìm trận. Vui lòng thử lại.";
const active = ["SEARCHING", "CONFIRMING", "WAITING", "COUNTDOWN"];
const statuses = ["IDLE", ...active, "MATCHED", "TIMED_OUT", "CANCELLED"];
function validProof(value: unknown): value is PublicRoomAuthProof {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  const cap = (v: unknown) => typeof v === "string" && /^[A-Za-z0-9_-]{43}$/.test(v);
  return row.kind === "member"
    ? Object.keys(row).length === 3 && typeof row.accessToken === "string" && row.accessToken.length > 0 && row.accessToken.length <= 8192 && !/\s/.test(row.accessToken) && cap(row.appSession)
    : row.kind === "guest" && Object.keys(row).length === 2 && cap(row.guestCapability);
}
function parseState(value: unknown): MatchmakingState | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const row = value as Record<string, unknown>;
  const nullable = (v: unknown) => v === null || typeof v === "string";
  const date = (v: unknown) => v === null || (typeof v === "string" && Number.isFinite(Date.parse(v)));
  if (typeof row.bootId !== "string" || !row.bootId || typeof row.serverNow !== "string" || !Number.isFinite(Date.parse(row.serverNow)) || !nullable(row.queueId) || !(row.mode === null || row.mode === "CASUAL" || row.mode === "RANKED") || typeof row.status !== "string" || !statuses.includes(row.status) || !date(row.startedAt) || !date(row.deadline) || !nullable(row.offerId) || typeof row.confirmed !== "boolean" || !nullable(row.roomId) || !(row.reason === undefined || typeof row.reason === "string") || !(row.occupiedElsewhere === undefined || typeof row.occupiedElsewhere === "boolean")) return null;
  return row as unknown as MatchmakingState;
}
function readIntent(key: string): Intent | null {
  try {
    const value: unknown = JSON.parse(sessionStorage.getItem(key) ?? "null");
    if (value && typeof value === "object" && "queueId" in value && "bootId" in value && typeof value.queueId === "string" && typeof value.bootId === "string") return { queueId: value.queueId, bootId: value.bootId };
  } catch { /* Storage may be unavailable. */ }
  return null;
}
function saveIntent(key: string, value: Intent | null) {
  try { if (value) sessionStorage.setItem(key, JSON.stringify(value)); else sessionStorage.removeItem(key); } catch { /* Queue remains usable without storage. */ }
}
const terminal = ["TIMED_OUT", "CANCELLED"];
const terminalKey = (value: MatchmakingState) => terminal.includes(value.status) ? [value.bootId, value.queueId, value.status, value.startedAt, value.deadline, value.reason].join("|") : null;
function readDismissed(key: string): string | null {
  try { return sessionStorage.getItem(`${key}.dismissed`); } catch { return null; }
}
function saveDismissed(key: string, value: string) {
  try { sessionStorage.setItem(`${key}.dismissed`, value); } catch { /* Dismissal then lasts only for this page. */ }
}

export function useMatchmaking({ userId, getProof, onMatched }: Input): Matchmaking {
  const [state, setState] = useState<MatchmakingState | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [connected, setConnected] = useState(false);
  const [seconds, setSeconds] = useState<number | null>(null);
  const refs = useRef({ getProof, onMatched });
  refs.current = { getProof, onMatched };
  const socket = useRef<Socket | null>(null);
  const stateRef = useRef<MatchmakingState | null>(null);
  const intent = useRef<Intent | null>(null);
  const interested = useRef(false);
  const busy = useRef(false);
  const ready = useRef(false);
  const revision = useRef(0);
  const generation = useRef(0);
  const lastTime = useRef(0);
  const offset = useRef(0);
  const mode = useRef<MatchmakingMode | null>(null);
  const retryMode = useRef<MatchmakingMode | null>(null);
  const dismissed = useRef<string | null>(null);
  const matched = useRef<string | null>(null);
  const sounded = useRef<string | null>(null);
  const audio = useRef<AudioContext | null>(null);
  const key = userId ? `xiangqi.matchmaking.${userId}` : "";
  const sendRef = useRef<(type: MatchmakingCommand["type"], selected?: MatchmakingMode) => void>(() => {});

  useEffect(() => {
    generation.current++;
    const run = generation.current;
    stateRef.current = null; intent.current = key ? readIntent(key) : null; interested.current = false; dismissed.current = key ? readDismissed(key) : null; busy.current = false; ready.current = false; revision.current = 0; lastTime.current = 0; matched.current = null; sounded.current = null; mode.current = null; retryMode.current = null;
    setState(null); setOpen(false); setError(null); setPending(false); setConnected(false);
    if (!userId) return;
    let closed = false;
    let epoch = 0;
    let request = 0;
    let deferredSync = false;
    const early = { state: null as MatchmakingState | null };
    const retiredBoots = new Set<string>();
    let timer: ReturnType<typeof setTimeout> | undefined;
    const report = (message: string) => {
      if (interested.current || intent.current || (stateRef.current && active.includes(stateRef.current.status))) {
        setError(message); setOpen(true);
      }
    };
    const api = new URL(getApiBaseUrl());
    const client = io(`${api.origin}/matchmaking`, {
      path: `${api.pathname}/matchmaking/socket.io`, transports: ["websocket"], withCredentials: true, autoConnect: false,
      auth: (done) => {
        const attempt = ++epoch;
        void refs.current.getProof().then((proof) => { if (!closed && attempt === epoch) { if (validProof(proof)) done(proof); else { report("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."); client.disconnect(); } } }, () => { if (!closed && attempt === epoch) { report(unavailable); client.disconnect(); } });
      },
    });
    socket.current = client;
    const apply = (value: unknown) => {
      const next = parseState(value);
      if (!next) { report("Phản hồi tìm trận không hợp lệ. Vui lòng thử lại."); return; }
      if (retiredBoots.has(next.bootId)) return;
      if (stateRef.current && stateRef.current.bootId !== next.bootId) retiredBoots.add(stateRef.current.bootId);
      const time = Date.parse(next.serverNow);
      if (time < lastTime.current && next.bootId === stateRef.current?.bootId) return;
      lastTime.current = time;
      offset.current = time - Date.now();
      stateRef.current = next; setState(next); setError(null);
      if (next.mode) mode.current = next.mode;
      if (next.queueId && active.includes(next.status)) intent.current = { queueId: next.queueId, bootId: next.bootId };
      else intent.current = null;
      saveIntent(key, intent.current);
      if (next.status === "MATCHED") { interested.current = false; setOpen(false); }
      else if (active.includes(next.status) || (next.status !== "IDLE" && terminalKey(next) !== dismissed.current)) setOpen(true);
      if (next.status === "CONFIRMING" && next.offerId && sounded.current !== next.offerId) {
        sounded.current = next.offerId;
        try { if (isSfxEnabled()) { const context = audio.current ?? (audio.current = new AudioContext()); void context.resume().catch(() => {}); const tone = context.createOscillator(); const gain = context.createGain(); tone.frequency.value = 660; gain.gain.value = 0.12; tone.connect(gain); gain.connect(context.destination); tone.start(); tone.stop(context.currentTime + 0.25); } } catch { /* Audio is optional when the browser blocks playback. */ }
      }
      if (next.status === "MATCHED" && next.roomId && matched.current !== next.roomId) { matched.current = next.roomId; refs.current.onMatched(next.roomId); }
    };
    const send = (type: MatchmakingCommand["type"], selected?: MatchmakingMode) => {
      if (busy.current && type === "sync") { deferredSync = true; return; }
      if (closed || busy.current || !client.connected || typeof client.emit !== "function" || (type !== "sync" && !ready.current)) return;
      const current = stateRef.current;
      const saved = intent.current;
      const command: MatchmakingCommand = { commandId: crypto.randomUUID(), type };
      if (type === "join") command.mode = selected;
      if (type === "sync" && saved) Object.assign(command, saved);
      if (type !== "join" && type !== "sync" && current?.queueId) { command.queueId = current.queueId; command.bootId = current.bootId; }
      if ((type === "confirm" || type === "decline") && current?.offerId) command.offerId = current.offerId;
      busy.current = true; setPending(true);
      const atRevision = revision.current;
      const requestId = ++request;
      const finish = () => { busy.current = false; setPending(false); clearTimeout(timer); if (deferredSync) { deferredSync = false; queueMicrotask(() => send("sync")); } };
      timer = setTimeout(() => { if (closed || run !== generation.current) return; ready.current = false; setConnected(false); finish(); report(unavailable); }, 10000);
      client.emit("matchmaking.command", command, (reply: unknown) => {
        if (closed || run !== generation.current || !busy.current || requestId !== request) return;
        finish();
        if (!reply || typeof reply !== "object" || !("status" in reply)) { report(unavailable); return; }
        if (reply.status === "ok" && "state" in reply) {
          if (!parseState(reply.state)) { report("Phản hồi tìm trận không hợp lệ. Vui lòng thử lại."); return; }
          if (revision.current === atRevision) apply(reply.state);
          if (type === "sync") {
            ready.current = true; setConnected(true);
            if (early.state && Date.parse(early.state.serverNow) > lastTime.current) apply(early.state);
            early.state = null;
            const selected = retryMode.current; retryMode.current = null;
            const latest = stateRef.current;
            if (selected && latest && !active.includes(latest.status) && latest.status !== "MATCHED" && !latest.occupiedElsewhere) send("join", selected);
          }
        } else { report(reply.status === "error" && "error" in reply && reply.error && typeof reply.error === "object" && "message" in reply.error && typeof reply.error.message === "string" ? reply.error.message : unavailable); }
      });
    };
    sendRef.current = send;
    client.on("connect", () => { ready.current = false; setConnected(false); send("sync"); });
    client.on("disconnect", () => { epoch++; request++; early.state = null; ready.current = false; busy.current = false; clearTimeout(timer); setPending(false); setConnected(false); });
    client.on("connect_error", () => { ready.current = false; setConnected(false); report(unavailable); });
    client.on("matchmaking.state", (value: unknown) => { if (!client.connected || closed) return; if (!ready.current) { early.state = parseState(value); return; } revision.current++; apply(value); });
    client.on("matchmaking.error", (value: unknown) => {
      if (closed || !client.connected) return;
      const reply = value as { status?: unknown; error?: { message?: unknown } } | null;
      report(reply?.status === "error" && typeof reply.error?.message === "string" ? reply.error.message : unavailable);
    });
    client.connect();
    return () => { closed = true; epoch++; clearTimeout(timer); sendRef.current = () => {}; socket.current = null; client.removeAllListeners(); client.disconnect(); };
  }, [userId, key]);

  useEffect(() => {
    const update = () => setSeconds(state?.deadline ? Math.max(0, Math.ceil((Date.parse(state.deadline) - (Date.now() + offset.current)) / 1000)) : null);
    update(); const timer = setInterval(update, 250); return () => clearInterval(timer);
  }, [state]);
  const join = useCallback((selected: MatchmakingMode) => {
    if (busy.current || (stateRef.current && active.includes(stateRef.current.status))) return;
    interested.current = true; mode.current = selected; setOpen(true); setError(null);
    if (!ready.current) { setError(unavailable); return; }
    try { audio.current ??= new AudioContext(); void audio.current.resume().catch(() => {}); } catch { /* Browser may not support audio. */ }
    sendRef.current("join", selected);
  }, []);
  const retry = useCallback(() => { interested.current = true; setError(null); if (!ready.current) { if (mode.current && (!stateRef.current || !active.includes(stateRef.current.status))) { retryMode.current = mode.current; try { audio.current ??= new AudioContext(); void audio.current.resume().catch(() => {}); } catch { /* Browser may not support audio. */ } } if (socket.current?.connected) sendRef.current("sync"); else socket.current?.connect(); } else if (stateRef.current && active.includes(stateRef.current.status)) sendRef.current("sync"); else if (mode.current) join(mode.current); else sendRef.current("sync"); }, [join]);
  const dismiss = useCallback(() => { const current = stateRef.current; if (!current || !active.includes(current.status) || !ready.current) { const dismissedKey = current && terminalKey(current); if (dismissedKey) { dismissed.current = dismissedKey; saveDismissed(key, dismissedKey); } interested.current = false; retryMode.current = null; setOpen(false); setError(null); } }, [key]);
  const sync = useCallback(() => sendRef.current("sync"), []);
  return { state, open, error, pending, connected, seconds, join, sync, cancel: () => sendRef.current("cancel"), confirm: () => sendRef.current("confirm"), decline: () => sendRef.current("decline"), retry, dismiss };
}
