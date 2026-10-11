import { expect, it } from "vitest";
import {
  ending,
  initialPosition,
  legalMoves,
  parsePosition,
  playMove,
  serializePosition,
} from "@xiangqi/xiangqi-core";
import { searchPosition } from "./search.js";
import { ENGINE_LIMITS, type EngineRequest } from "./contracts.js";
import { historyCases } from "./history.test-helper.js";
const mate = "4k4/3R1R3/4P4/9/9/9/9/9/9/4K4 w - - 0 1";
const request = (
  position = serializePosition(initialPosition()),
): EngineRequest => ({ position, side: "red", level: "easy" });
it("uses the three exact half-ply targets and budgets", () => {
  expect(ENGINE_LIMITS).toEqual({
    easy: { depth: 2, milliseconds: 300 },
    medium: { depth: 4, milliseconds: 1000 },
    hard: { depth: 6, milliseconds: 3000 },
  });
});
it("selects a mate-in-one with an independently verified terminal oracle", () => {
  const position = parsePosition(mate),
    result = searchPosition(request(mate));
  expect(result.move).not.toBeNull();
  expect(legalMoves(position)).toContainEqual(result.move);
  expect(ending([position, playMove(position, result.move!)])).toEqual({
    reason: "CHECKMATE",
    winner: "red",
  });
  expect(result.completedDepth).toBe(2);
});
it("returns terminal no-move results for checkmate and stalemate", () => {
  for (const [fen, reason] of [
    ["4k4/3RPR3/9/9/9/9/9/9/9/4K4 b - - 0 1", "CHECKMATE"],
    ["4k4/3R1R3/4P4/9/9/9/9/9/9/4K4 b - - 0 1", "STALEMATE"],
  ]) {
    const result = searchPosition({
      position: fen!,
      side: "black",
      level: "hard",
    });
    expect(result.move).toBeNull();
    expect(result.terminal).toEqual({ reason, winner: "red" });
    expect(result.completedDepth).toBe(0);
  }
});
it("preserves a legal fallback when no iteration fits and leaves input unchanged", () => {
  const input = Object.freeze(request()),
    before = JSON.stringify(input);
  let now = 0;
  const result = searchPosition(input, { now: () => (now += 1000) });
  expect(result.completedDepth).toBe(0);
  expect(result.timedOut).toBe(true);
  expect(legalMoves(parsePosition(input.position))).toContainEqual(result.move);
  expect(JSON.stringify(input)).toBe(before);
});
it("retains the best completed iteration when the next iteration times out", () => {
  const input = request(mate),
    first = searchPosition(input, { depth: 1 });
  let now = 0;
  const result = searchPosition(input, {
    now: () => now,
    onIteration: () => {
      now = 1000;
    },
  });
  expect(result.completedDepth).toBe(1);
  expect(result.move).toEqual(first.move);
  expect(result.timedOut).toBe(true);
});
it("rejects malformed positions, side mismatches and non-authoritative history endings", () => {
  for (const input of [
    request("bad"),
    { ...request(), side: "black" as const },
    { ...request(), level: "unknown" },
    { ...request(), history: [mate] },
  ])
    expect(() => searchPosition(input as EngineRequest)).toThrow(
      "ENGINE_INPUT_INVALID",
    );
});
it.each(historyCases())(
  "evaluates legal $name history before searching",
  ({ input, terminal }) => {
    expect(input.history).toHaveLength(9);
    expect(input.history![0]).not.toBe(input.history![8]);
    const before = JSON.stringify(input);
    const prefix = input.history!.slice(0, 5);
    expect(
      searchPosition({ ...input, position: prefix.at(-1)!, history: prefix })
        .terminal,
    ).toBeNull();
    const result = searchPosition(input);
    expect(result.move).toBeNull();
    expect(result.terminal).toEqual(terminal);
    expect(result.completedDepth).toBe(0);
    expect(JSON.stringify(input)).toBe(before);
  },
);
it("finds the sole legal escape for the black general", () => {
  const fen = "4k4/3R5/9/9/9/4P4/9/9/9/4K4 b - - 0 1";
  expect(legalMoves(parsePosition(fen))).toEqual([{ from: 4, to: 5 }]);
  expect(
    searchPosition({ position: fen, side: "black", level: "easy" }).move,
  ).toEqual({ from: 4, to: 5 });
});
it("reports actual completed hard depth on the small verified mate position", () => {
  const result = searchPosition({ ...request(mate), level: "hard" });
  expect(result.completedDepth).toBe(6);
  expect(result.targetDepth).toBe(6);
  expect(result.timedOut).toBe(false);
  expect(
    ending([parsePosition(mate), playMove(parsePosition(mate), result.move!)]),
  ).toEqual({ reason: "CHECKMATE", winner: "red" });
});
it("does not restart a full budget after an already-expired shared worker deadline", () => {
  const input = request();
  const result = searchPosition(input, { now: () => 1000, deadline: 500 });
  expect(result.completedDepth).toBe(0);
  expect(result.timedOut).toBe(true);
  expect(legalMoves(parsePosition(input.position))).toContainEqual(result.move);
});
