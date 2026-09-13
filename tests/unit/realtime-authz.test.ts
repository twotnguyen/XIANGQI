/**
 * Socket authorization (spec 04 "Socket.IO"): handshake identity + Origin allowlist,
 * per-subscribe access revalidation, controller-lease gating of writes, chat channel
 * isolation and eviction after `access:revoked`.
 *
 * The gateway is driven with injected access deps on an ephemeral localhost port: no
 * database, no Supabase, real socket.io frames. Absence of a push is proven by FIFO frame
 * ordering (the emit is followed by a request/ack round trip on the same connection), never
 * by sleeping.
 */
import { createServer, type Server as HttpServer, type AddressInfo } from 'node:http';
import path from 'node:path';
import { createRequire } from 'node:module';
import { afterEach, describe, expect, it } from 'vitest';
import {
  createRealtimeGateway,
  isOriginAllowed,
  toFailure,
  type MatchSubscription,
  type RealtimeGateway,
  type RealtimeGatewayDeps,
  type RoomSubscription,
} from '../../apps/server/src/realtime/socket.js';
import {
  emitAccessRevoked,
  emitChatMessage,
  emitRoomUpdated,
} from '../../apps/server/src/realtime/events.js';
import type { ChatMessageDTO, ControllerLease, MatchSnapshot, RoomDTO } from '@xiangqi/contracts';

/* ------------------------------------------------------------------ client --- */

interface ClientSocket {
  connected: boolean;
  on(event: string, handler: (...args: unknown[]) => void): ClientSocket;
  emit(event: string, ...args: unknown[]): ClientSocket;
  disconnect(): void;
}

type IoFactory = (url: string, options?: Record<string, unknown>) => ClientSocket;

const webRequire = createRequire(path.resolve(process.cwd(), 'apps/web/package.json'));
const { io: createClient } = webRequire('socket.io-client') as { io: IoFactory };

/* ------------------------------------------------------------------ fixtures --- */

const ALLOWED_ORIGIN = 'http://localhost:5173';
const USER = '11111111-1111-4111-8111-111111111111';
const OTHER_USER = '22222222-2222-4222-8222-222222222222';

const TOKEN = 'access-token-valid';
const REVOKED_TOKEN = 'access-token-revoked';
const SPECTATOR_TOKEN = 'access-token-spectator';
const TAB_ID = '33333333-3333-4333-8333-333333333333';
const ROOM_ID = '44444444-4444-4444-8444-444444444444';
const MATCH_ID = '55555555-5555-4555-8555-555555555555';
const LEASE: ControllerLease = {
  controllerId: '66666666-6666-4666-8666-666666666666',
  controlEpoch: 3,
};

const room: RoomDTO = {
  id: ROOM_ID,
  name: 'authz',
  ownerId: USER,
  visibility: 'PUBLIC',
  status: 'PLAYING',
  roomVersion: 2,
  timeControl: 300,
  members: [
    { userId: USER, role: 'PLAYER', side: 'RED', online: true, ready: true },
    { userId: OTHER_USER, role: 'SPECTATOR', side: null, online: true, ready: false },
  ],
  currentMatchId: MATCH_ID,
};

function snapshot(): MatchSnapshot {
  return {
    id: MATCH_ID,
    roomId: ROOM_ID,
    mode: 'ONLINE',
    status: 'ACTIVE',
    position: { board: new Array(90).fill(null), turn: 'RED' },
    version: 1,
    ply: 0,
    ruleSetVersion: 'xiangqi-simple-v1',
    redUserId: USER,
    blackUserId: '77777777-7777-4777-8777-777777777777',
    aiSide: null,
    aiLevel: null,
    timeControl: 300,
    clock: { redMs: 1000, blackMs: 1000, runningSinceEpochMs: 0 },
    outcome: null,
    activeMoveIds: [],
    proposal: null,
    serverNowMs: 0,
    aiState: null,
    presence: [],
  };
}

interface Calls {
  requireLease: number;
  move: number;
  chat: number;
  heartbeat: number;
  roomAccess: Array<{ userId: string; roomId: string }>;
}

