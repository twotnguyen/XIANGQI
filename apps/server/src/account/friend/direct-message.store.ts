import type { Pool, PoolClient } from "pg";
import { actorLock, transaction } from "../../core/postgres.js";
import { FriendError } from "./friend.types.js";

export interface DirectMessageRow {
  id: string;
  seq: number;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface DirectMessageSend {
  message: DirectMessageRow;
  replayed: boolean;
}

export interface DirectMessageList {
  messages: DirectMessageRow[];
  readSeq: number;
}

export interface DirectMessageUnread {
  peerId: string;
  unread: number;
}

/** Thứ tự khóa actor giống FriendStore.withUsers để không deadlock với hủy kết bạn. */
async function lockPair(client: PoolClient, a: string, b: string) {
  for (const id of [a, b].sort()) await actorLock(client, id);
}

/** Lưu tin nhắn riêng và watermark đọc; mọi kiểm tra bạn bè chạy dưới actor lock cùng cặp. */
export class DirectMessageStore {
  constructor(private readonly pool: Pool) {}

  /**
   * Gửi tin: khóa cặp, kiểm tra bạn bè, replay theo commandId, rồi rate limit 5 tin/10 giây.
   * Replay không tiêu thụ rate.
   */
  send(input: {
    viewer: string;
    peer: string;
    commandId: string;
    fingerprint: string;
    content: string;
  }): Promise<DirectMessageSend> {
    return transaction(this.pool, async (client) => {
      await lockPair(client, input.viewer, input.peer);
      await requireFriends(client, input.viewer, input.peer);
      const prior = (
        await client.query(
          `SELECT id,seq,sender_id,content,fingerprint,created_at FROM xiangqi_social.direct_messages
            WHERE sender_id=$1 AND command_id=$2`,
          [input.viewer, input.commandId],
        )
      ).rows[0];
      if (prior) {
        if (prior.fingerprint !== input.fingerprint)
          throw new FriendError(
            "DM_COMMAND_ID_REUSED",
            "Mã lệnh đã dùng cho tin khác",
            409,
          );
        return { message: toRow(prior), replayed: true };
      }
      const now = (
        await client.query(
          `SELECT clock_timestamp() AS now,
                  COALESCE((SELECT sent_at FROM xiangqi_social.direct_message_rate WHERE sender_id=$1),'{}') AS sent`,
          [input.viewer],
        )
      ).rows[0];
      const recent = (now.sent as Date[]).filter(
        (at) => at.getTime() > now.now.getTime() - 10_000,
      );
      if (recent.length >= 5)
        throw new FriendError(
          "DM_RATE_LIMITED",
          "Bạn nhắn quá nhanh, thử lại sau ít giây",
          429,
        );
      await client.query(
        `INSERT INTO xiangqi_social.direct_message_rate(sender_id,sent_at) VALUES($1,$2)
         ON CONFLICT(sender_id) DO UPDATE SET sent_at=EXCLUDED.sent_at`,
        [input.viewer, [...recent, now.now].slice(-5)],
      );
      const row = (
        await client.query(
          `INSERT INTO xiangqi_social.direct_messages(id,user_low,user_high,sender_id,command_id,fingerprint,content,created_at)
           VALUES(gen_random_uuid(),LEAST($1::uuid,$2::uuid),GREATEST($1::uuid,$2::uuid),$1,$3,$4,$5,$6)
           RETURNING id,seq,sender_id,content,fingerprint,created_at`,
          [
            input.viewer,
            input.peer,
            input.commandId,
            input.fingerprint,
            input.content,
            now.now,
          ],
        )
      ).rows[0];
      return { message: toRow(row), replayed: false };
    });
  }

  /** Lịch sử mới nhất trước `before` (seq), trả về theo thứ tự tăng dần; chỉ khi còn là bạn. */
  list(
    viewer: string,
    peer: string,
    before: number | null,
    limit: number,
  ): Promise<DirectMessageList> {
    return transaction(this.pool, async (client) => {
      await requireFriends(client, viewer, peer);
      const rows = (
        await client.query(
          `SELECT id,seq,sender_id,content,created_at FROM xiangqi_social.direct_messages
            WHERE user_low=LEAST($1::uuid,$2::uuid) AND user_high=GREATEST($1::uuid,$2::uuid)
              AND ($3::bigint IS NULL OR seq<$3)
            ORDER BY seq DESC LIMIT $4`,
          [viewer, peer, before, limit],
        )
      ).rows;
      const readSeq = await readWatermark(client, viewer, peer);
      return { messages: rows.reverse().map(toRow), readSeq };
    });
  }

