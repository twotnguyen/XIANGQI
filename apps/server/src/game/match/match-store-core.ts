import { earliestDisconnect } from "./disconnect-worker.js";
import { randomUUID } from "node:crypto";
import { ending, type Position, type Side } from "@xiangqi/xiangqi-core";
import type { PoolClient } from "pg";
import {
  MatchError,
  type ClockPort,
  type MatchClock,
  type MatchCommandResult,
  type MatchOutcome,
  type MatchRoomEndPort,
  type MatchScope,
  type MatchView,
} from "./match.types.js";
import { replayHistory, type HistoryMove } from "./history.js";
import { corrupt, decodeMove, record, toFen, uuid } from "./position-codec.js";

export type MatchRow = {
  id: string;
  room_id: string;
  mode: string;
  status: MatchView["status"];
  red_user_id: string;
  black_user_id: string;
  position: unknown;
  version: string;
  ply: number;
  active_move_ids: unknown;
  clock: MatchClock;
  time_control: number;
  outcome: unknown;
  ended_at: Date | null;
  created_at: Date;
  rule_set_version: string;
};
export type RoomRow = {
  id: string;
  status: string;
  current_match_id: string | null;
  time_control: number;
  closed_at: Date | null;
  room_version: string;
};
export const opposite = (side: Side): Side =>
  side === "red" ? "black" : "red";
export const reject = (code: string, message: string, status = 409): never => {
  throw new MatchError(code, message, status);
};
export const assertUuid = (value: string) => {
  if (typeof value !== "string" || !uuid.test(value))
    reject("MATCH_INVALID_INPUT", "Dữ liệu ván không hợp lệ.", 400);
};
export function validClock(clock: MatchClock): MatchClock {
  if (
    !record(clock) ||
    !(["redMs", "blackMs", "runningSinceEpochMs"] as const).every(
      (key) => Number.isSafeInteger(clock[key]) && (clock[key] as number) >= 0,
    )
  )
    corrupt();
  return {
    redMs: clock.redMs,
    blackMs: clock.blackMs,
    runningSinceEpochMs: clock.runningSinceEpochMs,
  };
}
export function storedOutcome(value: unknown): MatchOutcome | null {
  if (value === null) return null;
  if (
    !record(value) ||
    ![
      "CHECKMATE",
      "STALEMATE",
      "PERPETUAL_CHECK",
      "DRAW_REPETITION",
      "DRAW_NO_CAPTURE",
      "RESIGN",
      "TIMEOUT",
      "DISCONNECT",
      "DRAW_AGREEMENT",
      "SERVER_RESTART",
    ].includes(String(value.reason)) ||
    !(
      value.winner === null ||
      value.winner === "RED" ||
      value.winner === "BLACK"
    )
  )
    corrupt();
  return {
    reason: value.reason as MatchOutcome["reason"],
    winner:
      value.winner === null ? null : value.winner === "RED" ? "red" : "black",
  };
}
export function dbOutcome(value: MatchOutcome) {
  return {
    reason: value.reason,
    winner:
      value.winner === null ? null : value.winner === "red" ? "RED" : "BLACK",
  };
}
/**
 * Lớp trừu tượng cơ sở quản lý trạng thái, lịch sử, khóa và kết thúc ván cờ tướng online.
 */
