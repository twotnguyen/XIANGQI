/**
 * Deadline and race acceptance against the LOCAL stack (spec 03 §"Trạng thái, transaction và
 * deadline"): the scheduler alone finalizes clock timeout, the 60s grace and both-offline;
 * competing commands leave exactly one terminal outcome; a restart never resurrects a match;
 * and a rematch clears `finished_at` so the 10-minute room close cannot run.
 */
import crypto from 'node:crypto';
import { describe, expect, it } from 'vitest';
import type { CommandResult, MatchSnapshot, Outcome, RoomDTO } from '@xiangqi/contracts';
import {
  INTEGRATION_LANE_ENV,
  withTestContext,
  type TestContext,
  type TestUserKey,
} from '../fixtures/integration.js';
import {
  closeExpiredRooms,
  createDeadlineScheduler,
  recoverActiveMatchesOnBoot,
  ROOM_CLOSE_AFTER_MS,
} from '../../apps/server/src/modules/matches/deadlines.js';
import { refreshControlLease } from '../../apps/server/src/realtime/presence.js';

const inIntegrationLane = process.env[INTEGRATION_LANE_ENV] === '1';

function unwrap<T>(res: { json(): unknown }): T {
  return (res.json() as { data: T }).data;
}

interface MatchFixture {
  roomId: string;
  matchId: string;
  tabIds: { red: string; black: string };
  leases: {
    red: { controllerId: string; controlEpoch: number };
    black: { controllerId: string; controlEpoch: number };
  };
}

async function createMatch(
  ctx: TestContext,
  options: { timeControl?: 0 | 300 | 600 | 900; red?: TestUserKey; black?: TestUserKey } = {},
): Promise<MatchFixture> {
  const red = options.red ?? 'A';
  const black = options.black ?? 'B';

  const roomRes = await ctx.app.inject({
    method: 'POST',
    url: '/api/v1/rooms',
    headers: ctx.authAs(red),
    payload: {
      name: `race-${ctx.runId.slice(0, 10)}`,
      visibility: 'PUBLIC',
      timeControl: options.timeControl ?? 0,
    },
  });
  expect(roomRes.statusCode, roomRes.body).toBe(200);
  const roomId = unwrap<RoomDTO>(roomRes).id;

  const join = await ctx.app.inject({
    method: 'POST',
    url: '/api/v1/rooms/join',
    headers: ctx.authAs(black),
    payload: { roomId, role: 'PLAYER' },
  });
  expect(join.statusCode, join.body).toBe(200);

  for (const key of [red, black]) {
    const ready = await ctx.app.inject({
      method: 'POST',
      url: `/api/v1/rooms/${roomId}/ready`,
      headers: ctx.authAs(key),
      payload: { ready: true },
    });
    expect(ready.statusCode, ready.body).toBe(200);
  }

  const room = await ctx.app.inject({
    method: 'GET',
    url: `/api/v1/rooms/${roomId}`,
    headers: ctx.authAs(red),
  });
  const matchId = unwrap<RoomDTO>(room).currentMatchId;
  expect(matchId).toBeTruthy();

  const tabIds = { red: crypto.randomUUID(), black: crypto.randomUUID() };
  const leaseFor = async (key: TestUserKey, tabId: string) => {
    const res = await ctx.app.inject({
      method: 'POST',
      url: '/api/v1/control/takeover',
      headers: { ...ctx.authAs(key), 'content-type': 'application/json' },
      payload: { tabId },
    });
    expect(res.statusCode, res.body).toBe(200);
    return unwrap<{ controllerId: string; controlEpoch: number }>(res);
  };

  return {
    roomId,
    matchId: matchId!,
    tabIds,
    leases: { red: await leaseFor(red, tabIds.red), black: await leaseFor(black, tabIds.black) },
  };
}

async function matchRow(ctx: TestContext, matchId: string) {
  const res = await ctx.pool.query<{
    status: string;
    version: string;
    ply: number;
    outcome: Outcome | null;
    room_id: string;
  }>('SELECT status, version, ply, outcome, room_id FROM public.matches WHERE id = $1', [matchId]);
  return res.rows[0]!;
}

