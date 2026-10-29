import { randomBytes } from "node:crypto";
import { readSessionCookie } from "../session/cookies.js";

const DEVICE_COOKIE = "xiangqi_device";
const DEVICE_TOKEN = /^[A-Za-z0-9_-]{43}$/;

/**
 * Lấy mã thiết bị từ cookie; trình duyệt chưa có thì cấp mã mới.
 * `fresh` = true thì caller phải ghi lại cookie cho phản hồi.
 */
export function deviceToken(cookieHeader: unknown): {
  token: string;
  fresh: boolean;
} {
  const existing = readSessionCookie(cookieHeader, DEVICE_COOKIE);
  if (existing && DEVICE_TOKEN.test(existing))
    return { token: existing, fresh: false };
  return { token: randomBytes(32).toString("base64url"), fresh: true };
}
