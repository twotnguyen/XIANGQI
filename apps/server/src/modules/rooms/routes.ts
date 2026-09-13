/**
 * Rooms and control routes.
 * Prefix: /api/v1
 */
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { requireAuth } from '../../auth/authenticate.js';
import {
  CreateRoomBodySchema,
  PatchRoomBodySchema,
  ReadyBodySchema,
  TakeoverBodySchema,
} from '@xiangqi/contracts';
import {
  createRoom,
  listPublicRooms,
  getRoom,
  patchRoom,
  setReady,
  leaveRoom,
  takeoverControl,
} from './service.js';
import { startMatchFromRoom } from '../matches/service.js';

export async function roomsRoutes(app: FastifyInstance): Promise<void> {
  // GET /api/v1/rooms
  app.get(
    '/api/v1/rooms',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const rooms = await listPublicRooms();
      return reply.send({
        ok: true,
        data: rooms,
        requestId: request.id,
      });
    },
  );

  // POST /api/v1/rooms
  app.post(
    '/api/v1/rooms',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = CreateRoomBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          ok: false,
          error: { code: 'VALIDATION_ERROR', message: 'Dữ liệu phòng không hợp lệ' },
          requestId: request.id,
        });
      }

      try {
        const room = await createRoom(request.user!.id, parsed.data);
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
            message: e.message ?? 'Không thể tạo phòng',
          },
          requestId: request.id,
        });
      }
    },
  );

  // GET /api/v1/rooms/:id
  app.get(
    '/api/v1/rooms/:id',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      try {
        const room = await getRoom(id, request.user!.id);
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
            message: e.message ?? 'Không thể truy cập phòng',
          },
          requestId: request.id,
        });
      }
    },
  );

  // PATCH /api/v1/rooms/:id
  app.patch(
    '/api/v1/rooms/:id',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const parsed = PatchRoomBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          ok: false,
          error: { code: 'VALIDATION_ERROR', message: 'Dữ liệu không hợp lệ' },
          requestId: request.id,
        });
      }

      try {
        const room = await patchRoom(id, request.user!.id, parsed.data);
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
            message: e.message ?? 'Không thể cập nhật phòng',
          },
          requestId: request.id,
        });
      }
    },
  );

  // POST /api/v1/rooms/:id/ready
  app.post(
    '/api/v1/rooms/:id/ready',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      const parsed = ReadyBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          ok: false,
          error: { code: 'VALIDATION_ERROR', message: 'Dữ liệu không hợp lệ' },
          requestId: request.id,
        });
      }

      try {
        const res = await setReady(id, request.user!.id, parsed.data.ready);
        let matchSnapshot = null;
        if (res.canStart) {
          matchSnapshot = await startMatchFromRoom(id);
        }
        return reply.send({
          ok: true,
          data: {
            ...res.room,
            matchSnapshot,
          },
          requestId: request.id,
        });
      } catch (err: unknown) {
        const e = err as { statusCode?: number; code?: string; message?: string };
        return reply.status(e.statusCode ?? 500).send({
          ok: false,
          error: {
            code: e.code ?? 'INTERNAL_ERROR',
            message: e.message ?? 'Không thể cập nhật trạng thái sẵn sàng',
          },
          requestId: request.id,
        });
      }
    },
  );

  // POST /api/v1/rooms/:id/leave
  app.post(
    '/api/v1/rooms/:id/leave',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const { id } = request.params as { id: string };
      try {
        const res = await leaveRoom(id, request.user!.id);
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
            message: e.message ?? 'Không thể rời phòng',
          },
          requestId: request.id,
        });
      }
    },
  );

  // POST /api/v1/control/takeover
  app.post(
    '/api/v1/control/takeover',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = TakeoverBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          ok: false,
          error: { code: 'VALIDATION_ERROR', message: 'Dữ liệu không hợp lệ' },
          requestId: request.id,
        });
      }

      try {
        const sessionId = request.user!.sessionId;
        if (!sessionId) {
          return reply.status(401).send({
            ok: false,
            error: { code: 'UNAUTHENTICATED', message: 'Phiên đăng nhập không hợp lệ' },
            requestId: request.id,
          });
        }

        const lease = await takeoverControl(request.user!.id, parsed.data.tabId, sessionId);
        return reply.send({
          ok: true,
          data: lease,
          requestId: request.id,
        });
      } catch (err: unknown) {
        const e = err as { statusCode?: number; code?: string; message?: string };
        return reply.status(e.statusCode ?? 500).send({
          ok: false,
          error: {
            code: e.code ?? 'INTERNAL_ERROR',
            message: e.message ?? 'Không thể takeover quyền điều khiển',
          },
          requestId: request.id,
        });
      }
    },
  );
}
