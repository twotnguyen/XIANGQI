/** Physical controller credential for HTTP mutations; not a session or an admission grant. */
export interface RoomControlProof {
  tabId: string;
  connectionId: string;
  generation: number;
}

import type { ClientChatEvents, ServerChatEvents } from "./chat.js";
export type RoomRole = "red" | "black" | "spectator";

/**
 * Trạng thái toàn diện của phòng cờ và ván đấu do máy chủ quản trị (authoritative snapshot):
 * - `room`: Thông tin phòng, trạng thái ghế Đỏ/Đen, sẵn sàng, kết nối, đếm ngược và khán giả.
 * - `match`: Thế cờ FEN, nước đi cuối cùng, lượt đi, trạng thái và kết quả ván cờ.
 * - `clocks`: Đồng hồ thi đấu của hai bên Đỏ và Đen tại thời điểm `asOf`.
 * - `draw`: Danh sách đề nghị hòa đang chờ và số nước cooldown.
 */
export interface RoomStateSnapshot {
  serverNow: string;
  roomId: string;
  version: number;
  room: {
    status: "WAITING" | "PLAYING" | "FINISHED" | "CLOSED";
    hostId: string | null;
    name: string;
    visibility: "PUBLIC" | "CODE_ONLY" | "LOCKED";
    inviteCode: string | null;
    timeMinutes: number;
    viewerLimit: number;
    seats: { red: string | null; black: string | null };
    ready: { red: boolean; black: boolean };
    connected: { red: boolean; black: boolean };
    graceUntil: { red: string | null; black: string | null };
    countdown: { token: string; dueAt: string } | null;
    swapOffer: {
      id: string;
      proposerId: string;
      responderId: string;
      expiresAt: string;
    } | null;
    rematchOffer: {
      id: string;
      proposerId: string;
      responderId: string;
      side: "KEEP" | "SWAP";
      expiresAt: string;
    } | null;
    downOffer: {
      id: string;
      inviteeId: string;
      expiresAt: string;
    } | null;
    spectators: { userId: string; displayName: string }[];
    swapCooldownUntil?: string | null;
  };
  match: {
    id: string;
    version: number;
    position: string;
    lastMove: { from: number; to: number; eventVersion: number } | null;
    turn: "red" | "black";
    status: "ACTIVE" | "FINISHED" | "INTERRUPTED";
    winner: "red" | "black" | null;
    endedAt: string | null;
    result: string | null;
    inactivity?: {
      promptAt: string;
      expiresAt: string;
      confirmsLeft: number;
    } | null;
  } | null;
  clocks: {
    redMs: number;
    blackMs: number;
    running: "red" | "black" | null;
    asOf: string;
  } | null;
  role: RoomRole;
  draw?: {
    offers: { id: string; sender: "red" | "black"; expiresAt: string }[];
    remainingMoves: { red: number; black: number };
  } | null;
}

/**
 * Snapshot trạng thái phòng gửi tới từng phiên người dùng,
 * bổ sung thêm quyền điều khiển `control` (chế độ ghi `writable` hoặc chỉ xem `readonly` do mở nhiều tab).
 */
export interface RoomSnapshot extends RoomStateSnapshot {
  control: {
    mode: "writable" | "readonly";
    generation: number;
    reason: "superseded" | "not_allowed" | null;
  };
}

/**
 * Các hành động mà người chơi có thể thực hiện trong phòng cờ và ván đấu:
 * - `room.ready`: Báo sẵn sàng bắt đầu ván.
 * - `match.move`: Đi một nước cờ (từ ô `from` đến ô `to`).
 * - `match.resign`: Đầu hàng.
 * - `match.still-here`: Xác nhận "Tôi còn đây" trong ván không giới hạn.
 * - `match.draw.*`: Xin hòa, rút đề nghị hòa, chấp nhận hoặc từ chối hòa.
 * - `media.sharing`: Thay đổi phạm vi chia sẻ camera/micro.
 */
export type RoomAction =
  | { type: "room.ready"; payload: { ready: boolean } }
  | {
      type: "match.move";
      payload: {
        matchId: string;
        matchVersion: number;
        from: number;
        to: number;
      };
    }
  | {
      type: "match.resign";
      payload: { matchId: string; matchVersion: number };
    }
  | {
      type: "match.still-here";
      payload: { matchId: string; matchVersion: number };
    }
  | {
      type: "match.draw.offer";
      payload: { matchId: string; matchVersion: number };
    }
  | {
      type: "match.draw.withdraw";
      payload: { matchId: string; matchVersion: number; offerId: string };
    }
  | {
      type: "match.draw.respond";
      payload: {
        matchId: string;
        matchVersion: number;
        offerId: string;
        accept: boolean;
      };
    }
  | {
      type: "media.sharing";
      payload: { sharing: "none" | "opponent" | "room" };
    };

