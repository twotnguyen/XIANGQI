import {
  ending,
  legalMoves,
  parsePosition,
  playMove,
  serializePosition,
  type Move,
  type PieceType,
  type Position,
} from "@xiangqi/xiangqi-core";
import {
  ENGINE_LIMITS,
  EngineError,
  type EngineRequest,
  type EngineResult,
} from "./contracts.js";
const values: Record<PieceType, number> = {
  king: 0,
  advisor: 120,
  elephant: 120,
  horse: 400,
  rook: 900,
  cannon: 450,
  pawn: 100,
};
const MATE = 100000;
const expired = Symbol("search deadline");
export interface SearchOptions {
  now?: () => number;
  depth?: number;
  onIteration?: (depth: number) => void;
  deadline?: number;
}
/** Validate at the worker boundary too. Histories belong to server AI state. */
export function readRequest(request: EngineRequest) {
  try {
    const { position, side, level, history: suppliedHistory } = request;
    if (
      !Object.hasOwn(ENGINE_LIMITS, level) ||
      !["red", "black"].includes(side)
    )
      throw Error();
    const current = parsePosition(position);
    if (current.turn !== side) throw Error();
    const history = suppliedHistory?.map(parsePosition) ?? [current];
    if (
      !history.length ||
      serializePosition(history.at(-1)!) !== serializePosition(current)
    )
      throw Error();
    const input: EngineRequest = {
      position: serializePosition(current),
      side: current.turn,
      level,
      ...(suppliedHistory === undefined
        ? {}
        : { history: history.map(serializePosition) }),
    };
    return { current, history, limits: ENGINE_LIMITS[level], input };
  } catch {
    throw new EngineError("ENGINE_INPUT_INVALID");
  }
}
function evaluate(position: Position) {
  let score = 0;
  for (let index = 0; index < 90; index++) {
    const piece = position.board[index];
    if (!piece) continue;
    const y = Math.floor(index / 9),
      x = index % 9,
      advancement = piece.side === "red" ? 9 - y : y;
    let bonus = 0;
    if (piece.type === "pawn")
      bonus = advancement * 12 + (advancement >= 5 ? 60 : 0);
    if (piece.type === "horse" || piece.type === "cannon")
      bonus = (4 - Math.abs(x - 4)) * 8;
    score +=
      (piece.side === position.turn ? 1 : -1) * (values[piece.type] + bonus);
  }
  return score;
}
function same(a: Move, b: Move | undefined) {
  return b && a.from === b.from && a.to === b.to;
}
function ordered(position: Position, moves: Move[], preferred?: Move) {
  const priority = (move: Move) =>
    same(move, preferred)
      ? 100000
      : position.board[move.to]
        ? 10 * values[position.board[move.to]!.type] -
          values[position.board[move.from]!.type]
        : 0;
  return moves.sort(
    (a, b) => priority(b) - priority(a) || a.from - b.from || a.to - b.to,
  );
}
type Entry = {
  depth: number;
  score: number;
  bound: "exact" | "lower" | "upper";
  move: Move;
};
/** Synchronous kernel: invoke in EngineWorker, never from a room request handler. */
export function searchPosition(
  request: EngineRequest,
  options: SearchOptions = {},
): EngineResult {
  const { current, history, limits } = readRequest(request);
  const now = options.now ?? (() => performance.now()),
    start = now(),
    deadline = Math.min(
      start + limits.milliseconds,
      options.deadline ?? Infinity,
    );
  const targetDepth = options.depth ?? limits.depth;
  if (
    !Number.isInteger(targetDepth) ||
    targetDepth < 1 ||
    targetDepth > limits.depth
  )
    throw new EngineError("ENGINE_INPUT_INVALID");
  const terminal = ending(history);
  let nodes = 0,
    completedDepth = 0,
    timedOut = false;
  const initial = ordered(current, legalMoves(current));
  let bestMove = terminal ? null : (initial[0] ?? null);
  const table = new Map<string, Entry>();
  function check() {
    if (now() >= deadline) throw expired;
  }
  function negamax(
    branch: Position[],
    depth: number,
    alpha: number,
    beta: number,
    ply: number,
  ): { score: number; move?: Move } {
    check();
    nodes++;
    const position = branch.at(-1)!,
      result = ending(branch);
    if (result)
      return {
        score:
          result.winner === null
            ? 0
            : result.winner === position.turn
              ? (result.reason === "CHECKMATE" ? MATE : MATE - 10) - ply
              : -(result.reason === "CHECKMATE" ? MATE : MATE - 10) + ply,
      };
    if (depth === 0) return { score: evaluate(position) };
    // Full branch/counters are deliberately included: different repetition/check histories cannot share a bound.
    const key = branch.map(serializePosition).join("|"),
      cached = table.get(key),
      originalAlpha = alpha,
      originalBeta = beta;
    if (cached && cached.depth >= depth) {
      if (cached.bound === "exact")
        return { score: cached.score, move: cached.move };
      if (cached.bound === "lower") alpha = Math.max(alpha, cached.score);
      else beta = Math.min(beta, cached.score);
      if (alpha >= beta) return { score: cached.score, move: cached.move };
    }
    let score = -Infinity,
      move: Move | undefined;
    for (const candidate of ordered(
      position,
      legalMoves(position),
      cached?.move,
    )) {
      check();
      const child = playMove(position, candidate);
      const value = -negamax(
        [...branch, child],
        depth - 1,
        -beta,
        -alpha,
        ply + 1,
      ).score;
      if (value > score) {
        score = value;
        move = candidate;
      }
      alpha = Math.max(alpha, value);
      if (alpha >= beta) break;
    }
    check();
    if (move && table.size < 50000)
      table.set(key, {
        depth,
        score,
        move,
        bound:
          score <= originalAlpha
            ? "upper"
            : score >= originalBeta
              ? "lower"
              : "exact",
      });
    return { score, ...(move ? { move } : {}) };
  }
  if (!terminal) {
    for (let depth = 1; depth <= targetDepth; depth++) {
      try {
        const result = negamax(history, depth, -Infinity, Infinity, 0);
        check();
        if (result.move) bestMove = result.move;
        completedDepth = depth;
        options.onIteration?.(depth);
      } catch (error) {
        if (error !== expired) throw error;
        timedOut = true;
        break;
      }
    }
  }
  return {
    move: bestMove,
    terminal,
    completedDepth,
    targetDepth,
    elapsedMs: Math.max(0, now() - start),
    nodes,
    timedOut,
  };
}
