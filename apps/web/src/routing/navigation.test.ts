// @vitest-environment jsdom
import { beforeEach, expect, it, vi } from "vitest";
import { waitFor } from "@testing-library/react";
import {
  getLocation,
  navigate,
  subscribeLocation,
  getAuthDestination,
} from "./navigation.js";
beforeEach(() => window.history.replaceState(null, "", "/login"));
it("notifies the current location on push and unsubscribes cleanly", () => {
  const listener = vi.fn();
  const stop = subscribeLocation(listener);
  navigate("/register?source=fixture#account");
  expect(getLocation()).toEqual({
    pathname: "/register",
    search: "?source=fixture",
    hash: "#account",
  });
  expect(listener).toHaveBeenCalledOnce();
  stop();
  navigate("/lobby");
  expect(listener).toHaveBeenCalledOnce();
});
it("replaces account entry and follows actual Back/Forward events", async () => {
  const visited: string[] = [];
  const stop = subscribeLocation(() => visited.push(getLocation().pathname));
  navigate("/register");
  navigate("/lobby", { replace: true });
  window.history.back();
  await waitFor(() => expect(getLocation().pathname).toBe("/login"));
  window.history.forward();
  await waitFor(() => expect(getLocation().pathname).toBe("/lobby"));
  expect(visited).toEqual(["/register", "/lobby", "/login", "/lobby"]);
  stop();
});
it.each([
  "https://outside.invalid/",
  "//outside.invalid/",
  "javascript:alert(1)",
  "/\\outside.invalid/",
  "/rooms/%5Coutside",
  "/login\n",
])("rejects nonlocal/ambiguous navigation %s", (to) => {
  expect(() => navigate(to)).toThrow("Invalid local navigation");
  expect(getLocation().pathname).toBe("/login");
});
it("re-evaluates the supplied session guard after Back returns to account entry", async () => {
  const { resolveRoute, guardRoute } = await import("./routes.js");
  navigate("/lobby");
  window.history.back();
  await waitFor(() => expect(getLocation().pathname).toBe("/login"));
  const location = getLocation();
  expect(
    guardRoute(resolveRoute(location.pathname, location.search), {
      status: "active-member",
    }),
  ).toEqual({ kind: "redirect", to: "/lobby", replace: true });
});
it("preserves only validated relative room/invite history intent through account pages and clears it after completion", () => {
  navigate("/login", { authDestination: "/rooms/join?token=fixture-invite" });
  navigate("/register");
  navigate("/onboarding");
  expect(getAuthDestination()).toBe("/rooms/join?token=fixture-invite");
  expect(window.history.state).toEqual({
    xiangqiAuthDestination: "/rooms/join?token=fixture-invite",
  });
  navigate("/rooms/join?token=fixture-invite", { authDestination: null });
  expect(getAuthDestination()).toBeNull();
});
it.each([
  "https://outside.invalid/rooms/x",
  "//outside.invalid/rooms/x",
  "/login",
  "/rooms/join?token=a&token=b",
  "/rooms/%5Cbad",
  "/rooms/x\n",
])("rejects forged history intent %s", (value) => {
  window.history.replaceState(
    { xiangqiAuthDestination: value },
    "",
    "/onboarding",
  );
  expect(getAuthDestination()).toBeNull();
});
