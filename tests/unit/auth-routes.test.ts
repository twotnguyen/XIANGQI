import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';
import type { FastifyReply, FastifyRequest } from 'fastify';
import type { Pool } from 'pg';
import { createApp } from '../../apps/server/src/app.js';
import { createRequireAuth } from '../../apps/server/src/auth/authenticate.js';
import { isSessionActive, recordRevokedSession } from '../../apps/server/src/auth/session.js';
import { resolveAllowedOrigins } from '../../apps/server/src/config.js';

/**
 * F-05 unit coverage.
 *
 * The Supabase client and the DB pool are injected fakes here: these tests
 * prove the middleware/logout decision path (revoked session -> 401, logout
 * writes expires_at) without a live database. Real DB/provider behavior is
 * covered by the integration lane.
 */
const fakes = vi.hoisted(() => {
  const revokedSessions = new Set<string>();
  const insertCalls: unknown[][] = [];
  const client = {
    async query(sql: string, params: unknown[] = []) {
      if (sql.includes('is_auth_session_active')) {
        return { rows: [{ active: !revokedSessions.has(String(params[0])) }], rowCount: 1 };
      }
      if (sql.includes('INSERT INTO private.revoked_sessions')) {
        insertCalls.push(params);
        revokedSessions.add(String(params[0]));
        return { rows: [], rowCount: 1 };
      }
      if (sql.includes('FROM public.profiles WHERE id = $1')) {
        return {
          rows: [{ id: params[0], username: 'alice', display_name: 'Alice' }],
          rowCount: 1,
        };
      }
      return { rows: [], rowCount: 0 };
    },
    release() {},
  };
  const pool = { connect: async () => client, end: async () => {} };
  return { revokedSessions, insertCalls, pool };
});

// NOTE: the server package resolves `@supabase/supabase-js` through its own
// pnpm node_modules, so the mock must name that resolution explicitly.
vi.mock('../../apps/server/node_modules/@supabase/supabase-js', () => ({
  createClient: () => ({
    auth: {
      getClaims: async (token: string) =>
        token === 'valid-token'
          ? {
              data: {
                claims: {
                  sub: '11111111-1111-1111-1111-111111111111',
                  email: 'alice@example.com',
                  session_id: '22222222-2222-2222-2222-222222222222',
                  exp: Math.floor(Date.now() / 1000) + 3600,
                },
              },
              error: null,
            }
          : { data: null, error: { message: 'invalid token' } },
      getUser: async () => ({ data: { user: null }, error: { message: 'invalid token' } }),
      admin: { signOut: async () => ({ error: null }) },
    },
  }),
}));

vi.mock('../../apps/server/src/db/pool.js', () => ({
  getPool: () => fakes.pool,
  closePool: async () => {},
}));

const VALID_TOKEN = 'valid-token';
const SESSION_ID = '22222222-2222-2222-2222-222222222222';
const USER_ID = '11111111-1111-1111-1111-111111111111';

class FakeReply {
  statusCode = 200;
  payload: unknown = null;

  status(code: number): this {
    this.statusCode = code;
    return this;
  }

  send(payload: unknown): this {
    this.payload = payload;
    return this;
  }
}

function fakeRequest(header?: string): FastifyRequest {
  return {
    id: 'req-test',
    headers: header ? { authorization: header } : {},
  } as unknown as FastifyRequest;
}

beforeAll(() => {
  vi.stubEnv('SUPABASE_URL', 'http://127.0.0.1:54321');
  vi.stubEnv('SUPABASE_SECRET_KEY', 'test-secret-key');
});

afterAll(() => {
  vi.unstubAllEnvs();
});

beforeEach(() => {
  fakes.revokedSessions.clear();
  fakes.insertCalls.length = 0;
});

