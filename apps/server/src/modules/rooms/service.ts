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
import { emitAccessRevoked, emitControlRevoked, emitRoomUpdated } from '../../realtime/events.js';
import {
  notifyAccessRevoked,
  revokeSpectators,
  type SpectatorRevocation,
} from './spectators.js';

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

/**
 * Build a Room DTO through a specific client, so callers inside a transaction
 * read their own uncommitted writes (a fresh pool connection would not see them).
 */
export async function readRoomWithClient(
  client: pg.PoolClient,
  roomId: string,
  userId: string,
): Promise<RoomDTO> {
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
}

export async function getRoom(
  roomId: string,
  userId: string,
  pool?: pg.Pool,
): Promise<RoomDTO> {
  const p = pool ?? getPool();
  const client = await p.connect();

  try {
    return await readRoomWithClient(client, roomId, userId);
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

  const { room: updatedRoom, revocation } = await withTransaction(async (client) => {
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

    let newVersion = room.room_version + 1;
    let revoked: SpectatorRevocation | null = null;

    // Locking the room revokes spectator access immediately (ISSUE-016/F-07).
    if (newVis === 'LOCKED') {
      if (room.visibility !== 'LOCKED') {
        revoked = await revokeSpectators(client, roomId, 'ROOM_LOCKED');
        newVersion = revoked.roomVersion;
      }
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

    return { room: await readRoomWithClient(client, roomId, userId), revocation: revoked };
  }, p);

  // Emits happen strictly after commit (spec 03): a failed broadcast is
  // recovered by the client's resync, it never rolls back the room change.
  // After commit: membership/settings/visibility changes reach the room topic so
  // push-only clients (waiting room, lobby) do not need to poll.
  emitRoomUpdated({ roomId, room: updatedRoom });

  if (revocation) {
    emitAccessRevoked({
      roomId: revocation.roomId,
      reason: revocation.reason,
      roomVersion: revocation.roomVersion,
      userIds: revocation.revokedUserIds,
    });
    notifyAccessRevoked({
      roomId: revocation.roomId,
      reason: revocation.reason,
      roomVersion: revocation.roomVersion,
    });
  }

  return updatedRoom;
}

export async function setReady(
  roomId: string,
  userId: string,
  ready: boolean,
  pool?: pg.Pool,
): Promise<{ room: RoomDTO; canStart: boolean }> {
  const p = pool ?? getPool();

  const result = await withTransaction(async (client) => {
    // Lock the room first (spec 09 lock order) and only let WAITING rooms
    // signal a start: a second ready on an already-PLAYING room used to reach
    // startMatchFromRoom again and surface a DB unique-violation as HTTP 500.
    const roomRes = await client.query(
      'SELECT status FROM public.rooms WHERE id = $1 FOR UPDATE',
      [roomId],
    );
    if (roomRes.rowCount === 0) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Phòng không tồn tại' };
    }
    if (roomRes.rows[0].status !== 'WAITING') {
      throw { statusCode: 409, code: 'CONFLICT', message: 'Phòng không ở trạng thái chờ' };
    }

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

    const room = await readRoomWithClient(client, roomId, userId);
    return { room, canStart };
  }, p);

  emitRoomUpdated({ roomId, room: result.room });
  return result;
}

export async function leaveRoom(
  roomId: string,
  userId: string,
  pool?: pg.Pool,
): Promise<{ closed: boolean; left: boolean }> {
  const p = pool ?? getPool();

  const outcome = await withTransaction(async (client) => {
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
      return { closed: true, left: true, room: null };
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

    // Read the room through a remaining member: the leaver is no longer a member, and the
    // pushed DTO must reflect the seats after the departure.
    const remaining = await client.query(
      `SELECT user_id FROM public.room_members
        WHERE room_id = $1
        ORDER BY (role = 'PLAYER') DESC, joined_at ASC
        LIMIT 1`,
      [roomId],
    );
    const roomAfter =
      remaining.rowCount! > 0
        ? await readRoomWithClient(client, roomId, remaining.rows[0].user_id as string)
        : null;
    return { closed: false, left: true, room: roomAfter };
  }, p);

  if (outcome.room) emitRoomUpdated({ roomId, room: outcome.room });
  return { closed: outcome.closed, left: outcome.left };
}

export async function takeoverControl(
  userId: string,
  tabId: string,
  sessionId: string,
  pool?: pg.Pool,
): Promise<ControllerLease> {
  const p = pool ?? getPool();

  const { lease, context } = await withTransaction(async (client) => {
    // 1. Derive the caller's context server-side (spec 03: a tab never chooses
    //    another user's context): an existing room membership wins, otherwise
    //    the caller's own ACTIVE AI match.
    const roomCtx = await client.query(
      `SELECT rm.room_id, r.current_match_id, r.status
       FROM public.room_members rm
       JOIN public.rooms r ON r.id = rm.room_id
       WHERE rm.user_id = $1 AND r.status <> 'CLOSED'
       ORDER BY (rm.role = 'PLAYER') DESC, r.created_at DESC
       LIMIT 1`,
      [userId],
    );

    let roomId: string | null = null;
    let matchId: string | null = null;

    if (roomCtx.rowCount! > 0) {
      roomId = roomCtx.rows[0].room_id;
      // WAITING/FINISHED rooms use roomId only; an ACTIVE online match adds matchId.
      if (roomCtx.rows[0].status === 'PLAYING') {
        matchId = roomCtx.rows[0].current_match_id ?? null;
      }
    } else {
      const aiMatch = await client.query(
        `SELECT id FROM public.matches
         WHERE room_id IS NULL AND status = 'ACTIVE'
           AND (red_user_id = $1 OR black_user_id = $1)
         ORDER BY created_at DESC
         LIMIT 1`,
        [userId],
      );
      matchId = aiMatch.rows[0]?.id ?? null;
    }

    if (!roomId && !matchId) {
      throw { statusCode: 409, code: 'CONFLICT', message: 'Bạn chưa có ngữ cảnh phòng hoặc ván' };
    }

    // 2. Does a previous controller exist? Only then is there someone to revoke.
    const previous = await client.query(
      'SELECT controller_id FROM public.client_controls WHERE user_id = $1 FOR UPDATE',
      [userId],
    );
    const hadController = previous.rowCount! > 0;

    // 3. Upsert the lease using the real client_controls DDL
    //    (controller_tab_id/session_id/lease_until are NOT NULL).
    const controllerId = crypto.randomUUID();
    const res = await client.query(
      `INSERT INTO public.client_controls
         (user_id, room_id, match_id, controller_id, controller_tab_id, session_id,
          control_epoch, lease_until, disconnected_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, 1, now() + interval '30 seconds', NULL, now())
       ON CONFLICT (user_id) DO UPDATE
       SET room_id = EXCLUDED.room_id,
           match_id = EXCLUDED.match_id,
           controller_id = EXCLUDED.controller_id,
           controller_tab_id = EXCLUDED.controller_tab_id,
           session_id = EXCLUDED.session_id,
           control_epoch = public.client_controls.control_epoch + 1,
           lease_until = EXCLUDED.lease_until,
           disconnected_at = NULL,
           updated_at = now()
       RETURNING controller_id, control_epoch, room_id, match_id`,
      [userId, roomId, matchId, controllerId, tabId, sessionId],
    );

    const row = res.rows[0];
    return {
      lease: {
        controllerId: row.controller_id as string,
        controlEpoch: Number(row.control_epoch),
      },
      context: {
        userId,
        roomId: row.room_id as string | null,
        matchId: row.match_id as string | null,
        controlEpoch: Number(row.control_epoch),
        hadController,
      },
    };
  }, p);

  // Spec 03: bumping the epoch revokes the tab that held the previous lease.
  // Emitted after commit, never inside the transaction.
  if (context.hadController) {
    emitControlRevoked({
      userId: context.userId,
      roomId: context.roomId,
      matchId: context.matchId,
      controlEpoch: context.controlEpoch,
    });
  }

  return lease;
}

/** Context a guarded mutation acts on; the lease must cover it (spec 04). */
export interface ControlLeaseContext {
  roomId?: string | null;
  matchId?: string | null;
}

function controlRequired(message = 'Cần quyền điều khiển hợp lệ'): never {
  throw { statusCode: 403, code: 'CONTROL_REQUIRED', message };
}

/**
 * Reusable controller-lease guard for every control-gated mutation
 * (HTTP `X-Control-Id` / `X-Control-Epoch`, or the equivalent socket fields).
 *
 * Rejects with 403 CONTROL_REQUIRED when the lease is missing, belongs to a
 * different controller, carries a stale epoch (someone took over), or has expired
 * without a heartbeat. When `ctx` names a room/match, the lease must cover it.
 *
 * `lease_until` is refreshed by `presence:heartbeat` (spec 03: 30s lease / 10s
 * heartbeat), so a tab that stops heart-beating loses the right to write 30s later.
 */
export async function requireControlLease(
  userId: string,
  controllerId: string | undefined,
  controlEpoch: string | number | undefined,
  ctx: ControlLeaseContext = {},
  pool?: pg.Pool,
): Promise<ControllerLease> {
  if (!controllerId) controlRequired();

  const epoch = typeof controlEpoch === 'string' ? Number(controlEpoch) : controlEpoch;
  if (typeof epoch !== 'number' || !Number.isInteger(epoch) || epoch < 1) {
    controlRequired();
  }

  const p = pool ?? getPool();
  const client = await p.connect();
  try {
    const res = await client.query(
      `SELECT controller_id, control_epoch, room_id, match_id,
              (lease_until > now()) AS lease_live
       FROM public.client_controls
       WHERE user_id = $1`,
      [userId],
    );
    const row = res.rows[0];
    if (!row || row.controller_id !== controllerId || Number(row.control_epoch) !== epoch) {
      controlRequired();
    }
    if (row.lease_live !== true) {
      controlRequired('Quyền điều khiển đã hết hạn, hãy gửi heartbeat hoặc tiếp quản lại');
    }

    const coversRoom = ctx.roomId != null && row.room_id === ctx.roomId;
    let coversMatch = ctx.matchId != null && row.match_id === ctx.matchId;
    if (!coversMatch && ctx.matchId != null && row.room_id != null) {
      const matchRoom = await client.query<{ room_id: string | null }>(
        'SELECT room_id FROM public.matches WHERE id = $1',
        [ctx.matchId],
      );
      if (matchRoom.rows[0]?.room_id === row.room_id) {
        coversMatch = true;
      }
    }
    if ((ctx.roomId != null || ctx.matchId != null) && !coversRoom && !coversMatch) {
      controlRequired();
    }

    return { controllerId, controlEpoch: epoch };
  } finally {
    client.release();
  }
}
