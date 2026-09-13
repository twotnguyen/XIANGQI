import fs from 'node:fs';
import path from 'node:path';
import { createApp } from './app.js';
import {
  createDeadlineScheduler,
  recoverActiveMatchesOnBoot,
  type DeadlineScheduler,
} from './modules/matches/deadlines.js';
import { recoverMediaOnBoot } from './modules/media/reconciler.js';
import { retryPendingMediaJobs } from './modules/media/service.js';

for (const envPath of ['.env.test', '../../.env.test', '../.env.test', '.env', '../../.env', '../.env']) {
  const resolved = path.resolve(process.cwd(), envPath);
  if (fs.existsSync(resolved)) {
    try {
      process.loadEnvFile(resolved);
      break;
    } catch {
      // ignore
    }
  }
}

const PORT = Number(process.env['PORT'] ?? 3001);

// Boot recovery: mark surviving ACTIVE matches as INTERRUPTED (SERVER_RESTART) through the
// shared finalizer, and retire media state that belongs to the previous boot.
try {
  const recovered = await recoverActiveMatchesOnBoot();
  if (recovered > 0) {
    console.log(`Boot recovery: marked ${recovered} active matches as INTERRUPTED`);
  }
} catch {
  // DB might not be connected yet in pure test/dev; ignore gracefully
}

try {
  const media = await recoverMediaOnBoot();
  if (media.policiesReset > 0 || media.transportsRetired > 0) {
    console.log(
      `Boot recovery: ${media.policiesReset} media policies reset, ${media.transportsRetired} transports retired`,
    );
  }
} catch {
  // The SFU or DB may not be reachable at boot; media sessions recover on demand.
}

// Jobs left PENDING/RETRY by an SFU outage are reconciled in the background; the scheduler
// keeps retrying them because desired media state stays restrictive until applied.
void retryPendingMediaJobs().catch(() => undefined);

const app = await createApp();

await app.listen({ port: PORT, host: '0.0.0.0' });
console.log(`Server listening on port ${PORT}`);

// Deadline scheduler: clock expiry, 60s disconnect grace, both-offline interruption,
// 30s proposal expiry and the 10-minute room close (spec 03). It decides from persisted
// timestamps only, so a restart or a late tick cannot change the outcome.
const scheduler: DeadlineScheduler = createDeadlineScheduler();
scheduler.start();

const shutdown = async () => {
  scheduler.stop();
  await app.close();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
