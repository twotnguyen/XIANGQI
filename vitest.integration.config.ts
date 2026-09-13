import { defineConfig } from 'vitest/config';
import { createRequire } from 'node:module';
import path from 'path';
import { INTEGRATION_LANE_ENV } from './tests/fixtures/integration.js';

// `pg` is an apps/server dependency, not a root one, while the test harness in tests/
// builds its own pools: resolve the driver from the app that owns it.
const appRequire = createRequire(path.resolve(__dirname, 'apps/server/package.json'));
const pgPackageDir = path.dirname(appRequire.resolve('pg/package.json'));
const webRequire = createRequire(path.resolve(__dirname, 'apps/web/package.json'));
const socketIoClientPath = webRequire.resolve('socket.io-client');

export default defineConfig({
  test: {
    // Everything that talks to a real service: DB/Auth integration and the media spike.
    include: ['tests/integration/**/*.test.ts', 'tests/media/**/*.ts', 'tests/load/**/*.test.ts'],
    // Fails loud (missing vars, non-loopback host) before any test runs.
    setupFiles: ['./tests/integration/setup.ts'],
    // Lets the DB suites distinguish this lane from the unit lane, which also globs
    // tests/integration/**; setup.ts refuses to run when it is missing.
    env: { [INTEGRATION_LANE_ENV]: '1' },
    globals: false,
    testTimeout: 30000,
    // One shared Postgres/Auth stack and one shared SFU: files must not race.
    fileParallelism: false,
  },
  resolve: {
    alias: {
      pg: pgPackageDir,
      'socket.io-client': socketIoClientPath,
      '@xiangqi/contracts': path.resolve(__dirname, 'packages/contracts/src'),
      '@xiangqi/game-rules': path.resolve(__dirname, 'packages/game-rules/src'),
      '@xiangqi/ai': path.resolve(__dirname, 'packages/ai/src'),
      '@xiangqi/ai-worker': path.resolve(__dirname, 'apps/ai-worker/src'),
    },
  },
});
