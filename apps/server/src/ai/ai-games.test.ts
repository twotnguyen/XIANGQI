import { RoomError } from "../room/contracts.js";
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
import { type AiOptions, AiGames } from "./ai-games.js";
import type {
  AiTransactions,
  AiTransaction,
  AiCommit,
  AiOrigin,
} from "./ai-transactions.js";
const owner = "00000000-0000-0000-0000-000000000001";
// Explicit unit-only transaction driver: serial gate, staged commit and authority faults.
function memoryTransactions() {
  const lifecycle = {
    reserve: vi.fn<AiTransaction["reserve"]>(async () => {}),
    check: vi.fn<AiTransaction["check"]>(async () => {}),
    finish: vi.fn<AiTransaction["finish"]>(async () => {}),
  };
  const commit = vi.fn(async () => {});
  const pending = new Map<string, Promise<unknown>>();
  let inTransaction = false;
  const origins: AiOrigin[] = [];
  const transactions: AiTransactions = {
    async run<T>(
      ownerId: string,
      _origin: AiOrigin,
      work: (tx: AiTransaction) => Promise<AiCommit<T>>,
    ) {
      origins.push(_origin);
      const previous = pending.get(ownerId) ?? Promise.resolve();
      const next = previous
        .catch(() => {})
        .then(async () => {
          inTransaction = true;
          try {
            let authorized = false;
            const transaction: AiTransaction = {
              reserve: async (gameId) => {
                await lifecycle.reserve(gameId);
                authorized = true;
              },
              check: async (gameId) => {
                await lifecycle.check(gameId);
                authorized = true;
              },
              finish: async (snapshot) => {
                await lifecycle.finish(snapshot);
                authorized = true;
              },
            };
            const staged = await work(transaction);
            if (!authorized)
              throw new RoomError(
                "AI_AUTHORITY_REQUIRED",
                "Thiếu chứng thực thao tác",
                503,
              );
            await commit();
            staged.install();
            return staged.value;
          } finally {
            inTransaction = false;
          }
        });
      pending.set(ownerId, next);
      try {
        return await next;
      } finally {
        if (pending.get(ownerId) === next) pending.delete(ownerId);
      }
    },
  };
  return {
    transactions,
    lifecycle,
    commit,
    isInTransaction: () => inTransaction,
    origins,
  };
}
function fixture(randomSide?: () => "red" | "black") {
  const driver = memoryTransactions();
  const { transactions } = driver;
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
    games: new AiGames({ engine, transactions, randomSide }),
    engine,
    ...driver,
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

it("counts replacement preparation inside the retry whole-turn deadline", async () => {
  vi.useFakeTimers();
  const f = fixture();
  let release: (() => void) | undefined;
  try {
    await f.games.ready();
    f.engine.search.mockRejectedValueOnce(new EngineError("ENGINE_TIMEOUT"));
    const game = await f.games.create(owner, {
      requestedSide: "black",
      level: "easy",
    });
    await f.games.waitForEngine(owner, game.id);
    const prior = f.games.read(owner, game.id);
    f.engine.ready.mockImplementationOnce(
      () =>
        new Promise<void>((resolve) => {
          release = resolve;
        }),
    );
    const command = f.games.retry(owner, game.id, { version: prior.version });
    void command.catch(() => {});
    await vi.advanceTimersByTimeAsync(0);
    expect(f.games.read(owner, game.id).engineState).toBe("THINKING");
    await vi.advanceTimersByTimeAsync(10000);
    await command;
    await f.games.waitForEngine(owner, game.id);
    const after = f.games.read(owner, game.id);
    expect(after.id).toBe(game.id);
    expect(after.position).toBe(game.position);
    expect(after.engineError).toBe("ENGINE_TIMEOUT");
    expect(after.engineState).toBe("RETRY");
    expect(f.engine.search).toHaveBeenCalledTimes(1);
    release!();
    await vi.advanceTimersByTimeAsync(0);
    expect(f.engine.search).toHaveBeenCalledTimes(1);
  } finally {
    release?.();
    await f.games.close();
    vi.useRealTimers();
  }
});

it("does not publish staged human move or start search before COMMIT and rolls failed commit back", async () => {
  const f = fixture();
  await f.games.ready();
  const g = await f.games.create(owner, {
    requestedSide: "red",
    level: "easy",
  });
  let release!: () => void, entered!: () => void;
  const started = new Promise<void>((r) => (entered = r));
  f.commit.mockImplementationOnce(async () => {
    entered();
    await new Promise<void>((r) => (release = r));
    throw Error("commit failed");
  });
  const command = f.games.move(owner, g.id, {
    version: g.version,
    move: legalMoves(parsePosition(g.position))[0]!,
  });
  const rejected = expect(command).rejects.toMatchObject({
    code: "AI_UNAVAILABLE",
  });
  await started;
  expect(f.games.read(owner, g.id)).toEqual(g);
  expect(f.engine.search).not.toHaveBeenCalled();
  release();
  await rejected;
  expect(f.games.read(owner, g.id)).toEqual(g);
  await f.games.close();
});
it("discards delayed engine output after SQL authority loss without inventing engine failure", async () => {
  const f = fixture();
  await f.games.ready();
  let release!: (r: EngineResult) => void;
  f.engine.search.mockImplementationOnce(
    () => new Promise((r) => (release = r)),
  );
  const g = await f.games.create(owner, {
    requestedSide: "black",
    level: "easy",
  });
  f.lifecycle.check.mockRejectedValueOnce(Error("AI_BOOT_EXPIRED"));
  release({
    move: legalMoves(parsePosition(g.position))[0]!,
    terminal: null,
    completedDepth: 2,
    targetDepth: 2,
    elapsedMs: 1,
    nodes: 1,
    timedOut: false,
  });
  await f.games.waitForEngine(owner, g.id);
  expect(f.games.read(owner, g.id)).toEqual(g);
  expect(f.lifecycle.finish).not.toHaveBeenCalled();
  await f.games.close();
});
it("prepares and searches only outside transaction gate", async () => {
  const f = fixture();
  f.engine.ready.mockImplementation(async () => {
    expect(f.isInTransaction()).toBe(false);
  });
  f.engine.search.mockImplementation(async (request) => {
    expect(f.isInTransaction()).toBe(false);
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
  await f.games.ready();
  const g = await f.games.create(owner, {
    requestedSide: "black",
    level: "easy",
  });
  await f.games.waitForEngine(owner, g.id);
  expect(f.games.read(owner, g.id).history).toHaveLength(2);
  await f.games.close();
});

it("holds creation behind commit and launches its first search only after installation", async () => {
  const f = fixture();
  await f.games.ready();
  let release!: () => void, entered!: () => void;
  const started = new Promise<void>((r) => (entered = r));
  f.commit.mockImplementationOnce(async () => {
    entered();
    await new Promise<void>((r) => (release = r));
  });
  const creating = f.games.create(owner, {
    requestedSide: "black",
    level: "easy",
  });
  await started;
  const id = f.lifecycle.reserve.mock.calls[0]![0];
  expect(() => f.games.read(owner, id)).toThrow();
  expect(f.engine.search).not.toHaveBeenCalled();
  release();
  const g = await creating;
  await f.games.waitForEngine(owner, g.id);
  expect(f.games.read(owner, g.id).history).toHaveLength(2);
  await f.games.close();
});
it("does not commit a human transition when exact slot authority was reclaimed", async () => {
  const f = fixture();
  await f.games.ready();
  const g = await f.games.create(owner, {
    requestedSide: "red",
    level: "easy",
  });
  f.lifecycle.check.mockRejectedValueOnce(Error("AI_RESERVATION_LOST"));
  await expect(
    f.games.resign(owner, g.id, { version: g.version }),
  ).rejects.toMatchObject({ code: "AI_UNAVAILABLE" });
  expect(f.games.read(owner, g.id)).toEqual(g);
  expect(f.lifecycle.finish).not.toHaveBeenCalled();
  await f.games.close();
});
it("does not reclassify a timeout as retry if its authoritative SQL gate fails", async () => {
  const f = fixture();
  await f.games.ready();
  let reject!: (error: unknown) => void;
  f.engine.search.mockImplementationOnce(
    () => new Promise((_, r) => (reject = r)),
  );
  const g = await f.games.create(owner, {
    requestedSide: "black",
    level: "easy",
  });
  f.lifecycle.check.mockRejectedValueOnce(Error("SQL unavailable"));
  reject(new EngineError("ENGINE_TIMEOUT"));
  await f.games.waitForEngine(owner, g.id);
  expect(f.games.read(owner, g.id)).toEqual(g);
  expect(f.lifecycle.finish).not.toHaveBeenCalled();
  await f.games.close();
});
it("keeps committed FINALIZING when terminal transaction commit fails, then retries exact terminal", async () => {
  const f = fixture();
  await f.games.ready();
  const g = await f.games.create(owner, {
    requestedSide: "red",
    level: "easy",
  });
  f.commit
    .mockResolvedValueOnce(undefined)
    .mockRejectedValueOnce(Error("terminal commit lost"));
  await expect(
    f.games.resign(owner, g.id, { version: g.version }),
  ).rejects.toMatchObject({ code: "AI_UNAVAILABLE" });
  const pending = f.games.read(owner, g.id);
  expect(pending.status).toBe("FINALIZING");
  const done = await f.games.retry(owner, g.id, { version: pending.version });
  expect(done.status).toBe("FINISHED");
  expect(f.lifecycle.finish.mock.calls[0]![0]).toEqual(
    f.lifecycle.finish.mock.calls[1]![0],
  );
  await f.games.close();
});

it.each([
  ["AUTH_REQUIRED", 401],
  ["AUTH_UNAVAILABLE", 503],
  ["TAB_READ_ONLY", 409],
] as const)(
  "preserves known authority status %s without disclosing unknown SQL",
  async (code, status) => {
    const f = fixture();
    await f.games.ready();
    const g = await f.games.create(owner, {
      requestedSide: "red",
      level: "easy",
    });
    const error = new RoomError(code, "Thông báo xác thực an toàn", status);
    f.lifecycle.check.mockRejectedValueOnce(error);
    await expect(
      f.games.resign(owner, g.id, { version: g.version }),
    ).rejects.toBe(error);
    expect(f.games.read(owner, g.id)).toEqual(g);
    await f.games.close();
  },
);

it("passes the same private human origin through admission, finalizing and durable finish", async () => {
  const f = fixture();
  const origin: AiOrigin = {
    kind: "human",
    proof: { accessToken: "synthetic-bearer", appSession: "synthetic-app-cap" },
    tab: { tabId: owner, connectionId: owner, generation: 1 },
  };
  await f.games.ready();
  const g = await f.games.create(
    owner,
    { requestedSide: "red", level: "easy" },
    origin,
  );
  await f.games.resign(owner, g.id, { version: g.version }, origin);
  expect(f.origins).toHaveLength(3);
  expect(f.origins.every((item) => item === origin)).toBe(true);
  await f.games.close();
});
it("drains a pending commit during close and never installs or launches its late creation", async () => {
  const f = fixture();
  await f.games.ready();
  let release!: () => void, entered!: () => void;
  const started = new Promise<void>((r) => (entered = r));
  f.commit.mockImplementationOnce(async () => {
    entered();
    await new Promise<void>((r) => (release = r));
  });
  const creating = f.games.create(owner, {
    requestedSide: "black",
    level: "easy",
  });
  const rejection = expect(creating).rejects.toMatchObject({
    code: "AI_CLOSED",
  });
  await started;
  const id = f.lifecycle.reserve.mock.calls[0]![0];
  let closed = false;
  const closing = f.games.close().then(() => (closed = true));
  await Promise.resolve();
  expect(closed).toBe(false);
  release();
  await rejection;
  await closing;
  expect(() => f.games.read(owner, id)).toThrow();
  expect(f.engine.search).not.toHaveBeenCalled();
  expect(f.lifecycle.finish).not.toHaveBeenCalled();
});

it("rechecks finalizing retry version inside the finish transaction without demanding a released slot", async () => {
  const f = fixture();
  await f.games.ready();
  const g = await f.games.create(owner, {
    requestedSide: "red",
    level: "easy",
  });
  f.lifecycle.finish.mockRejectedValueOnce(Error("lost terminal ACK"));
  await expect(
    f.games.resign(owner, g.id, { version: 1 }),
  ).rejects.toMatchObject({ code: "AI_UNAVAILABLE" });
  const pending = f.games.read(owner, g.id),
    checks = f.lifecycle.check.mock.calls.length;
  await expect(
    f.games.retry(owner, g.id, { version: pending.version - 1 }),
  ).rejects.toMatchObject({ code: "AI_VERSION_CONFLICT" });
  f.lifecycle.check.mockRejectedValue(Error("released slot"));
  const ended = await f.games.retry(owner, g.id, { version: pending.version });
  expect(ended.status).toBe("FINISHED");
  expect(f.lifecycle.check).toHaveBeenCalledTimes(checks);
  expect(f.lifecycle.finish).toHaveBeenCalledTimes(2);
  await f.games.close();
});
