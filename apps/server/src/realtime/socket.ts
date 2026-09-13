/**
 * Socket.IO transport (spec 04 "Socket.IO").
 *
 * One namespace `/`, WebSocket transport, handshake `auth:{accessToken,tabId}`. The token
 * is verified through the exact HTTP auth path (`createRequireAuth` from
 * `auth/authenticate.ts`, so token verification and the session-revocation check are
 * shared) and the Origin header is checked against `config.resolveAllowedOrigins`.
 *
 * Every subscribe/sync revalidates access (room membership or AI human participant plus the
 * spectator admission epoch) — a client-supplied room name is only a lookup key, never proof
 * of permission. Mutating events call the same service functions as HTTP and carry
 * `controllerId`/`controlEpoch`, checked per write with the shared `requireControlLease`.
 *
 * Server→client topics are server-generated: `user:<id>`, `room:<id>`, `match:<id>` and one
 * `chat:<matchId>:<channel>` group per authorized chat channel, so PLAYERS chat can never be
 * published to the generic room topic.
 */
import crypto from 'node:crypto';
import type { Server as HttpServer } from 'node:http';
import type { FastifyInstance } from 'fastify';
import { Server as SocketServer, type Socket } from 'socket.io';
import { z } from 'zod';
import type {
  ApiResult,
  ChatChannel,
  ChatMessageDTO,
  CommandResult,
  ControllerLease,
  ErrorCode,
  MatchCommand,
  MatchSnapshot,
  Move,
  RoomDTO,
} from '@xiangqi/contracts';
import { MoveSchema } from '@xiangqi/contracts';
import { createRequireAuth, type AuthenticatedUser } from '../auth/authenticate.js';
import { getPool } from '../db/pool.js';
import { getRoom, requireControlLease } from '../modules/rooms/service.js';
import { getMatchSnapshot, submitMove } from '../modules/matches/service.js';
import { sendMessage } from '../modules/chat/service.js';
import { rotateMatchTransports } from '../modules/media/service.js';
import { TRANSPORT_TUPLES } from '../modules/media/reconciler.js';
import {
  defaultPresence,
  loadControlLease,
  markControllerDisconnected,
  refreshControlLease,
  type ControlLease as ControlLeaseRow,
} from './presence.js';
import { matchBroadcaster } from './broadcast.js';
import {
  emitPresenceChanged,
  setRealtimeTransport,
  type RealtimeEventMap,
  type RealtimeEventName,
  type RealtimeTransport,
} from './events.js';

export interface RoomSubscription {
  room: RoomDTO;
  match: MatchSnapshot | null;
  matchId: string | null;
  channel: ChatChannel;
  admissionEpoch: number | null;
  controller: ControlLeaseRow | null;
}

export interface MatchSubscription {
  matchId: string;
  roomId: string | null;
  snapshot: MatchSnapshot;
  channel: ChatChannel | null;
  admissionEpoch: number | null;
  controller: ControlLeaseRow | null;
}

/** Seam for the unit lane: production wiring lives in `createDefaultRealtimeDeps`. */
export interface RealtimeGatewayDeps {
  authenticate(token: string): Promise<AuthenticatedUser | null>;
  requireLease(
    userId: string,
    controllerId: string | undefined,
    controlEpoch: string | number | undefined,
    ctx: { roomId?: string | null; matchId?: string | null },
  ): Promise<ControllerLease>;
  roomAccess(userId: string, roomId: string): Promise<RoomSubscription>;
  matchAccess(userId: string, matchId: string): Promise<MatchSubscription>;
  /** Current lease row, used to detect online/offline transitions. */
  loadLease(userId: string): Promise<ControlLeaseRow | null>;
  heartbeat(userId: string, tabId: string): Promise<ControlLeaseRow>;
  disconnect(userId: string, tabId: string): Promise<ControlLeaseRow | null>;
  move(userId: string, matchId: string, command: MatchCommand<Move>): Promise<CommandResult>;
  chat(
    userId: string,
    roomId: string,
    clientMessageId: string,
    content: string,
  ): Promise<ChatMessageDTO>;
}

