import { afterEach, expect, it, vi } from "vitest";
import { EngineError, type EngineResult } from "@xiangqi/engine";
import {
  legalMoves,
  parsePosition,
  playMove,
  serializePosition,
} from "@xiangqi/xiangqi-core";
import { AiError } from "@server/game/ai/ai-games.js";
import { RoomError } from "@server/game/room/room.types.js";
import { owner, fixture } from "./ai-games.test-helper.js";

const thirtyMinutes = 30 * 60 * 1000;

afterEach(() => {
  vi.useRealTimers();
});

function deferred(): { promise: Promise<void>; resolve: () => void } {
  let done!: () => void;
  const promise = new Promise<void>((resolve) => {
    done = () => resolve();
  });
  return { promise, resolve: done };
}

/** Re-checks an assertion across real microtask turns; never advances the fake clock. */
async function settled(assertion: () => void, turns = 50): Promise<void> {
  for (let turn = 0; ; turn++) {
    try {
      assertion();
      return;
    } catch (error) {
      if (turn >= turns) throw error;
    }
    await Promise.resolve();
  }
}

function engineResult(position: string): EngineResult {
  return {
    move: legalMoves(parsePosition(position))[0]!,
    terminal: null,
    completedDepth: 2,
    targetDepth: 2,
    elapsedMs: 1,
    nodes: 1,
    timedOut: false,
  };
}

it("commits a computed engine turn once SQL recovers without searching again", async () => {
  vi.useFakeTimers();
  const f = fixture();
  try {
    await f.games.ready();
    const game = await f.games.create(owner, {
      requestedSide: "red",
      level: "easy",
    });
    // Human red moves; the engine's black reply is held before its SQL commit.
    const gate = deferred();
    f.engine.search.mockImplementationOnce(async (request) => {
      await gate.promise;
      return engineResult(request.position);
    });
    await f.games.move(owner, game.id, {
      version: game.version,
      move: legalMoves(parsePosition(game.position))[0]!,
    });
    f.lifecycle.check.mockRejectedValueOnce(new Error("private SQL"));
    gate.resolve();
    await f.games.waitForEngine(owner, game.id);
    const waiting = f.games.read(owner, game.id);
    expect(waiting.engineState).toBe("THINKING");
    expect(waiting.history).toHaveLength(2);
    const attempts = f.lifecycle.check.mock.calls.length;

    // The first retry is due exactly 1s after the failed commit.
    await vi.advanceTimersByTimeAsync(999);
    expect(f.lifecycle.check).toHaveBeenCalledTimes(attempts);
    expect(f.games.read(owner, game.id).engineState).toBe("THINKING");
    await vi.advanceTimersByTimeAsync(1);
    await settled(() =>
      expect(f.games.read(owner, game.id).engineState).toBe("IDLE"),
    );
    const done = f.games.read(owner, game.id);
    expect(done.history).toHaveLength(3);
    expect(done.position).toBe(
      serializePosition(
        playMove(
          parsePosition(waiting.position),
          legalMoves(parsePosition(waiting.position))[0]!,
        ),
      ),
    );
    expect(f.lifecycle.check).toHaveBeenCalledTimes(attempts + 1);
    expect(f.engine.search).toHaveBeenCalledTimes(1);
  } finally {
    await f.games.close();
  }
});

it("backs off transient commit retries 1s, 2s, 4s, 8s, 16s, then caps at 30s without searching again", async () => {
  vi.useFakeTimers();
  const f = fixture();
  try {
    await f.games.ready();
    const game = await f.games.create(owner, {
      requestedSide: "red",
      level: "easy",
    });
    const gate = deferred();
    f.engine.search.mockImplementationOnce(async (request) => {
      await gate.promise;
      return engineResult(request.position);
    });
    await f.games.move(owner, game.id, {
      version: game.version,
      move: legalMoves(parsePosition(game.position))[0]!,
    });
    // Initial commit plus five failing retries; the sixth retry succeeds.
    for (let i = 0; i < 6; i++)
      f.lifecycle.check.mockRejectedValueOnce(new Error("private SQL"));
    gate.resolve();
    await f.games.waitForEngine(owner, game.id);
    const attempts = f.lifecycle.check.mock.calls.length;

    // Failure n is retried after min(1s * 2^n, 30s); each boundary is checked on both sides.
    const delays = [1000, 2000, 4000, 8000, 16000, 30000];
    for (const [n, delay] of delays.entries()) {
      await vi.advanceTimersByTimeAsync(delay - 1);
      expect(f.lifecycle.check).toHaveBeenCalledTimes(attempts + n);
      await vi.advanceTimersByTimeAsync(1);
      await settled(() =>
        expect(f.lifecycle.check).toHaveBeenCalledTimes(attempts + n + 1),
      );
    }
    await settled(() =>
      expect(f.games.read(owner, game.id).engineState).toBe("IDLE"),
    );
    expect(f.games.read(owner, game.id).history).toHaveLength(3);
    expect(f.engine.search).toHaveBeenCalledTimes(1);
  } finally {
    await f.games.close();
  }
});

