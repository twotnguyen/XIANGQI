/**
 * F-19 (control lease) acceptance against the REAL local stack: real HTTP takeover,
 * real `public.client_controls` rows, real Postgres `23502`-class NOT NULL columns.
 *
 * Covers:
 *  - takeover DDL regression: `controller_tab_id`, `session_id`, `lease_until` and the
 *    room/match context are really populated (the shape that used to crash with 23502);
 *  - epoch bump on a second takeover tab + `control:revoked` to the old controller;
 *  - `requireControlLease` on a control-gated write (`PATCH /media/policy`): stale / missing
 *    / malformed headers are 403 CONTROL_REQUIRED while the current lease succeeds;
 *  - no cross-context lease use;
 *  - F-19 room side: a ready after the match started is 409 CONFLICT, not a 500 from
 *    `matches_active_room_idx`.
 *
 * Integration lane only (vitest.integration.config.ts); the unit lane skips via `runIf`.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import crypto from 'node:crypto';
import { requireControlLease } from '../../apps/server/src/modules/rooms/service.js';
import {
  onRealtimeEvent,
  type RealtimeEventMap,
  type RealtimeEventName,
} from '../../apps/server/src/realtime/events.js';
import {
  INTEGRATION_LANE_ENV,
  createTestContext,
  resetTestData,
  type TestContext,
} from '../fixtures/integration.js';

const inIntegrationLane = process.env[INTEGRATION_LANE_ENV] === '1';

const bearer = (accessToken: string) => ({ authorization: `Bearer ${accessToken}` });

type CapturedEvent = {
  [E in RealtimeEventName]: { event: E; payload: RealtimeEventMap[E] };
}[RealtimeEventName];

/** Attach an in-process listener and record every realtime emit (spec 04 transport). */
function captureEvents(): { events: CapturedEvent[]; stop: () => void } {
  const events: CapturedEvent[] = [];
  const stop = onRealtimeEvent({
    publish(event, payload) {
      events.push({ event, payload } as CapturedEvent);
    },
  });
  return { events, stop };
}

/** Read a claim out of the (already verified) access token under test. */
function jwtClaim(accessToken: string, claim: string): string {
  const payload = accessToken.split('.')[1];
  if (!payload) throw new Error('[F-19] access token is not a JWT');
  const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Record<string, unknown>;
  const value = parsed[claim];
  if (typeof value !== 'string') throw new Error(`[F-19] token has no string claim ${claim}`);
  return value;
}

