import { describe, it, expect } from 'vitest';
import { settleClock, projectClock } from '../../apps/server/src/modules/matches/clock.js';
import type { ClockState } from '@xiangqi/contracts';

describe('T013-01: Clock settling and projection', () => {
  it('returns null when match has unlimited time (clock is null)', () => {
    expect(settleClock(null, 'RED', 1000)).toBeNull();
    expect(projectClock(null, 'RED', 1000)).toBeNull();
  });

  it('settles elapsed time from active player on move', () => {
    const clock: ClockState = {
      redMs: 300000,
      blackMs: 300000,
      runningSinceEpochMs: 1000,
    };

    // RED plays after 5 seconds (5000ms)
    const res = settleClock(clock, 'RED', 6000);
    expect(res).not.toBeNull();
    expect(res!.expired).toBe(false);
    expect(res!.elapsedMs).toBe(5000);
    expect(res!.clock.redMs).toBe(295000);
    expect(res!.clock.blackMs).toBe(300000); // opponent clock untouched
    expect(res!.clock.runningSinceEpochMs).toBe(6000); // reset to now
  });

  it('settles elapsed time from BLACK when it is BLACK turn', () => {
    const clock: ClockState = {
      redMs: 295000,
      blackMs: 300000,
      runningSinceEpochMs: 6000,
    };

    // BLACK plays after 10 seconds (10000ms)
    const res = settleClock(clock, 'BLACK', 16000);
    expect(res!.expired).toBe(false);
    expect(res!.clock.redMs).toBe(295000);
    expect(res!.clock.blackMs).toBe(290000);
  });

  it('detects clock expiry when elapsed exceeds remaining time (TIMEOUT)', () => {
    const clock: ClockState = {
      redMs: 5000, // only 5s left
      blackMs: 300000,
      runningSinceEpochMs: 1000,
    };

    // RED submits move after 6s (6000ms) -> expired
    const res = settleClock(clock, 'RED', 7000);
    expect(res!.expired).toBe(true);
    expect(res!.clock.redMs).toBe(0);
  });

  it('projectClock calculates remaining time without changing runningSinceEpochMs', () => {
    const clock: ClockState = {
      redMs: 300000,
      blackMs: 300000,
      runningSinceEpochMs: 1000,
    };

    // Check clock at t=2000 (1s elapsed)
    const projected = projectClock(clock, 'RED', 2000);
    expect(projected!.redMs).toBe(299000);
    expect(projected!.blackMs).toBe(300000);
    expect(projected!.runningSinceEpochMs).toBe(1000); // NOT changed
  });
});
