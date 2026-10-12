import { io } from "socket.io-client";
import { parseAiResponse, type AiControlProof, type AiResponse } from "./ai-client.js";

export interface AiControl extends AiControlProof {
  mode: "controller" | "readonly";
  gameId: string | null;
  graceUntil: string | null;
}
export interface AiConnectionOptions {
  getProof(): Promise<{ accessToken: string; appSession: string }>;
  onControl(control: AiControl): void;
  onSnapshot(snapshot: AiResponse): void;
  onConnection(ready: boolean): void;
  onError(message: string): void;
}
export interface AiConnection {
  getControl(): Promise<AiControlProof>;
  refresh(): Promise<void>;
  watch(gameId: string): Promise<void>;
  takeover(): Promise<void>;
  disconnect(): void;
}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const invalid = "Phản hồi ván với máy không hợp lệ. Vui lòng tải lại.";
const unavailable = "Chưa thể kết nối ván với máy. Kiểm tra mạng và thử lại.";
const expired = "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
function record(value: unknown, keys: string[]): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value) || Object.keys(value).length !== keys.length || Object.keys(value).some((key) => !keys.includes(key))) throw Error(invalid);
  return value as Record<string, unknown>;
}
function isId(value: unknown): value is string { return typeof value === "string" && uuid.test(value); }
function utc(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?Z$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 19) === value.slice(0, 19);
}
function proof(value: unknown) {
  const row = record(value, ["accessToken", "appSession"]);
  if (typeof row.accessToken !== "string" || !row.accessToken || typeof row.appSession !== "string" || !row.appSession) throw Error(expired);
  return { accessToken: row.accessToken, appSession: row.appSession };
}

