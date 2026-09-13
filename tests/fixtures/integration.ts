/**
 * Integration test fixtures and helpers (spec 08, rows ISSUE-001 / ISSUE-006).
 *
 * Two consumer groups share this module:
 *  - unit tests import `MockPgClient` / `MockPgPool` only; importing this file has
 *    no side effects and no bare runtime dependency on app packages;
 *  - the integration lane (`vitest.integration.config.ts`) uses `createTestContext()`
 *    against the LOCAL Supabase stack (Postgres + GoTrue Auth), never the cloud
 *    project: `resolveTestEnv()` refuses any non-loopback target.
 *
 * Roles: `pool` is `app_server` (the RLS-scoped product role) and `adminPool` is an
 * elevated `service_role` session (BYPASSRLS) used for seeding, cleanup and RLS
 * assertions. Every app table is `FORCE ROW LEVEL SECURITY` with policies addressed
 * to `app_server`, so even the `postgres` owner cannot seed or delete rows.
 */
import crypto from 'node:crypto';
import path from 'node:path';
import type pg from 'pg';
import type { FastifyInstance } from 'fastify';

/* ------------------------------------------------------------------ mocks --- */

export interface TestApp {
  close: () => Promise<void>;
}

/** Mock pg client for unit testing transaction behavior without live DB */
export class MockPgClient {
  public queries: string[] = [];
  public released = false;

  async query(sql: string): Promise<{ rows: unknown[]; rowCount: number }> {
    this.queries.push(sql);
    return { rows: [], rowCount: 0 };
  }

  release(): void {
    this.released = true;
  }
}

/** Mock pg Pool that returns MockPgClient */
export class MockPgPool {
  public client = new MockPgClient();
  public ended = false;

  async connect(): Promise<pg.PoolClient> {
    return this.client as unknown as pg.PoolClient;
  }

  async end(): Promise<void> {
    this.ended = true;
  }
}

/* ------------------------------------------------------------ environment --- */

/** Marker set by `vitest.integration.config.ts`; only that lane may touch the DB. */
export const INTEGRATION_LANE_ENV = 'XIANGQI_INTEGRATION_LANE';

const LOOPBACK_HOSTS: Record<string, true> = {
  '127.0.0.1': true,
  localhost: true,
  '::1': true,
};
const REQUIRED_ENV_VARS = [
  'DATABASE_URL',
  'SUPABASE_URL',
  'SUPABASE_PUBLISHABLE_KEY',
  'SUPABASE_SECRET_KEY',
] as const;

export interface LocalTestEnv {
  databaseUrl: string;
  supabaseUrl: string;
  supabasePublishableKey: string;
  supabaseSecretKey: string;
  appOrigin: string;
  inviteHmacKey: string;
}

/**
 * Load `.env.test` (preferred) then `.env`.
 * `process.loadEnvFile` never overrides an already-set variable, so `.env.test`
 * wins over `.env`, and an explicit shell value wins over both.
 */
export function loadTestEnvFiles(rootDir: string = process.cwd()): void {
  for (const file of ['.env.test', '.env']) {
    try {
      process.loadEnvFile(path.join(rootDir, file));
    } catch {
      // File absent: fall through to the next candidate.
    }
  }
}

/** Refuse any non-loopback target so tests can never write to the cloud project. */
export function assertLoopbackTarget(label: string, rawUrl: string): URL {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    throw new Error(
      `[integration harness] REFUSING to run: ${label} is not a valid connection URL.`,
    );
  }
  const host = url.hostname.toLowerCase().replace(/^\[|\]$/g, '');
  if (!LOOPBACK_HOSTS[host]) {
    throw new Error(
      `[integration harness] REFUSING to run: ${label} points at host "${host}", ` +
        'which is not loopback (127.0.0.1 / localhost / ::1). Integration tests must ' +
        'never touch the Supabase cloud project. Point it at the local stack ' +
        '(postgresql://postgres:postgres@127.0.0.1:54322/postgres, http://127.0.0.1:54321).',
    );
  }
  return url;
}

