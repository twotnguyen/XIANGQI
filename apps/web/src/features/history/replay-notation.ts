import {
  parsePosition,
  type PieceType,
  type Position,
  type Side,
} from "@xiangqi/xiangqi-core";
import { parseReplayRecord, type ReplayRecord } from "./replay-client.js";
const names: Record<PieceType, string> = {
  king: "Tướng",
  advisor: "Sĩ",
  elephant: "Tượng",
  horse: "Mã",
  rook: "Xe",
  cannon: "Pháo",
  pawn: "Tốt",
};
function file(x: number, side: Side) {
  return side === "red" ? 9 - x : x + 1;
}
/** WXF 2018 Art7.1/7.5, visually checked printed pages15–17:
 * https://www.wxf-xiangqi.org/images/wxf-rules/2018_World_XiangQi_Rules_English2018.pdf
 * Vietnamese piece/action names translate the traditional notation. Art7.5
 * specifies front/rear for two and front-to-rear ordinal+file for three pawns.
 * Four/five-pawn ordinals and extra file context for multiple tandem-pawn files
 * are readable Vietnamese display clarifications, not additional WXF rules.
 */
function formatPositionMove(
  position: Position,
  move: ReplayRecord["moves"][number],
) {
  const piece = position.board[move.from]!;
  const x = move.from % 9,
    y = Math.floor(move.from / 9),
    toX = move.to % 9,
    toY = Math.floor(move.to / 9);
  const tandem = position.board
    .flatMap((other, square) =>
      other?.type === piece.type &&
      other.side === piece.side &&
      square % 9 === x
        ? [square]
        : [],
    )
    .sort((a, b) => (piece.side === "red" ? a - b : b - a));
  let descriptor = String(file(x, piece.side));
  if (tandem.length === 2) {
    descriptor = tandem[0] === move.from ? "trước" : "sau";
    if (piece.type === "pawn") {
      const counts = new Map<number, number>();
      for (const [square, other] of position.board.entries())
        if (other?.type === "pawn" && other.side === piece.side)
          counts.set(square % 9, (counts.get(square % 9) ?? 0) + 1);
      if ([...counts.values()].filter((n) => n >= 2).length > 1)
        descriptor += ` (cột ${file(x, piece.side)})`;
    }
  } else if (tandem.length > 2) {
    if (piece.type !== "pawn" || tandem.length > 5) throw Error();
    descriptor = `thứ ${tandem.indexOf(move.from) + 1} (cột ${file(x, piece.side)})`;
  }
  const action =
    y === toY
      ? "bình"
      : (piece.side === "red" ? toY < y : toY > y)
        ? "tiến"
        : "thoái";
  const destination =
    y === toY || ["horse", "advisor", "elephant"].includes(piece.type)
      ? file(toX, piece.side)
      : Math.abs(toY - y);
  return `${names[piece.type]} ${descriptor} ${action} ${destination}`;
}
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
