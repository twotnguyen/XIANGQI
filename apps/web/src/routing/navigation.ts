export interface BrowserLocation {
  pathname: string;
  search: string;
  hash: string;
}
const navigationEvent = "xiangqi:navigation";
export function getLocation(): BrowserLocation {
  const { pathname, search, hash } = window.location;
  return { pathname, search, hash };
}
export function subscribeLocation(listener: () => void): () => void {
  window.addEventListener("popstate", listener);
  window.addEventListener(navigationEvent, listener);
  return () => {
    window.removeEventListener("popstate", listener);
    window.removeEventListener(navigationEvent, listener);
  };
}
export function navigate(
  to: string,
  options: { replace?: boolean } = {},
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
  window.history[options.replace ? "replaceState" : "pushState"](
    null,
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
  window.dispatchEvent(new Event(navigationEvent));
}
