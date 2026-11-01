import type { Move, PieceType, Position, Side } from "@xiangqi/xiangqi-core";

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
/** WXF Art 7.1/7.5: front/rear and pawn ordinals are relative to the mover. */
export function formatPositionMove(position: Position, move: Move): string {
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
