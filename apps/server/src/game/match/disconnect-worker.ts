import type { PoolClient } from "pg";
import type { Side } from "@xiangqi/xiangqi-core";
import {
  ClockError,
  type ClockCursor,
  type ClockDueCandidate,
  type ClockWorkerPort,
  type ClockWorkerScope,
} from "../clock/clock.types.js";
import type { MatchStore } from "./match-store.js";
import type { MatchOutcome, MatchView } from "./match.types.js";
import { INACTIVITY_GRACE_MS, INACTIVITY_PROMPT_MS } from "./inactivity.js";
import { uuid } from "./position-codec.js";

/**
 * Truy vấn danh sách các ván đấu online có người chơi mất kết nối quá thời gian chờ (60s) đến hạn xử lý.
 * Sử dụng con trỏ cursor để phân trang và tránh lặp lại ván cũ.
 */
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
 WITH server_time AS MATERIALIZED(SELECT extract(epoch FROM clock_timestamp())*1000 AS now_ms), candidates AS (
 SELECT m.room_id,m.id,min(extract(epoch FROM (p.disconnected_at+interval '60 seconds'))*1000) deadline
 FROM public.matches m JOIN public.rooms r ON r.id=m.room_id
 JOIN public.match_events e ON e.match_id=m.id AND e.version=0 AND e.type='START'
 JOIN public.room_members p ON p.room_id=r.id AND p.role='PLAYER' AND p.user_id IN(m.red_user_id,m.black_user_id)
 WHERE (r.invite_code IS NOT NULL OR to_jsonb(r)->>'kind' IN ('CASUAL','RANKED')) AND r.closed_at IS NULL AND r.status='PLAYING' AND r.current_match_id=m.id
 AND m.mode='ONLINE' AND m.status='ACTIVE' AND m.time_control IN(0,300,600,900)
 AND m.rule_set_version='xiangqi-simple-v1' AND e.payload->>'encoding'='xiangqi-core-v1'
 AND p.disconnected_at IS NOT NULL AND NOT EXISTS(SELECT 1 FROM xiangqi_room.presence q WHERE q.room_id=p.room_id AND q.user_id=p.user_id AND q.connected)
 GROUP BY m.room_id,m.id)
 SELECT room_id AS "roomId",id AS "matchId",deadline::text AS "deadlineEpochMs" FROM candidates CROSS JOIN server_time
 WHERE deadline<=now_ms AND ($1::numeric IS NULL OR (deadline,id)>($1::numeric,$2::uuid)) ORDER BY deadline,id LIMIT 50`,
    [cursor?.deadlineEpochMs ?? null, cursor?.matchId ?? null],
  );
  return result.rows;
}
/**
 * Xác định người chơi mất kết nối sớm nhất và hạn chót tương ứng trong phòng (chỉ gọi khi đã giữ đủ khóa).
 */
export async function earliestDisconnect(
  client: PoolClient,
  roomId: string,
  redId: string,
  blackId: string,
): Promise<{
  deadline: number;
  deadlineMicros: bigint;
  loser: Side | null;
} | null> {
  const room = (
    await client.query<{ managed: boolean }>(
      "SELECT r.invite_code IS NOT NULL OR to_jsonb(r)->>'kind' IN ('CASUAL','RANKED') AS managed FROM public.rooms r WHERE r.id=$1",
      [roomId],
    )
  ).rows[0];
  if (!room?.managed) return null;
  const rows = (
    await client.query<{
      user_id: string;
      side: string;
      kind: string;
      deadline: string | null;
      connected: boolean;
    }>(
      `
 SELECT p.user_id,p.side,n.kind, (extract(epoch FROM (p.disconnected_at+interval '60 seconds'))*1000000)::bigint::text deadline,
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
  const offline = rows
    .filter((r) => r.deadline !== null && !r.connected)
    .sort((a, b) =>
      BigInt(a.deadline!) < BigInt(b.deadline!)
        ? -1
        : BigInt(a.deadline!) > BigInt(b.deadline!)
          ? 1
          : 0,
    );
  const first = offline[0];
  if (!first) return null;
  const deadlineMicros = BigInt(first.deadline!);
  if (deadlineMicros < 0n) throw new ClockError("CLOCK_INVALID_STATE");
  return {
    deadline: Number(deadlineMicros) / 1000,
    deadlineMicros,
    loser:
      offline[1]?.deadline === first.deadline
        ? null
        : first.side === "RED"
          ? "red"
          : "black",
  };
}

