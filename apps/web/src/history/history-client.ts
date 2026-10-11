import type { AuthorizedFetch } from "../rooms/room-client.js";
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
    kind: "WIN" | "LOSS" | "DRAW" | "INTERRUPTED";
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
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function invalid(): never {
  throw Error("Phản hồi lịch sử không hợp lệ. Vui lòng tải lại.");
}
function object(v: unknown, keys: string[]): Record<string, unknown> {
  if (
    !v ||
    typeof v !== "object" ||
    Array.isArray(v) ||
    Object.keys(v).length !== keys.length ||
    Object.keys(v).some((k) => !keys.includes(k))
  )
    invalid();
  return v as Record<string, unknown>;
}
function isId(v: unknown): v is string {
  return typeof v === "string" && uuid.test(v);
}
function timestamp(v: unknown): v is string {
  if (
    typeof v !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{6}Z$/.test(v) ||
    v.startsWith("0000-")
  )
    return false;
  const ms = Date.parse(v);
  return (
    Number.isFinite(ms) &&
    new Date(ms).toISOString().slice(0, 23) === v.slice(0, 23)
  );
}
function cursor(v: unknown): HistoryCursor {
  const r = object(v, ["endedAt", "matchId"]);
  if (!timestamp(r.endedAt) || !isId(r.matchId)) invalid();
  return { endedAt: r.endedAt, matchId: r.matchId };
}
const decisive = [
  "CHECKMATE",
  "STALEMATE",
  "TIMEOUT",
  "RESIGN",
  "DISCONNECT",
  "PERPETUAL_CHECK",
];
const draws = [
  "AGREED_DRAW",
  "REPETITION",
  "DRAW_REPETITION",
  "DRAW_NO_CAPTURE",
  "DRAW_AGREEMENT",
  "PERPETUAL_CHECK",
];
const interruptions = ["BOTH_OFFLINE", "SERVER_RESTART", "AI_UNAVAILABLE"];
function item(v: unknown): HistoryItem {
  const preliminary = v as Record<string, unknown>;
  const r = object(v, [
      "id",
      "type",
      "typeLabel",
      "side",
      "opponent",
      "result",
      "eloDelta",
      "startedAt",
      "endedAt",
      "replayPath",
      ...(preliminary?.type === "AI" ? ["aiLevel"] : []),
    ]),
    o = object(r.opponent, ["displayName", "isGuest"]),
    result = object(r.result, ["kind", "reason", "label", "countsForWdl"]);
  if (
    !isId(r.id) ||
    !["CASUAL", "AI"].includes(r.type as string) ||
    !["red", "black"].includes(r.side as string) ||
    typeof o.displayName !== "string" ||
    !o.displayName.trim() ||
    typeof o.isGuest !== "boolean" ||
    r.eloDelta !== null ||
    !timestamp(r.startedAt) ||
    !timestamp(r.endedAt) ||
    r.startedAt > r.endedAt ||
    r.replayPath !== `/history/${r.id}`
  )
    invalid();
  const labels = { EASY: "Dễ", MEDIUM: "Trung bình", HARD: "Khó" };
  if (r.type === "AI") {
    if (
      !["EASY", "MEDIUM", "HARD"].includes(r.aiLevel as string) ||
      r.typeLabel !==
        "Đấu với Máy - " + labels[r.aiLevel as keyof typeof labels] ||
      o.displayName !== "Máy" ||
      o.isGuest !== false
    )
      invalid();
  } else if (r.typeLabel !== "Đánh Thường") invalid();
  const valid =
    ((result.kind === "WIN" || result.kind === "LOSS") &&
      decisive.includes(result.reason as string) &&
      result.countsForWdl === true &&
      result.label === (result.kind === "WIN" ? "Thắng" : "Thua")) ||
    (result.kind === "DRAW" &&
      draws.includes(result.reason as string) &&
      result.countsForWdl === true &&
      result.label === "Hòa") ||
    (result.kind === "INTERRUPTED" &&
      interruptions.includes(result.reason as string) &&
      result.countsForWdl === false &&
      result.label === "Bị gián đoạn");
  if (!valid) invalid();
  return r as unknown as HistoryItem;
}
export function parseHistoryPage(v: unknown, limit = 50): HistoryPage {
  const r = object(v, ["items", "nextCursor"]);
  if (!Array.isArray(r.items) || r.items.length > limit) invalid();
  const items = r.items.map(item),
    ids = new Set<string>();
  for (let i = 0; i < items.length; i++) {
    const current = items[i]!,
      previous = items[i - 1];
    if (
      ids.has(current.id.toLowerCase()) ||
      (previous &&
        (current.endedAt > previous.endedAt ||
          (current.endedAt === previous.endedAt &&
            current.id.toLowerCase() >= previous.id.toLowerCase())))
    )
      invalid();
    ids.add(current.id.toLowerCase());
  }
  const next = r.nextCursor === null ? null : cursor(r.nextCursor),
    last = items.at(-1);
  if (
    next &&
    (!last ||
      next.endedAt !== last.endedAt ||
      next.matchId.toLowerCase() !== last.id.toLowerCase())
  )
    invalid();
  return { items, nextCursor: next };
}
const codes = [
  "HISTORY_FORBIDDEN",
  "HISTORY_INPUT_INVALID",
  "HISTORY_CORRUPT",
  "HISTORY_RANKED_UNAVAILABLE",
  "AUTH_REQUIRED",
];
export class HistoryRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
  ) {
    super(
      status === 401
        ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        : code === "HISTORY_RANKED_UNAVAILABLE"
          ? "Lịch sử Đánh Hạng chưa sẵn sàng."
          : "Chưa thể tải lịch sử. Vui lòng thử lại.",
    );
  }
}
export function makeHistoryClient(authorizedFetch: AuthorizedFetch) {
  return {
    async list(input: HistoryInput = {}): Promise<HistoryPage> {
      let filter: HistoryInput["filter"],
        limit: number,
        after: HistoryCursor | undefined;
      try {
        if (
          !input ||
          typeof input !== "object" ||
          Array.isArray(input) ||
          Object.keys(input).some(
            (k) => !["filter", "limit", "cursor"].includes(k),
          )
        )
          invalid();
        filter = input.filter ?? "ALL";
        limit = input.limit ?? 20;
        if (
          !["ALL", "RANKED", "CASUAL", "AI"].includes(filter) ||
          !Number.isSafeInteger(limit) ||
          limit < 1 ||
          limit > 50
        )
          invalid();
        after = input.cursor === undefined ? undefined : cursor(input.cursor);
      } catch {
        throw Error("Bộ lọc lịch sử không hợp lệ.");
      }
      const path =
        `/history?filter=${filter}&limit=${limit}` +
        (after ? `&cursor=${encodeURIComponent(JSON.stringify(after))}` : "");
      let response: Response;
      try {
        response = await authorizedFetch(path, {
          method: "GET",
          redirect: "error",
        });
      } catch {
        throw new HistoryRequestError(503, "HISTORY_UNAVAILABLE");
      }
      if (!response.ok) {
        let code = "HISTORY_UNAVAILABLE";
        try {
          const v = (await response.json()) as Record<string, unknown>;
          if (v && codes.includes(v.code as string)) code = v.code as string;
        } catch {
          /* Never reflect raw HTTP bodies. */
        }
        throw new HistoryRequestError(response.status, code);
      }
      let value: unknown;
      try {
        value = await response.json();
      } catch {
        return invalid();
      }
      return parseHistoryPage(value, limit);
    },
  };
}
export type HistoryClient = ReturnType<typeof makeHistoryClient>;
