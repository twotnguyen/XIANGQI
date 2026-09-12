/**
 * Invitations and room join routes.
 * Prefix: /api/v1
 */
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { requireAuth } from '../../auth/authenticate.js';
import {
  CreateInvitationBodySchema,
  RespondInvitationBodySchema,
  WatchCodeBodySchema,
  JoinRoomBodySchema,
} from '@xiangqi/contracts';
import {
  createInvitation,
  getReceivedInvitations,
  respondToInvitation,
  rotateWatchCode,
  joinRoom,
} from './service.js';

export async function invitationsRoutes(app: FastifyInstance): Promise<void> {
  // POST /api/v1/rooms/:id/invitations
  app.post(
    '/api/v1/rooms/:id/invitations',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id: roomId } = request.params as { id: string };
      const parsed = CreateInvitationBodySchema.safeParse(request.body ?? {});
      if (!parsed.success) {
        return reply.status(400).send({
          ok: false,
          error: { code: 'VALIDATION_ERROR', message: 'Dữ liệu lời mời không hợp lệ' },
          requestId: request.id,
        });
      }

      try {
        const inv = await createInvitation(request.user!.id, roomId, parsed.data);
        return reply.send({
          ok: true,
          data: inv,
          requestId: request.id,
        });
      } catch (err: unknown) {
        const e = err as { statusCode?: number; code?: string; message?: string };
        return reply.status(e.statusCode ?? 500).send({
          ok: false,
          error: {
            code: e.code ?? 'INTERNAL_ERROR',
            message: e.message ?? 'Không thể tạo lời mời',
          },
          requestId: request.id,
        });
      }
    },
  );

  // GET /api/v1/invitations
  app.get(
    '/api/v1/invitations',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const items = await getReceivedInvitations(request.user!.id);
      return reply.send({
        ok: true,
        data: items,
        requestId: request.id,
      });
    },
  );

  // POST /api/v1/invitations/:id/respond
  app.post(
    '/api/v1/invitations/:id/respond',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const parsed = RespondInvitationBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          ok: false,
          error: { code: 'VALIDATION_ERROR', message: 'Dữ liệu không hợp lệ' },
          requestId: request.id,
        });
      }

      try {
        const res = await respondToInvitation(request.user!.id, id, parsed.data.accept);
        return reply.send({
          ok: true,
          data: res.room ?? { removed: res.removed },
          requestId: request.id,
        });
      } catch (err: unknown) {
        const e = err as { statusCode?: number; code?: string; message?: string };
        return reply.status(e.statusCode ?? 500).send({
          ok: false,
          error: {
            code: e.code ?? 'INTERNAL_ERROR',
            message: e.message ?? 'Không thể phản hồi lời mời',
          },
          requestId: request.id,
        });
      }
    },
  );

  // POST /api/v1/rooms/:id/watch-code
  app.post(
    '/api/v1/rooms/:id/watch-code',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id: roomId } = request.params as { id: string };
      WatchCodeBodySchema.safeParse(request.body ?? {});

      try {
        const grant = await rotateWatchCode(request.user!.id, roomId);
        return reply.send({
          ok: true,
          data: grant,
          requestId: request.id,
        });
      } catch (err: unknown) {
        const e = err as { statusCode?: number; code?: string; message?: string };
        return reply.status(e.statusCode ?? 500).send({
          ok: false,
          error: {
            code: e.code ?? 'INTERNAL_ERROR',
            message: e.message ?? 'Không thể cập nhật mã xem',
          },
          requestId: request.id,
        });
      }
    },
  );

  // POST /api/v1/rooms/join
  app.post(
    '/api/v1/rooms/join',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = JoinRoomBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          ok: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message ?? 'Dữ liệu vào phòng không hợp lệ',
          },
          requestId: request.id,
        });
      }

      const { role, ...locator } = parsed.data;
      try {
        const room = await joinRoom(request.user!.id, locator, role);
        return reply.send({
          ok: true,
          data: room,
          requestId: request.id,
        });
      } catch (err: unknown) {
        const e = err as { statusCode?: number; code?: string; message?: string };
        return reply.status(e.statusCode ?? 500).send({
          ok: false,
          error: {
            code: e.code ?? 'INTERNAL_ERROR',
            message: e.message ?? 'Không thể vào phòng',
          },
          requestId: request.id,
        });
      }
    },
  );
}