async function terminalEvents(ctx: TestContext, matchId: string) {
  const res = await ctx.pool.query<{ n: number }>(
    `SELECT count(*)::int AS n FROM public.match_events WHERE match_id = $1 AND type = 'RESULT'`,
    [matchId],
  );
  return res.rows[0]!.n;
}

/** Expire the clock of the side to move without waiting for real time. */
async function expireClock(ctx: TestContext, matchId: string, elapsedMs = 400_000): Promise<void> {
  await ctx.pool.query(
    `UPDATE public.matches
        SET clock = jsonb_set(
              clock,
              '{runningSinceEpochMs}',
              to_jsonb((EXTRACT(EPOCH FROM now()) * 1000)::bigint - $2::bigint))
      WHERE id = $1`,
    [matchId, elapsedMs],
  );
}

async function setLeaseOffline(ctx: TestContext, userId: string, secondsAgo: number): Promise<void> {
  await ctx.pool.query(
    `UPDATE public.client_controls
        SET lease_until = now() - ($2::int * interval '1 second'),
            disconnected_at = now() - ($2::int * interval '1 second')
      WHERE user_id = $1`,
    [userId, secondsAgo],
  );
}

async function snapshot(ctx: TestContext, matchId: string, key: TestUserKey): Promise<MatchSnapshot> {
  const res = await ctx.app.inject({
    method: 'GET',
    url: `/api/v1/matches/${matchId}`,
    headers: ctx.authAs(key),
  });
  expect(res.statusCode, res.body).toBe(200);
  return unwrap<MatchSnapshot>(res);
}

