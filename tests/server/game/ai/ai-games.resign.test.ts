import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { expect, it } from "vitest";
import { type EngineResult } from "@xiangqi/engine";
import {
  legalMoves,
  parsePosition,
  playMove,
  serializePosition,
} from "@xiangqi/xiangqi-core";
import { AiGames } from "@server/game/ai/ai-games.js";
import { owner, memoryTransactions, fixture } from "./ai-games.test-helper.js";
it("resign cancels only its job and ignores late result without double terminal persistence", async () => {
  const f = fixture();
  await f.games.ready();
  let resolve!: (r: EngineResult) => void;
  f.engine.search.mockImplementationOnce(
    () => new Promise((r) => (resolve = r)),
  );
  const game = await f.games.create(owner, {
    requestedSide: "black",
    level: "easy",
  });
  await Promise.resolve();
  const end = await f.games.resign(owner, game.id, { version: game.version });
  expect(end.status).toBe("FINISHED");
  expect(end.outcome).toEqual({ reason: "RESIGN", winner: "red" });
  expect(f.engine.close).not.toHaveBeenCalled();
  resolve({
    move: { from: 27, to: 36 },
    terminal: null,
    completedDepth: 2,
    targetDepth: 2,
    elapsedMs: 1,
    nodes: 1,
    timedOut: false,
  });
  await f.games.waitForEngine(owner, game.id);
  expect(f.games.read(owner, game.id).history).toHaveLength(1);
  expect(f.lifecycle.finish).toHaveBeenCalledTimes(1);
  await expect(
    f.games.resign(owner, game.id, { version: end.version }),
  ).rejects.toMatchObject({ code: "AI_FINISHED" });
});
it("retains finalizing state on finish failure and retries exact terminal ID before release", async () => {
  const f = fixture();
  await f.games.ready();
  const game = await f.games.create(owner, {
    requestedSide: "red",
    level: "easy",
  });
  f.lifecycle.finish.mockRejectedValueOnce(Error("private SQL"));
  await expect(
    f.games.resign(owner, game.id, { version: 1 }),
  ).rejects.toMatchObject({ code: "AI_UNAVAILABLE" });
  const pending = f.games.read(owner, game.id);
  expect(pending.status).toBe("FINALIZING");
  await expect(
    f.games.create(owner, { requestedSide: "red", level: "easy" }),
  ).rejects.toMatchObject({ code: "AI_ALREADY_PLAYING" });
  const done = await f.games.retry(owner, game.id, {
    version: pending.version,
  });
  expect(done.status).toBe("FINISHED");
  expect(f.lifecycle.finish.mock.calls.map((c) => c[0])).toEqual([
    expect.objectContaining({ id: game.id }),
    expect.objectContaining({ id: game.id }),
  ]);
});
it("returns defensive snapshots and closes without silently releasing active reservations", async () => {
  const f = fixture();
  await f.games.ready();
  const game = await f.games.create(owner, {
    requestedSide: "red",
    level: "easy",
  });
  game.history.length = 0;
  expect(f.games.read(owner, game.id).history).toHaveLength(1);
  await f.games.close();
  expect(f.lifecycle.finish).not.toHaveBeenCalled();
  await expect(
    f.games.create(owner, { requestedSide: "red", level: "easy" }),
  ).rejects.toMatchObject({ code: "AI_CLOSED" });
});
it("integrates actual compiled prepared worker, distinct from controlled race fixtures", async () => {
  // CI tests precede the normal build: compile the actual package, not a fake worker.
  const root = new URL("../../../../", import.meta.url);
  await promisify(execFile)(process.execPath, [
    fileURLToPath(new URL("node_modules/typescript/bin/tsc", root)),
    "-p",
    fileURLToPath(new URL("packages/engine/tsconfig.json", root)),
  ]);
  await copyFile(
    new URL("packages/engine/src/worker-bootstrap.mjs", root),
    new URL("packages/engine/dist/worker-bootstrap.mjs", root),
  );
  const compiled = (await import(
    /* @vite-ignore */ new URL("packages/engine/dist/engine-worker.js", root)
      .href
  )) as typeof import("@xiangqi/engine");
  const worker = new compiled.EngineWorker();
  const games = new AiGames({
    engine: worker,
    transactions: memoryTransactions().transactions,
  });
  try {
    await games.ready();
    const initial = await games.create(owner, {
      requestedSide: "black",
      level: "easy",
    });
    await games.waitForEngine(owner, initial.id);
    const game = games.read(owner, initial.id);
    expect(game.history).toHaveLength(2);
    expect(game.engineState).toBe("IDLE");
    expect(
      legalMoves(parsePosition(initial.position)).some(
        (m) =>
          serializePosition(playMove(parsePosition(initial.position), m)) ===
          game.position,
      ),
    ).toBe(true);
  } finally {
    await games.close();
    await worker.close();
  }
});
