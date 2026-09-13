/**
 * ISSUE-006 acceptance against the LOCAL Supabase stack: real Postgres, real roles,
 * real constraints. Cases T006-01..T006-11 map to the spec 08 harness row.
 *
 * These run in the integration lane only (vitest.integration.config.ts). The unit lane
 * (vitest.config.ts) also globs tests/integration/**, but it has no local-stack env or
 * setup file, so it must not pretend to verify the database: `runIf` keeps the failure
 * loud where it matters instead of silently skipping here.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import crypto from 'node:crypto';
import { withTransaction } from '../../apps/server/src/db/transaction.js';
import {
  INTEGRATION_LANE_ENV,
  createAuthUser,
  createTestContext,
  resetTestData,
  type TestContext,
} from '../fixtures/integration.js';

const inIntegrationLane = process.env[INTEGRATION_LANE_ENV] === '1';

const RLS_ROLE_SWITCH: Record<'anon' | 'authenticated', string> = {
  anon: 'SET LOCAL ROLE anon',
  authenticated: 'SET LOCAL ROLE authenticated',
};

describe.runIf(inIntegrationLane)('T006: database integration on local Postgres', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestContext();
  });

  afterAll(async () => {
    if (ctx) {
      // Leave the shared local stack as we found it, then release the connections.
      await resetTestData(ctx.runId, ctx.adminPool);
      await ctx.dispose();
    }
  });

  /** Real ONLINE match (room + match) created through the app_server role. */
  async function createOnlineMatch(): Promise<{ roomId: string; matchId: string }> {
    const room = await ctx.pool.query<{ id: string }>(
      'INSERT INTO public.rooms (owner_id, name) VALUES ($1, $2) RETURNING id',
      [ctx.users['A'].id, `league-${ctx.runId}`],
    );
    const roomId = room.rows[0].id;
    const position = JSON.stringify({ board: new Array(90).fill(null), turn: 'RED' });
    const match = await ctx.pool.query<{ id: string }>(
      `INSERT INTO public.matches (room_id, mode, red_user_id, black_user_id, position, version, ply, time_control)
       VALUES ($1, 'ONLINE', $2, $3, $4::jsonb, 0, 0, 0) RETURNING id`,
      [roomId, ctx.users['A'].id, ctx.users['B'].id, position],
    );
    return { roomId, matchId: match.rows[0].id };
  }

  async function insertMove(matchId: string, moveNumber: number, side = 'RED'): Promise<unknown> {
    return ctx.pool.query(
      `INSERT INTO public.moves
         (match_id, move_number, player_id, side, from_x, from_y, to_x, to_y, piece_type)
       VALUES ($1, $2, $3, $4, 0, 3, 0, 4, 'PAWN')`,
      [matchId, moveNumber, ctx.users['A'].id, side],
    );
  }

  /** Run one statement as a non-privileged role inside a transaction, then roll back. */
  async function attemptAsRole(
    role: 'anon' | 'authenticated',
    sql: string,
    params: unknown[] = [],
    claims?: Record<string, unknown>,
  ): Promise<void> {
    const client = await ctx.adminPool.connect();
    try {
      await client.query('BEGIN');
      await client.query(RLS_ROLE_SWITCH[role]);
      if (claims) {
        await client.query("SELECT set_config('request.jwt.claims', $1, true)", [
          JSON.stringify(claims),
        ]);
      }
      await client.query(sql, params);
    } finally {
      await client.query('ROLLBACK');
      client.release();
    }
  }

  it('T006-01: app_server connects over TCP and can run a query', async () => {
    const identity = await ctx.pool.query<{ role: string; superuser: string }>(
      "SELECT current_user AS role, current_setting('is_superuser') AS superuser",
    );
    expect(identity.rows[0].role).toBe('app_server');
    expect(identity.rows[0].superuser).toBe('off');

    const result = await ctx.pool.query<{ val: number }>('SELECT 1 AS val');
    expect(result.rows[0].val).toBe(1);
  });

  it('T006-02: withTransaction rolls back a real insert when the callback throws', async () => {
    const { matchId } = await createOnlineMatch();

    await expect(
      withTransaction(async (tx) => {
        await tx.query(
          `INSERT INTO public.moves
             (match_id, move_number, player_id, side, from_x, from_y, to_x, to_y, piece_type)
           VALUES ($1, 1, $2, 'RED', 0, 3, 0, 4, 'PAWN')`,
          [matchId, ctx.users['A'].id],
        );
        throw new Error('T006 rollback sentinel');
      }, ctx.pool),
    ).rejects.toThrow('T006 rollback sentinel');

    const after = await ctx.pool.query<{ count: number }>(
      'SELECT count(*)::int AS count FROM public.moves WHERE match_id = $1',
      [matchId],
    );
    expect(after.rows[0].count).toBe(0);
  });

  it('T006-03: withTransaction commits a real insert and persists it', async () => {
    const { matchId } = await createOnlineMatch();

    await withTransaction(async (tx) => {
      await tx.query(
        `INSERT INTO public.moves
           (match_id, move_number, player_id, side, from_x, from_y, to_x, to_y, piece_type)
         VALUES ($1, 1, $2, 'RED', 0, 3, 0, 4, 'PAWN')`,
        [matchId, ctx.users['A'].id],
      );
    }, ctx.pool);

    const after = await ctx.pool.query<{ move_number: number; side: string }>(
      'SELECT move_number, side FROM public.moves WHERE match_id = $1',
      [matchId],
    );
    expect(after.rows).toEqual([{ move_number: 1, side: 'RED' }]);
  });

  it('T006-04: a duplicate unique key is rejected with 23505', async () => {
    // Migration 20260912000011 (F-01 ancestry) dropped moves_match_move_number_unique, so the
    // durable unique key asserted here is friend_relations_user_pair_unique: a repeated pair
    // must fail even though the two rows differ in nothing but their generated id.
    const insertPair = `INSERT INTO public.friend_relations (user_low, user_high, requester_id)
       VALUES (LEAST($1::uuid, $2::uuid), GREATEST($1::uuid, $2::uuid), LEAST($1::uuid, $2::uuid))`;
    const pair = [ctx.users['A'].id, ctx.users['B'].id];

    await ctx.pool.query(insertPair, pair);
    await expect(ctx.pool.query(insertPair, pair)).rejects.toMatchObject({
      code: '23505',
      constraint: 'friend_relations_user_pair_unique',
    });
  });

  it('T006-05: a contended username is awarded to exactly one writer (23505)', async () => {
    const contended = `dup_${ctx.runId}`;
    // Phone signups on purpose: the local trigger leaves `profiles.username` NULL for
    // non-email providers, and `guard_profile_updates` forbids changing a set username,
    // so this is the only way two profiles can race for the same free username.
    // `test_run_id` keeps them inside resetTestData's run cleanup.
    const first = await createAuthUser({
      phone: `+1555${crypto.randomInt(1_000_000, 9_999_999)}`,
      displayName: 'Contender One',
      metadata: { test_run_id: ctx.runId },
    });
    const second = await createAuthUser({
      phone: `+1555${crypto.randomInt(1_000_000, 9_999_999)}`,
      displayName: 'Contender Two',
      metadata: { test_run_id: ctx.runId },
    });

    const results = await Promise.allSettled([
      ctx.adminPool.query('UPDATE public.profiles SET username = $1 WHERE user_id = $2', [
        contended,
        first.id,
      ]),
      ctx.adminPool.query('UPDATE public.profiles SET username = $1 WHERE user_id = $2', [
        contended,
        second.id,
      ]),
    ]);

    const fulfilled = results.filter((result) => result.status === 'fulfilled');
    const rejected = results.filter(
      (result): result is PromiseRejectedResult => result.status === 'rejected',
    );
    expect(fulfilled).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    expect(rejected[0].reason).toMatchObject({
      code: '23505',
      constraint: 'profiles_username_unique',
    });

    const owners = await ctx.adminPool.query<{ user_id: string }>(
      'SELECT user_id FROM public.profiles WHERE username = $1',
      [contended],
    );
    expect(owners.rows).toHaveLength(1);
  });

  it('T006-06: a dangling match reference is rejected with 23503', async () => {
    await expect(insertMove('00000000-0000-4000-8000-000000000000', 1)).rejects.toMatchObject({
      code: '23503',
      constraint: 'moves_match_id_fkey',
    });
  });

  it('T006-07: an invalid time_control is rejected with 23514', async () => {
    const room = await ctx.pool.query<{ id: string }>(
      'INSERT INTO public.rooms (owner_id, name) VALUES ($1, $2) RETURNING id',
      [ctx.users['A'].id, `bad-clock-${ctx.runId}`],
    );
    const position = JSON.stringify({ board: new Array(90).fill(null), turn: 'RED' });

    await expect(
      ctx.pool.query(
        `INSERT INTO public.matches (room_id, mode, red_user_id, black_user_id, position, version, ply, time_control, clock)
         VALUES ($1, 'ONLINE', $2, $3, $4::jsonb, 0, 0, 123, '{"redMs":600000,"blackMs":600000,"runningSinceEpochMs":0}'::jsonb)`,
        [room.rows[0].id, ctx.users['A'].id, ctx.users['B'].id, position],
      ),
    ).rejects.toMatchObject({ code: '23514', constraint: 'matches_time_control_check' });
  });

  it('T006-08: anon cannot read or write application tables', async () => {
    await expect(
      attemptAsRole('anon', 'SELECT count(*) FROM public.rooms'),
    ).rejects.toMatchObject({ code: '42501' });
    await expect(
      attemptAsRole('anon', 'INSERT INTO public.rooms (owner_id, name) VALUES ($1, $2)', [
        ctx.users['A'].id,
        'anon-write',
      ]),
    ).rejects.toMatchObject({ code: '42501' });
  });

  it('T006-09: authenticated cannot read or write application tables even with JWT claims', async () => {
    const claims = { sub: ctx.users['A'].id, role: 'authenticated' };
    await expect(
      attemptAsRole('authenticated', 'SELECT count(*) FROM public.rooms', [], claims),
    ).rejects.toMatchObject({ code: '42501' });
    await expect(
      attemptAsRole(
        'authenticated',
        'UPDATE public.rooms SET name = $1',
        ['authenticated-write'],
        claims,
      ),
    ).rejects.toMatchObject({ code: '42501' });
  });

  it('T006-10: anon/authenticated cannot execute the private session function', async () => {
    const sql = 'SELECT private.is_auth_session_active($1::uuid, $2::uuid)';
    const params = [ctx.users['A'].id, '00000000-0000-4000-8000-000000000000'];
    await expect(attemptAsRole('anon', sql, params)).rejects.toMatchObject({ code: '42501' });
    await expect(
      attemptAsRole('authenticated', sql, params, { sub: ctx.users['A'].id, role: 'authenticated' }),
    ).rejects.toMatchObject({ code: '42501' });
  });

  it('T006-11: app_server reads the same rows the restricted roles were denied', async () => {
    const { roomId } = await createOnlineMatch();

    const visible = await ctx.pool.query<{ id: string; owner_id: string }>(
      'SELECT id, owner_id FROM public.rooms WHERE id = $1',
      [roomId],
    );
    expect(visible.rows).toHaveLength(1);
    expect(visible.rows[0].owner_id).toBe(ctx.users['A'].id);
  });
});
