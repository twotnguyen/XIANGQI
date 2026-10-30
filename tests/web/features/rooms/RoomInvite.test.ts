// @vitest-environment jsdom
import { createElement } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RoomInvite } from "@web/features/rooms/RoomInvite.js";

afterEach(cleanup);
HTMLDialogElement.prototype.showModal = function () {
  this.setAttribute("open", "");
};
HTMLDialogElement.prototype.close = function () {
  this.removeAttribute("open");
};

function invite(overrides: Record<string, unknown> = {}) {
  const props = {
    code: "12345678",
    copying: false,
    copied: null,
    copyStatus: "",
    onCopy: vi.fn(),
    onCopyLink: vi.fn(),
    ...overrides,
  };
  render(createElement(RoomInvite, props));
  return props;
}

async function open() {
  await userEvent.click(screen.getByRole("button", { name: "Mời vào phòng" }));
}

describe("room invite", () => {
  it("blocks a second copy while one is in progress", async () => {
    const props = invite({ copying: true });
    await open();
    const buttons = screen.getAllByRole("button", { name: /Sao chép/ });
    expect(
      buttons.every(
        (button) =>
          button.getAttribute("aria-disabled") === "true" ||
          (button as HTMLButtonElement).disabled,
      ),
    ).toBe(true);
    for (const button of buttons) await userEvent.click(button);
    expect(props.onCopy).not.toHaveBeenCalled();
    expect(props.onCopyLink).not.toHaveBeenCalled();
  });

  it("shows a read-only join link with the room code", async () => {
    invite();
    await open();
    const link = screen.getByDisplayValue(/\/rooms\/join\?token=12345678$/);
    expect(link).toHaveProperty("readOnly", true);
  });

  it("shows the friends tab only when a friends slot is provided", async () => {
    invite({ friends: createElement("p", null, "Danh sách bạn bè") });
    await open();
    await userEvent.click(screen.getByRole("tab", { name: "Bạn bè" }));
    expect(screen.getByText("Danh sách bạn bè")).toBeTruthy();
  });
});
