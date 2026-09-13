import Fastify, { type FastifyInstance } from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import { loadConfig, resolveAllowedOrigins } from './config.js';
import { authRoutes } from './auth/routes.js';
import { friendsRoutes } from './modules/friends/routes.js';
import { roomsRoutes } from './modules/rooms/routes.js';
import { invitationsRoutes } from './modules/invitations/routes.js';
import { matchesRoutes } from './modules/matches/routes.js';
import { chatRoutes } from './modules/chat/routes.js';
import { aiRoutes } from './modules/ai/routes.js';
import { historyRoutes } from './modules/history/routes.js';
import { mediaRoutes } from './modules/media/routes.js';
import { attachRealtimeSocket } from './realtime/socket.js';
import { registerOnboardingGate } from './auth/onboarding-gate.js';

export async function createApp(): Promise<FastifyInstance> {
  const config = loadConfig();
  // Throws on missing/invalid APP_ORIGIN in production: startup fails loudly
  // instead of silently reflecting every origin.
  const allowedOrigins = resolveAllowedOrigins(config.appOrigin, process.env['NODE_ENV']);

  const app = Fastify({
    logger: false,
    bodyLimit: 65536, // 64KB per spec R16 / DoS protection
  });

  // Security Headers
  await app.register(helmet, {
    // The BFF only serves JSON (the SPA is served from APP_ORIGIN), so lock
    // the document context down instead of disabling CSP entirely.
    contentSecurityPolicy: {
      useDefaults: false,
      directives: {
        'default-src': ["'none'"],
        'base-uri': ["'none'"],
        'form-action': ["'none'"],
        'frame-ancestors': ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  });

  // CORS: allowlist APP_ORIGIN (+ local dev origins outside production).
  // Bearer tokens only, no cookie credentials (spec 05).
  await app.register(cors, {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Control-Id', 'X-Control-Epoch'],
    credentials: false,
  });

  app.get('/health', async () => {
    return { status: 'ok' };
  });
  // Append the ONBOARDING_REQUIRED gate before routes are registered.
  registerOnboardingGate(app);


  await app.register(authRoutes);
  await app.register(friendsRoutes);
  await app.register(roomsRoutes);
  await app.register(invitationsRoutes);
  await app.register(matchesRoutes);
  await app.register(chatRoutes);
  await app.register(aiRoutes);
  await app.register(historyRoutes);
  await app.register(mediaRoutes);

  // Socket.IO on the same HTTP server/port, one namespace, WebSocket only (spec 04).
  // The gateway also binds `realtime/events.ts` to the wire, so every existing
  // after-commit emitter reaches the right sockets without touching its call site.
  attachRealtimeSocket(app, { allowedOrigins });

  return app;
}
