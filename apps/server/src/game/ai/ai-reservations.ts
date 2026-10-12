import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { RoomError, type RoomScope } from "../room/contracts.js";
export interface AiBoot {
  id: string;
  leaseUntil: string;
}
export interface AiReservation {
  ownerId: string;
  gameId: string;
  bootId: string;
  acquiredAt: string;
}
export interface AiExpiredCursor {
  leaseMilliseconds: string;
  gameId: string;
}
export interface AiExpiredReservation extends AiReservation {
  cursor: AiExpiredCursor;
}
type Slot = {
  acquired_at: Date;
  ai_game_id: string | null;
  ai_boot_id: string | null;
  room_id: string | null;
  match_room_id: string | null;
};
function id(value: string): string {
  if (
    typeof value !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      value,
    )
  )
    throw new RoomError(
      "AI_INPUT_INVALID",
      "Định danh ván với máy không hợp lệ",
      400,
    );
  return value.toLowerCase();
}
function fail(code: string): never {
  throw new RoomError(code, "Vị trí chơi với máy chưa sẵn sàng", 409);
}
/** Internal SQL port. Caller supplies authenticated actor-first RoomTransactions scope.
 * Never expose boot IDs or trusted cleanup methods to a client. No nested pool/transaction. */
export class AiReservations {
  async createBoot(client: PoolClient): Promise<AiBoot> {
    const bootId = randomUUID();
    const row = (
      await client.query<{ lease_until: Date }>(
        `WITH t AS (SELECT clock_timestamp() AS at)
      INSERT INTO xiangqi_ai.boots(id,created_at,lease_until) SELECT $1,at,at+interval '60 seconds' FROM t RETURNING lease_until`,
        [bootId],
      )
    ).rows[0]!;
    return { id: bootId, leaseUntil: row.lease_until.toISOString() };
  }
  async heartbeat(client: PoolClient, bootId: string): Promise<AiBoot> {
    const canonical = id(bootId);
    // Sample expiry after acquiring the row lock, never before a lock wait.
    await client.query(
      "SELECT id FROM xiangqi_ai.boots WHERE id=$1 FOR UPDATE",
      [canonical],
    );
    const row = (
      await client.query<{ lease_until: Date }>(
        `UPDATE xiangqi_ai.boots SET lease_until=clock_timestamp()+interval '60 seconds'
      WHERE id=$1 AND lease_until>clock_timestamp() RETURNING lease_until`,
        [canonical],
      )
    ).rows[0];
    if (!row) fail("AI_BOOT_EXPIRED");
    return { id: canonical, leaseUntil: row.lease_until.toISOString() };
  }
  private async slot(scope: RoomScope): Promise<Slot | undefined> {
    const actorId = id(scope.actor.userId);
    if (
      !scope.lockedActorIds.has(actorId) ||
      !["member", "guest"].includes(scope.actor.kind)
    )
      fail("AI_SCOPE_INVALID");
    const actor = await scope.client.query(
      "SELECT 1 FROM xiangqi_auth.principals WHERE id=$1 AND kind=$2",
      [actorId, scope.actor.kind],
    );
    if (!actor.rowCount) fail("AI_SCOPE_INVALID");
    const row = (
      await scope.client.query<Slot>(
        `SELECT a.acquired_at,a.ai_game_id,a.ai_boot_id,a.room_id,m.room_id AS match_room_id
      FROM public.active_players a LEFT JOIN public.matches m ON m.id=a.match_id WHERE a.user_id=$1 FOR UPDATE OF a`,
        [actorId],
      )
    ).rows[0];
    if (
      [row?.room_id, row?.match_room_id].some(
        (room) => room && !scope.lockedRoomIds.has(room),
      )
    )
      fail("AI_SCOPE_INVALID");
    return row;
  }
  private async boot(
    client: PoolClient,
    bootId: string,
  ): Promise<boolean | undefined> {
    await client.query(
      "SELECT id FROM xiangqi_ai.boots WHERE id=$1 FOR SHARE",
      [bootId],
    );
    return (
      await client.query<{ live: boolean }>(
        "SELECT lease_until>clock_timestamp() AS live FROM xiangqi_ai.boots WHERE id=$1",
        [bootId],
      )
    ).rows[0]?.live;
  }
  async reserve(
    scope: RoomScope,
    input: { gameId: string; bootId: string },
  ): Promise<void> {
    const gameId = id(input.gameId),
      bootId = id(input.bootId);
    if (await this.slot(scope)) fail("ALREADY_SEATED");
    if ((await this.boot(scope.client, bootId)) !== true)
      fail("AI_BOOT_EXPIRED");
    const inserted = await scope.client.query(
      `INSERT INTO public.active_players(user_id,ai_game_id,ai_boot_id)
      SELECT $1,$2,$3 WHERE EXISTS(SELECT 1 FROM xiangqi_ai.boots WHERE id=$3 AND lease_until>clock_timestamp()) RETURNING user_id`,
      [scope.actor.userId, gameId, bootId],
    );
    if (!inserted.rowCount) fail("AI_BOOT_EXPIRED");
  }
  async check(
    scope: RoomScope,
    input: { gameId: string; bootId: string },
  ): Promise<AiReservation> {
    const gameId = id(input.gameId),
      bootId = id(input.bootId),
      row = await this.slot(scope);
    if (!row || row.ai_game_id !== gameId || row.ai_boot_id !== bootId)
      fail("AI_RESERVATION_LOST");
    if ((await this.boot(scope.client, bootId)) !== true)
      fail("AI_BOOT_EXPIRED");
    return {
      ownerId: scope.actor.userId,
      gameId,
      bootId,
      acquiredAt: row.acquired_at.toISOString(),
    };
  }
  async release(
    scope: RoomScope,
    input: { gameId: string; bootId: string },
  ): Promise<void> {
    const proof = await this.check(scope, input);
    const deleted = await scope.client.query(
      `DELETE FROM public.active_players a WHERE user_id=$1 AND ai_game_id=$2 AND ai_boot_id=$3
      AND EXISTS(SELECT 1 FROM xiangqi_ai.boots WHERE id=$3 AND lease_until>clock_timestamp()) RETURNING user_id`,
      [proof.ownerId, proof.gameId, proof.bootId],
    );
    if (!deleted.rowCount) fail("AI_BOOT_EXPIRED");
  }
  async reclaimExpired(
    scope: RoomScope,
    input: { gameId: string; bootId: string },
  ): Promise<boolean> {
    const gameId = id(input.gameId),
      bootId = id(input.bootId),
      row = await this.slot(scope);
    if (!row || row.ai_game_id !== gameId || row.ai_boot_id !== bootId)
      return false;
    if ((await this.boot(scope.client, bootId)) !== false) return false;
    const deleted = await scope.client.query(
      `DELETE FROM public.active_players a WHERE user_id=$1 AND ai_game_id=$2 AND ai_boot_id=$3
      AND EXISTS(SELECT 1 FROM xiangqi_ai.boots WHERE id=$3 AND lease_until<=clock_timestamp()) RETURNING user_id`,
      [scope.actor.userId, gameId, bootId],
    );
    return deleted.rowCount === 1;
  }
  async expired(
    client: PoolClient,
    cursor: AiExpiredCursor | null = null,
  ): Promise<AiExpiredReservation[]> {
    if (
      cursor &&
      (!/^\d+(\.\d+)?$/.test(cursor.leaseMilliseconds) ||
        cursor.leaseMilliseconds.length > 32)
    )
      fail("AI_INPUT_INVALID");
    const rows = (
      await client.query<{
        user_id: string;
        ai_game_id: string;
        ai_boot_id: string;
        acquired_at: Date;
        deadline: string;
      }>(
        `SELECT a.user_id,a.ai_game_id,a.ai_boot_id,a.acquired_at,
      (extract(epoch FROM b.lease_until)*1000)::numeric::text AS deadline FROM public.active_players a JOIN xiangqi_ai.boots b ON b.id=a.ai_boot_id
      WHERE b.lease_until<=clock_timestamp() AND ($1::numeric IS NULL OR ((extract(epoch FROM b.lease_until)*1000)::numeric,a.ai_game_id)>($1::numeric,$2::uuid))
      ORDER BY b.lease_until,a.ai_game_id LIMIT 50`,
        [cursor?.leaseMilliseconds ?? null, cursor ? id(cursor.gameId) : null],
      )
    ).rows;
    return rows.map((row) => ({
      ownerId: row.user_id,
      gameId: row.ai_game_id,
      bootId: row.ai_boot_id,
      acquiredAt: row.acquired_at.toISOString(),
      cursor: { leaseMilliseconds: row.deadline, gameId: row.ai_game_id },
    }));
  }
}
