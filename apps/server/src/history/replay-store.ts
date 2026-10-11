import {
  ending,
  initialPosition,
  serializePosition,
  type Side,
} from "@xiangqi/xiangqi-core";
import { RoomError, type RoomScope } from "../room/contracts.js";
import { replayHistory, type HistoryMove } from "../match/history.js";
import { decodeMove, record, uuid } from "../match/position-codec.js";
export interface ReplayRecord {
  id: string;
  mode: "CASUAL" | "AI";
  side: Side;
  positions: { fen: string; turn: Side }[];
  moves: { from: number; to: number; side: Side }[];
}
type Row = {
  id: string;
  mode: string;
  status: string;
  room_id: string | null;
  red_user_id: string | null;
  black_user_id: string | null;
  ai_side: string | null;
  ai_level: string | null;
  rule_set_version: string;
  position: unknown;
  version: string;
  ply: number;
  active_move_ids: unknown;
  outcome: unknown;
  ended_at: Date | null;
};
function fail(code: string, status: number): never {
  throw new RoomError(
    code,
    status === 404
      ? "Không tìm thấy ván để xem lại"
      : "Không thể xem lại ván đấu",
    status,
  );
}
function corrupt(): never {
  return fail("REPLAY_CORRUPT", 409);
}
/** Read-only projection. Caller supplies freshly authenticated, actor-locked same-client scope. */
export class ReplayStore {
  async read(scope: RoomScope, id: string): Promise<ReplayRecord> {
    if (typeof id !== "string" || !uuid.test(id))
      fail("REPLAY_INPUT_INVALID", 400);
    if (
      scope.actor.kind !== "member" ||
      !uuid.test(scope.actor.userId) ||
      !scope.lockedActorIds.has(scope.actor.userId)
    )
      fail("REPLAY_FORBIDDEN", 403);
    if (
      !(
        await scope.client.query(
          "SELECT 1 FROM xiangqi_auth.principals WHERE id=$1 AND kind='member' AND auth_user_id=id",
          [scope.actor.userId],
        )
      ).rowCount
    )
      fail("REPLAY_FORBIDDEN", 403);
    const row = (
      await scope.client.query<Row>(
        "SELECT id,mode,status,room_id,red_user_id,black_user_id,ai_side,ai_level,rule_set_version,position,version,ply,active_move_ids,outcome,ended_at FROM public.matches WHERE id=$1 AND status IN('FINISHED','INTERRUPTED') AND (red_user_id=$2 OR black_user_id=$2)",
        [id, scope.actor.userId],
      )
    ).rows[0];
    if (!row) fail("REPLAY_NOT_FOUND", 404);
    const events = (
      await scope.client.query<{
        version: string;
        type: string;
        payload: unknown;
      }>(
        "SELECT version,type,payload FROM public.match_events WHERE match_id=$1 AND type IN('START','RESULT')",
        [row.id],
      )
    ).rows;
    const start = events.find((e) => e.type === "START"),
      result = events.find((e) => e.type === "RESULT"),
      side: Side = row.red_user_id === scope.actor.userId ? "red" : "black";
    if (
      events.length !== 2 ||
      !start ||
      Number(start.version) !== 0 ||
      !result ||
      Number(result.version) !== Number(row.version) ||
      !Number.isSafeInteger(Number(row.version)) ||
      Number(row.version) < 1 ||
      !record(start.payload) ||
      start.payload.encoding !== "xiangqi-core-v1" ||
      row.rule_set_version !== "xiangqi-simple-v1" ||
      start.payload.ruleSetVersion !== row.rule_set_version ||
      typeof start.payload.startToken !== "string" ||
      !uuid.test(start.payload.startToken)
    )
      corrupt();
    const p = start.payload;
    if (row.mode === "ONLINE") {
      if (
        !row.room_id ||
        !row.red_user_id ||
        !row.black_user_id ||
        p.roomId !== row.room_id ||
        p.redId !== row.red_user_id ||
        p.blackId !== row.black_user_id ||
        (p.mode !== undefined && p.mode !== "ONLINE")
      )
        corrupt();
    } else if (row.mode === "AI") {
      if (
        p.mode !== "AI" ||
        p.ownerId !== scope.actor.userId ||
        p.startToken !== row.id ||
        ![side, "random"].includes(p.requestedSide as string) ||
        row.ai_side !== (side === "red" ? "BLACK" : "RED") ||
        p.aiSide !== row.ai_side ||
        !["EASY", "MEDIUM", "HARD"].includes(row.ai_level ?? "") ||
        p.level !== row.ai_level?.toLowerCase() ||
        (side === "red" ? row.black_user_id : row.red_user_id) !== null
      )
        corrupt();
    } else corrupt();
    if (
      !record(row.outcome) ||
      !record(result.payload) ||
      !record(result.payload.outcome) ||
      result.payload.outcome.reason !== row.outcome.reason ||
      result.payload.outcome.winner !== row.outcome.winner ||
      !row.ended_at ||
      result.payload.endedAt !== row.ended_at.toISOString()
    )
      corrupt();
    if (
      !Array.isArray(row.active_move_ids) ||
      row.active_move_ids.some(
        (moveId) => typeof moveId !== "string" || !uuid.test(moveId),
      )
    )
      corrupt();
    const moves = (
      await scope.client.query<HistoryMove>(
        "SELECT m.id,m.parent_move_id,m.event_version,m.side,m.move,e.type event_type,e.payload FROM public.match_moves m JOIN public.match_events e ON e.match_id=m.match_id AND e.version=m.event_version WHERE m.match_id=$1 AND m.id=ANY($2::uuid[])",
        [row.id, row.active_move_ids],
      )
    ).rows;
    try {
      const history = replayHistory({ ...row, start: p, moves }),
        core = ending(history);
      if (
        serializePosition(history[0]!) !== serializePosition(initialPosition())
      )
        corrupt();
      if (moves.some((m) => Number(m.event_version) >= Number(row.version)))
        corrupt();
      if (
        [
          "CHECKMATE",
          "STALEMATE",
          "PERPETUAL_CHECK",
          "DRAW_REPETITION",
          "DRAW_NO_CAPTURE",
        ].includes(String(row.outcome.reason)) &&
        (!core ||
          core.reason !== row.outcome.reason ||
          (core.winner === null ? null : core.winner.toUpperCase()) !==
            row.outcome.winner)
      )
        corrupt();
      return {
        id: row.id,
        mode: row.mode === "AI" ? "AI" : "CASUAL",
        side,
        positions: history.map((position) => ({
          fen: serializePosition(position),
          turn: position.turn,
        })),
        moves: (row.active_move_ids as string[]).map((moveId) => {
          const move = moves.find((m) => m.id === moveId)!;
          return {
            ...decodeMove(move.move),
            side: move.side === "RED" ? "red" : "black",
          };
        }),
      };
    } catch {
      return corrupt();
    }
  }
}
