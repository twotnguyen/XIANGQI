/**
 * Authoritative chess clock calculation and projection.
 * Semantics:
 * - On move: settle elapsed time for side-to-move, switch turn, reset runningSinceEpochMs.
 * - On read (snapshot projection): subtract elapsed time without mutating DB.
 * - If remaining <= 0: expired = true (TIMEOUT).
 */
import type { ClockState, Side } from '@xiangqi/contracts';

export interface SettleClockResult {
  expired: boolean;
  clock: NonNullable<ClockState>;
  elapsedMs: number;
}

/**
 * Settle the clock when a move is submitted.
 * Subtracts elapsed time from the player whose turn it was.
 */
export function settleClock(
  clock: ClockState,
  sideToMove: Side,
  nowEpochMs: number,
): SettleClockResult | null {
  if (!clock) return null;

  const elapsedMs = Math.max(0, nowEpochMs - clock.runningSinceEpochMs);
  let redMs = clock.redMs;
  let blackMs = clock.blackMs;

  if (sideToMove === 'RED') {
    redMs = Math.max(0, redMs - elapsedMs);
  } else {
    blackMs = Math.max(0, blackMs - elapsedMs);
  }

  const remaining = sideToMove === 'RED' ? redMs : blackMs;
  const expired = remaining <= 0;

  return {
    expired,
    elapsedMs,
    clock: {
      redMs,
      blackMs,
      runningSinceEpochMs: nowEpochMs,
    },
  };
}

/**
 * Project clock time forward to now without mutating database.
 * Used when serving snapshots to clients.
 */
export function projectClock(
  clock: ClockState,
  currentTurn: Side,
  nowEpochMs: number,
): ClockState {
  if (!clock) return null;

  const elapsedMs = Math.max(0, nowEpochMs - clock.runningSinceEpochMs);
  let redMs = clock.redMs;
  let blackMs = clock.blackMs;

  if (currentTurn === 'RED') {
    redMs = Math.max(0, redMs - elapsedMs);
  } else {
    blackMs = Math.max(0, blackMs - elapsedMs);
  }

  return {
    redMs,
    blackMs,
    runningSinceEpochMs: clock.runningSinceEpochMs,
  };
}
