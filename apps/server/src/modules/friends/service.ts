/**
 * Friends domain service.
 * Manages friend relations, requests, and user search.
 * Uses ordered pairs (user_low, user_high) for deterministic uniqueness.
 */
import type pg from 'pg';
import { getPool } from '../../db/pool.js';

export interface ProfileDTO {
  id: string;
  username: string;
  displayName: string | null;
}

export interface FriendRelationDTO {
  id: string;
  status: 'PENDING' | 'ACCEPTED';
  requesterId: string;
  recipientId: string;
  user: ProfileDTO; // the other user's profile
  createdAt: string;
  acceptedAt: string | null;
}

function orderPair(a: string, b: string): { userLow: string; userHigh: string } {
  return a < b ? { userLow: a, userHigh: b } : { userLow: b, userHigh: a };
}

export async function searchUsers(
  prefix: string,
  excludeUserId: string,
  pool?: pg.Pool,
): Promise<ProfileDTO[]> {
  const normalized = prefix.toLowerCase().trim();
  if (normalized.length < 3 || normalized.length > 24) return [];

  const p = pool ?? getPool();
  const client = await p.connect();
  try {
    const res = await client.query(
      `SELECT id, username, display_name
       FROM public.profiles
       WHERE username ILIKE $1 AND id != $2
       ORDER BY username ASC
       LIMIT 20`,
      [`${normalized}%`, excludeUserId],
    );
    return res.rows.map((r) => ({
      id: r.id,
      username: r.username,
      displayName: r.display_name,
    }));
  } finally {
    client.release();
  }
}

export async function getFriendsAndRequests(
  userId: string,
  pool?: pg.Pool,
): Promise<{
  friends: FriendRelationDTO[];
  incomingRequests: FriendRelationDTO[];
  outgoingRequests: FriendRelationDTO[];
}> {
  const p = pool ?? getPool();
  const client = await p.connect();
  try {
    // Join with profiles to get the other party's details
    const res = await client.query(
      `SELECT
         fr.id, fr.status, fr.requester_id, fr.created_at, fr.accepted_at,
         fr.user_low, fr.user_high,
         p.id AS other_id, p.username AS other_username, p.display_name AS other_display_name
       FROM public.friend_relations fr
       JOIN public.profiles p ON p.id = (
         CASE WHEN fr.user_low = $1 THEN fr.user_high ELSE fr.user_low END
       )
       WHERE fr.user_low = $1 OR fr.user_high = $1
       ORDER BY fr.created_at DESC`,
      [userId],
    );

    const friends: FriendRelationDTO[] = [];
    const incomingRequests: FriendRelationDTO[] = [];
    const outgoingRequests: FriendRelationDTO[] = [];

    for (const r of res.rows) {
      const isRequester = r.requester_id === userId;
      const recipientId = isRequester ? r.other_id : userId;

      const dto: FriendRelationDTO = {
        id: r.id,
        status: r.status,
        requesterId: r.requester_id,
        recipientId,
        user: {
          id: r.other_id,
          username: r.other_username,
          displayName: r.other_display_name,
        },
        createdAt: r.created_at,
        acceptedAt: r.accepted_at,
      };

      if (r.status === 'ACCEPTED') {
        friends.push(dto);
      } else if (isRequester) {
        outgoingRequests.push(dto);
      } else {
        incomingRequests.push(dto);
      }
    }

    return { friends, incomingRequests, outgoingRequests };
  } finally {
    client.release();
  }
}

export async function sendFriendRequest(
  requesterId: string,
  recipientId: string,
  pool?: pg.Pool,
): Promise<{ relation: FriendRelationDTO; isNew: boolean }> {
  if (requesterId === recipientId) {
    throw { statusCode: 400, code: 'VALIDATION_ERROR', message: 'Không thể kết bạn với chính mình' };
  }

  const { userLow, userHigh } = orderPair(requesterId, recipientId);
  const p = pool ?? getPool();
  const client = await p.connect();

  try {
    // Verify recipient exists
    const recipientCheck = await client.query(
      'SELECT id, username, display_name FROM public.profiles WHERE id = $1',
      [recipientId],
    );
    if (recipientCheck.rowCount === 0) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Người dùng không tồn tại' };
    }
    const otherProfile: ProfileDTO = {
      id: recipientCheck.rows[0].id,
      username: recipientCheck.rows[0].username,
      displayName: recipientCheck.rows[0].display_name,
    };

    // Check if relation already exists (including cross-request)
    const existing = await client.query(
      'SELECT * FROM public.friend_relations WHERE user_low = $1 AND user_high = $2',
      [userLow, userHigh],
    );

    if (existing.rowCount! > 0) {
      const row = existing.rows[0];
      if (row.status === 'ACCEPTED') {
        throw { statusCode: 409, code: 'CONFLICT', message: 'Đã là bạn bè' };
      }
      // Pending request exists (either same direction or cross-request)
      // Return existing pending relation per spec
      return {
        relation: {
          id: row.id,
          status: row.status,
          requesterId: row.requester_id,
          recipientId: row.requester_id === requesterId ? recipientId : requesterId,
          user: otherProfile,
          createdAt: row.created_at,
          acceptedAt: null,
        },
        isNew: false,
      };
    }

    // Insert new pending request
    const insertRes = await client.query(
      `INSERT INTO public.friend_relations (user_low, user_high, requester_id, status)
       VALUES ($1, $2, $3, 'PENDING')
       RETURNING id, created_at, status`,
      [userLow, userHigh, requesterId],
    );

    const inserted = insertRes.rows[0];
    return {
      relation: {
        id: inserted.id,
        status: inserted.status,
        requesterId,
        recipientId,
        user: otherProfile,
        createdAt: inserted.created_at,
        acceptedAt: null,
      },
      isNew: true,
    };
  } finally {
    client.release();
  }
}

