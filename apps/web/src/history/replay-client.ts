import {
  parsePosition,
  playMove,
  serializePosition,
  type Side,
} from "@xiangqi/xiangqi-core";
import type { AuthorizedFetch } from "../rooms/room-client.js";
export interface ReplayRecord {
  id: string;
  mode: "CASUAL" | "AI";
  side: Side;
  positions: Array<{ fen: string; turn: Side }>;
  moves: Array<{ from: number; to: number; side: Side }>;
}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const invalidMessage = "Phản hồi xem lại không hợp lệ. Vui lòng tải lại.";
function object(value: unknown, keys: string[]): Record<string, unknown> {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.keys(value).length !== keys.length ||
    Object.keys(value).some((k) => !keys.includes(k))
  )
    throw Error();
  return value as Record<string, unknown>;
}
function side(value: unknown): value is Side {
  return value === "red" || value === "black";
}
export function parseReplayRecord(value: unknown): ReplayRecord {
  try {
    const record = object(value, ["id", "mode", "side", "positions", "moves"]);
    if (
      typeof record.id !== "string" ||
      !uuid.test(record.id) ||
      (record.mode !== "CASUAL" && record.mode !== "AI") ||
      !side(record.side) ||
      !Array.isArray(record.positions) ||
      !Array.isArray(record.moves) ||
      !record.positions.length ||
      record.positions.length !== record.moves.length + 1
    )
      throw Error();
    const positions = Array.from(record.positions, (value) => {
      const entry = object(value, ["fen", "turn"]);
      if (typeof entry.fen !== "string" || !side(entry.turn)) throw Error();
      const parsed = parsePosition(entry.fen);
      if (serializePosition(parsed) !== entry.fen || parsed.turn !== entry.turn)
        throw Error();
      return { fen: entry.fen, turn: entry.turn, parsed };
    });
    const moves = Array.from(record.moves, (value, i) => {
      const entry = object(value, ["from", "to", "side"]);
      if (
        typeof entry.from !== "number" ||
        typeof entry.to !== "number" ||
        !Number.isSafeInteger(entry.from) ||
        !Number.isSafeInteger(entry.to) ||
        entry.from < 0 ||
        entry.from > 89 ||
        entry.to < 0 ||
        entry.to > 89 ||
        !side(entry.side) ||
        entry.side !== positions[i]!.turn
      )
        throw Error();
      const move = { from: entry.from, to: entry.to, side: entry.side };
      if (
        serializePosition(playMove(positions[i]!.parsed, move)) !==
        positions[i + 1]!.fen
      )
        throw Error();
      return move;
    });
    return {
      id: record.id,
      mode: record.mode,
      side: record.side,
      positions: positions.map(({ fen, turn }) => ({ fen, turn })),
      moves,
    };
  } catch {
    throw Error(invalidMessage);
  }
}
export class ReplayRequestError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
  ) {
    super(
      status === 401
        ? "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại."
        : status === 403
          ? "Bạn không có quyền xem lại ván đấu này."
          : status === 404
            ? "Không tìm thấy ván đấu này."
            : status === 409
              ? "Dữ liệu ván đấu chưa thể xem lại."
              : code === "REPLAY_INPUT_INVALID"
                ? "Định danh ván đấu không hợp lệ."
                : "Chưa thể tải ván xem lại. Vui lòng thử lại.",
    );
  }
}
export function makeReplayClient(authorizedFetch: AuthorizedFetch) {
  return {
    async read(id: string): Promise<ReplayRecord> {
      if (typeof id !== "string" || !uuid.test(id))
        throw new ReplayRequestError(400, "REPLAY_INPUT_INVALID");
      const canonicalId = id.toLowerCase();
      let response: Response;
      try {
        response = await authorizedFetch(
          `/history/${encodeURIComponent(canonicalId)}`,
          { method: "GET", redirect: "error" },
        );
      } catch {
        throw new ReplayRequestError(503, "REPLAY_UNAVAILABLE");
      }
      if (!response.ok) {
        const codes: Record<number, string> = {
          401: "AUTH_REQUIRED",
          403: "HISTORY_FORBIDDEN",
          404: "REPLAY_NOT_FOUND",
          409: "REPLAY_CORRUPT",
          503: "REPLAY_UNAVAILABLE",
        };
        throw new ReplayRequestError(
          codes[response.status] ? response.status : 503,
          codes[response.status] ?? "REPLAY_UNAVAILABLE",
        );
      }
      try {
        const record = parseReplayRecord(await response.json());
        if (record.id.toLowerCase() !== canonicalId) throw Error();
        return record;
      } catch {
        throw new ReplayRequestError(503, "REPLAY_RESPONSE_INVALID");
      }
    },
  };
}
export type ReplayClient = ReturnType<typeof makeReplayClient>;
