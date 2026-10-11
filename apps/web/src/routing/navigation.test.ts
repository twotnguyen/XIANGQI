// @vitest-environment jsdom
import { beforeEach, expect, it, vi } from "vitest";
import { waitFor } from "@testing-library/react";
import { getLocation, navigate, subscribeLocation } from "./navigation.js";
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
