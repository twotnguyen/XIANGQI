import type { Side } from "@xiangqi/xiangqi-core";
import type { ClockPort, MatchClock } from "../match/contracts.js";
import { ClockError } from "./contracts.js";
function invalid(): never {
  throw new ClockError("CLOCK_INVALID_STATE");
}
function sample(at: Date): number {
  if (
    !(at instanceof Date) ||
    !Number.isSafeInteger(at.getTime()) ||
    at.getTime() < 0
  )
    invalid();
  return at.getTime();
}
function validate(clock: MatchClock, side: Side) {
  if (side !== "red" && side !== "black") invalid();
  if (
    !clock ||
    !(["redMs", "blackMs", "runningSinceEpochMs"] as const).every(
      (key) => Number.isSafeInteger(clock[key]) && clock[key] >= 0,
    )
  )
    invalid();
}
/** Fixed time, no increment. Position.turn is the running side. */
export class ClockService implements ClockPort {
  start(seconds: 300 | 600 | 900, at: Date): MatchClock {
    if (![300, 600, 900].includes(seconds)) invalid();
    return {
      redMs: seconds * 1000,
      blackMs: seconds * 1000,
      runningSinceEpochMs: sample(at),
    };
  }
  beforeAction(
    clock: MatchClock,
    turn: Side,
    at: Date,
  ): { clock: MatchClock; expired: Side | null } {
    validate(clock, turn);
    const now = sample(at);
    const key = turn === "red" ? "redMs" : "blackMs";
    const remaining = Math.max(
      0,
      clock[key] - Math.max(0, now - clock.runningSinceEpochMs),
    );
    return {
      clock: {
        ...clock,
        [key]: remaining,
        runningSinceEpochMs: Math.max(now, clock.runningSinceEpochMs),
      },
      expired: remaining === 0 ? turn : null,
    };
  }
  afterMove(clock: MatchClock, nextTurn: Side, at: Date): MatchClock {
    validate(clock, nextTurn);
    return {
      ...clock,
      runningSinceEpochMs: Math.max(sample(at), clock.runningSinceEpochMs),
    };
  }
}
