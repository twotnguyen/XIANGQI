/**
 * Spectator management service.
 * Enforces:
 * - Max 5 spectators per room
 * - Room lock before spectator counting to prevent race conditions
 * - Revocation of spectators when room visibility changes to LOCKED
 * - Event broadcast for access:revoked
 */
import type pg from 'pg';
import { getPool } from '../../db/pool.js';
import { withTransaction } from '../../db/transaction.js';
import { getRoom } from './service.js';
import type { RoomDTO } from '@xiangqi/contracts';

export const MAX_SPECTATORS = 5;

type RevokeListener = (data: { roomId: string; reason: string; roomVersion: number }) => void;
const revokeListeners = new Set<RevokeListener>();

export function onAccessRevoked(listener: RevokeListener): () => void {
  revokeListeners.add(listener);
  return () => revokeListeners.delete(listener);
}

export function emitAccessRevoked(data: { roomId: string; reason: string; roomVersion: number }): void {
  for (const listener of revokeListeners) {
    try {
      listener(data);
    } catch (err) {
      console.error('Access revoked listener error:', err);
    }
  }
}

/**
 * Admit a user as spectator.
 * Locks room and checks spectator count < 5 within transaction.
 */
export async function admitSpectator(
  roomId: string,
  userId: string,
  pool?: pg.Pool,
): Promise<RoomDTO> {
  const p = pool ?? getPool();

  return withTransaction(async (client) => {
    // 1. Lock room FOR UPDATE
    const roomRes = await client.query(
      'SELECT id, visibility, status, room_version FROM public.rooms WHERE id = $1 FOR UPDATE',
      [roomId],
    );
    if (roomRes.rowCount === 0) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Phòng không tồn tại' };
    }

    const room = roomRes.rows[0];
    if (room.visibility === 'LOCKED') {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'Phòng đã bị khóa' };
    }

    // 2. Check existing membership
    const existing = await client.query(
      'SELECT role FROM public.room_members WHERE room_id = $1 AND user_id = $2',
      [roomId, userId],
    );
    if (existing.rowCount! > 0) {
      return getRoom(roomId, userId, p);
    }

    // 3. Count spectators within lock
    const countRes = await client.query(
      'SELECT count(*) FROM public.room_members WHERE room_id = $1 AND role = \'SPECTATOR\'',
      [roomId],
    );
    const count = Number(countRes.rows[0].count);

    if (count >= MAX_SPECTATORS) {
      throw { statusCode: 409, code: 'ROOM_FULL', message: 'Phòng đã đạt tối đa 5 người xem' };
    }

    // 4. Insert spectator member
    await client.query(
      `INSERT INTO public.room_members (room_id, user_id, role, side, ready)
       VALUES ($1, $2, 'SPECTATOR', NULL, false)`,
      [roomId, userId],
    );

    return getRoom(roomId, userId, p);
  }, p);
}

/**
 * Revoke all spectators from a room (e.g. when room is LOCKED).
 * Bumps room_version, removes spectator members, emits access:revoked.
 */
export async function revokeSpectators(
  roomId: string,
  reason: string,
  pool?: pg.Pool,
): Promise<{ revokedCount: number; newRoomVersion: number }> {
  const p = pool ?? getPool();
  let emitData: { roomId: string; reason: string; roomVersion: number } | null = null;

  const result = await withTransaction(async (client) => {
    // 1. Lock room
    const roomRes = await client.query(
      'SELECT room_version FROM public.rooms WHERE id = $1 FOR UPDATE',
      [roomId],
    );
    if (roomRes.rowCount === 0) return { revokedCount: 0, newRoomVersion: 0 };

    const newVersion = roomRes.rows[0].room_version + 1;

    // 2. Remove all spectator members
    const deleteRes = await client.query(
      'DELETE FROM public.room_members WHERE room_id = $1 AND role = \'SPECTATOR\'',
      [roomId],
    );
    const revokedCount = deleteRes.rowCount ?? 0;

    // 3. Bump room version
    await client.query(
      'UPDATE public.rooms SET room_version = $1, updated_at = now() WHERE id = $2',
      [newVersion, roomId],
    );

    emitData = { roomId, reason, roomVersion: newVersion };
    return { revokedCount, newRoomVersion: newVersion };
  }, p);

  // Emit event after transaction commits
  if (emitData) {
    emitAccessRevoked(emitData);
  }

  return result;
}
