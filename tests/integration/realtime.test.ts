/**
 * Realtime acceptance against the LOCAL stack (spec 04 "Socket.IO").
 *
 * Real socket.io clients against the real BFF on an ephemeral port: a move lands exactly
 * once through the same service as HTTP, duplicate commandIds return the original
 * appliedVersion, `match:sync` recovers a missed push, PLAYERS chat never reaches a
 * spectator, locking the room revokes access, and a takeover revokes the old controller.
 */
import crypto from 'node:crypto';
import path from 'node:path';
import { createRequire } from 'node:module';
import type { AddressInfo } from 'node:net';
import { describe, expect, it } from 'vitest';
import type { ChatMessageDTO, CommandResult, MatchSnapshot, RoomDTO } from '@xiangqi/contracts';
import {
  INTEGRATION_LANE_ENV,
  withTestContext,
  type TestContext,
  type TestUser,
  type TestUserKey,
} from '../fixtures/integration.js';

const inIntegrationLane = process.env[INTEGRATION_LANE_ENV] === '1';

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

interface AckResult {
  ok: boolean;
  data?: unknown;
  error?: { code: string; message: string };
}

interface Harness {
  ctx: TestContext;
  port: number;
  sockets: ClientSocket[];
  matchId: string;
  roomId: string;
  tabIds: Record<string, string>;
  leases: Record<string, { controllerId: string; controlEpoch: number }>;
}

const sockets: ClientSocket[] = [];

function connect(port: number, user: TestUser, tabId: string): ClientSocket {
  const socket = createClient(`http://127.0.0.1:${port}`, {
    transports: ['websocket'],
    forceNew: true,
    reconnection: false,
    auth: { accessToken: user.accessToken, tabId },
    extraHeaders: { Origin: process.env['APP_ORIGIN'] ?? 'http://127.0.0.1:5173' },
  });
  sockets.push(socket);
  return socket;
}

function connected(socket: ClientSocket): Promise<boolean> {
  const { promise, resolve } = Promise.withResolvers<boolean>();
  socket.on('connect', () => resolve(true));
  socket.on('connect_error', () => resolve(false));
  return promise;
}

function request(socket: ClientSocket, event: string, payload: unknown): Promise<AckResult> {
  const { promise, resolve } = Promise.withResolvers<AckResult>();
  socket.emit(event, payload, (result: AckResult) => resolve(result));
  return promise;
}

function record(socket: ClientSocket, event: string): unknown[] {
  const seen: unknown[] = [];
  socket.on(event, (...args: unknown[]) => seen.push(args[0]));
  return seen;
}

function nextOnce(socket: ClientSocket, event: string): Promise<unknown> {
  const { promise, resolve } = Promise.withResolvers<unknown>();
  socket.on(event, (...args: unknown[]) => resolve(args[0]));
  return promise;
}

function unwrap<T>(res: { json(): unknown }): T {
  return (res.json() as { data: T }).data;
}

/* ----------------------------------------------------------------- harness --- */

async function setupMatch(
  ctx: TestContext,
  keys: { red: TestUserKey; black: TestUserKey; spectator?: TestUserKey },
): Promise<Harness> {
  const tabIds: Record<string, string> = {};
  const leases: Harness['leases'] = {};
  const tabIdFor = (key: TestUserKey): string => {
    tabIds[key] = tabIds[key] ?? crypto.randomUUID();
    return tabIds[key]!;
  };

  const roomRes = await ctx.app.inject({
    method: 'POST',
    url: '/api/v1/rooms',
    headers: ctx.authAs(keys.red),
    payload: { name: `realtime-${ctx.runId.slice(0, 10)}`, visibility: 'PUBLIC', timeControl: 0 },
  });
  expect(roomRes.statusCode, roomRes.body).toBe(200);
  const roomId = unwrap<RoomDTO>(roomRes).id;

  const joinRes = await ctx.app.inject({
    method: 'POST',
    url: '/api/v1/rooms/join',
    headers: ctx.authAs(keys.black),
    payload: { roomId, role: 'PLAYER' },
  });
  expect(joinRes.statusCode, joinRes.body).toBe(200);

  for (const key of [keys.red, keys.black]) {
    const ready = await ctx.app.inject({
      method: 'POST',
      url: `/api/v1/rooms/${roomId}/ready`,
      headers: ctx.authAs(key),
      payload: { ready: true },
    });
    expect(ready.statusCode, ready.body).toBe(200);
  }
  const started = await ctx.app.inject({
    method: 'GET',
    url: `/api/v1/rooms/${roomId}`,
    headers: ctx.authAs(keys.red),
  });
  const matchId = unwrap<RoomDTO>(started).currentMatchId;
  expect(matchId).toBeTruthy();

  if (keys.spectator) {
    const watch = await ctx.app.inject({
      method: 'POST',
      url: '/api/v1/rooms/join',
      headers: ctx.authAs(keys.spectator),
      payload: { roomId, role: 'SPECTATOR' },
    });
    expect(watch.statusCode, watch.body).toBe(200);
  }

  for (const key of [keys.red, keys.black, keys.spectator].filter(Boolean) as TestUserKey[]) {
    const takeover = await ctx.app.inject({
      method: 'POST',
      url: '/api/v1/control/takeover',
      headers: { ...ctx.authAs(key), 'content-type': 'application/json' },
      payload: { tabId: tabIdFor(key) },
    });
    expect(takeover.statusCode, takeover.body).toBe(200);
    leases[key] = unwrap<{ controllerId: string; controlEpoch: number }>(takeover);
  }

  await ctx.app.listen({ port: 0, host: '127.0.0.1' });
  const port = (ctx.app.server.address() as AddressInfo).port;

  return { ctx, port, sockets: [], matchId: matchId!, roomId, tabIds, leases };
}

