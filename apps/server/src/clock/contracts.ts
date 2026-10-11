import type { PoolClient } from "pg";
export type ClockCandidate = { roomId: string; matchId: string };
export type ClockCursor = { deadlineEpochMs: string; matchId: string };
export type ClockDueCandidate = ClockCandidate & { deadlineEpochMs: string };
export type ClockWorkerScope = {
  client: PoolClient;
  roomId: string;
  matchId: string;
  lockedActorIds: ReadonlySet<string>;
  lockedRoomIds: ReadonlySet<string>;
};
export interface ClockWorkerPort {
  dueMatches(cursor: ClockCursor | null): Promise<ClockDueCandidate[]>;
  withMatch(
    candidate: ClockCandidate,
    work: (scope: ClockWorkerScope) => Promise<void>,
  ): Promise<void>;
}
export class ClockError extends Error {
  constructor(
    public readonly code: "CLOCK_INVALID_STATE" | "CLOCK_LOCK_REQUIRED",
  ) {
    super(code);
  }
}
