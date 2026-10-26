import type { MatchEnding, Move, Side } from "@xiangqi/xiangqi-core";
export type EngineLevel = "easy" | "medium" | "hard";
/**
 * Định nghĩa hợp đồng dữ liệu cho yêu cầu tìm nước đi từ AI Engine:
 * Thế cờ hiện tại (FEN), bên đi, cấp độ khó và lịch sử các thế cờ trước đó.
 */
export interface EngineRequest {
  position: string;
  side: Side;
  level: EngineLevel;
  /** Server-owned effective branch, ending at position; never accept client history. */
  history?: readonly string[];
}

/**
 * Kết quả tính toán nước đi trả về từ AI Engine:
 * Nước đi tối ưu nhất, trạng thái kết thúc ván (nếu có), độ sâu tìm kiếm, thời gian xử lý và số nút đã duyệt.
 */
export interface EngineResult {
  move: Move | null;
  terminal: MatchEnding | null;
  completedDepth: number;
  targetDepth: number;
  elapsedMs: number;
  nodes: number;
  timedOut: boolean;
}

/**
 * Cấu hình giới hạn độ sâu tìm kiếm (depth) và thời gian tối đa (milliseconds) theo 3 cấp độ:
 * - easy: độ sâu 2, tối đa 300ms
 * - medium: độ sâu 4, tối đa 1000ms
 * - hard: độ sâu 6, tối đa 3000ms
 */
export const ENGINE_LIMITS = {
  easy: { depth: 2, milliseconds: 300 },
  medium: { depth: 4, milliseconds: 1000 },
  hard: { depth: 6, milliseconds: 3000 },
} as const;

/**
 * Lớp lỗi đại diện cho các sự cố trong quá trình engine AI tính toán
 * (dữ liệu sai, engine đang bận, hết thời gian timeout, bị hủy bỏ hoặc worker đã đóng).
 */
export class EngineError extends Error {
  constructor(
    public readonly code:
      | "ENGINE_INPUT_INVALID"
      | "ENGINE_BUSY"
      | "ENGINE_TIMEOUT"
      | "ENGINE_FAILED"
      | "ENGINE_CANCELLED"
      | "ENGINE_CLOSED",
  ) {
    super(code);
  }
}
