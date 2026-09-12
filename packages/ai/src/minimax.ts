/**
 * Negamax formulation of Minimax search with mate distance and repetition detection.
 * Baseline implementation for comparison with alpha-beta in ISSUE-020.
 */
import type { Position, Move } from '@xiangqi/contracts';
import {
  getLegalMoves, applyMove, getTerminalOutcome, positionKey,
} from '@xiangqi/game-rules';
import { evaluate } from './evaluate.js';
import { orderMoves } from './ordering.js';

export const MATE_SCORE = 100000;

export interface MinimaxContext {
  nodes: number;
  aborted: boolean;
  now: () => number;
  isCancelled: () => boolean;
  deadlineMonoMs: number;
  repetitionCounts: Record<string, number>;
}

export interface MinimaxResult {
  score: number;
  bestMove: Move | null;
  pv: Move[];
}

/**
 * Negamax recursion without alpha-beta pruning.
 * Visits all legal branches up to depth.
 */
export function negamax(
  position: Position,
  depth: number,
  ply: number,
  ctx: MinimaxContext,
): MinimaxResult {
  ctx.nodes++;

  // Check cancellation / timeout every 64 nodes
  if ((ctx.nodes & 63) === 0) {
    if (ctx.isCancelled() || ctx.now() >= ctx.deadlineMonoMs) {
      ctx.aborted = true;
      return { score: 0, bestMove: null, pv: [] };
    }
  }

  // 1. Terminal / Repetition check
  const key = positionKey(position);
  const currentOccurrences = (ctx.repetitionCounts[key] ?? 0) + 1;

  // Repetition draw at current node (only for non-root nodes to avoid false root draws)
  if (ply > 0 && currentOccurrences >= 3) {
    return { score: 0, bestMove: null, pv: [] };
  }

  // Generate legal moves
  const legal = getLegalMoves(position);

  // Check terminal (checkmate or stalemate)
  if (legal.length === 0) {
    const outcome = getTerminalOutcome(position, currentOccurrences);
    if (outcome && outcome.winner !== null) {
      // Side to move loses → negative score, adjusted by distance from root
      return { score: -MATE_SCORE + ply, bestMove: null, pv: [] };
    }
    // Stalemate: in xiangqi, no moves = loss for side to move
    return { score: -MATE_SCORE + ply, bestMove: null, pv: [] };
  }

  // 2. Leaf evaluation
  if (depth <= 0) {
    return { score: evaluate(position), bestMove: null, pv: [] };
  }

  // 3. Search children
  const ordered = orderMoves(position, legal);
  let maxScore = -Infinity;
  let bestMove: Move | null = ordered[0] ?? null;
  let bestPv: Move[] = [];

  // Update repetition tracker for child calls
  ctx.repetitionCounts[key] = currentOccurrences;

  try {
    for (const move of ordered) {
      const nextPos = applyMove(position, move);
      const child = negamax(nextPos, depth - 1, ply + 1, ctx);

      if (ctx.aborted) break;

      const score = -child.score;
      if (score > maxScore) {
        maxScore = score;
        bestMove = move;
        bestPv = [move, ...child.pv];
      }
    }
  } finally {
    // Backtrack repetition count
    if (currentOccurrences === 1) {
      delete ctx.repetitionCounts[key];
    } else {
      ctx.repetitionCounts[key] = currentOccurrences - 1;
    }
  }

  return {
    score: maxScore === -Infinity ? 0 : maxScore,
    bestMove,
    pv: bestPv,
  };
}
