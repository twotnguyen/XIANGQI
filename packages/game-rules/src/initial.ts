import {
  type Position,
  type Board,
  type PieceType,
  type Side,
  BOARD_SIZE,
  squareToIndex,
} from '@xiangqi/contracts';

/**
 * Place a piece on the board at the given (x,y) position.
 * RED at bottom (y=0..4), BLACK at top (y=5..9).
 * Standard initial setup with RED below.
 */
function place(
  board: Board,
  id: string,
  type: PieceType,
  side: Side,
  x: number,
  y: number,
): void {
  board[squareToIndex({ x, y })] = { id, type, side };
}

/**
 * Create the standard initial position for Xiangqi.
 * RED starts at bottom (rows 0-4), BLACK at top (rows 5-9).
 * Returns 90-slot board with 32 pieces, RED to move.
 */
export function createInitialPosition(): Position {
  const board: Board = Array.from({ length: BOARD_SIZE }, () => null);

  // ── RED pieces (rows 0-4, bottom) ──
  // Back rank (y=0): Rook, Horse, Elephant, Advisor, General, Advisor, Elephant, Horse, Rook
  const backRank: PieceType[] = ['ROOK', 'HORSE', 'ELEPHANT', 'ADVISOR', 'GENERAL', 'ADVISOR', 'ELEPHANT', 'HORSE', 'ROOK'];
  for (let x = 0; x < 9; x++) {
    place(board, `r-${backRank[x]!.toLowerCase()}-${x}`, backRank[x]!, 'RED', x, 0);
  }
  // Cannons (y=2, x=1 and x=7)
  place(board, 'r-cannon-0', 'CANNON', 'RED', 1, 2);
  place(board, 'r-cannon-1', 'CANNON', 'RED', 7, 2);
  // Pawns (y=3, x=0,2,4,6,8)
  for (let i = 0; i < 5; i++) {
    place(board, `r-pawn-${i}`, 'PAWN', 'RED', i * 2, 3);
  }

  // ── BLACK pieces (rows 5-9, top) ──
  // Back rank (y=9): mirror of RED
  for (let x = 0; x < 9; x++) {
    place(board, `b-${backRank[x]!.toLowerCase()}-${x}`, backRank[x]!, 'BLACK', x, 9);
  }
  // Cannons (y=7, x=1 and x=7)
  place(board, 'b-cannon-0', 'CANNON', 'BLACK', 1, 7);
  place(board, 'b-cannon-1', 'CANNON', 'BLACK', 7, 7);
  // Pawns (y=6, x=0,2,4,6,8)
  for (let i = 0; i < 5; i++) {
    place(board, `b-pawn-${i}`, 'PAWN', 'BLACK', i * 2, 6);
  }

  return { board, turn: 'RED' };
}
