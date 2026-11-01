// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { AppShell } from "@web/app/layouts/AppShell.js";
afterEach(() => cleanup());
it("shows the member's real ranking in the navbar but not for guests", async () => {
  const authorizedFetch = vi.fn().mockResolvedValue(new Response(JSON.stringify({ elo: 1240, completed: 5, wins: 3, draws: 1, losses: 1, tier: "Sơ cấp", rank: 7, remaining: 0 })));
  const props = { title: "Sảnh", children: "Nội dung", authorizedFetch };
  const view = render(createElement(AppShell, { ...props, user: { displayName: "Kỳ hữu", guest: false } }));
  expect(await screen.findByText(/1240 Elo.*#7/)).toBeTruthy();
  view.rerender(createElement(AppShell, { ...props, user: { displayName: "Khách", guest: true } }));
  expect(screen.queryByText(/1240 Elo/)).toBeNull();
});
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
  expect(
    screen.getByRole("link", { name: "Lịch sử" }).getAttribute("href"),
  ).toBe("/history");
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
  expect(screen.queryByRole("link", { name: "Lịch sử" })).toBeNull();
  expect(
    screen
      .getByRole("button", { name: "Lịch sử" })
      .getAttribute("aria-disabled"),
  ).toBe("true");
});
it("returns keyboard focus to the account trigger when Escape closes its panel", () => {
  render(
    createElement(AppShell, {
      title: "Sảnh",
      user: { displayName: "Kỳ hữu", guest: false },
      children: "Nội dung",
    }),
  );
  const trigger = screen.getByRole("button", { name: "Tài khoản: Kỳ hữu" });
  fireEvent.click(trigger);
  const panel = screen.getByRole("region", { name: "Tài khoản cá nhân" });
  const link = panel.querySelector("a")!;
  link.focus();
  fireEvent.keyDown(link, { key: "Escape" });
  expect(
    screen.queryByRole("region", { name: "Tài khoản cá nhân" }),
  ).toBeNull();
  expect(trigger.getAttribute("aria-expanded")).toBe("false");
  expect(document.activeElement).toBe(trigger);
});
