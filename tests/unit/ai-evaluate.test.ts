import { describe, it, expect } from 'vitest';
import {
  evaluate, evaluateAbsolute, orderMoves,
  PIECE_VALUES, CROSSED_RIVER_PAWN_BONUS,
} from '@xiangqi/ai';
import { createInitialPosition, getLegalMoves } from '@xiangqi/game-rules';
import { makePosition } from '../fixtures/positions.js';

const RG = { id: 'rg', type: 'GENERAL' as const, side: 'RED' as const, x: 4, y: 0 };
const BG = { id: 'bg', type: 'GENERAL' as const, side: 'BLACK' as const, x: 3, y: 9 };

describe('T018-01: Material evaluation', () => {
  it('initial position has symmetric score (0)', () => {
    const pos = createInitialPosition();
    expect(evaluateAbsolute(pos)).toBe(0);
    expect(evaluate(pos)).toBe(0);
  });

  it('adding RED rook increases RED evaluation', () => {
    const base = makePosition([RG, BG], 'RED');
    const withRook = makePosition([
      RG, BG,
      { id: 'rr', type: 'ROOK', side: 'RED', x: 0, y: 0 },
    ], 'RED');
    expect(evaluate(withRook)).toBeGreaterThan(evaluate(base));
    expect(evaluate(withRook) - evaluate(base)).toBe(PIECE_VALUES.ROOK);
  });

  it('adding BLACK piece decreases RED evaluation', () => {
    const base = makePosition([RG, BG], 'RED');
    const withBlackHorse = makePosition([
      RG, BG,
      { id: 'bh', type: 'HORSE', side: 'BLACK', x: 1, y: 9 },
    ], 'RED');
    expect(evaluate(withBlackHorse)).toBeLessThan(evaluate(base));
  });

  it('piece values match spec', () => {
    expect(PIECE_VALUES.PAWN).toBe(100);
    expect(PIECE_VALUES.ADVISOR).toBe(200);
    expect(PIECE_VALUES.ELEPHANT).toBe(200);
    expect(PIECE_VALUES.HORSE).toBe(400);
    expect(PIECE_VALUES.CANNON).toBe(450);
    expect(PIECE_VALUES.ROOK).toBe(900);
    expect(PIECE_VALUES.GENERAL).toBe(0);
  });
});

describe('T018-02: Positional bonuses', () => {
  it('crossed river pawn is worth more than uncrossed pawn', () => {
    // RED pawn uncrossed at y=4
    const uncrossed = makePosition([
      RG, BG,
      { id: 'p1', type: 'PAWN', side: 'RED', x: 0, y: 4 },
    ], 'RED');
    // RED pawn crossed at y=5
    const crossed = makePosition([
      RG, BG,
      { id: 'p2', type: 'PAWN', side: 'RED', x: 0, y: 5 },
    ], 'RED');

    // crossed river bonus + 1 step forward bonus
    expect(evaluate(crossed)).toBeGreaterThan(evaluate(uncrossed));
    expect(evaluate(crossed) - evaluate(uncrossed)).toBeGreaterThanOrEqual(CROSSED_RIVER_PAWN_BONUS);
  });
});

describe('T018-03: Perspective and antisymmetry', () => {
  it('perspective flips score when turn changes', () => {
    // Unequal position: RED has extra rook
    const posRed = makePosition([
      RG, BG,
      { id: 'rr', type: 'ROOK', side: 'RED', x: 0, y: 0 },
    ], 'RED');
    const posBlack = { ...posRed, turn: 'BLACK' as const };

    const scoreRed = evaluate(posRed);
    const scoreBlack = evaluate(posBlack);

    // Absolute score is positive for RED
    expect(scoreRed).toBeGreaterThan(0);
    // From BLACK's perspective, score should be negative (BLACK is behind)
    expect(scoreBlack).toBe(-scoreRed);
  });

  it('mirror positions give symmetric scores', () => {
    // Mirror position: RED pawn at (0,3) vs BLACK pawn at (0,6)
    const posRedPawn = makePosition([
      RG, BG,
      { id: 'rp', type: 'PAWN', side: 'RED', x: 0, y: 3 },
    ], 'RED');
    const posBlackPawn = makePosition([
      RG, BG,
      { id: 'bp', type: 'PAWN', side: 'BLACK', x: 0, y: 6 },
    ], 'BLACK');

    // Both are at row 3 from their own back rank
    // RED turn in posRedPawn, BLACK turn in posBlackPawn
    expect(evaluate(posRedPawn)).toBe(evaluate(posBlackPawn));
  });
});

