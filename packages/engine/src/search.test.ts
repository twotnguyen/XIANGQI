import { beforeEach, expect, it, vi } from "vitest";
import {
  ending,
  initialPosition,
  legalMoves,
  parsePosition,
  playMove,
  serializePosition,
  type Position,
} from "@xiangqi/xiangqi-core";
import { searchPosition } from "./search.js";
import { ENGINE_LIMITS, type EngineRequest } from "./contracts.js";
import { historyCases } from "./history.test-helper.js";
import mates from "../fixtures/mates.json";
import midgames from "../fixtures/midgames-50.json";
const calls = vi.hoisted(() => ({
  ending: 0,
  legal: new Map<string, number>(),
  existence: new Map<string, number>(),
}));
vi.mock("@xiangqi/xiangqi-core", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@xiangqi/xiangqi-core")>();
  return {
    ...actual,
    legalMoves(position: Position) {
      const key = actual
        .serializePosition(position)
        .split(" ")
        .slice(0, 2)
        .join(" ");
      calls.legal.set(key, (calls.legal.get(key) ?? 0) + 1);
      return actual.legalMoves(position);
    },
    pseudoLegalMoves(position: Position) {
      const key = actual
        .serializePosition(position)
        .split(" ")
        .slice(0, 2)
        .join(" ");
      calls.existence.set(key, (calls.existence.get(key) ?? 0) + 1);
      return actual.pseudoLegalMoves(position);
    },
    ending(history: readonly Position[]) {
      calls.ending++;
      return actual.ending(history);
    },
  };
});
beforeEach(() => {
  calls.ending = 0;
  calls.legal.clear();
  calls.existence.clear();
});
it("reuses core legal-board work across full-history branches without altering the searched tree", () => {
  const fixture = midgames.positions[0]!;
  const position = parsePosition(fixture.fen);
  const result = searchPosition(
    { position: fixture.fen, side: position.turn, level: "hard" },
    { depth: 3, now: () => 0 },
  );
  // Baseline exact full-width tree on the unchanged independently verified fixture.
  expect(result.completedDepth).toBe(3);
  expect(result.nodes).toBe(1773);
  expect(result.move).toEqual({ from: 60, to: 54 });
  expect(Math.max(...calls.legal.values())).toBe(1);
  expect(Math.max(...calls.existence.values())).toBe(1);
  expect(legalMoves(position)).toContainEqual(result.move);
});
it("reduces nodes on the verified fixed-depth workload without dropping legal moves", () => {
  const fixture = midgames.positions.find(
    (position) => position.id === "ccpd-midgame-00000001",
  )!;
  const position = parsePosition(fixture.fen);
  const result = searchPosition(
    { position: fixture.fen, side: position.turn, level: "hard" },
    { depth: 3, now: () => 0 },
  );
  expect(result.completedDepth).toBe(3);
  expect(result.timedOut).toBe(false);
  expect(legalMoves(position)).toContainEqual(result.move);
  // Stage1 without quiet cutoff ordering visits1799 nodes at this exact depth.
  // This deterministic workload check is not the 50-position timing gate.
  expect(result.nodes).toBeLessThan(1799);
});
it.each(mates.cases)(
  "chooses an independently verified winning key at full mate depth: $id",
  (fixture) => {
    const position = parsePosition(fixture.fen);
    const result = searchPosition(
      { position: fixture.fen, side: position.turn, level: "hard" },
      { depth: fixture.mateInPlies, now: () => 0 },
    );
    expect(result.completedDepth).toBe(fixture.mateInPlies);
    expect(fixture.winningKeys.map((key) => key.move)).toContainEqual(
      result.move,
    );
    expect(legalMoves(position)).toContainEqual(result.move);
  },
);
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
it("avoids full history adjudication at every opening node when no ending condition can exist", () => {
  const result = searchPosition(request(), { now: () => 0 });
  expect(result.completedDepth).toBe(2);
  expect(result.nodes).toBeGreaterThan(100);
  expect(legalMoves(initialPosition())).toContainEqual(result.move);
  // Each ending call scans all legal moves and the whole history. No opening
  // node at depth2 can repeat three times or reach the 120-halfmove threshold.
  expect(calls.ending).toBeLessThanOrEqual(1);
});
it("still finds checkmate on the same non-capture move that reaches halfmove120", () => {
  const position = parsePosition(mate.replace("0 1", "119 1"));
  const result = searchPosition(request(serializePosition(position)), {
    now: () => 0,
  });
  const child = playMove(position, result.move!);
  expect(child.halfmove).toBe(120);
  expect(ending([position, child])).toEqual({
    reason: "CHECKMATE",
    winner: "red",
  });
});
it.each([
  ["4k4/3RPR3/9/9/9/9/9/9/9/4K4 b - - 120 1", "CHECKMATE"],
  ["4k4/3R1R3/4P4/9/9/9/9/9/9/4K4 b - - 120 1", "STALEMATE"],
])("keeps %s loss ahead of the simultaneous no-capture draw", (fen, reason) => {
  const result = searchPosition({
    position: fen,
    side: "black",
    level: "easy",
  });
  expect(result.move).toBeNull();
  expect(result.terminal).toEqual({ reason, winner: "red" });
});
it("counts board plus side to move in actual legal odd-length cycles", () => {
  let position = parsePosition("4k4/3R5/9/9/9/4P4/9/9/3r5/4K4 w - - 0 1");
  const history = [serializePosition(position)];
  for (const [from, to] of [
    [12, 11],
    [75, 74],
    [11, 10],
    [74, 75],
    [10, 12],
    [75, 74],
    [12, 11],
    [74, 73],
    [11, 12],
    [73, 75],
  ]) {
    position = playMove(position, { from: from!, to: to! });
    history.push(serializePosition(position));
  }
  expect(history[0]!.split(" ")[0]).toBe(history[5]!.split(" ")[0]);
  expect(history[0]!.split(" ")[0]).toBe(history[10]!.split(" ")[0]);
  expect(parsePosition(history[5]!).turn).toBe("black");
  expect(position.turn).toBe("red");
  const result = searchPosition(
    {
      position: serializePosition(position),
      history,
      side: "red",
      level: "easy",
    },
    { now: () => 0, depth: 1 },
  );
  expect(result.terminal).toBeNull();
  expect(result.completedDepth).toBe(1);
  expect(legalMoves(position)).toContainEqual(result.move);
});
it.each(
  historyCases().filter(
    ({ terminal }) => terminal.reason === "PERPETUAL_CHECK",
  ),
)(
  "chooses the winning third-occurrence reply on the searched $name branch",
  ({ input, terminal }) => {
    const history = input.history!.slice(0, -1);
    const position = parsePosition(history.at(-1)!);
    const result = searchPosition(
      {
        ...input,
        position: serializePosition(position),
        side: position.turn,
        history,
      },
      { now: () => 0, depth: 1 },
    );
    expect(result.terminal).toBeNull();
    expect(result.completedDepth).toBe(1);
    expect(result.move).toEqual(
      position.turn === "black" ? { from: 3, to: 4 } : { from: 84, to: 85 },
    );
    expect(
      ending([...history.map(parsePosition), playMove(position, result.move!)]),
    ).toEqual(terminal);
  },
);