/**
 * Local role the harness runs its seeding/cleanup/role-switching session as.
 * `service_role` is the local stack's BYPASSRLS admin role: every table is
 * `FORCE ROW LEVEL SECURITY` with policies addressed to `app_server` only, so the
 * `postgres` connection (the table owner) can neither seed nor delete rows.
 * `service_role` can still `SET LOCAL ROLE anon|authenticated` for RLS assertions.
 */
export const ADMIN_SESSION_ROLE = 'service_role';

/**
 * Set once: `createTestContext()` rewrites `process.env.DATABASE_URL` to the
 * `app_server` DSN for the app under test, so later contexts still need the
 * untouched admin DSN cached here.
 */
let resolvedEnv: LocalTestEnv | null = null;

/** Resolve and validate the local-stack environment; throws naming every missing variable. */
export function resolveTestEnv(): LocalTestEnv {
  if (resolvedEnv) return resolvedEnv;

  loadTestEnvFiles();

  const missing = REQUIRED_ENV_VARS.filter((name) => !process.env[name]);
  if (missing.length > 0) {
    throw new Error(
      `[integration harness] Missing required environment variable(s): ${missing.join(', ')}. ` +
        'Copy .env.test.example to .env.test (gitignored) and point it at the LOCAL ' +
        'Supabase stack, then run `supabase start`.',
    );
  }

  const databaseUrl = process.env['DATABASE_URL']!;
  const supabaseUrl = process.env['SUPABASE_URL']!;
  assertLoopbackTarget('DATABASE_URL', databaseUrl);
  assertLoopbackTarget('SUPABASE_URL', supabaseUrl);

  resolvedEnv = {
    databaseUrl,
    supabaseUrl,
    supabasePublishableKey: process.env['SUPABASE_PUBLISHABLE_KEY']!,
    supabaseSecretKey: process.env['SUPABASE_SECRET_KEY']!,
    appOrigin: process.env['APP_ORIGIN'] ?? 'http://127.0.0.1:5173',
    inviteHmacKey: process.env['INVITE_HMAC_KEY'] ?? 'local-integration-invite-hmac-key',
  };
  return resolvedEnv;
}

/* ------------------------------------------------------------- auth users --- */

export const TEST_USER_KEYS = ['A', 'B', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6'] as const;
export type TestUserKey = (typeof TEST_USER_KEYS)[number];

export interface TestUser {
  key: TestUserKey;
  id: string;
  username: string;
  email: string;
  password: string;
  accessToken: string;
}

export interface TestContext {
  runId: string;
  app: FastifyInstance;
  /** Application role `app_server` (RLS-scoped) — the role the product server uses. */
  pool: pg.Pool;
  /**
   * Elevated admin session (`service_role`, BYPASSRLS) for seeding, `resetTestData` and
   * `SET LOCAL ROLE anon|authenticated` during RLS assertions. Product writes should go
   * through `pool` so they pass the same policies the server does.
   */
  adminPool: pg.Pool;
  users: Record<TestUserKey, TestUser>;
  authAs(key: TestUserKey): { authorization: string };
  /** Idempotent; safe to call from `finally` even after an assertion failure. */
  dispose(): Promise<void>;
}

const TEST_USER_PASSWORD = 'LocalTest12345';
/** Local-only credential so `app_server` (LOGIN, no password) can connect over TCP. */
const DEFAULT_APP_SERVER_PASSWORD = 'xiangqi-local-app-server';
const APP_SERVER_ROLE = 'app_server';

export function makeRunId(): string {
  return `r${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}`;
}

/** Key the harness looks for so phone-only test users are still cleaned up by runId. */
const RUN_ID_METADATA_KEY = 'test_run_id';

export interface AuthUserInput {
  /** Email signup. Must embed the run id so `resetTestData` finds the row again. */
  email?: string;
  /**
   * Phone signup: the local trigger leaves `profiles.username` NULL for non-email
   * providers, which is the only way to reach the `profiles_username_unique` index
   * (usernames are immutable once set). Pass `metadata.test_run_id` for cleanup.
   */
  phone?: string;
  /** Required for email signups: `handle_new_user` rejects blank `signup_username`. */
  username?: string;
  displayName?: string;
  password?: string;
  metadata?: Record<string, string>;
}

async function adminCreateUser(env: LocalTestEnv, input: AuthUserInput): Promise<string> {
  if (!input.email && !input.phone) {
    throw new Error('[integration harness] createAuthUser needs an email or a phone');
  }
  if (input.email && !input.username) {
    throw new Error(
      `[integration harness] email signup ${input.email} needs a username (handle_new_user requires signup_username)`,
    );
  }

  const response = await fetch(`${env.supabaseUrl}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      apikey: env.supabaseSecretKey,
      Authorization: `Bearer ${env.supabaseSecretKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: input.email,
      phone: input.phone,
      password: input.password ?? TEST_USER_PASSWORD,
      email_confirm: Boolean(input.email),
      phone_confirm: Boolean(input.phone),
      user_metadata: {
        ...input.metadata,
        signup_username: input.username,
        signup_display_name: input.displayName ?? 'Integration User',
      },
    }),
  });
  const body = (await response.json().catch(() => null)) as { id?: string } | null;
  if (!response.ok || !body?.id) {
    throw new Error(
      `[integration harness] Supabase Admin createUser failed (${response.status}) for ${input.email ?? input.phone}`,
    );
  }
  return body.id;
}

