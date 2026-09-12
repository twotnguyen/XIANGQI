import { describe, it, expect } from 'vitest';
import { createInitialPosition } from '@xiangqi/game-rules';
import { positionKey } from '@xiangqi/game-rules';
import { SquareSchema, BOARD_SIZE } from '@xiangqi/contracts';
import { makePosition } from '../fixtures/positions.js';

describe('createInitialPosition', () => {
  it('T002-01: board has 90 slots with 32 pieces, 16 per side, RED turn', () => {
    const pos = createInitialPosition();
    expect(pos.board).toHaveLength(BOARD_SIZE);
    const pieces = pos.board.filter(Boolean);
    expect(pieces).toHaveLength(32);

    const red = pieces.filter((p) => p!.side === 'RED');
    const black = pieces.filter((p) => p!.side === 'BLACK');
    expect(red).toHaveLength(16);
    expect(black).toHaveLength(16);
    expect(pos.turn).toBe('RED');
  });

  it('T002-02: all piece IDs are unique', () => {
    const pos = createInitialPosition();
    const ids = pos.board.filter(Boolean).map((p) => p!.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('T002-03: correct piece types per side', () => {
    const pos = createInitialPosition();
    const pieces = pos.board.filter(Boolean);

    for (const side of ['RED', 'BLACK'] as const) {
      const sidePieces = pieces.filter((p) => p!.side === side);
      const types = sidePieces.map((p) => p!.type).sort();
      expect(types).toEqual([
        'ADVISOR', 'ADVISOR',
        'CANNON', 'CANNON',
        'ELEPHANT', 'ELEPHANT',
        'GENERAL',
        'HORSE', 'HORSE',
        'PAWN', 'PAWN', 'PAWN', 'PAWN', 'PAWN',
        'ROOK', 'ROOK',
      ]);
    }
  });
});

describe('positionKey', () => {
  it('T002-04: same board but different turn produces different key', () => {
    const pos = createInitialPosition();
    const keyRed = positionKey(pos);
    const keyBlack = positionKey({ ...pos, turn: 'BLACK' });
    expect(keyRed).not.toBe(keyBlack);
  });

  it('T002-05: clone board with different IDs produces same key', () => {
    const pos = createInitialPosition();
    const originalKey = positionKey(pos);

    // Clone and change all IDs
    const clonedBoard = pos.board.map((p) =>
      p ? { ...p, id: `cloned-${p.id}` } : null,
    );
    const clonedKey = positionKey({ board: clonedBoard, turn: pos.turn });
    expect(clonedKey).toBe(originalKey);
  });

  it('T002-06: key distinguishes side and type at same position', () => {
    const pos = createInitialPosition();
    const key1 = positionKey(pos);

    // Swap a RED piece to BLACK — different key
    const board2 = [...pos.board];
    const firstPiece = board2.findIndex(Boolean);
    board2[firstPiece] = { ...board2[firstPiece]!, side: 'BLACK' };
    const key2 = positionKey({ board: board2, turn: pos.turn });
    expect(key1).not.toBe(key2);
  });
});

describe('SquareSchema validation', () => {
  it('T002-07: rejects x=9 (out of bounds)', () => {
    expect(SquareSchema.safeParse({ x: 9, y: 0 }).success).toBe(false);
  });

  it('T002-08: rejects y=-1 (out of bounds)', () => {
    expect(SquareSchema.safeParse({ x: 0, y: -1 }).success).toBe(false);
  });

  it('T002-09: rejects non-integer x=1.5', () => {
    expect(SquareSchema.safeParse({ x: 1.5, y: 0 }).success).toBe(false);
  });

  it('T002-10: rejects unknown fields', () => {
    expect(SquareSchema.safeParse({ x: 0, y: 0, z: 1 }).success).toBe(false);
  });

  it('T002-11: accepts valid square', () => {
    expect(SquareSchema.safeParse({ x: 4, y: 5 }).success).toBe(true);
  });
});

describe('makePosition fixture helper', () => {
  it('rejects duplicate square', () => {
    expect(() =>
      makePosition(
        [
          { id: 'g1', type: 'GENERAL', side: 'RED', x: 4, y: 0 },
          { id: 'g2', type: 'GENERAL', side: 'BLACK', x: 4, y: 9 },
          { id: 'dup', type: 'PAWN', side: 'RED', x: 4, y: 0 },
        ],
        'RED',
      ),
    ).toThrow('Duplicate square');
  });

  it('rejects duplicate ID', () => {
    expect(() =>
      makePosition(
        [
          { id: 'g1', type: 'GENERAL', side: 'RED', x: 4, y: 0 },
          { id: 'g1', type: 'GENERAL', side: 'BLACK', x: 4, y: 9 },
        ],
        'RED',
      ),
    ).toThrow('Duplicate piece ID');
  });

  it('rejects missing general', () => {
    expect(() =>
      makePosition(
        [{ id: 'g1', type: 'GENERAL', side: 'RED', x: 4, y: 0 }],
        'RED',
      ),
    ).toThrow('Missing BLACK GENERAL');
  });

  it('valid fixture with both generals', () => {
    const pos = makePosition(
      [
        { id: 'rg', type: 'GENERAL', side: 'RED', x: 4, y: 0 },
        { id: 'bg', type: 'GENERAL', side: 'BLACK', x: 4, y: 9 },
      ],
      'RED',
    );
    expect(pos.board).toHaveLength(90);
    expect(pos.board.filter(Boolean)).toHaveLength(2);
  });
});

describe('immutability', () => {
  it('T002-12: positionKey does not mutate input', () => {
    const pos = createInitialPosition();
    const boardSnapshot = JSON.stringify(pos.board);
    const turnSnapshot = pos.turn;
    positionKey(pos);
    expect(JSON.stringify(pos.board)).toBe(boardSnapshot);
    expect(pos.turn).toBe(turnSnapshot);
  });
});
