import type { Pool, PoolClient } from "pg";
import { transaction } from "../../core/postgres.js";
import type { RealtimeConnection } from "../realtime/realtime.types.js";
import { RoomError, RoomRosterChanged, type RoomScope } from "./room.types.js";
import type { RoomEvent } from "./room.types.js";
import type { RoomSessionAuthorizer } from "./room-session.js";
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
/**
 * Cổng kết nối Postgres hỗ trợ tiến trình worker phòng cờ:
 * Quét các phòng đến hạn xử lý, thiết lập transaction bao bọc phòng, dọn dẹp biên lai và xử lý outbox.
 */
export class PostgresRoomWorkerPort implements RoomWorkerPort {
  private cursor: string | null = null;
  constructor(
    private readonly pool: Pool,
    private readonly rooms: RoomStore,
    private readonly coordinator: RoomTransactions,
    private readonly authorizer: RoomSessionAuthorizer,
    private readonly currentPeers: (roomId: string) => RealtimeConnection[],
  ) {}
  private transaction<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
    return transaction(this.pool, work);
  }
  /**
   * Truy vấn danh sách các phòng cờ đến hạn cần xử lý (spectator ngắt kết nối quá 5 phút, đếm ngược bắt đầu ván...).
   */
  async dueRooms(): Promise<string[]> {
    const ids = await this.transaction(async (client) =>
      (
        await client.query<{ id: string }>(
          "SELECT r.id FROM public.rooms r WHERE ($1::uuid IS NULL OR r.id>$1) AND r.invite_code IS NOT NULL AND r.status IN('WAITING','FINISHED','PLAYING') AND (EXISTS(SELECT 1 FROM public.room_members m WHERE m.room_id=r.id AND m.role='SPECTATOR' AND m.disconnected_at+interval '5 minutes'<=clock_timestamp()) OR (r.status IN('WAITING','FINISHED') AND (EXISTS(SELECT 1 FROM xiangqi_room.countdowns d WHERE d.room_id=r.id AND d.due_at<=clock_timestamp()) OR EXISTS(SELECT 1 FROM public.room_members m WHERE m.room_id=r.id AND m.role='PLAYER' AND m.disconnected_at+interval '60 seconds'<=clock_timestamp())))) ORDER BY r.id LIMIT 50",
          [this.cursor],
        )
      ).rows.map((r) => r.id),
    );
    this.cursor = ids.length === 50 ? ids[49]! : null;
    return ids;
  }
  /**
   * Khóa phòng và thực thi khối công việc của worker trong transaction có kiểm soát khóa actor/room tuần tự.
   */
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
      if (!owner || (owner.kind !== "member" && owner.kind !== "guest"))
        invalidOwner();
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
        proof: { ...peer.proof },
      }))
      .sort((a, b) => a.identity.userId.localeCompare(b.identity.userId));
    const verified: RealtimeConnection[] = [];
    for (const peer of peers) {
      try {
        const actor = await this.authorizer.resolve(peer.proof);
        if (
          actor.kind !== peer.identity.kind ||
          actor.userId !== peer.identity.userId
        )
          invalidOwner();
        verified.push(peer);
      } catch (error) {
        if (!expired(error)) throw error;
      }
    }
    const ownerActor = {
      userId: initial.owner.owner_id,
      kind:
        initial.owner.kind === "guest"
          ? ("guest" as const)
          : ("member" as const),
    };
    await this.coordinator.withRoom(
      { actor: ownerActor, roomIds: [roomId] },
      async (proof: RoomActorProof) => {
        const owner = (
          await proof.client.query<{ kind: string; owner_id: string }>(
            "SELECT r.owner_id,p.kind FROM public.rooms r JOIN xiangqi_auth.principals p ON p.id=r.owner_id WHERE r.id=$1 AND r.invite_code IS NOT NULL AND r.closed_at IS NULL",
            [roomId],
          )
        ).rows[0];
        if (!owner || (owner.kind !== "member" && owner.kind !== "guest"))
          invalidOwner();
        // Ownership moved after the unlocked read: retry with the current owner's actor set.
        if (owner.owner_id !== ownerActor.userId)
          throw new RoomRosterChanged([owner.owner_id]);
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
            const checked = await this.authorizer.authorize(peer.proof, {
              ...proof,
              actor: { ...peer.identity },
            });
            if (checked.status === "active")
              activeActorIds.add(peer.identity.userId);
          } catch (error) {
            if (!expired(error)) throw error;
          }
        }
        if (ownerActor.kind === "guest") {
          // A guest past its fixed 12h stays live only while it still holds this room's seat (deferral).
          const live = await proof.client.query(
            "SELECT 1 FROM xiangqi_auth.guest_sessions s WHERE s.guest_id=$1 AND s.ended_at IS NULL AND (s.expires_at>clock_timestamp() OR EXISTS(SELECT 1 FROM public.active_players a WHERE a.user_id=s.guest_id AND a.room_id=$2))",
            [ownerActor.userId, roomId],
          );
          if (!live.rowCount) return { status: "ended" as const };
        }
        return { status: "active", actor: ownerActor, activeActorIds };
      },
      work,
    );
  }
  /**
   * Dọn dẹp các biên lai lệnh (entry receipts) đã hết hạn để giải phóng bộ nhớ cơ sở dữ liệu.
   */
  async cleanupExpiredReceipts(): Promise<number> {
    return this.transaction(async (client) => {
      await client.query("SET LOCAL lock_timeout='250ms'");
      const result = await client.query<{ removed: number }>(`
        WITH expired_entries AS (
          SELECT actor_id,command_id FROM xiangqi_room.entry_receipts
          WHERE expires_at<=now() ORDER BY expires_at,actor_id,command_id
          LIMIT 500 FOR UPDATE SKIP LOCKED
        ), removed_entries AS (
          DELETE FROM xiangqi_room.entry_receipts r USING expired_entries e
          WHERE r.actor_id=e.actor_id AND r.command_id=e.command_id RETURNING 1
        )
        SELECT count(*)::integer AS removed FROM removed_entries`);
      return result.rows[0]!.removed;
    });
  }
  /**
   * Truy vấn sự kiện thu hồi media đang chờ gửi từ outbox.
   */
  async pendingMediaEvent(): Promise<RoomEvent | undefined> {
    return this.transaction(
      async (client) =>
        (
          await client.query<RoomEvent>(
            `SELECT id,room_id AS "roomId",room_version::float8 AS version,type,payload
         FROM xiangqi_room.outbox
         WHERE delivered_at IS NULL AND type IN ('media.revoke-room','media.revoke-user') AND next_attempt_at<=now()
         ORDER BY created_at,id LIMIT 1`,
          )
        ).rows[0],
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
