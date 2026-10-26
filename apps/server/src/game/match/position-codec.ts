import {
  parsePosition,
  serializePosition,
  type Piece,
  type Position,
} from "@xiangqi/xiangqi-core";
export const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export function record(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}
export function corrupt(): never {
  throw new Error("MATCH_HISTORY_CORRUPT");
}
/**
 * Giải mã và kiểm tra tính hợp lệ của cấu trúc bàn cờ từ dữ liệu thô trong cơ sở dữ liệu sang đối tượng `Position`.
 */
export function decodePosition(value: unknown): Position {
  if (
    !record(value) ||
    !Array.isArray(value.board) ||
    value.board.length !== 90 ||
    (value.turn !== "RED" && value.turn !== "BLACK") ||
    !Number.isSafeInteger(value.halfmove) ||
    (value.halfmove as number) < 0 ||
    !Number.isSafeInteger(value.fullmove) ||
    (value.fullmove as number) < 1
  )
    corrupt();
  const board: (Piece | null)[] = value.board.map((cell) => {
    if (cell === null) return null;
    if (
      !record(cell) ||
      (cell.side !== "red" && cell.side !== "black") ||
      typeof cell.type !== "string" ||
      ![
        "king",
        "advisor",
        "elephant",
        "horse",
        "rook",
        "cannon",
        "pawn",
      ].includes(cell.type)
    )
      corrupt();
    return { side: cell.side, type: cell.type } as Piece;
  });
  const position: Position = {
    board,
    turn: value.turn === "RED" ? "red" : "black",
    halfmove: value.halfmove as number,
    fullmove: value.fullmove as number,
  };
  try {
    return parsePosition(serializePosition(position));
  } catch {
    corrupt();
  }
}
/**
 * Mã hóa trạng thái bàn cờ chuẩn sang định dạng lưu trữ JSONB trong cơ sở dữ liệu.
 */
export function encodePosition(position: Position) {
  return {
    ...position,
    board: position.board.map((piece) => (piece ? { ...piece } : null)),
    turn: position.turn === "red" ? "RED" : "BLACK",
  };
}
export const toFen = serializePosition;
/**
 * Giải mã tọa độ nước đi từ định dạng đối tượng `{ from: {x,y}, to: {x,y} }` sang chỉ số ô phẳng (0–89).
 */
export function decodeMove(value: unknown) {
  if (!record(value) || !record(value.from) || !record(value.to)) corrupt();
  const square = (point: Record<string, unknown>) => {
    if (
      !Number.isInteger(point.x) ||
      !Number.isInteger(point.y) ||
      (point.x as number) < 0 ||
      (point.x as number) > 8 ||
      (point.y as number) < 0 ||
      (point.y as number) > 9
    )
      corrupt();
    return (point.y as number) * 9 + (point.x as number);
  };
  const move = { from: square(value.from), to: square(value.to) };
  if (move.from === move.to) corrupt();
  return move;
}
/**
 * Chuyển đổi nước đi dạng chỉ số ô cờ phẳng (0–89) sang tọa độ {x, y} phục vụ truyền tải và lưu trữ.
 */
export function encodeMove(move: { from: number; to: number }) {
  return {
    from: { x: move.from % 9, y: Math.floor(move.from / 9) },
    to: { x: move.to % 9, y: Math.floor(move.to / 9) },
  };
}
