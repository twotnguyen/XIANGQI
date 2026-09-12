/**
 * Search coordinator — entrypoint for AI move selection.
 * Supports MINIMAX baseline (ISSUE-019) and ALPHA_BETA (ISSUE-020).
 */
import type { SearchInput, SearchResult, Move } from '@xiangqi/contracts';
import { getLegalMoves } from '@xiangqi/game-rules';
import { negamax, type MinimaxContext } from './minimax.js';
import { orderMoves } from './ordering.js';

export function searchBestMove(
  input: SearchInput,
  now: () => number,
  isCancelled: () => boolean,
): SearchResult {
  const startTime = now();

  // Fast check: no legal moves at root
  const legal = getLegalMoves(input.position);
  if (legal.length === 0) {
    return {
      move: null,
      score: -100000,
      nodes: 1,
      completedDepth: 0,
      elapsedMs: now() - startTime,
      pv: [],
      aborted: false,
    };
  }

  // Legal fallback in case search is aborted before depth 1 completes
  const orderedRoot = orderMoves(input.position, legal);
  const fallbackMove: Move | null = orderedRoot[0] ?? null;

  // Clone repetition counts so search doesn't mutate caller's state
  const repCounts: Record<string, number> = { ...input.repetitionCounts };

  const ctx: MinimaxContext = {
    nodes: 0,
    aborted: false,
    now,
    isCancelled,
    deadlineMonoMs: input.deadlineMonoMs,
    repetitionCounts: repCounts,
  };

  let bestMove: Move | null = fallbackMove;
  let bestScore = 0;
  let bestPv: Move[] = [];
  let completedDepth = 0;

  if (input.algorithm === 'MINIMAX') {
    const result = negamax(input.position, input.maxDepth, 0, ctx);
    if (!ctx.aborted && result.bestMove) {
      bestMove = result.bestMove;
      bestScore = result.score;
      bestPv = result.pv;
      completedDepth = input.maxDepth;
    }
  } else {
    // ALPHA_BETA placeholder — implemented in ISSUE-020
    // Falls back to MINIMAX for now if invoked
    const result = negamax(input.position, input.maxDepth, 0, ctx);
    if (!ctx.aborted && result.bestMove) {
      bestMove = result.bestMove;
      bestScore = result.score;
      bestPv = result.pv;
      completedDepth = input.maxDepth;
    }
  }

  const elapsedMs = now() - startTime;

  return {
    move: bestMove,
    score: bestScore,
    nodes: ctx.nodes,
    completedDepth,
    elapsedMs,
    pv: bestPv,
    aborted: ctx.aborted,
  };
}
