/** Cookie HttpOnly giữ capability Khách; server quyết định hạn thật, cookie chỉ là bản sao để khôi phục. */
export const GUEST_COOKIE = "xiangqi_guest";
/** Max-Age của cookie: dài hơn hạn server 12 giờ để ván đang ngồi (deferred) vẫn khôi phục được. */
export const GUEST_COOKIE_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

const CAPABILITY = /^[A-Za-z0-9_-]{43}$/;
const COOKIE_NAME = /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/;

interface CookieResponse {
  getHeader(name: string): number | string | string[] | undefined;
  setHeader(name: string, value: string[]): unknown;
}

function flags(secure: boolean): string {
  const sameSite =
    process.env.COOKIE_SAMESITE ??
    (process.env.NODE_ENV === "production" && secure ? "None" : "Lax");
  return `Path=/; HttpOnly; SameSite=${sameSite}${secure ? "; Secure" : ""}`;
}

function append(response: CookieResponse, cookies: string[]): void {
  const existing = response.getHeader("Set-Cookie");
  const current =
    existing === undefined
      ? []
      : Array.isArray(existing)
        ? existing
        : [String(existing)];
  response.setHeader("Set-Cookie", [...current, ...cookies]);
}

/** Ghi cookie Khách (capability 43 ký tự base64url). Sai định dạng là lỗi lập trình, không phải input người dùng. */
export function writeGuestCookie(
  response: CookieResponse,
  capability: string,
  secure: boolean,
): void {
  if (!CAPABILITY.test(capability))
    throw new Error("Guest capability không đúng định dạng");
  append(response, [
    `${GUEST_COOKIE}=${capability}; ${flags(secure)}; Max-Age=${GUEST_COOKIE_MAX_AGE_SECONDS}`,
  ]);
}

/** Xóa cookie Khách bằng Max-Age=0; chỉ gọi khi đã commit xóa phía server. */
export function clearGuestCookie(
  response: CookieResponse,
  secure: boolean,
): void {
  append(response, [`${GUEST_COOKIE}=; ${flags(secure)}; Max-Age=0`]);
}

/**
 * Đọc capability từ header Cookie. Trả undefined khi thiếu, sai định dạng,
 * trùng lặp, hoặc header có cookie lỗi cú pháp/ký tự điều khiển (từ chối toàn bộ).
 */
export function readGuestCookie(header: unknown): string | undefined {
  if (typeof header !== "string" || header.length > 8192) return undefined;
  for (let index = 0; index < header.length; index += 1) {
    const code = header.charCodeAt(index);
    if (code < 32 || code > 126) return undefined;
  }
  let found: string | undefined;
  for (const segment of header.split(";")) {
    const part = segment.trim();
    if (!part) continue;
    const separator = part.indexOf("=");
    if (separator <= 0) return undefined;
    const name = part.slice(0, separator);
    if (!COOKIE_NAME.test(name)) return undefined;
    if (name !== GUEST_COOKIE) continue;
    if (found !== undefined) return undefined;
    const value = part.slice(separator + 1);
    if (!CAPABILITY.test(value)) return undefined;
    found = value;
  }
  return found;
}
