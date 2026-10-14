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
});
