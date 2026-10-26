import { randomUUID } from "node:crypto";
import type { Pool, PoolClient } from "pg";
import { actorLock, transaction } from "../../core/postgres.js";
import type {
  FriendPeer,
  FriendRequestView,
  RoomInviteView,
} from "./friend.types.js";

export type PeerRow = {
  user_id: string;
  username: string;
  display_name: string;
};
export type Stamped = { id: string; createdAt: string; expiresAt: string };
export type PendingRequestRow = { sender_id: string; receiver_id: string };
export type PendingInviteRow = { room_id: string; invitee_id: string };
export type OpenRoomRow = { invite_code: string | null; visibility: string };

/**
 * Store tương tác cơ sở dữ liệu PostgreSQL cho tính năng bạn bè:
 * Quản lý các bảng trong schema xiangqi_social (friendships, friend_requests, room_invites, decline_counts).
 */
export class FriendStore {
  constructor(private readonly pool: Pool) {}
  /**
   * Mở transaction PostgreSQL có khóa actorLock theo userId của người thực hiện.
   */
  withUser<T>(userId: string, work: (tx: FriendTx) => Promise<T>): Promise<T> {
    return transaction(this.pool, async (client) => {
      await actorLock(client, userId);
      return work(new FriendTx(client));
    });
  }
  /**
   * Mở transaction chỉ đọc (read-only) không giữ actorLock cho các thao tác tra cứu độc lập.
   */
  read<T>(work: (tx: FriendTx) => Promise<T>): Promise<T> {
    return transaction(this.pool, (client) => work(new FriendTx(client)));
  }
}

/**
 * Lớp thực thi truy vấn dữ liệu quan hệ bạn bè gắn với một client kết nối Postgres đang mở.
 */
