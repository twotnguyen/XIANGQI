import type { PoolClient } from "pg";
import type { MatchStore } from "../match/match-store.js";
import { uuid } from "../match/position-codec.js";
import type { ClockService } from "./clock-service.js";
import {
  ClockError,
  type ClockCandidate,
  type ClockCursor,
  type ClockDueCandidate,
  type ClockWorkerPort,
  type ClockWorkerScope,
} from "./contracts.js";
/** One server-time sample; no client/presence timestamps participate in eligibility. */
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
 (CASE WHEN m.position->>'turn'='RED' THEN m.clock->>'redMs' ELSE m.clock->>'blackMs' END)::numeric deadline
 FROM public.matches m JOIN public.rooms r ON r.id=m.room_id
 JOIN public.match_events e ON e.match_id=m.id AND e.version=0 AND e.type='START'
 WHERE m.mode='ONLINE' AND m.status='ACTIVE' AND m.time_control IN(300,600,900)
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
/** Root owns the scheduler, clients, actor→room locks and committed publication. */
export class ClockWorker {
  private cursor: ClockCursor | null = null;
  constructor(
    private readonly clock: ClockService,
    private readonly matches: MatchStore,
    private readonly port: ClockWorkerPort,
  ) {}
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
    const at = new Date(
      Number(
        (
          await scope.client.query<{ ms: string }>(
            "SELECT floor(extract(epoch FROM clock_timestamp())*1000)::bigint ms",
          )
        ).rows[0]!.ms,
      ),
    );
    const match = await this.matches.snapshot(
      scope.client,
      candidate.roomId,
      candidate.matchId,
    );
    const checked = this.clock.beforeAction(match.clock, match.turn, at);
    if (!checked.expired) return;
    await this.matches.finish(scope.client, {
      ...candidate,
      outcome: {
        reason: "TIMEOUT",
        winner: checked.expired === "red" ? "black" : "red",
      },
      at,
    });
  }
}