/** Caller holds both actor locks and the room lock. */
export async function adjudicateDeadline(
  client: PoolClient,
  roomId: string,
  redId: string,
  blackId: string,
  match: MatchView,
  sampledAt?: Date,
): Promise<{ outcome: MatchOutcome; at: Date } | null> {
  const disconnect = await earliestDisconnect(client, roomId, redId, blackId);
  const clockDeadline =
    match.clock.runningSinceEpochMs +
    (match.unlimited
      ? INACTIVITY_PROMPT_MS + INACTIVITY_GRACE_MS
      : match.turn === "red"
        ? match.clock.redMs
        : match.clock.blackMs);
  const clockMicros = BigInt(clockDeadline) * 1000n;
  const useDisconnect =
    disconnect &&
    (match.unlimited
      ? disconnect.deadlineMicros <= clockMicros
      : disconnect.deadlineMicros < clockMicros);
  const deadline = useDisconnect ? disconnect.deadlineMicros : clockMicros;
  const now = sampledAt
    ? BigInt(sampledAt.getTime()) * 1000n
    : BigInt(
        (
          await client.query<{ us: string }>(
            "SELECT (extract(epoch FROM clock_timestamp())*1000000)::bigint::text us",
          )
        ).rows[0]!.us,
      );
  if (deadline > now) return null;
  const loser = useDisconnect ? disconnect.loser : match.turn;
  return {
    outcome:
      useDisconnect && loser === null
        ? { reason: "DRAW_SIMULTANEOUS_DISCONNECT", winner: null }
        : {
            reason: useDisconnect
              ? "DISCONNECT"
              : match.unlimited
                ? "INACTIVITY"
                : "TIMEOUT",
            winner: loser === "red" ? "black" : "red",
          },
    at: new Date(Number(now / 1000n)),
  };
}
/**
 * Tiến trình nền tự động quét và xử lý kết thúc ván cờ khi có người chơi ngắt kết nối quá hạn.
 */
export class DisconnectWorker {
  private cursor: ClockCursor | null = null;
  constructor(
    private readonly matches: MatchStore,
    private readonly port: ClockWorkerPort,
  ) {}
  /**
   * Quét và xử lý theo đợt tối đa 50 ván đấu đến hạn xử lý ngắt kết nối.
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
      throw new AggregateError(
        failures,
        "Disconnect batch transactions failed",
      );
  }
  /**
   * Kiểm tra điều kiện ngắt kết nối hoặc hết giờ và thực hiện kết thúc ván đấu tương ứng.
   */
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
 WHERE m.id=$1 AND m.room_id=$2 AND (r.invite_code IS NOT NULL OR to_jsonb(r)->>'kind' IN ('CASUAL','RANKED')) AND r.closed_at IS NULL AND r.status='PLAYING' AND r.current_match_id=m.id
 AND m.mode='ONLINE' AND m.status='ACTIVE' AND m.time_control IN(0,300,600,900) AND m.rule_set_version='xiangqi-simple-v1' AND e.payload->>'encoding'='xiangqi-core-v1' FOR UPDATE OF m,r`,
        [candidate.matchId, candidate.roomId],
      )
    ).rows[0];
    if (!row) return;
    if (
      !scope.lockedActorIds.has(row.red_user_id) ||
      !scope.lockedActorIds.has(row.black_user_id)
    )
      throw new ClockError("CLOCK_LOCK_REQUIRED");
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
