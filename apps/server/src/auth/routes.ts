/**
 * Auth routes for Fastify server.
 * Prefix: /api/v1
 */
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import { loadConfig, requireSupabaseConfig } from '../config.js';
import { getAdminClient, requireAuth } from './authenticate.js';
import { getPool } from '../db/pool.js';
import { recordRevokedSession } from './session.js';

const LoginBodySchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
}).strict();

const LogoutBodySchema = z.object({
  scope: z.enum(['CURRENT', 'ALL']).default('CURRENT'),
}).strict();

const UpdateProfileSchema = z.object({
  displayName: z.string().min(1).max(32),
}).strict();

const CompleteProfileSchema = z.object({
  username: z.string().regex(/^[a-z0-9_]{3,24}$/),
  displayName: z.string().min(1).max(32).optional(),
}).strict();

export async function authRoutes(app: FastifyInstance): Promise<void> {
  const config = loadConfig();

  // POST /api/v1/auth/login
  // Rate limit: 5/min/IP+username per spec (enforced simply in memory or via fastify)
  app.post('/api/v1/auth/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const parsed = LoginBodySchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.status(400).send({
        ok: false,
        error: { code: 'VALIDATION_ERROR', message: 'Dữ liệu không hợp lệ' },
        requestId: request.id,
      });
    }

    const { username, password } = parsed.data;
    const normalized = username.toLowerCase().trim();

    try {
      // 1. Look up user_id from profiles by normalized username
      const pool = getPool();
      const client = await pool.connect();
      let userId: string | null = null;
      try {
        const res = await client.query(
          'SELECT id FROM public.profiles WHERE username = $1',
          [normalized],
        );
        userId = res.rows[0]?.id ?? null;
      } finally {
        client.release();
      }

      if (!userId) {
        // Generic error — don't reveal if username exists
        return reply.status(401).send({
          ok: false,
          error: { code: 'UNAUTHENTICATED', message: 'Thông tin đăng nhập không đúng' },
          requestId: request.id,
        });
      }

      // 2. Get email from Supabase Admin by userId
      const admin = getAdminClient();
      const { data: userData, error: userError } = await admin.auth.admin.getUserById(userId);
      if (userError || !userData?.user?.email) {
        return reply.status(401).send({
          ok: false,
          error: { code: 'UNAUTHENTICATED', message: 'Thông tin đăng nhập không đúng' },
          requestId: request.id,
        });
      }

      // 3. Ephemeral client for signInWithPassword (never reuse singleton per spec)
      const { url } = requireSupabaseConfig(config);
      const publishableKey = config.supabasePublishableKey ?? config.supabaseSecretKey!;
      const ephemeral = createClient(url, publishableKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      });

      const { data: sessionData, error: signInError } = await ephemeral.auth.signInWithPassword({
        email: userData.user.email,
        password,
      });

      if (signInError || !sessionData?.session) {
        return reply.status(401).send({
          ok: false,
          error: { code: 'UNAUTHENTICATED', message: 'Thông tin đăng nhập không đúng' },
          requestId: request.id,
        });
      }

      // 4. Return minimal session
      reply.header('Cache-Control', 'no-store');
      return reply.send({
        ok: true,
        data: {
          access_token: sessionData.session.access_token,
          refresh_token: sessionData.session.refresh_token,
          expires_in: sessionData.session.expires_in,
          user: {
            id: sessionData.user.id,
            email: sessionData.user.email,
          },
        },
        requestId: request.id,
      });
    } catch {
      return reply.status(503).send({
        ok: false,
        error: { code: 'UNAUTHENTICATED', message: 'Dịch vụ xác thực tạm thời không khả dụng' },
        requestId: request.id,
      });
    }
  });

  // POST /api/v1/auth/logout
  app.post(
    '/api/v1/auth/logout',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = LogoutBodySchema.safeParse(request.body ?? {});
      const scope = parsed.success ? parsed.data.scope : 'CURRENT';
      const token = request.headers.authorization!.slice(7);
      const admin = getAdminClient();

      try {
        if (scope === 'ALL') {
          // Sign out all sessions for user
          await admin.auth.admin.signOut(token, 'global');
        } else {
          // Sign out current session
          await admin.auth.admin.signOut(token, 'local');
        }

        if (request.user?.sessionId) {
          await recordRevokedSession(request.user.sessionId, request.user.id);
        }

        return reply.send({
          ok: true,
          data: { revoked: true },
          requestId: request.id,
        });
      } catch {
        return reply.status(500).send({
          ok: false,
          error: { code: 'UNAUTHENTICATED', message: 'Đăng xuất thất bại' },
          requestId: request.id,
        });
      }
    },
  );

  // GET /api/v1/me
  app.get(
    '/api/v1/me',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userId = request.user!.id;
      const pool = getPool();
      const client = await pool.connect();

      try {
        const res = await client.query(
          'SELECT id, username, display_name FROM public.profiles WHERE id = $1',
          [userId],
        );
        const profile = res.rows[0];

        return reply.send({
          ok: true,
          data: {
            profile: profile
              ? {
                  id: profile.id,
                  username: profile.username,
                  displayName: profile.display_name,
                }
              : null,
            onboardingRequired: !profile?.username,
          },
          requestId: request.id,
        });
      } finally {
        client.release();
      }
    },
  );

  // PATCH /api/v1/me (update displayName only)
  app.patch(
    '/api/v1/me',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = UpdateProfileSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          ok: false,
          error: { code: 'VALIDATION_ERROR', message: 'Tên hiển thị phải từ 1-32 ký tự' },
          requestId: request.id,
        });
      }

      const userId = request.user!.id;
      const pool = getPool();
      const client = await pool.connect();

      try {
        const res = await client.query(
          `UPDATE public.profiles
           SET display_name = $1, updated_at = now()
           WHERE id = $2
           RETURNING id, username, display_name`,
          [parsed.data.displayName, userId],
        );

        if (res.rowCount === 0) {
          return reply.status(404).send({
            ok: false,
            error: { code: 'NOT_FOUND', message: 'Hồ sơ không tồn tại' },
            requestId: request.id,
          });
        }

        const profile = res.rows[0];
        return reply.send({
          ok: true,
          data: {
            id: profile.id,
            username: profile.username,
            displayName: profile.display_name,
          },
          requestId: request.id,
        });
      } finally {
        client.release();
      }
    },
  );

  // POST /api/v1/auth/complete-profile
  app.post(
    '/api/v1/auth/complete-profile',
    { preHandler: [requireAuth] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const parsed = CompleteProfileSchema.safeParse(request.body);
      if (!parsed.success) {
        return reply.status(400).send({
          ok: false,
          error: { code: 'VALIDATION_ERROR', message: 'Tên người dùng phải gồm 3-24 ký tự thường, số hoặc gạch dưới' },
          requestId: request.id,
        });
      }

      const { username, displayName } = parsed.data;
      const userId = request.user!.id;
      const pool = getPool();
      const client = await pool.connect();

      try {
        // Only set username if currently null (onboarding only)
        const res = await client.query(
          `UPDATE public.profiles
           SET username = $1,
               display_name = COALESCE($2, display_name, $1)
           WHERE id = $3 AND username IS NULL
           RETURNING id, username, display_name`,
          [username, displayName ?? null, userId],
        );

        if (res.rowCount === 0) {
          return reply.status(409).send({
            ok: false,
            error: { code: 'CONFLICT', message: 'Tên người dùng đã được đặt hoặc không tồn tại' },
            requestId: request.id,
          });
        }

        const row = res.rows[0];
        return reply.send({
          ok: true,
          data: {
            id: row.id,
            username: row.username,
            displayName: row.display_name,
          },
          requestId: request.id,
        });
      } catch (err: unknown) {
        // Unique constraint violation
        if ((err as { code?: string }).code === '23505') {
          return reply.status(409).send({
            ok: false,
            error: { code: 'CONFLICT', message: 'Tên người dùng đã có người sử dụng' },
            requestId: request.id,
          });
        }
        throw err;
      } finally {
        client.release();
      }
    },
  );
}
