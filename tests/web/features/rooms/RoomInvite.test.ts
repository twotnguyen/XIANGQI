// @vitest-environment jsdom
import { createElement } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RoomInvite } from "@web/features/rooms/RoomInvite.js";

afterEach(cleanup);

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

describe("room invite", () => {
  it("blocks a second copy while one is in progress", async () => {
    const props = invite({ copying: true });
    const buttons = screen.getAllByRole("button");
    expect(
      buttons.every(
        (button) => button.getAttribute("aria-disabled") === "true",
      ),
    ).toBe(true);
    for (const button of buttons) await userEvent.click(button);
    expect(props.onCopy).not.toHaveBeenCalled();
    expect(props.onCopyLink).not.toHaveBeenCalled();
  });
});
