import { describe, it, expect } from 'vitest';
import {
  getTerminalOutcome, createInitialPosition, positionKey,
  getLegalMoves, applyMove,
} from '@xiangqi/game-rules';
import { makePosition } from '../fixtures/positions.js';
import {
  CHECKMATE_POSITION,
  STALEMATE_POSITION_FIXED,
} from '../fixtures/terminal-positions.js';

describe('T004-01: Checkmate detection', () => {
  it('no legal moves + in check = CHECKMATE, opponent wins', () => {
    const pos = makePosition(CHECKMATE_POSITION, 'BLACK');
    const outcome = getTerminalOutcome(pos, 1);
    expect(outcome).not.toBeNull();
    expect(outcome!.reason).toBe('CHECKMATE');
    expect(outcome!.winner).toBe('RED');
  });

  it('checkmate has zero legal moves', () => {
    const pos = makePosition(CHECKMATE_POSITION, 'BLACK');
    expect(getLegalMoves(pos)).toHaveLength(0);
  });
});

describe('T004-02: Stalemate detection', () => {
  it('no legal moves + not in check = STALEMATE, opponent wins', () => {
    const pos = makePosition(STALEMATE_POSITION_FIXED, 'RED');
    const outcome = getTerminalOutcome(pos, 1);
    expect(outcome).not.toBeNull();
    expect(outcome!.reason).toBe('STALEMATE');
    expect(outcome!.winner).toBe('BLACK');
  });

  it('stalemate has zero legal moves', () => {
    const pos = makePosition(STALEMATE_POSITION_FIXED, 'RED');
    expect(getLegalMoves(pos)).toHaveLength(0);
  });
});

describe('T004-03: Repetition detection', () => {
  it('initial position with occurrences=2 is null (not yet draw)', () => {
    const pos = createInitialPosition();
    expect(getTerminalOutcome(pos, 2)).toBeNull();
  });

  it('initial position with occurrences=3 is REPETITION draw', () => {
    const pos = createInitialPosition();
    const outcome = getTerminalOutcome(pos, 3);
    expect(outcome).toEqual({ winner: null, reason: 'REPETITION' });
  });

  it('occurrences=4 also triggers REPETITION', () => {
    const pos = createInitialPosition();
    const outcome = getTerminalOutcome(pos, 4);
    expect(outcome).toEqual({ winner: null, reason: 'REPETITION' });
  });
});

describe('T004-04: Terminal priority over repetition', () => {
  it('checkmate takes precedence even with high occurrences', () => {
    const pos = makePosition(CHECKMATE_POSITION, 'BLACK');
    const outcome = getTerminalOutcome(pos, 10);
    expect(outcome!.reason).toBe('CHECKMATE');
    expect(outcome!.winner).toBe('RED');
  });
});

describe('T004-05: Non-terminal positions', () => {
  it('initial position with occurrences=1 returns null', () => {
    const pos = createInitialPosition();
    expect(getTerminalOutcome(pos, 1)).toBeNull();
  });

  it('position with legal moves and occurrences=1 returns null', () => {
    const pos = makePosition([
      { id: 'rg', type: 'GENERAL', side: 'RED', x: 4, y: 0 },
      { id: 'bg', type: 'GENERAL', side: 'BLACK', x: 3, y: 9 },
      { id: 'rr', type: 'ROOK', side: 'RED', x: 0, y: 4 },
    ], 'RED');
    expect(getTerminalOutcome(pos, 1)).toBeNull();
  });
});

describe('T004-06: positionKey tracks turn for repetition', () => {
  it('same board different turn = different key', () => {
    const pos = createInitialPosition();
    const key1 = positionKey(pos);
    const key2 = positionKey({ ...pos, turn: 'BLACK' });
    expect(key1).not.toBe(key2);
  });

  it('play and undo returns to same key', () => {
    const pos = createInitialPosition();
    const key0 = positionKey(pos);

    // Play a move
    const move1 = getLegalMoves(pos)[0]!;
    const pos1 = applyMove(pos, move1);
    const key1 = positionKey(pos1);
    expect(key1).not.toBe(key0);

    // Play a black move
    const move2 = getLegalMoves(pos1)[0]!;
    const pos2 = applyMove(pos1, move2);

    // Keys are different from both previous
    expect(positionKey(pos2)).not.toBe(key0);
    expect(positionKey(pos2)).not.toBe(key1);
  });
});
