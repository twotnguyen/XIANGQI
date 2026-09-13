/**
 * Chat HTTP routes.
 * Prefix: /api/v1
 */
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { requireAuth } from '../../auth/authenticate.js';
import { SendMessageBodySchema } from '@xiangqi/contracts';
import { requireControlLease } from '../rooms/service.js';
import { sendMessage, getChatHistory } from './service.js';

function mapError(err: unknown, reply: FastifyReply, requestId: string, fallback: string) {
  const e = err as { statusCode?: number; code?: string; message?: string };
  return reply.status(e.statusCode ?? 500).send({
    ok: false,
    error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message ?? fallback },
    requestId,
  });
}

export async function chatRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/v1/rooms/:id/chat?cursor=&limit= — read stays permission-checked, no lease.
  app.get(
    '/api/v1/rooms/:id/chat',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id: roomId } = request.params as { id: string };
      const query = request.query as { cursor?: string; limit?: string };
      const limit = query.limit === undefined ? undefined : Number(query.limit);
      try {
        const history = await getChatHistory(request.user!.id, roomId, {
          cursor: query.cursor,
          limit: Number.isFinite(limit) ? limit : undefined,
        });
        return reply.send({
          ok: true,
          data: history,
          requestId: request.id,
        });
      } catch (err: unknown) {
        return mapError(err, reply, request.id, 'Không thể tải lịch sử trò chuyện');
      }
    },
  );

  // POST /api/v1/rooms/:id/chat — a controller lease is mandatory (spec 04).
  app.post(
    '/api/v1/rooms/:id/chat',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id: roomId } = request.params as { id: string };
      const parsed = SendMessageBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          ok: false,
          error: { code: 'VALIDATION_ERROR', message: 'Tin nhắn không hợp lệ (1-1000 ký tự)' },
          requestId: request.id,
        });
      }

      try {
        await requireControlLease(
          request.user!.id,
          request.headers['x-control-id'] as string | undefined,
          request.headers['x-control-epoch'] as string | undefined,
          { roomId },
        );
        const res = await sendMessage(
          request.user!.id,
          roomId,
          parsed.data.clientMessageId,
          parsed.data.content,
        );
        return reply.send({
          ok: true,
          data: res.message,
          requestId: request.id,
        });
      } catch (err: unknown) {
        return mapError(err, reply, request.id, 'Không thể gửi tin nhắn');
      }
    },
  );
}
