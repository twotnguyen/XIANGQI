/**
 * Invitations domain service.
 * Handles direct friend invites, shareable links, room codes, and atomic join.
 */
import crypto from 'node:crypto';
import type pg from 'pg';
import { getPool } from '../../db/pool.js';
import { withTransaction } from '../../db/transaction.js';
import { getRoom } from '../rooms/service.js';
import type { InvitationDTO, RoomDTO, MemberRole } from '@xiangqi/contracts';

// Code alphabet: 32 unambiguous uppercase alphanumeric characters (no 0/O, 1/I)
const CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

export function generateCode(): string {
  const bytes = crypto.randomBytes(8);
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += CODE_ALPHABET[bytes[i]! % CODE_ALPHABET.length];
  }
  return code;
}

export function generateToken(): { token: string; tokenHash: string } {
  const token = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  return { token, tokenHash };
}

export async function createInvitation(
  inviterId: string,
  roomId: string,
  options: { recipientId?: string; role?: MemberRole },
  pool?: pg.Pool,
): Promise<InvitationDTO & { rawToken?: string }> {
  const p = pool ?? getPool();
  const role = options.role ?? 'PLAYER';

  return withTransaction(async (client) => {
    // Verify room exists and inviter is a member
    const roomCheck = await client.query(
      'SELECT id, status FROM public.rooms WHERE id = $1',
      [roomId],
    );
    if (roomCheck.rowCount === 0) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Phòng không tồn tại' };
    }

    const inviterCheck = await client.query(
      'SELECT role FROM public.room_members WHERE room_id = $1 AND user_id = $2',
      [roomId, inviterId],
    );
    if (inviterCheck.rowCount === 0) {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'Không phải thành viên phòng' };
    }

    if (options.recipientId) {
      // Direct invite: recipient must be an accepted friend per spec
      const minUser = inviterId < options.recipientId ? inviterId : options.recipientId;
      const maxUser = inviterId < options.recipientId ? options.recipientId : inviterId;

      const friendCheck = await client.query(
        'SELECT id FROM public.friend_relations WHERE user_low = $1 AND user_high = $2 AND status = \'ACCEPTED\'',
        [minUser, maxUser],
      );
      if (friendCheck.rowCount === 0) {
        throw { statusCode: 403, code: 'FORBIDDEN', message: 'Chỉ có thể mời trực tiếp bạn bè' };
      }

      // TTL: 10 minutes for direct invite
      const id = crypto.randomUUID();
      const res = await client.query(
        `INSERT INTO public.invitations (id, room_id, inviter_id, recipient_id, role, status, expires_at)
         VALUES ($1, $2, $3, $4, $5, 'PENDING', now() + interval '10 minutes')
         RETURNING *`,
        [id, roomId, inviterId, options.recipientId, role],
      );

      const row = res.rows[0];
      return {
        id: row.id,
        roomId: row.room_id,
        inviterId: row.inviter_id,
        recipientId: row.recipient_id,
        role: row.role,
        code: null,
        status: row.status,
        expiresAt: row.expires_at,
        createdAt: row.created_at,
      };
    } else {
      // Shareable invite: generate code and token
      const id = crypto.randomUUID();
      const code = generateCode();
      const { token, tokenHash } = generateToken();

      // TTL: 24 hours for shareable invite
      const res = await client.query(
        `INSERT INTO public.invitations (id, room_id, inviter_id, role, code, token_hash, status, expires_at)
         VALUES ($1, $2, $3, $4, $5, $6, 'PENDING', now() + interval '24 hours')
         RETURNING *`,
        [id, roomId, inviterId, role, code, tokenHash],
      );

      const row = res.rows[0];
      return {
        id: row.id,
        roomId: row.room_id,
        inviterId: row.inviter_id,
        recipientId: null,
        role: row.role,
        code: row.code,
        rawToken: token,
        status: row.status,
        expiresAt: row.expires_at,
        createdAt: row.created_at,
      };
    }
  }, p);
}

export async function getReceivedInvitations(
  userId: string,
  pool?: pg.Pool,
): Promise<InvitationDTO[]> {
  const p = pool ?? getPool();
  const client = await p.connect();

  try {
    const res = await client.query(
      `SELECT * FROM public.invitations
       WHERE recipient_id = $1 AND status = 'PENDING' AND expires_at > now()
       ORDER BY created_at DESC
       LIMIT 20`,
      [userId],
    );

    return res.rows.map((row) => ({
      id: row.id,
      roomId: row.room_id,
      inviterId: row.inviter_id,
      recipientId: row.recipient_id,
      role: row.role,
      code: row.code,
      status: row.status,
      expiresAt: row.expires_at,
      createdAt: row.created_at,
    }));
  } finally {
    client.release();
  }
}

