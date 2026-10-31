import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { encodePosition } from "./position-codec.js";
import { MatchDrawStore } from "./match-store-draw.js";
import { assertUuid, reject } from "./match-store-core.js";
import { unlimitedClock } from "./inactivity.js";
import type {
  MatchScope,
  MatchUndoView,
  MatchUndoCommandResult,
  MatchView,
} from "./match.types.js";

export class MatchUndoStore extends MatchDrawStore {
  private async undoState(
    client: PoolClient,
    match: MatchView,
    at: Date,
  ): Promise<MatchUndoView> {
    const rows = (
      await client.query<{
        id: string;
        sender: "RED" | "BLACK";
        status: string;
        expires_at: Date;
        cooldown_after_move_count: number | null;
        side_moves: number;
        expired_baseline: number | null;
      }>(
        `SELECT o.id,o.sender,o.status,o.expires_at,o.cooldown_after_move_count,
       (SELECT count(*)::int FROM public.match_events e WHERE e.match_id=o.match_id AND e.type='MOVE' AND e.payload->>'side'=o.sender) side_moves,
       CASE WHEN o.status='PENDING' AND o.expires_at<=$2 THEN (SELECT count(*)::int FROM public.match_events e WHERE e.match_id=o.match_id AND e.type='MOVE' AND e.payload->>'side'=o.sender AND e.created_at<=o.expires_at) END expired_baseline
       FROM xiangqi_room.match_undo_offers o WHERE o.match_id=$1 ORDER BY o.created_at,o.id`,
        [match.id, at],
      )
    ).rows;
    const state: MatchUndoView = {
      offers: [],
      remainingMoves: { red: 0, black: 0 },
      used: { red: 0, black: 0 },
    };
    for (const offer of rows) {
      const side = offer.sender === "RED" ? "red" : "black";
      if (offer.status === "ACCEPTED") state.used[side]++;
      const baseline =
        offer.status === "PENDING" && offer.expires_at <= at
          ? offer.expired_baseline
          : offer.cooldown_after_move_count;
      if (baseline !== null)
        state.remainingMoves[side] = Math.max(
          state.remainingMoves[side],
          3 - (offer.side_moves - baseline),
        );
      if (
        match.status === "ACTIVE" &&
        offer.status === "PENDING" &&
        offer.expires_at > at
      )
        state.offers.push({
          id: offer.id,
          sender: side,
          expiresAt: offer.expires_at.toISOString(),
        });
    }
    return state;
  }
  async undoSnapshot(
    scope: MatchScope,
    input: { matchId: string },
  ): Promise<MatchUndoView> {
    const { match } = await this.context(scope, { ...input, matchVersion: 0 });
    return this.undoState(scope.client, match, new Date());
  }
  offerUndo(
    scope: MatchScope,
    input: { matchId: string; matchVersion: number },
  ): Promise<MatchUndoCommandResult> {
    return this.undoAction(scope, input, "offer");
  }
  withdrawUndo(
    scope: MatchScope,
    input: { matchId: string; matchVersion: number; offerId: string },
  ): Promise<MatchUndoCommandResult> {
    return this.undoAction(scope, input, "withdraw");
  }
  respondUndo(
    scope: MatchScope,
    input: {
      matchId: string;
      matchVersion: number;
      offerId: string;
      accept: boolean;
    },
  ): Promise<MatchUndoCommandResult> {
    if (typeof input.accept !== "boolean")
      reject("MATCH_INVALID_INPUT", "Phản hồi không hợp lệ.", 400);
    return this.undoAction(scope, input, input.accept ? "accept" : "decline");
  }
  expireUndoOffers(
    scope: MatchScope,
    input: { matchId: string },
  ): Promise<MatchUndoCommandResult> {
    return this.undoAction(scope, { ...input, matchVersion: 0 }, "expire");
  }
  async closeUndoOffersOnMove(
    scope: MatchScope,
    input: { matchId: string },
  ): Promise<MatchView | null> {
    const result = await this.undoAction(
      scope,
      { ...input, matchVersion: 0 },
      "moved",
    );
    return result.applied || result.match.status !== "ACTIVE"
      ? result.match
      : null;
  }
  private async undoAction(
    scope: MatchScope,
    input: { matchId: string; matchVersion: number; offerId?: string },
    action: "offer" | "withdraw" | "accept" | "decline" | "expire" | "moved",
  ): Promise<MatchUndoCommandResult> {
    if (action === "withdraw" || action === "accept" || action === "decline")
      assertUuid(input.offerId!);
    const {
      row,
      room,
      side,
      history,
      match: initial,
    } = await this.context(scope, input);
    let match = initial;
    const at = (
      await scope.client.query<{ at: Date }>(
        "SELECT date_trunc('milliseconds',clock_timestamp()) at",
      )
    ).rows[0]!.at;
    const result = async (
      applied: boolean,
      code?: string,
      message?: string,
    ): Promise<MatchUndoCommandResult> => ({
      applied,
      match,
      undo: await this.undoState(scope.client, match, at),
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
      at,
    );
    if (ended) {
      match = ended;
      return ended.outcome?.reason === "INACTIVITY"
        ? result(
            false,
            "MATCH_INACTIVITY_EXPIRED",
            "Đã hết thời gian xác nhận.",
          )
        : ended.outcome?.reason === "TIMEOUT"
          ? result(false, "MATCH_TIME_EXPIRED", "Thời gian suy nghĩ đã hết.")
          : result(false, "MATCH_FINISHED", "Ván đã kết thúc.");
    }
    if (
      action !== "expire" &&
      action !== "moved" &&
      match.version !== input.matchVersion
    )
      return result(false, "MATCH_VERSION_CONFLICT", "Thế cờ đã thay đổi.");
    const sender = side === "red" ? "RED" : "BLACK";
    const count = async (who: string, until: Date) =>
      (
        await scope.client.query<{ n: number }>(
          "SELECT count(*)::int n FROM public.match_events WHERE match_id=$1 AND type='MOVE' AND payload->>'side'=$2 AND created_at<=$3",
          [row.id, who, until],
        )
      ).rows[0]!.n;
    const event = async (id: string, who: string, status: string) => {
      row.version = String(Number(row.version) + 1);
      await scope.client.query(
        "INSERT INTO public.match_events(match_id,version,type,payload,created_at) VALUES($1,$2,$3,$4,$5)",
        [
          row.id,
          row.version,
          status === "PENDING" ? "PROPOSAL_CREATED" : "PROPOSAL_RESOLVED",
          { kind: "UNDO", offerId: id, sender: who, status },
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
        offerId: id,
        sender: who,
        status,
        kind: "UNDO",
      });
      this.historyCache.delete(row.id);
      const current = await this.history(scope.client, row);
      match = this.view(row, current.positions.at(-1)!, current.lastMove);
    };
    const due = (
      await scope.client.query<{
        id: string;
        sender: string;
        expires_at: Date;
      }>(
        "SELECT id,sender,expires_at FROM xiangqi_room.match_undo_offers WHERE match_id=$1 AND status='PENDING' AND expires_at<=$2 ORDER BY expires_at,id",
        [row.id, at],
      )
    ).rows;
    for (const offer of due) {
      await scope.client.query(
        "UPDATE xiangqi_room.match_undo_offers SET status='EXPIRED',resolved_at=$2,cooldown_after_move_count=$3 WHERE id=$1",
        [offer.id, at, await count(offer.sender, offer.expires_at)],
      );
      await event(offer.id, offer.sender, "EXPIRED");
    }
    if (action === "expire") return result(due.length > 0);
    if (action === "moved") {
      const offers = (
        await scope.client.query<{ id: string; sender: string }>(
          "SELECT id,sender FROM xiangqi_room.match_undo_offers WHERE match_id=$1 AND status='PENDING'",
          [row.id],
        )
      ).rows;
      for (const offer of offers) {
        await scope.client.query(
          "UPDATE xiangqi_room.match_undo_offers SET status='DECLINED',resolved_at=$2,cooldown_after_move_count=$3 WHERE id=$1",
          [offer.id, at, await count(offer.sender, at)],
        );
        await event(offer.id, offer.sender, "DECLINED");
      }
      return result(offers.length > 0 || due.length > 0);
    }
    if (action === "offer") {
      const state = await this.undoState(scope.client, match, at);
      const pendingDraw = await scope.client.query(
        "SELECT 1 FROM xiangqi_room.match_draw_offers WHERE match_id=$1 AND sender=$2 AND status='PENDING' AND expires_at>$3",
        [row.id, sender, at],
      );
      if (state.offers.some((o) => o.sender === side) || pendingDraw.rowCount)
        return result(
          false,
          "MATCH_UNDO_PENDING",
          "Bạn đã có đề nghị đang chờ.",
        );
      if (state.used[side] >= 3)
        return result(
          false,
          "MATCH_UNDO_LIMIT",
          "Bạn đã sử dụng hết 3 lượt xin đi lại trong ván này.",
        );
      if (state.remainingMoves[side] > 0)
        return result(
          false,
          "MATCH_UNDO_COOLDOWN",
          "Chưa đủ số nước để xin đi lại.",
        );
      if (
        !history.some((position, index) => index > 0 && position.turn !== side)
      )
        return result(false, "MATCH_UNDO_NO_MOVE", "Bạn chưa đi nước nào.");
      const id = randomUUID();
      await scope.client.query(
        "INSERT INTO xiangqi_room.match_undo_offers(id,match_id,sender,status,created_at,expires_at) VALUES($1,$2,$3,'PENDING',$4,$4::timestamptz+interval '30 seconds')",
        [id, row.id, sender, at],
      );
      await event(id, sender, "PENDING");
      return result(true);
    }
    const offer = (
      await scope.client.query<{ id: string; sender: string; status: string }>(
        "SELECT id,sender,status FROM xiangqi_room.match_undo_offers WHERE id=$1 AND match_id=$2",
        [input.offerId, row.id],
      )
    ).rows[0];
    if (!offer || offer.status !== "PENDING")
      return result(false, "MATCH_UNDO_EXPIRED", "Đề nghị không còn hiệu lực.");
    if (
      action === "withdraw" ? offer.sender !== sender : offer.sender === sender
    )
      return result(
        false,
        "MATCH_UNDO_FORBIDDEN",
        "Không có quyền phản hồi đề nghị này.",
      );
    const status =
      action === "withdraw"
        ? "WITHDRAWN"
        : action === "accept"
          ? "ACCEPTED"
          : "DECLINED";
    if (status === "ACCEPTED") {
      const checked = this.checkTime(match, at);
      if (checked.expired)
        return result(
          false,
          "MATCH_TIME_EXPIRED",
          "Thời gian suy nghĩ đã hết.",
        );
      const senderSide = offer.sender === "RED" ? "red" : "black";
      const plies = match.turn === senderSide ? 2 : 1;
      const target = history.length - 1 - plies;
      if (target < 0 || history[target]!.turn !== senderSide)
        return result(
          false,
          "MATCH_UNDO_NO_MOVE",
          "Không còn nước đi hợp lệ để lùi.",
        );
      row.position = encodePosition(history[target]!);
      row.active_move_ids = (row.active_move_ids as string[]).slice(0, target);
      row.ply = target;
      row.clock = match.unlimited
        ? unlimitedClock(at)
        : this.needClock().afterMove(checked.clock, senderSide, at);
    }
    await scope.client.query(
      "UPDATE xiangqi_room.match_undo_offers SET status=$2,resolved_at=$3,cooldown_after_move_count=$4 WHERE id=$1",
      [
        offer.id,
        status,
        at,
        status === "DECLINED" ? await count(offer.sender, at) : null,
      ],
    );
    await event(offer.id, offer.sender, status);
    return result(true);
  }
}
