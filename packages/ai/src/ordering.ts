/**
 * Move ordering for alpha-beta search.
 * Prioritizes:
 * 1. Captures ordered by MVV-LVA (Most Valuable Victim - Least Valuable Attacker)
 * 2. Non-captures
 * Tie-breaker: deterministic canonical square order (never random).
 */
import type { Position, Move } from '@xiangqi/contracts';
import { squareToIndex } from '@xiangqi/contracts';
import { PIECE_VALUES } from './evaluate.js';

/**
 * Score a move for ordering purposes (higher score = searched first).
 */
function scoreMove(position: Position, move: Move): number {
  const fromIdx = squareToIndex(move.from);
  const toIdx = squareToIndex(move.to);

  const mover = position.board[fromIdx];
  const target = position.board[toIdx];

  if (!mover) return 0;

  // Capture: MVV-LVA score
  // High victim value + small attacker penalty
  if (target) {
    const victimVal = PIECE_VALUES[target.type];
    const attackerVal = PIECE_VALUES[mover.type];
    // Base 10,000 for captures so they always come before non-captures
    return 10000 + victimVal * 10 - attackerVal;
  }

  // Non-captures: forward pawn push has slight bonus
  if (mover.type === 'PAWN') {
    const isForward =
      mover.side === 'RED'
        ? move.to.y > move.from.y
        : move.to.y < move.from.y;
    if (isForward) return 100;
  }

  return 0;
}

/**
 * Deterministic tie-breaker comparing two moves.
 */
function compareCanonical(a: Move, b: Move): number {
  if (a.from.y !== b.from.y) return a.from.y - b.from.y;
  if (a.from.x !== b.from.x) return a.from.x - b.from.x;
  if (a.to.y !== b.to.y) return a.to.y - b.to.y;
  return a.to.x - b.to.x;
}

/**
 * Order legal moves for search efficiency.
 * Pure function — does not mutate input array.
 * Stable, deterministic output.
 */
export function orderMoves(position: Position, moves: Move[]): Move[] {
  // Score each move
  const scored = moves.map((move) => ({
    move,
    score: scoreMove(position, move),
  }));

  // Sort descending by score; on tie, sort canonically
  scored.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score; // higher score first
    }
    return compareCanonical(a.move, b.move);
  });

  return scored.map((s) => s.move);
}
