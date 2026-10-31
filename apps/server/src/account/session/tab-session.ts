import { createHash } from "node:crypto";
import type { IncomingMessage, ServerResponse } from "node:http";

const selector =
  /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
const scopedNames = new Set([
  "xiangqi_session",
  "xiangqi_refresh",
  "xiangqi_guest",
  "xiangqi_google_challenge",
  "xiangqi_google_onboarding",
  "xiangqi_google_refresh",
]);
const bootstrap = new Set([
  "/auth/refresh",
  "/account/guest/session",
  "/auth/google/onboarding",
]);
const refreshName = (capability: string) =>
  "xiangqi_refresh_group__" +
  createHash("sha256").update(capability).digest("hex");

/** Luật thiết bị bật (production) thì một hồ sơ trình duyệt chỉ có một phiên: bỏ qua header tab, dùng cookie chung. */
export function tabSessionMiddlewareFor(deviceEnforcement: boolean) {
  return deviceEnforcement
    ? (
        _request: IncomingMessage,
        _response: ServerResponse,
        next: () => void,
      ) => next()
    : tabSessionMiddleware;
}

/** The public selector routes session/refresh cookies; no secret is stored in browser storage. */
export function tabSessionMiddleware(
  request: IncomingMessage,
  response: ServerResponse,
  next: () => void,
) {
  const tab = request.headers["x-xiangqi-tab"];
  const source = request.headers["x-xiangqi-tab-source"];
  if (tab === undefined && source === undefined) return next();
  const reject = () => {
    response.writeHead(400, {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    });
    response.end(
      JSON.stringify({
        code: "SESSION_TAB_INVALID",
        message: "Phiên của tab không hợp lệ",
      }),
    );
  };
  if (
    typeof tab !== "string" ||
    !selector.test(tab) ||
    (source !== undefined &&
      source !== "last" &&
      (typeof source !== "string" || !selector.test(source)))
  )
    return reject();
  const raw = request.headers.cookie ?? "";
  if (raw.length > 65536 || /[^\x20-\x7e]/.test(raw)) return reject();
  const cookies = new Map<string, string>();
  for (const item of raw.split(";")) {
    const part = item.trim();
    if (!part) continue;
    const split = part.indexOf("=");
    const name = part.slice(0, split);
    if (
      split <= 0 ||
      !/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(name) ||
      cookies.has(name)
    )
      return reject();
    cookies.set(name, part.slice(split + 1));
  }
  const path = (request.url ?? "").split("?")[0]!;
  const own = [...scopedNames].some((name) => cookies.has(`${name}__${tab}`));
  const inherited =
    source === "last" ? cookies.get("xiangqi_last_tab") : source;
  const legacy =
    !own &&
    bootstrap.has(path) &&
    source === "last" &&
    !cookies.has("xiangqi_last_tab");
  const from =
    !own &&
    bootstrap.has(path) &&
    typeof inherited === "string" &&
    selector.test(inherited)
      ? inherited
      : tab;
  const selected = new Map<string, string>();
  for (const [name, value] of cookies) {
    if (!name.startsWith("xiangqi_")) selected.set(name, value);
    if (name === "xiangqi_device") selected.set(name, value);
  }
  for (const name of scopedNames) {
    const value = cookies.get(legacy ? name : `${name}__${from}`);
    if (value !== undefined) selected.set(name, value);
  }
  const capability = selected.get("xiangqi_session");
  if (capability !== undefined) {
    const refresh = cookies.get(refreshName(capability));
    if (refresh !== undefined) selected.set("xiangqi_refresh", refresh);
  }
  request.headers.cookie = [...selected]
    .map(([name, value]) => `${name}=${value}`)
    .join("; ");
  const original = response.setHeader.bind(response);
  response.setHeader = (name, value) => {
    if (name.toLowerCase() !== "set-cookie") return original(name, value);
    const values = Array.isArray(value) ? value.map(String) : [String(value)];
    const session = values.find(
      (cookie) =>
        cookie.startsWith("xiangqi_session=") && !cookie.includes("Max-Age=0"),
    );
    const current =
      session?.slice("xiangqi_session=".length).split(";")[0] ?? capability;
    let pointer: string | undefined;
    const rewritten = values.flatMap((cookie) => {
      const split = cookie.indexOf("=");
      const key = cookie.slice(0, split);
      if (!scopedNames.has(key)) return [cookie];
      if (key === "xiangqi_refresh") {
        if (!current) return [];
        // Creating a guest must not delete another tab's shared member refresh token.
        if (
          cookie.includes("Max-Age=0") &&
          path !== "/auth/logout" &&
          path !== "/auth/refresh"
        )
          return [];
        return [refreshName(current) + cookie.slice(split)];
      }
      if (
        [
          "xiangqi_session",
          "xiangqi_guest",
          "xiangqi_google_onboarding",
        ].includes(key) &&
        !cookie.includes("Max-Age=0")
      )
        pointer =
          `xiangqi_last_tab=${tab}` +
          cookie.slice(cookie.indexOf(";")).replace(/Path=[^;]+/, "Path=/");
      return [key + "__" + tab + cookie.slice(split)];
    });
    if (pointer) rewritten.push(pointer);
    return original(name, rewritten);
  };
  next();
}
