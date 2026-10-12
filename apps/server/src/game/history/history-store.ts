import { RoomError, type RoomScope } from "../room/contracts.js";
import { record, uuid } from "../match/position-codec.js";
export interface HistoryCursor {
  endedAt: string;
  matchId: string;
}
export interface HistoryInput {
  filter?: "ALL" | "RANKED" | "CASUAL" | "AI";
  limit?: number;
  cursor?: HistoryCursor;
}
export interface HistoryItem {
  id: string;
  type: "CASUAL" | "AI";
  typeLabel: string;
  side: "red" | "black";
  opponent: { displayName: string; isGuest: boolean };
  aiLevel?: "EASY" | "MEDIUM" | "HARD";
  result: {
    kind: "WIN" | "LOSS" | "DRAW" | "INTERRUPTED" | "ABANDONED";
    reason: string;
    label: string;
    countsForWdl: boolean;
  };
  eloDelta: null;
  startedAt: string;
  endedAt: string;
  replayPath: string;
}
export interface HistoryPage {
  items: HistoryItem[];
  nextCursor: HistoryCursor | null;
}
type Row = {
  id: string;
  mode: string;
  status: string;
  room_id: string | null;
  red_user_id: string | null;
  black_user_id: string | null;
  ai_level: "EASY" | "MEDIUM" | "HARD" | null;
  ai_side: string | null;
  rule_set_version: string;
  outcome: unknown;
  start: unknown;
  started_at: string;
  ended_at: string;
  opponent_kind: string | null;
  opponent_name: string | null;
};
function fail(code: string, status: number): never {
  throw new RoomError(
    code,
    status === 400
      ? "Bộ lọc lịch sử không hợp lệ"
      : "Chưa thể đọc lịch sử ván đấu",
    status,
  );
}
function validCursor(cursor: HistoryCursor) {
  return (
    typeof cursor?.endedAt === "string" &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/.test(cursor.endedAt) &&
    !cursor.endedAt.startsWith("0000-") &&
    new Date(cursor.endedAt).toISOString().slice(0, 23) ===
      cursor.endedAt.slice(0, 23) &&
    typeof cursor.matchId === "string" &&
    uuid.test(cursor.matchId)
  );
}
/** Internal read port: caller supplies fresh member proof and actor-locked transaction.
 * Avatar and Elo provenance do not exist yet; avatars are omitted, Elo stays null.
 * AI_UNAVAILABLE denotes interruption, not the future distinct 30-minute abandonment. */