export async function respondToInvitation(
  userId: string,
  invitationId: string,
  accept: boolean,
  pool?: pg.Pool,
): Promise<{ room?: RoomDTO; removed: boolean }> {
  const p = pool ?? getPool();

  return withTransaction(async (client) => {
    const invRes = await client.query(
      `SELECT * FROM public.invitations
       WHERE id = $1 AND recipient_id = $2 FOR UPDATE`,
      [invitationId, userId],
    );

    if (invRes.rowCount === 0) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Lời mời không tồn tại' };
    }

    const inv = invRes.rows[0];

    // Check expiry or already processed
    if (inv.status !== 'PENDING' || new Date(inv.expires_at) <= new Date()) {
      throw { statusCode: 403, code: 'INVITE_INVALID', message: 'Lời mời đã hết hạn hoặc không còn hiệu lực' };
    }

    if (!accept) {
      await client.query(
        'UPDATE public.invitations SET status = \'REVOKED\' WHERE id = $1',
        [invitationId],
      );
      return { removed: true };
    }

    // Accept: join the room as player
    // Check if user is already in active room
    const activeCheck = await client.query(
      'SELECT room_id FROM public.active_players WHERE user_id = $1',
      [userId],
    );
    if (activeCheck.rowCount! > 0) {
      throw { statusCode: 409, code: 'ALREADY_IN_ROOM', message: 'Bạn đang ở trong một phòng khác' };
    }

    // Lock room and check player slots
    const roomRes = await client.query(
      'SELECT * FROM public.rooms WHERE id = $1 FOR UPDATE',
      [inv.room_id],
    );
    if (roomRes.rowCount === 0 || roomRes.rows[0].status !== 'WAITING') {
      throw { statusCode: 409, code: 'ROOM_CLOSED', message: 'Phòng không còn nhận người chơi' };
    }

    const membersRes = await client.query(
      'SELECT role, side FROM public.room_members WHERE room_id = $1',
      [inv.room_id],
    );

    const redTaken = membersRes.rows.some((m) => m.side === 'RED' && m.role === 'PLAYER');
    const blackTaken = membersRes.rows.some((m) => m.side === 'BLACK' && m.role === 'PLAYER');

    if (redTaken && blackTaken) {
      throw { statusCode: 409, code: 'ROOM_FULL', message: 'Phòng đã đủ 2 người chơi' };
    }

    const assignedSide = !redTaken ? 'RED' : 'BLACK';

    // Insert member
    await client.query(
      `INSERT INTO public.room_members (room_id, user_id, role, side, ready)
       VALUES ($1, $2, 'PLAYER', $3, false)`,
      [inv.room_id, userId, assignedSide],
    );

    // Add to active_players
    await client.query(
      `INSERT INTO public.active_players (user_id, room_id, created_at)
       VALUES ($1, $2, now())`,
      [userId, inv.room_id],
    );

    // Consume invitation
    await client.query(
      'UPDATE public.invitations SET status = \'ACCEPTED\' WHERE id = $1',
      [invitationId],
    );

    const room = await getRoom(inv.room_id, userId, p);
    return { room, removed: false };
  }, p);
}