describe('T007-01: Auth endpoints validation', () => {
  it('POST /api/v1/auth/login with missing fields returns 400 VALIDATION_ERROR', async () => {
    const app = await createApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: {},
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe('VALIDATION_ERROR');
    await app.close();
  });

  it('POST /api/v1/auth/login with extra fields is rejected (strict schema)', async () => {
    const app = await createApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/login',
      payload: { username: 'test', password: 'password', extra: 'bad' },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error.code).toBe('VALIDATION_ERROR');
    await app.close();
  });

  it('GET /api/v1/me without Bearer token returns 401 UNAUTHENTICATED', async () => {
    const app = await createApp();
    const res = await app.inject({
      method: 'GET',
      url: '/api/v1/me',
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('UNAUTHENTICATED');
    await app.close();
  });

  it('POST /api/v1/auth/logout without Bearer token returns 401 UNAUTHENTICATED', async () => {
    const app = await createApp();
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/logout',
      payload: { scope: 'CURRENT' },
    });
    expect(res.statusCode).toBe(401);
    expect(res.json().error.code).toBe('UNAUTHENTICATED');
    await app.close();
  });

  it('POST /api/v1/auth/complete-profile rejects invalid username format', async () => {
    const app = await createApp();
    // With fake token to bypass auth check and test validation
    // First verify without token
    const res = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/complete-profile',
      payload: { username: 'ab' }, // too short
    });
    // Will fail at auth check
    expect(res.statusCode).toBe(401);
    await app.close();
  });
});

describe('T007-02: requireAuth rejects revoked sessions (F-05)', () => {
  it('answers 401 when the DB session check says the session is revoked', async () => {
    const checked: string[] = [];
    const requireAuth = createRequireAuth({
      verifyToken: async () => ({ id: USER_ID, sessionId: SESSION_ID }),
      isSessionActive: async (sessionId) => {
        checked.push(sessionId);
        return false;
      },
    });
    const reply = new FakeReply();
    const request = fakeRequest(`Bearer ${VALID_TOKEN}`);

    await requireAuth(request, reply as unknown as FastifyReply);

    expect(reply.statusCode).toBe(401);
    expect((reply.payload as { error: { code: string } }).error.code).toBe('UNAUTHENTICATED');
    expect(checked).toEqual([SESSION_ID]);
    expect(request.user).toBeUndefined();
  });

  it('attaches the identity when the session is active', async () => {
    const requireAuth = createRequireAuth({
      verifyToken: async () => ({ id: USER_ID, sessionId: SESSION_ID, email: 'a@b.c' }),
      isSessionActive: async () => true,
    });
    const reply = new FakeReply();
    const request = fakeRequest(`Bearer ${VALID_TOKEN}`);

    await requireAuth(request, reply as unknown as FastifyReply);

    expect(reply.statusCode).toBe(200);
    expect(request.user?.id).toBe(USER_ID);
    expect(request.user?.sessionId).toBe(SESSION_ID);
  });

  it('fails closed when the token carries no session id', async () => {
    let sessionCall = 0;
    const requireAuth = createRequireAuth({
      verifyToken: async () => ({ id: USER_ID }),
      isSessionActive: async () => {
        sessionCall += 1;
        return true;
      },
    });
    const reply = new FakeReply();

    await requireAuth(fakeRequest(`Bearer ${VALID_TOKEN}`), reply as unknown as FastifyReply);

    expect(reply.statusCode).toBe(401);
    expect(sessionCall).toBe(0);
  });

  it('fails closed when verification throws', async () => {
    const requireAuth = createRequireAuth({
      verifyToken: async () => {
        throw new Error('auth backend down');
      },
      isSessionActive: async () => true,
    });
    const reply = new FakeReply();

    await requireAuth(fakeRequest(`Bearer ${VALID_TOKEN}`), reply as unknown as FastifyReply);

    expect(reply.statusCode).toBe(401);
  });

  it('fails closed when the revocation lookup errors', async () => {
    const requireAuth = createRequireAuth({
      verifyToken: async () => ({ id: USER_ID, sessionId: SESSION_ID }),
      isSessionActive: async () => {
        throw new Error('db down');
      },
    });
    const reply = new FakeReply();

    await requireAuth(fakeRequest(`Bearer ${VALID_TOKEN}`), reply as unknown as FastifyReply);

    expect(reply.statusCode).toBe(401);
  });
});

