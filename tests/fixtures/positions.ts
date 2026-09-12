import {
  type Position,
  type Board,
  type Side,
  type PieceType,
  BOARD_SIZE,
  squareToIndex,
} from '@xiangqi/contracts';

/**
 * Build a Position from a list of placed pieces.
 * Validates: no duplicate squares, no duplicate IDs, both generals present.
 * Does NOT auto-add generals — caller must include them.
 */
export function makePosition(
  pieces: { id: string; type: PieceType; side: Side; x: number; y: number }[],
  turn: Side,
): Position {
  const board: Board = Array.from({ length: BOARD_SIZE }, () => null);
  const usedSquares = new Set<number>();
  const usedIds = new Set<string>();

  for (const p of pieces) {
    if (!Number.isInteger(p.x) || p.x < 0 || p.x > 8) {
      throw new Error(`x out of bounds: ${p.x} (must be integer 0..8)`);
    }
    if (!Number.isInteger(p.y) || p.y < 0 || p.y > 9) {
      throw new Error(`y out of bounds: ${p.y} (must be integer 0..9)`);
    }
    const idx = squareToIndex({ x: p.x, y: p.y });
    if (idx < 0 || idx >= BOARD_SIZE) {
      throw new Error(`Square out of bounds: (${p.x}, ${p.y})`);
    }
    if (usedSquares.has(idx)) {
      throw new Error(`Duplicate square: (${p.x}, ${p.y})`);
    }
    if (usedIds.has(p.id)) {
      throw new Error(`Duplicate piece ID: ${p.id}`);
    }
    usedSquares.add(idx);
    usedIds.add(p.id);
    board[idx] = { id: p.id, type: p.type, side: p.side };
  }

  // Verify both generals exist
  const generals = pieces.filter((p) => p.type === 'GENERAL');
  const redGeneral = generals.find((p) => p.side === 'RED');
  const blackGeneral = generals.find((p) => p.side === 'BLACK');
  if (!redGeneral) throw new Error('Missing RED GENERAL');
  if (!blackGeneral) throw new Error('Missing BLACK GENERAL');

  return { board, turn };
}