describe.runIf(inIntegrationLane)('T013: deadline scheduler and races', () => {
  it('finalizes a clock timeout once, and a competing move is refused afterwards', async () => {
    await withTestContext(async (ctx) => {
      const fixture = await createMatch(ctx, { timeControl: 300 });
      await expireClock(ctx, fixture.matchId);

      const scheduler = createDeadlineScheduler({ pool: ctx.pool });
      // The tick also sweeps stale rows left by other suites, so the claim is about this match.
      const first = await scheduler.tick();
      expect(first.finalizedMatches).toBeGreaterThanOrEqual(1);

      const row = await matchRow(ctx, fixture.matchId);
      expect(row.status).toBe('FINISHED');
      expect(row.outcome).toEqual({ winner: 'BLACK', reason: 'TIMEOUT' });
      expect(Number(row.version)).toBe(1);
      expect(row.ply).toBe(0);
      expect(await terminalEvents(ctx, fixture.matchId)).toBe(1);

      // The late move is refused: one terminal outcome already owns the match.
      const late = await ctx.app.inject({
        method: 'POST',
        url: `/api/v1/matches/${fixture.matchId}/commands/move`,
        headers: {
          ...ctx.authAs('A'),
          'x-control-id': fixture.leases.red.controllerId,
          'x-control-epoch': String(fixture.leases.red.controlEpoch),
        },
        payload: {
          commandId: crypto.randomUUID(),
          expectedVersion: 1,
          payload: { from: { x: 0, y: 3 }, to: { x: 0, y: 4 } },
        },
      });
      // The terminal match is unreachable for a write: the lease no longer covers it
      // (CONTROL_REQUIRED) or, with a covering lease, the pipeline reports MATCH_ENDED.
      expect([403, 409]).toContain(late.statusCode);
      expect(['CONTROL_REQUIRED', 'MATCH_ENDED']).toContain(
        (late.json() as { error: { code: string } }).error.code,
      );
      const afterLate = await matchRow(ctx, fixture.matchId);
      expect(afterLate.ply).toBe(0);
      expect(Number(afterLate.version)).toBe(1);
      expect(await terminalEvents(ctx, fixture.matchId)).toBe(1);

      // A second tick is a no-op for this match: the terminal row is immutable.
      await scheduler.tick();
      expect(Number((await matchRow(ctx, fixture.matchId)).version)).toBe(1);
      expect(await terminalEvents(ctx, fixture.matchId)).toBe(1);
    });
  }, 60_000);

  it('lets exactly one of resign vs timeout win', async () => {
    await withTestContext(async (ctx) => {
      const fixture = await createMatch(ctx, { timeControl: 300 });
      await expireClock(ctx, fixture.matchId);
      const scheduler = createDeadlineScheduler({ pool: ctx.pool });

      const before = await matchRow(ctx, fixture.matchId);
      const [resign, tick] = await Promise.allSettled([
        ctx.app.inject({
          method: 'POST',
          url: `/api/v1/matches/${fixture.matchId}/commands/resign`,
          headers: {
            ...ctx.authAs('B'),
            'x-control-id': fixture.leases.black.controllerId,
            'x-control-epoch': String(fixture.leases.black.controlEpoch),
          },
          payload: { commandId: crypto.randomUUID(), expectedVersion: Number(before.version) },
        }),
        scheduler.tick(),
      ]);

      expect(resign.status).toBe('fulfilled');
      expect(tick.status).toBe('fulfilled');

      const row = await matchRow(ctx, fixture.matchId);
      expect(row.status).toBe('FINISHED');
      expect(['TIMEOUT', 'RESIGN']).toContain(row.outcome?.reason);
      expect(Number(row.version)).toBe(Number(before.version) + 1);
      expect(await terminalEvents(ctx, fixture.matchId)).toBe(1);
    });
  }, 60_000);

  it('serializes a concurrent undo accept and move into one applied version', async () => {
    await withTestContext(async (ctx) => {
      const fixture = await createMatch(ctx);
      const withLease = (key: TestUserKey) => ({
        ...ctx.authAs(key),
        'x-control-id': fixture.leases[key === 'A' ? 'red' : 'black'].controllerId,
        'x-control-epoch': String(fixture.leases[key === 'A' ? 'red' : 'black'].controlEpoch),
      });

      const firstMove = await ctx.app.inject({
        method: 'POST',
        url: `/api/v1/matches/${fixture.matchId}/commands/move`,
        headers: withLease('A'),
        payload: {
          commandId: crypto.randomUUID(),
          expectedVersion: 0,
          payload: { from: { x: 0, y: 3 }, to: { x: 0, y: 4 } },
        },
      });
      expect(firstMove.statusCode, firstMove.body).toBe(200);
      const afterMove = unwrap<CommandResult>(firstMove);
      expect(afterMove.snapshot.ply).toBe(1);

      const proposal = await ctx.app.inject({
        method: 'POST',
        url: `/api/v1/matches/${fixture.matchId}/commands/propose`,
        headers: withLease('B'),
        payload: {
          commandId: crypto.randomUUID(),
          expectedVersion: afterMove.appliedVersion,
          payload: { kind: 'UNDO' },
        },
      });
      expect(proposal.statusCode, proposal.body).toBe(200);
      const proposed = unwrap<CommandResult>(proposal);
      const proposalId = proposed.snapshot.proposal?.id;
      expect(proposalId).toBeTruthy();

      // Both act on the same version: only one may apply.
      const [accept, move] = await Promise.all([
        ctx.app.inject({
          method: 'POST',
          url: `/api/v1/matches/${fixture.matchId}/commands/respond`,
          headers: withLease('A'),
          payload: {
            commandId: crypto.randomUUID(),
            expectedVersion: proposed.appliedVersion,
            payload: { proposalId, accept: true },
          },
        }),
        ctx.app.inject({
          method: 'POST',
          url: `/api/v1/matches/${fixture.matchId}/commands/move`,
          headers: withLease('A'),
          payload: {
            commandId: crypto.randomUUID(),
            expectedVersion: proposed.appliedVersion,
            payload: { from: { x: 0, y: 0 }, to: { x: 0, y: 1 } },
          },
        }),
      ]);

      const statuses = [accept.statusCode, move.statusCode].sort();
      expect(statuses).toEqual([200, 409]);
      const row = await matchRow(ctx, fixture.matchId);
      expect(Number(row.version)).toBe(proposed.appliedVersion + 1);
      expect(row.status).toBe('ACTIVE');
      // Either the undo rewinded the branch (ply 0) or the move added one (ply 2).
      expect([0, 2]).toContain(row.ply);
      const eventsAtVersion = await ctx.pool.query<{ n: number }>(
        'SELECT count(*)::int AS n FROM public.match_events WHERE match_id = $1 AND version = $2',
        [fixture.matchId, row.version],
      );
      expect(eventsAtVersion.rows[0]!.n).toBe(1);
    });
  }, 60_000);

  it('honours the 60s grace on reconnect and interrupts when both leases are lost', async () => {
    await withTestContext(async (ctx) => {
      const insideGrace = await createMatch(ctx);
      const scheduler = createDeadlineScheduler({ pool: ctx.pool });

      // 30s into the grace: nothing is final, and the snapshot reports the countdown.
      await setLeaseOffline(ctx, ctx.users['B'].id, 30);
      await scheduler.tick();
      expect((await matchRow(ctx, insideGrace.matchId)).status).toBe('ACTIVE');
      const midGrace = await snapshot(ctx, insideGrace.matchId, 'A');
      const blackPresence = midGrace.presence.find((entry) => entry.userId === ctx.users['B'].id);
      expect(blackPresence).toMatchObject({ online: false });
      expect(blackPresence?.disconnectDeadlineMs).toBeGreaterThan(Date.now());

      // Reconnect (heartbeat) inside the grace keeps the match alive.
      await refreshControlLease(ctx.users['B'].id, insideGrace.tabIds.black, Date.now(), ctx.pool);
      await scheduler.tick();
      expect((await matchRow(ctx, insideGrace.matchId)).status).toBe('ACTIVE');
      const reconnected = await snapshot(ctx, insideGrace.matchId, 'A');
      expect(reconnected.presence.find((entry) => entry.userId === ctx.users['B'].id)).toMatchObject({
        online: true,
        disconnectDeadlineMs: null,
      });

      // Past the grace the online side wins by DISCONNECT.
      await setLeaseOffline(ctx, ctx.users['B'].id, 61);
      const finalized = await scheduler.tick();
      expect(finalized.finalizedMatches).toBeGreaterThanOrEqual(1);
      const lostRow = await matchRow(ctx, insideGrace.matchId);
      expect(lostRow.status).toBe('FINISHED');
      expect(lostRow.outcome).toEqual({ winner: 'RED', reason: 'DISCONNECT' });
      expect(await terminalEvents(ctx, insideGrace.matchId)).toBe(1);

      // Both leases lost before any deadline → INTERRUPTED with no winner.
      const bothOffline = await createMatch(ctx);
      await setLeaseOffline(ctx, ctx.users['A'].id, 61);
      await setLeaseOffline(ctx, ctx.users['B'].id, 61);
      expect((await scheduler.tick()).finalizedMatches).toBeGreaterThanOrEqual(1);
      const interrupted = await matchRow(ctx, bothOffline.matchId);
      expect(interrupted.status).toBe('INTERRUPTED');
      expect(interrupted.outcome).toEqual({ winner: null, reason: 'BOTH_OFFLINE' });
      expect(await terminalEvents(ctx, bothOffline.matchId)).toBe(1);
      expect((await snapshot(ctx, bothOffline.matchId, 'A')).status).toBe('INTERRUPTED');
    });
  }, 90_000);

  it('closes a finished room only after 10 minutes, and a rematch clears finished_at', async () => {
    await withTestContext(async (ctx) => {
      const fixture = await createMatch(ctx);
      const head = { ...ctx.authAs('A'), 'x-control-id': fixture.leases.red.controllerId, 'x-control-epoch': String(fixture.leases.red.controlEpoch) };

      const resign = await ctx.app.inject({
        method: 'POST',
        url: `/api/v1/matches/${fixture.matchId}/commands/resign`,
        headers: head,
        payload: { commandId: crypto.randomUUID(), expectedVersion: 0, payload: {} },
      });
      expect(resign.statusCode, resign.body).toBe(200);

      const finished = await ctx.pool.query<{ status: string; finished_at: string | null }>(
        'SELECT status, finished_at FROM public.rooms WHERE id = $1',
        [fixture.roomId],
      );
      expect(finished.rows[0]!.status).toBe('FINISHED');
      expect(finished.rows[0]!.finished_at).not.toBeNull();

      // Well inside the 10-minute window: the room stays FINISHED.
      expect((await closeExpiredRooms(Date.now(), ctx.pool)).closedRooms).toBe(0);

      // Two votes create a new match and must clear finished_at (FINISHED → PLAYING).
      for (const key of ['A', 'B'] as TestUserKey[]) {
        const vote = await ctx.app.inject({
          method: 'POST',
          url: `/api/v1/rooms/${fixture.roomId}/rematch`,
          headers: ctx.authAs(key),
          payload: { expectedMatchId: fixture.matchId },
        });
        expect(vote.statusCode, vote.body).toBe(200);
      }
      const rematched = await ctx.pool.query<{
        status: string;
        finished_at: string | null;
        current_match_id: string;
      }>('SELECT status, finished_at, current_match_id FROM public.rooms WHERE id = $1', [
        fixture.roomId,
      ]);
      expect(rematched.rows[0]!.status).toBe('PLAYING');
      expect(rematched.rows[0]!.finished_at).toBeNull();
      expect(rematched.rows[0]!.current_match_id).not.toBe(fixture.matchId);
      expect((await snapshot(ctx, rematched.rows[0]!.current_match_id, 'A')).status).toBe('ACTIVE');

      // The new match ends; past the window the room closes and no rematch can revive it.
      const secondResign = await ctx.app.inject({
        method: 'POST',
        url: `/api/v1/matches/${rematched.rows[0]!.current_match_id}/commands/resign`,
        headers: ctx.authAs('A'),
        payload: { commandId: crypto.randomUUID(), expectedVersion: 0, payload: {} },
      });
      expect(secondResign.statusCode, secondResign.body).toBe(200);

      // Drive the scheduler with a fake `now` past the 10-minute window (no real waiting).
      // Other rows may be stale leftovers of earlier runs, so the claim is about this room.
      const closeResult = await closeExpiredRooms(Date.now() + ROOM_CLOSE_AFTER_MS + 60_000, ctx.pool);
      expect(closeResult.closedRooms).toBeGreaterThanOrEqual(1);
      const closed = await ctx.pool.query<{ status: string; members: number }>(
        `SELECT r.status, (SELECT count(*)::int FROM public.room_members m WHERE m.room_id = r.id) AS members
           FROM public.rooms r WHERE r.id = $1`,
        [fixture.roomId],
      );
      expect(closed.rows[0]).toMatchObject({ status: 'CLOSED', members: 0 });

      const lateVote = await ctx.app.inject({
        method: 'POST',
        url: `/api/v1/rooms/${fixture.roomId}/rematch`,
        headers: ctx.authAs('A'),
        payload: { expectedMatchId: rematched.rows[0]!.current_match_id },
      });
      expect(lateVote.statusCode, lateVote.body).toBe(409);
      expect((lateVote.json() as { error: { code: string } }).error.code).toBe('ROOM_CLOSED');
    });
  }, 90_000);

  it('does not resurrect a match after boot recovery', async () => {
    await withTestContext(async (ctx) => {
      const fixture = await createMatch(ctx);
      const recovered = await recoverActiveMatchesOnBoot(ctx.pool);
      expect(recovered).toBeGreaterThanOrEqual(1);

      const interrupted = await matchRow(ctx, fixture.matchId);
      expect(interrupted.status).toBe('INTERRUPTED');
      expect(interrupted.outcome).toEqual({ winner: null, reason: 'SERVER_RESTART' });
      expect(await terminalEvents(ctx, fixture.matchId)).toBe(1);

      const scheduler = createDeadlineScheduler({ pool: ctx.pool });
      await scheduler.tick();
      expect((await matchRow(ctx, fixture.matchId)).status).toBe('INTERRUPTED');
      expect((await snapshot(ctx, fixture.matchId, 'A')).status).toBe('INTERRUPTED');
    });
  }, 60_000);
});
