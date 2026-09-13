/**
 * Rooms domain service.
 * Handles room creation, membership, ready state, visibility, and control leases.
 */
import crypto from 'node:crypto';
import type pg from 'pg';
import { getPool } from '../../db/pool.js';
import { withTransaction } from '../../db/transaction.js';
import type {
  RoomDTO,
  RoomMemberDTO,
  Visibility,
  TimeControl,
  ControllerLease,
} from '@xiangqi/contracts';
import { defaultPresence } from '../../realtime/presence.js';

export async function createRoom(
  userId: string,
  data: { name: string; visibility?: Visibility; timeControl?: TimeControl },
  pool?: pg.Pool,
): Promise<RoomDTO> {
  const p = pool ?? getPool();

  return withTransaction(async (client) => {
    // 1. Check if user is already in an active room
    const activeCheck = await client.query(
      'SELECT room_id FROM public.active_players WHERE user_id = $1',
      [userId],
    );
    if (activeCheck.rowCount! > 0) {
      throw { statusCode: 409, code: 'ALREADY_IN_ROOM', message: 'Bạn đang ở trong một phòng khác' };
    }

    const roomId = crypto.randomUUID();
    const visibility = data.visibility ?? 'PUBLIC';
    const timeControl = data.timeControl ?? 0;

    // 2. Insert room
    const roomRes = await client.query(
      `INSERT INTO public.rooms (id, name, owner_id, visibility, status, time_control, room_version)
       VALUES ($1, $2, $3, $4, 'WAITING', $5, 1)
       RETURNING *`,
      [roomId, data.name, userId, visibility, timeControl],
    );

    // 3. Add creator as RED player
    await client.query(
      `INSERT INTO public.room_members (room_id, user_id, role, side, ready)
       VALUES ($1, $2, 'PLAYER', 'RED', false)`,
      [roomId, userId],
    );

    // 4. Mark user as active player
    await client.query(
      `INSERT INTO public.active_players (user_id, room_id, created_at)
       VALUES ($1, $2, now())`,
      [userId, roomId],
    );

    const room = roomRes.rows[0];
    const members: RoomMemberDTO[] = [
      {
        userId,
        role: 'PLAYER',
        side: 'RED',
        online: defaultPresence.isUserOnline(userId, Date.now()),
        ready: false,
      },
    ];

    return {
      id: room.id,
      name: room.name,
      ownerId: room.owner_id,
      visibility: room.visibility,
      status: room.status,
      roomVersion: room.room_version,
      timeControl: room.time_control,
      members,
      currentMatchId: room.current_match_id,
    };
  }, p);
}

export async function listPublicRooms(pool?: pg.Pool): Promise<RoomDTO[]> {
  const p = pool ?? getPool();
  const client = await p.connect();

  try {
    const res = await client.query(
      `SELECT r.*,
              json_agg(
                json_build_object(
                  'userId', rm.user_id,
                  'role', rm.role,
                  'side', rm.side,
                  'ready', rm.ready
                )
              ) AS members
       FROM public.rooms r
       LEFT JOIN public.room_members rm ON rm.room_id = r.id
       WHERE r.visibility = 'PUBLIC' AND r.status IN ('WAITING', 'PLAYING')
       GROUP BY r.id
       ORDER BY r.created_at DESC
       LIMIT 20`,
    );

    const now = Date.now();
    return res.rows.map((row) => ({
      id: row.id,
      name: row.name,
      ownerId: row.owner_id,
      visibility: row.visibility,
      status: row.status,
      roomVersion: row.room_version,
      timeControl: row.time_control,
      members: (row.members || []).map((m: Record<string, unknown>) => ({
        userId: m['userId'] as string,
        role: m['role'] as 'PLAYER' | 'SPECTATOR',
        side: (m['side'] as 'RED' | 'BLACK' | null) ?? null,
        online: defaultPresence.isUserOnline(m['userId'] as string, now),
        ready: Boolean(m['ready']),
      })),
      currentMatchId: row.current_match_id,
    }));
  } finally {
    client.release();
  }
}