interface SocketData {
  userId: string;
  sessionId: string | undefined;
  accessToken: string;
  tabId: string;
  roomId: string | null;
  matchId: string | null;
  channel: ChatChannel | null;
  admissionEpoch: number | null;
  topics: string[];
}

type GatewaySocket = Socket & { data: SocketData };

/* ------------------------------------------------------------------ topics --- */

function roomTopic(roomId: string): string {
  return `room:${roomId}`;
}

function matchTopic(matchId: string): string {
  return `match:${matchId}`;
}

function chatTopic(matchId: string, channel: ChatChannel): string {
  return `chat:${matchId}:${channel}`;
}

/* ------------------------------------------------------------ payload schemas --- */

export const RoomSubscribePayloadSchema = z.object({ roomId: z.string().uuid() }).strict();
export const MatchSubscribePayloadSchema = z.object({ matchId: z.string().uuid() }).strict();
export const MatchSyncPayloadSchema = z
  .object({ matchId: z.string().uuid(), lastVersion: z.number().int().min(0) })
  .strict();
export const MatchMovePayloadSchema = z
  .object({
    matchId: z.string().uuid(),
    controllerId: z.string().uuid(),
    controlEpoch: z.number().int().min(1),
    commandId: z.string().uuid(),
    expectedVersion: z.number().int().min(0),
    payload: MoveSchema,
  })
  .strict();
export const ChatSendPayloadSchema = z
  .object({
    roomId: z.string().uuid(),
    controllerId: z.string().uuid(),
    controlEpoch: z.number().int().min(1),
    clientMessageId: z.string().uuid(),
    content: z.string().min(1).max(1000),
  })
  .strict();
export const PresenceHeartbeatPayloadSchema = z.object({ tabId: z.string().uuid() }).strict();

/** Handshake auth transport shape (spec 04). */
export const HandshakeAuthSchema = z
  .object({ accessToken: z.string().min(1), tabId: z.string().uuid() })
  .strict();

/* ------------------------------------------------------------------ results --- */

const ERROR_CODE_SET: Record<string, true> = {
  UNAUTHENTICATED: true,
  FORBIDDEN: true,
  VALIDATION_ERROR: true,
  NOT_FOUND: true,
  CONFLICT: true,
  RATE_LIMITED: true,
  EMAIL_UNVERIFIED: true,
  ONBOARDING_REQUIRED: true,
  ROOM_FULL: true,
  ROOM_CLOSED: true,
  ALREADY_IN_ROOM: true,
  INVITE_INVALID: true,
  NOT_YOUR_TURN: true,
  INVALID_MOVE: true,
  VERSION_CONFLICT: true,
  COMMAND_ID_REUSED: true,
  MATCH_ENDED: true,
  PROPOSAL_EXPIRED: true,
  CONTROL_REQUIRED: true,
  AI_BUSY: true,
  MEDIA_UNAVAILABLE: true,
};

function fallbackCode(statusCode: number | undefined): ErrorCode {
  if (statusCode === 401) return 'UNAUTHENTICATED';
  if (statusCode === 403) return 'FORBIDDEN';
  if (statusCode === 404) return 'NOT_FOUND';
  if (statusCode === 429) return 'RATE_LIMITED';
  if (statusCode === 409) return 'CONFLICT';
  if (statusCode === 400) return 'VALIDATION_ERROR';
  return 'CONFLICT';
}

/** Service/route errors map onto the spec `ApiResult` error envelope. */
export function toFailure(err: unknown, requestId: string): ApiResult<never> {
  const e = err as { statusCode?: number; code?: string; message?: string } | null;
  const code = e?.code && ERROR_CODE_SET[e.code] ? (e.code as ErrorCode) : fallbackCode(e?.statusCode);
  return {
    ok: false,
    error: { code, message: e?.message ?? 'Yêu cầu không thực hiện được' },
    requestId,
  };
}

