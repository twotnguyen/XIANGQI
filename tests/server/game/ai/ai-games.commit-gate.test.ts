import { RoomError } from "@server/game/room/room.types.js";
import { expect, it } from "vitest";
import { EngineError, type EngineResult } from "@xiangqi/engine";
import { legalMoves, parsePosition } from "@xiangqi/xiangqi-core";
import type { AiOrigin } from "@server/game/ai/ai-transactions.js";
import { owner, fixture } from "./ai-games.test-helper.js";
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