function makeDeps(calls: Calls, overrides: Partial<RealtimeGatewayDeps> = {}): RealtimeGatewayDeps {
  const userByToken: Record<string, string> = { [TOKEN]: USER, [SPECTATOR_TOKEN]: OTHER_USER };

  return {
    authenticate: async (token) => {
      const id = userByToken[token];
      return id ? { id, sessionId: 'session-1', sessionExpiresAtMs: Date.now() + 60_000 } : null;
    },
    requireLease: async (_userId, controllerId, controlEpoch, ctx) => {
      calls.requireLease += 1;
      if (controllerId !== LEASE.controllerId || Number(controlEpoch) !== LEASE.controlEpoch) {
        throw { statusCode: 403, code: 'CONTROL_REQUIRED', message: 'lease mismatch' };
      }
      if (ctx.matchId && ctx.matchId !== MATCH_ID) {
        throw { statusCode: 403, code: 'CONTROL_REQUIRED', message: 'lease does not cover match' };
      }
      if (ctx.roomId && ctx.roomId !== ROOM_ID) {
        throw { statusCode: 403, code: 'CONTROL_REQUIRED', message: 'lease does not cover room' };
      }
      return { controllerId, controlEpoch: Number(controlEpoch) };
    },
    roomAccess: async (userId, roomId): Promise<RoomSubscription> => {
      calls.roomAccess.push({ userId, roomId });
      // The only thing that grants access is the injected membership answer, never the
      // payload: an unknown room id or a non-member user is denied here.
      if (roomId !== ROOM_ID || (userId !== USER && userId !== OTHER_USER)) {
        throw { statusCode: 403, code: 'FORBIDDEN', message: 'not a member' };
      }
      const isPlayer = userId === USER;
      return {
        room,
        match: snapshot(),
        matchId: MATCH_ID,
        channel: isPlayer ? 'PLAYERS' : 'SPECTATORS',
        admissionEpoch: 0,
        controller: isPlayer ? LEASE : null,
      };
    },
    matchAccess: async (userId, matchId): Promise<MatchSubscription> => {
      if (matchId !== MATCH_ID || userId !== USER) {
        throw { statusCode: 403, code: 'FORBIDDEN', message: 'not a member' };
      }
      return {
        matchId,
        roomId: ROOM_ID,
        snapshot: snapshot(),
        channel: 'PLAYERS',
        admissionEpoch: 0,
        controller: LEASE,
      };
    },
    loadLease: async () => null,
    heartbeat: async () => {
      calls.heartbeat += 1;
      return {
        userId: USER,
        roomId: ROOM_ID,
        matchId: MATCH_ID,
        controllerId: LEASE.controllerId,
        controllerTabId: TAB_ID,
        controlEpoch: LEASE.controlEpoch,
        leaseUntilMs: Date.now() + 30_000,
        disconnectedAtMs: null,
      };
    },
    disconnect: async () => null,
    move: async (_userId, _matchId, command) => {
      calls.move += 1;
      return {
        appliedVersion: command.expectedVersion + 1,
        snapshot: { ...snapshot(), version: command.expectedVersion + 1 },
      };
    },
    chat: async (_userId, _roomId, clientMessageId, content) => {
      calls.chat += 1;
      return {
        id: '88888888-8888-4888-8888-888888888888',
        matchId: MATCH_ID,
        channel: 'PLAYERS',
        senderId: USER,
        senderUsername: 'tester',
        senderDisplayName: null,
        clientMessageId,
        content,
        createdAt: new Date(0).toISOString(),
      };
    },
    ...overrides,
  };
}

/* -------------------------------------------------------------------- helpers --- */

interface RunningGateway {
  gateway: RealtimeGateway;
  port: number;
  close(): Promise<void>;
}

