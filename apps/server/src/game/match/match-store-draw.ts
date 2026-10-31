import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import {
  type MatchDrawView,
  type MatchDrawCommandResult,
  type MatchScope,
  type MatchView,
} from "./match.types.js";
import { corrupt } from "./position-codec.js";
import {
  opposite,
  reject,
  assertUuid,
  validClock,
  assertScope,
  assertSeated,
  type RoomMatch,
} from "./match-store-core.js";
import { MatchStoreCore } from "./match-store-core.js";
import { inactivityExpired } from "./inactivity.js";

/**
 * Lớp mở rộng quản lý toàn bộ cơ chế xin hòa, rút đề nghị, chấp thuận, từ chối và thời gian chờ cầu hòa.
 */
export class MatchDrawStore extends MatchStoreCore {
  private async drawTime(client: PoolClient): Promise<Date> {
    return (await client.query<{ at: Date }>("SELECT clock_timestamp() at"))
      .rows[0]!.at;
  }
  private async drawState(
    client: PoolClient,
    match: MatchView,
    at: Date | null,
  ): Promise<MatchDrawView> {
    // Một lượt truy vấn: đề nghị, tổng nước đi hiện tại của từng bên, và số nước
    // đi tính đến expires_at cho đề nghị PENDING đã hết hạn tại `at`.
    // date_trunc ms khớp với Date phía JS (node-pg chỉ giữ mili-giây).
    const rows = (
      await client.query<{
        id: string;
        sender: "RED" | "BLACK";
        status: string;
        expires_at: Date;
        sampled_at: Date;
        cooldown_after_move_count: number | null;
        side_moves: number;
        expired_baseline: number | null;
      }>(
        `WITH sampled AS MATERIALIZED (
           SELECT COALESCE($2::timestamptz,date_trunc('milliseconds',clock_timestamp())) AS at
         ), side_counts AS (
           SELECT payload->>'side' AS side,count(*)::int AS n
           FROM public.match_events WHERE match_id=$1 AND type='MOVE'
           GROUP BY payload->>'side'
         )
         SELECT o.id,o.sender,o.status,o.expires_at,o.cooldown_after_move_count,
           sampled.at AS sampled_at,COALESCE(sc.n,0) AS side_moves,
           CASE WHEN o.status='PENDING' AND date_trunc('milliseconds',o.expires_at)<=sampled.at THEN (
             SELECT count(*)::int FROM public.match_events e
             WHERE e.match_id=$1 AND e.type='MOVE' AND e.payload->>'side'=o.sender
               AND e.created_at<=date_trunc('milliseconds',o.expires_at)
           ) END AS expired_baseline
         FROM xiangqi_room.match_draw_offers o CROSS JOIN sampled
         LEFT JOIN side_counts sc ON sc.side=o.sender
         WHERE o.match_id=$1
         ORDER BY o.created_at,o.id`,
        [match.id, at],
      )
    ).rows;
    const remainingMoves = { red: 0, black: 0 };
    for (const offer of rows) {
      const baseline =
        offer.status === "PENDING" && offer.expires_at <= offer.sampled_at
          ? offer.expired_baseline
          : offer.cooldown_after_move_count;
      if (baseline !== null) {
        const side = offer.sender === "RED" ? "red" : "black";
        remainingMoves[side] = Math.max(
          remainingMoves[side],
          5 - (offer.side_moves - baseline),
          0,
        );
      }
    }
    return {
      offers:
        match.status === "ACTIVE"
          ? rows
              .filter(
                (o) => o.status === "PENDING" && o.expires_at > o.sampled_at,
              )
              .map((o) => ({
                id: o.id,
                sender: o.sender === "RED" ? "red" : "black",
                expiresAt: o.expires_at.toISOString(),
              }))
          : [],
      remainingMoves,
    };
  }
  private async drawMoveCount(
    client: PoolClient,
    matchId: string,
    side: string,
    at: Date,
  ): Promise<number> {
    return (
      await client.query<{ n: number }>(
        "SELECT count(*)::int n FROM public.match_events WHERE match_id=$1 AND type='MOVE' AND payload->>'side'=$2 AND created_at<=$3",
        [matchId, side, at],
      )
    ).rows[0]!.n;
  }
  /**
   * Lấy trạng thái hiện tại của các đề nghị hòa và số nước hồi chiêu (cooldown) của mỗi bên.
   */
  async drawSnapshot(
    scope: MatchScope,
    input: { matchId: string },
  ): Promise<MatchDrawView> {
    const { match } = await this.context(scope, { ...input, matchVersion: 0 });
    return this.drawState(scope.client, match, null);
  }
  /**
   * Chiếu cầu hòa cho ván đã đọc trong cùng giao dịch khóa (`MatchStore.current`) mà không đọc lại ván.
   * Giữ nguyên kiểm tra quyền điều khiển, khóa và ghế như `drawSnapshot`.
   */
  async drawOf(
    scope: MatchScope,
    loaded: RoomMatch,
    match: MatchView,
  ): Promise<MatchDrawView> {
    assertScope(scope);
    assertSeated(scope, match.id, loaded);
    return this.drawState(scope.client, match, null);
  }
  /**
   * Người chơi gửi đề nghị xin hòa tới đối thủ trong ván đấu đang diễn ra.
   */
  offerDraw(
    scope: MatchScope,
    input: { matchId: string; matchVersion: number },
  ): Promise<MatchDrawCommandResult> {
    return this.drawAction(scope, input, "offer");
  }
  /**
   * Người chơi rút lại lời đề nghị xin hòa đã gửi trước đó khi đối thủ chưa phản hồi.
   */
  withdrawDraw(
    scope: MatchScope,
    input: { matchId: string; matchVersion: number; offerId: string },
  ): Promise<MatchDrawCommandResult> {
    return this.drawAction(scope, input, "withdraw");
  }
  /**
   * Đối thủ phản hồi đề nghị hòa (chấp nhận hoặc từ chối).
   */
  respondDraw(
    scope: MatchScope,
    input: {
      matchId: string;
      matchVersion: number;
      offerId: string;
      accept: boolean;
    },
  ): Promise<MatchDrawCommandResult> {
    if (typeof input.accept !== "boolean")
      reject("MATCH_INVALID_INPUT", "Phản hồi không hợp lệ.", 400);
    return this.drawAction(scope, input, input.accept ? "accept" : "decline");
  }
  /**
   * Cập nhật trạng thái hết hạn cho các đề nghị hòa đã quá thời gian 30 giây.
   */
  async expireDrawOffers(
    scope: MatchScope,
    input: { matchId: string },
  ): Promise<MatchDrawCommandResult> {
    return this.drawAction(scope, { ...input, matchVersion: 0 }, "expire");
  }
  /**
   * Nước đi vừa áp đóng đề nghị hòa đang chờ trong cùng giao dịch (YC5 mục 17): của đối thủ → Từ chối (người gửi chờ 5 nước của mình), của chính người đi → tự rút không phạt.
   */
  async closeDrawOffersOnMove(
    scope: MatchScope,
    input: { matchId: string },
  ): Promise<MatchView | null> {
    const result = await this.drawAction(
      scope,
      { ...input, matchVersion: 0 },
      "moved",
    );
    return result.applied ? result.match : null;
  }
  /**
   * Điều phối và thực thi các hành động cầu hòa với đầy đủ kiểm tra khóa, trạng thái đồng hồ và xung đột phiên bản.
   */
  private async drawAction(
    scope: MatchScope,
    input: { matchId: string; matchVersion: number; offerId?: string },
    action: "offer" | "withdraw" | "accept" | "decline" | "expire" | "moved",
  ): Promise<MatchDrawCommandResult> {
    if (action !== "offer" && action !== "expire" && action !== "moved")
      assertUuid(input.offerId!);
    const ctx = await this.context(scope, input);
    let { match } = ctx;
    const { row, room, side, history } = ctx;
    let at = await this.drawTime(scope.client);
    const result = async (
      applied: boolean,
      code?: string,
      message?: string,
    ): Promise<MatchDrawCommandResult> => ({
      applied,
      match,
      draw: await this.drawState(scope.client, match, at),
      ...(code ? { error: { code, message: message! } } : {}),
    });
    if (row.status !== "ACTIVE")
      return result(false, "MATCH_FINISHED", "Ván đã kết thúc.");
    if (room.current_match_id !== row.id || room.status !== "PLAYING")
      reject("MATCH_ID_MISMATCH", "Ván trong phòng đã thay đổi.");
    const ended = await this.expiredDisconnect(
      scope,
      row,
      match,
      history.at(-1)!,
    );
    if (ended) {
      match = ended;
      return result(false, "MATCH_FINISHED", "Ván đã kết thúc.");
    }
    at = await this.drawTime(scope.client);
    const unlimited = match.inactivity !== null;
    const checked = unlimited
      ? {
          clock: match.clock,
          expired: inactivityExpired(match.clock, at) ? match.turn : null,
        }
      : this.needClock().beforeAction(match.clock, match.turn, at);
    validClock(checked.clock);
    if (checked.expired) {
      if (checked.expired !== match.turn) corrupt();
      match = await this.end(
        scope.client,
        row,
        history.at(-1)!,
        unlimited
          ? { reason: "INACTIVITY", winner: opposite(checked.expired) }
          : { reason: "TIMEOUT", winner: opposite(checked.expired) },
        at,
        checked.clock,
        match.lastMove,
      );
      return unlimited
        ? result(
            false,
            "MATCH_INACTIVITY_EXPIRED",
            "Đã hết thời gian xác nhận.",
          )
        : result(false, "MATCH_TIME_EXPIRED", "Thời gian suy nghĩ đã hết.");
    }
    if (
      action !== "expire" &&
      action !== "moved" &&
      match.version !== input.matchVersion
    )
      return result(false, "MATCH_VERSION_CONFLICT", "Thế cờ đã thay đổi.");
    const event = async (offerId: string, sender: string, status: string) => {
      row.version = String(Number(row.version) + 1);
      await scope.client.query(
        "INSERT INTO public.match_events(match_id,version,type,payload,created_at) VALUES($1,$2,$3,$4,$5)",
        [
          row.id,
          row.version,
          status === "PENDING" ? "PROPOSAL_CREATED" : "PROPOSAL_RESOLVED",
          { kind: "DRAW", offerId, sender, status },
          at,
        ],
      );
      await this.update(scope.client, row);
      await scope.client.query(
        "UPDATE public.rooms SET room_version=room_version+1 WHERE id=$1",
        [row.room_id],
      );
      await this.outbox(scope.client, row.room_id, "MATCH_DRAW", {
        matchId: row.id,
        matchVersion: Number(row.version),
        offerId,
        sender,
        status,
      });
      match = this.view(row, history.at(-1)!, match.lastMove);
    };
    const due = (
      await scope.client.query<{
        id: string;
        sender: string;
        expires_at: Date;
      }>(
        "SELECT id,sender,expires_at FROM xiangqi_room.match_draw_offers WHERE match_id=$1 AND status='PENDING' AND expires_at<=$2 AND $3::boolean ORDER BY expires_at,id",
        // Nước đi không tự hết hạn đề nghị quá hạn: worker hạn xử lý (và tính nước người gửi từ mốc hạn).
        [row.id, at, action !== "moved"],
      )
    ).rows;
    for (const offer of due) {
      const count = await this.drawMoveCount(
        scope.client,
        row.id,
        offer.sender,
        offer.expires_at,
      );
      await scope.client.query(
        "UPDATE xiangqi_room.match_draw_offers SET status='EXPIRED',resolved_at=$2,cooldown_after_move_count=$3 WHERE id=$1",
        [offer.id, at, count],
      );
      await event(offer.id, offer.sender, "EXPIRED");
    }
    if (action === "expire") return result(due.length > 0);
    const sender = side === "red" ? "RED" : "BLACK";
    if (action === "moved") {
      const pending = (
        await scope.client.query<{ id: string; sender: string }>(
          "SELECT id,sender FROM xiangqi_room.match_draw_offers WHERE match_id=$1 AND status='PENDING' AND expires_at>$2 ORDER BY created_at,id",
          [row.id, at],
        )
      ).rows;
      for (const offer of pending) {
        const own = offer.sender === sender;
        const count = own
          ? null
          : await this.drawMoveCount(scope.client, row.id, offer.sender, at);
        const status = own ? "WITHDRAWN" : "DECLINED";
        await scope.client.query(
          "UPDATE xiangqi_room.match_draw_offers SET status=$2,resolved_at=$3,cooldown_after_move_count=$4 WHERE id=$1",
          [offer.id, status, at, count],
        );
        await event(offer.id, offer.sender, status);
      }
      return result(pending.length > 0);
    }
    if (action === "offer") {
      const state = await this.drawState(scope.client, match, at);
      if (state.offers.some((o) => o.sender === side))
        return result(
          false,
          "MATCH_DRAW_PENDING",
          "Bạn đã có đề nghị đang chờ.",
        );
      if (state.remainingMoves[side] > 0)
        return result(
          false,
          "MATCH_DRAW_COOLDOWN",
          "Chưa đủ số nước để xin hòa lại.",
        );
      const id = randomUUID();
      await scope.client.query(
        "INSERT INTO xiangqi_room.match_draw_offers(id,match_id,sender,status,created_at,expires_at) VALUES($1,$2,$3,'PENDING',$4,$4::timestamptz+interval '30 seconds')",
        [id, row.id, sender, at],
      );
      await event(id, sender, "PENDING");
      return result(true);
    }
    const offer = (
      await scope.client.query<{ id: string; sender: string; status: string }>(
        "SELECT id,sender,status FROM xiangqi_room.match_draw_offers WHERE id=$1 AND match_id=$2",
        [input.offerId, row.id],
      )
    ).rows[0];
    if (!offer || offer.status !== "PENDING")
      return result(false, "MATCH_DRAW_EXPIRED", "Đề nghị không còn hiệu lực.");
    if (
      action === "withdraw" ? offer.sender !== sender : offer.sender === sender
    )
      return result(
        false,
        action === "withdraw"
          ? "MATCH_DRAW_SENDER_REQUIRED"
          : "MATCH_DRAW_RECEIVER_REQUIRED",
        "Không có quyền phản hồi đề nghị này.",
      );
    const status =
      action === "withdraw"
        ? "WITHDRAWN"
        : action === "accept"
          ? "ACCEPTED"
          : "DECLINED";
    const count =
      status === "DECLINED"
        ? await this.drawMoveCount(scope.client, row.id, offer.sender, at)
        : null;
    await scope.client.query(
      "UPDATE xiangqi_room.match_draw_offers SET status=$2,resolved_at=$3,cooldown_after_move_count=$4 WHERE id=$1",
      [offer.id, status, at, count],
    );
    await event(offer.id, offer.sender, status);
    if (status === "ACCEPTED")
      match = await this.end(
        scope.client,
        row,
        history.at(-1)!,
        { reason: "DRAW_AGREEMENT", winner: null },
        at,
        checked.clock,
        match.lastMove,
      );
    return result(true);
  }
}
