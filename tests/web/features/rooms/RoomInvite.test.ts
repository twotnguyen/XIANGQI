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
  await userEvent.click(screen.getByRole("button", { name: "Mời bạn bè" }));
}

describe("room invite", () => {
  it("blocks a second copy while one is in progress", async () => {
    const props = invite({ copying: true });
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

  it("opens the friends list directly without share tabs", async () => {
    invite({ friends: createElement("p", null, "Danh sách bạn bè") });
    await open();
    expect(screen.getByText("Danh sách bạn bè")).toBeTruthy();
    expect(screen.queryByRole("tablist")).toBeNull();
  });

  it("keeps quick sharing available when friends are unavailable", () => {
    invite();
    expect(screen.queryByRole("button", { name: "Mời bạn bè" })).toBeNull();
    expect(screen.getByRole("button", { name: "Sao chép mã" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Sao chép link" })).toBeTruthy();
  });
});
