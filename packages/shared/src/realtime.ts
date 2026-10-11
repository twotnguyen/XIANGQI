export type RoomRole = "red" | "black" | "spectator";
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
  } | null;
  clocks: {
    redMs: number;
    blackMs: number;
    running: "red" | "black" | null;
    asOf: string;
  } | null;
  role: RoomRole;
}
export interface RoomSnapshot extends RoomStateSnapshot {
  control: {
    mode: "writable" | "readonly";
    generation: number;
    reason: "superseded" | "not_allowed" | null;
  };
}
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
      type: "media.sharing";
      payload: { sharing: "none" | "opponent" | "room" };
    };
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
export interface RealtimeHandshake {
  accessToken: string;
  appSession: string;
  roomId: string;
  tabId: string;
}
export interface ClientRealtimeEvents {
  "room.command": (
    command: RoomCommand,
    acknowledge: (response: CommandAcknowledgement) => void,
  ) => void;
  "session.takeover": (
    acknowledge: (response: CommandAcknowledgement) => void,
  ) => void;
}
export interface ServerRealtimeEvents {
  "room.closed": (notice: RoomClosedNotice) => void;
  "room.snapshot": (snapshot: RoomSnapshot) => void;
  "session.read_only": (notice: ReadOnlyNotice) => void;
  "engine.failure": (failure: EngineFailureEvent) => void;
}
