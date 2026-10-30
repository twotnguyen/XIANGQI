import { randomUUID } from "node:crypto";
import type { Pool, PoolClient } from "pg";
import { actorLock, transaction } from "../../core/postgres.js";
import type {
  FriendPeer,
  FriendStatus,
  InviteDeclineView,
  RoomInviteResponse,
} from "./friend.types.js";

export type PeerRow = {
  user_id: string;
  username: string;
  display_name: string;
};
export type Stamped = { id: string; createdAt: string; expiresAt: string };
export type InviteParties = {
  room_id: string;
  inviter_id: string;
  invitee_id: string;
};
/** Kết quả khóa lời mời để phản hồi (accept hoặc decline) với commandId. */
export type InviteResponseLock =
  | { kind: "pending"; roomId: string }
  | { kind: "replay"; body: RoomInviteResponse }
  | { kind: "missing" }
  | { kind: "forbidden" };

/**
 * Store tương tác cơ sở dữ liệu PostgreSQL cho bạn bè, presence và lời mời phòng.
 * Mọi SQL nằm trong file này; controller và service không chạm DB.
 */
export class FriendStore {
  constructor(private readonly pool: Pool) {}
  /** Transaction có actorLock của một người dùng. */
  withUser<T>(userId: string, work: (tx: FriendTx) => Promise<T>): Promise<T> {
    return this.withUsers([userId], work);
  }
  /**
   * Transaction khóa nhiều actor theo thứ tự chuỗi tăng dần (cùng quy tắc với root).
   * Không được khóa actor sau khi đã khóa phòng.
   */
  withUsers<T>(
    userIds: string[],
    work: (tx: FriendTx) => Promise<T>,
  ): Promise<T> {
    const ids = [...new Set(userIds)].sort();
    return transaction(this.pool, async (client) => {
      for (const id of ids) await actorLock(client, id);
      return work(new FriendTx(client));
    });
  }
  /** Transaction chỉ đọc, không giữ actorLock. */
  read<T>(work: (tx: FriendTx) => Promise<T>): Promise<T> {
    return transaction(this.pool, (client) => work(new FriendTx(client)));
  }
  /** Prefetch cho adapter root: roomId của lời mời (không khóa). */
  inviteRoomId(inviteId: string): Promise<string | null> {
    return this.read((tx) => tx.inviteRoomId(inviteId));
  }
  /**
   * Revoke lời mời sau khi phòng bị khóa hoặc đóng. Chỉ thay đổi nếu lời mời vẫn PENDING
   * và đúng người được mời; tự mở transaction với actor khóa theo thứ tự.
   */
  async revokeInvite(inviteId: string, inviteeId: string): Promise<void> {
    const parties = await this.read((tx) => tx.inviteParties(inviteId));
    if (!parties || parties.invitee_id !== inviteeId) return;
    await this.withUsers([parties.inviter_id, inviteeId], (tx) =>
      tx.revokeInvite(inviteId, inviteeId),
    );
  }
}

