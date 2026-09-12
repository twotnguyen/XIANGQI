import { createApp } from './app.js';
import { recoverActiveMatchesOnBoot } from './modules/matches/deadlines.js';

const PORT = Number(process.env['PORT'] ?? 3001);

// Boot recovery: mark surviving ACTIVE matches as INTERRUPTED (SERVER_RESTART)
try {
  const recovered = await recoverActiveMatchesOnBoot();
  if (recovered > 0) {
    console.log(`Boot recovery: marked ${recovered} active matches as INTERRUPTED`);
  }
} catch {
  // DB might not be connected yet in pure test/dev; ignore gracefully
}

const app = await createApp();

await app.listen({ port: PORT, host: '0.0.0.0' });
console.log(`Server listening on port ${PORT}`);

const shutdown = async () => {
  await app.close();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
