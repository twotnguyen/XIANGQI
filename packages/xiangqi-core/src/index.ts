/**
 * Điểm xuất khẩu chính (entry point) của package `@xiangqi/xiangqi-core`.
 * Cung cấp toàn bộ kiểu dữ liệu và hàm xử lý luật cờ tướng: biểu diễn thế cờ (FEN),
 * sinh nước đi, kiểm tra chiếu tướng, thực hiện nước đi và phán quyết kết thúc ván cờ.
 */
export * from "./position.js";
export {
  pseudoLegalMoves,
  legalMoves,
  isInCheck,
  playMove,
  perft,
} from "./moves.js";
export { ending } from "./ending.js";
export type { MatchEnding } from "./ending.js";
