/**
 * Session verification and revocation.
 * Calls DB function `private.is_auth_session_active` using pg pool with role app_server.
 */
import type pg from 'pg';
import { getPool } from '../db/pool.js';

/**
 * Check if a Supabase Auth session is currently active in DB.
 * Uses private.is_auth_session_active(session_id, user_id)
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
 */
export async function recordRevokedSession(
  sessionId: string,
  userId: string,
  pool?: pg.Pool,
): Promise<void> {
  const p = pool ?? getPool();
  const client = await p.connect();
  try {
    await client.query(
      `INSERT INTO private.revoked_sessions (session_id, user_id, revoked_at)
       VALUES ($1::uuid, $2::uuid, now())
       ON CONFLICT (session_id) DO NOTHING`,
      [sessionId, userId],
    );
  } finally {
    client.release();
  }
}