/**
 * Các truy vấn gắn với một client đang mở. Mọi phương thức chạy trong transaction do người gọi mở.
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

  /** Tìm theo tiền tố; escape `\`, `%`, `_` để khớp đúng ký tự nhập vào. */
  async searchMembers(
    prefix: string,
    exceptUserId: string,
  ): Promise<Omit<FriendPeer, "status">[]> {
    return (
      await this.client.query(
        `SELECT p.user_id AS "userId", p.username, p.display_name AS "displayName"
           FROM public.profiles p JOIN xiangqi_auth.principals n ON n.id=p.user_id
          WHERE n.kind='member' AND p.user_id<>$2 AND lower(p.username) LIKE lower($1)||'%'
          ORDER BY p.username LIMIT 20`,
        [prefix.replace(/[\\%_]/g, "\\$&"), exceptUserId],
      )
    ).rows;
  }

  async areFriends(a: string, b: string): Promise<boolean> {
    const row = (
      await this.client.query(
        `SELECT 1 FROM xiangqi_social.friendships WHERE user_a=LEAST($1::uuid,$2::uuid) AND user_b=GREATEST($1::uuid,$2::uuid)`,
        [a, b],
      )
    ).rows[0];
    return Boolean(row);
  }

  /** Người bị chặn (blocker) đã nhận từ requester ít nhất 2 lần từ chối lời mời kết bạn. */
  async hasDeclinedTwice(blocker: string, requester: string): Promise<boolean> {
    const row = (
      await this.client.query(
        `SELECT declines FROM xiangqi_social.friend_decline_counts WHERE blocker_id=$1 AND requester_id=$2`,
        [blocker, requester],
      )
    ).rows[0];
    return Boolean(row && row.declines >= 2);
  }

  async countFriends(userId: string): Promise<number> {
    const row = (
      await this.client.query(
        `SELECT count(*)::int AS n FROM xiangqi_social.friendships WHERE user_a=$1 OR user_b=$1`,
        [userId],
      )
    ).rows[0];
    return row.n;
  }

  async countPendingRequests(userId: string): Promise<number> {
    const row = (
      await this.client.query(
        `SELECT count(*)::int AS n FROM xiangqi_social.friend_requests
          WHERE status='PENDING' AND (sender_id=$1 OR receiver_id=$1)`,
        [userId],
      )
    ).rows[0];
    return row.n;
  }

  /** Lời mời kết bạn PENDING giữa hai người theo cả hai chiều (dedupe, không gia hạn). */
  async findPendingPair(a: string, b: string): Promise<Stamped | null> {
    const row = (
      await this.client.query(
        `SELECT id,created_at,expires_at FROM xiangqi_social.friend_requests
          WHERE status='PENDING' AND ((sender_id=$1 AND receiver_id=$2) OR (sender_id=$2 AND receiver_id=$1))`,
        [a, b],
      )
    ).rows[0];
    return row
      ? {
          id: row.id,
          createdAt: row.created_at.toISOString(),
          expiresAt: row.expires_at.toISOString(),
        }
      : null;
  }

  async insertRequest(sender: string, receiver: string): Promise<Stamped> {
    const row = (
      await this.client.query(
        `WITH t AS MATERIALIZED(SELECT clock_timestamp() AS now)
         INSERT INTO xiangqi_social.friend_requests(id,sender_id,receiver_id,status,created_at,expires_at)
         SELECT $1,$2,$3,'PENDING',t.now,t.now+interval '30 days' FROM t
         RETURNING id,created_at,expires_at`,
        [randomUUID(), sender, receiver],
      )
    ).rows[0];
    return {
      id: row.id,
      createdAt: row.created_at.toISOString(),
      expiresAt: row.expires_at.toISOString(),
    };
  }

  async listPendingRequests(
    userId: string,
    direction: "incoming" | "outgoing",
  ): Promise<
    {
      id: string;
      userId: string;
      username: string;
      displayName: string;
      createdAt: string;
      expiresAt: string;
    }[]
  > {
    const [column, other] =
      direction === "incoming"
        ? ["sender_id", "receiver_id"]
        : ["receiver_id", "sender_id"];
    const rows = (
      await this.client.query(
        `SELECT r.id, p.user_id, p.username, p.display_name, r.created_at, r.expires_at
           FROM xiangqi_social.friend_requests r
           JOIN public.profiles p ON p.user_id = r.${column}
          WHERE r.status='PENDING' AND r.${other}=$1
          ORDER BY r.created_at DESC`,
        [userId],
      )
    ).rows;
    return rows.map((r) => ({
      userId: r.user_id,
      id: r.id,
      username: r.username,
      displayName: r.display_name,
      createdAt: r.created_at.toISOString(),
      expiresAt: r.expires_at.toISOString(),
    }));
  }

  async findPendingRequest(
    requestId: string,
  ): Promise<{ sender_id: string; receiver_id: string } | null> {
    const row = (
      await this.client.query(
        `SELECT sender_id, receiver_id FROM xiangqi_social.friend_requests WHERE id=$1 AND status='PENDING'`,
        [requestId],
      )
    ).rows[0];
    return row ?? null;
  }

  /** Từ chối kết bạn: tăng bộ đếm một chiều (người nhận chặn người gửi). */
  async declineRequest(
    requestId: string,
    blocker: string,
    requester: string,
  ): Promise<void> {
    await this.client.query(
      `UPDATE xiangqi_social.friend_requests SET status='DECLINED',resolved_at=clock_timestamp() WHERE id=$1`,
      [requestId],
    );
    await this.client.query(
      `INSERT INTO xiangqi_social.friend_decline_counts(blocker_id,requester_id,declines) VALUES($1,$2,1)
       ON CONFLICT(blocker_id,requester_id) DO UPDATE SET declines=xiangqi_social.friend_decline_counts.declines+1`,
      [blocker, requester],
    );
  }

  /** Chấp nhận kết bạn: tạo quan hệ và xóa bộ đếm từ chối của cặp theo cả hai chiều. */
  async acceptRequest(requestId: string, a: string, b: string): Promise<void> {
    await this.client.query(
      `UPDATE xiangqi_social.friend_requests SET status='ACCEPTED',resolved_at=clock_timestamp() WHERE id=$1`,
      [requestId],
    );
    await this.client.query(
      `INSERT INTO xiangqi_social.friendships(user_a,user_b,created_at)
       VALUES(LEAST($1::uuid,$2::uuid),GREATEST($1::uuid,$2::uuid),clock_timestamp())`,
      [a, b],
    );
    await this.client.query(
      `DELETE FROM xiangqi_social.friend_decline_counts
        WHERE (blocker_id=$1 AND requester_id=$2) OR (blocker_id=$2 AND requester_id=$1)`,
      [a, b],
    );
  }

  async revokeRequest(requestId: string, sender: string): Promise<boolean> {
    const row = (
      await this.client.query(
        `UPDATE xiangqi_social.friend_requests SET status='REVOKED',resolved_at=clock_timestamp()
          WHERE id=$1 AND sender_id=$2 AND status='PENDING' RETURNING id`,
        [requestId, sender],
      )
    ).rows[0];
    return Boolean(row);
  }

  async removeFriendship(a: string, b: string): Promise<boolean> {
    const row = (
      await this.client.query(
        `DELETE FROM xiangqi_social.friendships WHERE user_a=LEAST($1::uuid,$2::uuid) AND user_b=GREATEST($1::uuid,$2::uuid) RETURNING user_a`,
        [a, b],
      )
    ).rows[0];
    return Boolean(row);
  }

  /** Bạn bè kèm trạng thái: offline khi không có lease hợp lệ; in-match khi có active_players. */
  async listFriendRows(userId: string): Promise<FriendPeer[]> {
    const rows = (
      await this.client.query(
        `SELECT p.user_id AS "userId", p.username, p.display_name AS "displayName",
                CASE
                  WHEN NOT EXISTS(SELECT 1 FROM xiangqi_social.presence_leases l
                                   WHERE l.user_id=p.user_id AND l.expires_at>clock_timestamp()) THEN 'offline'
                  WHEN EXISTS(SELECT 1 FROM public.active_players a WHERE a.user_id=p.user_id) THEN 'in-match'
                  ELSE 'online'
                END AS status
           FROM xiangqi_social.friendships f
           JOIN public.profiles p ON p.user_id = CASE WHEN f.user_a=$1 THEN f.user_b ELSE f.user_a END
          WHERE f.user_a=$1 OR f.user_b=$1
          ORDER BY p.username`,
        [userId],
      )
    ).rows;
    return rows.map((r) => ({ ...r, status: r.status as FriendStatus }));
  }

  /** Heartbeat: dọn lease hết hạn của người này rồi gia hạn lease theo tab (8s). */
  async renewLease(userId: string, connectionId: string): Promise<void> {
    await this.client.query(
      `DELETE FROM xiangqi_social.presence_leases WHERE user_id=$1 AND expires_at<=clock_timestamp()`,
      [userId],
    );
    await this.client.query(
      `INSERT INTO xiangqi_social.presence_leases(user_id,connection_id,expires_at)
       VALUES($1,$2,clock_timestamp()+interval '8 seconds')
       ON CONFLICT(user_id,connection_id) DO UPDATE SET expires_at=clock_timestamp()+interval '8 seconds'`,
      [userId, connectionId],
    );
  }

  async isOnline(userId: string): Promise<boolean> {
    const row = (
      await this.client.query(
        `SELECT 1 FROM xiangqi_social.presence_leases WHERE user_id=$1 AND expires_at>clock_timestamp() LIMIT 1`,
        [userId],
      )
    ).rows[0];
    return Boolean(row);
  }

  /** Mọi loại active_players (phòng, AI, trận) đều là bận. */
  async isBusy(userId: string): Promise<boolean> {
    const row = (
      await this.client.query(
        `SELECT 1 FROM public.active_players WHERE user_id=$1 LIMIT 1`,
        [userId],
      )
    ).rows[0];
    return Boolean(row);
  }

  async isRoomPlayer(roomId: string, userId: string): Promise<boolean> {
    const row = (
      await this.client.query(
        `SELECT 1 FROM public.room_members WHERE room_id=$1 AND user_id=$2 AND role='PLAYER'`,
        [roomId, userId],
      )
    ).rows[0];
    return Boolean(row);
  }

  /**
   * Khóa phòng đang mở (FOR SHARE) sau khi đã khóa actor, để chặn việc khóa/đóng phòng
   * xen giữa lúc tạo lời mời. Chỉ gọi khi không còn khóa actor nào khác phía sau.
   */
  async lockOpenRoom(roomId: string): Promise<boolean> {
    const row = (
      await this.client.query(
        `SELECT 1 FROM public.rooms WHERE id=$1 AND closed_at IS NULL AND visibility<>'LOCKED' FOR SHARE`,
        [roomId],
      )
    ).rows[0];
    return Boolean(row);
  }

  async inviteRoomId(inviteId: string): Promise<string | null> {
    const row = (
      await this.client.query(
        `SELECT room_id FROM xiangqi_social.room_invites WHERE id=$1 AND (status='ACCEPTED' OR (status='PENDING' AND expires_at>clock_timestamp()))`,
        [inviteId],
      )
    ).rows[0];
    return row?.room_id ?? null;
  }

  async inviteParties(inviteId: string): Promise<InviteParties | null> {
    const row = (
      await this.client.query(
        `SELECT room_id, inviter_id, invitee_id FROM xiangqi_social.room_invites WHERE id=$1`,
        [inviteId],
      )
    ).rows[0];
    return row ?? null;
  }

  /** Dedupe lời mời phòng: trả lời mời PENDING còn hạn giống nhau, không gia hạn. */
  async findPendingInviteFor(
    roomId: string,
    inviterId: string,
    inviteeId: string,
  ): Promise<Stamped | null> {
    const row = (
      await this.client.query(
        `SELECT id,created_at,expires_at FROM xiangqi_social.room_invites
          WHERE room_id=$1 AND inviter_id=$2 AND invitee_id=$3 AND status='PENDING' AND expires_at>clock_timestamp()`,
        [roomId, inviterId, inviteeId],
      )
    ).rows[0];
    return row
      ? {
          id: row.id,
          createdAt: row.created_at.toISOString(),
          expiresAt: row.expires_at.toISOString(),
        }
      : null;
  }

  async insertRoomInvite(
    roomId: string,
    inviterId: string,
    inviteeId: string,
  ): Promise<Stamped> {
    const row = (
      await this.client.query(
        `WITH t AS MATERIALIZED(SELECT clock_timestamp() AS now)
         INSERT INTO xiangqi_social.room_invites(id,room_id,inviter_id,invitee_id,status,created_at,expires_at)
         SELECT $1,$2,$3,$4,'PENDING',t.now,t.now+interval '30 seconds' FROM t
         RETURNING id,created_at,expires_at`,
        [randomUUID(), roomId, inviterId, inviteeId],
      )
    ).rows[0];
    return {
      id: row.id,
      createdAt: row.created_at.toISOString(),
      expiresAt: row.expires_at.toISOString(),
    };
  }

  /** Cooldown toàn cục của người gửi, chỉ trả khi còn hiệu lực. */
  async cooldownUntil(senderId: string): Promise<string | null> {
    const row = (
      await this.client.query(
        `SELECT until FROM xiangqi_social.invite_cooldowns WHERE sender_id=$1 AND until>clock_timestamp()`,
        [senderId],
      )
    ).rows[0];
    return row ? row.until.toISOString() : null;
  }

  /** Đặt cooldown tối thiểu now+10s; không bao giờ rút ngắn cooldown hiện có. */
  async bumpCooldown(senderId: string): Promise<string> {
    const row = (
      await this.client.query(
        `INSERT INTO xiangqi_social.invite_cooldowns(sender_id,until)
         VALUES($1,clock_timestamp()+interval '10 seconds')
         ON CONFLICT(sender_id) DO UPDATE
           SET until=GREATEST(xiangqi_social.invite_cooldowns.until, EXCLUDED.until)
         RETURNING until`,
        [senderId],
      )
    ).rows[0];
    return row.until.toISOString();
  }

  async listPendingRoomInvites(inviteeId: string): Promise<
    {
      id: string;
      roomId: string;
      roomName: string;
      inviter: { userId: string; username: string; displayName: string };
      createdAt: string;
      expiresAt: string;
    }[]
  > {
    const rows = (
      await this.client.query(
        `SELECT i.id, i.room_id, r.name AS room_name, p.user_id AS inviter_id, p.username, p.display_name,
                i.created_at, i.expires_at
           FROM xiangqi_social.room_invites i
           JOIN public.rooms r ON r.id=i.room_id
           JOIN public.profiles p ON p.user_id=i.inviter_id
          WHERE i.invitee_id=$1 AND i.status='PENDING' AND i.expires_at>clock_timestamp()
          ORDER BY i.created_at DESC`,
        [inviteeId],
      )
    ).rows;
    return rows.map((r) => ({
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
    }));
  }

  /**
   * Khóa lời mời để phản hồi. Chạy expire trước, FOR UPDATE, sau đó phân loại:
   * replay khi đã có kết quả cùng commandId và cùng loại accept/decline; missing khi không còn PENDING;
   * forbidden khi không phải người được mời.
   */
  async lockInviteForResponse(
    inviteId: string,
    userId: string,
    commandId: string,
    accepted: boolean,
  ): Promise<InviteResponseLock> {
    await this.client.query(
      "UPDATE xiangqi_social.room_invites SET status='EXPIRED',resolved_at=clock_timestamp() WHERE id=$1 AND status='PENDING' AND expires_at<=clock_timestamp()",
      [inviteId],
    );
    const row = (
      await this.client.query(
        `SELECT room_id, invitee_id, status, response_command_id, response_body
           FROM xiangqi_social.room_invites WHERE id=$1 FOR UPDATE`,
        [inviteId],
      )
    ).rows[0];
    if (!row) return { kind: "missing" };
    if (row.invitee_id !== userId) return { kind: "forbidden" };
    if (
      (row.status === "ACCEPTED" || row.status === "DECLINED") &&
      row.response_command_id === commandId &&
      row.response_body?.accepted === accepted
    )
      return { kind: "replay", body: row.response_body };
    if (row.status !== "PENDING") return { kind: "missing" };
    return { kind: "pending", roomId: row.room_id };
  }

  /** Ghi kết quả accept thành công cùng replay body; gọi trong cùng transaction với join phòng. */
  async markInviteAccepted(
    inviteId: string,
    commandId: string,
    body: Extract<RoomInviteResponse, { accepted: true }>,
  ): Promise<void> {
    await this.client.query(
      `UPDATE xiangqi_social.room_invites
          SET status='ACCEPTED',resolved_at=clock_timestamp(),response_command_id=$2,response_body=$3::jsonb
        WHERE id=$1 AND status='PENDING'`,
      [inviteId, commandId, JSON.stringify(body)],
    );
  }

  /**
   * Từ chối lời mời: ghi kết quả, tạo đúng một thông báo cho người gửi và đặt cooldown tối thiểu
   * now+10s. Trả phản hồi kèm cooldownUntil mới.
   */
  async declineInvite(
    inviteId: string,
    commandId: string,
  ): Promise<Extract<RoomInviteResponse, { accepted: false }>> {
    const parties = await this.inviteParties(inviteId);
    if (!parties) throw new Error("declineInvite: invite missing after lock");
    const cooldownUntil = await this.bumpCooldown(parties.inviter_id);
    const body = { accepted: false as const, cooldownUntil };
    await this.client.query(
      `UPDATE xiangqi_social.room_invites
          SET status='DECLINED',resolved_at=clock_timestamp(),response_command_id=$2,response_body=$3::jsonb
        WHERE id=$1 AND status='PENDING'`,
      [inviteId, commandId, JSON.stringify(body)],
    );
    await this.client.query(
      `INSERT INTO xiangqi_social.room_invite_declines(id,invite_id,sender_id,invitee_id,created_at)
       VALUES($1,$2,$3,$4,clock_timestamp()) ON CONFLICT(invite_id) DO NOTHING`,
      [randomUUID(), inviteId, parties.inviter_id, parties.invitee_id],
    );
    return body;
  }

  async revokeInvite(inviteId: string, inviteeId: string): Promise<void> {
    await this.client.query(
      `UPDATE xiangqi_social.room_invites SET status='REVOKED',resolved_at=clock_timestamp()
        WHERE id=$1 AND invitee_id=$2 AND status='PENDING'`,
      [inviteId, inviteeId],
    );
  }

  async listOpenDeclines(senderId: string): Promise<InviteDeclineView[]> {
    const rows = (
      await this.client.query(
        `SELECT d.id, d.invite_id, p.display_name, d.created_at
           FROM xiangqi_social.room_invite_declines d
           JOIN public.profiles p ON p.user_id=d.invitee_id
          WHERE d.sender_id=$1 AND d.acked_at IS NULL
          ORDER BY d.created_at`,
        [senderId],
      )
    ).rows;
    return rows.map((r) => ({
      id: r.id,
      inviteId: r.invite_id,
      displayName: r.display_name,
      createdAt: r.created_at.toISOString(),
    }));
  }

  /** Ack idempotent: lần đầu đặt acked_at, các lần sau giữ nguyên. */
  async ackDecline(noticeId: string, senderId: string): Promise<boolean> {
    const row = (
      await this.client.query(
        `UPDATE xiangqi_social.room_invite_declines SET acked_at=COALESCE(acked_at,clock_timestamp())
          WHERE id=$1 AND sender_id=$2 RETURNING id`,
        [noticeId, senderId],
      )
    ).rows[0];
    return Boolean(row);
  }
}
