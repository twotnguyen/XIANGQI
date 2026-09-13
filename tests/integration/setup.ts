/**
 * Integration lane setup — `setupFiles` of `vitest.integration.config.ts`.
 *
 * Runs before every integration test file and refuses to start when the lane is
 * misconfigured: missing variables are named one by one, and a non-loopback target
 * aborts the run so the lane can never point at the Supabase cloud project
 * (spec 08 ISSUE-006; findings F-11/F-12).
 */
import {
  INTEGRATION_LANE_ENV,
  assertLoopbackTarget,
  loadTestEnvFiles,
  resolveTestEnv,
} from '../fixtures/integration.js';

loadTestEnvFiles();

// The lane marker is set by vitest.integration.config.ts. Without it the DB suites
// would silently report as skipped, which is exactly the failure mode F-11 named.
if (process.env[INTEGRATION_LANE_ENV] !== '1') {
  throw new Error(
    `[integration harness] REFUSING to run: ${INTEGRATION_LANE_ENV} is not set. ` +
      'Run the lane through `pnpm test:integration` / `pnpm test:media` ' +
      '(vitest.integration.config.ts) instead of another vitest config.',
  );
}

const env = resolveTestEnv();
assertLoopbackTarget('DATABASE_URL', env.databaseUrl);
assertLoopbackTarget('SUPABASE_URL', env.supabaseUrl);

const database = new URL(env.databaseUrl);
console.log(
  `[integration harness] LOCAL stack only — db ${database.hostname}:${database.port || '5432'}, ` +
    `auth ${new URL(env.supabaseUrl).origin}`,
);
