import type { PoolClient } from "pg";
import { adjudicateDeadline } from "../match/disconnect-worker.js";
import type { MatchStore } from "../match/match-store.js";
import { uuid } from "../match/position-codec.js";
import type { ClockService } from "./clock.service.js";
import {
  ClockError,
  type ClockCandidate,
  type ClockCursor,
  type ClockDueCandidate,
  type ClockWorkerPort,
  type ClockWorkerScope,
} from "./clock.types.js";
/**
 * Truy vấn danh sách các ván cờ online đang chơi mà bên đến lượt đã vượt quá thời gian suy nghĩ (hết giờ).
 */
export async function dueMatches(
  client: PoolClient,
  cursor: ClockCursor | null = null,
): Promise<ClockDueCandidate[]> {
  const result = await client.query<ClockDueCandidate>(
    `
 WITH server_time AS MATERIALIZED(SELECT floor(extract(epoch FROM clock_timestamp())*1000)::numeric now_ms),
 candidates AS (
 SELECT m.room_id,m.id,
(m.clock->>'runningSinceEpochMs')::numeric +
(CASE WHEN m.time_control=0 THEN 210000::numeric WHEN m.position->>'turn'='RED' THEN (m.clock->>'redMs')::numeric ELSE (m.clock->>'blackMs')::numeric END) deadline
 FROM public.matches m JOIN public.rooms r ON r.id=m.room_id
 JOIN public.match_events e ON e.match_id=m.id AND e.version=0 AND e.type='START'
 WHERE m.mode='ONLINE' AND m.status='ACTIVE' AND (m.time_control IN(300,600,900) OR m.time_control=0)
 AND m.rule_set_version='xiangqi-simple-v1' AND e.payload->>'encoding'='xiangqi-core-v1'
 AND r.status='PLAYING' AND r.current_match_id=m.id)
 SELECT room_id AS "roomId",id AS "matchId",deadline::text AS "deadlineEpochMs"
 FROM candidates CROSS JOIN server_time
 WHERE deadline<=server_time.now_ms
 AND ($1::numeric IS NULL OR (deadline,id)>($1::numeric,$2::uuid))
 ORDER BY deadline,id LIMIT 50`,
    [cursor?.deadlineEpochMs ?? null, cursor?.matchId ?? null],
  );
  return result.rows;
}
/**
 * Tiến trình nền tự động quét và xử thua các ván cờ có người chơi hết thời gian suy nghĩ.
 */
export class ClockWorker {
  private cursor: ClockCursor | null = null;
  constructor(
    private readonly clock: ClockService,
    private readonly matches: MatchStore,
    private readonly port: ClockWorkerPort,
  ) {}
  /**
   * Quét và xử lý đợt tối đa 50 ván cờ đã hết giờ suy nghĩ.
   */
  async tick(): Promise<void> {
    const failures: unknown[] = [];
    const candidates = (await this.port.dueMatches(this.cursor)).slice(0, 50);
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
        ? { deadlineEpochMs: last.deadlineEpochMs, matchId: last.matchId }
        : null;
    if (failures.length)
      throw new AggregateError(failures, "Clock batch transactions failed");
  }
  /**
   * Xác minh thời gian thực tế và xử thua ván đấu do TIMEOUT (hoặc DISCONNECT nếu ngắt kết nối trước).
   */
  private async expire(
    candidate: ClockCandidate,
    scope: ClockWorkerScope,
  ): Promise<void> {
    if (
      !uuid.test(candidate.roomId) ||
      !uuid.test(candidate.matchId) ||
      candidate.roomId !== scope.roomId ||
      candidate.matchId !== scope.matchId
    )
      throw new ClockError("CLOCK_INVALID_STATE");
    if (!scope.lockedRoomIds.has(candidate.roomId))
      throw new ClockError("CLOCK_LOCK_REQUIRED");
    const room = (
      await scope.client.query<{
        status: string;
        current_match_id: string | null;
      }>(
        "SELECT status,current_match_id FROM public.rooms WHERE id=$1 FOR UPDATE",
        [candidate.roomId],
      )
    ).rows[0];
    if (
      !room ||
      room.status !== "PLAYING" ||
      room.current_match_id !== candidate.matchId
    )
      return;
    const row = (
      await scope.client.query<{
        status: string;
        red_user_id: string;
        black_user_id: string;
      }>(
        "SELECT status,red_user_id,black_user_id FROM public.matches WHERE id=$1 AND room_id=$2 FOR UPDATE",
        [candidate.matchId, candidate.roomId],
      )
    ).rows[0];
    if (!row || row.status !== "ACTIVE") return;
    if (
      !scope.lockedActorIds.has(row.red_user_id) ||
      !scope.lockedActorIds.has(row.black_user_id)
    )
      throw new ClockError("CLOCK_LOCK_REQUIRED");
    void this.clock;
    const match = await this.matches.snapshot(
      scope.client,
      candidate.roomId,
      candidate.matchId,
    );
    const decision = await adjudicateDeadline(
      scope.client,
      candidate.roomId,
      row.red_user_id,
      row.black_user_id,
      match,
    );
    if (decision)
      await this.matches.finish(scope.client, { ...candidate, ...decision });
  }
}
