/**
 * Fastify authentication middleware / helper.
 * Extracts Bearer token, validates via Supabase Auth client, checks session active.
 */
import type { FastifyRequest, FastifyReply } from 'fastify';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { loadConfig, requireSupabaseConfig } from '../config.js';

let adminClientInstance: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient {
  if (!adminClientInstance) {
    const { url, secretKey } = requireSupabaseConfig(loadConfig());
    adminClientInstance = createClient(url, secretKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
    });
  }
  return adminClientInstance;
}

export interface AuthenticatedUser {
  id: string;
  email?: string;
  sessionId?: string;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}

/**
 * Fastify preHandler to require a valid Bearer token.
 */
export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  const authHeader = request.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    reply.status(401).send({
      ok: false,
      error: { code: 'UNAUTHENTICATED', message: 'Thiếu token xác thực' },
      requestId: request.id,
    });
    return;
  }

  const token = authHeader.slice(7);
  const admin = getAdminClient();

  try {
    const { data: { user }, error } = await admin.auth.getUser(token);
    if (error || !user) {
      reply.status(401).send({
        ok: false,
        error: { code: 'UNAUTHENTICATED', message: 'Token không hợp lệ hoặc đã hết hạn' },
        requestId: request.id,
      });
      return;
    }

    // Attach user to request
    request.user = {
      id: user.id,
      email: user.email,
    };
  } catch {
    reply.status(401).send({
      ok: false,
      error: { code: 'UNAUTHENTICATED', message: 'Xác thực thất bại' },
      requestId: request.id,
    });
  }
}
