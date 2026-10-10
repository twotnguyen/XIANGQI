// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { AppShell } from "./AppShell.js";
afterEach(() => cleanup());
it("provides a main skip target and working navigation addresses", () => {
  render(
    createElement(AppShell, {
      title: "Sảnh",
      user: { displayName: "Kỳ hữu", guest: false },
      children: "Nội dung",
    }),
  );
  expect(
    screen
      .getByRole("link", { name: "Bỏ qua điều hướng" })
      .getAttribute("href"),
  ).toBe("#xq-content");
  expect(screen.getByRole("main").id).toBe("xq-content");
  expect(
    screen.getByRole("link", { name: "Bạn bè" }).getAttribute("href"),
  ).toBe("/friends");
});
it("labels a Guest and blocks the friends entry", () => {
  render(
    createElement(AppShell, {
      title: "Sảnh",
      user: { displayName: "Khách thử", guest: true },
      children: "Nội dung",
    }),
  );
  expect(screen.getByText("Khách thử (Khách)")).toBeTruthy();
  expect(screen.queryByRole("link", { name: "Bạn bè" })).toBeNull();
  expect(
    screen
      .getByRole("button", { name: "Bạn bè" })
      .getAttribute("aria-disabled"),
  ).toBe("true");
});