function validationError(): never {
  throw { statusCode: 400, code: 'VALIDATION_ERROR', message: 'Dữ liệu không hợp lệ' };
}

/* -------------------------------------------------------------- origin check --- */

/**
 * Enforce the CORS allowlist on the upgrade request. A browser always sends Origin for a
 * WebSocket, so a mismatching origin is rejected; a client that sends no Origin (Node,
 * native) is not blocked here because the handshake still requires a valid session token.
 */
export function isOriginAllowed(origin: string | undefined, allowedOrigins: string[]): boolean {
  if (origin === undefined || origin === '') return true;
  return allowedOrigins.includes(origin);
}

/* ------------------------------------------------------------------ gateway --- */

export interface RealtimeGatewayOptions {
  httpServer: HttpServer;
  allowedOrigins: string[];
  deps?: RealtimeGatewayDeps;
}

export interface RealtimeGateway {
  io: SocketServer;
  close(): Promise<void>;
}

interface TopicRef {
  count: number;
  unsubscribe: () => void;
}

/** The transport a gateway currently owns, so a stale close never clears a newer one. */
let activeTransport: RealtimeTransport | null = null;

export function createRealtimeGateway(options: RealtimeGatewayOptions): RealtimeGateway {
  const deps = options.deps ?? createDefaultRealtimeDeps();
  const { allowedOrigins } = options;

  const io = new SocketServer(options.httpServer, {
    path: '/socket.io',
    serveClient: false,
    transports: ['websocket'],
    maxHttpBufferSize: 65536,
    cors: { origin: allowedOrigins, credentials: false },
    allowRequest: (req, callback) => {
      callback(null, isOriginAllowed(req.headers.origin, allowedOrigins));
    },
  });

  // One in-process subscription per live match topic, so the existing after-commit
  // `matchBroadcaster.emit(...)` call sites reach sockets without being touched.
  const matchRefs = new Map<string, TopicRef>();

  function releaseMatchTopic(matchId: string): void {
    const existing = matchRefs.get(matchId);
    if (!existing) return;
    existing.count -= 1;
    if (existing.count <= 0) {
      existing.unsubscribe();
      matchRefs.delete(matchId);
    }
  }

  function evictRevoked(data: RealtimeEventMap['access:revoked']): void {
    const revoked = new Map(data.userIds.map((userId) => [userId, true]));
    for (const socket of io.sockets.sockets.values()) {
      const state = socket.data as SocketData;
      if (!revoked.has(state.userId) || state.topics.length === 0) continue;
      for (const topic of state.topics) socket.leave(topic);
      state.topics = [];
    }
  }

  async function publishToFriends(data: { userId: string; online: boolean }): Promise<void> {
    try {
      const res = await getPool().query(
        `SELECT CASE WHEN user_low = $1 THEN user_high ELSE user_low END AS friend_id
           FROM public.friend_relations
          WHERE status = 'ACCEPTED' AND (user_low = $1 OR user_high = $1)`,
        [data.userId],
      );
      for (const row of res.rows) {
        io.to(`user:${row.friend_id as string}`).emit('presence:changed', {
          userId: data.userId,
          online: data.online,
        });
      }
    } catch {
      // Presence fan-out is best-effort; the user/room topics already got the event.
    }
  }

  const transport: RealtimeTransport = {
    publish<E extends RealtimeEventName>(event: E, payload: RealtimeEventMap[E]): void {
      switch (event) {
        case 'match:state': {
          const data = payload as RealtimeEventMap['match:state'];
          io.to(matchTopic(data.matchId)).emit('match:state', data);
          return;
        }
        case 'room:updated': {
          const data = payload as RealtimeEventMap['room:updated'];
          io.to(roomTopic(data.roomId)).emit('room:updated', data);
          return;
        }
        case 'ai:status': {
          const data = payload as RealtimeEventMap['ai:status'];
          io.to(matchTopic(data.matchId)).emit('ai:status', data);
          return;
        }
        case 'chat:message': {
          const data = payload as RealtimeEventMap['chat:message'];
          // PLAYERS chat goes to its own channel group only — never to `room:<id>`.
          if (data.matchId) {
            io.to(chatTopic(data.matchId, data.channel)).emit('chat:message', data);
          }
          return;
        }
        case 'presence:changed': {
          const data = payload as RealtimeEventMap['presence:changed'];
          // One union emission: a socket in both its own user topic and the room topic gets
          // the event exactly once (socket.io de-duplicates chained rooms).
          const presenceRooms = io.to(`user:${data.userId}`);
          const presenceTarget = data.roomId ? presenceRooms.to(roomTopic(data.roomId)) : presenceRooms;
          presenceTarget.emit('presence:changed', data);
          void publishToFriends(data);
          return;
        }
        case 'access:revoked': {
          const data = payload as RealtimeEventMap['access:revoked'];
          const revokedTarget = data.userIds.reduce(
            (target, userId) => target.to(`user:${userId}`),
            io.to(roomTopic(data.roomId)),
          );
          revokedTarget.emit('access:revoked', data);
          evictRevoked(data);
          return;
        }
        case 'control:revoked': {
          const data = payload as RealtimeEventMap['control:revoked'];
          io.to(`user:${data.userId}`).emit('control:revoked', data);
          // Spec 03/06: a takeover revokes the previous controller's media grants too, so
          // every transport generation of the match is rotated before the new tab connects.
          if (data.matchId) rotateMediaForMatch(data.matchId);
          return;
        }
        case 'invitation:received': {
          const data = payload as RealtimeEventMap['invitation:received'];
          io.to(`user:${data.userId}`).emit('invitation:received', data);
          return;
        }
        case 'media:policy': {
          const data = payload as RealtimeEventMap['media:policy'];
          if (data.roomId) io.to(roomTopic(data.roomId)).emit('media:policy', data);
          else io.to(matchTopic(data.matchId)).emit('media:policy', data);
          return;
        }
        default:
          return;
      }
    },
  };

  activeTransport = transport;
  setRealtimeTransport(transport);

  function retainMatchTopic(matchId: string): void {
    const existing = matchRefs.get(matchId);
    if (existing) {
      existing.count += 1;
      return;
    }
    const unsubscribe = matchBroadcaster.subscribe(matchId, (snapshot) => {
      io.to(matchTopic(matchId)).emit('match:state', { matchId, snapshot });
    });
    matchRefs.set(matchId, { count: 1, unsubscribe });
  }

  io.use((socket, next) => {
    void (async () => {
      try {
        if (!isOriginAllowed(socket.handshake.headers.origin, allowedOrigins)) {
          next(new Error('ORIGIN_NOT_ALLOWED'));
          return;
        }
        const parsed = HandshakeAuthSchema.safeParse(socket.handshake.auth);
        if (!parsed.success) {
          next(new Error('UNAUTHENTICATED'));
          return;
        }
        const identity = await deps.authenticate(parsed.data.accessToken);
        if (!identity) {
          next(new Error('UNAUTHENTICATED'));
          return;
        }
        const state = socket.data as SocketData;
        state.userId = identity.id;
        state.sessionId = identity.sessionId;
        state.accessToken = parsed.data.accessToken;
        state.tabId = parsed.data.tabId;
        state.roomId = null;
        state.matchId = null;
        state.channel = null;
        state.admissionEpoch = null;
        state.topics = [];
        next();
      } catch {
        next(new Error('UNAUTHENTICATED'));
      }
    })();
  });

  io.on('connection', (rawSocket) => {
    const socket = rawSocket as GatewaySocket;
    const state = socket.data;

    /** Reconnect of the controller tab counts as online again (spec 03). */
    async function markOnline(): Promise<ControlLeaseRow> {
      const before = await deps.loadLease(state.userId);
      const lease = await deps.heartbeat(state.userId, state.tabId);
      defaultPresence.heartbeat(state.userId, state.tabId, Date.now());
      const wasOffline =
        !before || before.disconnectedAtMs !== null || before.leaseUntilMs <= Date.now();
      if (wasOffline) {
        emitPresenceChanged({ userId: state.userId, online: true, roomId: lease.roomId ?? undefined });
      }
      return lease;
    }

    void (async () => {
      socket.join(`user:${state.userId}`);
      try {
        await markOnline();
      } catch {
        // This tab does not hold the controller lease yet: silent until it takes over.
      }
    })();

    socket.on('room:subscribe', (payload: unknown, ack: unknown) => {
      void handle(ack, async () => {
        const parsed = RoomSubscribePayloadSchema.safeParse(payload);
        if (!parsed.success) validationError();
        await revalidateSession(deps, state);
        const sub = await deps.roomAccess(state.userId, parsed.data.roomId);

        state.roomId = sub.room.id;
        state.matchId = sub.matchId;
        state.channel = sub.channel;
        state.admissionEpoch = sub.admissionEpoch;
        const topics = [roomTopic(sub.room.id)];
        if (sub.matchId) {
          topics.push(matchTopic(sub.matchId), chatTopic(sub.matchId, sub.channel));
          retainMatchTopic(sub.matchId);
        }
        await socket.join(topics);
        state.topics = topics;
        defaultPresence.heartbeat(state.userId, state.tabId, Date.now());

        return {
          room: sub.room,
          match: sub.match,
          controller: sub.controller
            ? { controllerId: sub.controller.controllerId, controlEpoch: sub.controller.controlEpoch }
            : null,
        };
      });
    });

    socket.on('match:subscribe', (payload: unknown, ack: unknown) => {
      void handle(ack, async () => {
        const parsed = MatchSubscribePayloadSchema.safeParse(payload);
        if (!parsed.success) validationError();
        await revalidateSession(deps, state);
        const sub = await deps.matchAccess(state.userId, parsed.data.matchId);
        assertAdmissionUnchanged(state, sub.admissionEpoch);

        state.matchId = sub.matchId;
        state.roomId = sub.roomId;
        state.channel = sub.channel;
        state.admissionEpoch = sub.admissionEpoch;
        const topics = [matchTopic(sub.matchId)];
        if (sub.roomId) topics.push(roomTopic(sub.roomId));
        if (sub.channel) topics.push(chatTopic(sub.matchId, sub.channel));
        await socket.join(topics);
        state.topics = topics;
        retainMatchTopic(sub.matchId);
        defaultPresence.heartbeat(state.userId, state.tabId, Date.now());

        return {
          snapshot: sub.snapshot,
          controller: sub.controller
            ? { controllerId: sub.controller.controllerId, controlEpoch: sub.controller.controlEpoch }
            : null,
        };
      });
    });

    socket.on('match:sync', (payload: unknown, ack: unknown) => {
      void handle(ack, async () => {
        const parsed = MatchSyncPayloadSchema.safeParse(payload);
        if (!parsed.success) validationError();
        await revalidateSession(deps, state);
        // Access (membership + admission epoch) is re-checked on every sync, and the
        // snapshot read itself settles any overdue deadline before answering.
        const sub = await deps.matchAccess(state.userId, parsed.data.matchId);
        assertAdmissionUnchanged(state, sub.admissionEpoch);
        return sub.snapshot;
      });
    });

    socket.on('match:move', (payload: unknown, ack: unknown) => {
      void handle(ack, async () => {
        const parsed = MatchMovePayloadSchema.safeParse(payload);
        if (!parsed.success) validationError();
        await revalidateSession(deps, state);
        // Epoch/lease re-checked per write, never trusted from the handshake (spec 04).
        await deps.requireLease(state.userId, parsed.data.controllerId, parsed.data.controlEpoch, {
          matchId: parsed.data.matchId,
        });
        return deps.move(state.userId, parsed.data.matchId, {
          commandId: parsed.data.commandId,
          expectedVersion: parsed.data.expectedVersion,
          payload: parsed.data.payload,
        });
      });
    });

    socket.on('chat:send', (payload: unknown, ack: unknown) => {
      void handle(ack, async () => {
        const parsed = ChatSendPayloadSchema.safeParse(payload);
        if (!parsed.success) validationError();
        await revalidateSession(deps, state);
        await deps.requireLease(state.userId, parsed.data.controllerId, parsed.data.controlEpoch, {
          roomId: parsed.data.roomId,
        });
        return deps.chat(
          state.userId,
          parsed.data.roomId,
          parsed.data.clientMessageId,
          parsed.data.content,
        );
      });
    });

    socket.on('presence:heartbeat', (payload: unknown, ack: unknown) => {
      void handle(ack, async () => {
        const parsed = PresenceHeartbeatPayloadSchema.safeParse(payload);
        if (!parsed.success) validationError();
        await revalidateSession(deps, state);
        if (parsed.data.tabId !== state.tabId) {
          throw {
            statusCode: 403,
            code: 'CONTROL_REQUIRED',
            message: 'Tab này không giữ quyền điều khiển',
          };
        }
        const lease = await markOnline();
        return {
          controllerId: lease.controllerId,
          controlEpoch: lease.controlEpoch,
          leaseUntilMs: lease.leaseUntilMs,
        };
      });
    });

    socket.on('disconnect', () => {
      void (async () => {
        for (const topic of state.topics) {
          if (topic.startsWith('match:')) releaseMatchTopic(topic.slice('match:'.length));
        }
        state.topics = [];
        defaultPresence.disconnect(state.userId, state.tabId, Date.now());
        try {
          const transition = await deps.disconnect(state.userId, state.tabId);
          if (transition) {
            emitPresenceChanged({
              userId: transition.userId,
              online: false,
              roomId: transition.roomId ?? undefined,
            });
          }
        } catch {
          // A failed disconnect stamp must never crash the socket teardown.
        }
      })();
    });
  });

  return {
    io,
    async close(): Promise<void> {
      for (const ref of matchRefs.values()) ref.unsubscribe();
      matchRefs.clear();
      if (activeTransport === transport) {
        activeTransport = null;
        setRealtimeTransport(null);
      }
      io.disconnectSockets(true);
      io.engine.close();
    },
  };
}

