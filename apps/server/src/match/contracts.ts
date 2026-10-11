import type { MatchEnding, Side } from "@xiangqi/xiangqi-core";
import type { PoolClient } from "pg";
export type MatchClock = {
  redMs: number;
  blackMs: number;
  runningSinceEpochMs: number;
};
export interface ClockPort {
  start(timeControlSeconds: 300 | 600 | 900, at: Date): MatchClock;
  beforeAction(
    clock: MatchClock,
    turn: Side,
    at: Date,
  ): { clock: MatchClock; expired: Side | null };
  afterMove(clock: MatchClock, nextTurn: Side, at: Date): MatchClock;
}
export interface MatchRoomEndPort {
  onMatchEnded(
    client: PoolClient,
    input: { roomId: string; matchId: string; endedAt: Date },
  ): Promise<void>;
}
export type MatchScope = {
  client: PoolClient;
  actor: { userId: string; kind: "member" | "guest" };
  roomId: string;
  canControl: boolean;
  lockedActorIds: ReadonlySet<string>;
  lockedRoomIds: ReadonlySet<string>;
};
export type MatchOutcome = {
  reason:
    | MatchEnding["reason"]
    | "RESIGN"
    | "TIMEOUT"
    | "DISCONNECT"
    | "DRAW_AGREEMENT"
    | "SERVER_RESTART";
  winner: Side | null;
};
export type MatchView = {
  id: string;
  version: number;
  ply: number;
  position: string;
  lastMove: { from: number; to: number; eventVersion: number } | null;
  turn: Side;
  status: "ACTIVE" | "FINISHED" | "INTERRUPTED";
  outcome: MatchOutcome | null;
  endedAt: string | null;
  clock: MatchClock;
};
export type MatchCommandResult = {
  applied: boolean;
  match: MatchView;
  error?: { code: string; message: string };
};
export class MatchError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number = 409,
  ) {
    super(message);
  }
}