describe.runIf(inIntegrationLane)('F-19: controller lease on the real stack', () => {
  let ctx: TestContext;
  let roomId: string;
  let matchId: string;
  let waitingLease: { controllerId: string; controlEpoch: number };
  let currentLease: { controllerId: string; controlEpoch: number };

  beforeAll(async () => {
    ctx = await createTestContext();
  });

  afterAll(async () => {
    if (ctx) {
      await resetTestData(ctx.runId, ctx.adminPool);
      await ctx.dispose();
    }
  });

  const post = (url: string, accessToken: string, payload: unknown) =>
    ctx.app.inject({ method: 'POST', url, headers: bearer(accessToken), payload });

  /** The control-gated write used for every lease assertion. */
  const policyWrite = (accessToken: string, headers: Record<string, string>) =>
    ctx.app.inject({
      method: 'PATCH',
      url: '/api/v1/media/policy',
      headers: { ...bearer(accessToken), ...headers },
      payload: { matchId, kind: 'CAMERA', audience: 'OFF', policyVersion: 0 },
    });

  async function readControlRow(userId: string) {
    const res = await ctx.pool.query<{
      controller_id: string;
      controller_tab_id: string;
      session_id: string;
      control_epoch: number;
      lease_until: Date;
      room_id: string | null;
      match_id: string | null;
      lease_future: boolean;
    }>(
      `SELECT controller_id, controller_tab_id, session_id, control_epoch, lease_until,
              room_id, match_id, lease_until > now() AS lease_future
         FROM public.client_controls WHERE user_id = $1`,
      [userId],
    );
    return res.rows[0];
  }

  it('F-19: takeover upserts every NOT NULL client_controls column for a room-only context', async () => {
    const { A, B } = ctx.users;
    const created = await post('/api/v1/rooms', A.accessToken, {
      name: `lease-${ctx.runId}`,
      visibility: 'PUBLIC',
    });
    expect(created.statusCode).toBe(200);
    roomId = created.json().data.id as string;
    expect((await post('/api/v1/rooms/join', B.accessToken, { roomId, role: 'PLAYER' })).statusCode).toBe(200);

    const tabId = crypto.randomUUID();
    const takeover = await post('/api/v1/control/takeover', A.accessToken, { tabId });
    expect(takeover.statusCode).toBe(200);
    waitingLease = takeover.json().data;
    expect(waitingLease.controllerId).toMatch(/^[0-9a-f-]{36}$/);
    expect(waitingLease.controlEpoch).toBe(1);

    // The regression that would have caught the 23502: the real DDL columns must be written.
    const row = await readControlRow(A.id);
    expect(row!.controller_id).toBe(waitingLease.controllerId);
    expect(row!.controller_tab_id).toBe(tabId);
    expect(row!.session_id).toBe(jwtClaim(A.accessToken, 'session_id'));
    expect(row!.control_epoch).toBe(1);
    expect(row!.lease_future).toBe(true);
    expect(row!.room_id).toBe(roomId);
    expect(row!.match_id).toBeNull(); // WAITING room: context is the room only
  });

  it('F-19: the room context accepts one match and the second takeover bumps the epoch', async () => {
    const { A, B } = ctx.users;
    expect((await post(`/api/v1/rooms/${roomId}/ready`, A.accessToken, { ready: true })).statusCode).toBe(200);
    const started = await post(`/api/v1/rooms/${roomId}/ready`, B.accessToken, { ready: true });
    expect(started.statusCode).toBe(200);
    matchId = started.json().data.matchSnapshot.id as string;
    expect(matchId).toBeTruthy();

    const tabId = crypto.randomUUID();
    const capture = captureEvents();
    let takeover;
    try {
      takeover = await post('/api/v1/control/takeover', A.accessToken, { tabId });
    } finally {
      capture.stop();
    }
    expect(takeover.statusCode).toBe(200);
    currentLease = takeover.json().data;
    expect(currentLease.controlEpoch).toBe(2);
    expect(currentLease.controllerId).not.toBe(waitingLease.controllerId);

    const row = await readControlRow(A.id);
    expect(row!.controller_id).toBe(currentLease.controllerId);
    expect(row!.controller_tab_id).toBe(tabId);
    expect(row!.control_epoch).toBe(2);
    expect(row!.lease_future).toBe(true);
    expect(row!.room_id).toBe(roomId);
    expect(row!.match_id).toBe(matchId); // PLAYING room: the lease now covers the match

    const revoked = capture.events.filter(
      (event): event is Extract<CapturedEvent, { event: 'control:revoked' }> =>
        event.event === 'control:revoked',
    );
    expect(revoked).toHaveLength(1);
    expect(revoked[0]!.payload).toEqual({
      userId: A.id,
      roomId,
      matchId,
      controlEpoch: 2,
    });
  });

  it('F-19: a ready after the match started is 409 CONFLICT, never a 500', async () => {
    const { A } = ctx.users;
    const ready = await post(`/api/v1/rooms/${roomId}/ready`, A.accessToken, { ready: true });
    expect(ready.statusCode).toBe(409);
    expect(ready.json().error.code).toBe('CONFLICT');

    const active = await ctx.pool.query<{ count: number }>(
      "SELECT count(*)::int AS count FROM public.matches WHERE room_id = $1 AND status = 'ACTIVE'",
      [roomId],
    );
    expect(active.rows[0]?.count).toBe(1);
  });

  it('F-19: the stale lease is rejected 403 CONTROL_REQUIRED while the current lease writes', async () => {
    const { A } = ctx.users;
    const stale = await policyWrite(A.accessToken, {
      'x-control-id': waitingLease.controllerId,
      'x-control-epoch': String(waitingLease.controlEpoch),
    });
    expect(stale.statusCode).toBe(403);
    expect(stale.json().error.code).toBe('CONTROL_REQUIRED');

    // The denied write left no policy behind.
    const before = await ctx.pool.query<{ count: number }>(
      'SELECT count(*)::int AS count FROM public.media_policies WHERE match_id = $1 AND user_id = $2',
      [matchId, A.id],
    );
    expect(before.rows[0]?.count).toBe(0);

    const allowed = await policyWrite(A.accessToken, {
      'x-control-id': currentLease.controllerId,
      'x-control-epoch': String(currentLease.controlEpoch),
    });
    expect(allowed.statusCode).toBe(200);
    expect(allowed.json().data).toMatchObject({
      userId: A.id,
      policyVersion: 1,
      appliedVersion: 1,
      status: 'APPLIED',
      desired: { camera: 'OFF', microphone: 'OFF' },
    });

    const stored = await ctx.pool.query<{ policy_version: number; status: string; camera_audience: string }>(
      'SELECT policy_version, status, camera_audience FROM public.media_policies WHERE match_id = $1 AND user_id = $2',
      [matchId, A.id],
    );
    expect(stored.rows[0]).toEqual({ policy_version: 1, status: 'APPLIED', camera_audience: 'OFF' });
  });

  it('F-19: missing or malformed control headers are 403 CONTROL_REQUIRED and change nothing', async () => {
    const { A } = ctx.users;
    const attempts: Record<string, string>[] = [
      {},
      { 'x-control-epoch': String(currentLease.controlEpoch) },
      { 'x-control-id': currentLease.controllerId },
      { 'x-control-id': crypto.randomUUID(), 'x-control-epoch': String(currentLease.controlEpoch) },
      { 'x-control-id': currentLease.controllerId, 'x-control-epoch': 'not-a-number' },
      { 'x-control-id': currentLease.controllerId, 'x-control-epoch': '0' },
      { 'x-control-id': 'not-a-uuid', 'x-control-epoch': String(currentLease.controlEpoch) },
    ];

    for (const headers of attempts) {
      const res = await policyWrite(A.accessToken, headers);
      expect(res.statusCode, JSON.stringify(headers)).toBe(403);
      expect(res.json().error.code, JSON.stringify(headers)).toBe('CONTROL_REQUIRED');
    }

    const stored = await ctx.pool.query<{ policy_version: number; status: string }>(
      'SELECT policy_version, status FROM public.media_policies WHERE match_id = $1 AND user_id = $2',
      [matchId, A.id],
    );
    expect(stored.rows[0]).toEqual({ policy_version: 1, status: 'APPLIED' });
  });

  it('F-19: chat send obeys the same lease (stale rejected, current accepted)', async () => {
    const { A } = ctx.users;
    const clientMessageId = crypto.randomUUID();
    const payload = { clientMessageId, content: 'lease check' };

    const stale = await ctx.app.inject({
      method: 'POST',
      url: `/api/v1/rooms/${roomId}/chat`,
      headers: {
        ...bearer(A.accessToken),
        'x-control-id': waitingLease.controllerId,
        'x-control-epoch': String(waitingLease.controlEpoch),
      },
      payload,
    });
    expect(stale.statusCode, stale.body).toBe(403);
    expect(stale.json().error.code).toBe('CONTROL_REQUIRED');

    const allowed = await ctx.app.inject({
      method: 'POST',
      url: `/api/v1/rooms/${roomId}/chat`,
      headers: {
        ...bearer(A.accessToken),
        'x-control-id': currentLease.controllerId,
        'x-control-epoch': String(currentLease.controlEpoch),
      },
      payload,
    });
    expect(allowed.statusCode, allowed.body).toBe(200);
    expect(allowed.json().data).toMatchObject({ channel: 'PLAYERS', content: 'lease check' });

    // The stale attempt wrote nothing: the accepted send created the single row for the id.
    const stored = await ctx.pool.query<{ count: number; channel: string }>(
      'SELECT count(*)::int AS count, min(channel) AS channel FROM public.chat_messages WHERE match_id = $1 AND client_message_id = $2',
      [matchId, clientMessageId],
    );
    expect(stored.rows[0]).toEqual({ count: 1, channel: 'PLAYERS' });
  });

  it('F-19: a lease cannot be replayed against another room over HTTP', async () => {
    const { A, S1 } = ctx.users;
    const other = await post('/api/v1/rooms', S1.accessToken, {
      name: `other-${ctx.runId}`,
      visibility: 'PUBLIC',
    });
    expect(other.statusCode, other.body).toBe(200);
    const otherRoomId = other.json().data.id as string;

    const replayed = await ctx.app.inject({
      method: 'POST',
      url: `/api/v1/rooms/${otherRoomId}/chat`,
      headers: {
        ...bearer(A.accessToken),
        'x-control-id': currentLease.controllerId,
        'x-control-epoch': String(currentLease.controlEpoch),
      },
      payload: { clientMessageId: crypto.randomUUID(), content: 'cross room' },
    });
    expect(replayed.statusCode, replayed.body).toBe(403);
    expect(replayed.json().error.code).toBe('CONTROL_REQUIRED');

    const stored = await ctx.pool.query<{ count: number }>(
      'SELECT count(*)::int AS count FROM public.chat_messages WHERE room_id = $1',
      [otherRoomId],
    );
    expect(stored.rows[0]?.count).toBe(0);
  });

  it('F-19: a lease cannot be used for another room or match', async () => {
    const { A } = ctx.users;
    const foreignRoom = crypto.randomUUID();
    const foreignMatch = crypto.randomUUID();

    // No HTTP route can present a mismatched context today (the context is derived
    // server-side), so the shared guard itself is exercised against the real lease row
    // written by takeover above.
    await expect(
      requireControlLease(A.id, currentLease.controllerId, currentLease.controlEpoch, { matchId: foreignMatch }),
    ).rejects.toMatchObject({ statusCode: 403, code: 'CONTROL_REQUIRED' });
    await expect(
      requireControlLease(A.id, currentLease.controllerId, currentLease.controlEpoch, { roomId: foreignRoom }),
    ).rejects.toMatchObject({ statusCode: 403, code: 'CONTROL_REQUIRED' });
    await expect(
      requireControlLease(A.id, currentLease.controllerId, currentLease.controlEpoch, {
        roomId,
        matchId,
      }),
    ).resolves.toEqual(currentLease);

    // A caller with no room or AI-match context has nothing to take over.
    const { S6 } = ctx.users;
    const noContext = await post('/api/v1/control/takeover', S6.accessToken, { tabId: crypto.randomUUID() });
    expect(noContext.statusCode).toBe(409);
    expect(noContext.json().error.code).toBe('CONFLICT');
  });

  it('F-19: a player still reads the match snapshot after the lease moved tabs', async () => {
    const { A, B } = ctx.users;
    const snapshot = await ctx.app.inject({
      method: 'GET',
      url: `/api/v1/matches/${matchId}`,
      headers: bearer(B.accessToken),
    });
    expect(snapshot.statusCode).toBe(200);
    expect(snapshot.json().data).toMatchObject({ id: matchId, roomId, status: 'ACTIVE', redUserId: A.id });
  });
});
