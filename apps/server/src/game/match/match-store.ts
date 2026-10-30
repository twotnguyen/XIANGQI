import { randomUUID } from "node:crypto";
import {
  ending,
  initialPosition,
  playMove,
  type Position,
} from "@xiangqi/xiangqi-core";
import type { PoolClient } from "pg";
import {
  type MatchCommandResult,
  type MatchOutcome,
  type MatchScope,
  type MatchView,
} from "./match.types.js";
import {
  corrupt,
  encodeMove,
  encodePosition,
  toFen,
} from "./position-codec.js";
import {
  type MatchRow,
  type RoomMatch,
  opposite,
  reject,
  assertUuid,
  validClock,
} from "./match-store-core.js";
import { MatchDrawStore } from "./match-store-draw.js";
import {
  UNLIMITED_TIME_CONTROL,
  inactivityExpired,
  unlimitedClock,
} from "./inactivity.js";

export type CurrentMatch = RoomMatch & { match: MatchView | null };
/**
 * Lớp Store hoàn chỉnh quản lý vòng đời ván đấu: khởi tạo ván, thực hiện nước đi, đầu hàng và kết thúc ván.
 */
export class MatchStore extends MatchDrawStore {
  /**
   * Khởi tạo và bắt đầu ván đấu mới khi cả hai người chơi đã sẵn sàng và đếm ngược hoàn tất.
   */
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
      ![0, 300, 600, 900].includes(input.timeControlSeconds) ||
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
      const { positions: history } = await this.history(client, old);
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
      input.timeControlSeconds === UNLIMITED_TIME_CONTROL
        ? unlimitedClock(input.startedAt)
        : clock.start(
            input.timeControlSeconds as 300 | 600 | 900,
            input.startedAt,
          ),
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
  /**
   * Truy vấn ảnh chụp nhanh trạng thái ván cờ hiện tại.
   */
  async snapshot(
    client: PoolClient,
    roomId: string,
    matchId: string,
  ): Promise<MatchView> {
    const row = await this.row(client, roomId, matchId);
    const { positions: history, lastMove } = await this.history(client, row);
    return this.view(row, history.at(-1)!, lastMove);
  }
  /**
   * Đọc phòng, ván hiện tại và ghế của người xem trong một truy vấn đã khóa, kèm ảnh chụp ván (nếu có).
   * Không kiểm tra quyền; đường điều khiển phải gọi `assertSeated` trước khi tin `seat`.
   */
  async current(
    client: PoolClient,
    roomId: string,
    viewerId: string,
  ): Promise<CurrentMatch> {
    const loaded = await this.currentRoomMatch(client, roomId, viewerId);
    if (loaded.room.current_match_id !== null && !loaded.row)
      reject("MATCH_NOT_FOUND", "Ván không tồn tại.", 404);
    if (!loaded.row) return { ...loaded, match: null };
    const { positions: history, lastMove } = await this.history(
      client,
      loaded.row,
    );
    return {
      ...loaded,
      match: this.view(loaded.row, history.at(-1)!, lastMove),
    };
  }
  /**
   * Thực hiện một nước đi cờ của người chơi, kiểm tra tính hợp lệ luật cờ, cập nhật đồng hồ và phát hiện thắng thua.
   */
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
    const at = this.now();
    const checked = this.checkTime(match, at);
    validClock(checked.clock);
    if (checked.expired) {
      if (checked.expired !== match.turn) corrupt();
      const terminal = await this.end(
        scope.client,
        row,
        history.at(-1)!,
        {
          reason: match.inactivity ? "INACTIVITY" : "TIMEOUT",
          winner: opposite(checked.expired),
        },
        at,
        checked.clock,
        match.lastMove,
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
    const active = row.active_move_ids as string[];
    const updated = {
      ...row,
      position: encodePosition(next),
      version: String(version),
      ply: row.ply + 1,
      active_move_ids: [...active, moveId],
      clock: match.inactivity
        ? unlimitedClock(at)
        : validClock(this.needClock().afterMove(checked.clock, next.turn, at)),
      inactivity_extensions: 0,
    };
    const lastMove = { from: input.from, to: input.to, eventVersion: version };
    const outcome = ending([...history, next]);
    const sideCode = side === "red" ? "RED" : "BLACK";
    const payload = {
      matchId: row.id,
      matchVersion: version,
      moveId,
      move,
      turn: next.turn,
    };
    let result: MatchView;
    if (outcome) {
      await scope.client.query(
        `WITH event AS (
           INSERT INTO public.match_events(match_id,version,type,payload,created_at)
           VALUES($2,$4,'MOVE',jsonb_build_object('moveId',$1::uuid,'side',$5::text,'move',$6::jsonb),$7)
           RETURNING match_id,version
         )
         INSERT INTO public.match_moves(id,match_id,parent_move_id,event_version,side,move,created_at)
         SELECT $1,event.match_id,$3,event.version,$5,$6,$7 FROM event`,
        [moveId, row.id, active.at(-1) ?? null, version, sideCode, move, at],
      );
      result = await this.end(
        scope.client,
        updated,
        next,
        outcome,
        at,
        updated.clock,
        lastMove,
      );
      await this.outbox(scope.client, row.room_id, "MATCH_MOVE", payload);
    } else {
      // One round-trip: event+move, match row, room version bump and outbox row.
      await scope.client.query(
        `WITH event AS (
           INSERT INTO public.match_events(match_id,version,type,payload,created_at)
           VALUES($2,$4,'MOVE',jsonb_build_object('moveId',$1::uuid,'side',$5::text,'move',$6::jsonb),$7)
           RETURNING match_id,version
         ), moved AS (
           INSERT INTO public.match_moves(id,match_id,parent_move_id,event_version,side,move,created_at)
           SELECT $1,event.match_id,$3,event.version,$5,$6,$7 FROM event
           RETURNING id
         ), upd AS (
          UPDATE public.matches SET position=$8,version=$9,ply=$10,active_move_ids=$11,clock=$12,repetition_counts=$13,status=$14,outcome=$15,ended_at=$16,proposal=NULL,updated_at=$20,inactivity_extensions=$21
           WHERE id=$2 RETURNING id
         ), bump AS (
           UPDATE public.rooms SET room_version=room_version+1 WHERE id=$17 RETURNING id,room_version
         )
         INSERT INTO xiangqi_room.outbox(id,room_id,room_version,type,payload)
         SELECT $18,bump.id,bump.room_version,'MATCH_MOVE',$19 FROM bump`,
        [
          moveId,
          row.id,
          active.at(-1) ?? null,
          version,
          sideCode,
          move,
          at,
          updated.position,
          updated.version,
          updated.ply,
          JSON.stringify(updated.active_move_ids),
          updated.clock,
          {},
          updated.status,
          updated.outcome,
          updated.ended_at,
          room.id,
          randomUUID(),
          payload,
          this.now(),
          updated.inactivity_extensions,
        ],
      );
      result = this.view(updated, next, lastMove);
    }
    this.historyCache.set(row.id, {
      version,
      ply: Number(row.ply) + 1,
      positions: [...history, next],
      lastMove,
    });
    return { applied: true, match: result };
  }
  /**
   * Người chơi nhận thua (đầu hàng) ván đấu.
   */
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
    const checked = this.checkTime(match, at);
    validClock(checked.clock);
    if (checked.expired && checked.expired !== match.turn) corrupt();
    const outcome: MatchOutcome = {
      reason: checked.expired
        ? match.inactivity
          ? "INACTIVITY"
          : "TIMEOUT"
        : "RESIGN",
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
        match.lastMove,
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

  /** Ván không giới hạn: người đang tới lượt xác nhận "Tôi còn đây" để reset cửa sổ chống treo (tối đa 2 lần liên tiếp). */
  async stillHere(
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
    if (!match.inactivity)
      return this.denied(
        match,
        "MATCH_NOT_UNLIMITED",
        "Ván này có đồng hồ, không cần xác nhận.",
      );
    if (side !== match.turn)
      return this.denied(match, "MATCH_NOT_YOUR_TURN", "Chưa đến lượt bạn.");
    const at = this.now();
    if (inactivityExpired(match.clock, at)) {
      const terminal = await this.end(
        scope.client,
        row,
        history.at(-1)!,
        { reason: "INACTIVITY", winner: opposite(match.turn) },
        at,
        match.clock,
        match.lastMove,
      );
      return this.denied(
        terminal,
        "MATCH_INACTIVITY_EXPIRED",
        "Đã hết thời gian xác nhận.",
      );
    }
    if (at.getTime() < Date.parse(match.inactivity.promptAt))
      return this.denied(
        match,
        "MATCH_INACTIVITY_NOT_DUE",
        "Chưa đến lúc hỏi xác nhận.",
      );
    if (match.inactivity.confirmsLeft <= 0)
      return this.denied(
        match,
        "MATCH_INACTIVITY_LIMIT",
        "Đã xác nhận tối đa, cần đi nước để tiếp tục.",
      );
    const next = {
      ...row,
      clock: unlimitedClock(at),
      inactivity_extensions: row.inactivity_extensions + 1,
    };
    await this.update(scope.client, next);
    return {
      applied: true,
      match: this.view(next, history.at(-1)!, match.lastMove),
    };
  }
  /**
   * Kết thúc ván đấu từ phía máy chủ khi phát hiện hết giờ hoặc mất kết nối ngoài luồng thao tác trực tiếp của người chơi.
   */
  async finish(
    client: PoolClient,
    input: { roomId: string; matchId: string; outcome: MatchOutcome; at: Date },
  ): Promise<MatchView> {
    const room = await this.room(client, input.roomId);
    const row = await this.row(client, input.roomId, input.matchId);
    const { positions: history, lastMove } = await this.history(client, row);
    if (row.status !== "ACTIVE")
      return this.view(row, history.at(-1)!, lastMove);
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
        "INACTIVITY",
      ].includes(reason) ||
      (["DRAW_AGREEMENT", "SERVER_RESTART"].includes(reason)
        ? winner !== null
        : !["red", "black"].includes(String(winner)))
    )
      reject("MATCH_INVALID_OUTCOME", "Kết quả máy chủ không hợp lệ.", 400);
    let clock = row.clock;
    if (reason === "INACTIVITY") {
      if (
        row.time_control !== UNLIMITED_TIME_CONTROL ||
        !inactivityExpired(validClock(row.clock), input.at) ||
        winner !== opposite(history.at(-1)!.turn)
      )
        reject(
          "MATCH_INVALID_OUTCOME",
          "Chưa hết thời gian xác nhận hoặc phe thắng không hợp lệ.",
          400,
        );
    } else if (reason === "TIMEOUT") {
      if (row.time_control === UNLIMITED_TIME_CONTROL)
        reject(
          "MATCH_INVALID_OUTCOME",
          "Ván không giới hạn không có hết giờ.",
          400,
        );
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
      lastMove,
    );
  }
}
