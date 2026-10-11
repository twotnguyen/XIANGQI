import type { PoolClient } from "pg";
import type { Side } from "@xiangqi/xiangqi-core";
import {
  ClockError,
  type ClockCursor,
  type ClockDueCandidate,
  type ClockWorkerPort,
  type ClockWorkerScope,
} from "../clock/contracts.js";
import type { MatchStore } from "./match-store.js";
import { uuid } from "./position-codec.js";

/** Managed rooms only. Forward cursor prevents failed old rows starving later deadlines. */
export async function dueDisconnectMatches(
  client: PoolClient,
  cursor: ClockCursor | null = null,
): Promise<ClockDueCandidate[]> {
  if (
    cursor &&
    (!uuid.test(cursor.matchId) ||
      !/^\d{1,20}(?:\.\d{1,6})?$/.test(cursor.deadlineEpochMs))
  )
    throw new ClockError("CLOCK_INVALID_STATE");
  const result = await client.query<ClockDueCandidate>(
    `
 WITH server_time AS MATERIALIZED(SELECT floor(extract(epoch FROM clock_timestamp())*1000)::numeric now_ms), candidates AS (
 SELECT m.room_id,m.id,min(extract(epoch FROM (p.disconnected_at+interval '60 seconds'))*1000) deadline
 FROM public.matches m JOIN public.rooms r ON r.id=m.room_id
 JOIN public.match_events e ON e.match_id=m.id AND e.version=0 AND e.type='START'
 JOIN public.room_members p ON p.room_id=r.id AND p.role='PLAYER' AND p.user_id IN(m.red_user_id,m.black_user_id)
 WHERE r.invite_code IS NOT NULL AND r.closed_at IS NULL AND r.status='PLAYING' AND r.current_match_id=m.id
 AND m.mode='ONLINE' AND m.status='ACTIVE' AND m.time_control IN(300,600,900)
 AND m.rule_set_version='xiangqi-simple-v1' AND e.payload->>'encoding'='xiangqi-core-v1'
 AND p.disconnected_at IS NOT NULL AND NOT EXISTS(SELECT 1 FROM xiangqi_room.presence q WHERE q.room_id=p.room_id AND q.user_id=p.user_id AND q.connected)
 GROUP BY m.room_id,m.id)
 SELECT room_id AS "roomId",id AS "matchId",deadline::text AS "deadlineEpochMs" FROM candidates CROSS JOIN server_time
 WHERE deadline<=now_ms AND ($1::numeric IS NULL OR (deadline,id)>($1::numeric,$2::uuid)) ORDER BY deadline,id LIMIT 50`,
    [cursor?.deadlineEpochMs ?? null, cursor?.matchId ?? null],
  );
  return result.rows;
}
/** Called only under both actor locks and the room lock; presence cannot race this sample. */
export async function earliestDisconnect(
  client: PoolClient,
  roomId: string,
  redId: string,
  blackId: string,
): Promise<{ deadline: number; loser: Side } | null> {
  const room = (
    await client.query<{ invite_code: string | null }>(
      "SELECT invite_code FROM public.rooms WHERE id=$1",
      [roomId],
    )
  ).rows[0];
  if (!room?.invite_code) return null;
  const rows = (
    await client.query<{
      user_id: string;
      side: string;
      kind: string;
      deadline: string | null;
      connected: boolean;
    }>(
      `
 SELECT p.user_id,p.side,n.kind, (extract(epoch FROM (p.disconnected_at+interval '60 seconds'))*1000)::text deadline,
 EXISTS(SELECT 1 FROM xiangqi_room.presence q WHERE q.room_id=p.room_id AND q.user_id=p.user_id AND q.connected) connected
 FROM public.room_members p JOIN xiangqi_auth.principals n ON n.id=p.user_id
 WHERE p.room_id=$1 AND p.role='PLAYER' ORDER BY p.user_id FOR UPDATE OF p`,
      [roomId],
    )
  ).rows;
  if (
    rows.length !== 2 ||
    !rows.some((r) => r.user_id === redId && r.side === "RED") ||
    !rows.some((r) => r.user_id === blackId && r.side === "BLACK")
  )
    throw new ClockError("CLOCK_INVALID_STATE");
  // Equal disconnection timestamps: lexicographically smaller UUID loses, regardless of worker order.
  const offline = rows
    .filter((r) => r.deadline !== null && !r.connected)
    .sort(
      (a, b) =>
        Number(a.deadline) - Number(b.deadline) ||
        a.user_id.localeCompare(b.user_id),
    );
  const first = offline[0];
  if (!first) return null;
  const deadline = Number(first.deadline);
  if (!Number.isFinite(deadline) || deadline < 0)
    throw new ClockError("CLOCK_INVALID_STATE");
  return { deadline, loser: first.side === "RED" ? "red" : "black" };
}
export class DisconnectWorker {
  private cursor: ClockCursor | null = null;
  constructor(
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
      throw new AggregateError(
        failures,
        "Disconnect batch transactions failed",
      );
  }
  private async expire(
    candidate: ClockDueCandidate,
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
    const row = (
      await scope.client.query<{
        red_user_id: string;
        black_user_id: string;
        red_kind: string;
        black_kind: string;
      }>(
        `
 SELECT m.red_user_id,m.black_user_id,nr.kind AS red_kind,nb.kind AS black_kind FROM public.matches m JOIN public.rooms r ON r.id=m.room_id
 JOIN xiangqi_auth.principals nr ON nr.id=m.red_user_id JOIN xiangqi_auth.principals nb ON nb.id=m.black_user_id
 JOIN public.match_events e ON e.match_id=m.id AND e.version=0 AND e.type='START'
 WHERE m.id=$1 AND m.room_id=$2 AND r.invite_code IS NOT NULL AND r.closed_at IS NULL AND r.status='PLAYING' AND r.current_match_id=m.id
 AND m.mode='ONLINE' AND m.status='ACTIVE' AND m.time_control IN(300,600,900) AND m.rule_set_version='xiangqi-simple-v1' AND e.payload->>'encoding'='xiangqi-core-v1' FOR UPDATE OF m,r`,
        [candidate.matchId, candidate.roomId],
      )
    ).rows[0];
    if (!row) return;
    if (row.red_kind !== "member" || row.black_kind !== "member")
      throw new ClockError("CLOCK_INVALID_STATE");
    if (
      !scope.lockedActorIds.has(row.red_user_id) ||
      !scope.lockedActorIds.has(row.black_user_id)
    )
      throw new ClockError("CLOCK_LOCK_REQUIRED");
    const disconnect = await earliestDisconnect(
      scope.client,
      candidate.roomId,
      row.red_user_id,
      row.black_user_id,
    );
    if (!disconnect) return;
    const at = new Date(
      Number(
        (
          await scope.client.query<{ ms: string }>(
            "SELECT floor(extract(epoch FROM clock_timestamp())*1000)::bigint ms",
          )
        ).rows[0]!.ms,
      ),
    );
    if (disconnect.deadline > at.getTime()) return;
    const match = await this.matches.snapshot(
      scope.client,
      candidate.roomId,
      candidate.matchId,
    );
    const clockDeadline =
      match.clock.runningSinceEpochMs +
      (match.turn === "red" ? match.clock.redMs : match.clock.blackMs);
    // Clock wins exact ties. A late maintenance batch must preserve the earlier actual deadline.
    const timeout = clockDeadline <= disconnect.deadline;
    await this.matches.finish(scope.client, {
      ...candidate,
      outcome: {
        reason: timeout ? "TIMEOUT" : "DISCONNECT",
        winner:
          (timeout ? match.turn : disconnect.loser) === "red" ? "black" : "red",
      },
      at,
    });
  }
}