export async function respondToRequest(
  userId: string,
  requestId: string,
  accept: boolean,
  pool?: pg.Pool,
): Promise<{ removed: boolean; relation?: FriendRelationDTO }> {
  const p = pool ?? getPool();
  const client = await p.connect();

  try {
    const res = await client.query(
      `SELECT fr.*, p.id AS requester_id, p.username, p.display_name
       FROM public.friend_relations fr
       JOIN public.profiles p ON p.id = fr.requester_id
       WHERE fr.id = $1`,
      [requestId],
    );

    if (res.rowCount === 0) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Yêu cầu kết bạn không tồn tại' };
    }

    const row = res.rows[0];
    if (row.status !== 'PENDING') {
      throw { statusCode: 409, code: 'CONFLICT', message: 'Yêu cầu đã được xử lý' };
    }

    // Only the recipient (not the requester) can accept/reject
    const recipientId = row.user_low === row.requester_id ? row.user_high : row.user_low;
    if (recipientId !== userId) {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'Không có quyền xử lý yêu cầu này' };
    }

    if (!accept) {
      // Reject: delete row per spec
      await client.query('DELETE FROM public.friend_relations WHERE id = $1', [requestId]);
      return { removed: true };
    }

    // Accept: update status to ACCEPTED
    const updateRes = await client.query(
      `UPDATE public.friend_relations
       SET status = 'ACCEPTED', accepted_at = now()
       WHERE id = $1
       RETURNING *`,
      [requestId],
    );

    const updated = updateRes.rows[0];
    return {
      removed: false,
      relation: {
        id: updated.id,
        status: 'ACCEPTED',
        requesterId: updated.requester_id,
        recipientId: userId,
        user: {
          id: row.requester_id,
          username: row.username,
          displayName: row.display_name,
        },
        createdAt: updated.created_at,
        acceptedAt: updated.accepted_at,
      },
    };
  } finally {
    client.release();
  }
}

export async function cancelRequest(
  userId: string,
  requestId: string,
  pool?: pg.Pool,
): Promise<{ removed: boolean }> {
  const p = pool ?? getPool();
  const client = await p.connect();

  try {
    const res = await client.query(
      'SELECT requester_id FROM public.friend_relations WHERE id = $1 AND status = \'PENDING\'',
      [requestId],
    );

    if (res.rowCount === 0) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Yêu cầu không tồn tại hoặc đã được xử lý' };
    }

    // Only sender can cancel
    if (res.rows[0].requester_id !== userId) {
      throw { statusCode: 403, code: 'FORBIDDEN', message: 'Chỉ người gửi mới có thể hủy yêu cầu' };
    }

    await client.query('DELETE FROM public.friend_relations WHERE id = $1', [requestId]);
    return { removed: true };
  } finally {
    client.release();
  }
}

export async function removeFriend(
  userId: string,
  targetUserId: string,
  pool?: pg.Pool,
): Promise<{ removed: boolean }> {
  const { userLow, userHigh } = orderPair(userId, targetUserId);
  const p = pool ?? getPool();
  const client = await p.connect();

  try {
    const res = await client.query(
      `DELETE FROM public.friend_relations
       WHERE user_low = $1 AND user_high = $2 AND status = 'ACCEPTED'`,
      [userLow, userHigh],
    );

    if (res.rowCount === 0) {
      throw { statusCode: 404, code: 'NOT_FOUND', message: 'Quan hệ bạn bè không tồn tại' };
    }

    return { removed: true };
  } finally {
    client.release();
  }
}