/** Mount the gateway on the Fastify HTTP server (spec 04: one namespace, same port). */
export function attachRealtimeSocket(
  app: FastifyInstance,
  options: { allowedOrigins: string[]; deps?: RealtimeGatewayDeps },
): RealtimeGateway {
  const gateway = createRealtimeGateway({
    httpServer: app.server,
    allowedOrigins: options.allowedOrigins,
    deps: options.deps,
  });
  app.addHook('onClose', async () => {
    await gateway.close();
  });
  return gateway;
}

/** Wrap a handler in the spec ack envelope; every error becomes `ApiResult.error`. */
async function handle(
  ack: unknown,
  run: () => Promise<unknown>,
): Promise<void> {
  const requestId = crypto.randomUUID();
  const reply =
    typeof ack === 'function' ? (ack as (result: ApiResult<unknown>) => void) : undefined;
  try {
    reply?.({ ok: true, data: await run(), requestId });
  } catch (err) {
    reply?.(toFailure(err, requestId));
  }
}

async function revalidateSession(
  deps: RealtimeGatewayDeps,
  state: SocketData,
): Promise<void> {
  const identity = await deps.authenticate(state.accessToken);
  if (!identity || identity.id !== state.userId) {
    throw {
      statusCode: 401,
      code: 'UNAUTHENTICATED',
      message: 'Phiên đăng nhập đã bị thu hồi, hãy kết nối lại',
    };
  }
}

