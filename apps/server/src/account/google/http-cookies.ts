import { writeSessionCookies, type CookieSession } from "../session/cookies.js";
const names = [
  "xiangqi_google_challenge",
  "xiangqi_google_onboarding",
  "xiangqi_google_refresh",
] as const;
export type GoogleCookieName = (typeof names)[number];
interface CookieResponse {
  getHeader(name: string): number | string | string[] | undefined;
  setHeader(name: string, value: string[]): unknown;
}
function controls(value: string) {
  return [...value].some(
    (c) => c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127,
  );
}
function flags(secure: boolean) {
  return `; Path=/auth/google; HttpOnly; SameSite=Lax${secure ? "; Secure" : ""}`;
}
function append(response: CookieResponse, cookies: string[]) {
  const existing = response.getHeader("Set-Cookie");
  if (typeof existing === "number") throw new Error("Invalid cookie response");
  response.setHeader("Set-Cookie", [
    ...(Array.isArray(existing) ? existing : existing ? [existing] : []),
    ...cookies,
  ]);
}
export function writeGoogleCookie(
  response: CookieResponse,
  name: GoogleCookieName,
  value: string,
  expiresAt: string,
  secure = true,
  now = new Date(),
) {
  if (typeof value !== "string" || !value || controls(value))
    throw new Error("Invalid Google cookie");
  const encoded = encodeURIComponent(value),
    deadline = Date.parse(expiresAt);
  if (
    encoded.length > 3800 ||
    !Number.isFinite(deadline) ||
    !Number.isFinite(now.getTime())
  )
    throw new Error("Invalid Google cookie");
  append(response, [
    `${name}=${encoded}${flags(secure)}; Max-Age=${Math.max(0, Math.floor((deadline - now.getTime()) / 1000))}`,
  ]);
}
export function clearGoogleCookies(
  response: CookieResponse,
  secure = true,
  namesToClear: readonly GoogleCookieName[] = names,
) {
  append(
    response,
    namesToClear.map((name) => `${name}=${flags(secure)}; Max-Age=0`),
  );
}
export function writeGoogleMemberCookies(
  response: CookieResponse,
  member: CookieSession,
  secure = true,
  now = new Date(),
) {
  writeSessionCookies(
    {
      setHeader(_name, cookies) {
        append(response, cookies);
      },
    },
    member,
    secure,
    now,
  );
  clearGoogleCookies(response, secure);
}
export function readGoogleCookie(
  header: unknown,
  name: GoogleCookieName,
): string | undefined {
  if (
    typeof header !== "string" ||
    header.length > 8192 ||
    [...header].some((c) => c.charCodeAt(0) < 32 || c.charCodeAt(0) > 126)
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
      if (!value || controls(value)) return undefined;
      if (
        name !== "xiangqi_google_refresh" &&
        !/^[A-Za-z0-9_-]{43}$/.test(value)
      )
        return undefined;
      found = value;
    } catch {
      return undefined;
    }
  }
  return found;
}
