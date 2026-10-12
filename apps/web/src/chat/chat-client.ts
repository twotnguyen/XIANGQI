import type {
  ChatChannel,
  ChatPage,
  ChatSent,
  ServerChatEvents,
} from "@xiangqi/shared";
export type ChatChanged = Parameters<ServerChatEvents["chat.changed"]>[0];
export const chatUuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function invalid(): never {
  throw new Error("Phản hồi chat không hợp lệ. Vui lòng thử lại.");
}
function body(value: unknown, keys: string[]): Record<string, unknown> {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.keys(value).length !== keys.length ||
    Object.keys(value).some((key) => !keys.includes(key))
  )
    invalid();
  return value as Record<string, unknown>;
}
function integer(value: unknown, min = 0): value is number {
  return Number.isSafeInteger(value) && (value as number) >= min;
}
function date(value: unknown) {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(
      value,
    ) ||
    !Number.isFinite(Date.parse(value))
  )
    return false;
  const year = Number(value.slice(0, 4)),
    month = Number(value.slice(5, 7)),
    day = Number(value.slice(8, 10));
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
  return month >= 1 && month <= 12 && day >= 1 && day <= days[month - 1]!;
}
export function isChatChannel(value: unknown): value is ChatChannel {
  return value === "PLAYERS_PRIVATE" || value === "ROOM_PUBLIC";
}
function authority(value: Record<string, unknown>, roomId: string) {
  if (
    !chatUuid.test(roomId) ||
    value.roomId !== roomId ||
    !isChatChannel(value.channel) ||
    !integer(value.roomVersion) ||
    typeof value.scopeToken !== "string" ||
    !/^[a-f0-9]{64}$/.test(value.scopeToken) ||
    typeof value.canSend !== "boolean"
  )
    invalid();
}
export function parseChatChanged(value: unknown, roomId: string): ChatChanged {
  const v = body(value, [
    "roomId",
    "channel",
    "roomVersion",
    "scopeToken",
    "canSend",
  ]);
  authority(v, roomId);
  return v as unknown as ChatChanged;
}
export function parseChatSent(value: unknown): ChatSent {
  const v = body(value, ["messageId", "sequence", "createdAt"]);
  if (
    typeof v.messageId !== "string" ||
    !chatUuid.test(v.messageId) ||
    !integer(v.sequence, 1) ||
    !date(v.createdAt)
  )
    invalid();
  return v as unknown as ChatSent;
}
export function parseChatPage(
  value: unknown,
  roomId: string,
  channel: ChatChannel,
  after = 0,
): ChatPage {
  const v = body(value, [
    "roomId",
    "channel",
    "roomVersion",
    "scopeToken",
    "canSend",
    "messages",
    "nextCursor",
    "hasMore",
  ]);
  authority(v, roomId);
  if (
    v.channel !== channel ||
    !integer(after) ||
    !Array.isArray(v.messages) ||
    v.messages.length > 50 ||
    !integer(v.nextCursor) ||
    typeof v.hasMore !== "boolean" ||
    (v.hasMore && v.messages.length !== 50)
  )
    invalid();
  let previous = after;
  const ids = new Set<string>();
  for (const value of v.messages) {
    const m = body(value, [
      "messageId",
      "roomId",
      "sequence",
      "channel",
      "content",
      "createdAt",
      "sender",
    ]);
    const sender = body(m.sender, ["displayName", "isGuest", "role"]);
    if (
      typeof m.messageId !== "string" ||
      !chatUuid.test(m.messageId) ||
      ids.has(m.messageId.toLowerCase()) ||
      m.roomId !== roomId ||
      m.channel !== channel ||
      !integer(m.sequence, 1) ||
      m.sequence <= previous ||
      typeof m.content !== "string" ||
      Array.from(m.content).length > 600 ||
      !date(m.createdAt) ||
      typeof sender.displayName !== "string" ||
      !sender.displayName ||
      typeof sender.isGuest !== "boolean" ||
      !["red", "black", "spectator"].includes(sender.role as string)
    )
      invalid();
    ids.add(m.messageId.toLowerCase());
    previous = m.sequence;
  }
  if (v.nextCursor !== previous) invalid();
  return v as unknown as ChatPage;
}
const errorMessages: Record<string, string> = {
  AUTH_REQUIRED: "Phiên đăng nhập không hợp lệ",
  CHAT_FORBIDDEN: "Bạn không có quyền truy cập kênh chat này",
  CHAT_INPUT_INVALID: "Tin nhắn không hợp lệ",
  CHAT_RATE_LIMITED: "Bạn gửi quá nhanh",
  CHAT_SCOPE_CHANGED: "Quyền đọc chat đã thay đổi",
  COMMAND_ID_REUSED: "Mã lệnh đã được dùng cho nội dung khác",
  TAB_READ_ONLY: "Tab này chỉ có thể xem",
};
export function chatAcknowledgement(value: unknown): unknown {
  if (!value || typeof value !== "object") invalid();
  if ((value as { status?: unknown }).status === "ok")
    return body(value, ["status", "value"]).value;
  const ack = body(value, ["status", "error"]);
  if (ack.status !== "error") invalid();
  const error = body(ack.error, ["code", "message"]);
  throw new Error(
    typeof error.code === "string" && Object.hasOwn(errorMessages, error.code)
      ? errorMessages[error.code]
      : "Chat tạm thời không dùng được",
  );
}
