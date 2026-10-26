import { expect, it, vi } from "vitest";
import { EngineError } from "@xiangqi/engine";
import { legalMoves, parsePosition } from "@xiangqi/xiangqi-core";
import { owner, fixture } from "./ai-games.test-helper.js";
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
