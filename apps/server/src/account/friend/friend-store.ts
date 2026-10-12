import { randomUUID } from "node:crypto";
import type { Pool, PoolClient } from "pg";
import { actorLock, transaction } from "../google/postgres.js";
import {
  FriendError,
  type FriendPeer,
  type FriendRequestView,
  type FriendStatus,
  type RoomInviteView,
} from "./contracts.js";
function fail(code: string, message: string, status = 409): never {
  throw new FriendError(code, message, status);
}
async function memberId(
  client: PoolClient,
  username: string,
): Promise<{ user_id: string; username: string; display_name: string } | null> {
  const row = (
    await client.query(
      `SELECT p.user_id,p.username,p.display_name FROM public.profiles p
       JOIN xiangqi_auth.principals n ON n.id=p.user_id
       WHERE lower(p.username)=lower($1) AND n.kind='member' LIMIT 1`,
      [username],
    )
  ).rows[0];
  return row ?? null;
}
async function requireMember(client: PoolClient, userId: string) {
  const row = (
    await client.query(
      `SELECT 1 FROM xiangqi_auth.principals WHERE id=$1 AND kind='member'`,
      [userId],
    )
  ).rows[0];
  if (!row) fail("FRIEND_GUEST_DENIED", "Đăng ký tài khoản để kết bạn", 403);
}
async function expireRequests(client: PoolClient) {
  await client.query(
    "UPDATE xiangqi_social.friend_requests SET status='EXPIRED',resolved_at=clock_timestamp() WHERE status='PENDING' AND expires_at<=clock_timestamp()",
  );
  await client.query(
    "UPDATE xiangqi_social.room_invites SET status='EXPIRED',resolved_at=clock_timestamp() WHERE status='PENDING' AND expires_at<=clock_timestamp()",
  );
}
async function statusOf(
  client: PoolClient,
  userId: string,
): Promise<FriendStatus> {
  const seated = (
    await client.query(
      "SELECT 1 FROM public.active_players WHERE user_id=$1 AND room_id IS NOT NULL LIMIT 1",
      [userId],
    )
  ).rowCount;
  if (seated) return "in-match";
  const online = (
    await client.query(
      "SELECT 1 FROM xiangqi_room.presence WHERE user_id=$1 AND connected LIMIT 1",
      [userId],
    )
  ).rowCount;
  return online ? "online" : "offline";
}
export class FriendStore {
  constructor(private readonly pool: Pool) {}
  private async withUser<T>(
    userId: string,
    work: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    return transaction(this.pool, async (client) => {
      await actorLock(client, userId);
      return work(client);
    });
  }
  async search(
    userId: string,
    prefix: string,
  ): Promise<Omit<FriendPeer, "status">[]> {
    if (typeof prefix !== "string" || prefix.trim().length < 1)
      fail("FRIEND_INPUT_INVALID", "Từ tìm kiếm không hợp lệ", 400);
    const clean = prefix.trim().slice(0, 20);
    return transaction(this.pool, async (client) => {
      await requireMember(client, userId);
      return (
        await client.query(
          `SELECT p.user_id,p.username,p.display_name FROM public.profiles p
           JOIN xiangqi_auth.principals n ON n.id=p.user_id
           WHERE n.kind='member' AND p.user_id<>$2 AND lower(p.username) LIKE lower($1)||'%' ORDER BY p.username LIMIT 20`,
          [clean, userId],
        )
      ).rows.map(
        (r: { user_id: string; username: string; display_name: string }) => ({
          userId: r.user_id,
          username: r.username,
          displayName: r.display_name,
        }),
      );
    });
  }
  async sendRequest(userId: string, username: string) {
    return this.withUser(userId, async (client) => {
      await requireMember(client, userId);
      await expireRequests(client);
      const peer = await memberId(client, username);
      if (!peer) fail("FRIEND_NOT_FOUND", "Không tìm thấy người dùng", 404);
      if (peer!.user_id === userId)
        fail("FRIEND_SELF", "Không thể kết bạn với chính mình", 400);
      const already = (
        await client.query(
          "SELECT 1 FROM xiangqi_social.friendships WHERE (user_a=$1 AND user_b=$2) OR (user_a=$2 AND user_b=$1)",
          [userId, peer!.user_id],
        )
      ).rowCount;
      if (already) fail("FRIEND_ALREADY", "Hai bạn đã là bạn bè", 409);
      const blocked = (
        await client.query(
          "SELECT declines FROM xiangqi_social.friend_decline_counts WHERE blocker_id=$1 AND requester_id=$2 AND declines>=2",
          [peer!.user_id, userId],
        )
      ).rowCount;
      if (blocked) fail("FRIEND_BLOCKED", "Không thể gửi lời mời lúc này", 403);
      const friends = Number(
        (
          await client.query(
            "SELECT count(*)::int AS n FROM xiangqi_social.friendships WHERE user_a=$1 OR user_b=$1",
            [userId],
          )
        ).rows[0].n,
      );
      if (friends >= 200) fail("FRIEND_LIMIT", "Bạn đã có tối đa 200 bạn", 403);
      const pending = Number(
        (
          await client.query(
            "SELECT count(*)::int AS n FROM xiangqi_social.friend_requests WHERE status='PENDING' AND (sender_id=$1 OR receiver_id=$1)",
            [userId],
          )
        ).rows[0].n,
      );
      if (pending >= 50)
        fail("FRIEND_INVITE_LIMIT", "Quá nhiều lời mời đang chờ", 403);
      try {
        await client.query("SAVEPOINT friend_request_insert");
        const row = (
          await client.query(
            "WITH t AS MATERIALIZED(SELECT clock_timestamp() AS now) INSERT INTO xiangqi_social.friend_requests(id,sender_id,receiver_id,status,created_at,expires_at,resolved_at) SELECT $1,$2,$3,'PENDING',t.now,t.now+interval '30 days',NULL FROM t RETURNING id,created_at,expires_at",
            [randomUUID(), userId, peer!.user_id],
          )
        ).rows[0];
        await client.query("RELEASE SAVEPOINT friend_request_insert");
        return {
          id: row.id as string,
          createdAt: (row.created_at as Date).toISOString(),
          expiresAt: (row.expires_at as Date).toISOString(),
        };
      } catch (error) {
        await client.query("ROLLBACK TO SAVEPOINT friend_request_insert");
        if (
          error instanceof Error &&
          (error as { code?: string }).code === "23505"
        ) {
          const existing = (
            await client.query(
              "SELECT id,created_at,expires_at FROM xiangqi_social.friend_requests WHERE status='PENDING' AND LEAST(sender_id,receiver_id)=LEAST($1::uuid,$2::uuid) AND GREATEST(sender_id,receiver_id)=GREATEST($1::uuid,$2::uuid)",
              [userId, peer!.user_id],
            )
          ).rows[0];
          if (existing)
            return {
              id: existing.id as string,
              createdAt: (existing.created_at as Date).toISOString(),
              expiresAt: (existing.expires_at as Date).toISOString(),
            };
        }
        throw error;
      }
    });
  }
  async listRequests(userId: string): Promise<FriendRequestView[]> {
    return this.withUser(userId, async (client) => {
      await requireMember(client, userId);
      await expireRequests(client);
      return (
        await client.query(
          `SELECT r.id,r.sender_id,r.receiver_id,r.created_at,r.expires_at,p.user_id AS peer_id,p.username,p.display_name
           FROM xiangqi_social.friend_requests r JOIN public.profiles p ON p.user_id=CASE WHEN r.sender_id=$1 THEN r.receiver_id ELSE r.sender_id END
           WHERE r.status='PENDING' AND (r.sender_id=$1 OR r.receiver_id=$1) ORDER BY r.created_at`,
          [userId],
        )
      ).rows.map(
        (r: {
          id: string;
          sender_id: string;
          created_at: Date;
          expires_at: Date;
          peer_id: string;
          username: string;
          display_name: string;
        }) => ({
          id: r.id,
          direction:
            r.sender_id === userId
              ? ("outgoing" as const)
              : ("incoming" as const),
          peer: {
            userId: r.peer_id,
            username: r.username,
            displayName: r.display_name,
          },
          createdAt: r.created_at.toISOString(),
          expiresAt: r.expires_at.toISOString(),
        }),
      );
    });
  }
  async respondRequest(userId: string, requestId: string, accept: boolean) {
    return this.withUser(userId, async (client) => {
      await requireMember(client, userId);
      await expireRequests(client);
      const row = (
        await client.query(
          "SELECT * FROM xiangqi_social.friend_requests WHERE id=$1 AND status='PENDING'",
          [requestId],
        )
      ).rows[0];
      if (!row)
        fail("FRIEND_REQUEST_MISSING", "Lời mời không còn hiệu lực", 404);
      if (row.receiver_id !== userId)
        fail("FRIEND_FORBIDDEN", "Chỉ người được mời trả lời", 403);
      if (!accept) {
        await client.query(
          "UPDATE xiangqi_social.friend_requests SET status='DECLINED',resolved_at=clock_timestamp() WHERE id=$1",
          [requestId],
        );
        await client.query(
          "INSERT INTO xiangqi_social.friend_decline_counts(blocker_id,requester_id,declines) VALUES($1,$2,1) ON CONFLICT(blocker_id,requester_id) DO UPDATE SET declines=xiangqi_social.friend_decline_counts.declines+1",
          [userId, row.sender_id],
        );
        return { accepted: false as const };
      }
      const a =
        row.sender_id < row.receiver_id ? row.sender_id : row.receiver_id;
      const b =
        row.sender_id < row.receiver_id ? row.receiver_id : row.sender_id;
      await client.query(
        "UPDATE xiangqi_social.friend_requests SET status='ACCEPTED',resolved_at=clock_timestamp() WHERE id=$1",
        [requestId],
      );
      await client.query(
        "INSERT INTO xiangqi_social.friendships(user_a,user_b,created_at) VALUES($1,$2,clock_timestamp()) ON CONFLICT DO NOTHING",
        [a, b],
      );
      return { accepted: true as const };
    });
  }
  async revokeRequest(userId: string, requestId: string) {
    return this.withUser(userId, async (client) => {
      await requireMember(client, userId);
      const done = (
        await client.query(
          "UPDATE xiangqi_social.friend_requests SET status='REVOKED',resolved_at=clock_timestamp() WHERE id=$1 AND sender_id=$2 AND status='PENDING' RETURNING id",
          [requestId, userId],
        )
      ).rows[0];
      if (!done)
        fail("FRIEND_REQUEST_MISSING", "Lời mời không còn hiệu lực", 404);
      return { revoked: true as const };
    });
  }
  async unfriend(userId: string, otherId: string) {
    return this.withUser(userId, async (client) => {
      await requireMember(client, userId);
      const a = userId < otherId ? userId : otherId;
      const b = userId < otherId ? otherId : userId;
      const done = (
        await client.query(
          "DELETE FROM xiangqi_social.friendships WHERE user_a=$1 AND user_b=$2 RETURNING user_a",
          [a, b],
        )
      ).rows[0];
      if (!done) fail("FRIEND_MISSING", "Hai bạn chưa là bạn bè", 404);
      return { removed: true as const };
    });
  }
  async listFriends(userId: string): Promise<FriendPeer[]> {
    return this.withUser(userId, async (client) => {
      await requireMember(client, userId);
      const rows = (
        await client.query(
          `SELECT p.user_id,p.username,p.display_name FROM xiangqi_social.friendships f
           JOIN public.profiles p ON p.user_id=CASE WHEN f.user_a=$1 THEN f.user_b ELSE f.user_a END
           WHERE f.user_a=$1 OR f.user_b=$1 ORDER BY p.username`,
          [userId],
        )
      ).rows as { user_id: string; username: string; display_name: string }[];
      const peers: FriendPeer[] = [];
      for (const r of rows)
        peers.push({
          userId: r.user_id,
          username: r.username,
          displayName: r.display_name,
          status: await statusOf(client, r.user_id),
        });
      return peers;
    });
  }
  async inviteToRoom(userId: string, roomId: string, username: string) {
    return this.withUser(userId, async (client) => {
      await requireMember(client, userId);
      await expireRequests(client);
      const peer = await memberId(client, username);
      if (!peer) fail("FRIEND_NOT_FOUND", "Không tìm thấy người dùng", 404);
      const friends = (
        await client.query(
          "SELECT 1 FROM xiangqi_social.friendships WHERE (user_a=$1 AND user_b=$2) OR (user_a=$2 AND user_b=$1)",
          [userId, peer!.user_id],
        )
      ).rowCount;
      if (!friends) fail("FRIEND_MISSING", "Chỉ mời bạn bè của bạn", 403);
      const seat = (
        await client.query(
          "SELECT side FROM public.room_members WHERE room_id=$1 AND user_id=$2 AND role='PLAYER'",
          [roomId, userId],
        )
      ).rows[0];
      if (!seat)
        fail("FRIEND_INVITE_FORBIDDEN", "Chỉ người ngồi ghế được mời", 403);
      const away = (
        await client.query(
          "SELECT 1 FROM xiangqi_room.presence WHERE user_id=$1 AND connected LIMIT 1",
          [peer!.user_id],
        )
      ).rowCount;
      if (!away) fail("FRIEND_OFFLINE", "Bạn bè đang ngoại tuyến", 409);
      const busy = (
        await client.query(
          "SELECT 1 FROM public.active_players WHERE user_id=$1 AND room_id IS NOT NULL LIMIT 1",
          [peer!.user_id],
        )
      ).rowCount;
      if (busy) fail("FRIEND_BUSY", "Bạn bè đang trong ván khác", 409);
      try {
        const row = (
          await client.query(
            "WITH t AS MATERIALIZED(SELECT clock_timestamp() AS now) INSERT INTO xiangqi_social.room_invites(id,room_id,inviter_id,invitee_id,status,created_at,expires_at,resolved_at) SELECT $1,$2,$3,$4,'PENDING',t.now,t.now+interval '30 seconds',NULL FROM t RETURNING id,created_at,expires_at",
            [randomUUID(), roomId, userId, peer!.user_id],
          )
        ).rows[0];
        return {
          id: row.id as string,
          createdAt: (row.created_at as Date).toISOString(),
          expiresAt: (row.expires_at as Date).toISOString(),
        };
      } catch (error) {
        if (
          error instanceof Error &&
          (error as { code?: string }).code === "23503"
        )
          fail("FRIEND_ROOM_MISSING", "Phòng không còn khả dụng", 404);
        throw error;
      }
    });
  }
  async listRoomInvites(userId: string): Promise<RoomInviteView[]> {
    return this.withUser(userId, async (client) => {
      await requireMember(client, userId);
      await expireRequests(client);
      return (
        await client.query(
          `SELECT v.id,v.room_id,r.name AS room_name,v.created_at,v.expires_at,p.user_id AS inviter_id,p.username,p.display_name
           FROM xiangqi_social.room_invites v JOIN public.rooms r ON r.id=v.room_id
           JOIN public.profiles p ON p.user_id=v.inviter_id
           WHERE v.status='PENDING' AND v.invitee_id=$1 ORDER BY v.created_at`,
          [userId],
        )
      ).rows.map(
        (r: {
          id: string;
          room_id: string;
          room_name: string;
          created_at: Date;
          expires_at: Date;
          inviter_id: string;
          username: string;
          display_name: string;
        }) => ({
          id: r.id,
          roomId: r.room_id,
          roomName: r.room_name,
          inviter: {
            userId: r.inviter_id,
            username: r.username,
            displayName: r.display_name,
          },
          createdAt: r.created_at.toISOString(),
          expiresAt: r.expires_at.toISOString(),
        }),
      );
    });
  }
  async respondRoomInvite(userId: string, inviteId: string, accept: boolean) {
    return this.withUser(userId, async (client) => {
      await requireMember(client, userId);
      await expireRequests(client);
      const row = (
        await client.query(
          "SELECT * FROM xiangqi_social.room_invites WHERE id=$1 AND status='PENDING'",
          [inviteId],
        )
      ).rows[0];
      if (!row)
        fail("FRIEND_INVITE_MISSING", "Lời mời không còn hiệu lực", 404);
      if (row.invitee_id !== userId)
        fail("FRIEND_FORBIDDEN", "Chỉ người được mời trả lời", 403);
      if (!accept) {
        await client.query(
          "UPDATE xiangqi_social.room_invites SET status='DECLINED',resolved_at=clock_timestamp() WHERE id=$1",
          [inviteId],
        );
        return { accepted: false as const };
      }
      const room = (
        await client.query(
          "SELECT invite_code,visibility FROM public.rooms WHERE id=$1 AND closed_at IS NULL",
          [row.room_id],
        )
      ).rows[0];
      if (!room || room.visibility === "LOCKED") {
        await client.query(
          "UPDATE xiangqi_social.room_invites SET status='REVOKED',resolved_at=clock_timestamp() WHERE id=$1",
          [inviteId],
        );
        fail("FRIEND_INVITE_REVOKED", "Phòng đã khoá lời mời này", 410);
      }
      const busy = (
        await client.query(
          "SELECT 1 FROM public.active_players WHERE user_id=$1 AND room_id IS NOT NULL LIMIT 1",
          [userId],
        )
      ).rowCount;
      if (busy) fail("FRIEND_BUSY", "Bạn đang ở trong một ván/phòng khác", 409);
      await client.query(
        "UPDATE xiangqi_social.room_invites SET status='ACCEPTED',resolved_at=clock_timestamp() WHERE id=$1",
        [inviteId],
      );
      return {
        accepted: true as const,
        roomId: row.room_id as string,
        code: room.invite_code as string | null,
      };
    });
  }
}