/** A gateway always owns its own HTTP server (socket.io hooks the server's listeners). */
async function startGateway(deps: RealtimeGatewayDeps): Promise<RunningGateway> {
  const httpServer: HttpServer = createServer();
  const gateway = createRealtimeGateway({
    httpServer,
    allowedOrigins: [ALLOWED_ORIGIN],
    deps,
  });
  const listening = Promise.withResolvers<void>();
  httpServer.listen(0, '127.0.0.1', () => listening.resolve());
  await listening.promise;
  const port = (httpServer.address() as AddressInfo).port;
  return {
    gateway,
    port,
    async close() {
      await gateway.close();
      const closed = Promise.withResolvers<void>();
      httpServer.close(() => closed.resolve());
      await closed.promise;
    },
  };
}

const openSockets: ClientSocket[] = [];
const openGateways: RunningGateway[] = [];

afterEach(async () => {
  for (const socket of openSockets.splice(0)) socket.disconnect();
  for (const gateway of openGateways.splice(0)) await gateway.close();
});

function connect(port: number, token: string, origin = ALLOWED_ORIGIN): ClientSocket {
  const socket = createClient(`http://127.0.0.1:${port}`, {
    transports: ['websocket'],
    forceNew: true,
    reconnection: false,
    auth: { accessToken: token, tabId: TAB_ID },
    extraHeaders: { Origin: origin },
  });
  openSockets.push(socket);
  return socket;
}

function connected(socket: ClientSocket): Promise<boolean> {
  const { promise, resolve } = Promise.withResolvers<boolean>();
  socket.on('connect', () => resolve(true));
  socket.on('connect_error', () => resolve(false));
  return promise;
}

interface AckResult {
  ok: boolean;
  data?: unknown;
  error?: { code: string; message: string };
}

function request(socket: ClientSocket, event: string, payload: unknown): Promise<AckResult> {
  const { promise, resolve } = Promise.withResolvers<AckResult>();
  socket.emit(event, payload, (result: AckResult) => resolve(result));
  return promise;
}

/** Records every push of one event, in arrival order (no timers). */
function record(socket: ClientSocket, event: string): unknown[] {
  const seen: unknown[] = [];
  socket.on(event, (...args: unknown[]) => seen.push(args[0]));
  return seen;
}

/** Round trip on the same connection: any frame emitted before it is already delivered. */
async function flush(socket: ClientSocket): Promise<void> {
  await request(socket, 'presence:heartbeat', { tabId: TAB_ID });
}

function chatPayload(channel: 'PLAYERS' | 'SPECTATORS', content: string): {
  roomId: string;
  matchId: string;
  channel: 'PLAYERS' | 'SPECTATORS';
  message: ChatMessageDTO;
} {
  return {
    roomId: ROOM_ID,
    matchId: MATCH_ID,
    channel,
    message: {
      id: '99999999-9999-4999-8999-999999999999',
      matchId: MATCH_ID,
      channel,
      senderId: USER,
      senderUsername: 'tester',
      senderDisplayName: null,
      clientMessageId: '99999999-9999-4999-8999-999999999998',
      content,
      createdAt: new Date(0).toISOString(),
    },
  };
}

async function running(calls: Calls = emptyCalls()): Promise<RunningGateway> {
  const gateway = await startGateway(makeDeps(calls));
  openGateways.push(gateway);
  return gateway;
}

function emptyCalls(): Calls {
  return { requireLease: 0, move: 0, chat: 0, heartbeat: 0, roomAccess: [] };
}

/* ---------------------------------------------------------------------- suite --- */

describe('realtime-authz: handshake', () => {
  it('rejects a token the auth path does not accept', async () => {
    const { port } = await running();
    expect(await connected(connect(port, REVOKED_TOKEN))).toBe(false);
  });

  it('rejects an Origin outside the allowlist and accepts an allowlisted one', async () => {
    expect(isOriginAllowed('http://evil.example', [ALLOWED_ORIGIN])).toBe(false);
    expect(isOriginAllowed(ALLOWED_ORIGIN, [ALLOWED_ORIGIN])).toBe(true);

    const { port } = await running();
    expect(await connected(connect(port, TOKEN, 'http://evil.example'))).toBe(false);
    expect(await connected(connect(port, TOKEN))).toBe(true);
  });
});

