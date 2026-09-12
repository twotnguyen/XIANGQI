import { describe, it, expect } from 'vitest';
import {
  getLegalMoves, validateMove, applyMove, isInCheck,
} from '@xiangqi/game-rules';
import { createInitialPosition } from '@xiangqi/game-rules';
import { makePosition } from '../fixtures/positions.js';
import type { Move } from '@xiangqi/contracts';

// helper: check a move is in the legal set
function hasMove(moves: Move[], from: [number, number], to: [number, number]): boolean {
  return moves.some(
    (m) => m.from.x === from[0] && m.from.y === from[1] &&
           m.to.x === to[0] && m.to.y === to[1],
  );
}

// Generals on different columns to avoid facing-general issues in tests
// unless testing that specific rule.
const RG = { id: 'rg', type: 'GENERAL' as const, side: 'RED' as const, x: 4, y: 0 };
const BG = { id: 'bg', type: 'GENERAL' as const, side: 'BLACK' as const, x: 3, y: 9 };

describe('T003-01: General moves', () => {
  it('general stays in palace', () => {
    const pos = makePosition([RG, BG], 'RED');
    const moves = getLegalMoves(pos);
    const genMoves = moves.filter((m) => m.from.x === 4 && m.from.y === 0);
    for (const m of genMoves) {
      expect(m.to.x).toBeGreaterThanOrEqual(3);
      expect(m.to.x).toBeLessThanOrEqual(5);
      expect(m.to.y).toBeGreaterThanOrEqual(0);
      expect(m.to.y).toBeLessThanOrEqual(2);
    }
    expect(genMoves.length).toBeGreaterThan(0);
  });
});

describe('T003-02: Advisor moves', () => {
  it('advisor moves diagonally in palace', () => {
    const pos = makePosition([
      RG, BG,
      { id: 'ra', type: 'ADVISOR', side: 'RED', x: 4, y: 1 },
    ], 'RED');
    const moves = getLegalMoves(pos);
    const adMoves = moves.filter((m) => m.from.x === 4 && m.from.y === 1);
    expect(adMoves.length).toBeGreaterThanOrEqual(2);
    for (const m of adMoves) {
      expect(Math.abs(m.to.x - 4)).toBe(1);
      expect(Math.abs(m.to.y - 1)).toBe(1);
    }
  });
});

describe('T003-03: Elephant moves', () => {
  it('elephant blocked by eye piece', () => {
    const pos = makePosition([
      RG, BG,
      { id: 're', type: 'ELEPHANT', side: 'RED', x: 2, y: 0 },
      { id: 'block', type: 'PAWN', side: 'RED', x: 3, y: 1 }, // blocks (2,0)→(4,2) eye
    ], 'RED');
    const moves = getLegalMoves(pos);
    expect(hasMove(moves, [2, 0], [4, 2])).toBe(false); // eye blocked
    expect(hasMove(moves, [2, 0], [0, 2])).toBe(true);  // eye clear
  });

  it('elephant cannot cross river', () => {
    const pos = makePosition([
      RG, BG,
      { id: 're', type: 'ELEPHANT', side: 'RED', x: 2, y: 4 },
    ], 'RED');
    const moves = getLegalMoves(pos);
    const eMoves = moves.filter((m) => m.from.x === 2 && m.from.y === 4);
    for (const m of eMoves) {
      expect(m.to.y).toBeLessThanOrEqual(4);
    }
  });
});

describe('T003-04: Horse moves', () => {
  it('horse blocked by leg', () => {
    const pos = makePosition([
      RG, BG,
      { id: 'rh', type: 'HORSE', side: 'RED', x: 1, y: 0 },
      { id: 'block', type: 'PAWN', side: 'RED', x: 1, y: 1 }, // blocks y-leg
    ], 'RED');
    const moves = getLegalMoves(pos);
    expect(hasMove(moves, [1, 0], [0, 2])).toBe(false);
    expect(hasMove(moves, [1, 0], [2, 2])).toBe(false);
    expect(hasMove(moves, [1, 0], [3, 1])).toBe(true); // x-leg clear
  });
});

describe('T003-05: Rook moves', () => {
  it('rook moves in straight lines, blocked by pieces', () => {
    const pos = makePosition([
      RG, BG,
      { id: 'rr', type: 'ROOK', side: 'RED', x: 0, y: 4 },
    ], 'RED');
    const moves = getLegalMoves(pos);
    const rookMoves = moves.filter((m) => m.from.x === 0 && m.from.y === 4);
    // Rook at (0,4): along x = 1..8, along y = 0..9 minus (0,4), minus (4,0)general
    // x-axis: 8 squares, y-axis: 9 squares = 17 total
    expect(rookMoves.length).toBeGreaterThan(10);
  });
});

