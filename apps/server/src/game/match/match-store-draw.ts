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
} from "./match-store-core.js";
import { MatchStoreCore } from "./match-store-core.js";

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
    at: Date,
  ): Promise<MatchDrawView> {
    const offers = (
      await client.query<{
        id: string;
        sender: "RED" | "BLACK";
        status: string;
        expires_at: Date;
        cooldown_after_move_count: number | null;
      }>(
        "SELECT id,sender,status,expires_at,cooldown_after_move_count FROM xiangqi_room.match_draw_offers WHERE match_id=$1 ORDER BY created_at,id",
        [match.id],
      )
    ).rows;
    const counts = (
      await client.query<{ side: "RED" | "BLACK"; n: number }>(
        "SELECT payload->>'side' side,count(*)::int n FROM public.match_events WHERE match_id=$1 AND type='MOVE' GROUP BY payload->>'side'",
        [match.id],
      )
    ).rows;
    const remainingMoves = { red: 0, black: 0 };
    for (const offer of offers) {
      let baseline = offer.cooldown_after_move_count;
      if (offer.status === "PENDING" && offer.expires_at <= at)
        baseline = await this.drawMoveCount(
          client,
          match.id,
          offer.sender,
          offer.expires_at,
        );
      if (baseline !== null) {
        const side = offer.sender === "RED" ? "red" : "black";
        remainingMoves[side] = Math.max(
          remainingMoves[side],
          5 -
            ((counts.find((c) => c.side === offer.sender)?.n ?? 0) - baseline),
          0,
        );
      }
    }
    return {
      offers:
        match.status === "ACTIVE"
          ? offers
              .filter((o) => o.status === "PENDING" && o.expires_at > at)
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
    return this.drawState(
      scope.client,
      match,
      await this.drawTime(scope.client),
    );
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
   * Điều phối và thực thi các hành động cầu hòa với đầy đủ kiểm tra khóa, trạng thái đồng hồ và xung đột phiên bản.
   */
  private async drawAction(
    scope: MatchScope,
    input: { matchId: string; matchVersion: number; offerId?: string },
    action: "offer" | "withdraw" | "accept" | "decline" | "expire",
  ): Promise<MatchDrawCommandResult> {
    if (action !== "offer" && action !== "expire") assertUuid(input.offerId!);
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
    const checked = this.needClock().beforeAction(match.clock, match.turn, at);
    validClock(checked.clock);
    if (checked.expired) {
      if (checked.expired !== match.turn) corrupt();
      match = await this.end(
        scope.client,
        row,
        history.at(-1)!,
        { reason: "TIMEOUT", winner: opposite(checked.expired) },
        at,
        checked.clock,
        match.lastMove,
      );
      return result(false, "MATCH_TIME_EXPIRED", "Thời gian suy nghĩ đã hết.");
    }
    if (action !== "expire" && match.version !== input.matchVersion)
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
        "SELECT id,sender,expires_at FROM xiangqi_room.match_draw_offers WHERE match_id=$1 AND status='PENDING' AND expires_at<=$2 ORDER BY expires_at,id",
        [row.id, at],
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
