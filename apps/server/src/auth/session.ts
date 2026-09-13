/**
 * Session verification and revocation.
 * Calls DB function `private.is_auth_session_active` using pg pool with role app_server.
 */
import type pg from 'pg';
import { getPool } from '../db/pool.js';

/** Revoked rows live at least this long (spec 05: >= max(24h, JWT lifetime + 60s skew)). */
const MIN_REVOKED_RETENTION_SQL = "interval '24 hours'";

/**
 * Check if a Supabase Auth session is currently active in DB.
 * Uses private.is_auth_session_active(session_id, user_id).
 * Called from `requireAuth` for every authenticated request (F-05).
 */
export async function isSessionActive(
  sessionId: string,
  userId: string,
  pool?: pg.Pool,
): Promise<boolean> {
  const p = pool ?? getPool();
  const client = await p.connect();
  try {
    const res = await client.query(
      'SELECT private.is_auth_session_active($1::uuid, $2::uuid) AS active',
      [sessionId, userId],
    );
    return res.rows[0]?.active === true;
  } finally {
    client.release();
  }
}

/**
 * Record a revoked session in private.revoked_sessions.
 *
 * `expiresAtMs` is the access-token expiry (JWT `exp` in epoch ms) when known;
 * it is clamped up to the 24h minimum so the CHECK (expires_at > revoked_at)
 * always holds and short-lived tokens keep their revocation row long enough
 * for the refresh window.
 */
export async function recordRevokedSession(
  sessionId: string,
  userId: string,
  expiresAtMs?: number | null,
  pool?: pg.Pool,
): Promise<void> {
  const p = pool ?? getPool();
  const client = await p.connect();
  try {
    await client.query(
      `INSERT INTO private.revoked_sessions (session_id, user_id, revoked_at, expires_at)
       VALUES (
         $1::uuid,
         $2::uuid,
         now(),
         GREATEST(
           now() + ${MIN_REVOKED_RETENTION_SQL},
           COALESCE(to_timestamp($3::double precision / 1000) + interval '60 seconds', now())
         )
       )
       ON CONFLICT (session_id) DO NOTHING`,
      [sessionId, userId, expiresAtMs ?? null],
    );
  } finally {
    client.release();
  }
}
