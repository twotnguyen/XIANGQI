import { randomUUID } from "node:crypto";
import { beforeEach, expect, it, vi } from "vitest";
import { initialPosition, serializePosition } from "@xiangqi/xiangqi-core";
import { RoomError, type RoomScope } from "@server/game/room/room.types.js";
import { AiError, type AiSnapshot } from "@server/game/ai/ai-games.js";
import { AiHttpService } from "@server/game/ai/ai-http.service.js";
import type { SqlAiTransactions } from "@server/game/ai/ai-sql-transactions.js";
import type { AiOrigin } from "@server/game/ai/ai-transactions.js";
const owner = randomUUID(),
  gameId = randomUUID(),
  bootId = randomUUID();
const origin: Extract<AiOrigin, { kind: "human" }> = {
  kind: "human",
  proof: { accessToken: "synthetic-member", appSession: "a".repeat(43) },
  tab: { tabId: randomUUID(), connectionId: "real_socket_1", generation: 2 },
};
const active: AiSnapshot = {
  id: gameId,
  ownerId: owner,
  requestedSide: "random",
  actualSide: "red",
  level: "easy",
  position: serializePosition(initialPosition()),
  history: [serializePosition(initialPosition())],
  version: 1,
  status: "ACTIVE",
  engineState: "IDLE",
  engineError: null,
  outcome: null,
};
const query = vi.fn(async () => ({
  rows: [{ ai_game_id: gameId, ai_boot_id: bootId }],
}));
const scope = {
  actor: { userId: owner, kind: "member" },
  lockedActorIds: new Set([owner]),
  lockedRoomIds: new Set(),
  client: { query },
} as unknown as RoomScope;
const runner = {
  read: vi.fn(async (_proof, work) => work(scope, owner)),
} as unknown as Pick<SqlAiTransactions, "read">;
const read = vi.fn(() => structuredClone(active)),
  create = vi.fn(async () => structuredClone(active)),
  move = vi.fn(async () => structuredClone(active)),
  resign = vi.fn(async () => ({
    ...structuredClone(active),
    status: "FINISHED" as const,
  })),
  retry = vi.fn(async () => structuredClone(active));
const inspect = vi.fn(async () => ({
  mode: "controller" as "controller" | "readonly",
  reason: null as "other_tab" | null,
  generation: 2,
}));
const assertRetained = vi.fn(async () => {}),
  check = vi.fn(async () => ({
    ownerId: owner,
    gameId,
    bootId,
    acquiredAt: "2026-10-11T00:00:00Z",
  }));
