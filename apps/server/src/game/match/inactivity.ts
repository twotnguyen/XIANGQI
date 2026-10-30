import type { MatchClock } from "./match.types.js";

/** time_control 0 = Không giới hạn: chỉ áp dụng chống treo ván, không có đồng hồ. */
export const UNLIMITED_TIME_CONTROL = 0;
export const INACTIVITY_PROMPT_MS = 180_000;
export const INACTIVITY_GRACE_MS = 30_000;
export const INACTIVITY_MAX_CONFIRMS = 2;

/** Đồng hồ của ván không giới hạn: không đếm giờ, `runningSinceEpochMs` là mốc nước đi/xác nhận gần nhất. */
export function unlimitedClock(at: Date): MatchClock {
  return { redMs: 0, blackMs: 0, runningSinceEpochMs: at.getTime() };
}

export function inactivityView(
  clock: MatchClock,
  confirms: number,
): { promptAt: string; expiresAt: string; confirmsLeft: number } {
  const promptAt = clock.runningSinceEpochMs + INACTIVITY_PROMPT_MS;
  return {
    promptAt: new Date(promptAt).toISOString(),
    expiresAt: new Date(promptAt + INACTIVITY_GRACE_MS).toISOString(),
    confirmsLeft: Math.max(0, INACTIVITY_MAX_CONFIRMS - confirms),
  };
}

/** Hết hạn khi quá 3 phút không đi và 30 giây nhắc đã trôi qua. */
export function inactivityExpired(clock: MatchClock, at: Date): boolean {
  return (
    at.getTime() >=
    clock.runningSinceEpochMs + INACTIVITY_PROMPT_MS + INACTIVITY_GRACE_MS
  );
}
