import { describe, expect, it } from "vitest";
import { initialPosition, parsePosition } from "@xiangqi/xiangqi-core";
import * as codec from "./position-codec.js";
import * as replay from "./history.js";

const initial =
  "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1";
const after =
  "rnbakabnr/9/1c5c1/p1p1p1p1p/9/P8/2P1P1P1P/1C5C1/9/RNBAKABNR b - - 1 1";
const id = "11111111-1111-4111-8111-111111111111";
function branch() {
  const position = parsePosition(after);
  return {
    position: { ...position, turn: "BLACK" },
    ply: 1,
    version: 1,
    active_move_ids: [id],
    start: {
      encoding: "xiangqi-core-v1",
      initialPosition: { ...initialPosition(), turn: "RED" },
    },
    moves: [
      {
        id,
        parent_move_id: null,
        event_version: 1,
        side: "RED",
        move: { from: { x: 0, y: 6 }, to: { x: 0, y: 5 } },
        event_type: "MOVE",
        payload: {
          moveId: id,
          side: "RED",
          move: { from: { x: 0, y: 6 }, to: { x: 0, y: 5 } },
        },
      },
    ],
  };
}
describe("position codec", () => {
  it("exports codec and replays the independently specified first pawn move", () => {
    expect(codec.decodePosition).toBeTypeOf("function");
    expect(replay.replayHistory).toBeTypeOf("function");
    expect(codec.encodePosition(initialPosition()).turn).toBe("RED");
    expect(
      codec.decodePosition(codec.encodePosition(initialPosition())),
    ).toEqual(parsePosition(initial));
    expect(replay.replayHistory(branch()).map(codec.toFen)).toEqual([
      initial,
      after,
    ]);
  });
  it.each([
    { ...initialPosition(), turn: "red" },
    { ...initialPosition(), turn: "RED", board: Array(90).fill(null) },
    { ...initialPosition(), turn: "RED", halfmove: -1 },
    { ...initialPosition(), turn: "RED", fullmove: 0 },
    {
      ...initialPosition(),
      turn: "RED",
      board: [...initialPosition().board.slice(0, 89)],
    },
    {
      ...initialPosition(),
      turn: "RED",
      board: [
        { side: "red", type: "dragon" },
        ...initialPosition().board.slice(1),
      ],
    },
  ])("rejects malformed persisted positions", (value) =>
    expect(() => codec.decodePosition(value)).toThrow("MATCH_HISTORY_CORRUPT"),
  );
});
describe("effective history", () => {
  it("rejects unsupported START instead of trusting the cached board", () => {
    expect(() => replay.replayHistory({ ...branch(), start: null })).toThrow(
      "MATCH_HISTORY_UNSUPPORTED",
    );
  });
  it.each([
    "parent",
    "side",
    "event",
    "coordinates",
    "cached",
    "duplicate",
    "missing",
    "version",
    "continued",
  ])("rejects %s corruption", (kind) => {
    const b = branch();
    if (kind === "parent") b.moves[0]!.parent_move_id = id as never;
    if (kind === "side") b.moves[0]!.side = "BLACK";
    if (kind === "event") b.moves[0]!.event_type = "RESULT";
    if (kind === "coordinates") b.moves[0]!.payload.move.to.y = 4;
    if (kind === "cached") b.position.halfmove = 99;
    if (kind === "duplicate") {
      b.active_move_ids.push(id);
      b.ply = 2;
    }
    if (kind === "missing") b.moves = [];
    if (kind === "version") b.version = 0;
    if (kind === "continued")
      b.start.initialPosition = {
        ...parsePosition("4k4/3RPR3/9/9/9/9/9/9/9/4K4 b - - 0 1"),
        turn: "BLACK",
      };
    expect(() => replay.replayHistory(b)).toThrow("MATCH_HISTORY_CORRUPT");
  });
  it("ignores off-branch records without counting their position in repetition", () => {
    const b = branch();
    b.moves.push({
      ...b.moves[0]!,
      id: "22222222-2222-4222-8222-222222222222",
      side: "BLACK",
    });
    expect(replay.replayHistory(b).map(codec.toFen)).toEqual([initial, after]);
  });
});
