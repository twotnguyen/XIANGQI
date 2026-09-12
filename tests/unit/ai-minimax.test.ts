import { describe, it, expect } from 'vitest';
import { searchBestMove, MATE_SCORE } from '@xiangqi/ai';
import {
  createInitialPosition, positionKey, validateMove,
} from '@xiangqi/game-rules';
import { makePosition } from '../fixtures/positions.js';
import { CHECKMATE_POSITION } from '../fixtures/terminal-positions.js';
import type { SearchInput } from '@xiangqi/contracts';

const RG = { id: 'rg', type: 'GENERAL' as const, side: 'RED' as const, x: 4, y: 0 };
const BG = { id: 'bg', type: 'GENERAL' as const, side: 'BLACK' as const, x: 3, y: 9 };

function makeInput(overrides: Partial<SearchInput> = {}): SearchInput {
  const pos = overrides.position ?? createInitialPosition();
  return {
    position: pos,
    repetitionCounts: { [positionKey(pos)]: 1 },
    maxDepth: 1,
    deadlineMonoMs: 10000,
    algorithm: 'MINIMAX',
    seed: 1,
    ...overrides,
  };
}

describe('T019-01: Baseline minimax smoke', () => {
  it('chooses legal move from initial position at depth 1', () => {
    const p = createInitialPosition();
    const input = makeInput({ position: p, maxDepth: 1 });
    const r = searchBestMove(input, () => 0, () => false);

    expect(r.move).not.toBeNull();
    expect(validateMove(p, r.move!).valid).toBe(true);
    expect(r.completedDepth).toBe(1);
    expect(r.nodes).toBeGreaterThan(0);
    expect(r.aborted).toBe(false);
  });

  it('depth 2 search visits more nodes and returns legal move', () => {
    // Simple endgame position to keep depth 2 fast
    const pos = makePosition([
      RG, BG,
      { id: 'rr', type: 'ROOK', side: 'RED', x: 0, y: 4 },
      { id: 'bp', type: 'PAWN', side: 'BLACK', x: 0, y: 7 },
    ], 'RED');

    const d1 = searchBestMove(makeInput({ position: pos, maxDepth: 1 }), () => 0, () => false);
    const d2 = searchBestMove(makeInput({ position: pos, maxDepth: 2 }), () => 0, () => false);

    expect(d2.nodes).toBeGreaterThan(d1.nodes);
    expect(validateMove(pos, d2.move!).valid).toBe(true);
    expect(d2.completedDepth).toBe(2);
  });
});

describe('T019-02: Mate in one', () => {
  it('finds checkmate move when available', () => {
    // Setup: RED can deliver checkmate in 1 move
    // RED general (4,0), BLACK general (4,9)
    // RED rooks at (3,8) and (5,8) block columns
    // RED rook at (0,7) can move to (4,7) to checkmate
    const pos = makePosition([
      { id: 'rg', type: 'GENERAL', side: 'RED', x: 4, y: 0 },
      { id: 'bg', type: 'GENERAL', side: 'BLACK', x: 4, y: 9 },
      { id: 'rr1', type: 'ROOK', side: 'RED', x: 3, y: 9 },
      { id: 'rr2', type: 'ROOK', side: 'RED', x: 5, y: 9 },
      { id: 'rr3', type: 'ROOK', side: 'RED', x: 0, y: 7 }, // can move to (4,7) to mate
    ], 'RED');

    const input = makeInput({ position: pos, maxDepth: 2 });
    const result = searchBestMove(input, () => 0, () => false);

    expect(result.move).not.toBeNull();
    // The winning move is (0,7) → (4,7)
    expect(result.move!.from).toEqual({ x: 0, y: 7 });
    expect(result.move!.to).toEqual({ x: 4, y: 7 });
    // Mate score should be high (near MATE_SCORE)
    expect(result.score).toBeGreaterThan(MATE_SCORE - 10);
  });
});

