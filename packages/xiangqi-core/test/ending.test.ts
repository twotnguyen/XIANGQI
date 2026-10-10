import { describe, expect, it } from "vitest";
import { ending, isInCheck, legalMoves, playMove } from "../src/index.js";
import type { Position } from "../src/index.js";
import { fixture } from "./fixtures.js";

function historyAfter(
  initial: Position,
  moves: [number, number][],
): Position[] {
  const history = [initial];
  for (const [from, to] of moves) {
    history.push(playMove(history.at(-1)!, { from, to }));
  }
  return history;
}

const checkingCycle: [number, number][] = [
  [12, 13],
  [4, 3],
  [13, 12],
  [3, 4],
];
const quietCycle: [number, number][] = [
  [12, 21],
  [4, 5],
  [21, 12],
  [5, 4],
];
const mixedCycle: [number, number][] = [
  [12, 13],
  [4, 3],
  [13, 22],
  [3, 12],
  [22, 21],
  [12, 13],
  [21, 12],
  [13, 4],
];
function loopingPosition(halfmove = 0): Position {
  return fixture(
    [
      ["black", "king", 4, 0],
      ["red", "king", 4, 9],
      ["red", "rook", 3, 1],
      ["red", "pawn", 4, 5],
    ],
    "red",
    halfmove,
  );
}

describe("terminal position priority (AC-04.1.4/5/7/8)", () => {
  it("returns no ending for an unfinished position, including 119 no-capture plies", () => {
    expect(ending([])).toBeNull();
    expect(ending([loopingPosition(119)])).toBeNull();
  });

  it("adjudicates a general with no escapes and in check as checkmate, before 120 draw", () => {
    const position = fixture(
      [
        ["black", "king", 4, 0],
        ["red", "king", 4, 9],
        ["red", "rook", 3, 1],
        ["red", "rook", 5, 1],
        ["red", "pawn", 4, 1],
      ],
      "black",
      120,
    );
    expect(isInCheck(position, "black")).toBe(true);
    expect(legalMoves(position)).toEqual([]);
    expect(ending([position])).toEqual({ reason: "CHECKMATE", winner: "red" });
  });

  it("adjudicates no legal moves without check as a loss, before 120 draw", () => {
    const position = fixture(
      [
        ["black", "king", 4, 0],
        ["red", "king", 4, 9],
        ["red", "rook", 3, 1],
        ["red", "rook", 5, 1],
        ["red", "pawn", 4, 2],
      ],
      "black",
      120,
    );
    expect(isInCheck(position, "black")).toBe(false);
    expect(legalMoves(position)).toEqual([]);
    expect(ending([position])).toEqual({ reason: "STALEMATE", winner: "red" });
  });

  it("draws only when at least 120 consecutive non-capture plies remain on the branch", () => {
    expect(ending([loopingPosition(120)])).toEqual({
      reason: "DRAW_NO_CAPTURE",
      winner: null,
    });
    expect(ending([loopingPosition(121)])).toEqual({
      reason: "DRAW_NO_CAPTURE",
      winner: null,
    });
  });
});

describe("repetition on the supplied effective branch (BA 0.12, T10)", () => {
  it("draws at the third occurrence, ignoring counters but keeping turn in the identity", () => {
    const history = historyAfter(loopingPosition(), [
      ...quietCycle,
      ...quietCycle,
    ]);
    expect(ending(history.slice(0, 5))).toBeNull();
    expect(ending(history)).toEqual({
      reason: "DRAW_REPETITION",
      winner: null,
    });
    // Same board twice with red to move and once with black does not repeat three times.
    const board = loopingPosition();
    expect(
      ending([board, { ...board, turn: "black" }, { ...board, halfmove: 2 }]),
    ).toBeNull();
  });

  it("makes the side that checks on every own move in the entire cycle lose", () => {
    const history = historyAfter(loopingPosition(), [
      ...checkingCycle,
      ...checkingCycle,
    ]);
    expect(ending(history)).toEqual({
      reason: "PERPETUAL_CHECK",
      winner: "black",
    });
  });

  it("also makes Black lose for a continuous-check cycle", () => {
    const position = fixture(
      [
        ["red", "king", 4, 9],
        ["black", "king", 4, 0],
        ["black", "rook", 3, 8],
        ["black", "pawn", 4, 4],
      ],
      "black",
    );
    const cycle: [number, number][] = [
      [75, 76],
      [85, 84],
      [76, 75],
      [84, 85],
    ];
    expect(ending(historyAfter(position, [...cycle, ...cycle]))).toEqual({
      reason: "PERPETUAL_CHECK",
      winner: "red",
    });
  });

  it("prioritizes a perpetual-check loss over the simultaneous 120-ply draw", () => {
    const history = historyAfter(loopingPosition(112), [
      ...checkingCycle,
      ...checkingCycle,
    ]);
    expect(history.at(-1)?.halfmove).toBe(120);
    expect(ending(history)).toEqual({
      reason: "PERPETUAL_CHECK",
      winner: "black",
    });
  });

  it("examines first-to-third occurrence rather than only the last two", () => {
    const history = historyAfter(loopingPosition(), [
      ...mixedCycle,
      ...checkingCycle,
    ]);
    expect(ending(history)).toEqual({
      reason: "DRAW_REPETITION",
      winner: null,
    });
  });

  it("ignores earlier undone positions when the caller supplies a shortened effective branch", () => {
    const history = historyAfter(loopingPosition(), [
      ...checkingCycle,
      ...checkingCycle,
    ]);
    expect(ending(history.slice(0, 5))).toBeNull();
  });

  it("gives a draw when both sides check on every own move in the cycle", () => {
    // N leaves file 5: removes Black C's screen, becomes Red C's screen on file 3.
    // Black C enters file 3: second screen shields its K, reveals R's check on file 5.
    // N returns: blocks R's check, leaves Black C as Red C's sole screen on file 3.
    // Black C returns: removes Red C's screen, checks Red K using N as its screen.
    const initial = fixture([
      ["black", "king", 3, 0],
      ["black", "rook", 5, 2],
      ["black", "cannon", 5, 5],
      ["red", "king", 5, 9],
      ["red", "horse", 5, 6],
      ["red", "cannon", 3, 9],
    ]);
    const cycle: [number, number][] = [
      [59, 66],
      [50, 48],
      [66, 59],
      [48, 50],
    ];
    const history = historyAfter(initial, [...cycle, ...cycle]);
    for (const [index, position] of history.entries()) {
      const mover = position.turn === "red" ? "black" : "red";
      expect(isInCheck(position, position.turn)).toBe(true);
      expect(isInCheck(position, mover)).toBe(false);
      expect(legalMoves(position).length).toBeGreaterThan(0);
      if (index < 8) expect(ending(history.slice(0, index + 1))).toBeNull();
    }
    expect(history[4]?.board).toEqual(initial.board);
    expect(history[8]?.board).toEqual(initial.board);
    expect(history[4]?.turn).toBe("red");
    expect(history[8]?.turn).toBe("red");
    expect(history[8]?.halfmove).toBe(8);
    expect(ending(history)).toEqual({
      reason: "PERPETUAL_CHECK",
      winner: null,
    });
  });
});
