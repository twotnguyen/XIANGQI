import Fastify, { type FastifyInstance } from 'fastify';

export async function createApp(): Promise<FastifyInstance> {
  const app = Fastify({ logger: false });

  app.get('/health', async () => {
    return { status: 'ok' };
  });

  return app;
}
