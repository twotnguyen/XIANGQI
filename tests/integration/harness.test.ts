/**
 * ISSUE-006 harness contract: the factory must hand a later issue a real app plus
 * real Auth sessions, and must clean up after itself on every path (spec 08 row
 * ISSUE-006). Runs in the integration lane only, like database.test.ts.
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  INTEGRATION_LANE_ENV,
  TEST_USER_KEYS,
  createTestContext,
  findAuthUserIds,
  resetTestData,
  seedUsers,
  withTestContext,
  type TestContext,
} from '../fixtures/integration.js';

const inIntegrationLane = process.env[INTEGRATION_LANE_ENV] === '1';

describe.runIf(inIntegrationLane)('T006: integration harness factory', () => {
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

  it('T006-H1: seeds eight real Auth users whose identity carries the runId', async () => {
    const users = Object.values(ctx.users);
    expect(users.map((user) => user.key)).toEqual([...TEST_USER_KEYS]);
    expect(new Set(users.map((user) => user.id)).size).toBe(TEST_USER_KEYS.length);

    for (const user of users) {
      expect(user.username).toContain(ctx.runId);
      expect(user.email).toContain(ctx.runId);
      expect(user.accessToken.split('.')).toHaveLength(3);
    }

    // The on_auth_user_created trigger must have created one profile per user, and
    // the RLS-scoped product pool must see those same rows.
    const ids = users.map((user) => user.id);
    const viaAdmin = await ctx.adminPool.query<{ count: number }>(
      'SELECT count(*)::int AS count FROM public.profiles WHERE user_id = ANY($1::uuid[])',
      [ids],
    );
    const viaApp = await ctx.pool.query<{ count: number }>(
      'SELECT count(*)::int AS count FROM public.profiles WHERE user_id = ANY($1::uuid[])',
      [ids],
    );
    expect(viaAdmin.rows[0].count).toBe(TEST_USER_KEYS.length);
    expect(viaApp.rows[0].count).toBe(TEST_USER_KEYS.length);
  });

  it('T006-H2: authAs(A) is a real session the app accepts', async () => {
    const response = await ctx.app.inject({
      method: 'GET',
      url: '/api/v1/me',
      headers: ctx.authAs('A'),
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.ok).toBe(true);
    expect(body.data.profile).toEqual({
      id: ctx.users['A'].id,
      username: ctx.users['A'].username,
      displayName: 'Test A',
    });
    expect(body.data.onboardingRequired).toBe(false);
  });

  it('T006-H3: a request without a token is rejected with 401', async () => {
    const response = await ctx.app.inject({ method: 'GET', url: '/api/v1/me' });

    expect(response.statusCode).toBe(401);
    expect(response.json().error.code).toBe('UNAUTHENTICATED');
  });

  it('T006-H4: resetTestData deletes exactly this run and leaves other runs intact', async () => {
    const victim = await createTestContext({ seed: false });
    try {
      const victimUsers = await seedUsers(victim.runId, victim.adminPool);
      const victimRoom = await victim.pool.query<{ id: string }>(
        'INSERT INTO public.rooms (owner_id, name) VALUES ($1, $2) RETURNING id',
        [victimUsers['A'].id, `victim-${victim.runId}`],
      );
      const survivorRoom = await ctx.pool.query<{ id: string }>(
        'INSERT INTO public.rooms (owner_id, name) VALUES ($1, $2) RETURNING id',
        [ctx.users['A'].id, `survivor-${ctx.runId}`],
      );

      await resetTestData(victim.runId, victim.adminPool);

      const roomsGone = await ctx.adminPool.query<{ count: number }>(
        'SELECT count(*)::int AS count FROM public.rooms WHERE id = $1',
        [victimRoom.rows[0].id],
      );
      const profilesGone = await ctx.adminPool.query<{ count: number }>(
        'SELECT count(*)::int AS count FROM public.profiles WHERE user_id = $1',
        [victimUsers['A'].id],
      );
      const authUsersGone = await findAuthUserIds(victim.runId);
      expect(roomsGone.rows[0].count).toBe(0);
      expect(profilesGone.rows[0].count).toBe(0);
      expect(authUsersGone).toEqual([]);

      const survivorRoomKept = await ctx.adminPool.query<{ count: number }>(
        'SELECT count(*)::int AS count FROM public.rooms WHERE id = $1',
        [survivorRoom.rows[0].id],
      );
      const survivorProfileKept = await ctx.adminPool.query<{ count: number }>(
        'SELECT count(*)::int AS count FROM public.profiles WHERE user_id = $1',
        [ctx.users['A'].id],
      );
      expect(survivorRoomKept.rows[0].count).toBe(1);
      expect(survivorProfileKept.rows[0].count).toBe(1);
      expect(await findAuthUserIds(ctx.runId)).toHaveLength(TEST_USER_KEYS.length);

      // Idempotent: a second reset for the same run is a no-op.
      await expect(resetTestData(victim.runId, victim.adminPool)).resolves.toBeUndefined();
    } finally {
      await victim.dispose();
    }
  });

  it('T006-H5: withTestContext disposes even when the body throws', async () => {
    let captured: TestContext | undefined;

    await expect(
      withTestContext(async (inner) => {
        captured = inner;
        const alive = await inner.pool.query<{ val: number }>('SELECT 1 AS val');
        expect(alive.rows[0].val).toBe(1);
        throw new Error('T006 body sentinel');
      }),
    ).rejects.toThrow('T006 body sentinel');

    expect(captured).toBeDefined();
    await expect(captured!.pool.query('SELECT 1')).rejects.toThrow(/after calling end/);
    await expect(captured!.adminPool.query('SELECT 1')).rejects.toThrow(/after calling end/);
  });

  it('T006-H6: dispose is idempotent and leaves nothing open', async () => {
    const temporary = await createTestContext({ seed: false });

    await temporary.dispose();
    await expect(temporary.dispose()).resolves.toBeUndefined();

    await expect(
      temporary.app.inject({ method: 'GET', url: '/health' }),
    ).rejects.toMatchObject({ code: 'FST_ERR_REOPENED_CLOSE_SERVER' });
    await expect(temporary.pool.query('SELECT 1')).rejects.toThrow(/after calling end/);
    await expect(temporary.adminPool.query('SELECT 1')).rejects.toThrow(/after calling end/);
    expect(temporary.pool.totalCount).toBe(0);
    expect(temporary.pool.idleCount).toBe(0);
    expect(temporary.adminPool.totalCount).toBe(0);
  });
});
