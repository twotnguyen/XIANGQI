import type { PoolClient } from "pg";

/** Nhãn chung thay cho tên hiển thị của khách (đồng bộ với guest.store clearGuest). */
const GUEST_LABEL = "Khách";

/**
 * Thay tên hiển thị của đúng khách trong cấu trúc JSON (so khớp theo userId, không theo chuỗi).
 * Chỉ đổi nhánh chứa `{userId: guestId, displayName}`; mọi trường khác và người khác giữ nguyên.
 */
export function redactGuestDisplayName(
  value: unknown,
  guestId: string,
): { changed: boolean; value: unknown } {
  if (Array.isArray(value)) {
    let changed = false;
    const next = value.map((item) => {
      const result = redactGuestDisplayName(item, guestId);
      changed ||= result.changed;
      return result.value;
    });
    return changed ? { changed, value: next } : { changed, value };
  }
  if (value === null || typeof value !== "object")
    return { changed: false, value };
  const record = value as Record<string, unknown>;
  let changed = false;
  const next: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(record)) {
    const result = redactGuestDisplayName(child, guestId);
    changed ||= result.changed;
    next[key] = result.value;
  }
  const isGuest =
    typeof record.userId === "string" &&
    record.userId.toLowerCase() === guestId.toLowerCase();
  if (
    isGuest &&
    typeof record.displayName === "string" &&
    record.displayName !== GUEST_LABEL
  ) {
    next.displayName = GUEST_LABEL;
    changed = true;
  }
  return changed ? { changed, value: next } : { changed, value };
}

/**
 * Xóa PII của khách trước khi xóa phiên (chạy trong cùng transaction, dưới cùng scope khóa đã sắp xếp).
 *
 * Phạm vi:
 * - Tin nhắn chat do khách gửi bị xóa (kéo theo chat receipt/outbox của tin đó); receipt chat của khách bị xóa.
 * - Receipt idempotency của chính khách (room/realtime) bị xóa. Receipt của người khác KHÔNG bị xóa.
 * - Outbox phòng và receipt realtime của người khác: chỉ đổi tên hiển thị của khách trong JSON
 *   (khớp theo userId). Các dòng outbox được giữ nguyên, nên media.revoke-user/room chưa giao và
 *   sự kiện trận đấu vẫn phát được; receipt idempotency giữ nguyên.
 * - Quét theo chuỗi UUID của khách chỉ để tìm ứng viên (kể cả phòng đã rời từ lâu, vì membership đã bị xóa);
 *   mọi thay đổi vẫn được xác nhận lại bằng khớp userId trong JSON.
 * - Lịch sử đối thủ và hồ sơ trận đấu được giữ nguyên; tên hiển thị đưa về nhãn chung qua profile.
 */
export async function scrubGuestPrivacy(c: PoolClient, guestId: string) {
  // Chat is an optional schema (the runtime enables it only when present); skip cleanup when absent.
  const chat = await c.query(
    "SELECT to_regclass('xiangqi_chat.messages') IS NOT NULL AS present",
  );
  if (chat.rows[0]?.present === true) {
    await c.query("DELETE FROM xiangqi_chat.messages WHERE sender_id=$1", [
      guestId,
    ]);
    await c.query("DELETE FROM xiangqi_chat.receipts WHERE actor_id=$1", [
      guestId,
    ]);
  }
  await c.query("DELETE FROM xiangqi_room.entry_receipts WHERE actor_id=$1", [
    guestId,
  ]);
  await c.query("DELETE FROM xiangqi_realtime.receipts WHERE user_id=$1", [
    guestId,
  ]);

  const outbox = (
    await c.query<{ id: string; payload: unknown }>(
      "SELECT id,payload FROM xiangqi_room.outbox WHERE strpos(payload::text,$1::text)>0",
      [guestId],
    )
  ).rows;
  for (const row of outbox) {
    const redacted = redactGuestDisplayName(row.payload, guestId);
    if (redacted.changed)
      await c.query(
        "UPDATE xiangqi_room.outbox SET payload=$2::jsonb WHERE id=$1",
        [row.id, JSON.stringify(redacted.value)],
      );
  }

  const receipts = (
    await c.query<{
      user_id: string;
      room_id: string;
      command_id: string;
      response: unknown;
    }>(
      "SELECT user_id,room_id,command_id,response FROM xiangqi_realtime.receipts WHERE strpos(response::text,$1::text)>0",
      [guestId],
    )
  ).rows;
  for (const row of receipts) {
    const redacted = redactGuestDisplayName(row.response, guestId);
    if (redacted.changed)
      await c.query(
        "UPDATE xiangqi_realtime.receipts SET response=$4::jsonb WHERE user_id=$1 AND room_id=$2 AND command_id=$3",
        [
          row.user_id,
          row.room_id,
          row.command_id,
          JSON.stringify(redacted.value),
        ],
      );
  }
}
