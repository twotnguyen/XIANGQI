/**
 * History, Replay, and Rematch HTTP routes.
 * Prefix: /api/v1
 */
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../../auth/authenticate.js';
import { getMatchHistory, getMatchReplay } from './service.js';
import { voteRematch } from '../rooms/rematch.js';

const VoteRematchBodySchema = z.object({
  expectedMatchId: z.string().uuid(),
}).strict();

export async function historyRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/v1/history
  app.get(
    '/api/v1/history',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const history = await getMatchHistory(request.user!.id);
        return reply.send({
          ok: true,
          data: history,
          requestId: request.id,
        });
      } catch (err: unknown) {
        const e = err as { statusCode?: number; code?: string; message?: string };
        return reply.status(e.statusCode ?? 500).send({
          ok: false,
          error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message ?? 'Không thể tải lịch sử đấu' },
          requestId: request.id,
        });
      }
    },
  );

  // GET /api/v1/matches/:id/replay
  app.get(
    '/api/v1/matches/:id/replay',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id: matchId } = request.params as { id: string };
      try {
        const replay = await getMatchReplay(request.user!.id, matchId);
        return reply.send({
          ok: true,
          data: replay,
          requestId: request.id,
        });
      } catch (err: unknown) {
        const e = err as { statusCode?: number; code?: string; message?: string };
        return reply.status(e.statusCode ?? 500).send({
          ok: false,
          error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message ?? 'Không thể tải lại ván cờ' },
          requestId: request.id,
        });
      }
    },
  );

  // POST /api/v1/rooms/:id/rematch
  app.post(
    '/api/v1/rooms/:id/rematch',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id: roomId } = request.params as { id: string };
      const parsed = VoteRematchBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          ok: false,
          error: { code: 'VALIDATION_ERROR', message: 'Tham số yêu cầu tái đấu không hợp lệ' },
          requestId: request.id,
        });
      }

      try {
        const result = await voteRematch(
          request.user!.id,
          roomId,
          parsed.data.expectedMatchId,
        );
        return reply.send({
          ok: true,
          data: result,
          requestId: request.id,
        });
      } catch (err: unknown) {
        const e = err as { statusCode?: number; code?: string; message?: string };
        return reply.status(e.statusCode ?? 500).send({
          ok: false,
          error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message ?? 'Không thể gửi yêu cầu tái đấu' },
          requestId: request.id,
        });
      }
    },
  );
}
