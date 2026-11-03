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
  it("shows occupied and empty places according to the room capacity", () => {
    const { rerender, props } = panel();
    expect(screen.getByRole("img", { name: "Người xem A" })).toBeTruthy();
    expect(screen.getAllByRole("img", { name: /Chỗ xem trống/ })).toHaveLength(3);
    rerender(createElement(SpectatorsPanel, { ...props, limit: 2 }));
    expect(screen.queryByRole("img", { name: /Chỗ xem trống/ })).toBeNull();
  });
  it("lets a player select an empty place and blocks a lone host", async () => {
    const { props, rerender } = panel({ spectators: [], canMoveToSpectator: true });
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Chuyển sang xem tại chỗ 1" }));
    expect(props.onMoveToSpectator).toHaveBeenCalledOnce();
    rerender(createElement(SpectatorsPanel, { ...props, moveToSpectatorReason: "Cần người chơi khác" }));
    await user.click(screen.getByRole("button", { name: "Chuyển sang xem tại chỗ 1" }));
    expect(props.onMoveToSpectator).toHaveBeenCalledOnce();
  });
  it("opens actions only for the selected spectator and switches or closes on selection", async () => {
    const { props } = panel({ canInviteDown: true, canKick: true });
    const user = userEvent.setup();
    expect(screen.queryByRole("button", { name: "Đuổi" })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Người xem A" }));
    await user.click(screen.getByRole("button", { name: "Người xem B" }));
    await user.click(screen.getByRole("button", { name: "Mời xuống ghế" }));
    expect(props.onInviteDown).toHaveBeenCalledWith("w2");
    await user.click(screen.getByRole("button", { name: "Người xem B" }));
    expect(screen.queryByRole("button", { name: "Đuổi" })).toBeNull();
  });
  it("requires a named confirmation before kicking and defaults to cancel", async () => {
    const { props } = panel({ canKick: true });
    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: "Người xem A" }));
    await user.click(screen.getByRole("button", { name: "Đuổi" }));
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
    await userEvent.setup().click(screen.getByRole("button", { name: "Người xem B" }));
    await userEvent.setup().click(screen.getByRole("button", { name: "Mời xuống ghế" }));
    expect(props.onInviteDown).toHaveBeenCalledWith("w2");
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Chuyển sang xem tại chỗ 3" }));
    expect(props.onMoveToSpectator).toHaveBeenCalledOnce();
  });
  it("keeps the invite button disabled with a reason while an invite is pending or cooling down", async () => {
    panel({
      canInviteDown: true,
      downOfferInviteeId: "w1",
      inviteCooldownSeconds: 4,
    });
    await userEvent.setup().click(screen.getByRole("button", { name: "Người xem A" }));
    const first = screen.getByRole("button", { name: "Mời xuống ghế" });
    expect(first.getAttribute("aria-disabled")).toBe("true");
    expect(screen.getByText("Đang có lời mời xuống ghế chờ trả lời.")).toBeTruthy();
    cleanup();
    panel({ canInviteDown: true, inviteCooldownSeconds: 4 });
    await userEvent.setup().click(screen.getByRole("button", { name: "Người xem A" }));
    expect(screen.getByText("Chờ 4 giây để mời lại.")).toBeTruthy();
  });
});
