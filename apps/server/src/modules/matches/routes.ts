/**
 * Matches command routes.
 * Prefix: /api/v1
 */
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { requireAuth } from '../../auth/authenticate.js';
import {
  MoveCommandSchema,
  ResignCommandSchema,
  ProposeCommandSchema,
  RespondCommandSchema,
  UndoAiCommandSchema,
} from '@xiangqi/contracts';
import {
  getMatchSnapshot,
  submitMove,
  resignMatch,
} from './service.js';
import {
  submitProposal,
  respondToProposal,
} from './proposals.js';

export async function matchesRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/v1/matches/:id
  app.get(
    '/api/v1/matches/:id',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id: matchId } = request.params as { id: string };
      try {
        const snapshot = await getMatchSnapshot(matchId, request.user!.id);
        return reply.send({
          ok: true,
          data: snapshot,
          requestId: request.id,
        });
      } catch (err: unknown) {
        const e = err as { statusCode?: number; code?: string; message?: string };
        return reply.status(e.statusCode ?? 500).send({
          ok: false,
          error: {
            code: e.code ?? 'INTERNAL_ERROR',
            message: e.message ?? 'Không thể tải thông tin ván cờ',
          },
          requestId: request.id,
        });
      }
    },
  );

  // POST /api/v1/matches/:id/commands/move
  app.post(
    '/api/v1/matches/:id/commands/move',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id: matchId } = request.params as { id: string };
      const parsed = MoveCommandSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          ok: false,
          error: { code: 'VALIDATION_ERROR', message: 'Dữ liệu nước đi không hợp lệ' },
          requestId: request.id,
        });
      }

      try {
        const controlId = request.headers['x-control-id'] as string | undefined;
        const controlEpoch = request.headers['x-control-epoch'] as string | undefined;

        const result = await submitMove(
          request.user!.id,
          matchId,
          parsed.data,
          { controlId, controlEpoch },
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
          error: {
            code: e.code ?? 'INTERNAL_ERROR',
            message: e.message ?? 'Không thể thực hiện nước đi',
          },
          requestId: request.id,
        });
      }
    },
  );

  // POST /api/v1/matches/:id/commands/resign
  app.post(
    '/api/v1/matches/:id/commands/resign',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id: matchId } = request.params as { id: string };
      const parsed = ResignCommandSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          ok: false,
          error: { code: 'VALIDATION_ERROR', message: 'Dữ liệu đầu hàng không hợp lệ' },
          requestId: request.id,
        });
      }

      try {
        const result = await resignMatch(request.user!.id, matchId, parsed.data);
        return reply.send({
          ok: true,
          data: result,
          requestId: request.id,
        });
      } catch (err: unknown) {
        const e = err as { statusCode?: number; code?: string; message?: string };
        return reply.status(e.statusCode ?? 500).send({
          ok: false,
          error: {
            code: e.code ?? 'INTERNAL_ERROR',
            message: e.message ?? 'Không thể đầu hàng',
          },
          requestId: request.id,
        });
      }
    },
  );

  // POST /api/v1/matches/:id/commands/propose
  app.post(
    '/api/v1/matches/:id/commands/propose',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id: matchId } = request.params as { id: string };
      const parsed = ProposeCommandSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          ok: false,
          error: { code: 'VALIDATION_ERROR', message: 'Dữ liệu đề nghị không hợp lệ' },
          requestId: request.id,
        });
      }

      try {
        const result = await submitProposal(request.user!.id, matchId, parsed.data);
        return reply.send({
          ok: true,
          data: result,
          requestId: request.id,
        });
      } catch (err: unknown) {
        const e = err as { statusCode?: number; code?: string; message?: string };
        return reply.status(e.statusCode ?? 500).send({
          ok: false,
          error: {
            code: e.code ?? 'INTERNAL_ERROR',
            message: e.message ?? 'Không thể gửi đề nghị',
          },
          requestId: request.id,
        });
      }
    },
  );

  // POST /api/v1/matches/:id/commands/respond
  app.post(
    '/api/v1/matches/:id/commands/respond',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id: matchId } = request.params as { id: string };
      const parsed = RespondCommandSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          ok: false,
          error: { code: 'VALIDATION_ERROR', message: 'Dữ liệu phản hồi không hợp lệ' },
          requestId: request.id,
        });
      }

      try {
        const result = await respondToProposal(request.user!.id, matchId, parsed.data);
        return reply.send({
          ok: true,
          data: result,
          requestId: request.id,
        });
      } catch (err: unknown) {
        const e = err as { statusCode?: number; code?: string; message?: string };
        return reply.status(e.statusCode ?? 500).send({
          ok: false,
          error: {
            code: e.code ?? 'INTERNAL_ERROR',
            message: e.message ?? 'Không thể phản hồi đề nghị',
          },
          requestId: request.id,
        });
      }
    },
  );

  // POST /api/v1/matches/:id/commands/undo-ai
  app.post(
    '/api/v1/matches/:id/commands/undo-ai',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id: matchId } = request.params as { id: string };
      const parsed = UndoAiCommandSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          ok: false,
          error: { code: 'VALIDATION_ERROR', message: 'Dữ liệu lệnh không hợp lệ' },
          requestId: request.id,
        });
      }

      try {
        const { undoAiMatch } = await import('../ai/service.js');
        const snapshot = await undoAiMatch(request.user!.id, matchId);
        return reply.send({
          ok: true,
          data: { matchId, snapshot },
          requestId: request.id,
        });
      } catch (err: unknown) {
        const e = err as { statusCode?: number; code?: string; message?: string };
        return reply.status(e.statusCode ?? 500).send({
          ok: false,
          error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message ?? 'Không thể đi lại' },
          requestId: request.id,
        });
      }
    },
  );
}
