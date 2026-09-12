/**
 * Terminal detection: checkmate, stalemate, and threefold repetition.
 * Spec: hết nước → CHECKMATE nếu bị chiếu, ngược lại STALEMATE.
 * occurrences >= 3 → REPETITION draw.
 * Terminal check has priority over repetition.
 */
import { type Position, type Outcome } from '@xiangqi/contracts';
import { getLegalMoves, isInCheck } from './moves.js';
import { OPPOSITE } from './attacks.js';

/**
 * Determine if the position is terminal.
 * @param position Current position (side to move)
 * @param occurrences Number of times this position has occurred (including current)
 * @returns Outcome if game is over, null otherwise
 *
 * Logic:
 * 1. If no legal moves for side to move:
 *    - If in check → CHECKMATE, opponent wins
 *    - If not in check → STALEMATE, opponent wins (xiangqi rule: stalemate = loss)
 * 2. If legal moves exist and occurrences >= 3 → REPETITION, draw
 * 3. Otherwise → null (game continues)
 */
export function getTerminalOutcome(
  position: Position,
  occurrences: number,
): Outcome | null {
  const moves = getLegalMoves(position);

  if (moves.length === 0) {
    // Side to move has no legal moves → they lose
    const winner = OPPOSITE[position.turn];
    if (isInCheck(position, position.turn)) {
      return { winner, reason: 'CHECKMATE' };
    } else {
      return { winner, reason: 'STALEMATE' };
    }
  }

  // Has moves — check repetition
  if (occurrences >= 3) {
    return { winner: null, reason: 'REPETITION' };
  }

  return null;
}
