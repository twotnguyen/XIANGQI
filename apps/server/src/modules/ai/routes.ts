/**
 * AI Match HTTP routes.
 * Prefix: /api/v1
 */
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../../auth/authenticate.js';
import { SideSchema, TimeControlSchema, AiLevelSchema } from '@xiangqi/contracts';
import { isAiSupervisorError } from '@xiangqi/ai-worker';
import { createAiMatch } from './service.js';

const CreateAiMatchBodySchema = z.object({
  humanSide: SideSchema,
  timeControl: TimeControlSchema,
  level: AiLevelSchema,
}).strict();

export async function aiRoutes(app: FastifyInstance): Promise<void> {
  // POST /api/v1/ai/matches
  app.post(
    '/api/v1/ai/matches',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = CreateAiMatchBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          ok: false,
          error: { code: 'VALIDATION_ERROR', message: 'Tham số tạo ván cờ với AI không hợp lệ' },
          requestId: request.id,
        });
      }

      try {
        const snapshot = await createAiMatch(
          request.user!.id,
          parsed.data.humanSide,
          parsed.data.timeControl,
          parsed.data.level,
        );
        return reply.send({
          ok: true,
          data: snapshot,
          requestId: request.id,
        });
      } catch (err: unknown) {
        // Capacity/worker failures surface as 503 AI_BUSY / AI_UNAVAILABLE before any match row exists.
        if (isAiSupervisorError(err)) {
          return reply.status(err.statusCode).send({
            ok: false,
            error: { code: err.code, message: err.message },
            requestId: request.id,
          });
        }
        const e = err as { statusCode?: number; code?: string; message?: string };
        return reply.status(e.statusCode ?? 500).send({
          ok: false,
          error: {
            code: e.code ?? 'INTERNAL_ERROR',
            message: e.message ?? 'Không thể tạo ván cờ với AI',
          },
          requestId: request.id,
        });
      }
    },
  );
}
