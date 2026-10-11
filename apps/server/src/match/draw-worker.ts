import type { PoolClient } from "pg";
import { MatchError, type MatchScope } from "./contracts.js";
import type { MatchStore } from "./match-store.js";
import { uuid } from "./position-codec.js";
export type DrawCursor = { deadlineEpochMs: string; offerId: string };
export type DrawDueOffer = DrawCursor & { roomId: string; matchId: string };
/** Scheduler owns the client, actor→room locks, server-only scope and publication. */
export interface DrawWorkerPort {
  dueOffers(cursor: DrawCursor | null): Promise<DrawDueOffer[]>;
  withMatch(
    candidate: DrawDueOffer,
    work: (scope: MatchScope) => Promise<void>,
  ): Promise<void>;
}
const joins = `FROM xiangqi_room.match_draw_offers o
 JOIN public.matches m ON m.id=o.match_id JOIN public.rooms r ON r.id=m.room_id
 JOIN public.match_events e ON e.match_id=m.id AND e.version=0 AND e.type='START'`;
const eligible = `o.status='PENDING' AND o.expires_at<=clock_timestamp()
 AND m.mode='ONLINE' AND m.status='ACTIVE' AND m.time_control IN(300,600,900)
 AND m.rule_set_version='xiangqi-simple-v1' AND e.payload->>'encoding'='xiangqi-core-v1'
 AND r.invite_code IS NOT NULL AND r.status='PLAYING' AND r.current_match_id=m.id`;
/** Exact numeric deadline preserves PostgreSQL submillisecond ordering. Read only. */
export async function dueDrawOffers(
  client: PoolClient,
  cursor: DrawCursor | null = null,
): Promise<DrawDueOffer[]> {
  return (
    await client.query<DrawDueOffer>(
      `
 SELECT m.room_id AS "roomId",m.id AS "matchId",o.id AS "offerId",
 (extract(epoch FROM o.expires_at)*1000)::numeric::text AS "deadlineEpochMs"
 ${joins} WHERE ${eligible}
 AND ($1::numeric IS NULL OR ((extract(epoch FROM o.expires_at)*1000)::numeric,o.id)>($1::numeric,$2::uuid))
 ORDER BY o.expires_at,o.id LIMIT 50`,
      [cursor?.deadlineEpochMs ?? null, cursor?.offerId ?? null],
    )
  ).rows;
}
export class DrawWorker {
  private cursor: DrawCursor | null = null;
  constructor(
    private readonly matches: MatchStore,
    private readonly port: DrawWorkerPort,
  ) {}
  async tick(): Promise<void> {
    const candidates = (await this.port.dueOffers(this.cursor)).slice(0, 50),
      failures: unknown[] = [];
    for (const candidate of candidates) {
      try {
        await this.port.withMatch(candidate, (scope) =>
          this.expire(candidate, scope),
        );
      } catch (error) {
        failures.push(error);
      }
    }
    const last = candidates.at(-1);
    this.cursor =
      candidates.length === 50 && last
        ? { deadlineEpochMs: last.deadlineEpochMs, offerId: last.offerId }
        : null;
    if (failures.length)
      throw new AggregateError(
        failures,
        "Draw expiry batch transactions failed",
      );
  }
  private async expire(
    candidate: DrawDueOffer,
    scope: MatchScope,
  ): Promise<void> {
    if (
      !uuid.test(candidate.roomId) ||
      !uuid.test(candidate.matchId) ||
      !uuid.test(candidate.offerId) ||
      candidate.roomId !== scope.roomId
    )
      throw new MatchError("MATCH_INVALID_INPUT", "Đề nghị không hợp lệ.", 400);
    if (
      !scope.canControl ||
      !scope.lockedRoomIds.has(candidate.roomId) ||
      !scope.lockedActorIds.has(scope.actor.userId)
    )
      throw new MatchError("MATCH_LOCK_REQUIRED", "Thiếu khóa giao dịch.", 500);
    // Read only under already-held room locks; MatchStore locks match before its offers.
    const current = await scope.client.query(
      `SELECT o.id ${joins} WHERE ${eligible} AND o.id=$1 AND m.id=$2 AND m.room_id=$3`,
      [candidate.offerId, candidate.matchId, candidate.roomId],
    );
    if (!current.rowCount) return;
    await this.matches.expireDrawOffers(scope, { matchId: candidate.matchId });
  }
}
