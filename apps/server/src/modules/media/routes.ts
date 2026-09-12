/**
 * Media policy and session HTTP routes.
 * Prefix: /api/v1
 */
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { requireAuth } from '../../auth/authenticate.js';
import { UpdateMediaPolicyBodySchema } from '@xiangqi/contracts';
import { getMediaSession, updateMediaPolicy } from './service.js';

export async function mediaRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/v1/rooms/:id/media/session
  app.get(
    '/api/v1/rooms/:id/media/session',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id: roomId } = request.params as { id: string };
      try {
        const session = await getMediaSession(request.user!.id, roomId);
        return reply.send({
          ok: true,
          data: session,
          requestId: request.id,
        });
      } catch (err: unknown) {
        const e = err as { statusCode?: number; code?: string; message?: string };
        return reply.status(e.statusCode ?? 500).send({
          ok: false,
          error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message ?? 'Không thể khởi tạo phiên media' },
          requestId: request.id,
        });
      }
    },
  );

  // POST /api/v1/rooms/:id/media/policy
  app.post(
    '/api/v1/rooms/:id/media/policy',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id: roomId } = request.params as { id: string };
      const parsed = UpdateMediaPolicyBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          ok: false,
          error: { code: 'VALIDATION_ERROR', message: 'Tham số cập nhật thiết bị không hợp lệ' },
          requestId: request.id,
        });
      }

      try {
        const updatedPolicy = await updateMediaPolicy(
          request.user!.id,
          roomId,
          parsed.data.track,
          parsed.data.scope,
        );
        return reply.send({
          ok: true,
          data: updatedPolicy,
          requestId: request.id,
        });
      } catch (err: unknown) {
        const e = err as { statusCode?: number; code?: string; message?: string };
        return reply.status(e.statusCode ?? 500).send({
          ok: false,
          error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message ?? 'Không thể cập nhật chính sách thiết bị' },
          requestId: request.id,
        });
      }
    },
  );
}
