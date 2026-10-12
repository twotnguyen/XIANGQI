import type { Socket } from "socket.io";
import type {
  ChatAcknowledgement,
  ChatChannel,
  ChatPage,
  ChatReadRequest,
  ChatSendRequest,
  ChatSent,
  ClientChatEvents,
} from "@xiangqi/shared";
import { RoomError } from "../room/contracts.js";
import {
  RealtimeError,
  type RealtimeConnection,
} from "../realtime/contracts.js";

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
export function bindRoomChat(
  socket: Socket<ClientChatEvents>,
  dependencies: RoomChatGateway,
) {
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
    void dependencies
      .track(async () => {
        let connection: RealtimeConnection;
        try {
          connection = await dependencies.authorize();
          if (dependencies.stopping()) {
            acknowledge(failure(null));
            return;
          }
          const value = await dependencies.chat.send(connection, input);
          // The service returns only after COMMIT. Subsequent publication is retried by the outbox.
          acknowledge({ status: "ok", value });
        } catch (error) {
          acknowledge(failure(error));
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
