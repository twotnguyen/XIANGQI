import { expect, it } from "vitest";
import {
  initialPosition,
  playMove,
  serializePosition,
  type Move,
  type Position,
  type Side,
} from "@xiangqi/xiangqi-core";
import { replayMoveLabels } from "./replay-notation.js";
import type { ReplayRecord } from "./replay-client.js";
function one(position: Position, move: Move): ReplayRecord {
  const next = playMove(position, move);
  return {
    id: "11111111-1111-4111-8111-111111111111",
    mode: "CASUAL",
    side: position.turn,
    positions: [
      { fen: serializePosition(position), turn: position.turn },
      { fen: serializePosition(next), turn: next.turn },
    ],
    moves: [{ ...move, side: position.turn }],
  };
}
function sparse(turn: Side = "red"): Position {
  const p = initialPosition();
  p.board.fill(null);
  p.turn = turn;
  p.board[4] = { type: "king", side: "black" };
  p.board[85] = { type: "king", side: "red" };
  p.board[49] = { type: "pawn", side: "red" };
  return p;
}
it.each([
  ["red", 70, 67, "Pháo 2 bình 5"],
  ["red", 82, 65, "Mã 8 tiến 7"],
  ["black", 19, 22, "Pháo 2 bình 5"],
  ["black", 7, 24, "Mã 8 tiến 7"],
  ["red", 54, 45, "Tốt 9 tiến 1"],
  ["black", 27, 36, "Tốt 1 tiến 1"],
  ["red", 87, 67, "Tượng 3 tiến 5"],
  ["black", 2, 22, "Tượng 3 tiến 5"],
  ["red", 86, 76, "Sĩ 4 tiến 5"],
  ["black", 3, 13, "Sĩ 4 tiến 5"],
  ["red", 85, 76, "Tướng 5 tiến 1"],
  ["black", 4, 13, "Tướng 5 tiến 1"],
] as const)(
  "formats independent opening %s %i→%i as %s",
  (side, from, to, expected) => {
    const p = initialPosition();
    p.turn = side;
    expect(replayMoveLabels(one(p, { from, to }))).toEqual([expected]);
  },
);
it.each([
  ["red", "rook", 81, 54, "Xe 9 tiến 3"],
  ["black", "rook", 0, 27, "Xe 1 tiến 3"],
  ["red", "cannon", 63, 36, "Pháo 9 tiến 3"],
  ["black", "cannon", 18, 45, "Pháo 1 tiến 3"],
  ["red", "rook", 54, 81, "Xe 9 thoái 3"],
  ["black", "rook", 27, 0, "Xe 1 thoái 3"],
] as const)(
  "uses vertical distance for %s %s",
  (side, type, from, to, expected) => {
    const p = sparse(side);
    p.board[from] = { type, side };
    expect(replayMoveLabels(one(p, { from, to }))).toEqual([expected]);
  },
);
it("uses a destination file for a crossed-river pawn's lateral move", () => {
  const p = sparse();
  p.board[36] = { type: "pawn", side: "red" };
  expect(replayMoveLabels(one(p, { from: 36, to: 37 }))).toEqual([
    "Tốt 9 bình 8",
  ]);
});
it.each([
  ["red", 45, 63, 45, 36, "Xe trước tiến 1"],
  ["red", 45, 63, 63, 72, "Xe sau thoái 1"],
  ["black", 18, 36, 36, 45, "Xe trước tiến 1"],
  ["black", 18, 36, 18, 9, "Xe sau thoái 1"],
] as const)(
  "orders %s tandem rooks from that player's viewpoint",
  (side, a, b, from, to, expected) => {
    const p = sparse(side);
    p.board[a] = { type: "rook", side };
    p.board[b] = { type: "rook", side };
    expect(replayMoveLabels(one(p, { from, to }))).toEqual([expected]);
  },
);
it("uses front/rear for same-file advisors and destination files rather than diagonal distance", () => {
  const p = sparse();
  p.board[85] = { type: "advisor", side: "red" };
  p.board[84] = { type: "king", side: "red" };
  p.board[67] = { type: "advisor", side: "red" };
  expect(replayMoveLabels(one(p, { from: 67, to: 75 }))).toEqual([
    "Sĩ trước thoái 6",
  ]);
  expect(replayMoveLabels(one(p, { from: 85, to: 77 }))).toEqual([
    "Sĩ sau tiến 4",
  ]);
});
it("uses front/rear for same-file elephants", () => {
  const p = sparse();
  p.board[47] = { type: "elephant", side: "red" };
  p.board[83] = { type: "elephant", side: "red" };
  expect(replayMoveLabels(one(p, { from: 47, to: 63 }))).toEqual([
    "Tượng trước thoái 9",
  ]);
  expect(replayMoveLabels(one(p, { from: 83, to: 67 }))).toEqual([
    "Tượng sau tiến 5",
  ]);
});
it.each([
  ["cannon", 45, 46, "Pháo trước bình 8"],
  ["cannon", 63, 64, "Pháo sau bình 8"],
  ["horse", 45, 28, "Mã trước tiến 8"],
  ["horse", 63, 82, "Mã sau thoái 8"],
] as const)(
  "disambiguates same-file %s using front/rear",
  (type, from, to, expected) => {
    const p = sparse();
    p.board[45] = { type, side: "red" };
    p.board[63] = { type, side: "red" };
    expect(replayMoveLabels(one(p, { from, to }))).toEqual([expected]);
  },
);
it("preserves the three literal ordinal/file examples from WXF Art7.5 Figure B in Vietnamese", () => {
  const p = sparse();
  for (const square of [21, 30, 39])
    p.board[square] = { type: "pawn", side: "red" };
  expect(replayMoveLabels(one(p, { from: 39, to: 40 }))).toEqual([
    "Tốt thứ 3 (cột 6) bình 5",
  ]);
  expect(replayMoveLabels(one(p, { from: 30, to: 31 }))).toEqual([
    "Tốt thứ 2 (cột 6) bình 5",
  ]);
  expect(replayMoveLabels(one(p, { from: 21, to: 22 }))).toEqual([
    "Tốt thứ 1 (cột 6) bình 5",
  ]);
});
it.each([3, 4, 5])(
  "disambiguates all %i same-file red pawns by front-to-rear ordinal and file context",
  (count) => {
    const p = sparse();
    // Offset the kings instead of adding a sixth pawn as a flying-king blocker.
    p.board[49] = null;
    p.board[85] = null;
    p.board[84] = { type: "king", side: "red" };
    for (let y = 0; y < count; y++)
      p.board[y * 9] = { type: "pawn", side: "red" };
    for (let rank = 1; rank <= count; rank++)
      expect(
        replayMoveLabels(
          one(p, { from: (rank - 1) * 9, to: (rank - 1) * 9 + 1 }),
        ),
      ).toEqual([`Tốt thứ ${rank} (cột 9) bình 8`]);
  },
);
it.each([3, 4, 5])(
  "reverses the front-to-rear order for %i black pawns",
  (count) => {
    const p = sparse("black");
    p.board[49] = null;
    p.board[85] = null;
    p.board[84] = { type: "king", side: "red" };
    for (let rank = 0; rank < count; rank++)
      p.board[(9 - rank) * 9] = { type: "pawn", side: "black" };
    for (let rank = 1; rank <= count; rank++)
      expect(
        replayMoveLabels(
          one(p, { from: (10 - rank) * 9, to: (10 - rank) * 9 + 1 }),
        ),
      ).toEqual([`Tốt thứ ${rank} (cột 1) bình 2`]);
  },
);
it("keeps two-pawn front/rear notation without a redundant file when only one file is stacked", () => {
  const p = sparse();
  p.board[18] = { type: "pawn", side: "red" };
  p.board[27] = { type: "pawn", side: "red" };
  expect(replayMoveLabels(one(p, { from: 18, to: 19 }))).toEqual([
    "Tốt trước bình 8",
  ]);
  expect(replayMoveLabels(one(p, { from: 27, to: 28 }))).toEqual([
    "Tốt sau bình 8",
  ]);
});
it("adds file context when two files each contain tandem pawns", () => {
  const p = sparse();
  for (const square of [18, 27, 20, 29])
    p.board[square] = { type: "pawn", side: "red" };
  expect(replayMoveLabels(one(p, { from: 18, to: 19 }))).toEqual([
    "Tốt trước (cột 9) bình 8",
  ]);
  expect(replayMoveLabels(one(p, { from: 20, to: 21 }))).toEqual([
    "Tốt trước (cột 7) bình 6",
  ]);
});
it("ignores other friendly piece kinds and opposing same-file pieces when selecting a descriptor", () => {
  const p = sparse();
  p.board[63] = { type: "rook", side: "red" };
  p.board[45] = { type: "cannon", side: "red" };
  p.board[18] = { type: "rook", side: "black" };
  expect(replayMoveLabels(one(p, { from: 63, to: 64 }))).toEqual([
    "Xe 9 bình 8",
  ]);
});
it("labels only the actual ordered effective branch and does not mutate input or depend on move counters", () => {
  const p = initialPosition();
  p.halfmove = 77;
  p.fullmove = 24;
  const r = one(p, { from: 54, to: 45 });
  const after = playMove(p, { from: 54, to: 45 });
  const second = playMove(after, { from: 27, to: 36 });
  r.moves.push({ from: 27, to: 36, side: "black" });
  r.positions.push({ fen: serializePosition(second), turn: second.turn });
  const prior = structuredClone(r);
  expect(replayMoveLabels(r)).toEqual(["Tốt 9 tiến 1", "Tốt 1 tiến 1"]);
  expect(r).toEqual(prior);
});
it("returns no invented labels for an initial-only record", () => {
  const r = one(initialPosition(), { from: 54, to: 45 });
  r.moves = [];
  r.positions = r.positions.slice(0, 1);
  expect(replayMoveLabels(r)).toEqual([]);
});
it.each(["side", "source", "counter", "private"])(
  "rejects corrupt %s with a fixed error",
  (kind) => {
    const r = one(initialPosition(), { from: 54, to: 45 });
    if (kind === "side") r.moves[0]!.side = "black";
    if (kind === "source") r.moves[0]!.from = 55;
    if (kind === "counter")
      r.positions[1]!.fen = r.positions[1]!.fen.replace("1 1", "99 1");
    if (kind === "private")
      Object.assign(r, { privateToken: "do-not-reflect" });
    expect(() => replayMoveLabels(r)).toThrow("Biên bản ván đấu không hợp lệ.");
  },
);
