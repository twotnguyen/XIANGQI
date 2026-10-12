import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import {
  initialPosition,
  parsePosition,
  playMove,
  serializePosition,
} from "@xiangqi/xiangqi-core";
import type { AiSnapshot } from "./ai-games.js";
import { prepareAiHistory } from "./ai-history.js";
function snapshot(): AiSnapshot {
  const start = initialPosition();
  const next = playMove(start, { from: 54, to: 45 });
  return {
    id: randomUUID(),
    ownerId: randomUUID(),
    requestedSide: "random",
    actualSide: "red",
    level: "easy",
    position: serializePosition(next),
    history: [serializePosition(start), serializePosition(next)],
    version: 3,
    status: "FINISHED",
    engineState: "IDLE",
    engineError: null,
    outcome: { reason: "RESIGN", winner: "black" },
  };
}
describe("AI terminal effective history", () => {
  it("encodes the legal effective branch using the existing database move and position formats", () => {
    const game = snapshot(),
      history = prepareAiHistory(game);
    expect(history.moves).toEqual([{ from: 54, to: 45 }]);
    expect(history.positions).toHaveLength(2);
    expect(history.outcome).toEqual({ reason: "RESIGN", winner: "BLACK" });
    expect(history.status).toBe("FINISHED");
    expect(history.fingerprint).toMatch(/^[a-f0-9]{64}$/);
    expect(prepareAiHistory(structuredClone(game)).fingerprint).toBe(
      history.fingerprint,
    );
  });
  it.each(["ACTIVE", "FINALIZING"] as const)(
    "refuses %s before durable finalization",
    (status) => {
      expect(() => prepareAiHistory({ ...snapshot(), status })).toThrow(
        "AI_HISTORY_INVALID",
      );
    },
  );
  it("rejects a human resignation awarding the human a win", () => {
    expect(() =>
      prepareAiHistory({
        ...snapshot(),
        outcome: { reason: "RESIGN", winner: "red" },
      }),
    ).toThrow("AI_HISTORY_INVALID");
  });
  it("rejects a fabricated core terminal result in an active opening", () => {
    expect(() =>
      prepareAiHistory({
        ...snapshot(),
        outcome: { reason: "CHECKMATE", winner: "red" },
      }),
    ).toThrow("AI_HISTORY_INVALID");
  });
  it("maps a real engine failure to a neutral interrupted database outcome", () => {
    const history = prepareAiHistory({
      ...snapshot(),
      status: "ABANDONED",
      outcome: { reason: "ENGINE_FAILURE", winner: null },
    });
    expect(history.status).toBe("INTERRUPTED");
    expect(history.outcome).toEqual({ reason: "AI_UNAVAILABLE", winner: null });
  });
  it("rejects mismatched final FEN and an illegal or edited effective transition", () => {
    const game = snapshot();
    expect(() =>
      prepareAiHistory({ ...game, position: game.history[0]! }),
    ).toThrow("AI_HISTORY_INVALID");
    expect(() =>
      prepareAiHistory({
        ...game,
        history: [game.history[0]!, game.history[0]!],
      }),
    ).toThrow("AI_HISTORY_INVALID");
    const position = parsePosition(game.position);
    const edited = serializePosition({
      ...position,
      halfmove: position.halfmove + 1,
    });
    expect(edited).not.toBe(game.position);
    expect(() =>
      prepareAiHistory({
        ...game,
        position: edited,
        history: [game.history[0]!, edited],
      }),
    ).toThrow("AI_HISTORY_INVALID");
  });
  it("rejects a custom start, unsafe versions and terminal engine activity", () => {
    const game = snapshot();
    for (const patch of [
      { history: [game.position] },
      { version: 1 },
      { engineState: "THINKING" as const },
      { engineError: "ENGINE_BUSY" as const },
      { ownerId: "foreign text" },
    ])
      expect(() => prepareAiHistory({ ...game, ...patch })).toThrow(
        "AI_HISTORY_INVALID",
      );
  });
  it("fingerprints distinct outcomes and effective branches without mutating the supplied snapshot", () => {
    const game = snapshot(),
      before = structuredClone(game);
    const other = {
      ...game,
      status: "ABANDONED" as const,
      outcome: { reason: "ENGINE_FAILURE" as const, winner: null },
    };
    expect(prepareAiHistory(other).fingerprint).not.toBe(
      prepareAiHistory(game).fingerprint,
    );
    expect(game).toEqual(before);
  });
});

it("rejects explicit side metadata that disagrees with the actual side", () => {
  expect(() =>
    prepareAiHistory({ ...snapshot(), requestedSide: "black" }),
  ).toThrow("AI_HISTORY_INVALID");
});
