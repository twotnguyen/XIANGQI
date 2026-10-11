import { expect, it } from "vitest";
import { resolveRoute, guardRoute } from "./routes.js";
it.each([
  ["/", "home"],
  ["/login", "login"],
  ["/register", "register"],
  ["/lobby", "lobby"],
  ["/friends", "friends"],
  ["/settings", "settings"],
  ["/onboarding", "onboarding"],
  ["/access-denied", "access-denied"],
  ["/forgot-password", "forgot-password"],
  ["/reset-password", "reset-password"],
  ["/leaderboard", "leaderboard"],
  ["/history", "history"],
  ["/dev/board", "dev-board"],
  ["/dev/register", "dev-register"],
  ["/dev/ui", "dev-ui"],
  ["/dev/lobby", "dev-lobby"],
  ["/dev/health", "dev-health"],
])("resolves the explicit path %s", (path, name) =>
  expect(resolveRoute(path)).toEqual({ name }),
);
it("prioritizes invitation entry over the room-id pattern", () => {
  expect(resolveRoute("/rooms/join", "?token=fixture-invite")).toEqual({
    name: "join",
    token: "fixture-invite",
  });
  expect(resolveRoute("/rooms/join")).toEqual({ name: "not-found" });
  expect(resolveRoute("/rooms/join", "?token=a&token=b")).toEqual({
    name: "not-found",
  });
  expect(resolveRoute("/rooms/room-42", "?role=host")).toEqual({
    name: "room",
    id: "room-42",
  });
  expect(resolveRoute("/ai/ai-42")).toEqual({ name: "ai", id: "ai-42" });
  expect(resolveRoute("/history/match-42")).toEqual({
    name: "replay",
    id: "match-42",
  });
});
it.each([
  "/unknown",
  "/rooms/",
  "/rooms/%ZZ",
  "/rooms/a%2Fb",
  "/ai/a%5Cb",
  "/history/%00",
  "/rooms/id/extra",
  "https://outside.invalid/login",
])("keeps malformed/unknown path %s out of room routing", (path) =>
  expect(resolveRoute(path)).toEqual({ name: "not-found" }),
);
it("redirects authenticated visitors away from account entry without adding history", () => {
  expect(guardRoute({ name: "login" }, { status: "active-member" })).toEqual({
    kind: "redirect",
    to: "/lobby",
    replace: true,
  });
  expect(guardRoute({ name: "register" }, { status: "guest" })).toEqual({
    kind: "redirect",
    to: "/lobby",
    replace: true,
  });
});
it("preserves protected destination for authentication, with no seat/role decision", () => {
  expect(
    guardRoute({ name: "room", id: "fixture" }, { status: "anonymous" }),
  ).toEqual({
    kind: "redirect",
    to: "/login",
    replace: true,
    preserveDestination: true,
  });
  expect(
    guardRoute({ name: "room", id: "fixture" }, { status: "guest" }),
  ).toEqual({ kind: "render" });
});
it("keeps bootstrap failure distinct from an anonymous session", () => {
  expect(guardRoute({ name: "lobby" }, { status: "checking" })).toEqual({
    kind: "checking",
  });
  expect(guardRoute({ name: "lobby" }, { status: "error" })).toEqual({
    kind: "session-error",
  });
  expect(guardRoute({ name: "not-found" }, { status: "checking" })).toEqual({
    kind: "render",
  });
});
it("allows Guest settings for logout but denies friends and P2", () => {
  expect(guardRoute({ name: "settings" }, { status: "guest" })).toEqual({
    kind: "render",
  });
  for (const name of [
    "friends",
    "leaderboard",
    "history",
    "forgot-password",
    "reset-password",
  ] as const)
    expect(guardRoute({ name }, { status: "guest" })).toEqual({
      kind: "access-denied",
    });
  expect(
    guardRoute({ name: "replay", id: "fixture" }, { status: "guest" }),
  ).toEqual({ kind: "access-denied" });
});
it("does not treat a pending email account as Google onboarding or ACTIVE", () => {
  expect(
    guardRoute({ name: "lobby" }, { status: "pending", method: "email" }),
  ).toEqual({ kind: "pending" });
  expect(
    guardRoute({ name: "lobby" }, { status: "pending", method: "google" }),
  ).toEqual({ kind: "redirect", to: "/onboarding", replace: true });
  expect(
    guardRoute({ name: "onboarding" }, { status: "pending", method: "google" }),
  ).toEqual({ kind: "render" });
  expect(guardRoute({ name: "onboarding" }, { status: "anonymous" })).toEqual({
    kind: "redirect",
    to: "/login",
    replace: true,
    preserveDestination: true,
  });
});
it("resolves home and onboarding from authenticated state while leaving unknown routes readable", () => {
  expect(guardRoute({ name: "home" }, { status: "anonymous" })).toEqual({
    kind: "redirect",
    to: "/login",
    replace: true,
  });
  expect(guardRoute({ name: "home" }, { status: "active-member" })).toEqual({
    kind: "redirect",
    to: "/lobby",
    replace: true,
  });
  expect(
    guardRoute({ name: "onboarding" }, { status: "active-member" }),
  ).toEqual({ kind: "redirect", to: "/lobby", replace: true });
  expect(
    guardRoute({ name: "forgot-password" }, { status: "anonymous" }),
  ).toEqual({ kind: "render" });
  expect(guardRoute({ name: "dev-board" }, { status: "error" })).toEqual({
    kind: "render",
  });
  expect(
    guardRoute({ name: "access-denied" }, { status: "anonymous" }),
  ).toEqual({ kind: "render" });
});