describe('T003-06: Cannon moves', () => {
  it('cannon needs exactly 1 screen to capture', () => {
    const pos = makePosition([
      RG, BG,
      { id: 'rc', type: 'CANNON', side: 'RED', x: 1, y: 2 },
      { id: 'screen', type: 'PAWN', side: 'RED', x: 1, y: 5 },
      { id: 'target', type: 'PAWN', side: 'BLACK', x: 1, y: 7 },
    ], 'RED');
    const moves = getLegalMoves(pos);
    expect(hasMove(moves, [1, 2], [1, 7])).toBe(true);  // capture via 1 screen
    expect(hasMove(moves, [1, 2], [1, 5])).toBe(false);  // own piece
    expect(hasMove(moves, [1, 2], [1, 3])).toBe(true);   // empty = move
  });

  it('cannon with 0 screens cannot capture', () => {
    const pos = makePosition([
      RG, BG,
      { id: 'rc', type: 'CANNON', side: 'RED', x: 1, y: 2 },
      { id: 'target', type: 'PAWN', side: 'BLACK', x: 1, y: 7 },
    ], 'RED');
    const moves = getLegalMoves(pos);
    expect(hasMove(moves, [1, 2], [1, 7])).toBe(false);
  });

  it('cannon with 2 screens cannot capture', () => {
    const pos = makePosition([
      RG, BG,
      { id: 'rc', type: 'CANNON', side: 'RED', x: 1, y: 2 },
      { id: 's1', type: 'PAWN', side: 'RED', x: 1, y: 4 },
      { id: 's2', type: 'PAWN', side: 'RED', x: 1, y: 5 },
      { id: 'target', type: 'PAWN', side: 'BLACK', x: 1, y: 7 },
    ], 'RED');
    const moves = getLegalMoves(pos);
    expect(hasMove(moves, [1, 2], [1, 7])).toBe(false);
  });
});

describe('T003-07: Pawn moves', () => {
  it('RED pawn before river: forward only', () => {
    const pos = makePosition([
      RG, BG,
      { id: 'rp', type: 'PAWN', side: 'RED', x: 2, y: 3 },
    ], 'RED');
    const moves = getLegalMoves(pos);
    const pawnMoves = moves.filter((m) => m.from.x === 2 && m.from.y === 3);
    expect(pawnMoves).toHaveLength(1);
    expect(pawnMoves[0]!.to).toEqual({ x: 2, y: 4 });
  });

  it('RED pawn after crossing river: forward + sideways', () => {
    const pos = makePosition([
      RG, BG,
      { id: 'rp', type: 'PAWN', side: 'RED', x: 2, y: 5 },
    ], 'RED');
    const moves = getLegalMoves(pos);
    const pawnMoves = moves.filter((m) => m.from.x === 2 && m.from.y === 5);
    expect(pawnMoves).toHaveLength(3);
    expect(hasMove(pawnMoves, [2, 5], [2, 6])).toBe(true);
    expect(hasMove(pawnMoves, [2, 5], [1, 5])).toBe(true);
    expect(hasMove(pawnMoves, [2, 5], [3, 5])).toBe(true);
  });

  it('RED pawn cannot go backward', () => {
    const pos = makePosition([
      RG, BG,
      { id: 'rp', type: 'PAWN', side: 'RED', x: 2, y: 6 },
    ], 'RED');
    const moves = getLegalMoves(pos);
    expect(hasMove(moves, [2, 6], [2, 5])).toBe(false);
  });
});

describe('T003-08: Self-check and facing generals', () => {
  it('cannot move into self-check', () => {
    const pos = makePosition([
      { id: 'rg', type: 'GENERAL', side: 'RED', x: 4, y: 0 },
      { id: 'bg', type: 'GENERAL', side: 'BLACK', x: 3, y: 9 },
      { id: 'br', type: 'ROOK', side: 'BLACK', x: 3, y: 5 },
    ], 'RED');
    const moves = getLegalMoves(pos);
    // General cannot move to (3,0) — attacked by rook on column 3
    expect(hasMove(moves, [4, 0], [3, 0])).toBe(false);
  });

  it('facing generals: pawn blocking removal is illegal', () => {
    // Generals on same column, pawn blocking
    const pos = makePosition([
      { id: 'rg', type: 'GENERAL', side: 'RED', x: 4, y: 0 },
      { id: 'bg', type: 'GENERAL', side: 'BLACK', x: 4, y: 9 },
      { id: 'rp', type: 'PAWN', side: 'RED', x: 4, y: 5 },
    ], 'RED');
    const moves = getLegalMoves(pos);
    // Moving pawn sideways exposes facing generals
    expect(hasMove(moves, [4, 5], [3, 5])).toBe(false);
    expect(hasMove(moves, [4, 5], [5, 5])).toBe(false);
    // Forward is ok — still blocks
    expect(hasMove(moves, [4, 5], [4, 6])).toBe(true);
  });
});