function assertAdmissionUnchanged(state: SocketData, next: number | null): void {
  if (next === null || state.admissionEpoch === null) return;
  if (next !== state.admissionEpoch) {
    throw {
      statusCode: 403,
      code: 'FORBIDDEN',
      message: 'Quyền xem ván này đã được cấp lại, hãy đăng ký lại',
    };
  }
}

/**
 * Rotate every transport tuple of a match after a control takeover (fire-and-forget).
 * A failure leaves the tuple ROTATING, which blocks new grants and is picked up by the
 * media job retry path — so it is reported there, not by crashing the socket transport.
 */
function rotateMediaForMatch(matchId: string): void {
  void rotateMatchTransports(matchId, [...TRANSPORT_TUPLES]).catch(() => undefined);
}

/* ------------------------------------------------------- production wiring --- */

async function admissionEpochOf(userId: string, roomId: string): Promise<number | null> {
  const res = await getPool().query(
    'SELECT admission_epoch FROM public.room_members WHERE room_id = $1 AND user_id = $2',
    [roomId, userId],
  );
  const row = res.rows[0];
  return row ? Number(row.admission_epoch) : null;
}

function covers(
  lease: ControlLeaseRow | null,
  roomId: string | null,
  matchId: string | null,
): ControlLeaseRow | null {
  if (!lease) return null;
  if (roomId !== null && lease.roomId === roomId) return lease;
  if (matchId !== null && lease.matchId === matchId) return lease;
  return null;
}

