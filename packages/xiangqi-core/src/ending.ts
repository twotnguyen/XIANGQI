import type { Position, Side } from "./position.js";
import { serializePosition } from "./position.js";
import { hasLegalMove, isInCheck } from "./moves.js";

export interface MatchEnding {
  reason:
    | "CHECKMATE"
    | "STALEMATE"
    | "PERPETUAL_CHECK"
    | "DRAW_REPETITION"
    | "DRAW_NO_CAPTURE";
  winner: Side | null;
}

function opposite(side: Side): Side {
  return side === "red" ? "black" : "red";
}

function identity(position: Position): string {
  return serializePosition(position).split(" ").slice(0, 2).join(" ");
}

/**
 * Xác định kết quả kết thúc ván cờ dựa trên lịch sử toàn bộ các thế cờ từ đầu ván:
 * - CHECKMATE (Chiếu hết): không còn nước đi hợp lệ và đang bị chiếu -> đối thủ thắng.
 * - STALEMATE (Bức tử/Hết nước đi): không còn nước đi hợp lệ và không bị chiếu -> bên hết nước thua theo luật cờ tướng.
 * - PERPETUAL_CHECK (Chiếu liên tục): lặp lại thế cờ 3 lần và liên tục chiếu -> bên chiếu liên tục bị xử thua.
 * - DRAW_REPETITION (Lặp thế cờ 3 lần): lặp lại thế cờ 3 lần thông thường -> Hòa.
 * - DRAW_NO_CAPTURE (120 nửa nước không ăn quân): 60 nước đầy đủ không ăn quân -> Hòa.
 * Trả về `null` nếu ván cờ vẫn chưa kết thúc.
 */
export function ending(history: readonly Position[]): MatchEnding | null {
  const current = history.at(-1);
  if (!current) return null;

  if (!hasLegalMove(current)) {
    return {
      reason: isInCheck(current, current.turn) ? "CHECKMATE" : "STALEMATE",
      winner: opposite(current.turn),
    };
  }

  const key = identity(current);
  const occurrences: number[] = [];
  for (let index = 0; index < history.length; index++) {
    if (identity(history[index]!) === key) occurrences.push(index);
  }
  if (occurrences.length >= 3) {
    const checking = { red: true, black: true };
    const moved = { red: false, black: false };
    for (let index = occurrences[0]! + 1; index <= occurrences[2]!; index++) {
      const before = history[index - 1]!;
      const after = history[index]!;
      moved[before.turn] = true;
      if (!isInCheck(after, after.turn)) checking[before.turn] = false;
    }
    const redChecks = moved.red && checking.red;
    const blackChecks = moved.black && checking.black;
    if (redChecks || blackChecks) {
      return {
        reason: "PERPETUAL_CHECK",
        winner: redChecks && blackChecks ? null : redChecks ? "black" : "red",
      };
    }
    return { reason: "DRAW_REPETITION", winner: null };
  }

  return current.halfmove >= 120
    ? { reason: "DRAW_NO_CAPTURE", winner: null }
    : null;
}
