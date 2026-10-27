import { expect, it, vi } from "vitest";
import { EngineError, type EngineResult } from "@xiangqi/engine";
import { legalMoves, parsePosition } from "@xiangqi/xiangqi-core";
import { AiGames } from "@server/game/ai/ai-games.js";
import { owner, fixture } from "./ai-games.test-helper.js";
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
  // Capture the in-flight engine job before resignation; the terminal game is evicted by the next create.
  const oldEngine = f.games.waitForEngine(owner, old.id);
  await f.games.resign(owner, old.id, { version: 1 });
  const next = await f.games.create(owner, {
    requestedSide: "red",
    level: "medium",
  });
  const before = f.games.read(owner, next.id);
  resolve({
    move: { from: 27, to: 36 },
    terminal: null,
    completedDepth: 2,
    targetDepth: 2,
    elapsedMs: 1,
    nodes: 1,
    timedOut: false,
  });
  await oldEngine;
  expect(next.id).not.toBe(old.id);
  expect(f.games.read(owner, next.id)).toEqual(before);
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
