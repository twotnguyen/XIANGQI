/**
 * Điểm xuất khẩu chính (entry point) của package `@xiangqi/shared`.
 * Cung cấp các kiểu dữ liệu và hàm tiện ích dùng chung giữa Client (Web) và Server:
 * Bộ lọc tên và chat, hợp đồng Socket.IO realtime, danh sách phòng công khai và xuất biên bản PGN.
 */

/**
 * Trạng thái kiểm tra sức khỏe hệ thống (Health Check) giữa Server, Database và Engine.
 */
export interface HealthStatus {
  server: "ok";
  database: "ok" | "error" | "not_connected";
  engine: "not_connected";
}

export { containsForbiddenName, normalizeName } from "./auth-filter.js";
export type * from "./realtime.js";
export { maskForbiddenChat } from "./chat-filter.js";
export type * from "./chat.js";
export type * from "./public-rooms.js";

export { buildPgn, fenAt, pgnResult, squareName } from "./replay-export.js";
export type {
  ReplayExportMove,
  ReplayExportSource,
  ReplaySide,
} from "./replay-export.js";
