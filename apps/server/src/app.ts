import Fastify, { type FastifyInstance } from 'fastify';
import { authRoutes } from './auth/routes.js';

export async function createApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });

  app.get('/health', async () => {
    return { status: 'ok' };
  });

  await app.register(authRoutes);

  return app;
}
