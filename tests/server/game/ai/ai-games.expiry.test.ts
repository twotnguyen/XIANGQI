import { expect, it } from "vitest";
import { fixture, owner } from "./ai-games.test-helper.js";
import type { EngineResult } from "@xiangqi/engine";

it("stages a neutral physical-expiry snapshot and keeps canonical RAM when COMMIT rolls back", async () => {
  const f = fixture();
  await f.games.ready();
  try {
    const initial = await f.games.create(owner, {
      requestedSide: "red",
      level: "easy",
    });
    let release!: () => void, entered!: () => void;
    const started = new Promise<void>((resolve) => (entered = resolve));
    f.commit.mockImplementationOnce(async () => {
      entered();
      await new Promise<void>((resolve) => (release = resolve));
      throw Error("synthetic expiry COMMIT failure");
    });
    const expiring = f.games.expire(owner, initial.id);
    const rejected = expect(expiring).rejects.toThrow(
      "synthetic expiry COMMIT failure",
    );
    await started;
    expect(f.games.read(owner, initial.id)).toEqual(initial);
    expect(f.lifecycle.expire).toHaveBeenCalledWith(
      initial.id,
      {
        ...initial,
        status: "ABANDONED",
        version: initial.version + 1,
        outcome: { reason: "ENGINE_FAILURE", winner: null },
      },
      "DISCONNECT",
    );
    release();
    await rejected;
    expect(f.games.read(owner, initial.id)).toEqual(initial);
    expect(await f.games.expire(owner, initial.id)).toBe(true);
    expect(() => f.games.read(owner, initial.id)).toThrow();
  } finally {
    await f.games.close();
  }
});

it("keeps a reconnected or replaced candidate when SQL expiry recheck returns false", async () => {
  const f = fixture();
  await f.games.ready();
  try {
    const initial = await f.games.create(owner, {
      requestedSide: "red",
      level: "easy",
    });
    f.lifecycle.expire.mockResolvedValueOnce(false);
    expect(await f.games.expire(owner, initial.id)).toBe(false);
    expect(f.games.read(owner, initial.id)).toEqual(initial);
  } finally {
    await f.games.close();
  }
});

it("preserves a real pending terminal outcome rather than replacing it with physical expiry", async () => {
  const f = fixture();
  await f.games.ready();
  try {
    const initial = await f.games.create(owner, {
      requestedSide: "red",
      level: "easy",
    });
    f.lifecycle.finish.mockRejectedValueOnce(
      Error("synthetic history unavailable"),
    );
    await expect(
      f.games.resign(owner, initial.id, { version: initial.version }),
    ).rejects.toMatchObject({ code: "AI_UNAVAILABLE" });
    const pending = f.games.read(owner, initial.id);
    expect(pending.status).toBe("FINALIZING");
    await f.games.expire(owner, initial.id);
    expect(f.lifecycle.expire).toHaveBeenCalledWith(
      initial.id,
      { ...pending, status: "FINISHED" },
      undefined,
    );
  } finally {
    await f.games.close();
  }
});

it("cancels engine work only after successful expiry installation and ignores its late completion", async () => {
  const f = fixture();
  let signal!: AbortSignal;
  let complete!: (result: EngineResult) => void;
  f.engine.search.mockImplementationOnce((_request, options) => {
    signal = options!.signal!;
    return new Promise<EngineResult>((resolve) => (complete = resolve));
  });
  await f.games.ready();
  try {
    const initial = await f.games.create(owner, {
      requestedSide: "black",
      level: "easy",
    });
    f.commit.mockRejectedValueOnce(Error("synthetic rollback"));
    await expect(f.games.expire(owner, initial.id)).rejects.toThrow(
      "synthetic rollback",
    );
    expect(signal.aborted).toBe(false);
    expect(f.games.read(owner, initial.id)).toEqual(initial);
    await f.games.expire(owner, initial.id);
    expect(signal.aborted).toBe(true);
    complete({
      move: { from: 54, to: 45 },
      terminal: null,
      completedDepth: 2,
      targetDepth: 2,
      elapsedMs: 1,
      nodes: 1,
      timedOut: false,
    });
    await Promise.resolve();
    expect(() => f.games.read(owner, initial.id)).toThrow();
    expect(f.lifecycle.finish).not.toHaveBeenCalled();
  } finally {
    await f.games.close();
  }
});
