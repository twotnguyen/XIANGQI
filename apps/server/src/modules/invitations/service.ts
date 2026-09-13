/**
 * Invitations domain service.
 * Handles direct friend invites, shareable links, room codes, and atomic join.
 *
 * The DB is authoritative (supabase/migrations/20260912000002_friends_rooms_members_invitations.sql,
 * spec 09 §5.4): `invitations` stores `sender_id`, `role IN ('PLAY','WATCH')`,
 * `status IN ('ACTIVE','CONSUMED','DECLINED','REVOKED','EXPIRED')` and 32-byte
 * HMAC-SHA256 digests in `token_hash`/`code_hash` — never the raw code/token.
 * The public DTO keeps the contract vocabulary (`inviterId`, `PLAYER`/`SPECTATOR`,
 * `PENDING`/`ACCEPTED`); {@link toInvitationDTO} is the only mapping point.
 */
import crypto from 'node:crypto';
import type pg from 'pg';
import { getPool } from '../../db/pool.js';
import { withTransaction } from '../../db/transaction.js';
import { getRoom } from '../rooms/service.js';
import { MAX_SPECTATORS } from '../rooms/spectators.js';
import { emitRoomUpdated } from '../../realtime/events.js';
import type {
  InvitationDTO,
  InvitationStatus,
  RoomDTO,
  MemberRole,
} from '@xiangqi/contracts';

// Code alphabet: 32 unambiguous uppercase alphanumeric characters (no 0/O, 1/I)
const CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

/** Direct invites live 10 minutes; shareable code+token grants 24 hours (spec 09 §5.4). */
const DIRECT_TTL_SQL = "interval '10 minutes'";
const SHARE_TTL_SQL = "interval '24 hours'";

/** Public `MemberRole` ↔ DB grant role (spec 04/09). */
const GRANT_ROLE: Record<MemberRole, 'PLAY' | 'WATCH'> = { PLAYER: 'PLAY', SPECTATOR: 'WATCH' };
const MEMBER_ROLE: Record<string, MemberRole> = { PLAY: 'PLAYER', WATCH: 'SPECTATOR' };

/**
 * DB lifecycle → public DTO status. The contract predates `DECLINED`; a declined
 * direct invite is no longer usable, so it is surfaced as `REVOKED`.
 */
const DTO_STATUS: Record<string, InvitationStatus> = {
  ACTIVE: 'PENDING',
  CONSUMED: 'ACCEPTED',
  DECLINED: 'REVOKED',
  REVOKED: 'REVOKED',
  EXPIRED: 'EXPIRED',
};

export function generateCode(): string {
  const bytes = crypto.randomBytes(8);
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += CODE_ALPHABET[bytes[i]! % CODE_ALPHABET.length];
  }
  return code;
}

/**
 * HMAC-SHA256 of one secret with a kind domain (`code:`/`token:`) so a code and a
 * token can never collide. The role is deliberately not part of the input: role is
 * read from the row after lookup. The key is `INVITE_HMAC_KEY` (server-only, spec 09
 * §5.4) and is read per call so the process environment wins over module load order.
 */
function digest(kind: 'code' | 'token', value: string): Buffer {
  const key = process.env['INVITE_HMAC_KEY'] ?? 'xiangqi-local-invite-hmac-key';
  return crypto.createHmac('sha256', key).update(`${kind}:${value}`).digest();
}

export function hashCode(code: string): Buffer {
  return digest('code', code.trim().toUpperCase());
}

export function hashToken(token: string): Buffer {
  return digest('token', token);
}

export function generateToken(): { token: string; tokenHash: Buffer } {
  const token = crypto.randomBytes(32).toString('hex');
  return { token, tokenHash: hashToken(token) };
}

