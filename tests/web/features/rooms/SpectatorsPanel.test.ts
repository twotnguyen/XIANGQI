// @vitest-environment jsdom
import { createElement } from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SpectatorsPanel } from "@web/features/rooms/SpectatorsPanel.js";

const showModal = vi.fn();
const close = vi.fn();
Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
  value: function (this: HTMLDialogElement) {
    showModal();
    this.setAttribute("open", "");
  },
  configurable: true,
});
Object.defineProperty(HTMLDialogElement.prototype, "close", {
  value: function (this: HTMLDialogElement) {
    close();
    this.removeAttribute("open");
  },
  configurable: true,
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
});

const spectators = [
  { userId: "w1", displayName: "Người xem A" },
  { userId: "w2", displayName: "Người xem B" },
];

function panel(overrides: Record<string, unknown> = {}) {
  const props = {
    spectators,
    limit: 5,
    selfId: "p1",
    canMoveToSpectator: false,
    canInviteDown: false,
    canKick: false,
    downOfferInviteeId: null,
    busy: false,
    onMoveToSpectator: vi.fn(),
    onInviteDown: vi.fn(),
    onRespondRequest: vi.fn(),
    onRequestSeat: vi.fn(),
    onKick: vi.fn(),
    ...overrides,
  };
  return { props, ...render(createElement(SpectatorsPanel, props)) };
}

describe("spectators panel", () => {
  it("shows the count over the capacity and hides actions from viewers", () => {
    panel();
    expect(screen.getByText("Người xem 2/5")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Đuổi" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Mời xuống ghế" })).toBeNull();
  });
  it("requires a named confirmation before kicking and defaults to cancel", async () => {
    const { props } = panel({ canKick: true });
    await userEvent
      .setup()
      .click(screen.getAllByRole("button", { name: "Đuổi" })[0]!);
    const dialog = screen.getByRole("dialog", { name: "Đuổi người xem" });
    expect(
      within(dialog).getByText("Người xem A", { exact: false }),
    ).toBeTruthy();
    expect(props.onKick).not.toHaveBeenCalled();
    await userEvent
      .setup()
      .click(within(dialog).getByRole("button", { name: "Đuổi khỏi phòng" }));
    expect(props.onKick).toHaveBeenCalledWith("w1");
  });
  it("lets the host invite a viewer down and a player move to spectator", async () => {
    const { props } = panel({
      canInviteDown: true,
      canMoveToSpectator: true,
    });
    await userEvent
      .setup()
      .click(screen.getAllByRole("button", { name: "Mời xuống ghế" })[1]!);
    expect(props.onInviteDown).toHaveBeenCalledWith("w2");
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Chuyển sang xem" }));
    expect(props.onMoveToSpectator).toHaveBeenCalledOnce();
  });
  it("labels Guests and shows the host each request with its countdown", async () => {
    const { props } = panel({
      spectators: [
        { userId: "w1", displayName: "Người xem A", guest: true },
        { userId: "w2", displayName: "Người xem B" },
      ],
      canInviteDown: true,
      canRespondRequests: true,
      seatRequests: [{ id: "q1", userId: "w1", seconds: 21 }],
    });
    const list = screen.getByRole("list", { name: "Yêu cầu xin ngồi ghế" });
    expect(
      within(list).getByText("Người xem A (Khách) xin ngồi ghế · còn 21 giây"),
    ).toBeTruthy();
    const user = userEvent.setup();
    await user.click(within(list).getByRole("button", { name: "Đồng ý" }));
    await user.click(within(list).getByRole("button", { name: "Từ chối" }));
    expect(props.onRespondRequest.mock.calls).toEqual([
      ["q1", true],
      ["q1", false],
    ]);
  });
  it("keeps the invite button disabled with a reason while an invite is pending or cooling down", () => {
    panel({
      canInviteDown: true,
      downOfferInviteeId: "w1",
      inviteCooldownSeconds: 4,
    });
    const [first] = screen.getAllByRole("button", { name: "Mời xuống ghế" });
    expect(first!.getAttribute("aria-disabled")).toBe("true");
    expect(
      screen.getAllByText("Đang có lời mời xuống ghế chờ trả lời."),
    ).toHaveLength(2);
    cleanup();
    panel({ canInviteDown: true, inviteCooldownSeconds: 4 });
    expect(screen.getAllByText("Chờ 4 giây để mời lại.")).toHaveLength(2);
  });
  it("gives a viewer a visible disabled Xin ngồi ghế or the waiting state, and never shows other requests", () => {
    panel({
      canRequestSeat: true,
      requestSeatReason: "Ghế đã đủ người",
      seatRequests: [{ id: "q2", userId: "w2", seconds: 9 }],
    });
    const ask = screen.getByRole("button", { name: "Xin ngồi ghế" });
    expect(ask.getAttribute("aria-disabled")).toBe("true");
    expect(screen.getByText("Ghế đã đủ người")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Đồng ý" })).toBeNull();
    cleanup();
    panel({
      canRequestSeat: true,
      selfId: "w2",
      seatRequests: [{ id: "q2", userId: "w2", seconds: 9 }],
    });
    expect(screen.getByText("Đang chờ chủ phòng · còn 9 giây")).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Xin ngồi ghế" })).toBeNull();
  });
});
