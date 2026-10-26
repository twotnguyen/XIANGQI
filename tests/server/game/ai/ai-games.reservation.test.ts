import { expect, it } from "vitest";
import { EngineError } from "@xiangqi/engine";
import {
  legalMoves,
  parsePosition,
  playMove,
  serializePosition,
} from "@xiangqi/xiangqi-core";
import { owner, fixture } from "./ai-games.test-helper.js";
it("requires preparation and a successful real reservation before exposing RAM state", async () => {
  const f = fixture();
  await expect(
    f.games.create(owner, { requestedSide: "red", level: "easy" }),
  ).rejects.toMatchObject({ code: "AI_NOT_READY" });
  await f.games.ready();
  f.lifecycle.reserve.mockRejectedValueOnce(Error("private database password"));
  await expect(
    f.games.create(owner, { requestedSide: "red", level: "easy" }),
  ).rejects.toMatchObject({ code: "AI_UNAVAILABLE" });
  const game = await f.games.create(owner, {
    requestedSide: "red",
    level: "easy",
  });
  expect(game.version).toBe(1);
  expect(f.lifecycle.reserve).toHaveBeenCalledTimes(2);
  expect(f.engine.search).not.toHaveBeenCalled();
});
it.each(["red", "black"] as const)(
  "plays both human and engine through legal core history for %s",
  async (side) => {
    const f = fixture();
    await f.games.ready();
    let game = await f.games.create(owner, {
      requestedSide: side,
      level: "easy",
    });
    await f.games.waitForEngine(owner, game.id);
    game = f.games.read(owner, game.id);
    expect(game.actualSide).toBe(side);
    expect(game.history).toHaveLength(side === "red" ? 1 : 2);
    const position = parsePosition(game.position),
      move = legalMoves(position)[0]!;
    await f.games.move(owner, game.id, { version: game.version, move });
    await f.games.waitForEngine(owner, game.id);
    game = f.games.read(owner, game.id);
    expect(game.history).toHaveLength(side === "red" ? 3 : 4);
    expect(parsePosition(game.position).turn).toBe(side);
    for (let i = 1; i < game.history.length; i++) {
      const previous = parsePosition(game.history[i - 1]!);
      expect(
        legalMoves(previous).some(
          (m) => serializePosition(playMove(previous, m)) === game.history[i],
        ),
      ).toBe(true);
    }
  },
);
it("keeps requested random separate and samples both exact injected outcomes", async () => {
  for (const side of ["red", "black"] as const) {
    const f = fixture(() => side);
    await f.games.ready();
    const game = await f.games.create(owner, {
      requestedSide: "random",
      level: "medium",
    });
    await f.games.waitForEngine(owner, game.id);
    expect(game.requestedSide).toBe("random");
    expect(game.actualSide).toBe(side);
  }
});
it("rejects foreign actor, old version, illegal move and duplicate owner reservation", async () => {
  const f = fixture();
  await f.games.ready();
  const game = await f.games.create(owner, {
    requestedSide: "red",
    level: "easy",
  });
  expect(() => f.games.read("other", game.id)).toThrow();
  await expect(
    f.games.move(owner, game.id, { version: 0, move: { from: 54, to: 45 } }),
  ).rejects.toMatchObject({ code: "AI_VERSION_CONFLICT" });
  await expect(
    f.games.move(owner, game.id, { version: 1, move: { from: 0, to: 89 } }),
  ).rejects.toMatchObject({ code: "AI_ILLEGAL_MOVE" });
  await expect(
    f.games.create(owner, { requestedSide: "red", level: "easy" }),
  ).rejects.toMatchObject({ code: "AI_ALREADY_PLAYING" });
  expect(f.games.read(owner, game.id).history).toHaveLength(1);
});
it.each(["ENGINE_TIMEOUT", "ENGINE_BUSY"] as const)(
  "keeps exact position on %s and retry never resends human move",
  async (code) => {
    const f = fixture();
    await f.games.ready();
    f.engine.search.mockRejectedValueOnce(new EngineError(code));
    let game = await f.games.create(owner, {
      requestedSide: "black",
      level: "easy",
    });
    await f.games.waitForEngine(owner, game.id);
    game = f.games.read(owner, game.id);
    expect(game.status).toBe("ACTIVE");
    expect(game.engineState).toBe("RETRY");
    expect(game.history).toHaveLength(1);
    await f.games.retry(owner, game.id, { version: game.version });
    await f.games.waitForEngine(owner, game.id);
    expect(f.engine.search.mock.calls[1]![0].position).toBe(game.position);
    expect(f.lifecycle.finish).not.toHaveBeenCalled();
  },
);
it("abandons illegal engine output and retry creates new ID preserving actual random side", async () => {
  const f = fixture(() => "black");
  await f.games.ready();
  f.engine.search.mockResolvedValueOnce({
    move: { from: 0, to: 89 },
    terminal: null,
    completedDepth: 2,
    targetDepth: 2,
    elapsedMs: 1,
    nodes: 1,
    timedOut: false,
  });
  const old = await f.games.create(owner, {
    requestedSide: "random",
    level: "hard",
  });
  await f.games.waitForEngine(owner, old.id);
  const ended = f.games.read(owner, old.id);
  expect(ended.status).toBe("ABANDONED");
  expect(f.lifecycle.finish).toHaveBeenCalledTimes(1);
  const next = await f.games.retry(owner, old.id, { version: ended.version });
  expect(next.id).not.toBe(old.id);
  expect(next.requestedSide).toBe("random");
  expect(next.actualSide).toBe("black");
  await f.games.waitForEngine(owner, next.id);
});
