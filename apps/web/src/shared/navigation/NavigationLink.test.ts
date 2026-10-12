// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, beforeEach, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NavigationLink } from "./NavigationLink.js";
afterEach(() => cleanup());
beforeEach(() => window.history.replaceState(null, "", "/login"));
it("navigates a real anchor by primary click without a document load", async () => {
  render(createElement(NavigationLink, { href: "/register" }, "Đăng ký"));
  expect(screen.getByRole("link").getAttribute("href")).toBe("/register");
  await userEvent.setup().click(screen.getByRole("link"));
  expect(window.location.pathname).toBe("/register");
});
it("respects a caller-cancelled click", async () => {
  render(
    createElement(
      NavigationLink,
      { href: "/register", onClick: (event) => event.preventDefault() },
      "Đăng ký",
    ),
  );
  await userEvent.setup().click(screen.getByRole("link"));
  expect(window.location.pathname).toBe("/login");
});
it.each([
  { ctrlKey: true },
  { metaKey: true },
  { shiftKey: true },
  { altKey: true },
  { button: 1 },
])("preserves native modified-click behavior %o", (options) => {
  render(createElement(NavigationLink, { href: "/register" }, "Đăng ký"));
  let intercepted: boolean | undefined;
  // Observe React's decision, then cancel jsdom's unimplemented native tab load.
  document.addEventListener(
    "click",
    (event) => {
      intercepted = event.defaultPrevented;
      event.preventDefault();
    },
    { once: true },
  );
  fireEvent.click(screen.getByRole("link"), options);
  expect(intercepted).toBe(false);
  expect(window.location.pathname).toBe("/login");
});
it.each([
  { href: "https://outside.invalid/" },
  { href: "/register", target: "_blank" },
  { href: "/register", download: "fixture.txt" },
  { href: "#content" },
])("leaves external/target/download/fragment anchors native %o", (props) => {
  render(createElement(NavigationLink, props, "Liên kết"));
  let intercepted: boolean | undefined;
  document.addEventListener(
    "click",
    (event) => {
      intercepted = event.defaultPrevented;
      event.preventDefault();
    },
    { once: true },
  );
  fireEvent.click(screen.getByRole("link"));
  expect(intercepted).toBe(false);
  expect(window.location.pathname).toBe("/login");
});
