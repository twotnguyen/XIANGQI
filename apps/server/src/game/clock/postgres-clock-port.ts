import type { Pool, PoolClient } from "pg";
import type { RoomActor } from "../room/room.types.js";
import type { RoomTransactions } from "../room/room-transactions.js";
import { uuid } from "../match/position-codec.js";
import { dueMatches } from "./clock-worker.js";
import {
  ClockError,
  type ClockCandidate,
  type ClockCursor,
  type ClockDueCandidate,
  type ClockWorkerPort,
  type ClockWorkerScope,
} from "./clock.types.js";
/**
 * Triển khai cổng `ClockWorkerPort` sử dụng PostgreSQL và điều phối khóa `RoomTransactions`.
 */
export class PostgresClockWorkerPort implements ClockWorkerPort {
  constructor(
    private readonly pool: Pool,
    private readonly coordinator: RoomTransactions,
  ) {}
  /**
   * Mở kết nối giao dịch ở chế độ READ ONLY an toàn để truy vấn dữ liệu từ cơ sở dữ liệu.
   */
  private async read<T>(work: (client: PoolClient) => Promise<T>): Promise<T> {
    const c = await this.pool.connect();
    let broken = false;
    try {
      await c.query("BEGIN READ ONLY; SET LOCAL ROLE app_server");
      const value = await work(c);
      await c.query("COMMIT");
      return value;
    } catch (error) {
      try {
        await c.query("ROLLBACK");
      } catch {
        broken = true;
      }
      throw error;
    } finally {
      c.release(broken);
    }
  }
  /**
   * Truy vấn các ván cờ tới hạn hết giờ suy nghĩ.
   */
  async dueMatches(cursor: ClockCursor | null): Promise<ClockDueCandidate[]> {
    if (
      cursor &&
      (!uuid.test(cursor.matchId) ||
        typeof cursor.deadlineEpochMs !== "string" ||
        !/^\d{1,20}(?:\.\d{1,6})?$/.test(cursor.deadlineEpochMs))
    )
      throw new ClockError("CLOCK_INVALID_STATE");
    return this.read((c) => dueMatches(c, cursor));
  }
  /**
   * Khóa thứ tự actor -> room và gọi callback xử lý ván cờ bảo đảm an toàn dữ liệu và tránh deadlock.
   */
  async withMatch(
    candidate: ClockCandidate,
    work: (scope: ClockWorkerScope) => Promise<void>,
  ): Promise<void> {
    if (
      !candidate ||
      typeof candidate.roomId !== "string" ||
      typeof candidate.matchId !== "string" ||
      !uuid.test(candidate.roomId) ||
      !uuid.test(candidate.matchId)
    )
      throw new ClockError("CLOCK_INVALID_STATE");
    const target = {
      roomId: candidate.roomId.toLowerCase(),
      matchId: candidate.matchId.toLowerCase(),
    };
    const actor = await this.read(async (c) => {
      const row = (
        await c.query<{ id: string; kind: RoomActor["kind"] }>(
          `SELECT m.red_user_id AS id,n.kind FROM public.matches m JOIN public.rooms r ON r.id=m.room_id JOIN xiangqi_auth.principals n ON n.id=m.red_user_id WHERE m.id=$1 AND m.room_id=$2 AND m.status='ACTIVE' AND m.mode='ONLINE' AND r.status='PLAYING' AND r.current_match_id=m.id`,
          [target.matchId, target.roomId],
        )
      ).rows[0];
      return row ? { userId: row.id, kind: row.kind } : null;
    });
    if (!actor) return;
    await this.coordinator.withRoom(
      { actor, roomIds: [target.roomId] },
      async (p) => ({ status: "active", actor: p.actor }),
      async (scope) => {
        const row = (
          await scope.client.query<{
            red_user_id: string;
            black_user_id: string;
          }>(
            `SELECT m.red_user_id,m.black_user_id FROM public.matches m JOIN public.rooms r ON r.id=m.room_id WHERE m.id=$1 AND m.room_id=$2 AND m.status='ACTIVE' AND m.mode='ONLINE' AND r.status='PLAYING' AND r.current_match_id=m.id`,
            [target.matchId, target.roomId],
          )
        ).rows[0];
        if (!row || row.red_user_id !== actor.userId) return;
        if (
          !scope.lockedActorIds.has(row.red_user_id) ||
          !scope.lockedActorIds.has(row.black_user_id) ||
          !scope.lockedRoomIds.has(target.roomId)
        )
          throw new ClockError("CLOCK_LOCK_REQUIRED");
        await work({
          client: scope.client,
          ...target,
          lockedActorIds: scope.lockedActorIds,
          lockedRoomIds: scope.lockedRoomIds,
        });
      },
    );
  }
}