/**
 * Gói lệnh thao tác gửi từ Client lên Server qua Socket.IO:
 * Chứa `commandId` (UUID chống gửi lặp) và `expectedVersion` (chống xung đột phiên bản thế cờ).
 */
export interface RoomCommand {
  commandId: string;
  roomId: string;
  expectedVersion: number;
  action: RoomAction;
}
export type RealtimeErrorCode =
  | "AUTH_REQUIRED"
  | "ROOM_FORBIDDEN"
  | "TAB_READ_ONLY"
  | "COMMAND_INVALID"
  | "COMMAND_ID_REUSED"
  | "VERSION_STALE"
  | "REALTIME_UNAVAILABLE"
  | "MATCH_FINISHED"
  | "MATCH_VERSION_CONFLICT"
  | "MATCH_NOT_YOUR_TURN"
  | "MATCH_ILLEGAL_MOVE"
  | "MATCH_TIME_EXPIRED"
  | "MATCH_ID_MISMATCH"
  | "MATCH_PLAYER_REQUIRED"
  | "MATCH_READ_ONLY"
  | "MATCH_INVALID_INPUT"
  | "MATCH_NOT_FOUND"
  | "MATCH_DRAW_PENDING"
  | "MATCH_DRAW_COOLDOWN"
  | "MATCH_DRAW_EXPIRED"
  | "MATCH_DRAW_SENDER_REQUIRED"
  | "MATCH_DRAW_RECEIVER_REQUIRED"
  | "MATCH_NOT_UNLIMITED"
  | "MATCH_INACTIVITY_NOT_DUE"
  | "MATCH_INACTIVITY_LIMIT"
  | "MATCH_INACTIVITY_EXPIRED"
  | "READY_DENIED"
  | "PLAYER_DISCONNECTED"
  | "ROOM_INPUT_INVALID";
export type CommandAcknowledgement =
  | { status: "ok"; commandId: string; snapshot: RoomSnapshot }
  | {
      status: "error";
      commandId?: string;
      error: { code: RealtimeErrorCode; message: string };
      snapshot?: RoomSnapshot;
    };
export interface ReadOnlyNotice {
  message: "Phiên này đã được mở ở tab khác";
  stopMedia: true;
}
export interface RoomClosedNotice {
  roomId: string;
  message: "Phòng đã đóng";
}
export interface EngineFailureEvent {
  matchId: string;
  code: "ENGINE_BUSY" | "ENGINE_FAILED" | "ENGINE_TIMEOUT";
  retryable: boolean;
}
export type RealtimeHandshake = (
  { accessToken: string; appSession: string } | { guestCapability: string }
) & {
  roomId: string;
  tabId: string;
};
/**
 * Danh sách sự kiện Socket.IO phía Client gửi lên Server trong phòng cờ:
 * - `room.sync`: Đồng bộ snapshot trạng thái phòng mới nhất.
 * - `room.command`: Gửi lệnh cờ tướng (đi quân, xin hòa, đầu hàng, sẵn sàng).
 * - `session.takeover`: Giành lại quyền thao tác (writable) từ tab trình duyệt khác.
 */
export interface ClientRealtimeEvents extends ClientChatEvents {
  "room.sync": (
    acknowledge: (response: CommandAcknowledgement) => void,
  ) => void;
  "room.command": (
    command: RoomCommand,
    acknowledge: (response: CommandAcknowledgement) => void,
  ) => void;
  "session.takeover": (
    acknowledge: (response: CommandAcknowledgement) => void,
  ) => void;
}

/**
 * Danh sách sự kiện Socket.IO Server phát tới Client trong phòng cờ:
 * - `room.snapshot`: Cập nhật snapshot trạng thái phòng toàn diện (bàn cờ, đồng hồ...).
 * - `room.closed`: Báo phòng đã đóng.
 * - `session.read_only`: Cảnh báo phiên đã mở ở tab khác và chuyển tab này sang chỉ đọc.
 * - `engine.failure`: Báo lỗi sự cố của Engine AI khi đấu với máy.
 */
export interface ServerRealtimeEvents extends ServerChatEvents {
  "room.closed": (notice: RoomClosedNotice) => void;
  "room.snapshot": (snapshot: RoomSnapshot) => void;
  "session.read_only": (notice: ReadOnlyNotice) => void;
  "engine.failure": (failure: EngineFailureEvent) => void;
}
