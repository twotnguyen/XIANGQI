const staticRoutes = {
  "/": "home",
  "/login": "login",
  "/register": "register",
  "/lobby": "lobby",
  "/friends": "friends",
  "/settings": "settings",
  "/onboarding": "onboarding",
  "/access-denied": "access-denied",
  "/forgot-password": "forgot-password",
  "/reset-password": "reset-password",
  "/leaderboard": "leaderboard",
  "/history": "history",
  "/dev/board": "dev-board",
  "/dev/register": "dev-register",
  "/dev/ui": "dev-ui",
  "/dev/lobby": "dev-lobby",
  "/dev/health": "dev-health",
} as const;
export type StaticRouteName = (typeof staticRoutes)[keyof typeof staticRoutes];
export type Route =
  | { name: StaticRouteName }
  | { name: "room" | "ai" | "replay"; id: string }
  | { name: "join"; token: string }
  | { name: "not-found" };
export type SessionSnapshot =
  | { status: "checking" | "anonymous" | "active-member" | "guest" | "error" }
  | { status: "pending"; method: "google" | "email" };
export type RouteDecision =
  | {
      kind:
        "render" | "checking" | "session-error" | "pending" | "access-denied";
    }
  | {
      kind: "redirect";
      to: "/login" | "/lobby" | "/onboarding";
      replace: true;
      preserveDestination?: true;
    };
export function resolveRoute(pathname: string, search = ""): Route {
  if (Object.hasOwn(staticRoutes, pathname))
    return { name: staticRoutes[pathname as keyof typeof staticRoutes] };
  if (pathname === "/rooms/join") {
    const tokens = new URLSearchParams(search).getAll("token");
    return tokens.length === 1 && tokens[0]?.trim()
      ? { name: "join", token: tokens[0] }
      : { name: "not-found" };
  }
  const match = /^\/(rooms|ai|history)\/([^/]+)$/.exec(pathname);
  if (!match) return { name: "not-found" };
  let id: string;
  try {
    id = decodeURIComponent(match[2]!);
  } catch {
    return { name: "not-found" };
  }
  if (
    !id ||
    id.includes("/") ||
    id.includes("\\") ||
    Array.from(id).some(
      (char) => char.charCodeAt(0) < 32 || char.charCodeAt(0) === 127,
    )
  )
    return { name: "not-found" };
  return {
    name: match[1] === "rooms" ? "room" : match[1] === "ai" ? "ai" : "replay",
    id,
  };
}
const p2 = new Set<Route["name"]>([
  "forgot-password",
  "reset-password",
  "leaderboard",
  "history",
  "replay",
]);
export function guardRoute(
  route: Route,
  session: SessionSnapshot,
): RouteDecision {
  if (
    route.name === "not-found" ||
    route.name === "access-denied" ||
    route.name.startsWith("dev-")
  )
    return { kind: "render" };
  if (session.status === "checking") return { kind: "checking" };
  if (session.status === "error") return { kind: "session-error" };
  if (session.status === "pending")
    return session.method === "google"
      ? route.name === "onboarding"
        ? { kind: "render" }
        : {
            kind: "redirect",
            to: "/onboarding",
            replace: true,
            ...(route.name === "room" || route.name === "join"
              ? { preserveDestination: true as const }
              : {}),
          }
      : { kind: "pending" };
  if (
    session.status === "guest" &&
    (route.name === "friends" || p2.has(route.name))
  )
    return { kind: "access-denied" };
  const authenticated =
    session.status === "active-member" || session.status === "guest";
  if (route.name === "home")
    return {
      kind: "redirect",
      to: authenticated ? "/lobby" : "/login",
      replace: true,
    };
  if (route.name === "login" || route.name === "register")
    return authenticated
      ? { kind: "redirect", to: "/lobby", replace: true }
      : { kind: "render" };
  if (route.name === "forgot-password" || route.name === "reset-password")
    return { kind: "render" };
  if (!authenticated)
    return {
      kind: "redirect",
      to: "/login",
      replace: true,
      preserveDestination: true,
    };
  if (route.name === "onboarding")
    return { kind: "redirect", to: "/lobby", replace: true };
  return { kind: "render" };
}
