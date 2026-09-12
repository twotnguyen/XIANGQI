import { type Position, BOARD_SIZE } from '@xiangqi/contracts';

/**
 * Produce a canonical string key for a position.
 * Encodes only type + side + square + turn.
 * Excludes piece ID, timestamps, ply count, etc.
 * Used for repetition detection.
 */
export function positionKey(position: Position): string {
  const parts: string[] = [];
  for (let i = 0; i < BOARD_SIZE; i++) {
    const piece = position.board[i];
    if (piece) {
      parts.push(`${i}:${piece.side[0]}${piece.type[0]}`);
    }
  }
  parts.push(position.turn);
  return parts.join('/');
}
