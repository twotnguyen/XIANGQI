import type { Piece, PieceType, Position, Side } from "../src/index.js";

export const square = (x: number, y: number): number => y * 9 + x;

export function fixture(
  pieces: [Side, PieceType, number, number][],
  turn: Side = "red",
  halfmove = 0,
): Position {
  const board: (Piece | null)[] = Array<null>(90).fill(null);
  for (const [side, type, x, y] of pieces) {
    board[square(x, y)] = { side, type };
  }
  return { board, turn, halfmove, fullmove: 1 };
}
