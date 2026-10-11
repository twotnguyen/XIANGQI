import { describe, expect, it } from "vitest";
import * as core from "../src/index.js";

const opening =
  "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1";

describe("position representation and FEN (AC-04.1.9, T05)", () => {
  it("starts with 32 pieces, red to move and black on row zero", () => {
    expect(core.initialPosition).toBeTypeOf("function");
    const position = core.initialPosition();
    expect(position.board).toHaveLength(90);
    expect(position.board.filter(Boolean)).toHaveLength(32);
    expect(position.board[4]).toEqual({ side: "black", type: "king" });
    expect(position.board[85]).toEqual({ side: "red", type: "king" });
    expect(position.turn).toBe("red");
    expect(core.serializePosition(position)).toBe(opening);
  });

  it("returns independent initial boards", () => {
    const first = core.initialPosition();
    first.board[0] = null;
    expect(core.initialPosition().board[0]).toEqual({
      side: "black",
      type: "rook",
    });
  });

  it("reads a literal midgame FEN with turn and counters intact", () => {
    const fen = "4k4/9/9/9/4p4/9/9/9/3R5/4K4 b - - 119 53";
    const position = core.parsePosition(fen);
    expect(position.turn).toBe("black");
    expect(position.halfmove).toBe(119);
    expect(position.fullmove).toBe(53);
    expect(position.board[40]).toEqual({ side: "black", type: "pawn" });
    expect(position.board[75]).toEqual({ side: "red", type: "rook" });
    expect(core.serializePosition(position)).toBe(fen);
  });

  it.each([
    "9/9/9/9/9/9/9/9/9/9 w - - 0 1",
    "4k4/9/9/9/9/9/9/9/9/3KK4 w - - 0 1",
    "4k4/9/9/9/9/9/9/9/4K4 w - - 0 1",
    "4k4/9/9/9/9/9/9/9/9/4K5 w - - 0 1",
    "4k4/9/9/9/9/9/9/9/9/4X4 w - - 0 1",
    "4k4/9/9/9/9/9/9/9/9/4K4 x - - 0 1",
    "4k4/9/9/9/9/9/9/9/9/4K4 w - - -1 1",
    "4k4/9/9/9/9/9/9/9/9/4K4 w - - 0 0",
    "4k4/9/9/9/9/9/9/9/9/4K4 w - - 1.5 1",
    "4k4/9/9/9/9/9/9/9/9/4K4 w K - 0 1",
    "4k4/9/9/9/9/9/9/9/9/4K4 w - - 0",
  ])("rejects malformed or kingless FEN: %s", (fen) => {
    expect(() => core.parsePosition(fen)).toThrow("INVALID_POSITION");
  });
});
