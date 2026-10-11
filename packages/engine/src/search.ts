import {
  ending,
  legalMoves,
  parsePosition,
  playMove,
  pseudoLegalMoves,
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
function moveKey(position: Position, move: Move): string {
  return position.turn + ":" + move.from + ":" + move.to;
}
function ordered(
  position: Position,
  moves: Move[],
  preferred?: Move,
  killers: readonly Move[] = [],
  history?: ReadonlyMap<string, number>,
) {
  const priority = (move: Move) =>
    same(move, preferred)
      ? 1e9
      : position.board[move.to]
        ? 1e8 +
          10 * values[position.board[move.to]!.type] -
          values[position.board[move.from]!.type]
        : same(move, killers[0])
          ? 1e7
          : same(move, killers[1])
            ? 9e6
            : (history?.get(moveKey(position, move)) ?? 0);
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
  const killers = new Map<number, Move[]>();
  const cutoffHistory = new Map<string, number>();
  const serialized = history.map(serializePosition);
  const identity = (fen: string) => fen.split(" ").slice(0, 2).join(" ");
  const occurrences = new Map<string, number>();
  for (const fen of serialized) {
    const key = identity(fen);
    occurrences.set(key, (occurrences.get(key) ?? 0) + 1);
  }
  function hasLegalMove(position: Position): boolean {
    for (const candidate of pseudoLegalMoves(position)) {
      try {
        playMove(position, candidate);
        return true;
      } catch (error) {
        if (!(error instanceof Error) || error.message !== "ILLEGAL_MOVE")
          throw error;
      }
    }
    return false;
  }
  function check() {
    if (now() >= deadline) throw expired;
  }
  function negamax(
    branch: Position[],
    key: string,
    positionIdentity: string,
    depth: number,
    alpha: number,
    beta: number,
    ply: number,
  ): { score: number; move?: Move } {
    check();
    nodes++;
    const position = branch.at(-1)!;
    let result =
      (occurrences.get(positionIdentity) ?? 0) >= 3 || position.halfmove >= 120
        ? ending(branch)
        : null;
    let moves: Move[] = [];
    if (!result) {
      if (depth === 0) {
        // Leaves need existence, not every legal move. Use the same public
        // core pipeline; never bypass king-capture or self-check validation.
        if (!hasLegalMove(position)) result = ending(branch);
      } else {
        moves = ply === 0 ? initial : legalMoves(position);
        if (moves.length === 0) result = ending(branch);
      }
    }
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
    const cached = table.get(key),
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
      moves,
      cached?.move,
      killers.get(ply),
      cutoffHistory,
    )) {
      check();
      const child = playMove(position, candidate);
      const childFen = serializePosition(child),
        childIdentity = identity(childFen);
      const previous = occurrences.get(childIdentity) ?? 0;
      occurrences.set(childIdentity, previous + 1);
      branch.push(child);
      let value: number;
      try {
        value = -negamax(
          branch,
          key + "|" + childFen,
          childIdentity,
          depth - 1,
          -beta,
          -alpha,
          ply + 1,
        ).score;
      } finally {
        branch.pop();
        if (previous === 0) occurrences.delete(childIdentity);
        else occurrences.set(childIdentity, previous);
      }
      if (value > score) {
        score = value;
        move = candidate;
      }
      alpha = Math.max(alpha, value);
      if (alpha >= beta) {
        if (!position.board[candidate.to]) {
          const previousKillers = killers.get(ply) ?? [];
          if (!same(candidate, previousKillers[0])) {
            killers.set(
              ply,
              [
                candidate,
                ...previousKillers.filter((move) => !same(candidate, move)),
              ].slice(0, 2),
            );
          }
          const historyKey = moveKey(position, candidate);
          cutoffHistory.set(
            historyKey,
            Math.min(1e6, (cutoffHistory.get(historyKey) ?? 0) + depth * depth),
          );
        }
        break;
      }
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
        const result = negamax(
          history,
          serialized.join("|"),
          identity(serialized.at(-1)!),
          depth,
          -Infinity,
          Infinity,
          0,
        );
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
