/**
 * Media domain service.
 * Manages media policy, short-lived session grants, and automatic SFU revocation.
 */
import type pg from 'pg';
import { getPool } from '../../db/pool.js';
import { createMediaTransports, type UserMediaPolicy } from './transport.js';
import { getRoomGeneration, rotateRoomGeneration } from './reconciler.js';
import { onAccessRevoked } from '../rooms/spectators.js';
import type { MediaSessionDTO, MediaScope, MediaTrack } from '@xiangqi/contracts';

// In-memory policy map: Map<`${roomId}:${userId}`, UserMediaPolicy>
const userPolicies = new Map<string, UserMediaPolicy>();

// Hook: when spectator access is revoked (e.g. room LOCKED), rotate SFU generation
onAccessRevoked(async ({ roomId }) => {
  await rotateRoomGeneration(roomId);
});

export function getUserMediaPolicy(roomId: string, userId: string): UserMediaPolicy {
  const key = `${roomId}:${userId}`;
  return userPolicies.get(key) ?? { camera: 'OFF', microphone: 'OFF' };
}

export async function updateMediaPolicy(
  userId: string,
  roomId: string,
  track: MediaTrack,
  scope: MediaScope,
  pool?: pg.Pool,
): Promise<UserMediaPolicy> {
  const p = pool ?? getPool();
  const client = await p.connect();

  try {
    // 1. Verify user is a player in this room
    const memberRes = await client.query(
      'SELECT role FROM public.room_members WHERE room_id = $1 AND user_id = $2',
      [roomId, userId],
    );
    if (memberRes.rowCount === 0) {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'Bạn không phải thành viên phòng' };
    }
    if (memberRes.rows[0].role !== 'PLAYER') {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'Chỉ người chơi mới có quyền bật/tắt thiết bị' };
    }

    const key = `${roomId}:${userId}`;
    const current = getUserMediaPolicy(roomId, userId);
    const oldScope = current[track];

    const updated: UserMediaPolicy = {
      ...current,
      [track]: scope,
    };
    userPolicies.set(key, updated);

    // If restricting from PUBLIC to OPPONENT_ONLY/OFF, rotate generation so spectators lose access immediately
    if (oldScope === 'PUBLIC' && scope !== 'PUBLIC') {
      await rotateRoomGeneration(roomId);
    }

    return updated;
  } finally {
    client.release();
  }
}

export async function getMediaSession(
  userId: string,
  roomId: string,
  pool?: pg.Pool,
): Promise<MediaSessionDTO> {
  const p = pool ?? getPool();
  const client = await p.connect();

  try {
    // 1. Verify membership
    const memberRes = await client.query(
      'SELECT role FROM public.room_members WHERE room_id = $1 AND user_id = $2',
      [roomId, userId],
    );
    if (memberRes.rowCount === 0) {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'Bạn không có quyền truy cập media phòng này' };
    }

    const role = memberRes.rows[0].role as 'PLAYER' | 'SPECTATOR';
    const generation = getRoomGeneration(roomId);
    const policy = getUserMediaPolicy(roomId, userId);

    const transports = await createMediaTransports(userId, roomId, generation, role, policy);

    return {
      roomId,
      transports,
    };
  } finally {
    client.release();
  }
}
