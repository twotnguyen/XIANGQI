// Pure FEN/PGN projection for private replay export (P2-15).
// No chess rules are needed: FEN strings come from the canonical record and
// moves are exported as ICCS coordinates so the file stays machine-readable.
export type ReplaySide = "red" | "black";
export interface ReplayExportMove {
  from: number;
  to: number;
  side: ReplaySide;
}
export interface ReplayExportSource {
  id: string;
  mode: string;
  side: ReplaySide;
  positions: Array<{ fen: string; turn: ReplaySide }>;
  moves: ReplayExportMove[];
  result?: { reason: string; winner: ReplaySide | null } | null;
}
const FILES = "abcdefghi";
/**
 * Chuyển đổi chỉ số ô cờ (0–89) thành tọa độ bàn cờ chuẩn ICCS (cột a–i, hàng 0–9 tính từ bên Đen).
 */
export function squareName(square: number): string {
  const x = square % 9,
    y = Math.floor(square / 9);
  if (x < 0 || x > 8 || y < 0 || y > 9) throw Error("invalid square");
  return `${FILES[x]}${9 - y}`;
}

/**
 * Lấy chuỗi FEN của thế cờ tại một nửa nước đi (ply) cụ thể trong ván cờ.
 */
export function fenAt(source: ReplayExportSource, ply: number): string {
  if (!Number.isInteger(ply) || ply < 0 || ply >= source.positions.length)
    throw Error("invalid ply");
  return source.positions[ply]!.fen;
}

/**
 * Chuyển đổi kết quả ván cờ thành định dạng PGN chuẩn: "1-0" (Đỏ thắng), "0-1" (Đen thắng), "1/2-1/2" (Hòa) hoặc "*".
 */
export function pgnResult(source: ReplayExportSource): string {
  const result = source.result;
  if (
    !result ||
    result.reason === "SERVER_RESTART" ||
    result.reason === "BOTH_OFFLINE" ||
    result.reason === "AI_UNAVAILABLE"
  )
    return "*";
  if (result.winner === "red") return "1-0";
  if (result.winner === "black") return "0-1";
  return "1/2-1/2";
}

/**
 * Xuất dữ liệu ván cờ thành văn bản định dạng PGN chuẩn (Portable Game Notation) cho Cờ Tướng:
 * Bao gồm các thẻ meta (Event, Variant Xiangqi, FEN bắt đầu, Result) và danh sách nước đi theo tọa độ ICCS hoặc ký pháp tùy chọn.
 */
export function buildPgn(
  source: ReplayExportSource,
  labels?: string[],
): string {
  const result = pgnResult(source);
  const lines = [
    '[Event "XIANGQI"]',
    `[Site "xiangqi"]`,
    `[GameId "${source.id}"]`,
    `[Variant "Xiangqi"]`,
    `[Mode "${source.mode}"]`,
    `[FEN "${source.positions[0]?.fen ?? ""}"]`,
    `[Result "${result}"]`,
    "",
  ];
  const tokens: string[] = [];
  source.moves.forEach((move, index) => {
    if (move.side === "red") tokens.push(`${Math.floor(index / 2) + 1}.`);
    const label = labels?.[index];
    tokens.push(
      label && label.length
        ? label
        : `${squareName(move.from)}${squareName(move.to)}`,
    );
  });
  tokens.push(result);
  let line = "";
  for (const token of tokens) {
    if (line.length + token.length + 1 > 80) {
      lines.push(line);
      line = "";
    }
    line = line.length ? `${line} ${token}` : token;
  }
  if (line.length) lines.push(line);
  return `${lines.join("\n")}\n`;
}