/** Map one `public.invitations` row to the public DTO (raw code is never stored). */
function toInvitationDTO(row: Record<string, unknown>): InvitationDTO {
  return {
    id: row['id'] as string,
    roomId: row['room_id'] as string,
    inviterId: row['sender_id'] as string,
    recipientId: (row['recipient_id'] as string | null) ?? null,
    role: MEMBER_ROLE[row['role'] as string]!,
    code: null,
    status: DTO_STATUS[row['status'] as string]!,
    expiresAt: new Date(row['expires_at'] as string).toISOString(),
    createdAt: new Date(row['created_at'] as string).toISOString(),
  };
}

/** Mint a code whose ACTIVE `code_hash` does not exist yet (partial unique index). */
async function uniqueCode(client: pg.PoolClient): Promise<string> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateCode();
    const clash = await client.query(
      `SELECT 1 FROM public.invitations WHERE code_hash = $1 AND status = 'ACTIVE'`,
      [hashCode(code)],
    );
    if (clash.rowCount === 0) return code;
  }
  throw { statusCode: 500, code: 'INTERNAL_ERROR', message: 'Không thể sinh mã mời duy nhất' };
}

/**
 * Revoke the room's ACTIVE WATCH grants: re-issuing a watch code (rotating or not)
 * must make the previous code/token stop working. Terminal rows always carry
 * `resolved_at` (invitations_status_lifecycle_check).
 */
async function revokeWatchGrants(client: pg.PoolClient, roomId: string): Promise<void> {
  await client.query(
    `UPDATE public.invitations SET status = 'REVOKED', resolved_at = now()
      WHERE room_id = $1 AND status = 'ACTIVE' AND role = 'WATCH'`,
    [roomId],
  );
}

/**
 * Revoke every ACTIVE invitation of a room. Room close (owner leave) and match
 * finalize must call this inside the room transaction, after the room lock, so no
 * grant can outlive the room. Exported for `rooms/service.ts` and
 * `modules/matches/deadlines.ts`, which still issue stale `status = 'PENDING'`
 * updates that match no row on the live schema.
 */
export async function revokeRoomInvitations(
  client: pg.PoolClient,
  roomId: string,
): Promise<number> {
  const res = await client.query(
    `UPDATE public.invitations SET status = 'REVOKED', resolved_at = now()
      WHERE room_id = $1 AND status = 'ACTIVE'`,
    [roomId],
  );
  return res.rowCount ?? 0;
}

