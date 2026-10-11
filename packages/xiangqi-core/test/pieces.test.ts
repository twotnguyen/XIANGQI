import { describe, expect, it } from "vitest";
import { pseudoLegalMoves } from "../src/index.js";
import type { Position } from "../src/index.js";
import { fixture, square } from "./fixtures.js";

function targets(position: Position, x: number, y: number): number[] {
  return pseudoLegalMoves(position)
    .filter((move) => move.from === square(x, y))
    .map((move) => move.to)
    .sort((a, b) => a - b);
}

describe("seven pieces (T05 / AC-04.1.2)", () => {
  it("confines each general to its palace and cannot capture its own piece", () => {
    expect(
      targets(
        fixture([
          ["red", "king", 4, 9],
          ["red", "advisor", 3, 9],
          ["black", "rook", 5, 9],
        ]),
        4,
        9,
      ),
    ).toEqual([76, 86]);
    expect(targets(fixture([["black", "king", 3, 0]], "black"), 3, 0)).toEqual([
      4, 12,
    ]);
  });

  it("moves advisors one diagonal step inside the correct palace", () => {
    expect(targets(fixture([["red", "advisor", 4, 8]]), 4, 8)).toEqual([
      66, 68, 84, 86,
    ]);
    expect(
      targets(
        fixture(
          [
            ["black", "advisor", 3, 0],
            ["red", "rook", 4, 1],
          ],
          "black",
        ),
        3,
        0,
      ),
    ).toEqual([13]);
    expect(
      targets(
        fixture([
          ["red", "advisor", 3, 9],
          ["red", "king", 4, 8],
        ]),
        3,
        9,
      ),
    ).toEqual([]);
  });

  it("blocks the elephant eye, forbids crossing the river, and permits capture", () => {
    expect(
      targets(
        fixture([
          ["red", "elephant", 4, 7],
          ["red", "pawn", 3, 6],
          ["black", "horse", 6, 5],
          ["red", "advisor", 2, 9],
        ]),
        4,
        7,
      ),
    ).toEqual([51, 87]);
    expect(targets(fixture([["red", "elephant", 4, 5]]), 4, 5)).toEqual([
      65, 69,
    ]);
    expect(
      targets(fixture([["black", "elephant", 4, 4]], "black"), 4, 4),
    ).toEqual([20, 24]);
    expect(
      targets(fixture([["black", "elephant", 2, 0]], "black"), 2, 0),
    ).toEqual([18, 22]);
  });

  it("blocks horse legs independently, captures enemies and never wraps edges", () => {
    expect(targets(fixture([["red", "horse", 4, 4]]), 4, 4)).toEqual([
      21, 23, 29, 33, 47, 51, 57, 59,
    ]);
    expect(
      targets(
        fixture([
          ["red", "horse", 4, 4],
          ["black", "pawn", 4, 3],
          ["red", "pawn", 5, 4],
          ["black", "rook", 3, 6],
          ["red", "rook", 2, 3],
        ]),
        4,
        4,
      ),
    ).toEqual([47, 57, 59]);
    expect(targets(fixture([["black", "horse", 0, 0]], "black"), 0, 0)).toEqual(
      [11, 19],
    );
  });

  it("stops a rook at the first occupied square in each direction", () => {
    const position = fixture([
      ["red", "rook", 4, 4],
      ["red", "pawn", 4, 2],
      ["black", "pawn", 4, 6],
      ["black", "cannon", 2, 4],
      ["red", "pawn", 6, 4],
    ]);
    expect(targets(position, 4, 4)).toEqual([31, 38, 39, 41, 49, 58]);
    const before = structuredClone(position);
    pseudoLegalMoves(position);
    expect(position).toEqual(before);
  });

  it("a cannon only captures the first enemy beyond exactly one screen", () => {
    const position = fixture([
      ["red", "cannon", 4, 4],
      ["black", "rook", 4, 2],
      ["black", "pawn", 4, 0],
      ["red", "pawn", 4, 6],
      ["red", "horse", 4, 8],
      ["black", "rook", 2, 4],
      ["red", "pawn", 0, 4],
      ["red", "pawn", 6, 4],
      ["black", "horse", 8, 4],
    ]);
    expect(targets(position, 4, 4)).toEqual([4, 31, 39, 41, 44, 49]);
    expect(
      targets(
        fixture([
          ["red", "cannon", 4, 4],
          ["black", "rook", 4, 2],
        ]),
        4,
        4,
      ),
    ).not.toContain(22);
    expect(
      targets(
        fixture([
          ["red", "cannon", 4, 4],
          ["red", "pawn", 4, 3],
          ["red", "pawn", 4, 2],
          ["black", "rook", 4, 0],
        ]),
        4,
        4,
      ),
    ).not.toContain(4);
  });

  it("pawns gain sideways moves only after crossing and never retreat", () => {
    expect(targets(fixture([["red", "pawn", 4, 6]]), 4, 6)).toEqual([49]);
    expect(targets(fixture([["red", "pawn", 4, 4]]), 4, 4)).toEqual([
      31, 39, 41,
    ]);
    expect(targets(fixture([["black", "pawn", 4, 3]], "black"), 4, 3)).toEqual([
      40,
    ]);
    expect(targets(fixture([["black", "pawn", 4, 5]], "black"), 4, 5)).toEqual([
      48, 50, 58,
    ]);
    expect(
      targets(
        fixture([
          ["red", "pawn", 0, 0],
          ["red", "pawn", 1, 0],
        ]),
        0,
        0,
      ),
    ).toEqual([]);
    expect(
      targets(
        fixture([
          ["red", "pawn", 8, 0],
          ["black", "rook", 7, 0],
        ]),
        8,
        0,
      ),
    ).toEqual([7]);
  });
});