export class HistoryStore {
  private async member(scope: RoomScope) {
    if (
      scope.actor.kind !== "member" ||
      !uuid.test(scope.actor.userId) ||
      !scope.lockedActorIds.has(scope.actor.userId)
    )
      fail("HISTORY_FORBIDDEN", 403);
    const member = await scope.client.query(
      "SELECT 1 FROM xiangqi_auth.principals WHERE id=$1 AND kind='member' AND auth_user_id=id",
      [scope.actor.userId],
    );
    if (!member.rowCount) fail("HISTORY_FORBIDDEN", 403);
  }
  async list(scope: RoomScope, input: HistoryInput = {}): Promise<HistoryPage> {
    await this.member(scope);
    const filter = input.filter ?? "ALL",
      limit = input.limit ?? 20;
    let cursorValid = true;
    try {
      if (input.cursor !== undefined) cursorValid = validCursor(input.cursor);
    } catch {
      cursorValid = false;
    }
    if (
      !["ALL", "RANKED", "CASUAL", "AI"].includes(filter) ||
      !Number.isSafeInteger(limit) ||
      limit < 1 ||
      limit > 50 ||
      !cursorValid
    )
      fail("HISTORY_INPUT_INVALID", 400);
    if (filter === "RANKED") fail("HISTORY_RANKED_UNAVAILABLE", 503);
    const rows = (
      await scope.client.query<Row>(
        `
      SELECT m.id,m.mode,m.status,m.room_id,m.red_user_id,m.black_user_id,m.ai_level,m.ai_side,m.rule_set_version,m.outcome,e.payload AS start,
        to_char(m.created_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS started_at,
        to_char(m.ended_at AT TIME ZONE 'UTC','YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS ended_at,
        n.kind AS opponent_kind,
        CASE WHEN n.kind='guest' THEN CASE WHEN g.ended_at IS NULL AND g.expires_at>clock_timestamp() THEN p.display_name ELSE NULL END ELSE p.display_name END AS opponent_name
      FROM public.matches m
      LEFT JOIN public.match_events e ON e.match_id=m.id AND e.version=0 AND e.type='START'
      LEFT JOIN xiangqi_auth.principals n ON n.id=CASE WHEN m.red_user_id=$1 THEN m.black_user_id ELSE m.red_user_id END
      LEFT JOIN public.profiles p ON p.user_id=n.id
      LEFT JOIN xiangqi_auth.guest_sessions g ON g.guest_id=n.id
      WHERE (m.red_user_id=$1 OR m.black_user_id=$1) AND m.status IN('FINISHED','INTERRUPTED')
        AND ($2='ALL' OR m.mode=CASE WHEN $2='CASUAL' THEN 'ONLINE' ELSE 'AI' END)
        AND ($3::timestamptz IS NULL OR (m.ended_at,m.id)<($3::timestamptz,$4::uuid))
      ORDER BY m.ended_at DESC,m.id DESC LIMIT $5`,
        [
          scope.actor.userId,
          filter,
          input.cursor?.endedAt ?? null,
          input.cursor?.matchId ?? null,
          limit + 1,
        ],
      )
    ).rows;
    const items = rows
      .slice(0, limit)
      .map((row) => this.item(row, scope.actor.userId));
    const last = items.at(-1);
    return {
      items,
      nextCursor:
        rows.length > limit && last
          ? { endedAt: last.endedAt, matchId: last.id }
          : null,
    };
  }
  private item(row: Row, ownerId: string): HistoryItem {
    const start = row.start,
      side = row.red_user_id === ownerId ? "red" : "black";
    if (
      !record(start) ||
      start.encoding !== "xiangqi-core-v1" ||
      row.rule_set_version !== "xiangqi-simple-v1" ||
      start.ruleSetVersion !== row.rule_set_version ||
      typeof start.startToken !== "string" ||
      !uuid.test(start.startToken) ||
      !record(row.outcome)
    )
      fail("HISTORY_CORRUPT", 409);
    if (row.mode === "ONLINE") {
      if (
        start.roomId !== row.room_id ||
        start.redId !== row.red_user_id ||
        start.blackId !== row.black_user_id
      )
        fail("HISTORY_CORRUPT", 409);
    } else if (row.mode === "AI") {
      if (
        start.mode !== "AI" ||
        start.ownerId !== ownerId ||
        start.startToken !== row.id ||
        start.aiSide !== row.ai_side ||
        typeof start.requestedSide !== "string" ||
        ![side, "random"].includes(start.requestedSide) ||
        !row.ai_level ||
        !["EASY", "MEDIUM", "HARD"].includes(row.ai_level) ||
        start.level !== row.ai_level.toLowerCase()
      )
        fail("HISTORY_CORRUPT", 409);
    } else fail("HISTORY_CORRUPT", 409);
    const reason = row.outcome.reason,
      winner = row.outcome.winner;
    if (typeof reason !== "string") fail("HISTORY_CORRUPT", 409);
    let result: HistoryItem["result"];
    if (row.status === "INTERRUPTED") {
      if (
        winner !== null ||
        !["BOTH_OFFLINE", "SERVER_RESTART", "AI_UNAVAILABLE"].includes(reason)
      )
        fail("HISTORY_CORRUPT", 409);
      result = {
        kind: "INTERRUPTED",
        reason,
        label: "Bị gián đoạn",
        countsForWdl: false,
      };
    } else if (
      winner === null &&
      [
        "AGREED_DRAW",
        "REPETITION",
        "DRAW_REPETITION",
        "DRAW_NO_CAPTURE",
        "DRAW_AGREEMENT",
        "PERPETUAL_CHECK",
      ].includes(reason)
    )
      result = { kind: "DRAW", reason, label: "Hòa", countsForWdl: true };
    else {
      if (
        (winner !== "RED" && winner !== "BLACK") ||
        ![
          "CHECKMATE",
          "STALEMATE",
          "TIMEOUT",
          "RESIGN",
          "DISCONNECT",
          "PERPETUAL_CHECK",
        ].includes(reason)
      )
        fail("HISTORY_CORRUPT", 409);
      const won = winner === side.toUpperCase();
      result = {
        kind: won ? "WIN" : "LOSS",
        reason,
        label: won ? "Thắng" : "Thua",
        countsForWdl: true,
      };
    }
    const difficulty = { EASY: "Dễ", MEDIUM: "Trung bình", HARD: "Khó" };
    return {
      id: row.id,
      type: row.mode === "AI" ? "AI" : "CASUAL",
      typeLabel:
        row.mode === "AI"
          ? "Đấu với Máy - " + difficulty[row.ai_level!]
          : "Đánh Thường",
      side,
      opponent:
        row.mode === "AI"
          ? { displayName: "Máy", isGuest: false }
          : {
              displayName:
                row.opponent_kind === "guest"
                  ? row.opponent_name
                    ? row.opponent_name + " (Khách)"
                    : "Khách"
                  : (row.opponent_name ?? "Người chơi"),
              isGuest: row.opponent_kind === "guest",
            },
      ...(row.mode === "AI" ? { aiLevel: row.ai_level! } : {}),
      result,
      eloDelta: null,
      startedAt: row.started_at,
      endedAt: row.ended_at,
      replayPath: "/history/" + row.id,
    };
  }
  async rankedSummary(scope: RoomScope): Promise<never> {
    await this.member(scope);
    fail("HISTORY_RANKED_UNAVAILABLE", 503);
  }
}