export async function createInvitation(
  inviterId: string,
  roomId: string,
  options: { recipientId?: string; role?: MemberRole },
  pool?: pg.Pool,
): Promise<InvitationDTO & { rawToken?: string }> {
  const p = pool ?? getPool();
  const requestedRole = options.role ?? 'PLAYER';

  return withTransaction(async (client) => {
    // Lock the room first (spec 09 lock order: room → invitations → user rows).
    const roomRes = await client.query(
      'SELECT id, status, watch_epoch FROM public.rooms WHERE id = $1 FOR UPDATE',
      [roomId],
    );
    if (roomRes.rowCount === 0) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Phòng không tồn tại' };
    }
    const room = roomRes.rows[0];
    if (room.status === 'CLOSED') {
      throw { statusCode: 409, code: 'ROOM_CLOSED', message: 'Phòng đã đóng' };
    }

    const inviterCheck = await client.query(
      'SELECT role FROM public.room_members WHERE room_id = $1 AND user_id = $2',
      [roomId, inviterId],
    );
    if (inviterCheck.rowCount === 0) {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'Không phải thành viên phòng' };
    }

    if (options.recipientId) {
      // Direct invite: recipient-bound PLAY only (invitations_direct_vs_share_check).
      if (requestedRole !== 'PLAYER') {
        throw {
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          message: 'Lời mời trực tiếp chỉ dành cho vai trò người chơi',
        };
      }
      if (options.recipientId === inviterId) {
        throw { statusCode: 400, code: 'VALIDATION_ERROR', message: 'Không thể tự mời chính mình' };
      }

      const recipient = options.recipientId;
      const minUser = inviterId < recipient ? inviterId : recipient;
      const maxUser = inviterId < recipient ? recipient : inviterId;
      const friendCheck = await client.query(
        `SELECT id FROM public.friend_relations
          WHERE user_low = $1 AND user_high = $2 AND status = 'ACCEPTED'`,
        [minUser, maxUser],
      );
      if (friendCheck.rowCount === 0) {
        throw { statusCode: 403, code: 'FORBIDDEN', message: 'Chỉ có thể mời trực tiếp bạn bè' };
      }

      // Re-issuing supersedes the previous ACTIVE direct row. The partial unique
      // index (room_id, recipient_id) WHERE status = 'ACTIVE' makes this an upsert:
      // a duplicate insert would raise 23505, and two concurrent invites must not
      // produce a second ACTIVE row.
      const res = await client.query(
        `INSERT INTO public.invitations
           (id, room_id, sender_id, recipient_id, role, status, epoch, expires_at)
         VALUES ($1, $2, $3, $4, 'PLAY', 'ACTIVE', 0, now() + ${DIRECT_TTL_SQL})
         ON CONFLICT (room_id, recipient_id) WHERE status = 'ACTIVE' AND recipient_id IS NOT NULL
         DO UPDATE SET sender_id = EXCLUDED.sender_id,
                       expires_at = EXCLUDED.expires_at,
                       resolved_at = NULL
         RETURNING *`,
        [crypto.randomUUID(), roomId, inviterId, recipient],
      );
      return toInvitationDTO(res.rows[0]!);
    }

    // Shareable code+token grant. PLAY is single-use; WATCH is reusable until
    // rotation/expiry/room close (spec 09 §5.4).
    const grantRole = GRANT_ROLE[requestedRole];
    if (grantRole === 'WATCH') {
      await revokeWatchGrants(client, roomId);
    }
    const epoch = grantRole === 'WATCH' ? Number(room.watch_epoch) : 0;
    const code = await uniqueCode(client);
    const { token, tokenHash } = generateToken();

    const res = await client.query(
      `INSERT INTO public.invitations
         (id, room_id, sender_id, recipient_id, role, token_hash, code_hash, status, epoch, expires_at)
       VALUES ($1, $2, $3, NULL, $4, $5, $6, 'ACTIVE', $7, now() + ${SHARE_TTL_SQL})
       RETURNING *`,
      [crypto.randomUUID(), roomId, inviterId, grantRole, tokenHash, hashCode(code), epoch],
    );
    return { ...toInvitationDTO(res.rows[0]!), code, rawToken: token };
  }, p);
}

