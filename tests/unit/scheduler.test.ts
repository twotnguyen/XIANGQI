/**
 * Deadline scheduler decisions (spec 03 §"Trạng thái, transaction và deadline").
 *
 * The scheduler's contract is that every ending is derived from persisted timestamps, so
 * these cases drive the pure `decide*` helpers with a fake clock: no database, no sleeps.
 * The DB-backed half of the same behaviour (scheduler tick against real timestamps, room
 * close, rematch clearing `finished_at`) is proven in `tests/integration/races.test.ts`.
 */
import { describe, expect, it } from 'vitest';
import type { ClockState } from '@xiangqi/contracts';
import {
  DISCONNECT_GRACE_MS,
  ROOM_CLOSE_AFTER_MS,
  clockDeadlineAtMs,
  decideMatchDeadline,
  decideProposalExpired,
  decideRoomClose,
  nextDeadlineAtMs,
  roomCloseAtMs,
  type MatchDeadlineFacts,
  type ParticipantLease,
} from '../../apps/server/src/modules/matches/deadlines.js';

const NOW = 1_800_000_000_000;
const RED = '11111111-1111-4111-8111-111111111111';
const BLACK = '22222222-2222-4222-8222-222222222222';

function clock(redMs: number, blackMs: number, runningSinceEpochMs = NOW): ClockState {
  return { redMs, blackMs, runningSinceEpochMs };
}

function facts(overrides: Partial<MatchDeadlineFacts> = {}): MatchDeadlineFacts {
  return {
    status: 'ACTIVE',
    mode: 'ONLINE',
    timeControl: 300,
    clock: clock(300_000, 300_000),
    turn: 'RED',
    redUserId: RED,
    blackUserId: BLACK,
    aiSide: null,
    leases: [],
    nowMs: NOW,
    ...overrides,
  };
}

function online(userId: string, leaseUntilMs = NOW + 20_000): ParticipantLease {
  return { userId, leaseUntilMs, disconnectedAtMs: null };
}

function offline(userId: string, detectedAtMs: number): ParticipantLease {
  return { userId, leaseUntilMs: detectedAtMs, disconnectedAtMs: detectedAtMs };
}

describe('scheduler: clock deadline', () => {
  it('computes the deadline from the running side balance', () => {
    expect(clockDeadlineAtMs(clock(10_000, 300_000, NOW - 1_000), 'RED', 300)).toBe(NOW + 9_000);
    expect(clockDeadlineAtMs(clock(10_000, 300_000, NOW - 1_000), 'BLACK', 300)).toBe(NOW + 299_000);
    expect(clockDeadlineAtMs(null, 'RED', 0)).toBeNull();
  });

  it('stays ACTIVE one millisecond before the deadline and finalizes TIMEOUT at it', () => {
    const expiry = NOW - 5_000;
    const expiredClock = clock(1_000, 300_000, expiry - 1_000);

    const before = decideMatchDeadline(facts({ clock: expiredClock, nowMs: expiry - 1 }));
    expect(before).toEqual({ kind: 'NONE' });

    const atDeadline = decideMatchDeadline(facts({ clock: expiredClock, nowMs: expiry }));
    expect(atDeadline).toEqual({ kind: 'TIMEOUT', winner: 'BLACK' });
  });

  it('wins with the side that did not run out, using the side to move', () => {
    const expired = clock(300_000, 1, NOW - 10_000);
    expect(decideMatchDeadline(facts({ clock: expired, turn: 'BLACK' }))).toEqual({
      kind: 'TIMEOUT',
      winner: 'RED',
    });
  });
});

describe('scheduler: disconnect grace', () => {
  it('grants the full 60s before an offline participant loses', () => {
    const detected = NOW - 30_000;
    const redOnline = online(RED, detected + 600_000);
    const half = facts({ leases: [redOnline, offline(BLACK, detected)] });
    expect(decideMatchDeadline(half)).toEqual({ kind: 'NONE' });

    const atGrace = facts({
      nowMs: detected + DISCONNECT_GRACE_MS,
      leases: [redOnline, offline(BLACK, detected)],
    });
    expect(decideMatchDeadline(atGrace)).toEqual({ kind: 'DISCONNECT', winner: 'RED' });
  });

  it('ignores a participant that never established a lease', () => {
    const maybe = facts({ leases: [online(RED)] });
    expect(decideMatchDeadline(maybe)).toEqual({ kind: 'NONE' });
  });

  it('uses the earlier deadline, and TIMEOUT wins an exact tie', () => {
    const detected = NOW - 80_000;
    const graceAt = detected + DISCONNECT_GRACE_MS;
    const endingAt = (deadlineMs: number): ClockState => ({
      redMs: deadlineMs - detected,
      blackMs: 300_000,
      runningSinceEpochMs: detected,
    });
    const base = { leases: [online(RED), offline(BLACK, detected)] };

    // Clock ran out 10s before the grace ended → TIMEOUT.
    const clockFirst = facts({ ...base, clock: endingAt(graceAt - 10_000) });
    expect(clockFirst.clock!.redMs).toBeGreaterThan(0);
    expect(decideMatchDeadline(clockFirst)).toEqual({ kind: 'TIMEOUT', winner: 'BLACK' });

    // Clock ran out 10s after the grace ended → DISCONNECT.
    const graceFirst = facts({ ...base, clock: endingAt(graceAt + 10_000) });
    expect(decideMatchDeadline(graceFirst)).toEqual({ kind: 'DISCONNECT', winner: 'RED' });

    // Equal instants: the clock deadline keeps priority (spec: bằng nhau ưu tiên TIMEOUT).
    const tied = facts({ ...base, clock: endingAt(graceAt) });
    expect(decideMatchDeadline(tied)).toEqual({ kind: 'TIMEOUT', winner: 'BLACK' });
  });

  it('keeps a clock deadline that already passed over a disconnect detected later', () => {
    // Clock expired 5s ago; the opponent was only detected offline 1s ago.
    const clockExpired = facts({
      clock: clock(1_000, 300_000, NOW - 8_000),
      leases: [online(RED), offline(BLACK, NOW - 1_000)],
    });
    expect(decideMatchDeadline(clockExpired)).toEqual({ kind: 'TIMEOUT', winner: 'BLACK' });
  });
});

