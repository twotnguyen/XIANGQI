import { expect, it, vi } from "vitest";
import { initialPosition, serializePosition } from "@xiangqi/xiangqi-core";
import { AiHttpService } from "@server/game/ai/ai-http.service.js";
import type { AiSnapshot } from "@server/game/ai/ai-games.js";
import type { AiOrigin } from "@server/game/ai/ai-transactions.js";
import type { RoomScope } from "@server/game/room/room.types.js";

const owner = "11111111-1111-4111-8111-111111111111";
const gameId = "22222222-2222-4222-8222-222222222222";
const origin: Extract<AiOrigin, { kind: "human" }> = {
  kind: "human",
  proof: { guestCapability: "g".repeat(43) },
  tab: {
    tabId: "33333333-3333-4333-8333-333333333333",
    connectionId: "synthetic-socket",
    generation: 1,
  },
};

function serviceFor(kind: "member" | "guest") {
  const position = serializePosition(initialPosition());
  const snapshot: AiSnapshot = {
    id: gameId,
    ownerId: owner,
    requestedSide: "red",
    actualSide: "red",
    level: "easy",
    position,
    history: [position],
    version: 3,
    status: "ACTIVE",
    engineState: "IDLE",
    engineError: null,
    undoUsed: 1,
    outcome: null,
  };
  // Chỉ giả biên giao dịch đã xác thực; quyền Undo chạy trong AiHttpService thật.
  const scope = { actor: { userId: owner, kind } } as RoomScope;
  const games = {
    read: vi.fn(() => snapshot),
    undo: vi.fn(async () => snapshot),
    create: vi.fn(),
    move: vi.fn(),
    resign: vi.fn(),
    retry: vi.fn(),
  };
  const inspect = vi.fn(async () => ({
    mode: "controller" as const,
    reason: null,
    generation: 1,
  }));
  const service = new AiHttpService({
    games,
    transactions: {
      async read(_proof, work) {
        return work(scope, owner);
      },
    },
    reservations: { check: vi.fn(), held: vi.fn() },
    bootId: "44444444-4444-4444-8444-444444444444",
    control: { inspect, assertRetained: vi.fn() },
  });
  return { service, games, inspect };
}

it("rejects an authenticated guest before invoking the undo mutation", async () => {
  const { service, games, inspect } = serviceFor("guest");
  await expect(service.undo(origin, gameId, 2)).rejects.toMatchObject({
    code: "AI_FORBIDDEN",
    status: 403,
  });
  expect(games.undo).not.toHaveBeenCalled();
  expect(games.read).not.toHaveBeenCalled();
  expect(inspect).not.toHaveBeenCalled();
});

it("keeps undo available for a validated member and returns the canonical snapshot", async () => {
  const { service, games } = serviceFor("member");
  const memberOrigin: typeof origin = {
    ...origin,
    proof: { accessToken: "synthetic-member", appSession: "s".repeat(43) },
  };
  const result = await service.undo(memberOrigin, gameId, 2);
  expect(games.undo).toHaveBeenCalledExactlyOnceWith(
    owner,
    gameId,
    { version: 2 },
    memberOrigin,
  );
  expect(result.snapshot.undoUsed).toBe(1);
  expect(result.snapshot.version).toBe(3);
});
