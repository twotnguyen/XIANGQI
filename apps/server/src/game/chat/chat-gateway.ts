import type { Socket } from "socket.io";
import { chatSticker, maskForbiddenChat } from "@xiangqi/shared";
import type {
  ChatAcknowledgement,
  ChatChannel,
  ChatPage,
  ChatPreview,
  ChatPreviewRevert,
  ChatReadRequest,
  ChatSendRequest,
  ChatSent,
  ClientChatEvents,
} from "@xiangqi/shared";
import { RoomError } from "../room/room.types.js";
import {
  RealtimeError,
  type RealtimeConnection,
} from "../realtime/realtime.types.js";

export interface ChatPreviewHub {
  /** Danh tính người gửi theo snapshot gần nhất đã giao cho chính socket này; null thì không phát tạm. */
  self(): {
    roomId: string;
    userId: string;
    role: "red" | "black" | "spectator";
    displayName: string;
    isGuest: boolean;
  } | null;
  send(channel: ChatChannel, preview: ChatPreview): void;
  revert(channel: ChatChannel, revert: ChatPreviewRevert): void;
}
export interface RoomChatGateway {
  authorize(): Promise<RealtimeConnection>;
  chat: {
    read(
      connection: RealtimeConnection,
      input: ChatReadRequest,
    ): Promise<ChatPage>;
    send(
      connection: RealtimeConnection,
      input: ChatSendRequest,
    ): Promise<ChatSent>;
  };
  changed(roomId: string, channel: ChatChannel): Promise<void>;
  preview?: ChatPreviewHub;
  stopping(): boolean;
  track<T>(work: () => Promise<T>): Promise<T>;
}
const messages: Record<string, string> = {
  AUTH_REQUIRED: "Phiên đăng nhập không hợp lệ",
  CHAT_FORBIDDEN: "Bạn không có quyền truy cập kênh chat này",
  CHAT_INPUT_INVALID: "Tin nhắn không hợp lệ",
  CHAT_RATE_LIMITED: "Bạn gửi quá nhanh",
  CHAT_SCOPE_CHANGED: "Quyền đọc chat đã thay đổi",
  COMMAND_ID_REUSED: "Mã lệnh đã được dùng cho nội dung khác",
  TAB_READ_ONLY: "Tab này chỉ có thể xem",
};
function failure(error: unknown): ChatAcknowledgement<never> {
  const code =
    (error instanceof RoomError || error instanceof RealtimeError) &&
    Object.hasOwn(messages, error.code)
      ? error.code
      : "REALTIME_UNAVAILABLE";
  return {
    status: "error",
    error: { code, message: messages[code] ?? "Chat chưa sẵn sàng" },
  };
}
const uuidPattern =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/** Cùng điều kiện đầu vào với `ChatStore.send`; sai bất kỳ điều kiện nào thì không phát. */
function previewSend(
  hub: ChatPreviewHub | undefined,
  input: ChatSendRequest,
): ChatPreview | null {
  const self = hub?.self();
  if (
    !hub ||
    !self ||
    !input ||
    typeof input.commandId !== "string" ||
    !uuidPattern.test(input.commandId) ||
    (input.channel !== "ROOM_PUBLIC" && input.channel !== "PLAYERS_PRIVATE") ||
    (input.channel === "PLAYERS_PRIVATE" && self.role === "spectator") ||
    typeof input.content !== "string" ||
    Array.from(input.content).length > 200 ||
    !input.content.trim() ||
    (/^:[a-z0-9_+-]+:$/i.test(input.content) && !chatSticker(input.content))
  )
    return null;
  const preview: ChatPreview = {
    roomId: self.roomId,
    channel: input.channel,
    commandId: input.commandId,
    senderId: self.userId,
    content: maskForbiddenChat(input.content),
    createdAt: new Date().toISOString(),
    sender: {
      displayName: self.displayName,
      isGuest: self.isGuest,
      role: self.role,
    },
  };
  hub.send(input.channel, preview);
  return preview;
}
function revertSend(hub: ChatPreviewHub | undefined, preview: ChatPreview) {
  hub?.revert(preview.channel, {
    roomId: preview.roomId,
    channel: preview.channel,
    commandId: preview.commandId,
  });
}
/**
 * Lắng nghe và xử lý các sự kiện tin nhắn chat (`chat.read`, `chat.send`) từ kết nối socket của client.
 */
export function bindRoomChat(
  socket: Socket<ClientChatEvents>,
  dependencies: RoomChatGateway,
) {
  // Cùng quota server (5 tin/10 giây): preview phát trước DB nên phải tự chặn, không thì spam tràn màn người khác.
  // shortcut: đếm theo socket, nhiều tab của một người cộng dồn; chuyển sang đếm theo actor nếu thấy lạm dụng nhiều tab.
  const previews: number[] = [];
  socket.on("chat.read", (input, acknowledge) => {
    if (typeof acknowledge !== "function") return;
    if (dependencies.stopping()) {
      acknowledge(failure(null));
      return;
    }
    void dependencies
      .track(async () => {
        try {
          const connection = await dependencies.authorize();
          if (dependencies.stopping()) {
            acknowledge(failure(null));
            return;
          }
          const value = await dependencies.chat.read(connection, input);
          acknowledge({ status: "ok", value });
        } catch (error) {
          acknowledge(failure(error));
        }
      })
      .catch(() => {});
  });
  socket.on("chat.send", (input, acknowledge) => {
    if (typeof acknowledge !== "function") return;
    if (dependencies.stopping()) {
      acknowledge(failure(null));
      return;
    }
    // Hiển thị tạm cho người cùng kênh ngay, không chờ database; tin chính thức vẫn chỉ có sau commit.
    let sent: ChatPreview | null = null;
    const now = Date.now();
    while (previews.length && previews[0]! <= now - 10_000) previews.shift();
    if (previews.length < 5) {
      try {
        sent = previewSend(dependencies.preview, input);
      } catch {
        /* Xem trước chỉ là phần thêm; không được ảnh hưởng việc gửi thật. */
      }
      if (sent) previews.push(now);
    }
    void dependencies
      .track(async () => {
        let connection: RealtimeConnection;
        try {
          connection = await dependencies.authorize();
          if (dependencies.stopping()) {
            acknowledge(failure(null));
            if (sent) revertSend(dependencies.preview, sent);
            return;
          }
          const value = await dependencies.chat.send(connection, input);
          // The service returns only after COMMIT. Subsequent publication is retried by the outbox.
          acknowledge({ status: "ok", value });
        } catch (error) {
          acknowledge(failure(error));
          if (sent) revertSend(dependencies.preview, sent);
          return;
        }
        try {
          await dependencies.changed(connection.roomId, input.channel);
        } catch {
          /* The durable outbox retains delivery ownership. Never leak message/error payloads. */
        }
      })
      .catch(() => {});
  });
}
