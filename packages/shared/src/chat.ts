/**
 * Kênh trò chuyện trong phòng cờ:
 * - PLAYERS_PRIVATE: Kênh chat riêng tư chỉ dành cho 2 người chơi cờ (Đỏ và Đen).
 * - ROOM_PUBLIC: Kênh chat chung cho toàn bộ phòng (người chơi và khán giả).
 */
export type ChatChannel = "PLAYERS_PRIVATE" | "ROOM_PUBLIC";

/**
 * Cấu trúc một tin nhắn chat trong phòng cờ.
 */
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
export interface ChatReadRequest {
  channel: ChatChannel;
  after?: number;
}
export interface ChatSendRequest {
  commandId: string;
  channel: ChatChannel;
  content: string;
}
export interface ChatPage {
  roomId: string;
  channel: ChatChannel;
  roomVersion: number;
  scopeToken: string;
  canSend: boolean;
  messages: ChatMessage[];
  nextCursor: number;
  hasMore: boolean;
}
export interface ChatSent {
  messageId: string;
  sequence: number;
  createdAt: string;
}
export type ChatAcknowledgement<T> =
  | { status: "ok"; value: T }
  | { status: "error"; error: { code: string; message: string } };
/**
 * Danh sách sự kiện Socket.IO phía Client gửi lên Server cho tính năng chat:
 * - `chat.read`: Yêu cầu đọc trang tin nhắn theo kênh và con trỏ phân trang.
 * - `chat.send`: Gửi tin nhắn mới vào phòng (yêu cầu commandId chống trùng lặp).
 */
export interface ClientChatEvents {
  "chat.read": (
    input: ChatReadRequest,
    acknowledge: (result: ChatAcknowledgement<ChatPage>) => void,
  ) => void;
  "chat.send": (
    input: ChatSendRequest,
    acknowledge: (result: ChatAcknowledgement<ChatSent>) => void,
  ) => void;
}

/**
 * Danh sách sự kiện Socket.IO từ Server phát xuống Client:
 * - `chat.changed`: Thông báo có tin nhắn mới hoặc thay đổi quyền chat trong kênh.
 */
export interface ServerChatEvents {
  "chat.changed": (notice: {
    roomId: string;
    channel: ChatChannel;
    roomVersion: number;
    scopeToken: string;
    canSend: boolean;
  }) => void;
}
