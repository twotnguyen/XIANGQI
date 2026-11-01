import { resolveRoute } from "./routes.js";
export interface BrowserLocation {
  pathname: string;
  search: string;
  hash: string;
}
const navigationEvent = "xiangqi:navigation";
let navigationGuard: ((destination: string) => boolean) | null = null;
let entryIndex = 0;
let restoringEntry = false;
const locationListeners = new Set<() => void>();
function trackEntry(): number {
  const index = window.history.state?.xiangqiEntryIndex;
  if (Number.isInteger(index)) return index;
  window.history.replaceState(
    { ...window.history.state, xiangqiEntryIndex: 0 },
    "",
  );
  return 0;
}
export function setNavigationGuard(
  guard: ((destination: string) => boolean) | null,
): void {
  navigationGuard = guard;
  if (guard) entryIndex = trackEntry();
}
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
function onPopState(): void {
  const targetIndex = window.history.state?.xiangqiEntryIndex;
  if (restoringEntry) {
    restoringEntry = false;
    return;
  }
  const destination = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (
    Number.isInteger(targetIndex) &&
    targetIndex !== entryIndex &&
    navigationGuard?.(destination)
  ) {
    restoringEntry = true;
    window.history.go(entryIndex - targetIndex);
    return;
  }
  entryIndex = trackEntry();
  notifyLocation();
}
function notifyLocation(): void {
  for (const listener of locationListeners) listener();
}
export function subscribeLocation(listener: () => void): () => void {
  if (locationListeners.size === 0) {
    entryIndex = trackEntry();
    window.addEventListener("popstate", onPopState);
    window.addEventListener(navigationEvent, notifyLocation);
  }
  locationListeners.add(listener);
  return () => {
    locationListeners.delete(listener);
    if (locationListeners.size === 0) {
      window.removeEventListener("popstate", onPopState);
      window.removeEventListener(navigationEvent, notifyLocation);
    }
  };
}
/**
 * Điều hướng người dùng tới đường dẫn nội bộ mới và phát sự kiện cập nhật route.
 */
export function navigate(
  to: string,
  options: {
    replace?: boolean;
    authDestination?: string | null;
    bypassGuard?: boolean;
  } = {},
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
  if (
    !options.bypassGuard &&
    navigationGuard?.(`${url.pathname}${url.search}${url.hash}`)
  )
    return;
  const destination =
    options.authDestination === undefined
      ? getAuthDestination()
      : authDestination(options.authDestination);
  entryIndex = trackEntry() + (options.replace ? 0 : 1);
  window.history[options.replace ? "replaceState" : "pushState"](
    {
      ...(destination ? { xiangqiAuthDestination: destination } : {}),
      xiangqiEntryIndex: entryIndex,
    },
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
  window.dispatchEvent(new Event(navigationEvent));
}
