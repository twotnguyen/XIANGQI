import { resolveRoute } from "./routes.js";
export interface BrowserLocation {
  pathname: string;
  search: string;
  hash: string;
}
const navigationEvent = "xiangqi:navigation";
function authDestination(value: unknown): string | null {
  if (
    typeof value !== "string" ||
    value.length > 2048 ||
    !value.startsWith("/") ||
    value.startsWith("//") ||
    value.includes("\\") ||
    Array.from(value).some(
      (c) => c.charCodeAt(0) < 32 || c.charCodeAt(0) === 127,
    ) ||
    /%(?:5c|0[0-9a-f]|1[0-9a-f]|7f)/i.test(value)
  )
    return null;
  const url = new URL(value, window.location.origin),
    route = resolveRoute(url.pathname, url.search);
  return url.origin === window.location.origin &&
    ["room", "join"].includes(route.name)
    ? `${url.pathname}${url.search}`
    : null;
}
/**
 * Lấy đường dẫn đích người dùng muốn truy cập trước khi bị chuyển hướng đăng nhập.
 */
export function getAuthDestination(): string | null {
  return authDestination(window.history.state?.xiangqiAuthDestination);
}
/**
 * Lấy thông tin vị trí URL hiện tại của trình duyệt (pathname, search, hash).
 */
export function getLocation(): BrowserLocation {
  const { pathname, search, hash } = window.location;
  return { pathname, search, hash };
}
/**
 * Đăng ký hàm callback lắng nghe sự thay đổi URL của trình duyệt (hỗ trợ cả popstate và pushState/replaceState).
 */
export function subscribeLocation(listener: () => void): () => void {
  window.addEventListener("popstate", listener);
  window.addEventListener(navigationEvent, listener);
  return () => {
    window.removeEventListener("popstate", listener);
    window.removeEventListener(navigationEvent, listener);
  };
}
/**
 * Điều hướng người dùng tới đường dẫn nội bộ mới và phát sự kiện cập nhật route.
 */
export function navigate(
  to: string,
  options: { replace?: boolean; authDestination?: string | null } = {},
): void {
  if (
    !to.startsWith("/") ||
    to.startsWith("//") ||
    to.includes("\\") ||
    Array.from(to).some(
      (char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127,
    ) ||
    /%(?:5c|0[0-9a-f]|1[0-9a-f]|7f)/i.test(to)
  )
    throw new Error("Invalid local navigation");
  const url = new URL(to, window.location.origin);
  if (url.origin !== window.location.origin)
    throw new Error("Invalid local navigation");
  const destination =
    options.authDestination === undefined
      ? getAuthDestination()
      : authDestination(options.authDestination);
  window.history[options.replace ? "replaceState" : "pushState"](
    destination ? { xiangqiAuthDestination: destination } : null,
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
  window.dispatchEvent(new Event(navigationEvent));
}
