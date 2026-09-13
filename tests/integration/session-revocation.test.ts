/**
 * F-05 (spec 05 / spec 08 rows ISSUE-007 + ISSUE-029) session revocation acceptance on
 * the REAL local stack: real Supabase Auth sessions, real Postgres, real HTTP.
 *
 * Every assertion is an HTTP status/error code or a DB row read: the DB marker is read
 * with the product's `app_server` pool (the harness already documents that
 * `private.revoked_sessions` is out of `service_role`'s reach).
 */
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import {
  INTEGRATION_LANE_ENV,
  createAuthUser,
  createTestContext,
  resetTestData,
  resolveTestEnv,
  type TestContext,
} from '../fixtures/integration.js';

const inIntegrationLane = process.env[INTEGRATION_LANE_ENV] === '1';

const bearer = (accessToken: string) => ({ authorization: `Bearer ${accessToken}` });

const TEST_PASSWORD = 'LocalTest12345';

/** Read a claim out of an access token that the app has already accepted. */
function jwtClaim(accessToken: string, claim: string): string {
  const payload = accessToken.split('.')[1];
  if (!payload) throw new Error('[F-05] access token is not a JWT');
  const parsed = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Record<string, unknown>;
  const value = parsed[claim];
  if (typeof value !== 'string') throw new Error(`[F-05] token has no string claim ${claim}`);
  return value;
}

/** Real Supabase password grant — the same flow the login route proxies. */
async function signIn(email: string): Promise<string> {
  const env = resolveTestEnv();
  const response = await fetch(`${env.supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: env.supabasePublishableKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: TEST_PASSWORD }),
  });
  const body = (await response.json().catch(() => null)) as { access_token?: string } | null;
  if (!response.ok || !body?.access_token) {
    throw new Error(`[F-05] Supabase password sign-in failed (${response.status}) for ${email}`);
  }
  return body.access_token;
}

describe.runIf(inIntegrationLane)('F-05: revoked sessions cannot be reused', () => {
  let ctx: TestContext;

  beforeAll(async () => {
    ctx = await createTestContext();
  });

  afterAll(async () => {
    if (ctx) {
      await resetTestData(ctx.runId, ctx.adminPool);
      await ctx.dispose();
    }
  });

  const get = (url: string, accessToken?: string) =>
    ctx.app.inject({ method: 'GET', url, ...(accessToken ? { headers: bearer(accessToken) } : {}) });

  const post = (url: string, accessToken: string, payload: unknown) =>
    ctx.app.inject({ method: 'POST', url, headers: bearer(accessToken), payload });

  async function createSessionUser(tag: string) {
    const created = await createAuthUser({
      email: `${tag}_${ctx.runId}@local.test`,
      username: `xq_${tag}_${ctx.runId}`,
      displayName: `F05 ${tag}`,
    });
    expect(created.accessToken).toBeTruthy();
    return { id: created.id, email: created.email!, accessToken: created.accessToken! };
  }

  it('F-05-01: logout CURRENT records the revoked session and that token is dead', async () => {
    const user = await createSessionUser('cur');
    const sessionId = jwtClaim(user.accessToken, 'session_id');

    const before = await get('/api/v1/me', user.accessToken);
    expect(before.statusCode).toBe(200);

    const logout = await post('/api/v1/auth/logout', user.accessToken, {});
    expect(logout.statusCode).toBe(200);
    expect(logout.json().data).toEqual({ revoked: true });

    // The durable half of revocation: the marker must outlive the access token.
    const revoked = await ctx.pool.query<{
      session_id: string;
      user_id: string;
      revoked_at: Date;
      expires_at: Date;
    }>('SELECT session_id, user_id, revoked_at, expires_at FROM private.revoked_sessions WHERE session_id = $1', [
      sessionId,
    ]);
    expect(revoked.rowCount).toBe(1);
    const marker = revoked.rows[0]!;
    expect(marker.session_id).toBe(sessionId);
    expect(marker.user_id).toBe(user.id);
    expect(marker.expires_at.getTime()).toBeGreaterThan(marker.revoked_at.getTime());
    expect(marker.expires_at.getTime() - marker.revoked_at.getTime()).toBeGreaterThanOrEqual(
      24 * 60 * 60 * 1000,
    );

    // Two different protected routes refuse the SAME still-unexpired token.
    for (const url of ['/api/v1/me', '/api/v1/friends']) {
      const denied = await get(url, user.accessToken);
      expect(denied.statusCode, url).toBe(401);
      expect(denied.json().error.code, url).toBe('UNAUTHENTICATED');
    }

    // Revocation is per session: a fresh sign-in for the same user still works.
    const fresh = await signIn(user.email);
    expect(fresh).not.toBe(user.accessToken);
    expect(jwtClaim(fresh, 'session_id')).not.toBe(sessionId);
    const allowed = await get('/api/v1/me', fresh);
    expect(allowed.statusCode).toBe(200);
    expect(allowed.json().data.profile.id).toBe(user.id);
  });

  it('F-05-02: logout scope ALL revokes the other live sessions of the same user', async () => {
    const user = await createSessionUser('all');
    const second = await signIn(user.email);
    const firstSession = jwtClaim(user.accessToken, 'session_id');
    const secondSession = jwtClaim(second, 'session_id');
    expect(secondSession).not.toBe(firstSession);

    for (const accessToken of [user.accessToken, second]) {
      expect((await get('/api/v1/me', accessToken)).statusCode).toBe(200);
    }

    const logout = await post('/api/v1/auth/logout', user.accessToken, { scope: 'ALL' });
    expect(logout.statusCode).toBe(200);
    expect(logout.json().data).toEqual({ revoked: true });

    for (const accessToken of [user.accessToken, second]) {
      const denied = await get('/api/v1/me', accessToken);
      expect(denied.statusCode).toBe(401);
      expect(denied.json().error.code).toBe('UNAUTHENTICATED');
    }

    // The product's own activity check agrees for both sessions.
    for (const sessionId of [firstSession, secondSession]) {
      const active = await ctx.pool.query<{ active: boolean }>(
        'SELECT private.is_auth_session_active($1::uuid, $2::uuid) AS active',
        [sessionId, user.id],
      );
      expect(active.rows[0]?.active, sessionId).toBe(false);
    }

    // A brand new sign-in for the same user is still a valid, active session.
    const third = await signIn(user.email);
    expect((await get('/api/v1/me', third)).statusCode).toBe(200);
  });

  it('F-05-03: a token with a tampered signature is rejected while the real one works', async () => {
    const user = await createSessionUser('sig');
    const [header, payload, signature] = user.accessToken.split('.');
    const firstSignatureChar = signature![0]!;
    const tampered = `${header}.${payload}.${firstSignatureChar === 'A' ? 'B' : 'A'}${signature!.slice(1)}`;
    expect(tampered).not.toBe(user.accessToken);

    const control = await get('/api/v1/me', user.accessToken);
    expect(control.statusCode).toBe(200);

    const denied = await get('/api/v1/me', tampered);
    expect(denied.statusCode).toBe(401);
    expect(denied.json().error.code).toBe('UNAUTHENTICATED');
  });

  it('F-05-04: /health stays public and 200 without a token', async () => {
    const bare = await ctx.app.inject({ method: 'GET', url: '/health' });
    expect(bare.statusCode).toBe(200);
    expect(bare.json()).toEqual({ status: 'ok' });

    const garbage = await get('/health', 'not-a-jwt');
    expect(garbage.statusCode).toBe(200);
  });
});
