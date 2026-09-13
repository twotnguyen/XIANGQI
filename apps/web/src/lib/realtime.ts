/**
 * Socket.IO client for the game server (spec 04 "Socket.IO").
 *
 * Responsibilities:
 * - One shared connection per tab, bound to the API origin, handshake
 *   `auth: { accessToken, tabId }` with a per-tab UUID kept in `sessionStorage`.
 * - Refresh the Supabase session and reconnect with a FRESH token on
 *   `onAuthStateChange` and whenever the session is close to expiry.
 * - Typed `subscribe(event, handler)` for server pushes, and
 *   `sendCommand`/`emitWithAck` implementing the client retry rules:
 *   5s ack timeout, at most two retries with the SAME commandId/payload/version.
 * - Surface connection status (`connected|connecting|offline`) to the UI.
 * - Own `match:subscribe` / `room:subscribe` (re-issued on every reconnect) and
 *   the private controller grant that comes back in the subscribe ack.
 *
 * The socket is never proof of identity: every mutating event still sends the
 * controller lease and the server re-checks membership/lease per write.
 */
import { io, type Socket } from 'socket.io-client';
import type {
  ChatMessageDTO,
  CommandResult,
  MatchSnapshot,
  Move,
  RoomDTO,
} from '@xiangqi/contracts';
import { supabase } from './supabase.js';

export type RealtimeStatus = 'connected' | 'connecting' | 'offline';
export type ChatChannel = 'PLAYERS' | 'SPECTATORS';

/** Private controller lease handed to this tab by the subscribe ack. */
export interface ControllerGrant {
  controllerId: string;
  controlEpoch: number;
}

/** Server -> client pushes (spec 04 table; mirrors apps/server/src/realtime/events.ts). */
export interface RealtimeEventMap {
  'match:state': { matchId: string; snapshot: MatchSnapshot };
  'room:updated': { roomId: string; room: RoomDTO };
  'chat:message': {
    roomId: string;
    matchId: string | null;
    channel: ChatChannel;
    message: ChatMessageDTO;
  };
  'ai:status': {
    matchId: string;
    jobId: string | null;
    jobVersion: number;
    state: 'IDLE' | 'QUEUED' | 'THINKING' | 'FAILED';
  };
  'presence:changed': { userId: string; online: boolean; roomId?: string };
  'access:revoked': { roomId: string; reason: string; roomVersion: number; userIds: string[] };
  'control:revoked': {
    userId: string;
    roomId: string | null;
    matchId: string | null;
    controlEpoch: number;
  };
  'invitation:received': {
    userId: string;
    invitationId: string;
    roomId: string;
    roomName: string;
    role: 'PLAYER' | 'SPECTATOR';
    expiresAtMs: number;
  };
  'media:policy': { matchId: string; roomId: string | null; policy: Record<string, unknown> };
}

export type RealtimeEventName = keyof RealtimeEventMap;

/** Client -> server payloads (spec 04 table). */
export interface ClientEventMap {
  'match:subscribe': { matchId: string };
  'room:subscribe': { roomId: string };
  'match:move': {
    matchId: string;
    controllerId: string;
    controlEpoch: number;
    commandId: string;
    expectedVersion: number;
    payload: Move;
  };
  'match:sync': { matchId: string; lastVersion: number };
  'chat:send': {
    roomId: string;
    controllerId: string;
    controlEpoch: number;
    clientMessageId: string;
    content: string;
  };
  'presence:heartbeat': { tabId: string };
}

export interface MatchSubscription {
  snapshot: MatchSnapshot;
  controller: ControllerGrant | null;
}

export interface RoomSubscription {
  room: RoomDTO;
  match: MatchSnapshot | null;
  controller: ControllerGrant | null;
}

/** Ack envelope (spec 04: `ApiResult<T>`). */
export type AckOutcome<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string } };

export type ControlScope = 'match' | 'room';

interface Subscription {
  kind: 'match' | 'room';
  id: string;
  claimControl: boolean;
}

const TAB_ID_KEY = 'xiangqi.tabId';
const ACK_TIMEOUT_MS = 5_000;
/** Initial attempt + at most two retries, all with the same command payload. */
const MAX_ATTEMPTS = 3;
const HEARTBEAT_MS = 10_000;
const RECONNECT_BASE_MS = 500;
const RECONNECT_MAX_MS = 5_000;
const REFRESH_MARGIN_MS = 60_000;