export class MatchStoreCore {
  constructor(
    protected readonly clock: ClockPort | undefined,
    protected readonly rooms: MatchRoomEndPort,
    protected readonly now: () => Date = () => new Date(),
  ) {}
  protected readonly historyCache = new Map<
    string,
    {
      version: number;
      ply: number;
      positions: Position[];
      lastMove: MatchView["lastMove"];
    }
  >();
  /**
   * Đảm bảo cổng đồng hồ được cung cấp, nếu chưa có sẽ ném lỗi 503.
   */
  protected needClock(): ClockPort {
    return (
      this.clock ??
      reject("MATCH_CLOCK_UNAVAILABLE", "Đồng hồ ván chưa khả dụng.", 503)
    );
  }
  /**
   * Truy vấn và khóa hàng dữ liệu phòng cờ trong giao dịch (`FOR UPDATE`).
   */
  protected async room(client: PoolClient, id: string): Promise<RoomRow> {
    const result = await client.query<RoomRow>(
      "SELECT id,status,current_match_id,time_control,closed_at,room_version FROM public.rooms WHERE id=$1 FOR UPDATE",
      [id],
    );
    return (
      result.rows[0] ??
      reject("MATCH_ROOM_NOT_FOUND", "Phòng không tồn tại.", 404)
    );
  }
  /**
   * Truy vấn và khóa hàng dữ liệu ván đấu theo id phòng và id ván (`FOR UPDATE`).
   */
  protected async row(
    client: PoolClient,
    roomId: string,
    id: string,
  ): Promise<MatchRow> {
    assertUuid(roomId);
    assertUuid(id);
    const result = await client.query<MatchRow>(
      "SELECT * FROM public.matches WHERE id=$1 AND room_id=$2 FOR UPDATE",
      [id, roomId],
    );
    const row =
      result.rows[0] ?? reject("MATCH_NOT_FOUND", "Ván không tồn tại.", 404);
    if (row.mode !== "ONLINE" || row.rule_set_version !== "xiangqi-simple-v1")
      reject("MATCH_HISTORY_UNSUPPORTED", "Không hỗ trợ lịch sử ván này.", 409);
    return row;
  }
  /**
   * Tái hiện toàn bộ lịch sử các thế cờ của ván và nước đi gần nhất, có hỗ trợ bộ nhớ đệm cache.
   */
  protected async history(
    client: PoolClient,
    row: MatchRow,
  ): Promise<{ positions: Position[]; lastMove: MatchView["lastMove"] }> {
    const cached = this.historyCache.get(row.id);
    if (
      cached &&
      cached.version === Number(row.version) &&
      cached.ply === Number(row.ply)
    ) {
      return { positions: cached.positions, lastMove: cached.lastMove };
    }
    const start = await client.query<{ payload: unknown }>(
      "SELECT payload FROM public.match_events WHERE match_id=$1 AND version=0 AND type='START'",
      [row.id],
    );
    const payload = start.rows[0]?.payload;
    if (
      record(payload) &&
      payload.encoding === "xiangqi-core-v1" &&
      (payload.roomId !== row.room_id ||
        payload.redId !== row.red_user_id ||
        payload.blackId !== row.black_user_id ||
        payload.ruleSetVersion !== row.rule_set_version ||
        typeof payload.startToken !== "string" ||
        !uuid.test(payload.startToken))
    )
      reject("MATCH_HISTORY_CORRUPT", "Lịch sử ván không nhất quán.");
    if (
      !Array.isArray(row.active_move_ids) ||
      !row.active_move_ids.every(
        (id) => typeof id === "string" && uuid.test(id),
      )
    )
      reject("MATCH_HISTORY_CORRUPT", "Lịch sử ván không nhất quán.");
    const moves = await client.query<HistoryMove>(
      "SELECT m.id,m.parent_move_id,m.event_version,m.side,m.move,e.type event_type,e.payload FROM public.match_moves m JOIN public.match_events e ON e.match_id=m.match_id AND e.version=m.event_version WHERE m.match_id=$1 AND m.id=ANY($2::uuid[])",
      [row.id, row.active_move_ids],
    );
    const results = await client.query<{ version: string; payload: unknown }>(
      "SELECT version,payload FROM public.match_events WHERE match_id=$1 AND type='RESULT'",
      [row.id],
    );
    try {
      const history = replayHistory({
        ...row,
        start: start.rows[0]?.payload,
        moves: moves.rows,
      });
      const coreOutcome = ending(history);
      if (row.status === "ACTIVE") {
        if (coreOutcome || results.rows.length) corrupt();
      } else {
        const result = results.rows[0];
        if (
          results.rows.length !== 1 ||
          !result ||
          Number(result.version) !== Number(row.version) ||
          !record(result.payload) ||
          !record(result.payload.outcome) ||
          !record(row.outcome) ||
          result.payload.outcome.reason !== row.outcome.reason ||
          result.payload.outcome.winner !== row.outcome.winner ||
          result.payload.endedAt !== row.ended_at?.toISOString()
        )
          corrupt();
        if (
          [
            "CHECKMATE",
            "STALEMATE",
            "PERPETUAL_CHECK",
            "DRAW_REPETITION",
            "DRAW_NO_CAPTURE",
          ].includes(String(row.outcome.reason)) &&
          (!coreOutcome ||
            coreOutcome.reason !== row.outcome.reason ||
            dbOutcome(coreOutcome).winner !== row.outcome.winner)
        )
          corrupt();
      }
      // The selected branch and MOVE payloads have all passed canonical replay.
      const lastId = (row.active_move_ids as string[]).at(-1);
      const last = lastId
        ? moves.rows.find((move) => move.id === lastId)!
        : null;
      const result = {
        positions: history,
        lastMove: last
          ? {
              ...decodeMove(last.move),
              eventVersion: Number(last.event_version),
            }
          : null,
      };
      if (row.status === "ACTIVE") {
        this.historyCache.set(row.id, {
          version: Number(row.version),
          ply: Number(row.ply),
          positions: result.positions,
          lastMove: result.lastMove,
        });
      }
      return result;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "MATCH_HISTORY_UNSUPPORTED"
      )
        reject("MATCH_HISTORY_UNSUPPORTED", "Không hỗ trợ lịch sử ván này.");
      return reject("MATCH_HISTORY_CORRUPT", "Lịch sử ván không nhất quán.");
    }
  }
  /**
   * Tạo đối tượng hiển thị `MatchView` hoàn chỉnh cho người dùng từ bản ghi CSDL và thế cờ.
   */
  protected view(
    row: MatchRow,
    position: Position,
    lastMove: MatchView["lastMove"],
  ): MatchView {
    if (!Number.isSafeInteger(Number(row.version)) || Number(row.version) < 0)
      corrupt();
    return {
      id: row.id,
      version: Number(row.version),
      ply: row.ply,
      position: toFen(position),
      lastMove,
      turn: position.turn,
      status: row.status,
      outcome: storedOutcome(row.outcome),
      endedAt: row.ended_at?.toISOString() ?? null,
      clock: validClock(row.clock),
    };
  }
  /**
   * Nạp và kiểm tra tính toàn vẹn của ngữ cảnh thực thi: phòng, ván, người chơi, quyền điều khiển và khóa giao dịch.
   */
  protected async context(
    scope: MatchScope,
    input: { matchId: string; matchVersion: number },
  ) {
    assertUuid(input.matchId);
    if (!Number.isSafeInteger(input.matchVersion) || input.matchVersion < 0)
      reject("MATCH_INVALID_INPUT", "Phiên bản ván không hợp lệ.", 400);
    if (!scope.canControl)
      reject("MATCH_READ_ONLY", "Tab này chỉ theo dõi ván.", 403);
    if (
      !scope.lockedActorIds.has(scope.actor.userId) ||
      !scope.lockedRoomIds.has(scope.roomId)
    )
      reject("MATCH_LOCK_REQUIRED", "Thiếu khóa giao dịch.", 500);
    const room = await this.room(scope.client, scope.roomId);
    if (
      room.current_match_id !== input.matchId &&
      room.current_match_id !== null
    )
      reject("MATCH_ID_MISMATCH", "Ván trong phòng đã thay đổi.");
    // An arbitrary nonexistent match ID is not accepted while the room has a current match.
    if (room.current_match_id === null && room.status === "PLAYING")
      reject("MATCH_ID_MISMATCH", "Ván trong phòng đã thay đổi.");
    const row = await this.row(scope.client, scope.roomId, input.matchId);
    if (
      !scope.lockedActorIds.has(row.red_user_id) ||
      !scope.lockedActorIds.has(row.black_user_id)
    )
      reject("MATCH_LOCK_REQUIRED", "Thiếu khóa người chơi.", 500);
    const side: Side =
      scope.actor.userId === row.red_user_id
        ? "red"
        : scope.actor.userId === row.black_user_id
          ? "black"
          : reject(
              "MATCH_PLAYER_REQUIRED",
              "Chỉ người chơi được điều khiển ván.",
              403,
            );
    const seat = (
      await scope.client.query<{ side: string }>(
        "SELECT side FROM public.room_members WHERE room_id=$1 AND user_id=$2 AND role='PLAYER'",
        [scope.roomId, scope.actor.userId],
      )
    ).rows[0];
    if (!seat || seat.side !== (side === "red" ? "RED" : "BLACK"))
      reject("MATCH_PLAYER_REQUIRED", "Ghế người chơi đã thay đổi.", 403);
    const { positions: history, lastMove } = await this.history(
      scope.client,
      row,
    );
    const match = this.view(row, history.at(-1)!, lastMove);
    return { room, row, side, history, match };
  }
  /**
   * Tạo đối tượng kết quả trả về khi hành động trong ván bị từ chối kèm lỗi.
   */
  protected denied(
    match: MatchView,
    code: string,
    message: string,
  ): MatchCommandResult {
    return { applied: false, match, error: { code, message } };
  }
  /**
   * Kiểm tra và tự động xử thua nếu có người chơi đã mất kết nối quá thời hạn cho phép.
   */
  protected async expiredDisconnect(
    scope: MatchScope,
    row: MatchRow,
    match: MatchView,
    position: Position,
  ): Promise<MatchView | null> {
    const disconnect = await earliestDisconnect(
      scope.client,
      scope.roomId,
      row.red_user_id,
      row.black_user_id,
    );
    if (!disconnect) return null;
    const deadline =
      match.clock.runningSinceEpochMs +
      (match.turn === "red" ? match.clock.redMs : match.clock.blackMs);
    if (disconnect.deadline >= deadline) return null;
    const at = new Date(
      Number(
        (
          await scope.client.query<{ ms: string }>(
            "SELECT floor(extract(epoch FROM clock_timestamp())*1000)::bigint ms",
          )
        ).rows[0]!.ms,
      ),
    );
    if (disconnect.deadline > at.getTime()) return null;
    return this.end(
      scope.client,
      row,
      position,
      { reason: "DISCONNECT", winner: opposite(disconnect.loser) },
      at,
      row.clock,
      match.lastMove,
    );
  }
  /**
   * Cập nhật trạng thái ván đấu trong bảng `public.matches`.
   */
  protected async update(client: PoolClient, row: MatchRow) {
    await client.query(
      "UPDATE public.matches SET position=$2,version=$3,ply=$4,active_move_ids=$5,clock=$6,repetition_counts=$7,status=$8,outcome=$9,ended_at=$10,proposal=NULL,updated_at=$11 WHERE id=$1",
      [
        row.id,
        row.position,
        row.version,
        row.ply,
        JSON.stringify(row.active_move_ids),
        row.clock,
        {},
        row.status,
        row.outcome,
        row.ended_at,
        this.now(),
      ],
    );
  }
  /**
   * Kết thúc ván đấu, lưu sự kiện RESULT, cập nhật phòng và ghi sự kiện realtime vào outbox.
   */
  protected async end(
    client: PoolClient,
    row: MatchRow,
    position: Position,
    outcome: MatchOutcome,
    at: Date,
    clock: MatchClock,
    lastMove: MatchView["lastMove"],
  ): Promise<MatchView> {
    if (!Number.isFinite(at.getTime()) || at < row.created_at)
      reject("MATCH_INVALID_OUTCOME", "Thời điểm kết thúc không hợp lệ.", 500);
    this.historyCache.delete(row.id);
    const version = Number(row.version) + 1;
    await client.query(
      "INSERT INTO public.match_events(match_id,version,type,payload,created_at) VALUES($1,$2,'RESULT',$3,$4)",
      [
        row.id,
        version,
        { outcome: dbOutcome(outcome), endedAt: at.toISOString() },
        at,
      ],
    );
    const updated: MatchRow = {
      ...row,
      version: String(version),
      status: outcome.reason === "SERVER_RESTART" ? "INTERRUPTED" : "FINISHED",
      outcome: dbOutcome(outcome),
      ended_at: at,
      clock: validClock(clock),
    };
    await this.update(client, updated);
    await this.rooms.onMatchEnded(client, {
      roomId: row.room_id,
      matchId: row.id,
      endedAt: at,
    });
    await this.outbox(client, row.room_id, "MATCH_RESULT", {
      matchId: row.id,
      matchVersion: version,
      outcome,
      endedAt: at.toISOString(),
    });
    return this.view(updated, position, lastMove);
  }
  /**
   * Thêm sự kiện phòng vào bảng outbox để phát thông báo realtime ra client.
   */
  protected async outbox(
    client: PoolClient,
    roomId: string,
    type: string,
    payload: unknown,
  ) {
    await client.query(
      "INSERT INTO xiangqi_room.outbox(id,room_id,room_version,type,payload) SELECT $1,id,room_version,$3,$4 FROM public.rooms WHERE id=$2",
      [randomUUID(), roomId, type, payload],
    );
  }
}
