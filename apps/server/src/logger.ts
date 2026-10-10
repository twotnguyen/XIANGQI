const levels = ["debug", "info", "warn", "error"];
const events = [
  "server_started",
  "server_start_failed",
  "server_stopped",
  "registration_maintenance_failed",
  "unknown_event",
];

// Accept no free-form strings, Error objects, request bodies or nested payloads.
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
