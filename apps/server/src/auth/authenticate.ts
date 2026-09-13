/**
 * Fastify authentication middleware / helper.
 * Verifies the Bearer token, derives the Supabase session id, and rejects
 * requests whose session has been revoked (F-05).
 */
import type { FastifyRequest, FastifyReply } from 'fastify';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { loadConfig, requireSupabaseConfig } from '../config.js';
import { isSessionActive } from './session.js';

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
  /** Supabase Auth session id (`session_id` JWT claim); required for revocation checks. */
  sessionId?: string;
  /** Access-token expiry in epoch ms (JWT `exp`), used to size the revocation row. */
  sessionExpiresAtMs?: number;
}

declare module 'fastify' {
  interface FastifyRequest {
    user?: AuthenticatedUser;
  }
}

export interface AuthDeps {
  /** Verify the bearer token and return the identity, or null when invalid. */
  verifyToken(token: string): Promise<AuthenticatedUser | null>;
  /** DB-backed session revocation check (spec 05). */
  isSessionActive(sessionId: string, userId: string): Promise<boolean>;
}

/** Read the (already signature-verified) JWT payload; used only as a fallback. */
function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const part = token.split('.')[1];
  if (!part) return null;
  try {
    return JSON.parse(Buffer.from(part, 'base64url').toString('utf8')) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/**
 * Verify a Supabase access token.
 *
 * Primary path: `getClaims(jwt)` — official JWKS/server verification, and the
 * only source that carries the `session_id` claim plus `exp`.
 * Fallback: `admin.auth.getUser(jwt)` (server-side token validation) when
 * getClaims is unavailable; the user object has no session id/exp, so they are
 * read from the token payload that getUser just verified.
 */
async function verifyAccessToken(token: string): Promise<AuthenticatedUser | null> {
  const admin = getAdminClient();

  const { data, error } = await admin.auth.getClaims(token);
  if (!error && data?.claims?.sub) {
    const claims = data.claims;
    return {
      id: claims.sub,
      email: typeof claims.email === 'string' ? claims.email : undefined,
      sessionId: typeof claims.session_id === 'string' ? claims.session_id : undefined,
      sessionExpiresAtMs: typeof claims.exp === 'number' ? claims.exp * 1000 : undefined,
    };
  }

  const {
    data: { user },
    error: userError,
  } = await admin.auth.getUser(token);
  if (userError || !user) return null;

  const payload = decodeJwtPayload(token);
  const sessionId = payload?.['session_id'];
  const exp = payload?.['exp'];
  return {
    id: user.id,
    email: user.email,
    sessionId: typeof sessionId === 'string' ? sessionId : undefined,
    sessionExpiresAtMs: typeof exp === 'number' ? exp * 1000 : undefined,
  };
}

const defaultDeps: AuthDeps = {
  verifyToken: verifyAccessToken,
  isSessionActive,
};

/**
 * Build the auth preHandler with injectable deps (unit tests use fakes).
 *
 * Fail-closed: an unusable token, a token without a session id, or a failing
 * revocation lookup all answer 401 UNAUTHENTICATED. `/health` is registered
 * without this preHandler, so a sick DB still reports liveness.
 */
export function createRequireAuth(deps: AuthDeps = defaultDeps) {
  return async function requireAuth(
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

    let identity: AuthenticatedUser | null = null;
    try {
      identity = await deps.verifyToken(token);
    } catch {
      // Invalid or expired token: identity remains null
    }

    if (!identity) {
      reply.status(401).send({
        ok: false,
        error: { code: 'UNAUTHENTICATED', message: 'Token không hợp lệ hoặc đã hết hạn' },
        requestId: request.id,
      });
      return;
    }

    if (!identity.sessionId) {
      reply.status(401).send({
        ok: false,
        error: { code: 'UNAUTHENTICATED', message: 'Phiên đăng nhập không hợp lệ' },
        requestId: request.id,
      });
      return;
    }

    let active = false;
    try {
      active = await deps.isSessionActive(identity.sessionId, identity.id);
    } catch {
      // Lookup failure: active remains false (fail-closed)
    }
    if (!active) {
      reply.status(401).send({
        ok: false,
        error: { code: 'UNAUTHENTICATED', message: 'Phiên đăng nhập đã bị thu hồi' },
        requestId: request.id,
      });
      return;
    }

    request.user = identity;
  };
}

export const requireAuth = createRequireAuth();
