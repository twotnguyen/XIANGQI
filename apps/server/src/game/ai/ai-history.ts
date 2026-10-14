import { createHash } from "node:crypto";
import { ENGINE_LIMITS } from "@xiangqi/engine";
import {
  ending,
  initialPosition,
  parsePosition,
  playMove,
  serializePosition,
  type Move,
  type Position,
} from "@xiangqi/xiangqi-core";
import { uuid } from "../match/position-codec.js";
import type { AiSnapshot } from "./ai-games.js";
function invalid(): never {
  throw new Error("AI_HISTORY_INVALID");
}
/** Validates the server-owned effective branch before any durable history write. */
export function prepareAiHistory(snapshot: AiSnapshot) {
  if (
    !uuid.test(snapshot.id) ||
    !uuid.test(snapshot.ownerId) ||
    !["red", "black"].includes(snapshot.actualSide) ||
    !["red", "black", "random"].includes(snapshot.requestedSide) ||
    (snapshot.requestedSide !== "random" &&
      snapshot.requestedSide !== snapshot.actualSide) ||
    !Object.hasOwn(ENGINE_LIMITS, snapshot.level) ||
    !["FINISHED", "ABANDONED"].includes(snapshot.status) ||
    snapshot.engineState !== "IDLE" ||
    snapshot.engineError !== null ||
    !snapshot.outcome ||
    !Array.isArray(snapshot.history) ||
    !snapshot.history.length ||
    !Number.isSafeInteger(snapshot.version) ||
    snapshot.version <= snapshot.history.length ||
    snapshot.history[0] !== serializePosition(initialPosition()) ||
    snapshot.history.at(-1) !== snapshot.position
  )
    invalid();
  const positions: Position[] = [],
    moves: Move[] = [];
  for (const fen of snapshot.history) {
    let position: Position;
    try {
      position = parsePosition(fen);
    } catch {
      return invalid();
    }
    if (serializePosition(position) !== fen) invalid();
    if (positions.length) {
      const prior = positions.at(-1)!;
      if (ending(positions)) invalid();
      const source = prior.board.flatMap((piece, i) =>
        piece?.side === prior.turn && !position.board[i] ? [i] : [],
      );
      if (source.length !== 1) invalid();
      const from = source[0]!,
        piece = prior.board[from]!;
      const destinations = position.board.flatMap((next, i) =>
        next?.side === piece.side &&
        next.type === piece.type &&
        (prior.board[i]?.side !== next.side ||
          prior.board[i]?.type !== next.type)
          ? [i]
          : [],
      );
      if (destinations.length !== 1) invalid();
      const move = { from, to: destinations[0]! };
      try {
        if (serializePosition(playMove(prior, move)) !== fen) invalid();
      } catch {
        return invalid();
      }
      moves.push(move);
    }
    positions.push(position);
  }
  const outcome = snapshot.outcome;
  if (snapshot.status === "ABANDONED") {
    if (
      outcome.reason !== "ENGINE_FAILURE" ||
      outcome.winner !== null ||
      ending(positions)
    )
      invalid();
  } else if (outcome.reason === "RESIGN") {
    if (
      outcome.winner !== (snapshot.actualSide === "red" ? "black" : "red") ||
      ending(positions)
    )
      invalid();
  } else {
    const expected = ending(positions);
    if (
      !expected ||
      expected.reason !== outcome.reason ||
      expected.winner !== outcome.winner
    )
      invalid();
  }
  const dbOutcome = {
    reason:
      outcome.reason === "ENGINE_FAILURE" ? "AI_UNAVAILABLE" : outcome.reason,
    winner:
      outcome.winner === null
        ? null
        : outcome.winner === "red"
          ? "RED"
          : "BLACK",
  };
  const fingerprint = createHash("sha256")
    .update(
      JSON.stringify({
        id: snapshot.id,
        ownerId: snapshot.ownerId,
        requestedSide: snapshot.requestedSide,
        actualSide: snapshot.actualSide,
        level: snapshot.level,
        version: snapshot.version,
        status: snapshot.status,
        history: snapshot.history,
        outcome: dbOutcome,
      }),
    )
    .digest("hex");
  return {
    positions,
    moves,
    outcome: dbOutcome,
    status: snapshot.status === "ABANDONED" ? "INTERRUPTED" : "FINISHED",
    fingerprint,
  };
}
