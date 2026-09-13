/**
 * ONBOARDING_REQUIRED gate (spec 04 error code; ISSUE-008 acceptance).
 *
 * A real Supabase session can exist before the profile has a username (Google or
 * phone signup). `GET /me` reports `onboardingRequired`, but every game API must
 * refuse such a session with 403 `ONBOARDING_REQUIRED` until
 * `POST /auth/complete-profile` succeeds.
 *
 * Registration contract (one line, `apps/server/src/app.ts`, BEFORE any
 * `app.register(<routes>)` call — `onRoute` only sees routes registered after it):
 *
 *     registerOnboardingGate(app);
 *
 * The hook is appended to every route's `preHandler` *after* its own handlers, so
 * it observes the `request.user` that `requireAuth` set and never duplicates the
 * token/session work. Requests are skipped without any DB query when:
 *   - the method is OPTIONS/HEAD (CORS preflight),
 *   - the path is exempt (see {@link isOnboardingExempt}): `/health`, `/api/v1/me`
 *     (GET and PATCH) and everything under `/api/v1/auth/` — login, logout,
 *     complete-profile,
 *   - the route has no authenticated user (a public route); its own guards answer.
 * `GET /me`, `PATCH /me`, `POST /auth/complete-profile`, `POST /auth/logout` and
 * `/health` therefore stay reachable before onboarding.
 *
 * Socket.IO does not go through Fastify hooks: the realtime gateway must call
 * {@link hasUsername} itself for control-gated mutations to close that gap.
 */
import type {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
  preHandlerAsyncHookHandler,
} from 'fastify';
import { getPool } from '../db/pool.js';

export interface OnboardingGateDeps {
  /** True when `public.profiles.username` is already set for the user. */
  hasUsername: (userId: string) => Promise<boolean>;
}

/** Paths that must keep working before the username is chosen (spec 04/05). */
export const ONBOARDING_EXEMPT_PATHS = {
  exact: ['/health', '/api/v1/me'],
  prefixes: ['/api/v1/auth/'],
} as const;

/** True when the gate must not run for this request (no DB query). */
export function isOnboardingExempt(method: string, url: string): boolean {
  if (method === 'OPTIONS' || method === 'HEAD') return true;
  const path = url.split('?')[0] ?? url;
  if ((ONBOARDING_EXEMPT_PATHS.exact as readonly string[]).includes(path)) return true;
  return ONBOARDING_EXEMPT_PATHS.prefixes.some((prefix) => path.startsWith(prefix));
}

/**
 * Default username check; exported so the socket layer can reuse the same rule
 * without paying the Fastify hook machinery.
 */
export async function hasUsername(userId: string): Promise<boolean> {
  const client = await getPool().connect();
  try {
    const res = await client.query(
      'SELECT 1 FROM public.profiles WHERE user_id = $1 AND username IS NOT NULL',
      [userId],
    );
    return (res.rowCount ?? 0) > 0;
  } finally {
    client.release();
  }
}

/** Build the preHandler with an injectable username lookup (unit-test seam). */
export function createRequireOnboarded(
  deps: OnboardingGateDeps,
): preHandlerAsyncHookHandler {
  return async function requireOnboarded(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    if (isOnboardingExempt(request.method, request.url)) return;

    const userId = request.user?.id;
    // Not authenticated (public route): its own guard decides; nothing to gate.
    if (!userId) return;

    let onboarded: boolean;
    try {
      onboarded = await deps.hasUsername(userId);
    } catch {
      // Fail closed without leaking the driver error.
      await reply.status(500).send({
        ok: false,
        error: { code: 'INTERNAL_ERROR', message: 'Không thể kiểm tra hồ sơ người dùng' },
        requestId: request.id,
      });
      return;
    }

    if (!onboarded) {
      await reply.status(403).send({
        ok: false,
        error: { code: 'ONBOARDING_REQUIRED', message: 'Cần hoàn tất hồ sơ trước khi chơi' },
        requestId: request.id,
      });
    }
  };
}

/** Default gate; `registerOnboardingGate` reuses this exact instance so a route
 * that already lists it (see `invitations/routes.ts`) is not gated twice. */
export const requireOnboarded = createRequireOnboarded({ hasUsername });

/**
 * Append the gate to every route registered after this call. Must run before the
 * feature route plugins (`authRoutes`, `friendsRoutes`, ...) are registered.
 */
export function registerOnboardingGate(
  app: FastifyInstance,
  deps?: OnboardingGateDeps,
): void {
  // No deps → reuse the default instance so a route that already lists
  // `requireOnboarded` (see `invitations/routes.ts`) is not gated twice.
  const gate = deps ? createRequireOnboarded(deps) : requireOnboarded;

  app.addHook('onRoute', (routeOptions) => {
    const existing = routeOptions.preHandler;
    const list = Array.isArray(existing) ? [...existing] : existing ? [existing] : [];
    if (list.includes(gate)) return;
    routeOptions.preHandler = [...list, gate];
  });
}
