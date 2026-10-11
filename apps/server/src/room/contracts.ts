import type { PoolClient } from "pg";
export interface RoomActor {
  userId: string;
  kind: "member" | "guest";
}
// Root authenticates and locks the actor/session BEFORE acquiring room locks.
export interface RoomScope {
  client: PoolClient;
  actor: RoomActor;
  lockedActorIds: ReadonlySet<string>;
  lockedRoomIds: ReadonlySet<string>;
  activeActorIds?: ReadonlySet<string>;
}
export class RoomError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 409,
  ) {
    super(message);
  }
}
export class RoomRosterChanged extends RoomError {
  constructor(public readonly actorIds: string[]) {
    super(
      "ROOM_ROSTER_CHANGED",
      "Thành phần phòng đã thay đổi, vui lòng thử lại",
    );
  }
}
export interface RoomEntry {
  roomId: string;
  version: number;
  role: "red" | "black" | "spectator";
  inviteCode?: string;
  notice?: string;
}
export interface RoomView {
  serverNow: string;
  roomId: string;
  version: number;
  room: {
    status: "WAITING" | "PLAYING" | "FINISHED" | "CLOSED";
    hostId: string | null;
    name: string;
    visibility: "PUBLIC" | "CODE_ONLY" | "LOCKED";
    timeMinutes: number;
    viewerLimit: number;
    seats: { red: string | null; black: string | null };
    ready: { red: boolean; black: boolean };
    connected: { red: boolean; black: boolean };
    graceUntil: { red: string | null; black: string | null };
    countdown: { token: string; dueAt: string } | null;
  };
  role: "red" | "black" | "spectator";
}
export interface MatchStartInput {
  roomId: string;
  startToken: string;
  redId: string;
  blackId: string;
  timeControlSeconds: number;
  startedAt: Date;
}
export interface MatchStartPort {
  start(
    client: PoolClient,
    input: MatchStartInput,
  ): Promise<{ matchId: string }>;
}
export interface RoomEvent {
  id: string;
  roomId: string;
  version: number;
  type: string;
  payload: Record<string, unknown>;
}
export interface RoomEventSink {
  deliver(event: RoomEvent): Promise<void>;
}
export interface PresenceProof {
  connectionId: string;
  generation: number;
  serverInstance: string;
}
