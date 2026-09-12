import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { authRoutes } from './auth/routes.js';
import { friendsRoutes } from './modules/friends/routes.js';
import { roomsRoutes } from './modules/rooms/routes.js';
import { invitationsRoutes } from './modules/invitations/routes.js';
import { matchesRoutes } from './modules/matches/routes.js';
import { chatRoutes } from './modules/chat/routes.js';
import { aiRoutes } from './modules/ai/routes.js';
import { historyRoutes } from './modules/history/routes.js';
import { mediaRoutes } from './modules/media/routes.js';

export async function createApp(): Promise<FastifyInstance> {
  const app = Fastify({
    logger: false,
    bodyLimit: 65536, // 64KB per spec R16 / DoS protection
  });

  // Security Headers
  await app.register(helmet, {
    contentSecurityPolicy: false, // BFF serves JSON API; frontend served by Vite
    crossOriginEmbedderPolicy: false,
  });

  // CORS protection
  await app.register(cors, {
    origin: true,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.get('/health', async () => {
    return { status: 'ok' };
  });

  await app.register(authRoutes);
  await app.register(friendsRoutes);
  await app.register(roomsRoutes);
  await app.register(invitationsRoutes);
  await app.register(matchesRoutes);
  await app.register(chatRoutes);
  await app.register(aiRoutes);
  await app.register(historyRoutes);
  await app.register(mediaRoutes);

  return app;
}