export async function getReceivedInvitations(
  userId: string,
  pool?: pg.Pool,
): Promise<InvitationDTO[]> {
  const p = pool ?? getPool();
  const client = await p.connect();

  try {
    // Expiry is enforced at request time (spec 09 §12.3); the scheduler only assists
    // cleanup, so mark the caller's stale rows EXPIRED before listing them.
    await client.query(
      `UPDATE public.invitations SET status = 'EXPIRED', resolved_at = now()
        WHERE recipient_id = $1 AND status = 'ACTIVE' AND expires_at <= now()`,
      [userId],
    );

    const res = await client.query(
      `SELECT * FROM public.invitations
        WHERE recipient_id = $1
        ORDER BY created_at DESC, id DESC
        LIMIT 20`,
      [userId],
    );

    return res.rows.map(toInvitationDTO);
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

  const result = await withTransaction(async (client) => {
    // Peek only for the room id: the room lock must come before the invitation lock
    // (spec 09 lock order: room → invitations → user rows).
    const peek = await client.query(
      'SELECT room_id FROM public.invitations WHERE id = $1 AND recipient_id = $2',
      [invitationId, userId],
    );
    if (peek.rowCount === 0) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Lời mời không tồn tại' };
    }
    const targetRoomId = peek.rows[0].room_id as string;

    const roomRes = await client.query(
      'SELECT id, status FROM public.rooms WHERE id = $1 FOR UPDATE',
      [targetRoomId],
    );
    if (roomRes.rowCount === 0) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Phòng không tồn tại' };
    }
    const room = roomRes.rows[0];

    const invRes = await client.query(
      'SELECT * FROM public.invitations WHERE id = $1 FOR UPDATE',
      [invitationId],
    );
    const inv = invRes.rows[0];
    if (!inv || inv.recipient_id !== userId) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Lời mời không tồn tại' };
    }
    if (inv.status !== 'ACTIVE') {
      throw { statusCode: 403, code: 'INVITE_INVALID', message: 'Lời mời đã được xử lý' };
    }
    if (new Date(inv.expires_at) <= new Date()) {
      await client.query(
        `UPDATE public.invitations SET status = 'EXPIRED', resolved_at = now() WHERE id = $1`,
        [invitationId],
      );
      throw { statusCode: 403, code: 'INVITE_INVALID', message: 'Lời mời đã hết hạn' };
    }

    if (!accept) {
      await client.query(
        `UPDATE public.invitations SET status = 'DECLINED', resolved_at = now() WHERE id = $1`,
        [invitationId],
      );
      return { accepted: false as const };
    }

    if (room.status !== 'WAITING') {
      throw { statusCode: 409, code: 'ROOM_CLOSED', message: 'Phòng không còn nhận người chơi' };
    }

    const existing = await client.query(
      'SELECT role FROM public.room_members WHERE room_id = $1 AND user_id = $2',
      [targetRoomId, userId],
    );
    if (existing.rowCount === 0) {
      const activeCheck = await client.query(
        'SELECT room_id FROM public.active_players WHERE user_id = $1',
        [userId],
      );
      if (activeCheck.rowCount! > 0) {
        throw { statusCode: 409, code: 'ALREADY_IN_ROOM', message: 'Bạn đang ở trong một phòng khác' };
      }

      const playersRes = await client.query(
        `SELECT side FROM public.room_members WHERE room_id = $1 AND role = 'PLAYER'`,
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
    }

    // Direct invites are recipient-bound PLAY: consumed_by must equal recipient_id.
    await client.query(
      `UPDATE public.invitations
          SET status = 'CONSUMED', consumed_by = $2, resolved_at = now()
        WHERE id = $1`,
      [invitationId, userId],
    );
    return { accepted: true as const, roomId: targetRoomId };
  }, p);

  if (!result.accepted) {
    return { removed: true };
  }

  const room = await getRoom(result.roomId, userId, p);
  // Push the new seat to the other members (Web client is push-only on RoomWaiting).
  emitRoomUpdated({ roomId: result.roomId, room });
  return { room, removed: false };
}

