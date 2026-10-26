const names = ["xiangqi_session", "xiangqi_refresh"] as const;
export type SessionCookieName = (typeof names)[number];
interface CookieResponse {
  setHeader(name: string, value: string[]): unknown;
}
export interface CookieSession {
  appSession: string;
  refresh_token: string;
  expiresAt: string;
  remember: boolean;
}
function flags(secure: boolean) {
  const sameSite =
    process.env.COOKIE_SAMESITE ??
    (process.env.NODE_ENV === "production" && secure ? "None" : "Lax");
  return `; Path=/; HttpOnly; SameSite=${sameSite}${secure ? "; Secure" : ""}`;
}
function hasControl(value: string) {
  return [...value].some((character) => {
    const code = character.charCodeAt(0);
    return code < 32 || code === 127;
  });
}
function encoded(value: string) {
  if (typeof value !== "string" || !value || hasControl(value))
    throw new Error("Invalid session cookie");
  const result = encodeURIComponent(value);
  if (result.length > 3800) throw new Error("Invalid session cookie");
  return result;
}
/**
 * Thiết lập các cookie phiên làm việc (xiangqi_session, xiangqi_refresh) vào response HTTP kèm các cờ bảo mật.
 */
export function writeSessionCookies(
  response: CookieResponse,
  session: CookieSession,
  secure: boolean,
  now = new Date(),
) {
  const deadline = Date.parse(session.expiresAt);
  if (
    !Number.isFinite(deadline) ||
    !Number.isFinite(now.getTime()) ||
    typeof session.remember !== "boolean"
  )
    throw new Error("Invalid session cookie lifetime");
  const suffix =
    flags(secure) +
    (session.remember
      ? `; Max-Age=${Math.max(0, Math.floor((deadline - now.getTime()) / 1000))}`
      : "");
  response.setHeader("Set-Cookie", [
    `${names[0]}=${encoded(session.appSession)}${suffix}`,
    `${names[1]}=${encoded(session.refresh_token)}${suffix}`,
  ]);
}
/**
 * Xóa bỏ các cookie phiên làm việc trên trình duyệt (đặt Max-Age=0) khi đăng xuất.
 */
export function clearSessionCookies(response: CookieResponse, secure: boolean) {
  response.setHeader(
    "Set-Cookie",
    names.map((name) => `${name}=${flags(secure)}; Max-Age=0`),
  );
}
/**
 * Phân tích và đọc giá trị cookie phiên được chỉ định từ chuỗi header Cookie của request.
 */
export function readSessionCookie(
  header: unknown,
  name: SessionCookieName,
): string | undefined {
  if (
    typeof header !== "string" ||
    header.length > 8192 ||
    /[^\x20-\x7e]/.test(header)
  )
    return undefined;
  let found: string | undefined;
  for (const segment of header.split(";")) {
    const part = segment.trim();
    if (!part) continue;
    const separator = part.indexOf("=");
    if (separator <= 0) return undefined;
    const key = part.slice(0, separator);
    if (!/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(key)) return undefined;
    if (key !== name) continue;
    if (found !== undefined) return undefined;
    const raw = part.slice(separator + 1);
    if (!raw || raw.length > 3800 || /[\s",\\]/.test(raw)) return undefined;
    try {
      const value = decodeURIComponent(raw);
      if (hasControl(value)) return undefined;
      found = value;
    } catch {
      return undefined;
    }
  }
  return found;
}