function channelForRole(role: string | undefined): ChatChannel {
  return role === 'SPECTATOR' ? 'SPECTATORS' : 'PLAYERS';
}

export function createDefaultRealtimeDeps(): RealtimeGatewayDeps {
  const requireAuth = createRequireAuth();

  return {
    // Same code path as HTTP: token verification + the revoked-session check.
    authenticate: async (token: string): Promise<AuthenticatedUser | null> => {
      const request = {
        headers: { authorization: `Bearer ${token}` },
        id: `socket-${crypto.randomUUID()}`,
      } as unknown as Parameters<typeof requireAuth>[0];
      const reply = {
        status: () => reply,
        send: () => reply,
      } as unknown as Parameters<typeof requireAuth>[1];
      await requireAuth(request, reply);
      return request.user ?? null;
    },
    requireLease: (userId, controllerId, controlEpoch, ctx) =>
      requireControlLease(userId, controllerId, controlEpoch, ctx),
    roomAccess: async (userId, roomId) => {
      const room = await getRoom(roomId, userId);
      const member = room.members.find((entry) => entry.userId === userId);
      const channel = channelForRole(member?.role);
      const admissionEpoch =
        member?.role === 'SPECTATOR' ? await admissionEpochOf(userId, roomId) : null;
      const match = room.currentMatchId
        ? await getMatchSnapshot(room.currentMatchId, userId)
        : null;
      const lease = covers(await loadControlLease(userId), roomId, room.currentMatchId);
      return { room, match, matchId: room.currentMatchId, channel, admissionEpoch, controller: lease };
    },
    matchAccess: async (userId, matchId) => {
      const snapshot = await getMatchSnapshot(matchId, userId);
      let channel: ChatChannel | null = null;
      let admissionEpoch: number | null = null;
      if (snapshot.mode === 'ONLINE' && snapshot.roomId) {
        const roleRes = await getPool().query(
          'SELECT role FROM public.room_members WHERE room_id = $1 AND user_id = $2',
          [snapshot.roomId, userId],
        );
        const role = roleRes.rows[0]?.role as string | undefined;
        channel = channelForRole(role);
        if (role === 'SPECTATOR') admissionEpoch = await admissionEpochOf(userId, snapshot.roomId);
      }
      const lease = covers(await loadControlLease(userId), snapshot.roomId, matchId);
      return { matchId, roomId: snapshot.roomId, snapshot, channel, admissionEpoch, controller: lease };
    },
    loadLease: (userId) => loadControlLease(userId),
    heartbeat: (userId, tabId) => refreshControlLease(userId, tabId, Date.now(), getPool()),
    disconnect: (userId, tabId) => markControllerDisconnected(userId, tabId, Date.now(), getPool()),
    move: (userId, matchId, command) => submitMove(userId, matchId, command),
    chat: async (userId, roomId, clientMessageId, content) => {
      const { message } = await sendMessage(userId, roomId, clientMessageId, content);
      return message;
    },
  };
}
