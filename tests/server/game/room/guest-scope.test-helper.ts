import type { PoolClient } from "pg";
import type { RoomScope } from "@server/game/room/room.types.js";

/**
 * Mirrors game.runtime's per-client scope registry: a RoomScope is visible only
 * while its GuestRoomCoordinator work callback runs, and only to the exact client
 * it was issued for.
 */
export function scopeContext() {
  const active = new WeakMap<PoolClient, RoomScope>();
  return {
    withScope: async <T>(scope: RoomScope, work: () => Promise<T>) => {
      active.set(scope.client, scope);
      try {
        return await work();
      } finally {
        active.delete(scope.client);
      }
    },
    // Strict: AI termination needs the live coordinator scope; a missing scope is a test wiring bug.
    scopeOf(client: PoolClient): RoomScope {
      const scope = active.get(client);
      if (!scope) throw new Error("Missing trusted room scope");
      return scope;
    },
    current(client: PoolClient): RoomScope | undefined {
      return active.get(client);
    },
  };
}
