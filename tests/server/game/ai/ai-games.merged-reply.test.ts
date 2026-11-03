import { expect, it } from "vitest";
import { legalMoves, parsePosition } from "@xiangqi/xiangqi-core";
import { owner, mergedFixture } from "./ai-games.test-helper.js";

async function started() {
  const f = mergedFixture();
  await f.games.ready();
  const game = await f.games.create(owner, {
    requestedSide: "red",
    level: "easy",
  });
  return { f, game, move: legalMoves(parsePosition(game.position))[0]! };
}

it("commits the human move and the machine reply in one transaction", async () => {
  const { f, game, move } = await started();
  const runs = f.commit.mock.calls.length;
  const result = await f.games.move(owner, game.id, {
    version: game.version,
    move,
  });
  expect(result.history).toHaveLength(3);
  expect(result.engineState).toBe("IDLE");
  expect(result.telemetry?.appliedMove).not.toBeNull();
  expect(result.version).toBe(game.version + 2);
  expect(f.engine.search).toHaveBeenCalledTimes(1);
  expect(f.commit.mock.calls.length - runs).toBe(1);
});

it("falls back to a committed THINKING turn when the speculative search fails", async () => {
  const { f, game, move } = await started();
  f.engine.search.mockRejectedValueOnce(new Error("engine down"));
  const result = await f.games.move(owner, game.id, {
    version: game.version,
    move,
  });
  expect(result.history).toHaveLength(2);
  expect(result.engineState).toBe("THINKING");
  await f.games.waitForEngine(owner, game.id);
  expect(f.games.read(owner, game.id).history).toHaveLength(3);
});

it("discards the speculative reply when the version is stale", async () => {
  const { f, game, move } = await started();
  await expect(
    f.games.move(owner, game.id, { version: game.version + 5, move }),
  ).rejects.toMatchObject({ code: "AI_VERSION_CONFLICT" });
  expect(f.games.read(owner, game.id).history).toHaveLength(1);
  expect(f.engine.search).not.toHaveBeenCalled();
});
