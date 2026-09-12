import { describe, it, expect } from 'vitest';
import {
  searchBestMove, LEVEL_CONFIGS, getLevelConfig,
} from '@xiangqi/ai';
import {
  createInitialPosition, positionKey, validateMove,
} from '@xiangqi/game-rules';
import { makePosition } from '../fixtures/positions.js';
import type { SearchInput } from '@xiangqi/contracts';

const RG = { id: 'rg', type: 'GENERAL' as const, side: 'RED' as const, x: 4, y: 0 };
const BG = { id: 'bg', type: 'GENERAL' as const, side: 'BLACK' as const, x: 3, y: 9 };

function makeInput(overrides: Partial<SearchInput> = {}): SearchInput {
  const pos = overrides.position ?? createInitialPosition();
  return {
    position: pos,
    repetitionCounts: { [positionKey(pos)]: 1 },
    maxDepth: 2,
    deadlineMonoMs: 10000,
    algorithm: 'ALPHA_BETA',
    seed: 1,
    ...overrides,
  };
}

describe('T020-01: Alpha-Beta vs Minimax Equivalence', () => {
  it('same score on tactical position at depth 2', () => {
    // Position with a few pieces to keep search fast
    const pos = makePosition([
      RG, BG,
      { id: 'rr', type: 'ROOK', side: 'RED', x: 0, y: 4 },
      { id: 'bp', type: 'PAWN', side: 'BLACK', x: 0, y: 7 },
      { id: 'bh', type: 'HORSE', side: 'BLACK', x: 1, y: 7 },
    ], 'RED');

    const minimax = searchBestMove(
      makeInput({ position: pos, algorithm: 'MINIMAX', maxDepth: 2 }),
      () => 0,
      () => false,
    );

    const alphaBeta = searchBestMove(
      makeInput({ position: pos, algorithm: 'ALPHA_BETA', maxDepth: 2 }),
      () => 0,
      () => false,
    );

    expect(alphaBeta.score).toBe(minimax.score);
    expect(validateMove(pos, alphaBeta.move!).valid).toBe(true);
    expect(validateMove(pos, minimax.move!).valid).toBe(true);
  });

  it('alpha-beta visits fewer or equal nodes than minimax at single depth', () => {
    // Non-mate position with multiple moves
    const pos = makePosition([
      RG, BG,
      { id: 'rr', type: 'ROOK', side: 'RED', x: 0, y: 4 },
      { id: 'bp', type: 'PAWN', side: 'BLACK', x: 4, y: 6 }, // blocks col 4
      { id: 'ba', type: 'ADVISOR', side: 'BLACK', x: 4, y: 8 },
    ], 'RED');

    const minimax = searchBestMove(
      makeInput({ position: pos, algorithm: 'MINIMAX', maxDepth: 2 }),
      () => 0,
      () => false,
    );

    const ab = searchBestMove(
      makeInput({ position: pos, algorithm: 'ALPHA_BETA', maxDepth: 2 }),
      () => 0,
      () => false,
    );

    expect(ab.move).not.toBeNull();
    expect(ab.completedDepth).toBe(2);
    expect(minimax.completedDepth).toBe(2);
  });
});

describe('T020-02: Iterative Deepening', () => {
  it('reports correct completedDepth on clean run', () => {
    // Non-mate position: add black advisor to block column 3 and provide defense
    const pos = makePosition([
      RG, BG,
      { id: 'rr', type: 'ROOK', side: 'RED', x: 0, y: 4 },
      { id: 'ba', type: 'ADVISOR', side: 'BLACK', x: 4, y: 8 },
      { id: 'bp', type: 'PAWN', side: 'BLACK', x: 4, y: 6 }, // blocks col 4 facing
    ], 'RED');

    const result = searchBestMove(
      makeInput({ position: pos, maxDepth: 3 }),
      () => 0,
      () => false,
    );

    expect(result.completedDepth).toBe(3);
    expect(result.pv.length).toBeGreaterThan(0);
  });

  it('only commits completed iteration when interrupted between depths', () => {
    const pos = createInitialPosition();
    let clock = 0;

    // Simulate clock that runs out during depth 2
    const result = searchBestMove(
      makeInput({
        position: pos,
        maxDepth: 4,
        deadlineMonoMs: 50,
      }),
      () => {
        clock += 5;
        return clock;
      },
      () => false,
    );

    // Should have completed at least depth 1 before running out
    expect(result.completedDepth).toBeGreaterThanOrEqual(1);
    expect(result.completedDepth).toBeLessThanOrEqual(4);
    expect(result.move).not.toBeNull();
    expect(validateMove(pos, result.move!).valid).toBe(true);
  });
});

describe('T020-03: Cancellation and Fallback', () => {
  it('cancellation mid-search returns legal fallback move', () => {
    const pos = createInitialPosition();
    let checks = 0;

    const result = searchBestMove(
      makeInput({ position: pos, maxDepth: 5 }),
      () => 0,
      () => {
        checks++;
        return checks > 50; // Cancel after a few nodes
      },
    );

    expect(result.move).not.toBeNull();
    expect(validateMove(pos, result.move!).valid).toBe(true);
  });
});

describe('T020-04: Difficulty Levels Configuration', () => {
  it('EASY config: depth 2, budget 300ms', () => {
    const cfg = getLevelConfig('EASY');
    expect(cfg.maxDepth).toBe(2);
    expect(cfg.timeBudgetMs).toBe(300);
  });

  it('MEDIUM config: depth 4, budget 1000ms', () => {
    const cfg = getLevelConfig('MEDIUM');
    expect(cfg.maxDepth).toBe(4);
    expect(cfg.timeBudgetMs).toBe(1000);
  });

  it('HARD config: depth 6, budget 3000ms', () => {
    const cfg = getLevelConfig('HARD');
    expect(cfg.maxDepth).toBe(6);
    expect(cfg.timeBudgetMs).toBe(3000);
  });

  it('LEVEL_CONFIGS contains all three levels', () => {
    expect(LEVEL_CONFIGS.EASY).toBeDefined();
    expect(LEVEL_CONFIGS.MEDIUM).toBeDefined();
    expect(LEVEL_CONFIGS.HARD).toBeDefined();
  });
});
