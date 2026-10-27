import type { PoolClient } from "pg";
import type { PublicRoomView } from "./public-room-store.js";

/**
 * Opaque identity of one read window: every feed peer polled in the same tick,
 * or one HTTP request. Readers only share a catalog result by identity.
 */
export type PublicRoomTick = object;

/**
 * Single-flight cache for the actor-agnostic public catalog (PUBLIC rows only).
 *
 * - Shares one query per tick: every reader that passes the same tick receives the
 *   same promise (settled or pending), so N peers cost one catalog query instead of N.
 *   Late readers of an older tick still get that tick's result, not a new query.
 * - At most one catalog query is in flight: a new tick waits for the pending load to
 *   settle, then runs its own fresh query. It never reuses a load begun before it.
 * - A failed load is cached only for its own tick; the failure does not block later
 *   ticks, which queue behind the settled chain and reload.
 *
 * Authorization is never shared. Every caller must authorize its own session
 * inside its own transaction before calling read(); the catalog carries no actor,
 * session or authority data.
 */
export class PublicRoomCatalog {
  private readonly loads = new WeakMap<
    PublicRoomTick,
    Promise<PublicRoomView[]>
  >();
  // Settles (never rejects) when the most recent query settles. A new load chains here.
  private tail?: Promise<void>;

  constructor(
    private readonly query: (client: PoolClient) => Promise<PublicRoomView[]>,
  ) {}

  /**
   * Returns the catalog for `tick`. The `client` is used only when this call starts
   * a new load; it must be the caller's own authorized transaction client, which
   * stays open until the load settles.
   */
  read(tick: PublicRoomTick, client: PoolClient): Promise<PublicRoomView[]> {
    const shared = this.loads.get(tick);
    if (shared) return shared;
    const previous = this.tail;
    const load = previous
      ? previous.then(() => this.query(client))
      : this.query(client);
    const settled = load.then(
      () => undefined,
      () => undefined,
    );
    this.tail = settled;
    void settled.then(() => {
      if (this.tail === settled) this.tail = undefined;
    });
    this.loads.set(tick, load);
    return load;
  }
}