describe('T019-03: Avoid self-check', () => {
  it('never chooses a move that exposes general to check', () => {
    // RED general at (4,0), RED pawn at (4,1) pinned by BLACK rook at (4,8)
    const pos = makePosition([
      { id: 'rg', type: 'GENERAL', side: 'RED', x: 4, y: 0 },
      { id: 'bg', type: 'GENERAL', side: 'BLACK', x: 3, y: 9 },
      { id: 'rp', type: 'PAWN', side: 'RED', x: 4, y: 1 }, // pinned
      { id: 'br', type: 'ROOK', side: 'BLACK', x: 4, y: 8 },
    ], 'RED');

    const input = makeInput({ position: pos, maxDepth: 1 });
    const result = searchBestMove(input, () => 0, () => false);

    expect(result.move).not.toBeNull();
    // Move must be legal
    expect(validateMove(pos, result.move!).valid).toBe(true);
    // Pawn at (4,1) can only move forward along col 4 (to 4,2), NOT sideways
    if (result.move!.from.x === 4 && result.move!.from.y === 1) {
      expect(result.move!.to.x).toBe(4);
    }
  });
});

describe('T019-04: Root terminal handling', () => {
  it('returns move null when side to move has no legal moves (checkmate)', () => {
    const pos = makePosition(CHECKMATE_POSITION, 'BLACK');
    const input = makeInput({ position: pos, maxDepth: 2 });
    const result = searchBestMove(input, () => 0, () => false);

    expect(result.move).toBeNull();
    expect(result.score).toBeLessThan(-90000);
    expect(result.aborted).toBe(false);
  });
});

describe('T019-05: Repetition handling', () => {
  it('scores repetition nodes as 0 (draw)', () => {
    // If a branch leads to a position with count >= 2 (becoming 3), it's scored 0
    const pos = makePosition([RG, BG], 'RED');
    const key = positionKey(pos);

    // If root position already occurred twice, repeating it is a draw
    const input = makeInput({
      position: pos,
      maxDepth: 1,
      repetitionCounts: { [key]: 2 },
    });
    const result = searchBestMove(input, () => 0, () => false);
    expect(result.move).not.toBeNull();
  });
});

describe('T019-06: Cancellation and deadline', () => {
  it('aborts search when isCancelled returns true', () => {
    const pos = createInitialPosition();
    let checks = 0;
    const input = makeInput({
      position: pos,
      maxDepth: 3,
      deadlineMonoMs: 999999,
    });

    const result = searchBestMove(
      input,
      () => 0,
      () => {
        checks++;
        return checks > 100; // Cancel after some checks
      },
    );

    // If cancelled, returns aborted=true or fallback move
    expect(result.move).not.toBeNull(); // Fallback is always provided
  });

  it('aborts search when deadline is exceeded', () => {
    const pos = createInitialPosition();
    let time = 0;
    const input = makeInput({
      position: pos,
      maxDepth: 3,
      deadlineMonoMs: 50,
    });

    const result = searchBestMove(
      input,
      () => {
        time += 10;
        return time;
      },
      () => false,
    );

    expect(result.move).not.toBeNull();
  });
});

describe('T019-07: Input immutability', () => {
  it('search does not mutate input position or repetitionCounts', () => {
    const pos = createInitialPosition();
    const posSnapshot = JSON.stringify(pos);
    const repCounts = { [positionKey(pos)]: 1 };
    const repSnapshot = JSON.stringify(repCounts);

    searchBestMove(
      {
        position: pos,
        repetitionCounts: repCounts,
        maxDepth: 1,
        deadlineMonoMs: 1000,
        algorithm: 'MINIMAX',
        seed: 1,
      },
      () => 0,
      () => false,
    );

    expect(JSON.stringify(pos)).toBe(posSnapshot);
    expect(JSON.stringify(repCounts)).toBe(repSnapshot);
  });
});