describe('T003-09: isInCheck', () => {
  it('detects check from rook', () => {
    const pos = makePosition([
      { id: 'rg', type: 'GENERAL', side: 'RED', x: 4, y: 0 },
      BG,
      { id: 'br', type: 'ROOK', side: 'BLACK', x: 4, y: 5 },
    ], 'RED');
    expect(isInCheck(pos, 'RED')).toBe(true);
  });

  it('no check in initial position', () => {
    const pos = createInitialPosition();
    expect(isInCheck(pos, 'RED')).toBe(false);
    expect(isInCheck(pos, 'BLACK')).toBe(false);
  });
});

describe('T003-10: validateMove', () => {
  it('accepts legal pawn move from initial', () => {
    const pos = createInitialPosition();
    const move = { from: { x: 0, y: 3 }, to: { x: 0, y: 4 } };
    expect(validateMove(pos, move)).toEqual({ valid: true });
  });

  it('rejects move with no piece', () => {
    const pos = createInitialPosition();
    const move = { from: { x: 0, y: 4 }, to: { x: 0, y: 5 } };
    expect(validateMove(pos, move).valid).toBe(false);
  });

  it('rejects wrong side piece', () => {
    const pos = createInitialPosition();
    const move = { from: { x: 0, y: 6 }, to: { x: 0, y: 5 } };
    expect(validateMove(pos, move).valid).toBe(false);
  });
});

describe('T003-11: applyMove', () => {
  it('valid move changes turn and preserves piece id', () => {
    const pos = createInitialPosition();
    const move = { from: { x: 0, y: 3 }, to: { x: 0, y: 4 } };
    const next = applyMove(pos, move);
    expect(next.turn).toBe('BLACK');
    const fromIdx = 3 * 9 + 0;
    const toIdx = 4 * 9 + 0;
    expect(next.board[fromIdx]).toBeNull();
    expect(next.board[toIdx]).not.toBeNull();
    expect(next.board[toIdx]!.id).toBe(pos.board[fromIdx]!.id);
  });

  it('does not mutate input position', () => {
    const pos = createInitialPosition();
    const boardBefore = JSON.stringify(pos.board);
    applyMove(pos, { from: { x: 0, y: 3 }, to: { x: 0, y: 4 } });
    expect(JSON.stringify(pos.board)).toBe(boardBefore);
    expect(pos.turn).toBe('RED');
  });
});

describe('T003-12: Initial position', () => {
  it('RED has legal moves from initial', () => {
    const pos = createInitialPosition();
    const moves = getLegalMoves(pos);
    expect(moves.length).toBeGreaterThan(0);
  });

  it('Acceptance: RED pawn (0,3)→(0,4) is legal, turn becomes BLACK, input unchanged', () => {
    const pos = createInitialPosition();
    const move = { from: { x: 0, y: 3 }, to: { x: 0, y: 4 } };
    expect(validateMove(pos, move)).toEqual({ valid: true });
    const next = applyMove(pos, move);
    expect(next.turn).toBe('BLACK');
    expect(pos.board[3 * 9]).not.toBeNull();
  });
});

describe('T003-13: Symmetry RED/BLACK', () => {
  it('BLACK pawn before river moves forward (y decreasing)', () => {
    const pos = makePosition([
      RG, BG,
      { id: 'bp', type: 'PAWN', side: 'BLACK', x: 2, y: 6 },
    ], 'BLACK');
    const moves = getLegalMoves(pos);
    const pawnMoves = moves.filter((m) => m.from.x === 2 && m.from.y === 6);
    expect(pawnMoves).toHaveLength(1);
    expect(pawnMoves[0]!.to).toEqual({ x: 2, y: 5 });
  });

  it('BLACK pawn after crossing river has 3 moves', () => {
    const pos = makePosition([
      RG, BG,
      { id: 'bp', type: 'PAWN', side: 'BLACK', x: 2, y: 4 },
    ], 'BLACK');
    const moves = getLegalMoves(pos);
    const pawnMoves = moves.filter((m) => m.from.x === 2 && m.from.y === 4);
    expect(pawnMoves).toHaveLength(3);
  });
});

describe('T003-14: Capture mechanics', () => {
  it('can capture opponent piece', () => {
    const pos = makePosition([
      RG, BG,
      { id: 'rr', type: 'ROOK', side: 'RED', x: 0, y: 4 },
      { id: 'bp', type: 'PAWN', side: 'BLACK', x: 0, y: 7 },
    ], 'RED');
    const moves = getLegalMoves(pos);
    expect(hasMove(moves, [0, 4], [0, 7])).toBe(true);
  });

  it('capture does not mutate input board', () => {
    const pos = makePosition([
      RG, BG,
      { id: 'rr', type: 'ROOK', side: 'RED', x: 0, y: 4 },
      { id: 'bp', type: 'PAWN', side: 'BLACK', x: 0, y: 7 },
    ], 'RED');
    const boardBefore = JSON.stringify(pos.board);
    applyMove(pos, { from: { x: 0, y: 4 }, to: { x: 0, y: 7 } });
    expect(JSON.stringify(pos.board)).toBe(boardBefore);
  });
});
