import Fastify, { type FastifyInstance } from 'fastify';
import { authRoutes } from './auth/routes.js';
import { friendsRoutes } from './modules/friends/routes.js';

export async function createApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });

  app.get('/health', async () => {
    return { status: 'ok' };
  });

  await app.register(authRoutes);
  await app.register(friendsRoutes);

  return app;
}