const SERVER_EVENT_NAMES: readonly RealtimeEventName[] = [
  'match:state',
  'room:updated',
  'chat:message',
  'ai:status',
  'presence:changed',
  'access:revoked',
  'control:revoked',
  'invitation:received',
  'media:policy',
];

/** API origin the socket dials; falls back to the current origin (same-origin deploy). */
function apiOrigin(): string {
  const raw = import.meta.env['VITE_API_URL'];
  if (raw) {
    try {
      return new URL(raw, window.location.origin).origin;
    } catch {
      // fall through to same-origin
    }
  }
  return window.location.origin;
}

/** Per-tab UUID, stable across reloads of the same tab. */
function readTabId(): string {
  try {
    const existing = window.sessionStorage.getItem(TAB_ID_KEY);
    if (existing) return existing;
    const fresh = crypto.randomUUID();
    window.sessionStorage.setItem(TAB_ID_KEY, fresh);
    return fresh;
  } catch {
    return crypto.randomUUID();
  }
}

async function authHeaders(): Promise<Record<string, string>> {
  const { data } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${data.session?.access_token ?? ''}`,
  };
}

class RealtimeClient {
  private socket: Socket | null = null;
  private readonly tabId = readTabId();
  private status: RealtimeStatus = 'offline';
  private userId: string | null = null;
  private started = false;
  private connecting = false;
  private disposed = false;

  private readonly statusListeners = new Set<(status: RealtimeStatus) => void>();
  private readonly controllerListeners = new Map<
    ControlScope,
    Set<(grant: ControllerGrant | null) => void>
  >();
  private readonly handlers = new Map<RealtimeEventName, Set<(payload: never) => void>>();
  private readonly forwarded = new Set<RealtimeEventName>();

  private readonly subscriptions = new Map<symbol, Subscription>();
  private readonly appliedMatchIds = new Set<string>();
  private readonly appliedRoomIds = new Set<string>();
  /**
   * The tab's controller lease. Spec 03 keeps ONE `client_controls` row per user, so a
   * later takeover (room scope, then match scope) REPLACES the same server-side lease.
   * Holding a separate grant per scope would keep sending a stale controllerId/epoch for
   * the other scope and every write would be refused with CONTROL_REQUIRED — so the
   * newest grant is the tab's only grant, and every write uses it.
   */
  private controller: ControllerGrant | null = null;
  private readonly claimAttempted = new Set<string>();
  private claimInFlight = false;

  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempt = 0;

  /* ------------------------------------------------------------- lifecycle --- */

  getTabId(): string {
    return this.tabId;
  }

  getStatus(): RealtimeStatus {
    return this.status;
  }

  onStatus(listener: (status: RealtimeStatus) => void): () => void {
    this.statusListeners.add(listener);
    return () => this.statusListeners.delete(listener);
  }

  onController(scope: ControlScope, listener: (grant: ControllerGrant | null) => void): () => void {
    let set = this.controllerListeners.get(scope);
    if (!set) {
      set = new Set();
      this.controllerListeners.set(scope, set);
    }
    set.add(listener);
    listener(this.controller);
    return () => {
      set?.delete(listener);
    };
  }

  getController(scope?: ControlScope): ControllerGrant | null {
    // `scope` is advisory only: the server keeps one lease per user, so the tab's
    // single grant is what every scoped write must carry.
    void scope;
    return this.controller;
    return null;
  }

  /** Controller lease headers for HTTP mutations (match commands, chat, rematch). */
  controlHeaders(scope?: ControlScope): Record<string, string> {
    const grant = this.getController(scope);
    if (!grant) return {};
    return {
      'X-Control-Id': grant.controllerId,
      'X-Control-Epoch': String(grant.controlEpoch),
    };
  }

  /** Idempotent: wires auth/token handling and opens the socket. */
  start(): void {
    if (this.started || this.disposed) return;
    this.started = true;

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      this.userId = session?.user?.id ?? null;
      if (this.disposed) return;
      // Refresh + reconnect with a fresh token (spec 04).
      if (event === 'TOKEN_REFRESHED' || event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        setTimeout(() => void this.openFresh(true), 0);
      } else if (event === 'SIGNED_OUT') {
        this.closeSocket();
        this.setStatus('offline');
      }
    });
    this.disposeHooks.push(() => data.subscription.unsubscribe());

    void this.openFresh();
  }

  /** Release the connection; only used by tests/HMR teardown. */
  dispose(): void {
    this.disposed = true;
    for (const hook of this.disposeHooks) hook();
    this.disposeHooks.length = 0;
    this.stopHeartbeat();
    this.closeSocket();
    this.setStatus('offline');
  }

  private readonly disposeHooks: (() => void)[] = [];

  /* ----------------------------------------------------------- connection --- */

  private closeSocket(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      this.socket.removeAllListeners();
      this.socket.disconnect();
      this.socket = null;
    }
    this.forwarded.clear();
    this.appliedMatchIds.clear();
    this.appliedRoomIds.clear();
  }

  private async openFresh(force = false): Promise<void> {
    if (this.connecting || this.disposed) return;
    this.connecting = true;
    try {
      const session = await this.freshSession();
      if (!session) {
        this.setStatus('offline');
        return;
      }
      this.userId = session.user.id;
      this.ensureSocket(session.access_token);
      if (this.socket!.connected) {
        if (!force) return;
        // Fresh token on an open connection: drop and re-handshake.
        this.socket!.disconnect();
      }
      this.setStatus('connecting');
      this.socket!.connect();
    } finally {
      this.connecting = false;
    }
  }

  private async freshSession() {
    const { data } = await supabase.auth.getSession();
    let session = data.session;
    if (!session) return null;
    const expiresAtMs = (session.expires_at ?? 0) * 1000;
    if (expiresAtMs > 0 && expiresAtMs - Date.now() < REFRESH_MARGIN_MS) {
      try {
        const refreshed = await supabase.auth.refreshSession();
        if (refreshed.data.session) session = refreshed.data.session;
      } catch {
        // Keep the still-valid token; the server decides what it accepts.
      }
    }
    return session;
  }

  private ensureSocket(accessToken: string): void {
    if (this.socket) {
      this.socket.auth = { accessToken, tabId: this.tabId };
      return;
    }
    const socket = io(apiOrigin(), {
      transports: ['websocket'],
      autoConnect: false,
      reconnection: false,
      auth: { accessToken, tabId: this.tabId },
    });
    this.socket = socket;

    socket.on('connect', async () => {
      this.reconnectAttempt = 0;
      this.startHeartbeat();
      await this.resubscribeAll();
      this.setStatus('connected');
    });
    socket.on('disconnect', () => {
      this.setStatus('offline');
      this.stopHeartbeat();
      this.scheduleReconnect();
    });
    socket.on('connect_error', () => {
      this.setStatus('offline');
      this.stopHeartbeat();
      void this.reconnectWithFreshToken();
    });

    for (const name of SERVER_EVENT_NAMES) {
      this.forward(name);
    }
  }

  private scheduleReconnect(): void {
    if (this.disposed || this.reconnectTimer) return;
    const delay = Math.min(RECONNECT_MAX_MS, RECONNECT_BASE_MS * 2 ** this.reconnectAttempt);
    this.reconnectAttempt += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      void this.openFresh(true);
    }, delay);
  }

  private async reconnectWithFreshToken(): Promise<void> {
    if (this.disposed) return;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    await this.openFresh(true);
    if (this.status !== 'connected' && !this.reconnectTimer) this.scheduleReconnect();
  }

  private setStatus(next: RealtimeStatus): void {
    if (this.status === next) return;
    this.status = next;
    for (const listener of this.statusListeners) listener(next);
  }

  private startHeartbeat(): void {
    if (this.heartbeatTimer) return;
    // Spec 03/04: 10s heartbeat, 30s lease. Also extends the controller lease, so a
    // reconnected controller tab refreshes it immediately instead of after one tick.
    const beat = () => {
      void this.emitWithAck('presence:heartbeat', { tabId: this.tabId }, 2_000);
    };
    beat();
    this.heartbeatTimer = setInterval(beat, HEARTBEAT_MS);
  }

  private stopHeartbeat(): void {
    if (!this.heartbeatTimer) return;
    clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;
  }

  /* ------------------------------------------------------------ transports --- */

  /** Typed server-push subscription. Returns an unsubscribe function. */
  subscribe<E extends RealtimeEventName>(
    event: E,
    handler: (payload: RealtimeEventMap[E]) => void,
  ): () => void {
    this.start();
    this.forward(event);
    let set = this.handlers.get(event);
    if (!set) {
      set = new Set();
      this.handlers.set(event, set);
    }
    set.add(handler as (payload: never) => void);
    return () => {
      set?.delete(handler as (payload: never) => void);
      if (set?.size === 0) this.handlers.delete(event);
    };
  }

  private forward(event: RealtimeEventName): void {
    if (this.forwarded.has(event)) return;
    const socket = this.socket;
    if (!socket) return;
    this.forwarded.add(event);
    socket.on(event as string, (payload: unknown) => {
      this.dispatch(event, payload);
    });
  }

  private dispatch(event: RealtimeEventName, payload: unknown): void {
    if (event === 'control:revoked') {
      const p = payload as RealtimeEventMap['control:revoked'];
      if (!this.userId || p.userId === this.userId) {
        if (this.controller && this.controller.controlEpoch <= p.controlEpoch) {
          this.setController(null);
          // The lease moved to another tab: allow exactly one fresh claim if this tab
          // is still the one the user is acting in.
          this.claimAttempted.clear();
        }
      }
    }
    if (event === 'access:revoked') {
      this.setController(null);
    }
    const set = this.handlers.get(event);
    if (!set) return;
    for (const handler of set) {
      try {
        (handler as (payload: unknown) => void)(payload);
      } catch (err) {
        console.error(`[realtime] handler for ${event} threw`, err);
      }
    }
  }

  /**
   * Emit one event and wait up to `timeoutMs` for the ack envelope.
   * Never retries: callers decide whether an unanswered ack is retryable.
   */
  async emitWithAck<E extends keyof ClientEventMap>(
    event: E,
    payload: ClientEventMap[E],
    timeoutMs: number = ACK_TIMEOUT_MS,
  ): Promise<AckOutcome<unknown>> {
    this.start();
    const socket = this.socket;
    if (!socket || !socket.connected) {
      return { ok: false, error: { code: 'OFFLINE', message: 'Chưa kết nối máy chủ' } };
    }
    return new Promise<AckOutcome<unknown>>((resolve) => {
      let settled = false;
      const finish = (outcome: AckOutcome<unknown>) => {
        if (settled) return;
        settled = true;
        resolve(outcome);
      };
      socket.timeout(timeoutMs).emit(
        event as string,
        payload,
        (err: Error | null, res?: { ok?: boolean; data?: unknown; error?: { code?: string; message?: string } }) => {
          if (err) {
            finish({ ok: false, error: { code: 'ACK_TIMEOUT', message: 'Máy chủ không phản hồi kịp' } });
            return;
          }
          if (res && res.ok) {
            finish({ ok: true, data: res.data });
            return;
          }
          finish({
            ok: false,
            error: {
              code: res?.error?.code ?? 'UNKNOWN',
              message: res?.error?.message ?? 'Máy chủ trả lỗi không xác định',
            },
          });
        },
      );
    });
  }

  /**
   * Command send with the spec-04 retry rules: same commandId/payload/version on
   * every attempt, at most two retries after the 5s ack timeout. A definitive
   * server rejection is returned as-is (never retried).
   */
  private async sendCommand<E extends 'match:move' | 'chat:send'>(
    event: E,
    payload: ClientEventMap[E],
  ): Promise<AckOutcome<unknown>> {
    let last: AckOutcome<unknown> = {
      ok: false,
      error: { code: 'ACK_TIMEOUT', message: 'Không nhận được xác nhận từ máy chủ' },
    };
    for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
      const res = await this.emitWithAck(event, payload);
      if (res.ok) return res;
      last = res;
      // Only a missing ack is ambiguous enough to resend the same command.
      if (res.error.code !== 'ACK_TIMEOUT') return res;
      if (this.status !== 'connected') return res;
    }
    return last;
  }

  /** Read-only match sync; never mutates. */
  async syncMatch(matchId: string, lastVersion: number): Promise<AckOutcome<MatchSnapshot>> {
    return (await this.emitWithAck('match:sync', { matchId, lastVersion })) as AckOutcome<MatchSnapshot>;
  }

  async sendMove(matchId: string, move: Move, expectedVersion: number): Promise<AckOutcome<CommandResult>> {
    const grant = this.getController('match') ?? this.getController();
    if (!grant) {
      return { ok: false, error: { code: 'CONTROL_REQUIRED', message: 'Tab này không giữ quyền điều khiển' } };
    }
    return (await this.sendCommand('match:move', {
      matchId,
      controllerId: grant.controllerId,
      controlEpoch: grant.controlEpoch,
      commandId: crypto.randomUUID(),
      expectedVersion,
      payload: move,
    })) as AckOutcome<CommandResult>;
  }

  /** Chat send via socket; `clientMessageId` is owned by the caller so retries reuse it. */
  async sendChat(
    roomId: string,
    clientMessageId: string,
    content: string,
  ): Promise<AckOutcome<ChatMessageDTO>> {
    const grant = this.getController('room') ?? this.getController();
    if (!grant) {
      return { ok: false, error: { code: 'CONTROL_REQUIRED', message: 'Tab này không giữ quyền điều khiển' } };
    }
    return (await this.sendCommand('chat:send', {
      roomId,
      controllerId: grant.controllerId,
      controlEpoch: grant.controlEpoch,
      clientMessageId,
      content,
    })) as AckOutcome<ChatMessageDTO>;
  }

  /* ---------------------------------------------------------- subscriptions --- */

  /** Subscribe to a match; re-issued automatically on every reconnect. */
  subscribeMatch(matchId: string, opts: { claimControl?: boolean } = {}): () => void {
    this.start();
    return this.addSubscription('match', matchId, opts.claimControl ?? false);
  }

  /** Subscribe to a room (room DTO + match snapshot + private controller grant). */
  subscribeRoom(roomId: string, opts: { claimControl?: boolean } = {}): () => void {
    this.start();
    return this.addSubscription('room', roomId, opts.claimControl ?? false);
  }

  isRoomSubscribed(roomId: string): boolean {
    return this.status === 'connected' && this.appliedRoomIds.has(roomId);
  }

  isMatchSubscribed(matchId: string): boolean {
    return this.status === 'connected' && this.appliedMatchIds.has(matchId);
  }

  private addSubscription(kind: 'match' | 'room', id: string, claimControl: boolean): () => void {
    const token = Symbol(`${kind}:${id}`);
    this.subscriptions.set(token, { kind, id, claimControl });
    void this.reconcileSubscriptions();
    return () => {
      this.subscriptions.delete(token);
      void this.reconcileSubscriptions();
    };
  }

  private desiredIds(kind: 'match' | 'room'): { ids: string[]; claimControl: boolean } {
    const ids: string[] = [];
    let claimControl = false;
    for (const sub of this.subscriptions.values()) {
      if (sub.kind !== kind) continue;
      if (!ids.includes(sub.id)) ids.push(sub.id);
      if (sub.claimControl) claimControl = true;
    }
    return { ids, claimControl };
  }

  private async reconcileSubscriptions(): Promise<void> {
    if (this.status !== 'connected' && !this.socket?.connected) return;
    const match = this.desiredIds('match');
    const room = this.desiredIds('room');
    for (const matchId of match.ids) {
      if (this.appliedMatchIds.has(matchId)) continue;
      await this.doMatchSubscribe(matchId, match.claimControl);
    }
    for (const roomId of room.ids) {
      if (this.appliedRoomIds.has(roomId)) continue;
      await this.doRoomSubscribe(roomId, room.claimControl);
    }
  }

  private async resubscribeAll(): Promise<void> {
    // Fresh connection: server-side group joins are gone, so re-issue everything.
    this.appliedMatchIds.clear();
    this.appliedRoomIds.clear();
    await this.reconcileSubscriptions();
  }

  private async doMatchSubscribe(matchId: string, claimControl: boolean): Promise<void> {
    const res = await this.emitWithAck('match:subscribe', { matchId });
    if (!res.ok) {
      this.appliedMatchIds.delete(matchId);
      console.warn(`[realtime] match:subscribe failed (${res.error.code}): ${res.error.message}`);
      return;
    }
    this.appliedMatchIds.add(matchId);
    const data = res.data as MatchSubscription;
    if (data.controller) this.setController(data.controller);
    else if (claimControl) await this.claimControl('match', matchId, data.snapshot);
    // Feed the ack snapshot through the same path as pushes so consumers have
    // one code path for "snapshot arrived".
    this.dispatch('match:state', { matchId, snapshot: data.snapshot });
  }

  private async doRoomSubscribe(roomId: string, claimControl: boolean): Promise<void> {
    const res = await this.emitWithAck('room:subscribe', { roomId });
    if (!res.ok) {
      this.appliedRoomIds.delete(roomId);
      console.warn(`[realtime] room:subscribe failed (${res.error.code}): ${res.error.message}`);
      return;
    }
    this.appliedRoomIds.add(roomId);
    const data = res.data as RoomSubscription;
    if (data.controller) this.setController(data.controller);
    else if (claimControl) await this.claimControl('room', roomId, data.room);
    this.dispatch('room:updated', { roomId, room: data.room });
    if (data.match) {
      this.dispatch('match:state', { matchId: data.match.id, snapshot: data.match });
    }
  }

  private setController(grant: ControllerGrant | null): void {
    const previous = this.controller;
    this.controller = grant;
    if (
      previous?.controllerId === grant?.controllerId &&
      previous?.controlEpoch === grant?.controlEpoch
    ) {
      return;
    }
    for (const listeners of this.controllerListeners.values()) {
      for (const listener of listeners) listener(grant);
    }
  }

  /**
   * Claim the controller lease for this tab through the authenticated HTTP
   * command (spec 04 `POST /control/takeover`). Only called when the subscribe
   * ack shows this tab owns no lease yet.
   */
  private async claimControl(
    scope: ControlScope,
    contextId: string,
    context: MatchSnapshot | RoomDTO,
  ): Promise<void> {
    const key = `${scope}:${contextId}`;
    if (this.claimAttempted.has(key)) return;
    // A tab that is not (yet) a participant, or whose claim fails, must be able to try
    // again: only a SUCCESSFUL claim is remembered, so a race with the session/user id
    // or a transient server error cannot leave the tab read-only for the whole match.
    if (!this.isParticipant(scope, context)) return;
    this.claimAttempted.add(key);

    try {
      const headers = await authHeaders();
      const res = await fetch(`${apiOrigin()}/api/v1/control/takeover`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ tabId: this.tabId }),
      });
      const data = await res.json();
      if (res.ok && data?.ok && data.data) {
        this.setController({
          controllerId: data.data.controllerId as string,
          controlEpoch: Number(data.data.controlEpoch),
        });
        return;
      }
      this.claimAttempted.delete(key);
    } catch {
      this.claimAttempted.delete(key);
    }
  }

  /**
   * Public re-claim used by consumers that see a participant tab without a lease
   * (for example after the server rotated the lease or a first claim raced the
   * session). Idempotent: a claim already in flight is not duplicated.
   */
  async claimController(scope: ControlScope, contextId: string, context: MatchSnapshot | RoomDTO): Promise<void> {
    if (this.controller) return;
    if (this.claimInFlight) return;
    this.claimInFlight = true;
    try {
      this.claimAttempted.delete(`${scope}:${contextId}`);
      await this.claimControl(scope, contextId, context);
    } finally {
      this.claimInFlight = false;
    }
  }

  private isParticipant(scope: ControlScope, context: MatchSnapshot | RoomDTO): boolean {
    if (!this.userId) return false;
    if (scope === 'match') {
      const snapshot = context as MatchSnapshot;
      return snapshot.redUserId === this.userId || snapshot.blackUserId === this.userId;
    }
    const room = context as RoomDTO;
    return room.members.some((member) => member.userId === this.userId);
  }
}

/** App-wide singleton: one socket per tab. */
export const realtime = new RealtimeClient();

// Dev-server HMR: the module is replaced on edit, so drop the old socket instead
// of leaking one connection (and one heartbeat) per save.
if (import.meta.hot) {
  import.meta.hot.dispose(() => realtime.dispose());
}