const service = new AiHttpService({
  games: { read, create, move, resign, retry },
  transactions: runner,
  reservations: { check },
  control: { inspect, assertRetained },
  bootId,
});
beforeEach(() => {
  vi.clearAllMocks();
  query.mockResolvedValue({
    rows: [{ ai_game_id: gameId, ai_boot_id: bootId }],
  });
  read.mockImplementation(() => structuredClone(active));
  inspect.mockResolvedValue({
    mode: "controller",
    reason: null,
    generation: 2,
  });
  check.mockResolvedValue({
    ownerId: owner,
    gameId,
    bootId,
    acquiredAt: "2026-10-11T00:00:00Z",
  });
  assertRetained.mockResolvedValue();
});
it("reads current game from the authenticated SQL actor and verifies exact boot reservation", async () => {
  expect(await service.current(origin.proof)).toEqual({ gameId });
  expect(runner.read).toHaveBeenCalledWith(origin.proof, expect.any(Function));
  expect(check).toHaveBeenCalledWith(scope, { gameId, bootId });
  expect(read).toHaveBeenCalledWith(owner, gameId);
  expect(inspect).not.toHaveBeenCalled();
});
it("returns no current game for an online slot without modifying it", async () => {
  query.mockResolvedValueOnce({
    rows: [{ ai_game_id: null, ai_boot_id: null }],
  } as never);
  expect(await service.current(origin.proof)).toEqual({ gameId: null });
  expect(check).not.toHaveBeenCalled();
  expect(read).not.toHaveBeenCalled();
});
it("returns no current game for an empty SQL slot", async () => {
  query.mockResolvedValueOnce({ rows: [] } as never);
  expect(await service.current(origin.proof)).toEqual({ gameId: null });
  expect(check).not.toHaveBeenCalled();
});
it("fails closed for an AI slot owned by another server boot", async () => {
  query.mockResolvedValueOnce({
    rows: [{ ai_game_id: gameId, ai_boot_id: randomUUID() }],
  });
  await expect(service.current(origin.proof)).rejects.toMatchObject({
    code: "AI_RESERVATION_LOST",
  });
  expect(read).not.toHaveBeenCalled();
});
it("reads private RAM only inside the authenticated owner gate and retains a read-only tab", async () => {
  inspect.mockResolvedValue({
    mode: "readonly",
    reason: "other_tab",
    generation: 2,
  });
  const result = await service.read(origin, gameId);
  expect(result.snapshot).toEqual(active);
  expect(result.control).toEqual({
    mode: "readonly",
    reason: "other_tab",
    generation: 2,
  });
  expect(Date.parse(result.serverNow)).toBeGreaterThan(0);
  expect(inspect).toHaveBeenCalledWith(scope, origin);
  expect(assertRetained).toHaveBeenCalledWith(scope, gameId);
  expect(move).not.toHaveBeenCalled();
});
it("keeps terminal replay state readable after reservation was released", async () => {
  read.mockReturnValueOnce({
    ...structuredClone(active),
    status: "FINISHED",
    outcome: { reason: "RESIGN", winner: "black" },
  });
  expect((await service.read(origin, gameId)).snapshot.status).toBe("FINISHED");
  expect(check).not.toHaveBeenCalled();
  expect(assertRetained).not.toHaveBeenCalled();
});
it("rejects expired retention without publishing a stale board", async () => {
  assertRetained.mockRejectedValueOnce(
    new RoomError("AI_GAME_EXPIRED", "synthetic", 409),
  );
  await expect(service.read(origin, gameId)).rejects.toMatchObject({
    code: "AI_GAME_EXPIRED",
  });
});
it("rejects a forged physical connection before reading private RAM", async () => {
  inspect.mockRejectedValueOnce(
    new RoomError("AI_AUTHORITY_REQUIRED", "synthetic", 403),
  );
  await expect(service.read(origin, gameId)).rejects.toMatchObject({
    code: "AI_AUTHORITY_REQUIRED",
  });
  expect(read).not.toHaveBeenCalled();
});
it.each(["create", "move", "resign", "retry"] as const)(
  "rejects read-only %s before mutation",
  async (action) => {
    inspect.mockResolvedValueOnce({
      mode: "readonly",
      reason: "other_tab",
      generation: 2,
    });
    const promise =
      action === "create"
        ? service.create(origin, { level: "easy", requestedSide: "random" })
        : action === "move"
          ? service.move(origin, gameId, {
              version: 1,
              move: { from: 54, to: 45 },
            })
          : service[action](origin, gameId, 1);
    await expect(promise).rejects.toMatchObject({ code: "TAB_READ_ONLY" });
    expect(create).not.toHaveBeenCalled();
    expect(move).not.toHaveBeenCalled();
    expect(resign).not.toHaveBeenCalled();
    expect(retry).not.toHaveBeenCalled();
  },
);
it.each(["create", "move", "resign", "retry"] as const)(
  "authenticates %s, passes the immutable human origin, and rereads after commit",
  async (action) => {
    const result =
      action === "create"
        ? await service.create(origin, {
            level: "easy",
            requestedSide: "random",
          })
        : action === "move"
          ? await service.move(origin, gameId, {
              version: 1,
              move: { from: 54, to: 45 },
            })
          : await service[action](origin, gameId, 1);
    expect(runner.read).toHaveBeenCalledTimes(2);
    expect(inspect).toHaveBeenCalledTimes(3);
    expect(result.snapshot).toEqual(active);
    if (action === "create")
      expect(create).toHaveBeenCalledWith(
        owner,
        { level: "easy", requestedSide: "random" },
        origin,
      );
    else if (action === "move")
      expect(move).toHaveBeenCalledWith(
        owner,
        gameId,
        { version: 1, move: { from: 54, to: 45 } },
        origin,
      );
    else
      expect(action === "resign" ? resign : retry).toHaveBeenCalledWith(
        owner,
        gameId,
        { version: 1 },
        origin,
      );
  },
);
it("fails the post-commit response when the session expires; it never returns a cached mutation result", async () => {
  vi.mocked(runner.read)
    .mockImplementationOnce(async (_proof, work) => work(scope, owner))
    .mockRejectedValueOnce(new RoomError("SESSION_EXPIRED", "synthetic", 401));
  await expect(
    service.create(origin, { level: "easy", requestedSide: "red" }),
  ).rejects.toMatchObject({ code: "SESSION_EXPIRED" });
  expect(create).toHaveBeenCalledOnce();
});
it("keeps proof, tab and move fixed while initial authentication is awaiting", async () => {
  let release!: () => void;
  const gate = new Promise<void>((r) => (release = r));
  vi.mocked(runner.read).mockImplementationOnce(async (_proof, work) => {
    await gate;
    return work(scope, owner);
  });
  const supplied = structuredClone(origin),
    input = { version: 1, move: { from: 54, to: 45 } },
    pending = service.move(supplied, gameId, input);
  supplied.proof.appSession = "attacker";
  supplied.tab.generation = 99;
  input.move.to = 46;
  release();
  await pending;
  expect(move).toHaveBeenCalledWith(
    owner,
    gameId,
    { version: 1, move: { from: 54, to: 45 } },
    origin,
  );
});
it("preserves ownership denial from the canonical game store", async () => {
  read.mockImplementationOnce(() => {
    throw new AiError("AI_FORBIDDEN");
  });
  await expect(service.read(origin, gameId)).rejects.toMatchObject({
    code: "AI_FORBIDDEN",
  });
});

it("rechecks physical authority after awaited reservation and retention reads", async () => {
  inspect
    .mockResolvedValueOnce({ mode: "controller", reason: null, generation: 2 })
    .mockRejectedValueOnce(
      new RoomError(
        "AI_AUTHORITY_REQUIRED",
        "synthetic disconnected during read",
        403,
      ),
    );
  await expect(service.read(origin, gameId)).rejects.toMatchObject({
    code: "AI_AUTHORITY_REQUIRED",
    status: 403,
  });
  expect(assertRetained).toHaveBeenCalledOnce();
});