/* -------------------------------------------------------------------- tests --- */

describe.runIf(inIntegrationLane)('T015: realtime socket acceptance', () => {
  it('moves once, resyncs after a missed push, isolates chat and revokes access', async () => {
    await withTestContext(async (ctx) => {
      const h = await setupMatch(ctx, { red: 'A', black: 'B', spectator: 'S1' });
      try {
        const playerA = connect(h.port, ctx.users['A'], h.tabIds['A']!);
        const playerB = connect(h.port, ctx.users['B'], h.tabIds['B']!);
        const spectator = connect(h.port, ctx.users['S1'], h.tabIds['S1']!);
        expect(await Promise.all([connected(playerA), connected(playerB), connected(spectator)])).toEqual([
          true,
          true,
          true,
        ]);

        const subA = await request(playerA, 'match:subscribe', { matchId: h.matchId });
        expect(subA.ok, JSON.stringify(subA)).toBe(true);
        expect(subA.data).toMatchObject({
          controller: { controllerId: h.leases['A']!.controllerId, controlEpoch: 1 },
          snapshot: { id: h.matchId, status: 'ACTIVE', version: 0 },
        });

        const subB = await request(playerB, 'match:subscribe', { matchId: h.matchId });
        expect(subB.ok, JSON.stringify(subB)).toBe(true);
        const subS = await request(spectator, 'room:subscribe', { roomId: h.roomId });
        expect(subS.ok, JSON.stringify(subS)).toBe(true);

        // A non-member socket is rejected for the same match.
        const outsider = connect(h.port, ctx.users['S2'], crypto.randomUUID());
        expect(await connected(outsider)).toBe(true);
        const denied = await request(outsider, 'match:subscribe', { matchId: h.matchId });
        expect(denied.ok).toBe(false);
        expect(denied.error?.code).toBe('FORBIDDEN');
        const deniedHttp = await ctx.app.inject({
          method: 'GET',
          url: `/api/v1/matches/${h.matchId}`,
          headers: ctx.authAs('S2'),
        });
        expect(deniedHttp.statusCode).toBe(403);

        // A move through the socket lands exactly once and is pushed to B.
        const moveCommandId = crypto.randomUUID();
        const pushB = nextOnce(playerB, 'match:state');
        const move = await request(playerA, 'match:move', {
          matchId: h.matchId,
          controllerId: h.leases['A']!.controllerId,
          controlEpoch: h.leases['A']!.controlEpoch,
          commandId: moveCommandId,
          expectedVersion: 0,
          payload: { from: { x: 0, y: 3 }, to: { x: 0, y: 4 } },
        });
        expect(move.ok, JSON.stringify(move)).toBe(true);
        const applied = move.data as CommandResult;
        expect(applied.appliedVersion).toBe(1);
        expect(applied.snapshot.version).toBe(1);
        expect(await pushB).toMatchObject({ matchId: h.matchId, snapshot: { version: 1 } });

        const dbAfterMove = await ctx.pool.query<{ version: number; ply: number }>(
          'SELECT version, ply FROM public.matches WHERE id = $1',
          [h.matchId],
        );
        expect(dbAfterMove.rows[0]).toMatchObject({ version: 1, ply: 1 });
        const receipts = await ctx.pool.query<{ n: number }>(
          'SELECT count(*)::int AS n FROM public.command_receipts WHERE match_id = $1',
          [h.matchId],
        );
        expect(receipts.rows[0]!.n).toBe(1);

        // Retrying the same commandId returns the ORIGINAL appliedVersion and does not apply.
        const duplicate = await request(playerA, 'match:move', {
          matchId: h.matchId,
          controllerId: h.leases['A']!.controllerId,
          controlEpoch: h.leases['A']!.controlEpoch,
          commandId: moveCommandId,
          expectedVersion: 0,
          payload: { from: { x: 0, y: 3 }, to: { x: 0, y: 4 } },
        });
        expect(duplicate.ok, JSON.stringify(duplicate)).toBe(true);
        expect((duplicate.data as CommandResult).appliedVersion).toBe(1);
        const receiptsAfterDuplicate = await ctx.pool.query<{ n: number }>(
          'SELECT count(*)::int AS n FROM public.command_receipts WHERE match_id = $1',
          [h.matchId],
        );
        expect(receiptsAfterDuplicate.rows[0]!.n).toBe(1);

        // B moves; A's push is "missed" (not awaited) and recovered by match:sync.
        const bMove = await request(playerB, 'match:move', {
          matchId: h.matchId,
          controllerId: h.leases['B']!.controllerId,
          controlEpoch: h.leases['B']!.controlEpoch,
          commandId: crypto.randomUUID(),
          expectedVersion: 1,
          payload: { from: { x: 0, y: 6 }, to: { x: 0, y: 5 } },
        });
        expect(bMove.ok, JSON.stringify(bMove)).toBe(true);
        const synced = await request(playerA, 'match:sync', { matchId: h.matchId, lastVersion: 1 });
        expect(synced.ok, JSON.stringify(synced)).toBe(true);
        expect((synced.data as MatchSnapshot).version).toBe(2);

        // PLAYERS chat: the player receives it, the spectator never does.
        const aChats = record(playerA, 'chat:message');
        const sChats = record(spectator, 'chat:message');
        const aReceipt = nextOnce(playerA, 'chat:message');
        const chat = await request(playerB, 'chat:send', {
          roomId: h.roomId,
          controllerId: h.leases['B']!.controllerId,
          controlEpoch: h.leases['B']!.controlEpoch,
          clientMessageId: crypto.randomUUID(),
          content: 'nước đi tốt',
        });
        expect(chat.ok, JSON.stringify(chat)).toBe(true);
        const aFrame = (await aReceipt) as { channel: string; message: ChatMessageDTO };
        expect(aFrame.channel).toBe('PLAYERS');
        expect(aChats).toHaveLength(1);
        expect(sChats).toEqual([]);

        // Locking the room revokes the spectator and stops room/match pushes to it.
        const revokePromise = nextOnce(spectator, 'access:revoked');
        const locked = await ctx.app.inject({
          method: 'PATCH',
          url: `/api/v1/rooms/${h.roomId}`,
          headers: ctx.authAs('A'),
          payload: { visibility: 'LOCKED' },
        });
        expect(locked.statusCode, locked.body).toBe(200);
        const revoked = (await revokePromise) as { reason: string; userIds: string[] };
        expect(revoked.reason).toBe('ROOM_LOCKED');
        expect(revoked.userIds).toContain(ctx.users['S1'].id);

        const sChatsAfter = record(spectator, 'chat:message');
        const aReceiptAfter = nextOnce(playerA, 'chat:message');
        const chatAfter = await request(playerB, 'chat:send', {
          roomId: h.roomId,
          controllerId: h.leases['B']!.controllerId,
          controlEpoch: h.leases['B']!.controlEpoch,
          clientMessageId: crypto.randomUUID(),
          content: 'sau khi khóa phòng',
        });
        expect(chatAfter.ok, JSON.stringify(chatAfter)).toBe(true);
        await aReceiptAfter;
        expect(sChatsAfter).toEqual([]);
        // The revoked spectator also loses HTTP read access to the match.
        const revokedRead = await ctx.app.inject({
          method: 'GET',
          url: `/api/v1/matches/${h.matchId}`,
          headers: ctx.authAs('S1'),
        });
        expect(revokedRead.statusCode).toBe(403);

        // Takeover: the old controller is told, and its writes are refused.
        const controlRevoked = nextOnce(playerA, 'control:revoked');
        const newTabId = crypto.randomUUID();
        h.tabIds['A'] = newTabId;
        const oldLease = h.leases['A']!;
        const takeover = await ctx.app.inject({
          method: 'POST',
          url: '/api/v1/control/takeover',
          headers: { ...ctx.authAs('A'), 'content-type': 'application/json' },
          payload: { tabId: newTabId },
        });
        expect(takeover.statusCode, takeover.body).toBe(200);
        const newLease = unwrap<{ controllerId: string; controlEpoch: number }>(takeover);
        h.leases['A'] = newLease;
        expect(newLease.controlEpoch).toBe(oldLease.controlEpoch + 1);
        const revokedNotice = (await controlRevoked) as { controlEpoch: number };
        expect(revokedNotice.controlEpoch).toBe(newLease.controlEpoch);

        const staleWrite = await request(playerA, 'match:move', {
          matchId: h.matchId,
          controllerId: oldLease.controllerId,
          controlEpoch: oldLease.controlEpoch,
          commandId: crypto.randomUUID(),
          expectedVersion: 2,
          payload: { from: { x: 2, y: 0 }, to: { x: 2, y: 2 } },
        });
        expect(staleWrite.ok).toBe(false);
        expect(staleWrite.error?.code).toBe('CONTROL_REQUIRED');
      } finally {
        for (const socket of sockets.splice(0)) socket.disconnect();
      }
    });
  }, 60_000);

  it('pushes room:updated to the room topic when a member changes ready', async () => {
    await withTestContext(async (ctx) => {
      try {
        const roomRes = await ctx.app.inject({
          method: 'POST',
          url: '/api/v1/rooms',
          headers: ctx.authAs('A'),
          payload: { name: `room-push-${ctx.runId.slice(0, 10)}`, visibility: 'PUBLIC', timeControl: 0 },
        });
        expect(roomRes.statusCode, roomRes.body).toBe(200);
        const roomId = unwrap<RoomDTO>(roomRes).id;
        const join = await ctx.app.inject({
          method: 'POST',
          url: '/api/v1/rooms/join',
          headers: ctx.authAs('B'),
          payload: { roomId, role: 'PLAYER' },
        });
        expect(join.statusCode, join.body).toBe(200);

        await ctx.app.listen({ port: 0, host: '127.0.0.1' });
        const port = (ctx.app.server.address() as AddressInfo).port;
        const tabId = crypto.randomUUID();
        const playerA = connect(port, ctx.users['A'], tabId);
        expect(await connected(playerA)).toBe(true);
        expect((await request(playerA, 'room:subscribe', { roomId })).ok).toBe(true);

        const pushed = nextOnce(playerA, 'room:updated');
        const ready = await ctx.app.inject({
          method: 'POST',
          url: `/api/v1/rooms/${roomId}/ready`,
          headers: ctx.authAs('B'),
          payload: { ready: true },
        });
        expect(ready.statusCode, ready.body).toBe(200);

        const frame = (await pushed) as { roomId: string; room: RoomDTO };
        expect(frame.roomId).toBe(roomId);
        expect(frame.room.members).toHaveLength(2);
        expect(frame.room.members.find((m) => m.userId === ctx.users['B'].id)?.ready).toBe(true);
      } finally {
        for (const socket of sockets.splice(0)) socket.disconnect();
      }
    });
  }, 60_000);

  it('rejects a revoked session at handshake and on resubscribe', async () => {
    await withTestContext(async (ctx) => {
      const h = await setupMatch(ctx, { red: 'A', black: 'B' });
      try {
        const socket = connect(h.port, ctx.users['A'], h.tabIds['A']!);
        expect(await connected(socket)).toBe(true);
        expect((await request(socket, 'match:subscribe', { matchId: h.matchId })).ok).toBe(true);

        const logout = await ctx.app.inject({
          method: 'POST',
          url: '/api/v1/auth/logout',
          headers: ctx.authAs('A'),
          payload: { scope: 'CURRENT' },
        });
        expect(logout.statusCode, logout.body).toBe(200);

        const fresh = connect(h.port, ctx.users['A'], crypto.randomUUID());
        expect(await connected(fresh)).toBe(false);

        const resubscribe = await request(socket, 'match:subscribe', { matchId: h.matchId });
        expect(resubscribe.ok).toBe(false);
        expect(resubscribe.error?.code).toBe('UNAUTHENTICATED');
      } finally {
        for (const socket of sockets.splice(0)) socket.disconnect();
      }
    });
  }, 60_000);
});
