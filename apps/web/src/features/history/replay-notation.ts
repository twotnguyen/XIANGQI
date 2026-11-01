import { parsePosition } from "@xiangqi/xiangqi-core";
import { parseReplayRecord, type ReplayRecord } from "./replay-client.js";
import { formatPositionMove } from "../../shared/board/move-notation.js";
/**
 * Chuyển đổi toàn bộ danh sách nước đi của ván cờ thành biên bản ký âm tiếng Việt chuẩn thi đấu (ví dụ: Pháo 2 bình 5, Mã 8 tiến 7).
 */
export function replayMoveLabels(record: ReplayRecord): string[] {
  try {
    // The shared strict parser binds each move to the before-position and verifies
    // its full legal core transition, including counters and declared turns.
    const checked = parseReplayRecord(record);
    return checked.moves.map((move, i) =>
      formatPositionMove(parsePosition(checked.positions[i]!.fen), move),
    );
  } catch {
    throw Error("Biên bản ván đấu không hợp lệ.");
  }
}
