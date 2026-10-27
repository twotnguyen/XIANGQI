import { describe, expect, it } from "vitest";
import {
  buildPgn,
  fenAt,
  pgnResult,
  squareName,
  type ReplayExportSource,
} from "@shared/replay-export.js";

const source: ReplayExportSource = {
  id: "11111111-1111-4111-8111-111111111111",
  mode: "CASUAL",
  side: "red",
  positions: [
    {
      fen: "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1",
      turn: "red",
    },
    {
      fen: "rnbakabnr/9/1c5c1/p1p1p1p1p/9/P8/2P1P1P1P/1C5C1/9/RNBAKABNR b - - 1 1",
      turn: "black",
    },
    {
      fen: "rnbakabnr/9/1c5c1/2p1p1p1p/p8/P8/2P1P1P1P/1C5C1/9/RNBAKABNR w - - 2 2",
      turn: "red",
    },
  ],
  moves: [
    { from: 54, to: 45, side: "red" },
    { from: 27, to: 36, side: "black" },
  ],
  result: { reason: "CHECKMATE", winner: "red" },
};

describe("replay export", () => {
  it("names squares in ICCS coordinates and returns FEN at a ply", () => {
    expect(squareName(0)).toBe("a9");
    expect(squareName(4)).toBe("e9");
    expect(squareName(85)).toBe("e0");
    expect(squareName(89)).toBe("i0");
    expect(fenAt(source, 0)).toBe(source.positions[0]!.fen);
    expect(fenAt(source, 2)).toBe(source.positions[2]!.fen);
    expect(() => fenAt(source, 3)).toThrow();
    expect(() => fenAt(source, -1)).toThrow();
  });
  it("builds a re-readable PGN with headers, move text and result", () => {
    const pgn = buildPgn(source);
    const lines = pgn.split("\n");
    expect(lines).toContain('[Variant "Xiangqi"]');
    expect(lines).toContain(`[FEN "${source.positions[0]!.fen}"]`);
    expect(lines).toContain('[Result "1-0"]');
    expect(pgn).toContain("1. a3a4 a6a5");
    expect(pgn.trimEnd().endsWith("1-0")).toBe(true);
    expect(pgn.endsWith("\n")).toBe(true);
  });
  it("maps draw and unfinished outcomes", () => {
    expect(
      pgnResult({ ...source, result: { reason: "DRAW", winner: null } }),
    ).toBe("1/2-1/2");
    expect(
      pgnResult({ ...source, result: { reason: "TIMEOUT", winner: "black" } }),
    ).toBe("0-1");
    expect(pgnResult({ ...source, result: undefined })).toBe("*");
  });
  it.each(["SERVER_RESTART", "BOTH_OFFLINE", "AI_UNAVAILABLE"])(
    "exports %s as an unfinished game, not a draw",
    (reason) => {
      const interrupted = {
        ...source,
        result: { reason, winner: null },
      };
      expect(pgnResult(interrupted)).toBe("*");
      const pgn = buildPgn(interrupted);
      expect(pgn).toContain('[Result "*"]');
      expect(pgn.trimEnd().endsWith("*")).toBe(true);
    },
  );
  it("accepts display labels but keeps a portable fallback", () => {
    const pgn = buildPgn(source, ["Pháo 2 bình 5", ""]);
    expect(pgn).toContain("1. Pháo 2 bình 5 a6a5");
  });
});
