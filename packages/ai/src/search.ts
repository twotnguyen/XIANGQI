/**
 * Alpha-Beta search with iterative deepening, PV ordering, and time management.
 * Preserves Minimax baseline alongside Alpha-Beta for comparison.
 */
import type { SearchInput, SearchResult, Move, Position } from '@xiangqi/contracts';
import {
  getLegalMoves, applyMove, getTerminalOutcome, positionKey,
} from '@xiangqi/game-rules';
import { evaluate } from './evaluate.js';
import { orderMoves } from './ordering.js';
import { negamax, type MinimaxContext, MATE_SCORE } from './minimax.js';

export interface AlphaBetaContext extends MinimaxContext {
  pvTable: Map<string, Move>;
}

export interface SearchNodeResult {
  score: number;
  bestMove: Move | null;
  pv: Move[];
}

/**
 * Alpha-Beta search using Negamax formulation.
 */
export function alphaBeta(
  position: Position,
  depth: number,
  ply: number,
  alpha: number,
  beta: number,
  ctx: AlphaBetaContext,
): SearchNodeResult {
  ctx.nodes++;

  // Check cancellation / timeout every 64 nodes
  if ((ctx.nodes & 63) === 0) {
    if (ctx.isCancelled() || ctx.now() >= ctx.deadlineMonoMs) {
      ctx.aborted = true;
      return { score: 0, bestMove: null, pv: [] };
    }
  }

  // 1. Repetition check (non-root)
  const key = positionKey(position);
  const currentOccurrences = (ctx.repetitionCounts[key] ?? 0) + 1;

  if (ply > 0 && currentOccurrences >= 3) {
    return { score: 0, bestMove: null, pv: [] };
  }

  // 2. Generate legal moves
  const legal = getLegalMoves(position);

  // Check terminal
  if (legal.length === 0) {
    const outcome = getTerminalOutcome(position, currentOccurrences);
    if (outcome && outcome.winner !== null) {
      return { score: -MATE_SCORE + ply, bestMove: null, pv: [] };
    }
    return { score: -MATE_SCORE + ply, bestMove: null, pv: [] };
  }

  // 3. Leaf evaluation
  if (depth <= 0) {
    return { score: evaluate(position), bestMove: null, pv: [] };
  }

  // 4. Move ordering with PV bias
  let ordered = orderMoves(position, legal);
  const pvMove = ctx.pvTable.get(key);
  if (pvMove) {
    // Put PV move first if it's in the legal set
    const pvIdx = ordered.findIndex(
      (m) => m.from.x === pvMove.from.x && m.from.y === pvMove.from.y &&
             m.to.x === pvMove.to.x && m.to.y === pvMove.to.y,
    );
    if (pvIdx > 0) {
      const [first] = ordered.splice(pvIdx, 1);
      ordered = [first!, ...ordered];
    }
  }

  let bestMove: Move | null = ordered[0] ?? null;
  let bestPv: Move[] = [];
  let currentAlpha = alpha;

  ctx.repetitionCounts[key] = currentOccurrences;

  try {
    for (const move of ordered) {
      const nextPos = applyMove(position, move);
      const child = alphaBeta(
        nextPos,
        depth - 1,
        ply + 1,
        -beta,
        -currentAlpha,
        ctx,
      );

      if (ctx.aborted) break;

      const score = -child.score;

      if (score > currentAlpha) {
        currentAlpha = score;
        bestMove = move;
        bestPv = [move, ...child.pv];

        // Alpha-beta cutoff (beta pruning)
        if (currentAlpha >= beta) {
          break; // Fail-high cutoff
        }
      }
    }
  } finally {
    if (currentOccurrences === 1) {
      delete ctx.repetitionCounts[key];
    } else {
      ctx.repetitionCounts[key] = currentOccurrences - 1;
    }
  }

  // Store best move in PV table if not aborted
  if (!ctx.aborted && bestMove) {
    ctx.pvTable.set(key, bestMove);
  }

  return {
    score: currentAlpha,
    bestMove,
    pv: bestPv,
  };
}

/**
 * Coordinate search: dispatch between MINIMAX and ALPHA_BETA.
 * When ALPHA_BETA is selected, runs iterative deepening from depth 1 to maxDepth.
 */
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
      score: -MATE_SCORE,
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

  const repCounts: Record<string, number> = { ...input.repetitionCounts };

  if (input.algorithm === 'MINIMAX') {
    // Single-pass Minimax baseline (no alpha-beta pruning, no iterative deepening)
    const ctx: MinimaxContext = {
      nodes: 0,
      aborted: false,
      now,
      isCancelled,
      deadlineMonoMs: input.deadlineMonoMs,
      repetitionCounts: repCounts,
    };

    const result = negamax(input.position, input.maxDepth, 0, ctx);
    const elapsedMs = now() - startTime;

    return {
      move: result.bestMove ?? fallbackMove,
      score: result.score,
      nodes: ctx.nodes,
      completedDepth: ctx.aborted ? 0 : input.maxDepth,
      elapsedMs,
      pv: result.pv,
      aborted: ctx.aborted,
    };
  }

  // ── ALPHA_BETA with Iterative Deepening ──────────────────
  const ctx: AlphaBetaContext = {
    nodes: 0,
    aborted: false,
    now,
    isCancelled,
    deadlineMonoMs: input.deadlineMonoMs,
    repetitionCounts: repCounts,
    pvTable: new Map(),
  };

  let bestMove: Move | null = fallbackMove;
  let bestScore = 0;
  let bestPv: Move[] = [];
  let completedDepth = 0;

  for (let d = 1; d <= input.maxDepth; d++) {
    // Check timeout before starting new iteration
    if (now() >= input.deadlineMonoMs || isCancelled()) {
      break;
    }

    const iterationResult = alphaBeta(
      input.position,
      d,
      0,
      -Infinity,
      Infinity,
      ctx,
    );

    // Only commit results from fully completed iterations
    if (ctx.aborted) {
      break;
    }

    if (iterationResult.bestMove) {
      bestMove = iterationResult.bestMove;
      bestScore = iterationResult.score;
      bestPv = iterationResult.pv;
      completedDepth = d;
    }

    // Early exit if mate found
    if (Math.abs(bestScore) >= MATE_SCORE - 100) {
      break;
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
