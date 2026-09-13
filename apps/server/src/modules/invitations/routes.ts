/**
 * Invitations and room join routes.
 * Prefix: /api/v1
 */
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { requireAuth } from '../../auth/authenticate.js';
import { requireOnboarded } from '../../auth/onboarding-gate.js';
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

type ServiceError = { statusCode?: number; code?: string; message?: string };

/**
 * Send one service failure as the standard ApiResult envelope.
 *
 * Intentional 4xx codes/messages thrown by the service pass through untouched.
 * Anything else (raw `pg` errors such as `42703 column ... does not exist`, or an
 * unexpected throw) becomes a generic 500 `INTERNAL_ERROR`: driver codes and SQL
 * text must never leak through the API.
 */
function sendServiceError(
  reply: FastifyReply,
  request: FastifyRequest,
  err: unknown,
  fallbackMessage: string,
): FastifyReply {
  const e = err as ServiceError;
  const status = typeof e.statusCode === 'number' && e.statusCode >= 400 && e.statusCode < 500
    ? e.statusCode
    : 500;

  if (status === 500) {
    return reply.status(500).send({
      ok: false,
      error: { code: 'INTERNAL_ERROR', message: fallbackMessage },
      requestId: request.id,
    });
  }

  return reply.status(status).send({
    ok: false,
    error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message ?? fallbackMessage },
    requestId: request.id,
  });
}

export async function invitationsRoutes(app: FastifyInstance): Promise<void> {
  // POST /api/v1/rooms/:id/invitations
  app.post(
    '/api/v1/rooms/:id/invitations',
    { preHandler: [requireAuth, requireOnboarded] },
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
        return sendServiceError(reply, request, err, 'Không thể tạo lời mời');
      }
    },
  );

  // GET /api/v1/invitations
  app.get(
    '/api/v1/invitations',
    { preHandler: [requireAuth, requireOnboarded] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const items = await getReceivedInvitations(request.user!.id);
        return reply.send({
          ok: true,
          data: items,
          requestId: request.id,
        });
      } catch (err: unknown) {
        return sendServiceError(reply, request, err, 'Không thể tải danh sách lời mời');
      }
    },
  );

  // POST /api/v1/invitations/:id/respond
  app.post(
    '/api/v1/invitations/:id/respond',
    { preHandler: [requireAuth, requireOnboarded] },
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
        return sendServiceError(reply, request, err, 'Không thể phản hồi lời mời');
      }
    },
  );

  // POST /api/v1/rooms/:id/watch-code
  app.post(
    '/api/v1/rooms/:id/watch-code',
    { preHandler: [requireAuth, requireOnboarded] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id: roomId } = request.params as { id: string };
      const parsed = WatchCodeBodySchema.safeParse(request.body ?? {});
      if (!parsed.success) {
        return reply.status(400).send({
          ok: false,
          error: { code: 'VALIDATION_ERROR', message: 'Dữ liệu đổi mã xem không hợp lệ' },
          requestId: request.id,
        });
      }

      try {
        const grant = await rotateWatchCode(request.user!.id, roomId, parsed.data.rotate);
        return reply.send({
          ok: true,
          data: grant,
          requestId: request.id,
        });
      } catch (err: unknown) {
        return sendServiceError(reply, request, err, 'Không thể cập nhật mã xem');
      }
    },
  );

  // POST /api/v1/rooms/join
  app.post(
    '/api/v1/rooms/join',
    { preHandler: [requireAuth, requireOnboarded] },
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
        return sendServiceError(reply, request, err, 'Không thể vào phòng');
      }
    },
  );
}