describe('realtime-authz: subscribe', () => {
  it('rejects a non-member and never treats the payload room name as permission', async () => {
    const calls = emptyCalls();
    const { port } = await running(calls);
    const socket = connect(port, TOKEN);
    await connected(socket);

    const denied = await request(socket, 'room:subscribe', {
      roomId: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    });
    expect(denied.ok).toBe(false);
    expect(denied.error?.code).toBe('FORBIDDEN');

    // A forged membership claim rides in unknown fields; the strict schema discards it and
    // the membership answer is what denies or grants the room.
    const smuggled = await request(socket, 'room:subscribe', {
      roomId: ROOM_ID,
      userId: USER,
      role: 'PLAYER',
      member: true,
    });
    expect(smuggled.ok).toBe(false);
    expect(smuggled.error?.code).toBe('VALIDATION_ERROR');

    const accepted = await request(socket, 'room:subscribe', { roomId: ROOM_ID });
    expect(accepted.ok).toBe(true);
    expect(calls.roomAccess.at(-1)).toEqual({ userId: USER, roomId: ROOM_ID });

    const sub = await request(socket, 'match:subscribe', { matchId: MATCH_ID });
    expect(sub.ok).toBe(true);
    expect(sub.data).toMatchObject({
      controller: { controllerId: LEASE.controllerId, controlEpoch: LEASE.controlEpoch },
      snapshot: { id: MATCH_ID },
    });
  });

  it('rejects a revoked session on resubscribe', async () => {
    let issued = true;
    const deps = makeDeps(emptyCalls(), {
      authenticate: async (token) =>
        token === TOKEN && issued
          ? { id: USER, sessionId: 'session-1', sessionExpiresAtMs: Date.now() + 60_000 }
          : null,
    });
    const gateway = await startGateway(deps);
    openGateways.push(gateway);
    const socket = connect(gateway.port, TOKEN);
    await connected(socket);
    expect((await request(socket, 'room:subscribe', { roomId: ROOM_ID })).ok).toBe(true);

    issued = false; // the session is revoked server-side
    const resubscribe = await request(socket, 'match:subscribe', { matchId: MATCH_ID });
    expect(resubscribe.ok).toBe(false);
    expect(resubscribe.error?.code).toBe('UNAUTHENTICATED');
  });
});

describe('realtime-authz: writes', () => {
  it('requires the controller lease for move and chat, and rejects a wrong epoch', async () => {
    const calls = emptyCalls();
    const { port } = await running(calls);
    const socket = connect(port, TOKEN);
    await connected(socket);
    await request(socket, 'match:subscribe', { matchId: MATCH_ID });

    const staleMove = await request(socket, 'match:move', {
      matchId: MATCH_ID,
      controllerId: LEASE.controllerId,
      controlEpoch: LEASE.controlEpoch + 5,
      commandId: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb',
      expectedVersion: 1,
      payload: { from: { x: 0, y: 3 }, to: { x: 0, y: 4 } },
    });
    expect(staleMove.ok).toBe(false);
    expect(staleMove.error?.code).toBe('CONTROL_REQUIRED');
    expect(calls.move).toBe(0);

    const move = await request(socket, 'match:move', {
      matchId: MATCH_ID,
      controllerId: LEASE.controllerId,
      controlEpoch: LEASE.controlEpoch,
      commandId: 'cccccccc-cccc-4ccc-8ccc-cccccccccccc',
      expectedVersion: 1,
      payload: { from: { x: 0, y: 3 }, to: { x: 0, y: 4 } },
    });
    expect(move.ok).toBe(true);
    expect(move.data).toMatchObject({ appliedVersion: 2 });
    expect(calls.move).toBe(1);

    const chat = await request(socket, 'chat:send', {
      roomId: ROOM_ID,
      controllerId: LEASE.controllerId,
      controlEpoch: LEASE.controlEpoch,
      clientMessageId: 'dddddddd-dddd-4ddd-8ddd-dddddddddddd',
      content: 'xin chào',
    });
    expect(chat.ok).toBe(true);
    expect(calls.chat).toBe(1);
  });

  it('renews the lease only for the tab that holds it', async () => {
    const calls = emptyCalls();
    const { port } = await running(calls);
    const socket = connect(port, TOKEN);
    await connected(socket);

    const foreign = await request(socket, 'presence:heartbeat', {
      tabId: 'eeeeeeee-eeee-4eee-8eee-eeeeeeeeeeee',
    });
    expect(foreign.ok).toBe(false);
    expect(foreign.error?.code).toBe('CONTROL_REQUIRED');

    const mine = await request(socket, 'presence:heartbeat', { tabId: TAB_ID });
    expect(mine.ok, JSON.stringify(mine)).toBe(true);
    expect(mine.data).toMatchObject({
      controllerId: LEASE.controllerId,
      controlEpoch: LEASE.controlEpoch,
    });
    expect(calls.heartbeat).toBeGreaterThan(0);
  });
});