export async function getRoom(
  roomId: string,
  userId: string,
  pool?: pg.Pool,
): Promise<RoomDTO> {
  const p = pool ?? getPool();
  const client = await p.connect();

  try {
    // 1. Verify membership
    const memberCheck = await client.query(
      'SELECT role FROM public.room_members WHERE room_id = $1 AND user_id = $2',
      [roomId, userId],
    );
    if (memberCheck.rowCount === 0) {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'Bạn không phải thành viên của phòng này' };
    }

    // 2. Fetch room and members
    const roomRes = await client.query('SELECT * FROM public.rooms WHERE id = $1', [roomId]);
    if (roomRes.rowCount === 0) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Phòng không tồn tại' };
    }

    const membersRes = await client.query(
      'SELECT user_id, role, side, ready FROM public.room_members WHERE room_id = $1',
      [roomId],
    );

    const now = Date.now();
    const members: RoomMemberDTO[] = membersRes.rows.map((m) => ({
      userId: m.user_id,
      role: m.role,
      side: m.side,
      online: defaultPresence.isUserOnline(m.user_id, now),
      ready: m.ready,
    }));

    const room = roomRes.rows[0];
    return {
      id: room.id,
      name: room.name,
      ownerId: room.owner_id,
      visibility: room.visibility,
      status: room.status,
      roomVersion: room.room_version,
      timeControl: room.time_control,
      members,
      currentMatchId: room.current_match_id,
    };
  } finally {
    client.release();
  }
}

export async function patchRoom(
  roomId: string,
  userId: string,
  updates: { name?: string; visibility?: Visibility; timeControl?: TimeControl },
  pool?: pg.Pool,
): Promise<RoomDTO> {
  const p = pool ?? getPool();

  return withTransaction(async (client) => {
    // Lock room
    const roomRes = await client.query(
      'SELECT * FROM public.rooms WHERE id = $1 FOR UPDATE',
      [roomId],
    );
    if (roomRes.rowCount === 0) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Phòng không tồn tại' };
    }

    const room = roomRes.rows[0];
    if (room.owner_id !== userId) {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'Chỉ chủ phòng mới có quyền chỉnh sửa' };
    }

    // timeControl mutable only in WAITING status
    if (updates.timeControl !== undefined && room.status !== 'WAITING') {
      throw { statusCode: 409, code: 'CONFLICT', message: 'Không thể đổi thời gian khi phòng không ở trạng thái chờ' };
    }

    const newName = updates.name ?? room.name;
    const newVis = updates.visibility ?? room.visibility;
    const newTc = updates.timeControl ?? room.time_control;
    const newVersion = room.room_version + 1;

    // If locking room: revoke all spectators per spec
    if (newVis === 'LOCKED') {
      await client.query(
        'DELETE FROM public.room_members WHERE room_id = $1 AND role = \'SPECTATOR\'',
        [roomId],
      );
      await client.query(
        'UPDATE public.invitations SET status = \'REVOKED\' WHERE room_id = $1 AND role = \'SPECTATOR\'',
        [roomId],
      );
    }

    await client.query(
      `UPDATE public.rooms
       SET name = $1, visibility = $2, time_control = $3, room_version = $4, updated_at = now()
       WHERE id = $5`,
      [newName, newVis, newTc, newVersion, roomId],
    );

    return getRoom(roomId, userId, p);
  }, p);
}