  /**
   * Đánh dấu đã đọc tới `upTo`. Được kẹp theo tin đến lớn nhất của bạn và chỉ tăng,
   * nên request cũ đến sau không hạ watermark.
   */
  markRead(viewer: string, peer: string, upTo: number): Promise<number> {
    return transaction(this.pool, async (client) => {
      await lockPair(client, viewer, peer);
      await requireFriends(client, viewer, peer);
      const row = (
        await client.query(
          `WITH cap AS (
             SELECT COALESCE(MAX(seq),0) AS max_seq FROM xiangqi_social.direct_messages
              WHERE user_low=LEAST($1::uuid,$2::uuid) AND user_high=GREATEST($1::uuid,$2::uuid) AND sender_id=$2)
           INSERT INTO xiangqi_social.direct_message_reads(reader_id,peer_id,read_seq,updated_at)
           SELECT $1,$2,LEAST($3::bigint,cap.max_seq),clock_timestamp() FROM cap
           ON CONFLICT(reader_id,peer_id) DO UPDATE
             SET read_seq=GREATEST(xiangqi_social.direct_message_reads.read_seq,EXCLUDED.read_seq),
                 updated_at=clock_timestamp()
           RETURNING read_seq`,
          [viewer, peer, upTo],
        )
      ).rows[0];
      return Number(row.read_seq);
    });
  }

  /** Số tin chưa đọc từ từng bạn hiện tại; bạn đã hủy hoặc tin của chính mình không được tính. */
  unreadByFriend(viewer: string): Promise<DirectMessageUnread[]> {
    return transaction(this.pool, async (client) => {
      const rows = (
        await client.query(
          `SELECT CASE WHEN f.user_a=$1 THEN f.user_b ELSE f.user_a END AS peer_id,
                  count(m.seq)::int AS unread
             FROM xiangqi_social.friendships f
             JOIN xiangqi_social.direct_messages m
               ON m.user_low=f.user_a AND m.user_high=f.user_b AND m.sender_id<>$1
              AND m.sender_id IN(f.user_a,f.user_b)
             LEFT JOIN xiangqi_social.direct_message_reads r
               ON r.reader_id=$1 AND r.peer_id=m.sender_id
            WHERE (f.user_a=$1 OR f.user_b=$1) AND m.seq>COALESCE(r.read_seq,0)
            GROUP BY 1`,
          [viewer],
        )
      ).rows;
      return rows.map((row) => ({ peerId: row.peer_id, unread: row.unread }));
    });
  }
}

async function requireFriends(client: PoolClient, a: string, b: string) {
  const row = (
    await client.query(
      `SELECT 1 FROM xiangqi_social.friendships WHERE user_a=LEAST($1::uuid,$2::uuid) AND user_b=GREATEST($1::uuid,$2::uuid)`,
      [a, b],
    )
  ).rows[0];
  if (!row)
    throw new FriendError(
      "DM_NOT_FRIENDS",
      "Chỉ bạn bè mới được nhắn tin",
      403,
    );
}

async function readWatermark(client: PoolClient, viewer: string, peer: string) {
  const row = (
    await client.query(
      `SELECT read_seq FROM xiangqi_social.direct_message_reads WHERE reader_id=$1 AND peer_id=$2`,
      [viewer, peer],
    )
  ).rows[0];
  return row ? Number(row.read_seq) : 0;
}

function toRow(row: {
  id: string;
  seq: string | number;
  sender_id: string;
  content: string;
  created_at: Date;
}): DirectMessageRow {
  return {
    id: row.id,
    seq: Number(row.seq),
    senderId: row.sender_id,
    content: row.content,
    createdAt: row.created_at.toISOString(),
  };
}
