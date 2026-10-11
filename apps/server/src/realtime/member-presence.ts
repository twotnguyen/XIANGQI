import type { Pool, PoolClient } from "pg";
import type { RoomSnapshot } from "@xiangqi/shared";
import type { RoomTransactions } from "../room/room-transactions.js";
import type { RoomStore } from "../room/room-store.js";
import { uuid } from "../match/position-codec.js";
import type { MemberRealtimeTransactions } from "./member-transactions.js";
import {
  RealtimeError,
  type RealtimeConnection,
  type RealtimePresence,
} from "./contracts.js";
export class MemberRealtimePresence implements RealtimePresence {
  constructor(
    private readonly pool: Pool,
    private readonly coordinator: RoomTransactions,
    private readonly rooms: RoomStore,
    private readonly transactions: MemberRealtimeTransactions,
    private readonly serverInstance: string,
    private readonly currentPeers: (
      roomId: string,
    ) => readonly RealtimeConnection[] = () => [],
  ) {
    if (!uuid.test(serverInstance))
      throw new RealtimeError(
        "REALTIME_UNAVAILABLE",
        "Máy chủ kết nối chưa sẵn sàng",
      );
  }
  async connected(
    client: PoolClient,
    connection: RealtimeConnection,
    control: RoomSnapshot["control"],
  ): Promise<"ended" | void> {
    const scope = this.transactions.getScope(
      client,
      connection.identity,
      connection.roomId,
    );
    let generation = control.generation;
    if (control.mode !== "writable") {
      const member = (
        await client.query<{ role: string }>(
          "SELECT role FROM public.room_members WHERE room_id=$1 AND user_id=$2",
          [connection.roomId, connection.identity.userId],
        )
      ).rows[0];
      if (member?.role !== "SPECTATOR") return;
      const prior = (
        await client.query<{ generation: string }>(
          "SELECT generation::text FROM xiangqi_room.presence WHERE room_id=$1 AND user_id=$2 FOR UPDATE",
          [connection.roomId, connection.identity.userId],
        )
      ).rows[0];
      generation = this.nextGeneration(prior?.generation);
    }
    const result = await this.rooms.presence(
      scope,
      connection.roomId,
      {
        connectionId: connection.connectionId,
        generation,
        serverInstance: this.serverInstance,
      },
      true,
    );
    if (result === "seat-expired" || result === "viewer-expired")
      return "ended";
  }
  private nextGeneration(current?: string) {
    const previous = current === undefined ? 0 : Number(current);
    if (
      !Number.isSafeInteger(previous) ||
      previous < 0 ||
      previous >= Number.MAX_SAFE_INTEGER
    )
      throw new RealtimeError(
        "REALTIME_UNAVAILABLE",
        "Hiện diện phòng chưa sẵn sàng",
      );
    return previous + 1;
  }
  // Trusted physical gateway event: expiry/revocation must not suppress grace.
  async disconnected(connection: RealtimeConnection): Promise<void> {
    if (
      connection.identity.kind !== "member" ||
      !uuid.test(connection.identity.userId) ||
      !uuid.test(connection.roomId) ||
      !uuid.test(connection.tabId)
    )
      return;
    const captured = {
      identity: { ...connection.identity },
      roomId: connection.roomId,
      tabId: connection.tabId,
      connectionId: connection.connectionId,
    };
    const client = await this.pool.connect();
    let exists: boolean;
    let broken = false;
    try {
      await client.query("BEGIN READ ONLY; SET LOCAL ROLE app_server");
      exists = Boolean(
        (
          await client.query(
            `SELECT 1 FROM xiangqi_auth.principals n JOIN public.room_members m ON m.user_id=n.id WHERE n.id=$1 AND n.kind='member' AND m.room_id=$2`,
            [captured.identity.userId, captured.roomId],
          )
        ).rowCount,
      );
      await client.query("COMMIT");
    } catch (error) {
      try {
        await client.query("ROLLBACK");
      } catch {
        broken = true;
      }
      throw error;
    } finally {
      client.release(broken);
    }
    if (!exists) return;
    await this.coordinator.withRoom(
      { actor: { ...captured.identity }, roomIds: [captured.roomId] },
      async (p) => ({ status: "active", actor: p.actor }),
      async (scope) => {
        const member = (
          await scope.client.query<{ role: string }>(
            "SELECT role FROM public.room_members WHERE room_id=$1 AND user_id=$2",
            [captured.roomId, captured.identity.userId],
          )
        ).rows[0];
        if (member?.role === "SPECTATOR") {
          const row = (
            await scope.client.query<{ generation: string }>(
              `SELECT generation::text FROM xiangqi_room.presence
             WHERE room_id=$1 AND user_id=$2 AND connection_id=$3
             AND server_instance=$4 AND connected FOR UPDATE`,
              [
                captured.roomId,
                captured.identity.userId,
                captured.connectionId,
                this.serverInstance,
              ],
            )
          ).rows[0];
          if (!row) return;
          // Physical peers must be sampled after actor/room locks, not before a
          // potentially queued disconnect: another tab may have closed meanwhile.
          const survivor = this.currentPeers(captured.roomId)
            .filter(
              (peer) =>
                peer.connectionId !== captured.connectionId &&
                peer.roomId === captured.roomId &&
                peer.identity.kind === "member" &&
                peer.identity.userId === captured.identity.userId,
            )
            .sort((a, b) => a.connectionId.localeCompare(b.connectionId))[0];
          await this.rooms.presence(
            scope,
            captured.roomId,
            {
              connectionId: survivor?.connectionId ?? captured.connectionId,
              generation: survivor
                ? this.nextGeneration(row.generation)
                : Number(row.generation),
              serverInstance: this.serverInstance,
            },
            Boolean(survivor),
          );
          return;
        }
        if (member?.role !== "PLAYER") return;
        const row = (
          await scope.client.query<{ generation: number }>(
            `SELECT c.generation FROM xiangqi_realtime.controllers c
        JOIN xiangqi_room.presence p USING(room_id,user_id)
        JOIN public.room_members m USING(room_id,user_id)
        JOIN xiangqi_auth.principals n ON n.id=c.user_id
        WHERE c.user_id=$1 AND c.room_id=$2 AND c.tab_id=$3 AND c.connection_id=$4
        AND p.connection_id=c.connection_id AND p.generation=c.generation
        AND p.server_instance=$5 AND p.connected AND n.kind='member' FOR UPDATE OF c,p`,
            [
              captured.identity.userId,
              captured.roomId,
              captured.tabId,
              captured.connectionId,
              this.serverInstance,
            ],
          )
        ).rows[0];
        if (!row) return;
        await this.rooms.presence(
          scope,
          captured.roomId,
          {
            connectionId: captured.connectionId,
            generation: row.generation,
            serverInstance: this.serverInstance,
          },
          false,
        );
      },
    );
  }
}
