import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { copyFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { expect, it, vi } from "vitest";
import {
  EngineError,
  type EngineRequest,
  type EngineResult,
} from "@xiangqi/engine";
import {
  legalMoves,
  parsePosition,
  playMove,
  serializePosition,
} from "@xiangqi/xiangqi-core";
import { type AiLifecycle, type AiOptions, AiGames } from "./ai-games.js";
const owner = "00000000-0000-0000-0000-000000000001";
function fixture(randomSide?: () => "red" | "black") {
  const lifecycle = {
    reserve: vi.fn<AiLifecycle["reserve"]>(async () => {}),
    finish: vi.fn<AiLifecycle["finish"]>(async () => {}),
  };
  const engine = {
    ready: vi.fn(async () => {}),
    close: vi.fn(async () => {}),
    search: vi.fn<AiOptions["engine"]["search"]>(
      async (request: EngineRequest): Promise<EngineResult> => ({
        move: legalMoves(parsePosition(request.position))[0]!,
        terminal: null,
        completedDepth: 2,
        targetDepth: 2,
        elapsedMs: 1,
        nodes: 1,
        timedOut: false,
      }),
    ),
  };
  return {
    games: new AiGames({ engine, lifecycle, randomSide }),
    engine,
    lifecycle,
  };
}
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
    lifecycle: {
      reserve: vi.fn(async () => {}),
      finish: vi.fn(async () => {}),
    },
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

it.each(["easy", "medium", "hard"] as const)(
  "forwards only authoritative history and selected %s level",
  async (level) => {
    const f = fixture();
    await f.games.ready();
    const game = await f.games.create(owner, { requestedSide: "black", level });
    await f.games.waitForEngine(owner, game.id);
    expect(f.engine.search.mock.calls[0]![0]).toEqual({
      position: game.position,
      side: "red",
      level,
      history: [game.position],
    });
  },
);
it("serializes concurrent creates and same-version resignation without double persistence", async () => {
  const f = fixture();
  await f.games.ready();
  const results = await Promise.allSettled([
    f.games.create(owner, { requestedSide: "red", level: "easy" }),
    f.games.create(owner, { requestedSide: "black", level: "easy" }),
  ]);
  expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
  expect(f.lifecycle.reserve).toHaveBeenCalledTimes(1);
  const game = (
    results[0] as PromiseFulfilledResult<Awaited<ReturnType<AiGames["create"]>>>
  ).value;
  const ends = await Promise.allSettled([
    f.games.resign(owner, game.id, { version: 1 }),
    f.games.resign(owner, game.id, { version: 1 }),
  ]);
  expect(ends.filter((r) => r.status === "fulfilled")).toHaveLength(1);
  expect(f.lifecycle.finish).toHaveBeenCalledTimes(1);
});
it("does not install late old-game output into newly reserved game", async () => {
  const f = fixture();
  await f.games.ready();
  let resolve!: (r: EngineResult) => void;
  f.engine.search.mockImplementationOnce(
    () => new Promise((r) => (resolve = r)),
  );
  const old = await f.games.create(owner, {
    requestedSide: "black",
    level: "easy",
  });
  await f.games.resign(owner, old.id, { version: 1 });
  const next = await f.games.create(owner, {
    requestedSide: "red",
    level: "medium",
  });
  resolve({
    move: { from: 27, to: 36 },
    terminal: null,
    completedDepth: 2,
    targetDepth: 2,
    elapsedMs: 1,
    nodes: 1,
    timedOut: false,
  });
  await f.games.waitForEngine(owner, old.id);
  expect(next.id).not.toBe(old.id);
  expect(f.games.read(owner, next.id).history).toHaveLength(1);
  expect(f.lifecycle.finish).toHaveBeenCalledTimes(1);
});

it("prepares a recreated shared worker after resignation before the next game search", async () => {
  const f = fixture();
  let workerReady = false;
  f.engine.ready.mockImplementation(async () => {
    workerReady = true;
  });
  await f.games.ready();
  f.engine.search.mockImplementationOnce(
    (_request, options) =>
      new Promise((_resolve, reject) => {
        options?.signal?.addEventListener(
          "abort",
          () => {
            workerReady = false;
            reject(new EngineError("ENGINE_CANCELLED"));
          },
          { once: true },
        );
      }),
  );
  const old = await f.games.create(owner, {
    requestedSide: "black",
    level: "easy",
  });
  await f.games.resign(owner, old.id, { version: 1 });
  await f.games.waitForEngine(owner, old.id);
  f.engine.search.mockImplementationOnce(async (request) => {
    if (!workerReady) throw new EngineError("ENGINE_FAILED");
    return {
      move: legalMoves(parsePosition(request.position))[0]!,
      terminal: null,
      completedDepth: 2,
      targetDepth: 2,
      elapsedMs: 1,
      nodes: 1,
      timedOut: false,
    };
  });
  const next = await f.games.create(owner, {
    requestedSide: "black",
    level: "easy",
  });
  await f.games.waitForEngine(owner, next.id);
  expect(f.games.read(owner, next.id).status).toBe("ACTIVE");
  expect(f.games.read(owner, next.id).history).toHaveLength(2);
});
it("fences a job resigned while replacement-worker preparation is pending", async () => {
  const f = fixture();
  await f.games.ready();
  let release!: () => void;
  f.engine.ready.mockResolvedValueOnce(undefined).mockImplementationOnce(
    () =>
      new Promise<void>((r) => {
        release = r;
      }),
  );
  const game = await f.games.create(owner, {
    requestedSide: "black",
    level: "easy",
  });
  await f.games.resign(owner, game.id, { version: game.version });
  release();
  await f.games.waitForEngine(owner, game.id);
  expect(f.engine.search).not.toHaveBeenCalled();
  expect(f.lifecycle.finish).toHaveBeenCalledTimes(1);
});
it("rejects replacement-worker readiness failure before reserving another game", async () => {
  const f = fixture();
  await f.games.ready();
  f.engine.ready.mockRejectedValueOnce(new EngineError("ENGINE_FAILED"));
  await expect(
    f.games.create(owner, { requestedSide: "black", level: "easy" }),
  ).rejects.toMatchObject({ code: "AI_UNAVAILABLE" });
  expect(f.lifecycle.reserve).not.toHaveBeenCalled();
});
it("does not expose a newly reserved game when shutdown starts during reserve", async () => {
  const f = fixture();
  await f.games.ready();
  let entered!: () => void, release!: () => void;
  const pending = new Promise<void>((r) => (release = r)),
    started = new Promise<void>((r) => (entered = r));
  f.lifecycle.reserve.mockImplementationOnce(async () => {
    entered();
    await pending;
  });
  const creation = f.games.create(owner, {
    requestedSide: "black",
    level: "easy",
  });
  const rejected = expect(creation).rejects.toMatchObject({
    code: "AI_CLOSED",
  });
  await started;
  let closed = false;
  const closing = f.games.close().then(() => {
    closed = true;
  });
  await Promise.resolve();
  expect(closed).toBe(false);
  release();
  await rejected;
  await closing;
  expect(f.engine.search).not.toHaveBeenCalled();
  expect(f.lifecycle.finish).not.toHaveBeenCalled();
});
it("times out unresolved replacement readiness at ten seconds and fences late readiness", async () => {
  vi.useFakeTimers();
  const f = fixture();
  try {
    await f.games.ready();
    let release!: () => void;
    f.engine.ready
      .mockResolvedValueOnce(undefined)
      .mockImplementationOnce(() => new Promise<void>((r) => (release = r)));
    const game = await f.games.create(owner, {
      requestedSide: "black",
      level: "easy",
    });
    await vi.advanceTimersByTimeAsync(9999);
    expect(f.games.read(owner, game.id).engineState).toBe("THINKING");
    await vi.advanceTimersByTimeAsync(1);
    await f.games.waitForEngine(owner, game.id);
    const retry = f.games.read(owner, game.id);
    expect(retry.status).toBe("ACTIVE");
    expect(retry.engineError).toBe("ENGINE_TIMEOUT");
    expect(retry.history).toHaveLength(1);
    release();
    await Promise.resolve();
    await Promise.resolve();
    expect(f.engine.search).not.toHaveBeenCalled();
  } finally {
    await f.games.close();
    vi.useRealTimers();
  }
});
it("shares one ten-second deadline across readiness and search, cancels late output and retries same board", async () => {
  vi.useFakeTimers();
  const f = fixture();
  try {
    await f.games.ready();
    let prepared!: () => void, late!: (result: EngineResult) => void;
    f.engine.ready
      .mockResolvedValueOnce(undefined)
      .mockImplementationOnce(() => new Promise<void>((r) => (prepared = r)));
    f.engine.search.mockImplementationOnce(
      () => new Promise((r) => (late = r)),
    );
    const game = await f.games.create(owner, {
      requestedSide: "black",
      level: "easy",
    });
    await vi.advanceTimersByTimeAsync(8000);
    prepared();
    await vi.advanceTimersByTimeAsync(0);
    expect(f.engine.search).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1999);
    expect(f.games.read(owner, game.id).engineState).toBe("THINKING");
    await vi.advanceTimersByTimeAsync(1);
    await f.games.waitForEngine(owner, game.id);
    const retry = f.games.read(owner, game.id);
    expect(retry.engineError).toBe("ENGINE_TIMEOUT");
    expect(f.engine.search.mock.calls[0]![1]?.signal?.aborted).toBe(true);
    late({
      move: { from: 27, to: 36 },
      terminal: null,
      completedDepth: 2,
      targetDepth: 2,
      elapsedMs: 1,
      nodes: 1,
      timedOut: false,
    });
    await vi.advanceTimersByTimeAsync(0);
    expect(f.games.read(owner, game.id).position).toBe(game.position);
    await f.games.retry(owner, game.id, { version: retry.version });
    await f.games.waitForEngine(owner, game.id);
    expect(f.games.read(owner, game.id).history).toHaveLength(2);
    expect(f.engine.search.mock.calls[1]![0].position).toBe(game.position);
  } finally {
    await f.games.close();
    vi.useRealTimers();
  }
});
it("resignation drains a pending preparation without waiting for the watchdog or closing shared worker", async () => {
  vi.useFakeTimers();
  const f = fixture();
  try {
    await f.games.ready();
    f.engine.ready
      .mockResolvedValueOnce(undefined)
      .mockImplementationOnce(() => new Promise<void>(() => {}));
    const game = await f.games.create(owner, {
      requestedSide: "black",
      level: "easy",
    });
    await f.games.resign(owner, game.id, { version: 1 });
    await f.games.waitForEngine(owner, game.id);
    await vi.advanceTimersByTimeAsync(10000);
    expect(f.lifecycle.finish).toHaveBeenCalledTimes(1);
    expect(f.engine.close).not.toHaveBeenCalled();
    expect(f.games.read(owner, game.id).status).toBe("FINISHED");
  } finally {
    await f.games.close();
    vi.useRealTimers();
  }
});
it("clears the owned watchdog when close drains unresolved preparation", async () => {
  vi.useFakeTimers();
  const f = fixture(),
    set = vi.spyOn(globalThis, "setTimeout"),
    clear = vi.spyOn(globalThis, "clearTimeout");
  try {
    await f.games.ready();
    f.engine.ready
      .mockResolvedValueOnce(undefined)
      .mockImplementationOnce(() => new Promise<void>(() => {}));
    const game = await f.games.create(owner, {
      requestedSide: "black",
      level: "easy",
    });
    const index = set.mock.calls.findIndex((call) => call[1] === 10000);
    expect(index).toBeGreaterThanOrEqual(0);
    const handle = set.mock.results[index]!.value;
    await f.games.close();
    expect(clear).toHaveBeenCalledWith(handle);
    await vi.advanceTimersByTimeAsync(10000);
    expect(f.games.read(owner, game.id).engineError).toBeNull();
    expect(f.lifecycle.finish).not.toHaveBeenCalled();
    expect(f.engine.close).not.toHaveBeenCalled();
  } finally {
    await f.games.close();
    set.mockRestore();
    clear.mockRestore();
    vi.useRealTimers();
  }
});
it("distinguishes an actual preparation error from the whole-turn timeout", async () => {
  const f = fixture();
  await f.games.ready();
  f.engine.ready
    .mockResolvedValueOnce(undefined)
    .mockRejectedValueOnce(new EngineError("ENGINE_FAILED"));
  const game = await f.games.create(owner, {
    requestedSide: "black",
    level: "easy",
  });
  await f.games.waitForEngine(owner, game.id);
  expect(f.games.read(owner, game.id).status).toBe("ABANDONED");
  expect(f.lifecycle.finish).toHaveBeenCalledTimes(1);
  expect(f.engine.search).not.toHaveBeenCalled();
});
it("rejects late engine response by monotonic deadline even before a delayed timer runs", async () => {
  const clock = vi.spyOn(performance, "now").mockReturnValue(0),
    f = fixture();
  try {
    await f.games.ready();
    f.engine.search.mockImplementationOnce(async (request) => {
      clock.mockReturnValue(10001);
      return {
        move: legalMoves(parsePosition(request.position))[0]!,
        terminal: null,
        completedDepth: 2,
        targetDepth: 2,
        elapsedMs: 1,
        nodes: 1,
        timedOut: false,
      };
    });
    const game = await f.games.create(owner, {
      requestedSide: "black",
      level: "easy",
    });
    await f.games.waitForEngine(owner, game.id);
    expect(f.games.read(owner, game.id).engineError).toBe("ENGINE_TIMEOUT");
    expect(f.games.read(owner, game.id).history).toHaveLength(1);
  } finally {
    await f.games.close();
    clock.mockRestore();
  }
});
