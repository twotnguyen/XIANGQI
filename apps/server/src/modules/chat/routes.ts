/**
 * Chat HTTP routes.
 * Prefix: /api/v1
 */
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { requireAuth } from '../../auth/authenticate.js';
import { SendMessageBodySchema } from '@xiangqi/contracts';
import { sendMessage, getChatHistory } from './service.js';

export async function chatRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/v1/rooms/:id/chat
  app.get(
    '/api/v1/rooms/:id/chat',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id: roomId } = request.params as { id: string };
      try {
        const history = await getChatHistory(request.user!.id, roomId);
        return reply.send({
          ok: true,
          data: history,
          requestId: request.id,
        });
      } catch (err: unknown) {
        const e = err as { statusCode?: number; code?: string; message?: string };
        return reply.status(e.statusCode ?? 500).send({
          ok: false,
          error: {
            code: e.code ?? 'INTERNAL_ERROR',
            message: e.message ?? 'Không thể tải lịch sử trò chuyện',
          },
          requestId: request.id,
        });
      }
    },
  );

  // POST /api/v1/rooms/:id/chat
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
        const e = err as { statusCode?: number; code?: string; message?: string };
        return reply.status(e.statusCode ?? 500).send({
          ok: false,
          error: {
            code: e.code ?? 'INTERNAL_ERROR',
            message: e.message ?? 'Không thể gửi tin nhắn',
          },
          requestId: request.id,
        });
      }
    },
  );
}