async function passwordSignIn(env: LocalTestEnv, email: string, password: string): Promise<string> {
  const response = await fetch(`${env.supabaseUrl}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { apikey: env.supabasePublishableKey, 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  const body = (await response.json().catch(() => null)) as { access_token?: string } | null;
  if (!response.ok || !body?.access_token) {
    throw new Error(
      `[integration harness] Supabase password sign-in failed (${response.status}) for ${email}`,
    );
  }
  return body.access_token;
}

/**
 * Create one real Supabase Auth user (Admin API) and, for email signups, sign it in
 * with the password grant to obtain a real access token.
 */
export async function createAuthUser(
  input: AuthUserInput,
): Promise<{ id: string; email: string | null; password: string; accessToken: string | null }> {
  const env = resolveTestEnv();
  const password = input.password ?? TEST_USER_PASSWORD;
  const id = await adminCreateUser(env, { ...input, password });
  const accessToken = input.email ? await passwordSignIn(env, input.email, password) : null;
  return { id, email: input.email ?? null, password, accessToken };
}

/**
 * Seed the eight fixture identities (A, B, S1..S6) as REAL Supabase Auth users.
 * The `on_auth_user_created` trigger must create their `public.profiles` rows,
 * which is verified here rather than assumed.
 */
export async function seedUsers(
  runId: string,
  adminPool: pg.Pool,
): Promise<Record<TestUserKey, TestUser>> {
  const users = {} as Record<TestUserKey, TestUser>;

  for (const key of TEST_USER_KEYS) {
    const username = `xq_${key.toLowerCase()}_${runId}`;
    const email = `${username}@local.test`;
    const created = await createAuthUser({
      email,
      username,
      displayName: `Test ${key}`,
    });
    if (!created.accessToken) {
      throw new Error(`[integration harness] no access token for seeded user ${key}`);
    }
    users[key] = {
      key,
      id: created.id,
      username,
      email,
      password: created.password,
      accessToken: created.accessToken,
    };
  }

  const { rows } = await adminPool.query<{ user_id: string; username: string | null }>(
    'SELECT user_id, username FROM public.profiles WHERE user_id = ANY($1::uuid[])',
    [Object.values(users).map((user) => user.id)],
  );
  if (rows.length !== TEST_USER_KEYS.length) {
    throw new Error(
      `[integration harness] on_auth_user_created created ${rows.length}/${TEST_USER_KEYS.length} profiles rows`,
    );
  }
  for (const user of Object.values(users)) {
    const profile = rows.find((row) => row.user_id === user.id);
    if (!profile || profile.username !== user.username) {
      throw new Error(
        `[integration harness] profile username for ${user.key} is ${String(profile?.username)}, expected ${user.username}`,
      );
    }
  }

  return users;
}

/**
 * Ids of the Auth users that belong to `runId`: the email carries the run id, or the
 * user metadata does (phone-only test users have no email).
 * Uses the Admin API: the `auth` schema is not readable by the `postgres` role.
 */
export async function findAuthUserIds(runId: string): Promise<string[]> {
  const env = resolveTestEnv();
  const ids: string[] = [];
  let page = 1;

  for (;;) {
    const response = await fetch(
      `${env.supabaseUrl}/auth/v1/admin/users?page=${page}&per_page=200`,
      {
        headers: {
          apikey: env.supabaseSecretKey,
          Authorization: `Bearer ${env.supabaseSecretKey}`,
        },
      },
    );
    if (!response.ok) {
      throw new Error(`[integration harness] Supabase Admin listUsers failed (${response.status})`);
    }
    const body = (await response.json()) as {
      users?: { id: string; email?: string | null; user_metadata?: Record<string, unknown> }[];
      nextPage?: number | null;
    };
    const pageUsers = body.users ?? [];
    for (const user of pageUsers) {
      const metadataRunId = user.user_metadata?.[RUN_ID_METADATA_KEY];
      if (user.email?.includes(runId) || metadataRunId === runId) ids.push(user.id);
    }
    if (!body.nextPage || pageUsers.length === 0) break;
    page = body.nextPage;
  }

  return ids;
}

/** Delete the run's rows in FK-safe order (children first); never truncates. */
export async function resetTestData(runId: string, adminPool: pg.Pool): Promise<void> {
  const env = resolveTestEnv();
  const userIds = await findAuthUserIds(runId);

  if (userIds.length > 0) {
    // `private.revoked_sessions` is out of service_role's reach (schema `private` is revoked
    // from it), and its FK to profiles is RESTRICT, so the owner connection runs that one
    // delete first.
    const pgModule = await loadPg();
    const owner = new pgModule.Client({ connectionString: env.databaseUrl });
    await owner.connect();
    try {
      await owner.query('DELETE FROM private.revoked_sessions WHERE user_id = ANY($1::uuid[])', [
        userIds,
      ]);
    } finally {
      await owner.end();
    }
  }

  const client = await adminPool.connect();

  try {
    await client.query('BEGIN');
    try {
      // `rooms.current_match_id` and the matches/rooms cycle are DEFERRABLE.
      await client.query('SET CONSTRAINTS ALL DEFERRED');

      if (userIds.length > 0) {
        const matches = await client.query<{ id: string; room_id: string | null }>(
          'SELECT id, room_id FROM public.matches WHERE red_user_id = ANY($1::uuid[]) OR black_user_id = ANY($1::uuid[])',
          [userIds],
        );
        const matchIds = matches.rows.map((row) => row.id);

        const rooms = await client.query<{ id: string }>(
          'SELECT id FROM public.rooms WHERE owner_id = ANY($1::uuid[])',
          [userIds],
        );
        const roomIds = new Set(rooms.rows.map((row) => row.id));
        for (const match of matches.rows) {
          if (match.room_id) roomIds.add(match.room_id);
        }

        const deletes: Array<[string, unknown[]]> = [
          ['DELETE FROM public.command_receipts WHERE match_id = ANY($1::uuid[])', [matchIds]],
          ['DELETE FROM public.match_moves WHERE match_id = ANY($1::uuid[])', [matchIds]],
          ['DELETE FROM public.match_events WHERE match_id = ANY($1::uuid[])', [matchIds]],
          [
            'DELETE FROM public.moves WHERE match_id = ANY($1::uuid[]) OR player_id = ANY($2::uuid[])',
            [matchIds, userIds],
          ],
          ['DELETE FROM public.media_policy_jobs WHERE match_id = ANY($1::uuid[])', [matchIds]],
          ['DELETE FROM public.media_policies WHERE match_id = ANY($1::uuid[])', [matchIds]],
          ['DELETE FROM public.media_transports WHERE match_id = ANY($1::uuid[])', [matchIds]],
          ['DELETE FROM public.ai_jobs WHERE match_id = ANY($1::uuid[])', [matchIds]],
          [
            'DELETE FROM public.chat_messages WHERE room_id = ANY($1::uuid[]) OR match_id = ANY($2::uuid[]) OR sender_id = ANY($3::uuid[])',
            [[...roomIds], matchIds, userIds],
          ],
          [
            'DELETE FROM public.active_players WHERE match_id = ANY($1::uuid[]) OR user_id = ANY($2::uuid[])',
            [matchIds, userIds],
          ],
          [
            'DELETE FROM public.client_controls WHERE match_id = ANY($1::uuid[]) OR user_id = ANY($2::uuid[])',
            [matchIds, userIds],
          ],
          [
            'DELETE FROM public.room_rematch_votes WHERE room_id = ANY($1::uuid[]) OR match_id = ANY($2::uuid[]) OR user_id = ANY($3::uuid[])',
            [[...roomIds], matchIds, userIds],
          ],
          [
            'DELETE FROM public.room_command_receipts WHERE room_id = ANY($1::uuid[]) OR actor_id = ANY($2::uuid[]) OR expected_match_id = ANY($3::uuid[]) OR new_match_id = ANY($3::uuid[])',
            [[...roomIds], userIds, matchIds],
          ],
          ['DELETE FROM public.matches WHERE id = ANY($1::uuid[])', [matchIds]],
          [
            'DELETE FROM public.invitations WHERE room_id = ANY($1::uuid[]) OR sender_id = ANY($2::uuid[]) OR recipient_id = ANY($2::uuid[]) OR consumed_by = ANY($2::uuid[])',
            [[...roomIds], userIds],
          ],
          [
            'DELETE FROM public.room_members WHERE room_id = ANY($1::uuid[]) OR user_id = ANY($2::uuid[])',
            [[...roomIds], userIds],
          ],
          ['DELETE FROM public.rooms WHERE id = ANY($1::uuid[])', [[...roomIds]]],
          [
            'DELETE FROM public.friend_relations WHERE user_low = ANY($1::uuid[]) OR user_high = ANY($1::uuid[]) OR requester_id = ANY($1::uuid[])',
            [userIds],
          ],
          ['DELETE FROM public.profiles WHERE user_id = ANY($1::uuid[])', [userIds]],
        ];

        for (const [sql, params] of deletes) {
          await client.query(sql, params);
        }
      }

      await client.query('COMMIT');
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
  } finally {
    client.release();
  }

  // Auth users go last, through the Admin API, and only reachable after profiles are gone.
  for (const userId of userIds) {
    const response = await fetch(`${env.supabaseUrl}/auth/v1/admin/users/${userId}`, {
      method: 'DELETE',
      headers: {
        apikey: env.supabaseSecretKey,
        Authorization: `Bearer ${env.supabaseSecretKey}`,
      },
    });
    if (!response.ok && response.status !== 404) {
      throw new Error(
        `[integration harness] Supabase Admin deleteUser failed (${response.status}) for ${userId}`,
      );
    }
  }
}

/* ---------------------------------------------------------- test contexts --- */

function buildAppServerUrl(databaseUrl: string, password: string): string {
  const url = new URL(databaseUrl);
  url.username = APP_SERVER_ROLE;
  url.password = password;
  return url.toString();
}

async function loadPg(): Promise<typeof pg> {
  // Dynamic on purpose: `pg` is an apps/server dependency, so a static import would
  // make this fixture – which unit tests import for the mocks – unresolvable outside
  // the integration lane (that lane aliases `pg` in vitest.integration.config.ts).
  const module = (await import('pg')) as unknown as { default?: typeof pg } & typeof pg;
  const pgModule = module.default ?? module;
  if (!pgModule.Pool || !pgModule.Client) {
    throw new Error('[integration harness] could not load the `pg` client constructors');
  }
  return pgModule;
}

export async function createTestContext(opts: { seed?: boolean } = {}): Promise<TestContext> {
  const env = resolveTestEnv();
  const pgModule = await loadPg();
  const runId = makeRunId();
  const password = process.env['TEST_APP_SERVER_PASSWORD'] ?? DEFAULT_APP_SERVER_PASSWORD;

  // `app_server` has LOGIN but no password: give it a local-only one (idempotent) so the
  // app pool can connect over TCP as the RLS-scoped role. Needs the owner connection.
  const setupClient = new pgModule.Client({ connectionString: env.databaseUrl });
  try {
    await setupClient.connect();
    await setupClient.query(
      `ALTER ROLE ${APP_SERVER_ROLE} PASSWORD '${password.replace(/'/g, "''")}'`,
    );
  } catch (error) {
    const target = new URL(env.databaseUrl);
    throw new Error(
      `[integration harness] cannot prepare the LOCAL database at ${target.hostname}:${target.port || '5432'} ` +
        `(${error instanceof Error ? error.message : String(error)}). Is \`supabase start\` running?`,
      { cause: error },
    );
  } finally {
    await setupClient.end().catch(() => undefined);
  }

  // Seeding/cleanup/RLS session: BYPASSRLS, because every table is FORCE RLS with
  // policies addressed to `app_server` only (the postgres owner is subject to them).
  const adminPool = new pgModule.Pool({
    connectionString: env.databaseUrl,
    options: `-c role=${ADMIN_SESSION_ROLE}`,
    max: 4,
  });

  const appServerUrl = buildAppServerUrl(env.databaseUrl, password);
  const pool = new pgModule.Pool({ connectionString: appServerUrl, max: 5 });

  // Pinned before the app is constructed: the BFF reads env at handler time.
  process.env['DATABASE_URL'] = appServerUrl;
  process.env['APP_ORIGIN'] = env.appOrigin;
  process.env['INVITE_HMAC_KEY'] = env.inviteHmacKey;
  process.env['SUPABASE_URL'] = env.supabaseUrl;
  process.env['SUPABASE_PUBLISHABLE_KEY'] = env.supabasePublishableKey;
  process.env['SUPABASE_SECRET_KEY'] = env.supabaseSecretKey;

  // Dynamic on purpose: the app reads env in its handlers, and the contract is that
  // the local-stack variables below are pinned before the app module is loaded.
  const [{ createApp }, { closePool }] = await Promise.all([
    import('../../apps/server/src/app.js'),
    import('../../apps/server/src/db/pool.js'),
  ]);
  await closePool(); // drop a pool built from a previous connection string
  const app = await createApp();

  const users =
    opts.seed === false
      ? ({} as Record<TestUserKey, TestUser>)
      : await seedUsers(runId, adminPool);

  let disposed = false;
  const dispose = async (): Promise<void> => {
    if (disposed) return;
    disposed = true;
    // The pools are released even if closing the app throws.
    try {
      await app.close();
    } finally {
      await closePool();
      await pool.end();
      await adminPool.end();
    }
  };

  return {
    runId,
    app,
    pool,
    adminPool,
    users,
    authAs(key: TestUserKey) {
      const user = users[key];
      if (!user) {
        throw new Error(`[integration harness] no seeded user ${key} in run ${runId}`);
      }
      return { authorization: `Bearer ${user.accessToken}` };
    },
    dispose,
  };
}

/** Run `fn` against a fresh context; the context is disposed even when `fn` throws. */
export async function withTestContext(
  fn: (ctx: TestContext) => Promise<void>,
): Promise<void> {
  const ctx = await createTestContext();
  try {
    await fn(ctx);
  } finally {
    await ctx.dispose();
  }
}