it("discards a deferred engine turn when SQL authority is lost instead of applying or failing it", async () => {
  vi.useFakeTimers();
  const f = fixture();
  try {
    await f.games.ready();
    const game = await f.games.create(owner, {
      requestedSide: "red",
      level: "easy",
    });
    const gate = deferred();
    f.engine.search.mockImplementationOnce(async (request) => {
      await gate.promise;
      return engineResult(request.position);
    });
    await f.games.move(owner, game.id, {
      version: game.version,
      move: legalMoves(parsePosition(game.position))[0]!,
    });
    f.lifecycle.check.mockRejectedValueOnce(new Error("private SQL"));
    gate.resolve();
    await f.games.waitForEngine(owner, game.id);
    const attempts = f.lifecycle.check.mock.calls.length;
    f.lifecycle.check.mockRejectedValueOnce(
      new RoomError("AI_RESERVATION_LOST", "private lease", 409),
    );

    await vi.advanceTimersByTimeAsync(1000);
    await settled(() =>
      expect(f.lifecycle.check).toHaveBeenCalledTimes(attempts + 1),
    );
    await vi.advanceTimersByTimeAsync(60000);
    expect(f.lifecycle.check).toHaveBeenCalledTimes(attempts + 1);
    const after = f.games.read(owner, game.id);
    expect(after.status).toBe("ACTIVE");
    expect(after.engineState).toBe("THINKING");
    expect(after.history).toHaveLength(2);
    expect(f.lifecycle.finish).not.toHaveBeenCalled();
    expect(f.engine.search).toHaveBeenCalledTimes(1);
  } finally {
    await f.games.close();
  }
});

it("keeps only the owner's latest terminal game and drops it after the grace window", async () => {
  const f = fixture();
  await f.games.ready();
  const first = await f.games.create(owner, {
    requestedSide: "red",
    level: "easy",
  });
  await f.games.resign(owner, first.id, { version: first.version });
  expect(f.games.read(owner, first.id).status).toBe("FINISHED");

  const second = await f.games.create(owner, {
    requestedSide: "red",
    level: "easy",
  });
  expect(() => f.games.read(owner, first.id)).toThrow(AiError);
  await f.games.resign(owner, second.id, { version: second.version });
  f.games.prune(performance.now());
  expect(f.games.read(owner, second.id).status).toBe("FINISHED");
  f.games.prune(performance.now() + thirtyMinutes);
  expect(() => f.games.read(owner, second.id)).toThrow(AiError);

  const third = await f.games.create(owner, {
    requestedSide: "red",
    level: "easy",
  });
  f.games.prune(performance.now() + thirtyMinutes);
  expect(f.games.read(owner, third.id).status).toBe("ACTIVE");
});

it("replaces an abandoned game with a same-side retry and evicts it", async () => {
  const f = fixture();
  await f.games.ready();
  f.engine.search.mockRejectedValueOnce(new EngineError("ENGINE_FAILED"));
  const game = await f.games.create(owner, {
    requestedSide: "black",
    level: "easy",
  });
  await f.games.waitForEngine(owner, game.id);
  const abandoned = f.games.read(owner, game.id);
  expect(abandoned.status).toBe("ABANDONED");
  const next = await f.games.retry(owner, game.id, {
    version: abandoned.version,
  });
  expect(next.actualSide).toBe(abandoned.actualSide);
  expect(() => f.games.read(owner, game.id)).toThrow(AiError);
});
