/**
 * Điểm xuất khẩu chính (entry point) của package `@xiangqi/engine`.
 * Cung cấp:
 * - `EngineWorker`: Quản lý tiến trình tính toán AI chạy nền qua worker threads.
 * - `searchPosition` & `readRequest`: Thuật toán tìm kiếm nước đi Negamax / Alpha-Beta.
 * - `ENGINE_LIMITS` & `EngineError`: Cấu hình giới hạn cấp độ và các lớp lỗi engine.
 */
export { EngineWorker } from "./engine-worker.js";
export type { EngineWorkerOptions } from "./engine-worker.js";
export { EngineError, ENGINE_LIMITS } from "./contracts.js";
export type {
  EngineLevel,
  EngineRequest,
  EngineResult,
  EngineProgress,
} from "./contracts.js";
export { searchPosition, readRequest } from "./search.js";