describe('scheduler: both offline', () => {
  it('interrupts with no winner once both leases are lost before any deadline', () => {
    const bothLost = facts({
      leases: [offline(RED, NOW - 20_000), offline(BLACK, NOW - 5_000)],
    });
    expect(decideMatchDeadline(bothLost)).toEqual({ kind: 'BOTH_OFFLINE' });
  });

  it('does not interrupt while one participant is still online', () => {
    const oneOnline = facts({ leases: [online(RED), offline(BLACK, NOW - 90_000)] });
    expect(decideMatchDeadline(oneOnline)).toEqual({ kind: 'DISCONNECT', winner: 'RED' });
  });

  it('prefers a clock deadline that passed before the second lease was lost', () => {
    const bothLostAfterClock = facts({
      clock: clock(1_000, 300_000, NOW - 10_000),
      leases: [offline(RED, NOW - 15_000), offline(BLACK, NOW - 1_000)],
    });
    expect(decideMatchDeadline(bothLostAfterClock)).toEqual({ kind: 'TIMEOUT', winner: 'BLACK' });
  });

  it('maps an offline AI human to INTERRUPTED only after the grace', () => {
    const human = offline(BLACK, NOW - 30_000);
    const aiFacts: MatchDeadlineFacts = {
      status: 'ACTIVE',
      mode: 'AI',
      timeControl: 0,
      clock: null,
      turn: 'RED',
      redUserId: null,
      blackUserId: BLACK,
      aiSide: 'RED',
      leases: [human],
      nowMs: NOW,
    };
    expect(decideMatchDeadline(aiFacts)).toEqual({ kind: 'NONE' });
    expect(decideMatchDeadline({ ...aiFacts, nowMs: NOW + 30_000 })).toEqual({
      kind: 'BOTH_OFFLINE',
    });
  });
});

describe('scheduler: wake-up instant', () => {
  it('wakes at the nearest future deadline, and not at all when nothing is due', () => {
    const wake = nextDeadlineAtMs(
      facts({
        clock: clock(5_000, 300_000),
        leases: [online(RED), offline(BLACK, NOW - 30_000)],
      }),
    );
    expect(wake).toBe(NOW + 5_000);
    expect(nextDeadlineAtMs(facts({ timeControl: 0, clock: null }))).toBeNull();
    expect(nextDeadlineAtMs(facts({ status: 'FINISHED' }))).toBeNull();
  });
});

describe('scheduler: proposal expiry', () => {
  const proposal = {
    id: '33333333-3333-4333-8333-333333333333',
    kind: 'DRAW' as const,
    requesterId: RED,
    basePly: 1,
    createdVersion: 2,
    expiresAtMs: NOW + 30_000,
  };

  it('expires exactly at the 30s TTL', () => {
    expect(decideProposalExpired(proposal, NOW + 29_999)).toBe(false);
    expect(decideProposalExpired(proposal, NOW + 30_000)).toBe(true);
    expect(decideProposalExpired(null, NOW + 30_000)).toBe(false);
  });
});

describe('scheduler: room close', () => {
  const currentMatchId = '44444444-4444-4444-8444-444444444444';

  it('closes FINISHED rooms 10 minutes after finished_at', () => {
    expect(roomCloseAtMs(NOW)).toBe(NOW + ROOM_CLOSE_AFTER_MS);
    expect(
      decideRoomClose({ status: 'FINISHED', currentMatchId, finishedAtMs: NOW, nowMs: NOW + ROOM_CLOSE_AFTER_MS - 1 }),
    ).toBe(false);
    expect(
      decideRoomClose({ status: 'FINISHED', currentMatchId, finishedAtMs: NOW, nowMs: NOW + ROOM_CLOSE_AFTER_MS }),
    ).toBe(true);
  });

  it('never closes a room a rematch already moved on from', () => {
    // Rematch clears finished_at and sets PLAYING; either fact alone prevents the close.
    expect(
      decideRoomClose({ status: 'PLAYING', currentMatchId, finishedAtMs: null, nowMs: NOW + 60_000_000 }),
    ).toBe(false);
    expect(
      decideRoomClose({ status: 'FINISHED', currentMatchId: null, finishedAtMs: NOW, nowMs: NOW + 60_000_000 }),
    ).toBe(false);
    expect(
      decideRoomClose({ status: 'FINISHED', currentMatchId, finishedAtMs: null, nowMs: NOW + 60_000_000 }),
    ).toBe(false);
  });
});