describe('T018-04: Move ordering', () => {
  it('captures ordered before non-captures', () => {
    // Setup position where RED can capture a piece or make quiet moves
    const pos = makePosition([
      RG, BG,
      { id: 'rr', type: 'ROOK', side: 'RED', x: 0, y: 0 },
      { id: 'bp', type: 'PAWN', side: 'BLACK', x: 0, y: 5 },
    ], 'RED');

    const moves = getLegalMoves(pos);
    const ordered = orderMoves(pos, moves);

    // First move should be the capture: (0,0) → (0,5)
    const first = ordered[0]!;
    expect(first.from).toEqual({ x: 0, y: 0 });
    expect(first.to).toEqual({ x: 0, y: 5 });
  });

  it('capturing high-value piece (rook) ordered before low-value (pawn)', () => {
    const pos = makePosition([
      RG, BG,
      { id: 'rr', type: 'ROOK', side: 'RED', x: 0, y: 4 },
      { id: 'bp', type: 'PAWN', side: 'BLACK', x: 0, y: 7 },
      { id: 'br', type: 'ROOK', side: 'BLACK', x: 5, y: 4 },
    ], 'RED');

    const moves = getLegalMoves(pos);
    const ordered = orderMoves(pos, moves);

    // Capture rook at (5,4) should come before capture pawn at (0,7)
    const rookCaptureIdx = ordered.findIndex(
      (m) => m.to.x === 5 && m.to.y === 4,
    );
    const pawnCaptureIdx = ordered.findIndex(
      (m) => m.to.x === 0 && m.to.y === 7,
    );

    expect(rookCaptureIdx).toBeGreaterThanOrEqual(0);
    expect(pawnCaptureIdx).toBeGreaterThanOrEqual(0);
    expect(rookCaptureIdx).toBeLessThan(pawnCaptureIdx);
  });

  it('MVV-LVA: least valuable attacker preferred for same victim', () => {
    // Both pawn and rook can capture the same black horse
    const pos = makePosition([
      RG, BG,
      { id: 'rp', type: 'PAWN', side: 'RED', x: 1, y: 4 },
      { id: 'rr', type: 'ROOK', side: 'RED', x: 0, y: 5 },
      { id: 'bh', type: 'HORSE', side: 'BLACK', x: 1, y: 5 },
    ], 'RED');

    const moves = getLegalMoves(pos);
    const ordered = orderMoves(pos, moves);

    // Pawn capture at (1,5) should come before Rook capture at (1,5)
    const pawnCapIdx = ordered.findIndex(
      (m) => m.from.x === 1 && m.from.y === 4 && m.to.x === 1 && m.to.y === 5,
    );
    const rookCapIdx = ordered.findIndex(
      (m) => m.from.x === 0 && m.from.y === 5 && m.to.x === 1 && m.to.y === 5,
    );

    expect(pawnCapIdx).toBeLessThan(rookCapIdx);
  });

  it('orderMoves is deterministic and returns all moves without duplicates', () => {
    const pos = createInitialPosition();
    const moves = getLegalMoves(pos);

    const order1 = orderMoves(pos, moves);
    const order2 = orderMoves(pos, moves);

    // Exact same order on repeated calls
    expect(order1).toEqual(order2);
    // Preserves move count
    expect(order1).toHaveLength(moves.length);

    // No duplicates
    const keys = order1.map(
      (m) => `${m.from.x},${m.from.y}->${m.to.x},${m.to.y}`,
    );
    expect(new Set(keys).size).toBe(moves.length);
  });

  it('orderMoves does not mutate input moves array or position', () => {
    const pos = createInitialPosition();
    const moves = getLegalMoves(pos);
    const movesCopy = [...moves];
    const posCopy = JSON.stringify(pos);

    orderMoves(pos, moves);

    expect(moves).toEqual(movesCopy);
    expect(JSON.stringify(pos)).toBe(posCopy);
  });
});
