/**
 * Static evaluation function for Xiangqi.
 * Evaluates from the perspective of the side-to-move (positive = good for turn).
 * Material weights: pawn 100, advisor 200, elephant 200, horse 400, cannon 450, rook 900.
 * Position bonuses: pawn advancement, crossing river, center control.
 */
import type { Position, PieceType } from '@xiangqi/contracts';
import { BOARD_SIZE, indexToSquare } from '@xiangqi/contracts';

export const PIECE_VALUES: Record<PieceType, number> = {
  PAWN: 100,
  ADVISOR: 200,
  ELEPHANT: 200,
  HORSE: 400,
  CANNON: 450,
  ROOK: 900,
  GENERAL: 0, // Not evaluated as material — terminal handles win/loss
};

export const CROSSED_RIVER_PAWN_BONUS = 100;
export const PAWN_ADVANCEMENT_BONUS = 20; // Per row advanced

/**
 * Evaluate position from RED's absolute perspective.
 * Positive = RED ahead, Negative = BLACK ahead.
 */
export function evaluateAbsolute(position: Position): number {
  let score = 0;

  for (let i = 0; i < BOARD_SIZE; i++) {
    const piece = position.board[i];
    if (!piece) continue;

    const sq = indexToSquare(i);
    let pieceScore = PIECE_VALUES[piece.type];

    // Positional bonuses
    if (piece.type === 'PAWN') {
      if (piece.side === 'RED') {
        // RED pawn: river at y=5, moves upward (y increasing)
        if (sq.y >= 5) {
          pieceScore += CROSSED_RIVER_PAWN_BONUS;
        }
        pieceScore += sq.y * PAWN_ADVANCEMENT_BONUS;
      } else {
        // BLACK pawn: river at y=4, moves downward (y decreasing)
        if (sq.y <= 4) {
          pieceScore += CROSSED_RIVER_PAWN_BONUS;
        }
        pieceScore += (9 - sq.y) * PAWN_ADVANCEMENT_BONUS;
      }
    }

    if (piece.side === 'RED') {
      score += pieceScore;
    } else {
      score -= pieceScore;
    }
  }

  return score;
}

/**
 * Evaluate position from perspective of side-to-move.
 * Positive = good for position.turn.
 */
export function evaluate(position: Position): number {
  const absolute = evaluateAbsolute(position);
  return position.turn === 'RED' ? absolute : -absolute;
}
