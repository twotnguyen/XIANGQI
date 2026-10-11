import { earliestDisconnect } from "./disconnect-worker.js";
import { randomUUID } from "node:crypto";
import {
  ending,
  initialPosition,
  playMove,
  type Position,
  type Side,
} from "@xiangqi/xiangqi-core";
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
} from "./contracts.js";
import { replayHistory, type HistoryMove } from "./history.js";
import {
  corrupt,
  encodeMove,
  encodePosition,
  record,
  toFen,
  uuid,
} from "./position-codec.js";

type MatchRow = {
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
type RoomRow = {
  id: string;
  status: string;
  current_match_id: string | null;
  time_control: number;
  closed_at: Date | null;
  room_version: string;
};
const opposite = (side: Side): Side => (side === "red" ? "black" : "red");
const reject = (code: string, message: string, status = 409): never => {
  throw new MatchError(code, message, status);
};
const assertUuid = (value: string) => {
  if (typeof value !== "string" || !uuid.test(value))
    reject("MATCH_INVALID_INPUT", "Dữ liệu ván không hợp lệ.", 400);
};
function validClock(clock: MatchClock): MatchClock {
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
function storedOutcome(value: unknown): MatchOutcome | null {
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
function dbOutcome(value: MatchOutcome) {
  return {
    reason: value.reason,
    winner:
      value.winner === null ? null : value.winner === "red" ? "RED" : "BLACK",
  };
}

/** The caller owns actor→room locks, transaction, receipts and post-commit publication. */
export class MatchStore {
  constructor(
    private readonly clock: ClockPort | undefined,
    private readonly rooms: MatchRoomEndPort,
    private readonly now: () => Date = () => new Date(),
  ) {}
  private needClock(): ClockPort {
    return (
      this.clock ??
      reject("MATCH_CLOCK_UNAVAILABLE", "Đồng hồ ván chưa khả dụng.", 503)
    );
  }
  private async room(client: PoolClient, id: string): Promise<RoomRow> {
    const result = await client.query<RoomRow>(
      "SELECT id,status,current_match_id,time_control,closed_at,room_version FROM public.rooms WHERE id=$1 FOR UPDATE",
      [id],
    );
    return (
      result.rows[0] ??
      reject("MATCH_ROOM_NOT_FOUND", "Phòng không tồn tại.", 404)
    );
  }
  private async row(
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
  private async history(
    client: PoolClient,
    row: MatchRow,
  ): Promise<Position[]> {
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
      return history;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "MATCH_HISTORY_UNSUPPORTED"
      )
        reject("MATCH_HISTORY_UNSUPPORTED", "Không hỗ trợ lịch sử ván này.");
      return reject("MATCH_HISTORY_CORRUPT", "Lịch sử ván không nhất quán.");
    }
  }
  private view(row: MatchRow, position: Position): MatchView {
    if (!Number.isSafeInteger(Number(row.version)) || Number(row.version) < 0)
      corrupt();
    return {
      id: row.id,
      version: Number(row.version),
      ply: row.ply,
      position: toFen(position),
      turn: position.turn,
      status: row.status,
      outcome: storedOutcome(row.outcome),
      endedAt: row.ended_at?.toISOString() ?? null,
      clock: validClock(row.clock),
    };
  }
  async start(
    client: PoolClient,
    input: {
      roomId: string;
      startToken: string;
      redId: string;
      blackId: string;
      timeControlSeconds: number;
      startedAt: Date;
    },
  ): Promise<{ matchId: string }> {
    for (const value of [
      input.roomId,
      input.startToken,
      input.redId,
      input.blackId,
    ])
      assertUuid(value);
    if (
      input.redId === input.blackId ||
      ![300, 600, 900].includes(input.timeControlSeconds) ||
      !Number.isFinite(input.startedAt.getTime())
    )
      reject("MATCH_INVALID_INPUT", "Dữ liệu bắt đầu ván không hợp lệ.", 400);
    const room = await this.room(client, input.roomId);
    const prior = await client.query<MatchRow>(
      "SELECT m.* FROM public.matches m JOIN public.match_events e ON e.match_id=m.id WHERE e.type='START' AND e.payload->>'encoding'='xiangqi-core-v1' AND e.payload->>'startToken'=$1",
      [input.startToken],
    );
    if (prior.rows[0]) {
      const old = prior.rows[0];
      if (
        old.room_id !== input.roomId ||
        old.red_user_id !== input.redId ||
        old.black_user_id !== input.blackId ||
        old.time_control !== input.timeControlSeconds
      )
        reject("MATCH_START_CONFLICT", "Mã bắt đầu ván đã được dùng.");
      const history = await this.history(client, old);
      if (toFen(history[0]!) !== toFen(initialPosition()))
        reject("MATCH_START_CONFLICT", "Thế bắt đầu ván đã thay đổi.");
      return { matchId: old.id };
    }
    const clock = this.needClock();
    const countdown = (
      await client.query<{ red_id: string; black_id: string; due_at: Date }>(
        "SELECT red_id,black_id,due_at FROM xiangqi_room.countdowns WHERE room_id=$1 AND token=$2 FOR UPDATE",
        [input.roomId, input.startToken],
      )
    ).rows[0];
    const seats = (
      await client.query<{ user_id: string; side: string; ready: boolean }>(
        "SELECT user_id,side,ready FROM public.room_members WHERE room_id=$1 AND role='PLAYER' ORDER BY side FOR UPDATE",
        [input.roomId],
      )
    ).rows;
    if (
      room.status !== "WAITING" ||
      room.closed_at ||
      room.current_match_id ||
      room.time_control !== input.timeControlSeconds ||
      !countdown ||
      countdown.red_id !== input.redId ||
      countdown.black_id !== input.blackId ||
      countdown.due_at > input.startedAt ||
      seats.length !== 2 ||
      !seats.some(
        (s) => s.side === "RED" && s.user_id === input.redId && s.ready,
      ) ||
      !seats.some(
        (s) => s.side === "BLACK" && s.user_id === input.blackId && s.ready,
      )
    )
      reject("MATCH_START_CONFLICT", "Điều kiện bắt đầu ván đã thay đổi.");
    const position = encodePosition(initialPosition());
    const matchId = randomUUID();
    const initialClock = validClock(
      clock.start(input.timeControlSeconds as 300 | 600 | 900, input.startedAt),
    );
    await client.query(
      "INSERT INTO public.matches(id,room_id,mode,status,red_user_id,black_user_id,position,time_control,clock,created_at) VALUES($1,$2,'ONLINE','ACTIVE',$3,$4,$5,$6,$7,$8)",
      [
        matchId,
        input.roomId,
        input.redId,
        input.blackId,
        position,
        input.timeControlSeconds,
        initialClock,
        input.startedAt,
      ],
    );
    await client.query(
      "INSERT INTO public.match_events(match_id,version,type,payload,created_at) VALUES($1,0,'START',$2,$3)",
      [
        matchId,
        {
          encoding: "xiangqi-core-v1",
          startToken: input.startToken,
          roomId: input.roomId,
          redId: input.redId,
          blackId: input.blackId,
          initialPosition: position,
          ruleSetVersion: "xiangqi-simple-v1",
        },
        input.startedAt,
      ],
    );
    return { matchId };
  }
  async snapshot(
    client: PoolClient,
    roomId: string,
    matchId: string,
  ): Promise<MatchView> {
    const row = await this.row(client, roomId, matchId);
    const history = await this.history(client, row);
    return this.view(row, history.at(-1)!);
  }
  private async context(
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
    const history = await this.history(scope.client, row);
    const match = this.view(row, history.at(-1)!);
    return { room, row, side, history, match };
  }
  private denied(
    match: MatchView,
    code: string,
    message: string,
  ): MatchCommandResult {
    return { applied: false, match, error: { code, message } };
  }
  private async expiredDisconnect(
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
    );
  }
  async move(
    scope: MatchScope,
    input: { matchId: string; matchVersion: number; from: number; to: number },
  ): Promise<MatchCommandResult> {
    if (
      !Number.isInteger(input.from) ||
      !Number.isInteger(input.to) ||
      input.from < 0 ||
      input.from > 89 ||
      input.to < 0 ||
      input.to > 89 ||
      input.from === input.to
    )
      reject("MATCH_INVALID_INPUT", "Ô cờ không hợp lệ.", 400);
    const { room, row, side, history, match } = await this.context(
      scope,
      input,
    );
    if (row.status !== "ACTIVE")
      return this.denied(match, "MATCH_FINISHED", "Ván đã kết thúc.");
    if (room.current_match_id !== row.id || room.status !== "PLAYING")
      reject("MATCH_ID_MISMATCH", "Ván trong phòng đã thay đổi.");
    const ended = await this.expiredDisconnect(
      scope,
      row,
      match,
      history.at(-1)!,
    );
    if (ended) return this.denied(ended, "MATCH_FINISHED", "Ván đã kết thúc.");
    if (match.version !== input.matchVersion)
      return this.denied(
        match,
        "MATCH_VERSION_CONFLICT",
        "Thế cờ đã thay đổi.",
      );
    const clock = this.needClock();
    const at = this.now();
    const checked = clock.beforeAction(match.clock, match.turn, at);
    validClock(checked.clock);
    if (checked.expired) {
      if (checked.expired !== match.turn) corrupt();
      const terminal = await this.end(
        scope.client,
        row,
        history.at(-1)!,
        { reason: "TIMEOUT", winner: opposite(checked.expired) },
        at,
        checked.clock,
      );
      return this.denied(
        terminal,
        "MATCH_TIME_EXPIRED",
        "Thời gian suy nghĩ đã hết.",
      );
    }
    if (side !== match.turn)
      return this.denied(match, "MATCH_NOT_YOUR_TURN", "Chưa đến lượt bạn.");
    let next: Position;
    try {
      next = playMove(history.at(-1)!, { from: input.from, to: input.to });
    } catch {
      return this.denied(match, "MATCH_ILLEGAL_MOVE", "Nước đi không hợp lệ.");
    }
    const moveId = randomUUID(),
      version = match.version + 1;
    const move = encodeMove(input);
    await scope.client.query(
      "INSERT INTO public.match_events(match_id,version,type,payload,created_at) VALUES($1,$2,'MOVE',$3,$4)",
      [
        row.id,
        version,
        { moveId, side: side === "red" ? "RED" : "BLACK", move },
        at,
      ],
    );
    const active = row.active_move_ids as string[];
    await scope.client.query(
      "INSERT INTO public.match_moves(id,match_id,parent_move_id,event_version,side,move,created_at) VALUES($1,$2,$3,$4,$5,$6,$7)",
      [
        moveId,
        row.id,
        active.at(-1) ?? null,
        version,
        side === "red" ? "RED" : "BLACK",
        move,
        at,
      ],
    );
    const updated = {
      ...row,
      position: encodePosition(next),
      version: String(version),
      ply: row.ply + 1,
      active_move_ids: [...active, moveId],
      clock: validClock(clock.afterMove(checked.clock, next.turn, at)),
    };
    const outcome = ending([...history, next]);
    let result: MatchView;
    if (outcome)
      result = await this.end(
        scope.client,
        updated,
        next,
        outcome,
        at,
        updated.clock,
      );
    else {
      await this.update(scope.client, updated);
      await scope.client.query(
        "UPDATE public.rooms SET room_version=room_version+1 WHERE id=$1",
        [room.id],
      );
      result = this.view(updated, next);
    }
    await this.outbox(scope.client, row.room_id, "MATCH_MOVE", {
      matchId: row.id,
      matchVersion: version,
      moveId,
      move,
      turn: next.turn,
    });
    return { applied: true, match: result };
  }
  async resign(
    scope: MatchScope,
    input: { matchId: string; matchVersion: number },
  ): Promise<MatchCommandResult> {
    const { room, row, side, history, match } = await this.context(
      scope,
      input,
    );
    if (row.status !== "ACTIVE")
      return this.denied(match, "MATCH_FINISHED", "Ván đã kết thúc.");
    if (room.current_match_id !== row.id || room.status !== "PLAYING")
      reject("MATCH_ID_MISMATCH", "Ván trong phòng đã thay đổi.");
    const ended = await this.expiredDisconnect(
      scope,
      row,
      match,
      history.at(-1)!,
    );
    if (ended) return this.denied(ended, "MATCH_FINISHED", "Ván đã kết thúc.");
    if (match.version !== input.matchVersion)
      return this.denied(
        match,
        "MATCH_VERSION_CONFLICT",
        "Thế cờ đã thay đổi.",
      );
    const at = this.now();
    const checked = this.needClock().beforeAction(match.clock, match.turn, at);
    validClock(checked.clock);
    if (checked.expired && checked.expired !== match.turn) corrupt();
    const outcome: MatchOutcome = {
      reason: checked.expired ? "TIMEOUT" : "RESIGN",
      winner: opposite(checked.expired ?? side),
    };
    return {
      applied: !checked.expired,
      match: await this.end(
        scope.client,
        row,
        history.at(-1)!,
        outcome,
        at,
        checked.clock,
      ),
      ...(checked.expired
        ? {
            error: {
              code: "MATCH_TIME_EXPIRED",
              message: "Thời gian suy nghĩ đã hết.",
            },
          }
        : {}),
    };
  }
  async finish(
    client: PoolClient,
    input: { roomId: string; matchId: string; outcome: MatchOutcome; at: Date },
  ): Promise<MatchView> {
    const room = await this.room(client, input.roomId);
    const row = await this.row(client, input.roomId, input.matchId);
    const history = await this.history(client, row);
    if (row.status !== "ACTIVE") return this.view(row, history.at(-1)!);
    if (room.current_match_id !== row.id || room.status !== "PLAYING")
      reject("MATCH_ID_MISMATCH", "Ván trong phòng đã thay đổi.");
    const { reason, winner } = input.outcome;
    if (
      ![
        "RESIGN",
        "TIMEOUT",
        "DISCONNECT",
        "DRAW_AGREEMENT",
        "SERVER_RESTART",
      ].includes(reason) ||
      (["DRAW_AGREEMENT", "SERVER_RESTART"].includes(reason)
        ? winner !== null
        : !["red", "black"].includes(String(winner)))
    )
      reject("MATCH_INVALID_OUTCOME", "Kết quả máy chủ không hợp lệ.", 400);
    let clock = row.clock;
    if (reason === "TIMEOUT") {
      const turn = history.at(-1)!.turn;
      const checked = this.needClock().beforeAction(
        validClock(row.clock),
        turn,
        input.at,
      );
      if (checked.expired !== turn || winner !== opposite(turn))
        reject(
          "MATCH_INVALID_OUTCOME",
          "Đồng hồ chưa hết hoặc phe thắng không hợp lệ.",
          400,
        );
      clock = validClock(checked.clock);
      if ((turn === "red" ? clock.redMs : clock.blackMs) !== 0)
        reject(
          "MATCH_INVALID_OUTCOME",
          "Đồng hồ hết giờ chưa được chốt về không.",
          500,
        );
    }
    return this.end(
      client,
      row,
      history.at(-1)!,
      input.outcome,
      input.at,
      clock,
    );
  }
  private async update(client: PoolClient, row: MatchRow) {
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
  private async end(
    client: PoolClient,
    row: MatchRow,
    position: Position,
    outcome: MatchOutcome,
    at: Date,
    clock: MatchClock,
  ): Promise<MatchView> {
    if (!Number.isFinite(at.getTime()) || at < row.created_at)
      reject("MATCH_INVALID_OUTCOME", "Thời điểm kết thúc không hợp lệ.", 500);
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
    return this.view(updated, position);
  }
  private async outbox(
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