export class FriendTx {
  constructor(private readonly client: PoolClient) {}
  async isMember(userId: string): Promise<boolean> {
    const row = (
      await this.client.query(
        `SELECT 1 FROM xiangqi_auth.principals WHERE id=$1 AND kind='member'`,
        [userId],
      )
    ).rows[0];
    return Boolean(row);
  }
  async expireStale(): Promise<void> {
    await this.client.query(
      "UPDATE xiangqi_social.friend_requests SET status='EXPIRED',resolved_at=clock_timestamp() WHERE status='PENDING' AND expires_at<=clock_timestamp()",
    );
    await this.client.query(
      "UPDATE xiangqi_social.room_invites SET status='EXPIRED',resolved_at=clock_timestamp() WHERE status='PENDING' AND expires_at<=clock_timestamp()",
    );
  }
  async findMember(username: string): Promise<PeerRow | null> {
    const row = (
      await this.client.query(
        `SELECT p.user_id,p.username,p.display_name FROM public.profiles p
       JOIN xiangqi_auth.principals n ON n.id=p.user_id
       WHERE lower(p.username)=lower($1) AND n.kind='member' LIMIT 1`,
        [username],
      )
    ).rows[0];
    return row ?? null;
  }
  async searchMembers(
    prefix: string,
    exceptUserId: string,
  ): Promise<Omit<FriendPeer, "status">[]> {
    return (
      await this.client.query(
        `SELECT p.user_id,p.username,p.display_name FROM public.profiles p
           JOIN xiangqi_auth.principals n ON n.id=p.user_id
           WHERE n.kind='member' AND p.user_id<>$2 AND lower(p.username) LIKE lower($1)||'%' ORDER BY p.username LIMIT 20`,
        [prefix, exceptUserId],
      )
    ).rows.map((r: PeerRow) => ({
      userId: r.user_id,
      username: r.username,
      displayName: r.display_name,
    }));
  }
  async areFriends(a: string, b: string): Promise<boolean> {
    return Boolean(
      (
        await this.client.query(
          "SELECT 1 FROM xiangqi_social.friendships WHERE (user_a=$1 AND user_b=$2) OR (user_a=$2 AND user_b=$1)",
          [a, b],
        )
      ).rowCount,
    );
  }
  async hasDeclinedTwice(
    blockerId: string,
    requesterId: string,
  ): Promise<boolean> {
    return Boolean(
      (
        await this.client.query(
          "SELECT declines FROM xiangqi_social.friend_decline_counts WHERE blocker_id=$1 AND requester_id=$2 AND declines>=2",
          [blockerId, requesterId],
        )
      ).rowCount,
    );
  }
  async countFriends(userId: string): Promise<number> {
    return Number(
      (
        await this.client.query(
          "SELECT count(*)::int AS n FROM xiangqi_social.friendships WHERE user_a=$1 OR user_b=$1",
          [userId],
        )
      ).rows[0].n,
    );
  }
  async countPendingRequests(userId: string): Promise<number> {
    return Number(
      (
        await this.client.query(
          "SELECT count(*)::int AS n FROM xiangqi_social.friend_requests WHERE status='PENDING' AND (sender_id=$1 OR receiver_id=$1)",
          [userId],
        )
      ).rows[0].n,
    );
  }
  /** Inserts a request; when a concurrent identical request exists, returns that one. */
  async insertRequest(senderId: string, receiverId: string): Promise<Stamped> {
    try {
      await this.client.query("SAVEPOINT friend_request_insert");
      const row = (
        await this.client.query(
          "WITH t AS MATERIALIZED(SELECT clock_timestamp() AS now) INSERT INTO xiangqi_social.friend_requests(id,sender_id,receiver_id,status,created_at,expires_at,resolved_at) SELECT $1,$2,$3,'PENDING',t.now,t.now+interval '30 days',NULL FROM t RETURNING id,created_at,expires_at",
          [randomUUID(), senderId, receiverId],
        )
      ).rows[0];
      await this.client.query("RELEASE SAVEPOINT friend_request_insert");
      return {
        id: row.id as string,
        createdAt: (row.created_at as Date).toISOString(),
        expiresAt: (row.expires_at as Date).toISOString(),
      };
    } catch (error) {
      await this.client.query("ROLLBACK TO SAVEPOINT friend_request_insert");
      if (
        error instanceof Error &&
        (error as { code?: string }).code === "23505"
      ) {
        const existing = (
          await this.client.query(
            "SELECT id,created_at,expires_at FROM xiangqi_social.friend_requests WHERE status='PENDING' AND LEAST(sender_id,receiver_id)=LEAST($1::uuid,$2::uuid) AND GREATEST(sender_id,receiver_id)=GREATEST($1::uuid,$2::uuid)",
            [senderId, receiverId],
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
  }
  async listPendingRequests(userId: string): Promise<FriendRequestView[]> {
    return (
      await this.client.query(
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
  }
  async findPendingRequest(
    requestId: string,
  ): Promise<PendingRequestRow | undefined> {
    return (
      await this.client.query(
        "SELECT * FROM xiangqi_social.friend_requests WHERE id=$1 AND status='PENDING'",
        [requestId],
      )
    ).rows[0];
  }
  async declineRequest(
    requestId: string,
    blockerId: string,
    requesterId: string,
  ): Promise<void> {
    await this.client.query(
      "UPDATE xiangqi_social.friend_requests SET status='DECLINED',resolved_at=clock_timestamp() WHERE id=$1",
      [requestId],
    );
    await this.client.query(
      "INSERT INTO xiangqi_social.friend_decline_counts(blocker_id,requester_id,declines) VALUES($1,$2,1) ON CONFLICT(blocker_id,requester_id) DO UPDATE SET declines=xiangqi_social.friend_decline_counts.declines+1",
      [blockerId, requesterId],
    );
  }
  async acceptRequest(requestId: string, a: string, b: string): Promise<void> {
    await this.client.query(
      "UPDATE xiangqi_social.friend_requests SET status='ACCEPTED',resolved_at=clock_timestamp() WHERE id=$1",
      [requestId],
    );
    await this.client.query(
      "INSERT INTO xiangqi_social.friendships(user_a,user_b,created_at) VALUES($1,$2,clock_timestamp()) ON CONFLICT DO NOTHING",
      [a, b],
    );
  }
  async revokeRequest(requestId: string, senderId: string): Promise<boolean> {
    const done = (
      await this.client.query(
        "UPDATE xiangqi_social.friend_requests SET status='REVOKED',resolved_at=clock_timestamp() WHERE id=$1 AND sender_id=$2 AND status='PENDING' RETURNING id",
        [requestId, senderId],
      )
    ).rows[0];
    return Boolean(done);
  }
  async removeFriendship(a: string, b: string): Promise<boolean> {
    const done = (
      await this.client.query(
        "DELETE FROM xiangqi_social.friendships WHERE user_a=$1 AND user_b=$2 RETURNING user_a",
        [a, b],
      )
    ).rows[0];
    return Boolean(done);
  }
  async listFriendRows(userId: string): Promise<PeerRow[]> {
    return (
      await this.client.query(
        `SELECT p.user_id,p.username,p.display_name FROM xiangqi_social.friendships f
           JOIN public.profiles p ON p.user_id=CASE WHEN f.user_a=$1 THEN f.user_b ELSE f.user_a END
           WHERE f.user_a=$1 OR f.user_b=$1 ORDER BY p.username`,
        [userId],
      )
    ).rows as PeerRow[];
  }
  async isSeated(userId: string): Promise<boolean> {
    return Boolean(
      (
        await this.client.query(
          "SELECT 1 FROM public.active_players WHERE user_id=$1 AND room_id IS NOT NULL LIMIT 1",
          [userId],
        )
      ).rowCount,
    );
  }
  async isOnline(userId: string): Promise<boolean> {
    return Boolean(
      (
        await this.client.query(
          "SELECT 1 FROM xiangqi_room.presence WHERE user_id=$1 AND connected LIMIT 1",
          [userId],
        )
      ).rowCount,
    );
  }
  async isRoomPlayer(roomId: string, userId: string): Promise<boolean> {
    const seat = (
      await this.client.query(
        "SELECT side FROM public.room_members WHERE room_id=$1 AND user_id=$2 AND role='PLAYER'",
        [roomId, userId],
      )
    ).rows[0];
    return Boolean(seat);
  }
  /** Returns null when the room no longer exists (foreign key violation). */
  async insertRoomInvite(
    roomId: string,
    inviterId: string,
    inviteeId: string,
  ): Promise<Stamped | null> {
    try {
      const row = (
        await this.client.query(
          "WITH t AS MATERIALIZED(SELECT clock_timestamp() AS now) INSERT INTO xiangqi_social.room_invites(id,room_id,inviter_id,invitee_id,status,created_at,expires_at,resolved_at) SELECT $1,$2,$3,$4,'PENDING',t.now,t.now+interval '30 seconds',NULL FROM t RETURNING id,created_at,expires_at",
          [randomUUID(), roomId, inviterId, inviteeId],
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
        return null;
      throw error;
    }
  }
  async listPendingRoomInvites(userId: string): Promise<RoomInviteView[]> {
    return (
      await this.client.query(
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
  }
  async findPendingInvite(
    inviteId: string,
  ): Promise<PendingInviteRow | undefined> {
    return (
      await this.client.query(
        "SELECT * FROM xiangqi_social.room_invites WHERE id=$1 AND status='PENDING'",
        [inviteId],
      )
    ).rows[0];
  }
  async declineInvite(inviteId: string): Promise<void> {
    await this.client.query(
      "UPDATE xiangqi_social.room_invites SET status='DECLINED',resolved_at=clock_timestamp() WHERE id=$1",
      [inviteId],
    );
  }
  async revokeInvite(inviteId: string): Promise<void> {
    await this.client.query(
      "UPDATE xiangqi_social.room_invites SET status='REVOKED',resolved_at=clock_timestamp() WHERE id=$1",
      [inviteId],
    );
  }
  async acceptInvite(inviteId: string): Promise<void> {
    await this.client.query(
      "UPDATE xiangqi_social.room_invites SET status='ACCEPTED',resolved_at=clock_timestamp() WHERE id=$1",
      [inviteId],
    );
  }
  async findOpenRoom(roomId: string): Promise<OpenRoomRow | undefined> {
    return (
      await this.client.query(
        "SELECT invite_code,visibility FROM public.rooms WHERE id=$1 AND closed_at IS NULL",
        [roomId],
      )
    ).rows[0];
  }
}