export async function joinRoom(
  userId: string,
  locator: { roomId?: string; code?: string; token?: string },
  requestedRole: MemberRole,
  pool?: pg.Pool,
): Promise<RoomDTO> {
  const p = pool ?? getPool();

  const targetId = await withTransaction(async (client) => {
    // 1. Resolve the locator without taking row locks so the room lock is
    //    always acquired first (spec 09 lock order: room → invitations → user rows).
    let targetRoomId: string | null = null;
    let grantRole: 'PLAY' | 'WATCH' | null = null;
    let invitation: { id: string } | null = null;
    let viaRoomId = false;

    if (locator.roomId) {
      viaRoomId = true;
      targetRoomId = locator.roomId;
      // Direct roomId joins carry no grant; visibility is enforced below.
      grantRole = GRANT_ROLE[requestedRole];
    } else if (locator.code) {
      const codeHash = hashCode(locator.code);
      const invRes = await client.query(
        `SELECT id, room_id, role FROM public.invitations
          WHERE code_hash = $1 AND status = 'ACTIVE' AND expires_at > now()`,
        [codeHash],
      );
      if (invRes.rowCount === 0) {
        throw { statusCode: 403, code: 'INVITE_INVALID', message: 'Mã phòng không hợp lệ hoặc đã hết hạn' };
      }
      const inv = invRes.rows[0];
      targetRoomId = inv.room_id;
      grantRole = inv.role;
      invitation = { id: inv.id };
    } else if (locator.token) {
      const tokenHash = hashToken(locator.token);
      const invRes = await client.query(
        `SELECT id, room_id, role FROM public.invitations
          WHERE token_hash = $1 AND status = 'ACTIVE' AND expires_at > now()`,
        [tokenHash],
      );
      if (invRes.rowCount === 0) {
        throw { statusCode: 403, code: 'INVITE_INVALID', message: 'Liên kết không hợp lệ hoặc đã hết hạn' };
      }
      const inv = invRes.rows[0];
      targetRoomId = inv.room_id;
      grantRole = inv.role;
      invitation = { id: inv.id };
    }

    if (!targetRoomId || !grantRole) {
      throw { statusCode: 403, code: 'INVITE_INVALID', message: 'Không tìm thấy phòng' };
    }

    // The requested role must match the grant the locator carries (spec 04).
    if (grantRole !== GRANT_ROLE[requestedRole]) {
      throw { statusCode: 403, code: 'INVITE_INVALID', message: 'Vai trò yêu cầu không khớp với quyền mời' };
    }

    // 2. Lock the room before touching any membership/invitation row.
    const roomRes = await client.query(
      'SELECT * FROM public.rooms WHERE id = $1 FOR UPDATE',
      [targetRoomId],
    );
    if (roomRes.rowCount === 0) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Phòng không tồn tại' };
    }
    const room = roomRes.rows[0];

    // Closing/finishing a room invalidates every outstanding grant.
    if (room.status === 'CLOSED' || room.status === 'FINISHED') {
      throw { statusCode: 403, code: 'INVITE_INVALID', message: 'Phòng đã đóng' };
    }

    // F-03: a direct roomId join is only allowed for PUBLIC rooms; CODE_ONLY
    // and LOCKED rooms require a code/token/invitation locator.
    if (viaRoomId && room.visibility !== 'PUBLIC') {
      throw { statusCode: 403, code: 'INVITE_INVALID', message: 'Phòng riêng tư: cần mã hoặc lời mời để vào' };
    }

    // Re-validate the grant under the room lock: it may have been consumed or
    // revoked between resolution and locking.
    if (invitation) {
      const lockedInv = await client.query(
        'SELECT id, status, role, expires_at FROM public.invitations WHERE id = $1 FOR UPDATE',
        [invitation.id],
      );
      const row = lockedInv.rows[0];
      if (
        lockedInv.rowCount === 0 ||
        row.status !== 'ACTIVE' ||
        new Date(row.expires_at) <= new Date() ||
        row.role !== grantRole
      ) {
        throw { statusCode: 403, code: 'INVITE_INVALID', message: 'Lời mời đã hết hạn hoặc không còn hiệu lực' };
      }
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
        `SELECT side FROM public.room_members WHERE room_id = $1 AND role = 'PLAYER'`,
        [targetRoomId],
      );
      const redTaken = playersRes.rows.some((m) => m.side === 'RED');
      const blackTaken = playersRes.rows.some((m) => m.side === 'BLACK');
      if (redTaken && blackTaken) {
        throw { statusCode: 409, code: 'ROOM_FULL', message: 'Phòng đã đủ 2 người chơi' };
      }
      const assignedSide = !redTaken ? 'RED' : 'BLACK';

      await client.query(
        `INSERT INTO public.room_members (room_id, user_id, role, side, ready, admission_epoch)
         VALUES ($1, $2, 'PLAYER', $3, false, 0)`,
        [targetRoomId, userId, assignedSide],
      );
      await client.query(
        `INSERT INTO public.active_players (user_id, room_id, created_at)
         VALUES ($1, $2, now())`,
        [userId, targetRoomId],
      );

      // Consume the single-use PLAYER grant (spec: one seat per PLAY invitation).
      // WATCH grants stay reusable until rotation/expiry/room close.
      if (invitation) {
        await client.query(
          `UPDATE public.invitations
              SET status = 'CONSUMED', consumed_by = $2, resolved_at = now()
            WHERE id = $1 AND status = 'ACTIVE'`,
          [invitation.id, userId],
        );
      }
    } else {
      // SPECTATOR role: count WATCH seats inside the room lock (spec 04:
      // "Require count WATCH<5 within lock, not count-before-transaction").
      const spectatorsCount = await client.query(
        `SELECT count(*) FROM public.room_members WHERE room_id = $1 AND role = 'SPECTATOR'`,
        [targetRoomId],
      );
      if (Number(spectatorsCount.rows[0].count) >= MAX_SPECTATORS) {
        throw { statusCode: 409, code: 'ROOM_FULL', message: 'Phòng đã đạt tối đa 5 người xem' };
      }

      // A viewer joins the room's current watch cohort (spec 09 §5.3).
      await client.query(
        `INSERT INTO public.room_members (room_id, user_id, role, side, ready, admission_epoch)
         VALUES ($1, $2, 'SPECTATOR', NULL, false, $3)`,
        [targetRoomId, userId, Number(room.watch_epoch)],
      );
    }

    return targetRoomId;
  }, p);

  const room = await getRoom(targetId, userId, p);
  // Push the new seat to the other members (Web client is push-only on RoomWaiting).
  emitRoomUpdated({ roomId: targetId, room });
  return room;
}

