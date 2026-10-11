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
export interface ServerChatEvents {
  "chat.changed": (notice: {
    roomId: string;
    channel: ChatChannel;
    roomVersion: number;
    scopeToken: string;
    canSend: boolean;
  }) => void;
}