export async function joinRoom(
  userId: string,
  locator: { roomId?: string; code?: string; token?: string },
  requestedRole: MemberRole,
  pool?: pg.Pool,
): Promise<RoomDTO> {
  const p = pool ?? getPool();

  const targetId = await withTransaction(async (client) => {
    let targetRoomId: string | null = null;
    let grantRole: MemberRole | null = null;
    let invitationIdToConsume: string | null = null;

    if (locator.roomId) {
      // Direct public room join: only SPECTATOR or public rooms
      const roomRes = await client.query(
        'SELECT id, visibility, status FROM public.rooms WHERE id = $1',
        [locator.roomId],
      );
      if (roomRes.rowCount === 0) {
        throw { statusCode: 404, code: 'NOT_FOUND', message: 'Phòng không tồn tại' };
      }
      targetRoomId = locator.roomId;
      grantRole = requestedRole;
    } else if (locator.code) {
      const codeUpper = locator.code.toUpperCase().trim();
      const invRes = await client.query(
        `SELECT * FROM public.invitations
         WHERE code = $1 AND status = 'PENDING' AND expires_at > now() FOR UPDATE`,
        [codeUpper],
      );
      if (invRes.rowCount === 0) {
        throw { statusCode: 403, code: 'INVITE_INVALID', message: 'Mã phòng không hợp lệ hoặc đã hết hạn' };
      }
      const inv = invRes.rows[0];
      targetRoomId = inv.room_id;
      grantRole = inv.role;
      // Single-use for PLAYER invites per spec
      if (inv.role === 'PLAYER') {
        invitationIdToConsume = inv.id;
      }
    } else if (locator.token) {
      const tokenHash = crypto.createHash('sha256').update(locator.token).digest('hex');
      const invRes = await client.query(
        `SELECT * FROM public.invitations
         WHERE token_hash = $1 AND status = 'PENDING' AND expires_at > now() FOR UPDATE`,
        [tokenHash],
      );
      if (invRes.rowCount === 0) {
        throw { statusCode: 403, code: 'INVITE_INVALID', message: 'Liên kết không hợp lệ hoặc đã hết hạn' };
      }
      const inv = invRes.rows[0];
      targetRoomId = inv.room_id;
      grantRole = inv.role;
      if (inv.role === 'PLAYER') {
        invitationIdToConsume = inv.id;
      }
    }

    if (!targetRoomId || !grantRole) {
      throw { statusCode: 403, code: 'INVITE_INVALID', message: 'Không tìm thấy phòng' };
    }

    // Role check: requested role must match grant role
    // Spec acceptance: WATCH code requesting PLAY → INVITE_INVALID (403)
    if (requestedRole !== grantRole) {
      throw { statusCode: 403, code: 'INVITE_INVALID', message: 'Vai trò yêu cầu không khớp với quyền mời' };
    }

    // Lock room
    const roomRes = await client.query(
      'SELECT * FROM public.rooms WHERE id = $1 FOR UPDATE',
      [targetRoomId],
    );
    if (roomRes.rowCount === 0) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Phòng không tồn tại' };
    }

    // Check existing membership
    const existingMember = await client.query(
      'SELECT role FROM public.room_members WHERE room_id = $1 AND user_id = $2',
      [targetRoomId, userId],
    );
    if (existingMember.rowCount! > 0) {
      return targetRoomId;
    }

    if (requestedRole === 'PLAYER') {
      // Check active rooms
      const activeCheck = await client.query(
        'SELECT room_id FROM public.active_players WHERE user_id = $1',
        [userId],
      );
      if (activeCheck.rowCount! > 0) {
        throw { statusCode: 409, code: 'ALREADY_IN_ROOM', message: 'Bạn đang ở trong phòng khác' };
      }

      // Check player seats
      const playersRes = await client.query(
        'SELECT side FROM public.room_members WHERE room_id = $1 AND role = \'PLAYER\'',
        [targetRoomId],
      );

      const redTaken = playersRes.rows.some((m) => m.side === 'RED');
      const blackTaken = playersRes.rows.some((m) => m.side === 'BLACK');

      if (redTaken && blackTaken) {
        throw { statusCode: 409, code: 'ROOM_FULL', message: 'Phòng đã đủ 2 người chơi' };
      }

      const assignedSide = !redTaken ? 'RED' : 'BLACK';

      await client.query(
        `INSERT INTO public.room_members (room_id, user_id, role, side, ready)
         VALUES ($1, $2, 'PLAYER', $3, false)`,
        [targetRoomId, userId, assignedSide],
      );

      await client.query(
        `INSERT INTO public.active_players (user_id, room_id, created_at)
         VALUES ($1, $2, now())`,
        [userId, targetRoomId],
      );
    } else {
      // SPECTATOR role: max 5 spectators per spec
      const spectatorsCount = await client.query(
        'SELECT count(*) FROM public.room_members WHERE room_id = $1 AND role = \'SPECTATOR\'',
        [targetRoomId],
      );
      if (Number(spectatorsCount.rows[0].count) >= 5) {
        throw { statusCode: 409, code: 'ROOM_FULL', message: 'Phòng đã đạt tối đa 5 người xem' };
      }

      await client.query(
        `INSERT INTO public.room_members (room_id, user_id, role, side, ready)
         VALUES ($1, $2, 'SPECTATOR', NULL, false)`,
        [targetRoomId, userId],
      );
    }

    // Consume single-use invitation if applicable
    if (invitationIdToConsume) {
      await client.query(
        'UPDATE public.invitations SET status = \'ACCEPTED\' WHERE id = $1',
        [invitationIdToConsume],
      );
    }

    return targetRoomId;
  }, p);

  return getRoom(targetId, userId, p);
}

export async function rotateWatchCode(
  ownerId: string,
  roomId: string,
  pool?: pg.Pool,
): Promise<{ code: string; token: string }> {
  const p = pool ?? getPool();

  return withTransaction(async (client) => {
    // Verify ownership
    const roomRes = await client.query(
      'SELECT owner_id FROM public.rooms WHERE id = $1',
      [roomId],
    );
    if (roomRes.rowCount === 0 || roomRes.rows[0].owner_id !== ownerId) {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'Chỉ chủ phòng mới có quyền đổi mã xem' };
    }

    // Revoke previous watch invitations
    await client.query(
      `UPDATE public.invitations
       SET status = 'REVOKED'
       WHERE room_id = $1 AND role = 'SPECTATOR' AND status = 'PENDING'`,
      [roomId],
    );

    // Create new watch invitation
    const id = crypto.randomUUID();
    const code = generateCode();
    const { token, tokenHash } = generateToken();

    await client.query(
      `INSERT INTO public.invitations (id, room_id, inviter_id, role, code, token_hash, status, expires_at)
       VALUES ($1, $2, $3, 'SPECTATOR', $4, $5, 'PENDING', now() + interval '24 hours')`,
      [id, roomId, ownerId, code, tokenHash],
    );

    return { code, token };
  }, p);
}
