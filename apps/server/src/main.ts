import { createApp } from './app.js';

const PORT = Number(process.env['PORT'] ?? 3001);

const app = await createApp();

await app.listen({ port: PORT, host: '0.0.0.0' });
console.log(`Server listening on port ${PORT}`);

const shutdown = async () => {
  await app.close();
  process.exit(0);
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
