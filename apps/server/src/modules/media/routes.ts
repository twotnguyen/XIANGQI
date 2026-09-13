/**
 * Media HTTP routes (spec 04):
 *   POST  /api/v1/media/session
 *   GET   /api/v1/media/policy?matchId=...
 *   PATCH /api/v1/media/policy
 *   POST  /api/v1/media/end
 *
 * Writes require the controller lease headers `X-Control-Id`/`X-Control-Epoch`;
 * reads require membership only. Tokens are returned per-recipient, no-store.
 */
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { requireAuth } from '../../auth/authenticate.js';
import {
  CreateMediaSessionBodySchema,
  EndMediaBodySchema,
  UpdateMediaPolicyBodySchema,
} from '@xiangqi/contracts';
import {
  MediaError,
  endOwnMedia,
  getMediaPolicies,
  getMediaSession,
  updateMediaPolicy,
  type ControlHeaders,
} from './service.js';

const MATCH_ID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function controlHeaders(request: FastifyRequest): ControlHeaders {
  return {
    controlId: request.headers['x-control-id'] as string | undefined,
    controlEpoch: request.headers['x-control-epoch'] as string | undefined,
  };
}

function sendError(
  reply: FastifyReply,
  request: FastifyRequest,
  err: unknown,
  fallbackMessage: string,
): FastifyReply {
  if (err instanceof MediaError) {
    return reply.status(err.statusCode).send({
      ok: false,
      error: { code: err.code, message: err.message },
      requestId: request.id,
    });
  }
  const e = err as { statusCode?: number; code?: string; message?: string };
  return reply.status(e.statusCode ?? 500).send({
    ok: false,
    error: { code: e.code ?? 'INTERNAL_ERROR', message: e.message ?? fallbackMessage },
    requestId: request.id,
  });
}

export async function mediaRoutes(app: FastifyInstance): Promise<void> {
  // POST /api/v1/media/session
  app.post(
    '/api/v1/media/session',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = CreateMediaSessionBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          ok: false,
          error: { code: 'VALIDATION_ERROR', message: 'Tham số phiên media không hợp lệ' },
          requestId: request.id,
        });
      }
      try {
        const data = await getMediaSession({
          userId: request.user!.id,
          roomId: parsed.data.roomId,
          matchId: parsed.data.matchId,
          controllerId: parsed.data.controllerId,
          headers: controlHeaders(request),
        });
        reply.header('Cache-Control', 'no-store');
        return reply.send({ ok: true, data, requestId: request.id });
      } catch (err) {
        return sendError(reply, request, err, 'Không thể khởi tạo phiên media');
      }
    },
  );

  // GET /api/v1/media/policy?matchId=...
  app.get(
    '/api/v1/media/policy',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const matchId = (request.query as { matchId?: string }).matchId;
      if (!matchId || !MATCH_ID_RE.test(matchId)) {
        return reply.status(400).send({
          ok: false,
          error: { code: 'VALIDATION_ERROR', message: 'matchId không hợp lệ' },
          requestId: request.id,
        });
      }
      try {
        const data = await getMediaPolicies(request.user!.id, matchId);
        reply.header('Cache-Control', 'no-store');
        return reply.send({ ok: true, data, requestId: request.id });
      } catch (err) {
        return sendError(reply, request, err, 'Không đọc được chính sách media');
      }
    },
  );

  // PATCH /api/v1/media/policy
  app.patch(
    '/api/v1/media/policy',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = UpdateMediaPolicyBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          ok: false,
          error: { code: 'VALIDATION_ERROR', message: 'Tham số cập nhật thiết bị không hợp lệ' },
          requestId: request.id,
        });
      }
      try {
        const result = await updateMediaPolicy({
          userId: request.user!.id,
          matchId: parsed.data.matchId,
          kind: parsed.data.kind,
          audience: parsed.data.audience,
          expectedVersion: parsed.data.policyVersion,
          headers: controlHeaders(request),
        });
        if (result.mediaUnavailable) {
          return reply.status(503).send({
            ok: false,
            error: {
              code: 'MEDIA_UNAVAILABLE',
              message: 'Chưa thu hồi xong trên SFU; chính sách mới đang ở trạng thái APPLYING',
            },
            requestId: request.id,
          });
        }
        reply.header('Cache-Control', 'no-store');
        return reply.send({ ok: true, data: result.policy, requestId: request.id });
      } catch (err) {
        return sendError(reply, request, err, 'Không thể cập nhật chính sách thiết bị');
      }
    },
  );

  // POST /api/v1/media/end
  app.post(
    '/api/v1/media/end',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = EndMediaBodySchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          ok: false,
          error: { code: 'VALIDATION_ERROR', message: 'matchId không hợp lệ' },
          requestId: request.id,
        });
      }
      try {
        const result = await endOwnMedia({
          userId: request.user!.id,
          matchId: parsed.data.matchId,
          headers: controlHeaders(request),
        });
        if (result.mediaUnavailable) {
          return reply.status(503).send({
            ok: false,
            error: {
              code: 'MEDIA_UNAVAILABLE',
              message: 'Chưa thu hồi xong trên SFU; nguồn của bạn đang ở trạng thái APPLYING',
            },
            requestId: request.id,
          });
        }
        return reply.send({ ok: true, data: { stopped: true }, requestId: request.id });
      } catch (err) {
        return sendError(reply, request, err, 'Không thể dừng chia sẻ media');
      }
    },
  );
}
