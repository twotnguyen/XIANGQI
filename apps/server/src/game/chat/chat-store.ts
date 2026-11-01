import { createHash, randomUUID } from "node:crypto";
import { chatSticker } from "@xiangqi/shared";
import { consumeChatRate } from "../../core/chat-rate.store.js";
import { RoomError, type RoomScope } from "../room/room.types.js";
export type ChatChannel = "PLAYERS_PRIVATE" | "ROOM_PUBLIC";
export interface ChatMessage {
  messageId: string;
  senderId: string;
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
  latestSequence: number;
  hasMore: boolean;
}
export interface ChatSent {
  messageId: string;
  sequence: number;
  createdAt: string;
}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function invalidChatInput(): never {
  throw new RoomError("CHAT_INPUT_INVALID", "Tin nhắn không hợp lệ", 400);
}
function denied(): never {
  throw new RoomError(
    "CHAT_FORBIDDEN",
    "Bạn không có quyền truy cập kênh chat này",
    403,
  );
}
/**
 * Lớp Store quản lý cơ sở dữ liệu chat trong phòng: đọc lịch sử chat, gửi tin nhắn, lọc từ ngữ và giới hạn tần suất.
 */
export class ChatStore {
  constructor(private readonly mask: (content: string) => string) {}
  private async access(
    s: RoomScope,
    id: string,
    channel: ChatChannel,
    forUpdate = true,
  ) {
    if (!uuid.test(id) || !["PLAYERS_PRIVATE", "ROOM_PUBLIC"].includes(channel))
      invalidChatInput();
    if (!s.lockedActorIds.has(s.actor.userId) || !s.lockedRoomIds.has(id))
      throw new RoomError(
        "ROOM_LOCK_REQUIRED",
        "Giao dịch phòng chưa sẵn sàng",
        503,
      );
    const lockClause = forUpdate ? " FOR UPDATE OF r,c,m" : "";
    const row = (
      await s.client.query<{
        role: string;
        side: "RED" | "BLACK" | null;
        floor: string;
        pair_epoch: string;
        sequence: string;
      }>(
        `SELECT m.role,e.floor,c.pair_epoch,c.sequence,m.side FROM public.rooms r JOIN public.room_members m ON m.room_id=r.id JOIN xiangqi_auth.principals p ON p.id=m.user_id JOIN xiangqi_chat.rooms c ON c.room_id=r.id JOIN xiangqi_chat.entries e ON e.room_id=r.id AND e.user_id=m.user_id WHERE r.id=$1 AND m.user_id=$2 AND p.kind=$3 AND (COALESCE(to_jsonb(r)->>'kind','CUSTOM')<>'CUSTOM' OR r.invite_code IS NOT NULL) AND (COALESCE(to_jsonb(r)->>'kind','CUSTOM')='CUSTOM' OR ($4='PLAYERS_PRIVATE' AND m.role='PLAYER')) AND r.closed_at IS NULL AND r.status IN('WAITING','PLAYING','FINISHED')${lockClause}`,
        [id, s.actor.userId, s.actor.kind, channel],
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
    return { ...row, floor: Number(row.floor) };
  }
  /**
   * Truy vấn danh sách tin nhắn chat theo trang từ mốc thứ tự `after`, bảo đảm khán giả không xem được tin trước khi vào phòng.
   */
  async read(
    s: RoomScope,
    id: string,
    channel: ChatChannel,
    after = 0,
  ): Promise<ChatPage> {
    if (!Number.isSafeInteger(after) || after < 0) invalidChatInput();
    const access = await this.access(s, id, channel);
    const rows = (
      await s.client.query<{
        id: string;
        sequence: string;
        content: string;
        sender_id: string;
        created_at: Date;
        display_name: string;
        kind: string;
        sender_role: "red" | "black" | "spectator";
      }>(
        `SELECT x.id,x.sequence,x.sender_id,x.content,x.created_at,p.display_name,n.kind,x.sender_role FROM xiangqi_chat.messages x JOIN xiangqi_auth.principals n ON n.id=x.sender_id JOIN public.profiles p ON p.user_id=x.sender_id WHERE x.room_id=$1 AND x.channel=$2 AND x.sequence>$3 AND ($2='ROOM_PUBLIC' OR x.pair_epoch=$4) ORDER BY x.sequence LIMIT 51`,
        [
          id,
          channel,
          channel === "ROOM_PUBLIC" ? Math.max(after, access.floor) : after,
          access.pair_epoch,
        ],
      )
    ).rows;
    const messages = rows.slice(0, 50).map((x) => ({
      messageId: x.id,
      senderId: x.sender_id,
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
      latestSequence: Number(access.sequence),
      hasMore: rows.length > 50,
    };
  }
  /**
   * Gửi tin nhắn mới vào phòng: lọc từ cấm, kiểm tra rate limit (tối đa 5 tin/10 giây), lưu tin và ghi outbox.
   */
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
      !input.content.trim() ||
      (/^:[a-z0-9_+-]+:$/i.test(input.content) && !chatSticker(input.content))
    )
      invalidChatInput();
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
        (input.channel === "ROOM_PUBLIC" &&
          Number(receipt.sequence) <= access.floor)
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
    const now = await consumeChatRate(s.client, s.actor.userId);
    if (!now)
      throw new RoomError("CHAT_RATE_LIMITED", "Bạn gửi quá nhanh", 429);
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
