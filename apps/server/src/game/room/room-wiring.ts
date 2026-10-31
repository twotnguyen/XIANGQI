import type { Pool, PoolClient } from "pg";
import type { ClockService } from "../clock/clock.service.js";
import { MatchStore } from "../match/match-store.js";
import { RoomError, type RoomActor, type RoomScope } from "./room.types.js";
import { RoomStore } from "./room-store.js";
import { RoomTransactions } from "./room-transactions.js";

/**
 * Nối RoomStore và MatchStore với scope giao dịch đang khóa. Runtime và test dùng cùng cách nối này.
 */
export function createRoomWiring(pool: Pool, clock: ClockService) {
  const coordinator = new RoomTransactions(pool);
  const context = new WeakMap<PoolClient, RoomScope>();
  const withScope = async <T>(scope: RoomScope, work: () => Promise<T>) => {
    if (context.has(scope.client))
      throw new RoomError(
        "ROOM_AUTH_PROOF_INVALID",
        "Giao dịch phòng chưa sẵn sàng",
        503,
      );
    context.set(scope.client, scope);
    try {
      return await work();
    } finally {
      context.delete(scope.client);
    }
  };
  const getScope = (client: PoolClient, actor: RoomActor, roomId: string) => {
    const scope = context.get(client);
    if (
      !scope ||
      scope.client !== client ||
      scope.actor.userId !== actor.userId ||
      scope.actor.kind !== actor.kind ||
      !scope.lockedActorIds.has(actor.userId) ||
      !scope.lockedRoomIds.has(roomId)
    )
      throw new RoomError(
        "ROOM_AUTH_PROOF_INVALID",
        "Giao dịch phòng chưa sẵn sàng",
        503,
      );
    return scope;
  };
  const rooms = new RoomStore({
    start: (client, input) => matches.start(client, input),
    reconnect: async (client, input) => {
      const scope = getScope(client, input.actor, input.roomId);
      await matches.settleDeadlines(
        { ...scope, roomId: input.roomId, canControl: true },
        { matchId: input.matchId },
      );
    },
    leave: async (client, input) => {
      const scope = getScope(client, input.actor, input.roomId);
      const match = await matches.snapshot(client, input.roomId, input.matchId);
      await matches.resign(
        { ...scope, roomId: input.roomId, canControl: true },
        { matchId: input.matchId, matchVersion: match.version },
      );
    },
  });
  const matches: MatchStore = new MatchStore(clock, {
    onMatchEnded: async (client, input) => {
      const scope = context.get(client);
      if (!scope)
        throw new RoomError(
          "ROOM_AUTH_PROOF_INVALID",
          "Giao dịch phòng chưa sẵn sàng",
          503,
        );
      await rooms.onMatchEnded(
        getScope(client, scope.actor, input.roomId),
        input,
      );
    },
  });
  return { coordinator, context, withScope, getScope, rooms, matches };
}
