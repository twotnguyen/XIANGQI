import { createHash, randomUUID } from "node:crypto";
import { RoomError, type RoomScope } from "../room/contracts.js";
export type ChatChannel = "PLAYERS_PRIVATE" | "ROOM_PUBLIC";
export interface ChatMessage {
  messageId: string;
  roomId: string;
  sequence: number;
  channel: ChatChannel;
  content: string;
  createdAt: string;
  sender: {
    displayName: string;
    isGuest: boolean;
    role: "red" | "black" | "spectator";
  };
}
export interface ChatPage {
  messages: ChatMessage[];
  nextCursor: number;
  hasMore: boolean;
}
export interface ChatSent {
  messageId: string;
  sequence: number;
  createdAt: string;
}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function invalid(): never {
  throw new RoomError("CHAT_INPUT_INVALID", "Tin nhắn không hợp lệ", 400);
}
function denied(): never {
  throw new RoomError(
    "CHAT_FORBIDDEN",
    "Bạn không có quyền truy cập kênh chat này",
    403,
  );
}
// Runtime must bind this scope to pre/post room-lock session authorization. No credentials or controller grants are accepted here.
export class ChatStore {
  constructor(private readonly mask: (content: string) => string) {}
  private async access(s: RoomScope, id: string, channel: ChatChannel) {
    if (!uuid.test(id) || !["PLAYERS_PRIVATE", "ROOM_PUBLIC"].includes(channel))
      invalid();
    if (!s.lockedActorIds.has(s.actor.userId) || !s.lockedRoomIds.has(id))
      throw new RoomError(
        "ROOM_LOCK_REQUIRED",
        "Giao dịch phòng chưa sẵn sàng",
        503,
      );
    const row = (
      await s.client.query<{
        role: string;
        side: "RED" | "BLACK" | null;
        floor: string;
        pair_epoch: string;
        sequence: string;
      }>(
        `SELECT m.role,e.floor,c.pair_epoch,c.sequence,m.side FROM public.rooms r JOIN public.room_members m ON m.room_id=r.id JOIN xiangqi_auth.principals p ON p.id=m.user_id JOIN xiangqi_chat.rooms c ON c.room_id=r.id JOIN xiangqi_chat.entries e ON e.room_id=r.id AND e.user_id=m.user_id WHERE r.id=$1 AND m.user_id=$2 AND p.kind=$3 AND r.invite_code IS NOT NULL AND r.closed_at IS NULL AND r.status IN('WAITING','PLAYING','FINISHED') FOR UPDATE OF r,c,m`,
        [id, s.actor.userId, s.actor.kind],
      )
    ).rows[0];
    if (!row || (channel === "PLAYERS_PRIVATE" && row.role !== "PLAYER"))
      denied();
    // Sample the grace deadline after every row-lock wait, while membership stays locked.
    const fresh = await s.client.query(
      `SELECT 1 FROM public.room_members WHERE room_id=$1 AND user_id=$2 AND (role<>'SPECTATOR' OR disconnected_at IS NULL OR disconnected_at+interval '300 seconds'>clock_timestamp())`,
      [id, s.actor.userId],
    );
    if (!fresh.rowCount) denied();
    return { ...row, floor: row.role === "SPECTATOR" ? Number(row.floor) : 0 };
  }
  async read(
    s: RoomScope,
    id: string,
    channel: ChatChannel,
    after = 0,
  ): Promise<ChatPage> {
    if (!Number.isSafeInteger(after) || after < 0) invalid();
    const access = await this.access(s, id, channel);
    const rows = (
      await s.client.query<{
        id: string;
        sequence: string;
        content: string;
        created_at: Date;
        display_name: string;
        kind: string;
        sender_role: "red" | "black" | "spectator";
      }>(
        `SELECT x.id,x.sequence,x.content,x.created_at,p.display_name,n.kind,x.sender_role FROM xiangqi_chat.messages x JOIN xiangqi_auth.principals n ON n.id=x.sender_id JOIN public.profiles p ON p.user_id=x.sender_id WHERE x.room_id=$1 AND x.channel=$2 AND x.sequence>$3 AND ($2='ROOM_PUBLIC' OR x.pair_epoch=$4) ORDER BY x.sequence LIMIT 51`,
        [id, channel, Math.max(after, access.floor), access.pair_epoch],
      )
    ).rows;
    const messages = rows.slice(0, 50).map((x) => ({
      messageId: x.id,
      roomId: id,
      sequence: Number(x.sequence),
      channel,
      content: x.content,
      createdAt: x.created_at.toISOString(),
      sender: {
        displayName: x.display_name,
        isGuest: x.kind === "guest",
        role: x.sender_role,
      },
    }));
    return {
      messages,
      nextCursor: messages.at(-1)?.sequence ?? after,
      hasMore: rows.length > 50,
    };
  }
  async send(
    s: RoomScope,
    id: string,
    input: { commandId: string; channel: ChatChannel; content: string },
  ): Promise<ChatSent> {
    if (
      !input ||
      typeof input.commandId !== "string" ||
      !uuid.test(input.commandId) ||
      typeof input.content !== "string" ||
      Array.from(input.content).length > 200 ||
      !input.content.trim()
    )
      invalid();
    const access = await this.access(s, id, input.channel),
      fingerprint = createHash("sha256")
        .update(
          JSON.stringify({ channel: input.channel, content: input.content }),
        )
        .digest("hex"),
      key = [s.actor.userId, id, input.commandId];
    const receipt = (
      await s.client.query<{
        fingerprint: string;
        pair_epoch: string | null;
        sequence: string;
        message_id: string;
        created_at: Date;
      }>(
        "SELECT fingerprint,pair_epoch,sequence,message_id,created_at FROM xiangqi_chat.receipts WHERE actor_id=$1 AND room_id=$2 AND command_id=$3 AND expires_at>clock_timestamp()",
        key,
      )
    ).rows[0];
    if (receipt) {
      if (receipt.fingerprint !== fingerprint)
        throw new RoomError(
          "COMMAND_ID_REUSED",
          "Mã lệnh đã được dùng cho nội dung khác",
          409,
        );
      if (
        (input.channel === "PLAYERS_PRIVATE" &&
          receipt.pair_epoch !== access.pair_epoch) ||
        Number(receipt.sequence) <= access.floor
      )
        throw new RoomError(
          "CHAT_SCOPE_CHANGED",
          "Quyền đọc chat đã thay đổi",
          409,
        );
      return {
        messageId: receipt.message_id,
        sequence: Number(receipt.sequence),
        createdAt: receipt.created_at.toISOString(),
      };
    }
    const content = this.mask(input.content);
    if (
      typeof content !== "string" ||
      !content.trim() ||
      Array.from(content).length > 600
    )
      throw new RoomError("CHAT_UNAVAILABLE", "Chat chưa sẵn sàng", 503);
    await s.client.query(
      "INSERT INTO xiangqi_chat.rate(actor_id,sent_at) VALUES($1,'{}') ON CONFLICT DO NOTHING",
      [s.actor.userId],
    );
    const rate = (
      await s.client.query<{ sent_at: Date[] }>(
        "SELECT sent_at FROM xiangqi_chat.rate WHERE actor_id=$1 FOR UPDATE",
        [s.actor.userId],
      )
    ).rows[0]!.sent_at;
    const now = (
      await s.client.query<{ now: Date }>("SELECT clock_timestamp() AS now")
    ).rows[0]!.now;
    const times = rate.filter((t) => t.getTime() > now.getTime() - 10000);
    if (times.length >= 5)
      throw new RoomError("CHAT_RATE_LIMITED", "Bạn gửi quá nhanh", 429);
    await s.client.query(
      "UPDATE xiangqi_chat.rate SET sent_at=$2 WHERE actor_id=$1",
      [s.actor.userId, [...times, now]],
    );
    const sequence = Number(
        (
          await s.client.query<{ sequence: string }>(
            "UPDATE xiangqi_chat.rooms SET sequence=sequence+1 WHERE room_id=$1 RETURNING sequence",
            [id],
          )
        ).rows[0]!.sequence,
      ),
      messageId = randomUUID(),
      epoch = input.channel === "PLAYERS_PRIVATE" ? access.pair_epoch : null;
    await s.client.query(
      "INSERT INTO xiangqi_chat.messages(id,room_id,sequence,sender_id,channel,pair_epoch,content,created_at,sender_role) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9)",
      [
        messageId,
        id,
        sequence,
        s.actor.userId,
        input.channel,
        epoch,
        content,
        now,
        access.role === "SPECTATOR"
          ? "spectator"
          : access.side === "RED"
            ? "red"
            : "black",
      ],
    );
    await s.client.query(
      "DELETE FROM xiangqi_chat.receipts WHERE actor_id=$1 AND room_id=$2 AND command_id=$3",
      key,
    );
    await s.client.query(
      "INSERT INTO xiangqi_chat.receipts(actor_id,room_id,command_id,fingerprint,channel,pair_epoch,message_id,sequence,created_at,expires_at) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$9::timestamptz+interval '24 hours')",
      [...key, fingerprint, input.channel, epoch, messageId, sequence, now],
    );
    await s.client.query(
      "INSERT INTO xiangqi_chat.outbox(message_id,room_id,sequence,next_attempt_at) VALUES($1,$2,$3,$4)",
      [messageId, id, sequence, now],
    );
    return { messageId, sequence, createdAt: now.toISOString() };
  }
}
