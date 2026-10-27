// @vitest-environment jsdom
import { createElement } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import { P2ScopePage } from "@web/app/P2ScopePage.js";

afterEach(cleanup);

it("points a signed-in member from a P2 route back to the lobby", () => {
  render(createElement(P2ScopePage, { route: "leaderboard", signedIn: true }));
  expect(screen.getByRole("link").getAttribute("href")).toBe("/lobby");
});

it("points an anonymous visitor from a P2 route to login", () => {
  render(
    createElement(P2ScopePage, { route: "forgot-password", signedIn: false }),
  );
  expect(screen.getByRole("link").getAttribute("href")).toBe("/login");
});