export async function setReady(
  roomId: string,
  userId: string,
  ready: boolean,
  pool?: pg.Pool,
): Promise<{ room: RoomDTO; canStart: boolean }> {
  const p = pool ?? getPool();

  return withTransaction(async (client) => {
    const memberRes = await client.query(
      'SELECT role, side FROM public.room_members WHERE room_id = $1 AND user_id = $2',
      [roomId, userId],
    );
    if (memberRes.rowCount === 0) {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'Không phải thành viên phòng' };
    }
    if (memberRes.rows[0].role !== 'PLAYER') {
      throw { statusCode: 400, code: 'VALIDATION_ERROR', message: 'Chỉ người chơi mới có thể sẵn sàng' };
    }

    await client.query(
      'UPDATE public.room_members SET ready = $1 WHERE room_id = $2 AND user_id = $3',
      [ready, roomId, userId],
    );

    // Bump room version
    await client.query(
      'UPDATE public.rooms SET room_version = room_version + 1, updated_at = now() WHERE id = $1',
      [roomId],
    );

    // Check if both players ready
    const playersRes = await client.query(
      'SELECT side, ready FROM public.room_members WHERE room_id = $1 AND role = \'PLAYER\'',
      [roomId],
    );

    const hasRed = playersRes.rows.some((p) => p.side === 'RED' && p.ready);
    const hasBlack = playersRes.rows.some((p) => p.side === 'BLACK' && p.ready);
    const canStart = playersRes.rowCount === 2 && hasRed && hasBlack;

    const room = await getRoom(roomId, userId, p);
    return { room, canStart };
  }, p);
}

export async function leaveRoom(
  roomId: string,
  userId: string,
  pool?: pg.Pool,
): Promise<{ closed: boolean; left: boolean }> {
  const p = pool ?? getPool();

  return withTransaction(async (client) => {
    const roomRes = await client.query(
      'SELECT * FROM public.rooms WHERE id = $1 FOR UPDATE',
      [roomId],
    );
    if (roomRes.rowCount === 0) {
      return { closed: false, left: false };
    }

    const room = roomRes.rows[0];

    // If owner leaves WAITING room: close the entire room
    if (room.owner_id === userId && room.status === 'WAITING') {
      await client.query('UPDATE public.rooms SET status = \'CLOSED\', closed_at = now() WHERE id = $1', [roomId]);
      // Remove all members from active_players
      await client.query('DELETE FROM public.active_players WHERE room_id = $1', [roomId]);
      await client.query('DELETE FROM public.room_members WHERE room_id = $1', [roomId]);
      return { closed: true, left: true };
    }

    // Guest leaves: remove member, reset ready on other player
    await client.query(
      'DELETE FROM public.room_members WHERE room_id = $1 AND user_id = $2',
      [roomId, userId],
    );
    await client.query(
      'DELETE FROM public.active_players WHERE user_id = $1 AND room_id = $2',
      [userId, roomId],
    );

    // Reset ready on remaining players
    await client.query(
      'UPDATE public.room_members SET ready = false WHERE room_id = $1',
      [roomId],
    );

    // Bump room version
    await client.query(
      'UPDATE public.rooms SET room_version = room_version + 1 WHERE id = $1',
      [roomId],
    );

    return { closed: false, left: true };
  }, p);
}

export async function takeoverControl(
  userId: string,
  tabId: string,
  pool?: pg.Pool,
): Promise<ControllerLease> {
  const p = pool ?? getPool();
  const client = await p.connect();

  try {
    const controllerId = crypto.randomUUID();
    // Upsert client control record and bump epoch
    const res = await client.query(
      `INSERT INTO public.client_controls (user_id, tab_id, controller_id, control_epoch, updated_at)
       VALUES ($1, $2, $3, 1, now())
       ON CONFLICT (user_id) DO UPDATE
       SET tab_id = EXCLUDED.tab_id,
           controller_id = EXCLUDED.controller_id,
           control_epoch = public.client_controls.control_epoch + 1,
           updated_at = now()
       RETURNING controller_id, control_epoch`,
      [userId, tabId, controllerId],
    );

    const row = res.rows[0];
    return {
      controllerId: row.controller_id,
      controlEpoch: row.control_epoch,
    };
  } finally {
    client.release();
  }
}
