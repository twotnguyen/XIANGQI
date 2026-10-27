const levels = ["debug", "info", "warn", "error"];
const events = [
  "server_started",
  "server_start_failed",
  "server_stopped",
  "registration_maintenance_failed",
  "google_maintenance_failed",
  "realtime_maintenance_failed",
  "server_shutdown_failed",
  "realtime_disconnect_failed",
  "media_revocation_failed",
  "room_runtime_lock_lost",
  "unknown_event",
];

/**
 * Định dạng và chuẩn hóa thông tin sự kiện thành chuỗi JSON an toàn để ghi log hệ thống.
 * Chỉ cho phép các cấp độ (level) và mã sự kiện (event) hợp lệ nhằm ngăn ngừa rò rỉ dữ liệu nhạy cảm.
 */
export function logEvent(
  level: unknown,
  event: unknown,
  metadata?: unknown,
): string {
  const safeLevel =
    typeof level === "string" && levels.includes(level) ? level : "error";
  const safeEvent =
    typeof event === "string" && events.includes(event)
      ? event
      : "unknown_event";
  const record: Record<string, string | number> = {
    time: new Date().toISOString(),
    level: safeLevel,
    event: safeEvent,
  };
  if (
    metadata &&
    typeof metadata === "object" &&
    "port" in metadata &&
    typeof metadata.port === "number" &&
    Number.isInteger(metadata.port) &&
    metadata.port >= 1 &&
    metadata.port <= 65535
  ) {
    record.port = metadata.port;
  }
  return JSON.stringify(record);
}