describe('realtime-authz: chat channel isolation', () => {
  it('delivers PLAYERS chat to players only, never to the room topic', async () => {
    const calls = emptyCalls();
    const { port } = await running(calls);

    const player = connect(port, TOKEN);
    const spectator = connect(port, SPECTATOR_TOKEN);
    await Promise.all([connected(player), connected(spectator)]);

    expect((await request(player, 'room:subscribe', { roomId: ROOM_ID })).ok).toBe(true);
    expect((await request(spectator, 'room:subscribe', { roomId: ROOM_ID })).ok).toBe(true);

    const playerChat = record(player, 'chat:message');
    const spectatorChat = record(spectator, 'chat:message');
    emitChatMessage(chatPayload('PLAYERS', 'bí mật của người chơi'));

    // The player's own receipt is the deterministic signal; frames are delivered in order
    // on one connection, so the spectator's empty recorder is proven by that same signal.
    await flush(player);
    expect(playerChat, JSON.stringify(playerChat)).toMatchObject([{ channel: 'PLAYERS' }]);
    await flush(spectator);
    expect(spectatorChat, JSON.stringify(spectatorChat)).toEqual([]);

    emitChatMessage(chatPayload('SPECTATORS', 'khán giả nói chuyện'));
    await flush(player);
    expect(spectatorChat).toMatchObject([{ channel: 'SPECTATORS' }]);
    expect(playerChat).toHaveLength(1);
  });

  it('stops delivering room events to a revoked member', async () => {
    const calls = emptyCalls();
    const { port } = await running(calls);
    const socket = connect(port, TOKEN);
    await connected(socket);
    expect((await request(socket, 'room:subscribe', { roomId: ROOM_ID })).ok).toBe(true);

    const roomUpdates = record(socket, 'room:updated');
    const revocations = record(socket, 'access:revoked');
    emitRoomUpdated({ roomId: ROOM_ID, room });
    await flush(socket);
    expect(roomUpdates).toEqual([{ roomId: ROOM_ID, room }]);

    emitAccessRevoked({ roomId: ROOM_ID, reason: 'ROOM_LOCKED', roomVersion: 3, userIds: [USER] });
    await flush(socket);
    expect(revocations).toHaveLength(1);

    emitRoomUpdated({ roomId: ROOM_ID, room });
    // Round trip after the emit: if the evicted socket had been sent the update it would
    // arrive before this ack (one ordered connection), so the ack proves the absence.
    expect((await request(socket, 'presence:heartbeat', { tabId: TAB_ID })).ok).toBe(true);
    expect(roomUpdates).toHaveLength(1);
    expect(calls.roomAccess).toHaveLength(1);
  });
});

describe('realtime-authz: error envelope', () => {
  it('maps service errors onto spec error codes', () => {
    expect(toFailure({ statusCode: 409, code: 'VERSION_CONFLICT' }, 'r1')).toEqual({
      ok: false,
      error: { code: 'VERSION_CONFLICT', message: 'Yêu cầu không thực hiện được' },
      requestId: 'r1',
    });
    expect(toFailure({ statusCode: 403 }, 'r2')).toMatchObject({
      error: { code: 'FORBIDDEN' },
    });
  });
});
