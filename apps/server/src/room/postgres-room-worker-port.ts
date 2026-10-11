import type { Pool, PoolClient } from "pg";
import type { RealtimeConnection } from "../realtime/contracts.js";
import { RoomError, type RoomScope } from "./contracts.js";
import type { PostgresMemberRoomAuthorizer } from "./member-room-auth.js";
import type { RoomStore } from "./room-store.js";
import type { RoomTransactions, RoomActorProof } from "./room-transactions.js";
import type { RoomWorkerPort } from "./room-worker.js";
function invalidOwner(): never {
  throw new RoomError(
    "ROOM_WORKER_UNAVAILABLE",
    "Phòng chưa hỗ trợ tác vụ nền",
    503,
  );
}
function expired(error: unknown) {
  return (
    error instanceof RoomError &&
    error.code === "AUTH_REQUIRED" &&
    error.status === 401
  );
}
export class PostgresRoomWorkerPort implements RoomWorkerPort {
  private cursor: string | null = null;
  constructor(
    private readonly pool: Pool,
    private readonly rooms: RoomStore,
    private readonly coordinator: RoomTransactions,
    private readonly authorizer: PostgresMemberRoomAuthorizer,
    private readonly currentPeers: (roomId: string) => RealtimeConnection[],
  ) {}
  private async transaction<T>(
    work: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const client = await this.pool.connect();
    let broken = false;
    try {
      await client.query("BEGIN");
      await client.query("SET LOCAL ROLE app_server");
      const result = await work(client);
      await client.query("COMMIT");
      return result;
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
  }
  async dueRooms(): Promise<string[]> {
    const ids = await this.transaction(async (client) =>
      (
        await client.query<{ id: string }>(
          "SELECT r.id FROM public.rooms r WHERE ($1::uuid IS NULL OR r.id>$1) AND r.invite_code IS NOT NULL AND r.status IN('WAITING','FINISHED') AND (EXISTS(SELECT 1 FROM xiangqi_room.countdowns d WHERE d.room_id=r.id AND d.due_at<=clock_timestamp()) OR EXISTS(SELECT 1 FROM public.room_members m WHERE m.room_id=r.id AND m.role='PLAYER' AND m.disconnected_at+interval '60 seconds'<=clock_timestamp())) ORDER BY r.id LIMIT 50",
          [this.cursor],
        )
      ).rows.map((r) => r.id),
    );
    this.cursor = ids.length === 50 ? ids[49]! : null;
    return ids;
  }
  async withRoom(
    roomId: string,
    work: (scope: RoomScope) => Promise<void>,
  ): Promise<void> {
    const initial = await this.transaction(async (client) => {
      const owner = (
        await client.query<{ owner_id: string; kind: string }>(
          "SELECT r.owner_id,p.kind FROM public.rooms r JOIN xiangqi_auth.principals p ON p.id=r.owner_id WHERE r.id=$1 AND r.invite_code IS NOT NULL AND r.closed_at IS NULL",
          [roomId],
        )
      ).rows[0];
      if (!owner || owner.kind !== "member") invalidOwner();
      const controllers = (
        await client.query<{
          user_id: string;
          tab_id: string;
          connection_id: string;
        }>(
          "SELECT user_id,tab_id,connection_id FROM xiangqi_realtime.controllers WHERE room_id=$1",
          [roomId],
        )
      ).rows;
      return { owner, controllers };
    });
    const peers = this.currentPeers(roomId)
      .filter(
        (peer) =>
          peer.roomId === roomId &&
          peer.identity.kind === "member" &&
          peer.proof &&
          initial.controllers.some(
            (c) =>
              c.user_id === peer.identity.userId &&
              c.tab_id === peer.tabId &&
              c.connection_id === peer.connectionId,
          ),
      )
      // A worker request must not invalidate a socket request's WeakMap proof.
      .map((peer) => ({
        ...peer,
        identity: { ...peer.identity },
        proof: { ...peer.proof! },
      }))
      .sort((a, b) => a.identity.userId.localeCompare(b.identity.userId));
    const verified: RealtimeConnection[] = [];
    for (const peer of peers) {
      try {
        const actor = await this.authorizer.resolve(peer.proof!);
        if (actor.kind !== "member" || actor.userId !== peer.identity.userId)
          invalidOwner();
        verified.push(peer);
      } catch (error) {
        if (!expired(error)) throw error;
      }
    }
    const ownerActor = {
      userId: initial.owner.owner_id,
      kind: "member" as const,
    };
    await this.coordinator.withRoom(
      { actor: ownerActor, roomIds: [roomId] },
      async (proof: RoomActorProof) => {
        const owner = (
          await proof.client.query<{ kind: string }>(
            "SELECT p.kind FROM public.rooms r JOIN xiangqi_auth.principals p ON p.id=r.owner_id WHERE r.id=$1 AND r.invite_code IS NOT NULL AND r.closed_at IS NULL",
            [roomId],
          )
        ).rows[0];
        if (!owner || owner.kind !== "member") invalidOwner();
        const activeActorIds = new Set<string>();
        for (const peer of verified) {
          if (!proof.lockedActorIds.has(peer.identity.userId)) continue;
          const controller = (
            await proof.client.query(
              "SELECT 1 FROM xiangqi_realtime.controllers WHERE room_id=$1 AND user_id=$2 AND tab_id=$3 AND connection_id=$4",
              [roomId, peer.identity.userId, peer.tabId, peer.connectionId],
            )
          ).rowCount;
          if (!controller) continue;
          try {
            const checked = await this.authorizer.authorize(peer.proof!, {
              ...proof,
              actor: { ...peer.identity },
            });
            if (checked.status === "active")
              activeActorIds.add(peer.identity.userId);
          } catch (error) {
            if (!expired(error)) throw error;
          }
        }
        return { status: "active", actor: ownerActor, activeActorIds };
      },
      work,
    );
  }
  pendingEvents() {
    return this.transaction((client) => this.rooms.pendingEvents(client));
  }
  markDelivered(id: string) {
    return this.transaction((client) => this.rooms.markDelivered(client, id));
  }
  markFailed(id: string) {
    return this.transaction((client) => this.rooms.markFailed(client, id));
  }
}
