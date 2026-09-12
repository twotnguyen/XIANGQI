import Fastify, { type FastifyInstance } from 'fastify';
import { authRoutes } from './auth/routes.js';
import { friendsRoutes } from './modules/friends/routes.js';
import { roomsRoutes } from './modules/rooms/routes.js';
import { invitationsRoutes } from './modules/invitations/routes.js';
import { matchesRoutes } from './modules/matches/routes.js';

export async function createApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });

  app.get('/health', async () => {
    return { status: 'ok' };
  });

  await app.register(authRoutes);
  await app.register(friendsRoutes);
  await app.register(roomsRoutes);
  await app.register(invitationsRoutes);
  await app.register(matchesRoutes);

  return app;
}