export function connectAi(options: AiConnectionOptions): AiConnection {
  const tabId = crypto.randomUUID();
  let disposed = false, epoch = 0, watchEpoch = 0;
  let control: AiControl | null = null;
  let watchedGame: string | null = null;
  let latestVersion = -1;
  let capability: string | null = null;
  const pending = new Set<(message: string) => void>();
  const waiters = new Set<(proof: AiControlProof) => void>();
  function authority(): AiControlProof {
    if (!control || !socket.connected || control.connectionId !== socket.id) throw Error(unavailable);
    return { tabId: control.tabId, connectionId: control.connectionId, generation: control.generation };
  }
  function revoke(message = unavailable) {
    epoch++;
    const wasReady = control !== null;
    control = null;
    latestVersion = -1;
    for (const cancel of [...pending]) cancel(message);
    if (!disposed && wasReady) options.onConnection(false);
  }
  function close(message?: string) {
    if (disposed) return;
    revoke(message);
    if (message) options.onError(message);
    disposed = true;
    socket.removeAllListeners();
    socket.disconnect();
  }
  function parseControl(value: unknown): AiControl {
    const row = record(value, ["tabId", "connectionId", "generation", "mode", "gameId", "graceUntil"]);
    if (row.tabId !== tabId || !isId(row.tabId) || typeof row.connectionId !== "string" || !/^[-_a-zA-Z0-9]{1,128}$/.test(row.connectionId) || row.connectionId !== socket.id || typeof row.generation !== "number" || !Number.isSafeInteger(row.generation) || row.generation <= 0 || !["controller", "readonly"].includes(row.mode as string) || !(row.gameId === null || isId(row.gameId)) || !(row.graceUntil === null || utc(row.graceUntil))) throw Error(invalid);
    return { tabId, connectionId: row.connectionId, generation: row.generation, mode: row.mode as AiControl["mode"], gameId: row.gameId === null ? null : (row.gameId as string).toLowerCase(), graceUntil: row.graceUntil as string | null };
  }
  function acceptControl(value: unknown) {
    const next = parseControl(value);
    if (control && next.generation < control.generation) return;
    if (!control || next.generation !== control.generation || next.gameId !== control.gameId || next.mode !== control.mode) latestVersion = -1;
    const wasReady = control !== null;
    control = next;
    options.onControl({ ...next });
    if (!wasReady) options.onConnection(true);
    for (const resolve of [...waiters]) resolve(authority());
  }
  function task<T>(start: (resolve: (value: T) => void, reject: (message: string) => void) => void): Promise<T> {
    if (disposed) return Promise.reject(Error(unavailable));
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => cancel(unavailable), 5000);
      const finish = () => { clearTimeout(timer); pending.delete(cancel); };
      const cancel = (message: string) => { finish(); reject(Error(message)); };
      pending.add(cancel);
      start((value) => { finish(); resolve(value); }, cancel);
    });
  }
  function command(event: string, payload?: unknown, expectedWatch = watchEpoch): Promise<void> {
    const currentEpoch = epoch;
    return task<void>((resolve, reject) => {
      const ack = (error: unknown, value: unknown) => {
        if (disposed || epoch !== currentEpoch || watchEpoch !== expectedWatch) { reject(unavailable); return; }
        if (error) { reject(unavailable); return; }
        try {
          if (!value || typeof value !== "object" || Array.isArray(value)) throw Error(invalid);
          const row = value as Record<string, unknown>;
          if (row.ok === false) {
            record(row, ["ok", "code", "message"]);
            if (typeof row.code !== "string" || typeof row.message !== "string") throw Error(invalid);
            if (row.code === "AUTH_REQUIRED" || row.code === "SESSION_EXPIRED") { close(expired); reject(expired); return; }
            reject(row.code === "TAB_READ_ONLY" ? "Tab này chỉ có thể xem." : unavailable);
            return;
          }
          record(row, row.control === undefined ? ["ok"] : ["ok", "control"]);
          if (row.ok !== true) throw Error(invalid);
          if (row.control !== undefined) acceptControl(row.control);
          resolve();
        } catch { reject(invalid); }
      };
      if (payload === undefined) socket.timeout(5000).emit(event, ack);
      else socket.timeout(5000).emit(event, payload, ack);
    });
  }
  const socket = io(`${(import.meta.env.VITE_API_URL || "http://localhost:3000").replace(/\/$/, "")}/ai`, {
    path: "/ai/socket.io", transports: ["websocket"], withCredentials: true, autoConnect: false,
    auth: (done) => {
      if (disposed) return;
      revoke();
      const currentEpoch = epoch;
      void options.getProof().then((value) => {
        if (disposed || currentEpoch !== epoch) return;
        try {
          const fresh = proof(value);
          if (capability !== null && fresh.appSession !== capability) { close(expired); return; }
          capability = fresh.appSession;
          done({ ...fresh, tabId });
        } catch { close(expired); }
      }, () => { if (!disposed && currentEpoch === epoch) close(expired); });
    },
  });
  socket.on("connect", () => {
    if (disposed) return;
    // Transport connection alone does not confer authority.
    if (control && control.connectionId !== socket.id) revoke();
  });
  socket.on("disconnect", () => { if (!disposed) revoke(); });
  socket.on("connect_error", (error: unknown) => {
    if (disposed) return;
    const data = (error as { data?: { code?: unknown } })?.data;
    if (data?.code === "AUTH_REQUIRED" || data?.code === "SESSION_EXPIRED") { close(expired); return; }
    revoke();
    options.onError(unavailable);
  });
  socket.on("ai.control", (value: unknown) => {
    if (disposed || !socket.connected) return;
    try { acceptControl(value); } catch { options.onError(invalid); }
  });
  socket.on("ai.snapshot", (value: unknown) => {
    if (disposed || !control || !socket.connected || !watchedGame || control.gameId !== watchedGame) return;
    try {
      const response = parseAiResponse(value, watchedGame);
      if (response.control.generation !== control.generation || response.control.mode !== control.mode || response.snapshot.version <= latestVersion) return;
      latestVersion = response.snapshot.version;
      options.onSnapshot(response);
    } catch { options.onError(invalid); }
  });
  socket.on("ai.sessionExpired", () => { if (!disposed) close(expired); });
  socket.connect();
  return {
    getControl() {
      if (disposed) return Promise.reject(Error(unavailable));
      if (control) { try { return Promise.resolve(authority()); } catch { revoke(); } }
      let complete: ((proof: AiControlProof) => void) | undefined;
      return task<AiControlProof>((resolve) => { complete = resolve; waiters.add(resolve); }).finally(() => { if (complete) waiters.delete(complete); });
    },
    async refresh() {
      if (disposed || !socket.connected) throw Error(unavailable);
      revoke();
      const currentEpoch = epoch;
      const fresh = await task<ReturnType<typeof proof>>((resolve, reject) => {
        void options.getProof().then((value) => {
          if (disposed || currentEpoch !== epoch) { reject(unavailable); return; }
          try { resolve(proof(value)); } catch { close(expired); reject(expired); }
        }, () => { if (!disposed && currentEpoch === epoch) close(expired); reject(expired); });
      });
      if (disposed || currentEpoch !== epoch) throw Error(unavailable);
      if (fresh.appSession !== capability) { close(expired); throw Error(expired); }
      await command("ai.refresh", fresh);
    },
    watch(gameId) {
      if (!isId(gameId)) return Promise.reject(Error("Thông tin ván không hợp lệ."));
      if (disposed || !control || !socket.connected) return Promise.reject(Error(unavailable));
      watchedGame = gameId.toLowerCase();
      latestVersion = -1;
      watchEpoch++;
      return command("ai.watch", { gameId: watchedGame });
    },
    takeover() {
      if (disposed || !control || !socket.connected) return Promise.reject(Error(unavailable));
      return command("ai.takeover");
    },
    disconnect() { close(); },
  };
}
