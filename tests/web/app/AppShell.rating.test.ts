// @vitest-environment jsdom
import { createElement } from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { AppShell } from "@web/app/layouts/AppShell.js";

afterEach(cleanup);

it("tải Elo trước khi mở menu và giữ số liệu khi mở lại", async () => {
  const authorizedFetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ elo: 1200, completed: 0, wins: 0, draws: 0, losses: 0, tier: "Chưa xếp hạng", rank: null, remaining: 5 }),
  });
  const props = { title: "Sảnh", user: { displayName: "Kỳ thủ", guest: false }, authorizedFetch, ratingUserId: "user-a" };
  const view = render(createElement(AppShell, props, "Nội dung"));
  await waitFor(() => expect(authorizedFetch).toHaveBeenCalledTimes(1));
  const trigger = screen.getByRole("button", { name: "Tài khoản: Kỳ thủ" });
  fireEvent.click(trigger);
  expect(await screen.findByText(/1200 Elo.*cần thêm 5 ván/)).toBeTruthy();
  fireEvent.click(trigger);
  fireEvent.click(trigger);
  expect(screen.getByText(/1200 Elo.*cần thêm 5 ván/)).toBeTruthy();
  expect(authorizedFetch).toHaveBeenCalledTimes(1);

  authorizedFetch.mockReturnValueOnce(new Promise(() => {}));
  view.rerender(createElement(AppShell, { ...props, ratingUserId: "user-b" }, "Nội dung"));
  expect(screen.queryByText(/1200 Elo/)).toBeNull();
  expect(screen.getByText("Đang tải xếp hạng…")).toBeTruthy();
});
