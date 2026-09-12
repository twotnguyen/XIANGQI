/**
 * Friends & user search routes.
 * Prefix: /api/v1
 */
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import { requireAuth } from '../../auth/authenticate.js';
import {
  searchUsers,
  getFriendsAndRequests,
  sendFriendRequest,
  respondToRequest,
  cancelRequest,
  removeFriend,
} from './service.js';

const SendRequestBodySchema = z.object({
  recipientId: z.string().uuid(),
}).strict();

const RespondBodySchema = z.object({
  accept: z.boolean(),
}).strict();

export async function friendsRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/v1/users?prefix=...
  app.get(
    '/api/v1/users',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { prefix } = request.query as { prefix?: string };
      if (!prefix || prefix.length < 3) {
        return reply.status(400).send({
          ok: false,
          error: { code: 'VALIDATION_ERROR', message: 'Từ khóa tìm kiếm phải từ 3 ký tự' },
          requestId: request.id,
        });
      }

      const users = await searchUsers(prefix, request.user!.id);
      return reply.send({
        ok: true,
        data: users,
        requestId: request.id,
      });
    },
  );

  // GET /api/v1/friends
  app.get(
    '/api/v1/friends',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const result = await getFriendsAndRequests(request.user!.id);
      return reply.send({
        ok: true,
        data: result,
        requestId: request.id,
      });
    },
  );

  // POST /api/v1/friends/requests
  app.post(
    '/api/v1/friends/requests',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = SendRequestBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          ok: false,
          error: { code: 'VALIDATION_ERROR', message: 'Dữ liệu không hợp lệ' },
          requestId: request.id,
        });
      }

      try {
        const { relation } = await sendFriendRequest(
          request.user!.id,
          parsed.data.recipientId,
        );
        return reply.send({
          ok: true,
          data: relation,
          requestId: request.id,
        });
      } catch (err: unknown) {
        const e = err as { statusCode?: number; code?: string; message?: string };
        return reply.status(e.statusCode ?? 500).send({
          ok: false,
          error: {
            code: e.code ?? 'INTERNAL_ERROR',
            message: e.message ?? 'Không thể gửi yêu cầu',
          },
          requestId: request.id,
        });
      }
    },
  );

  // POST /api/v1/friends/requests/:id/respond
  app.post(
    '/api/v1/friends/requests/:id/respond',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const parsed = RespondBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          ok: false,
          error: { code: 'VALIDATION_ERROR', message: 'Dữ liệu không hợp lệ' },
          requestId: request.id,
        });
      }

      try {
        const res = await respondToRequest(request.user!.id, id, parsed.data.accept);
        return reply.send({
          ok: true,
          data: res,
          requestId: request.id,
        });
      } catch (err: unknown) {
        const e = err as { statusCode?: number; code?: string; message?: string };
        return reply.status(e.statusCode ?? 500).send({
          ok: false,
          error: {
            code: e.code ?? 'INTERNAL_ERROR',
            message: e.message ?? 'Không thể xử lý yêu cầu',
          },
          requestId: request.id,
        });
      }
    },
  );

  // DELETE /api/v1/friends/requests/:id
  app.delete(
    '/api/v1/friends/requests/:id',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      try {
        const res = await cancelRequest(request.user!.id, id);
        return reply.send({
          ok: true,
          data: res,
          requestId: request.id,
        });
      } catch (err: unknown) {
        const e = err as { statusCode?: number; code?: string; message?: string };
        return reply.status(e.statusCode ?? 500).send({
          ok: false,
          error: {
            code: e.code ?? 'INTERNAL_ERROR',
            message: e.message ?? 'Không thể hủy yêu cầu',
          },
          requestId: request.id,
        });
      }
    },
  );

  // DELETE /api/v1/friends/:userId
  app.delete(
    '/api/v1/friends/:userId',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { userId } = request.params as { userId: string };
      try {
        const res = await removeFriend(request.user!.id, userId);
        return reply.send({
          ok: true,
          data: res,
          requestId: request.id,
        });
      } catch (err: unknown) {
        const e = err as { statusCode?: number; code?: string; message?: string };
        return reply.status(e.statusCode ?? 500).send({
          ok: false,
          error: {
            code: e.code ?? 'INTERNAL_ERROR',
            message: e.message ?? 'Không thể xóa bạn bè',
          },
          requestId: request.id,
        });
      }
    },
  );
}
