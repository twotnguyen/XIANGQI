export type RoomRole = "red" | "black" | "spectator";
export interface RoomStateSnapshot {
  roomId: string;
  version: number;
  room: {
    status: "WAITING" | "PLAYING" | "FINISHED" | "CLOSED";
    hostId: string | null;
    seats: { red: string | null; black: string | null };
    ready: { red: boolean; black: boolean };
  };
  match: {
    id: string;
    version: number;
    position: string;
    turn: "red" | "black";
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
  | { type: "match.move"; payload: { from: number; to: number } }
  | { type: "match.resign"; payload: Record<string, never> }
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
  | "REALTIME_UNAVAILABLE";
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
  "room.snapshot": (snapshot: RoomSnapshot) => void;
  "session.read_only": (notice: ReadOnlyNotice) => void;
  "engine.failure": (failure: EngineFailureEvent) => void;
}
