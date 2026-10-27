import { HttpException } from "@nestjs/common";
import { GuestError } from "./guest.types.js";

/** Mã trạng thái được phép trả nguyên văn cho client; mọi lỗi khác (kể cả lỗi DB) thành 503 chung. */
const PUBLIC_STATUS = new Set([400, 401, 403, 409]);

/** Hình dạng DTO Khách trả về; capability nằm trong JSON vì socket và header Authorization cần nó. */
export interface GuestSessionDto {
  kind: "guest";
  userId: string;
  displayName: string;
  capability: string;
  expiresAt: string;
  deferred: boolean;
}

export function guestSessionDto(
  actor: {
    userId: string;
    displayName: string;
    expiresAt: string;
    deferred: boolean;
  },
  capability: string,
): GuestSessionDto {
  return {
    kind: "guest",
    userId: actor.userId,
    displayName: actor.displayName,
    capability,
    expiresAt: actor.expiresAt,
    deferred: actor.deferred,
  };
}

/** Chuẩn hóa lỗi Khách thành HttpException an toàn; không lộ message nội bộ của lỗi không phải GuestError. */
export function guestFailure(error: unknown): HttpException {
  if (error instanceof GuestError && PUBLIC_STATUS.has(error.status)) {
    return new HttpException(
      { code: error.code, message: error.message },
      error.status,
    );
  }
  return new HttpException(
    { code: "GUEST_UNAVAILABLE", message: "Chức năng Khách chưa sẵn sàng" },
    503,
  );
}
