// @vitest-environment jsdom
import { createElement } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, expect, test, vi } from "vitest";
import type { MatchmakingState } from "@xiangqi/shared";
import { MatchmakingModal, type Matchmaking } from "@web/features/matchmaking/index.js";

const show = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "showModal");
const close = Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, "close");
beforeEach(() => {
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", { configurable: true, value: function (this: HTMLDialogElement) { this.setAttribute("open", ""); } });
  Object.defineProperty(HTMLDialogElement.prototype, "close", { configurable: true, value: function (this: HTMLDialogElement) { this.removeAttribute("open"); } });
});
afterEach(() => {
  cleanup();
  if (show) Object.defineProperty(HTMLDialogElement.prototype, "showModal", show); else Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
  if (close) Object.defineProperty(HTMLDialogElement.prototype, "close", close); else Reflect.deleteProperty(HTMLDialogElement.prototype, "close");
});
const state: MatchmakingState = { bootId: "boot", serverNow: "2026-01-01T00:00:00Z", queueId: "queue", mode: "CASUAL", status: "CONFIRMING", startedAt: "2026-01-01T00:00:00Z", deadline: "2026-01-01T00:00:30Z", offerId: "offer", confirmed: false, roomId: null };
function queue(status: MatchmakingState["status"], error: string | null = null): Matchmaking {
  return { state: { ...state, status }, open: true, error, pending: false, connected: true, seconds: 30, join: vi.fn(), sync: vi.fn(), cancel: vi.fn(), confirm: vi.fn(), decline: vi.fn(), retry: vi.fn(), dismiss: vi.fn() };
}
test("closed queue does not add dialog content to the page", () => {
  const value = { ...queue("IDLE"), open: false };
  render(createElement(MatchmakingModal, { matchmaking: value }));
  expect(document.querySelector("dialog")).toBeNull();
  expect(screen.queryByText("Tìm trận")).toBeNull();
});
test("confirmation exposes only the choice and deadline, not an opponent identity", () => {
  const value = queue("CONFIRMING"); render(createElement(MatchmakingModal, { matchmaking: value }));
  expect(screen.getByText(/30 giây/)).toBeTruthy();
  expect(screen.queryByText(/Elo|@username|avatar/i)).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Xác nhận" }));
  fireEvent.click(screen.getByRole("button", { name: "Từ chối" }));
  expect(value.confirm).toHaveBeenCalledOnce(); expect(value.decline).toHaveBeenCalledOnce();
});
test("waiting and countdown do not allow a second confirmation", () => {
  const value = queue("WAITING"); const view = render(createElement(MatchmakingModal, { matchmaking: value }));
  expect(screen.getByText(/Đang chờ đối thủ/)).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Xác nhận" })).toBeNull();
  view.rerender(createElement(MatchmakingModal, { matchmaking: queue("COUNTDOWN") }));
  expect(screen.getByText(/sắp bắt đầu/)).toBeTruthy();
});
test("timed out, cancelled and errors offer retry and dismissal", () => {
  const value = queue("TIMED_OUT"); const view = render(createElement(MatchmakingModal, { matchmaking: value }));
  expect(screen.getByText(/Không tìm được đối thủ/)).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Thử lại" }));
  fireEvent.click(screen.getByRole("button", { name: "Đóng" }));
  expect(value.retry).toHaveBeenCalledOnce(); expect(value.dismiss).toHaveBeenCalledOnce();
  view.rerender(createElement(MatchmakingModal, { matchmaking: queue("CANCELLED") }));
  expect(screen.getByText(/Hàng đợi đã bị huỷ/)).toBeTruthy();
  view.rerender(createElement(MatchmakingModal, { matchmaking: queue("IDLE", "Mất kết nối") }));
  expect(screen.getByText("Mất kết nối")).toBeTruthy(); expect(screen.getByRole("button", { name: "Thử lại" })).toBeTruthy();
});

test.each(["SEARCHING", "CONFIRMING"] as const)("offline %s allows dismissal but not queue actions", (status) => {
  const value = { ...queue(status), connected: false };
  render(createElement(MatchmakingModal, { matchmaking: value }));
  expect(screen.getByText("Đang kết nối lại…")).toBeTruthy();
  const action = screen.getByRole("button", { name: status === "SEARCHING" ? "Hủy tìm trận" : "Xác nhận" });
  fireEvent.click(action);
  expect(status === "SEARCHING" ? value.cancel : value.confirm).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Đóng" }));
  expect(value.dismiss).toHaveBeenCalledOnce();
});