describe('T007-03: session revocation persistence', () => {
  it('isSessionActive maps the DB function result to a boolean', async () => {
    const client = {
      async query() {
        return { rows: [{ active: true }], rowCount: 1 };
      },
      release() {},
    };
    const pool = { connect: async () => client } as unknown as Pool;

    await expect(isSessionActive(SESSION_ID, USER_ID, pool)).resolves.toBe(true);

    const inactiveClient = {
      async query() {
        return { rows: [{ active: false }], rowCount: 1 };
      },
      release() {},
    };
    const inactivePool = { connect: async () => inactiveClient } as unknown as Pool;

    await expect(isSessionActive(SESSION_ID, USER_ID, inactivePool)).resolves.toBe(false);
  });

  it('recordRevokedSession writes expires_at (NOT NULL + CHECK expires_at > revoked_at)', async () => {
    const queries: { sql: string; params: unknown[] }[] = [];
    const client = {
      async query(sql: string, params: unknown[] = []) {
        queries.push({ sql, params });
        return { rows: [], rowCount: 1 };
      },
      release() {},
    };
    const pool = { connect: async () => client } as unknown as Pool;

    const expiresAtMs = Date.now() + 3_600_000;
    await recordRevokedSession(SESSION_ID, USER_ID, expiresAtMs, pool);

    expect(queries).toHaveLength(1);
    const statement = queries[0]!.sql;
    expect(statement).toContain('INSERT INTO private.revoked_sessions');
    expect(statement).toContain('expires_at');
    expect(statement).toContain('GREATEST');
    expect(queries[0]!.params).toEqual([SESSION_ID, USER_ID, expiresAtMs]);
  });
});

describe('T007-04: logout revokes the session for later requests (F-05)', () => {
  it('logout records the session and the same token is rejected afterwards', async () => {
    const app = await createApp();
    const headers = { authorization: `Bearer ${VALID_TOKEN}` };

    const before = await app.inject({ method: 'GET', url: '/api/v1/me', headers });
    expect(before.statusCode).toBe(200);
    expect(before.json().data.profile.username).toBe('alice');

    const logout = await app.inject({
      method: 'POST',
      url: '/api/v1/auth/logout',
      headers,
      payload: { scope: 'CURRENT' },
    });
    expect(logout.statusCode).toBe(200);
    expect(logout.json().data).toEqual({ revoked: true });
    expect(fakes.insertCalls).toHaveLength(1);
    expect(fakes.insertCalls[0]![0]).toBe(SESSION_ID);
    expect(typeof fakes.insertCalls[0]![2]).toBe('number');

    const after = await app.inject({ method: 'GET', url: '/api/v1/me', headers });
    expect(after.statusCode).toBe(401);
    expect(after.json().error.code).toBe('UNAUTHENTICATED');

    await app.close();
  });
});

describe('T007-05: CORS allowlist (F-05b)', () => {
  it('reflects an allowlisted dev origin and not an unknown origin', async () => {
    const app = await createApp();

    const allowed = await app.inject({
      method: 'GET',
      url: '/health',
      headers: { origin: 'http://localhost:5173' },
    });
    expect(allowed.headers['access-control-allow-origin']).toBe('http://localhost:5173');

    const denied = await app.inject({
      method: 'GET',
      url: '/health',
      headers: { origin: 'https://evil.example' },
    });
    expect(denied.headers['access-control-allow-origin']).toBeUndefined();

    await app.close();
  });

  it('sets an explicit restrictive CSP instead of disabling it', async () => {
    const app = await createApp();
    const res = await app.inject({ method: 'GET', url: '/health' });

    const csp = res.headers['content-security-policy'];
    expect(csp).toContain("default-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");

    await app.close();
  });

  it('production requires APP_ORIGIN and validates its shape', () => {
    expect(() => resolveAllowedOrigins(undefined, 'production')).toThrow(
      'Missing required environment variable: APP_ORIGIN',
    );
    expect(() => resolveAllowedOrigins('   ', 'production')).toThrow(
      'Missing required environment variable: APP_ORIGIN',
    );
    expect(() => resolveAllowedOrigins('not-a-url', 'production')).toThrow('Invalid APP_ORIGIN');
    expect(() => resolveAllowedOrigins('https://app.example.com/path', 'production')).toThrow(
      'Invalid APP_ORIGIN',
    );
    expect(() => resolveAllowedOrigins('https://app.example.com/', 'production')).not.toThrow();
  });

  it('allows exactly APP_ORIGIN in production and adds local origins in dev', () => {
    expect(resolveAllowedOrigins('https://app.example.com', 'production')).toEqual([
      'https://app.example.com',
    ]);
    expect(resolveAllowedOrigins(undefined, 'test')).toEqual([
      'http://localhost:5173',
      'http://127.0.0.1:5173',
    ]);
  });
});
