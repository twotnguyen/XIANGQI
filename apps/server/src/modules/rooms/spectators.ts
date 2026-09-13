/**
 * Spectator management service.
 * Enforces:
 * - Max 5 spectators per room
 * - Room lock before spectator counting to prevent race conditions
 * - Revocation of spectator memberships when a room becomes LOCKED
 */
import type pg from 'pg';
import { getPool } from '../../db/pool.js';
import { withTransaction } from '../../db/transaction.js';
import { readRoomWithClient } from './service.js';
import type { RoomDTO } from '@xiangqi/contracts';

export const MAX_SPECTATORS = 5;

export type SpectatorRevokeReason = 'ROOM_LOCKED' | 'ROOM_CLOSED';

/** Result of a spectator revocation; also the `access:revoked` payload shape (spec 04). */
export interface SpectatorRevocation {
  roomId: string;
  reason: SpectatorRevokeReason;
  revokedUserIds: string[];
  roomVersion: number;
}

type AccessRevokedNotice = {
  roomId: string;
  reason: SpectatorRevokeReason;
  roomVersion: number;
};

type AccessRevokedListener = (notice: AccessRevokedNotice) => void;
const accessRevokedListeners = new Set<AccessRevokedListener>();

/**
 * In-process hook for local subscribers (media generation rotation). The
 * network emit is `emitAccessRevoked` from `realtime/events.ts`.
 */
export function onAccessRevoked(listener: AccessRevokedListener): () => void {
  accessRevokedListeners.add(listener);
  return () => accessRevokedListeners.delete(listener);
}

/** Fan out a revocation to in-process listeners. Call after commit. */
export function notifyAccessRevoked(notice: AccessRevokedNotice): void {
  for (const listener of accessRevokedListeners) {
    try {
      listener(notice);
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
      return readRoomWithClient(client, roomId, userId);
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

    return readRoomWithClient(client, roomId, userId);
  }, p);
}

/**
 * Revoke every spectator membership of a room (room becoming LOCKED/CLOSED).
 *
 * Runs inside the caller's transaction while the caller already holds
 * `rooms FOR UPDATE` (spec 09 lock order), so no lock is taken here. Bumps
 * `room_version` once and returns the affected user ids plus the new version;
 * the caller emits `access:revoked` AFTER commit (never inside the tx).
 */
export async function revokeSpectators(
  tx: pg.PoolClient,
  roomId: string,
  reason: SpectatorRevokeReason,
): Promise<SpectatorRevocation> {
  const versionRes = await tx.query(
    `UPDATE public.rooms
     SET room_version = room_version + 1, updated_at = now()
     WHERE id = $1
     RETURNING room_version`,
    [roomId],
  );
  if (versionRes.rowCount === 0) {
    throw { statusCode: 404, code: 'NOT_FOUND', message: 'Phòng không tồn tại' };
  }

  const deleted = await tx.query(
    `DELETE FROM public.room_members
     WHERE room_id = $1 AND role = 'SPECTATOR'
     RETURNING user_id`,
    [roomId],
  );

  return {
    roomId,
    reason,
    revokedUserIds: deleted.rows.map((row) => row.user_id as string),
    roomVersion: versionRes.rows[0].room_version as number,
  };
}
