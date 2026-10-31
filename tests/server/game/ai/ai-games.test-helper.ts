import { RoomError } from "@server/game/room/room.types.js";
import { vi } from "vitest";
import { type EngineRequest, type EngineResult } from "@xiangqi/engine";
import { legalMoves, parsePosition } from "@xiangqi/xiangqi-core";
import { type AiOptions, AiGames } from "@server/game/ai/ai-games.js";
import type {
  AiTransactions,
  AiTransaction,
  AiCommit,
  AiOrigin,
} from "@server/game/ai/ai-transactions.js";

export const owner = "00000000-0000-0000-0000-000000000001";
// Explicit unit-only transaction driver: serial gate, staged commit and authority faults.
export function memoryTransactions() {
  const lifecycle = {
    reserve: vi.fn<AiTransaction["reserve"]>(async () => {}),
    check: vi.fn<AiTransaction["check"]>(async () => {}),
    finish: vi.fn<AiTransaction["finish"]>(async () => {}),
    drop: vi.fn<AiTransaction["drop"]>(async () => {}),
    expire: vi.fn<AiTransaction["expire"]>(async () => true),
    reclaim: vi.fn<AiTransaction["reclaim"]>(async () => false),
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
              drop: async (gameId) => {
                await lifecycle.drop(gameId);
                authorized = true;
              },
              expire: async (...args) => {
                const expired = await lifecycle.expire(...args);
                authorized = true;
                return expired;
              },
              reclaim: async (gameId, expiredBootId) => {
                const reclaimed = await lifecycle.reclaim(
                  gameId,
                  expiredBootId,
                );
                authorized = true;
                return reclaimed;
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
export function fixture(randomSide?: () => "red" | "black") {
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
