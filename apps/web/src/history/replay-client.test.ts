import { expect, it, vi } from "vitest";
import {
  initialPosition,
  parsePosition,
  playMove,
  serializePosition,
} from "@xiangqi/xiangqi-core";
import {
  makeReplayClient,
  parseReplayRecord,
  ReplayRequestError,
  type ReplayRecord,
} from "./replay-client.js";
const id = "ABCDEFAB-1234-4234-8234-ABCDEFABCDEF";
function record(): ReplayRecord {
  let p = initialPosition();
  const positions = [{ fen: serializePosition(p), turn: p.turn }];
  const moves: ReplayRecord["moves"] = [];
  for (const move of [
    { from: 54, to: 45 },
    { from: 27, to: 36 },
    { from: 56, to: 47 },
  ]) {
    moves.push({ ...move, side: p.turn });
    p = playMove(p, move);
    positions.push({ fen: serializePosition(p), turn: p.turn });
  }
  return {
    id: id.toLowerCase(),
    mode: "CASUAL",
    side: "red",
    positions,
    moves,
  };
}
it("reads through authorized GET with a canonical UUID and verifies an actual legal branch", async () => {
  const body = record(),
    fetch = vi.fn().mockResolvedValue(Response.json(body));
  expect(await makeReplayClient(fetch).read(id)).toEqual(body);
  expect(fetch).toHaveBeenCalledExactlyOnceWith(
    `/history/${id.toLowerCase()}`,
    { method: "GET", redirect: "error" },
  );
});
it("accepts an AI black-side record and an initial-only terminal record", () => {
  const body = record();
  body.mode = "AI";
  body.side = "black";
  expect(parseReplayRecord(body)).toEqual(body);
  body.moves = [];
  body.positions = body.positions.slice(0, 1);
  expect(parseReplayRecord(body)).toEqual(body);
});
const corruptions: Array<[string, (r: ReplayRecord) => unknown]> = [
  ["sparse positions", (r) => ({ ...r, positions: Array(1), moves: [] })],
  ["sparse moves", (r) => ({ ...r, moves: Array(r.moves.length) })],
  ["private root identity", (r) => ({ ...r, userId: id })],
  [
    "private position payload",
    (r) => {
      Object.assign(r.positions[0]!, { startToken: id });
      return r;
    },
  ],
  [
    "private move version",
    (r) => {
      Object.assign(r.moves[0]!, { version: 1 });
      return r;
    },
  ],
  ["foreign mode", (r) => ({ ...r, mode: "RANKED" })],
  ["malformed identity", (r) => ({ ...r, id: "other" })],
  ["malformed own side", (r) => ({ ...r, side: "spectator" })],
  ["empty history", (r) => ({ ...r, positions: [], moves: [] })],
  ["unequal lengths", (r) => ({ ...r, moves: [] })],
  [
    "invalid FEN",
    (r) => {
      r.positions[0]!.fen = "private malformed";
      return r;
    },
  ],
  [
    "noncanonical FEN",
    (r) => {
      r.positions[0]!.fen += " ";
      return r;
    },
  ],
  [
    "FEN/turn mismatch",
    (r) => {
      r.positions[0]!.turn = "black";
      return r;
    },
  ],
  [
    "sender side mismatch",
    (r) => {
      r.moves[0]!.side = "black";
      return r;
    },
  ],
  [
    "fractional index",
    (r) => {
      r.moves[0]!.from = 54.5;
      return r;
    },
  ],
  [
    "outside board",
    (r) => {
      r.moves[0]!.to = 90;
      return r;
    },
  ],
  [
    "illegal movement",
    (r) => {
      r.moves[0]!.to = 44;
      return r;
    },
  ],
  [
    "discarded branch position",
    (r) => {
      r.positions[1] = r.positions[3]!;
      return r;
    },
  ],
  [
    "tampered counters",
    (r) => {
      const position = parsePosition(r.positions[1]!.fen);
      position.halfmove++;
      r.positions[1]!.fen = serializePosition(position);
      return r;
    },
  ],
];
it.each(corruptions)("rejects %s with a literal error", (_name, mutate) => {
  expect(() => parseReplayRecord(mutate(record()))).toThrow(
    "Phản hồi xem lại không hợp lệ. Vui lòng tải lại.",
  );
});
it.each(["", "../private", id + "?owner=secret", id + "/moves", " " + id])(
  "rejects invalid route identity %s before HTTP",
  async (value) => {
    const fetch = vi.fn();
    await expect(makeReplayClient(fetch).read(value)).rejects.toMatchObject({
      status: 400,
      code: "REPLAY_INPUT_INVALID",
    });
    expect(fetch).not.toHaveBeenCalled();
  },
);
it("rejects a valid response for a different match", async () => {
  const body = record();
  body.id = "11111111-1111-4111-8111-111111111111";
  await expect(
    makeReplayClient(vi.fn().mockResolvedValue(Response.json(body))).read(id),
  ).rejects.toMatchObject({ status: 503, code: "REPLAY_RESPONSE_INVALID" });
});
it.each([401, 403, 404, 409, 503])(
  "preserves HTTP %i while never reflecting provider body",
  async (status) => {
    const fetch = vi
      .fn()
      .mockResolvedValue(
        Response.json(
          { code: "private-provider-code", message: "private-provider-secret" },
          { status },
        ),
      );
    try {
      await makeReplayClient(fetch).read(id);
      throw Error("Expected rejection");
    } catch (e) {
      expect(e).toBeInstanceOf(ReplayRequestError);
      expect((e as ReplayRequestError).status).toBe(status);
      expect((e as Error).message).not.toContain("private");
      expect((e as ReplayRequestError).code).not.toContain("private");
    }
    expect(fetch).toHaveBeenCalledTimes(1);
  },
);
it("maps a network failure to unavailable without pretending the match is absent", async () => {
  await expect(
    makeReplayClient(vi.fn().mockRejectedValue(Error("private network"))).read(
      id,
    ),
  ).rejects.toMatchObject({ status: 503, code: "REPLAY_UNAVAILABLE" });
});
it("sanitizes malformed JSON and malformed successful bodies", async () => {
  for (const response of [
    new Response("private raw", { status: 200 }),
    Response.json({ secret: "private raw" }),
  ])
    await expect(
      makeReplayClient(vi.fn().mockResolvedValue(response)).read(id),
    ).rejects.toMatchObject({ status: 503, code: "REPLAY_RESPONSE_INVALID" });
});