/**
 * Issue (and, with `rotate`, re-key) the owner's WATCH code+token.
 *
 * Rotating bumps `rooms.watch_epoch` so previously admitted viewers belong to an
 * older cohort, and revokes the previous ACTIVE WATCH grant. A non-rotating call
 * still mints a fresh grant (the raw secret is never stored, so it cannot be
 * re-read) but keeps the epoch, leaving current viewers admitted.
 */
export async function rotateWatchCode(
  ownerId: string,
  roomId: string,
  rotate = true,
  pool?: pg.Pool,
): Promise<{ code: string; token: string }> {
  const p = pool ?? getPool();

  return withTransaction(async (client) => {
    const roomRes = await client.query(
      'SELECT id, owner_id, watch_epoch, status FROM public.rooms WHERE id = $1 FOR UPDATE',
      [roomId],
    );
    if (roomRes.rowCount === 0) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Phòng không tồn tại' };
    }
    const room = roomRes.rows[0];
    if (room.owner_id !== ownerId) {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'Chỉ chủ phòng mới có quyền đổi mã xem' };
    }
    if (room.status === 'CLOSED') {
      throw { statusCode: 409, code: 'ROOM_CLOSED', message: 'Phòng đã đóng' };
    }

    let epoch = Number(room.watch_epoch);
    if (rotate) {
      epoch += 1;
      await client.query(
        'UPDATE public.rooms SET watch_epoch = $1, updated_at = now() WHERE id = $2',
        [epoch, roomId],
      );
    }

    // The previous code/token must stop working.
    await revokeWatchGrants(client, roomId);

    const code = await uniqueCode(client);
    const { token, tokenHash } = generateToken();

    await client.query(
      `INSERT INTO public.invitations
         (id, room_id, sender_id, recipient_id, role, token_hash, code_hash, status, epoch, expires_at)
       VALUES ($1, $2, $3, NULL, 'WATCH', $4, $5, 'ACTIVE', $6, now() + ${SHARE_TTL_SQL})`,
      [crypto.randomUUID(), roomId, ownerId, tokenHash, hashCode(code), epoch],
    );

    return { code, token };
  }, p);
}
