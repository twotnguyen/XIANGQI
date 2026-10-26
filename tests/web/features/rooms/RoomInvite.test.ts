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
    copyStatus: "",
    onCopy: vi.fn(),
    ...overrides,
  };
  render(createElement(RoomInvite, props));
  return props;
}

describe("room invite", () => {
  it("shows the code and a join link that encodes it", () => {
    invite({ code: "12 34/56" });
    const section = screen.getByRole("region", {
      name: "Mời người vào phòng",
    });
    expect(section.querySelector("strong")?.textContent).toBe("12 34/56");
    expect(
      screen
        .getByRole("link", { name: "Đường dẫn mời vào phòng" })
        .getAttribute("href"),
    ).toBe("/rooms/join?token=12%2034%2F56");
  });

  it("copies on click and announces no status until there is one", async () => {
    const props = invite();
    expect(screen.queryByRole("status")).toBeNull();
    await userEvent.click(screen.getByRole("button", { name: "Sao chép mã" }));
    expect(props.onCopy).toHaveBeenCalledTimes(1);
  });

  it("announces the copy result politely", () => {
    invite({ copyStatus: "Đã sao chép mã phòng." });
    const status = screen.getByRole("status");
    expect(status.textContent).toBe("Đã sao chép mã phòng.");
    expect(status.getAttribute("aria-live")).toBe("polite");
  });

  it("blocks a second copy while one is in progress", async () => {
    const props = invite({ copying: true });
    const button = screen.getByRole("button", { name: "Đang xử lý…" });
    expect(button.getAttribute("aria-disabled")).toBe("true");
    await userEvent.click(button);
    expect(props.onCopy).not.toHaveBeenCalled();
  });
});
