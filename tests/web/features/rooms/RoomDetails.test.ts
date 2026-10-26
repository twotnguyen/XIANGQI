// @vitest-environment jsdom
import { createElement } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { RoomDetails } from "@web/features/rooms/RoomDetails.js";
import type { RoomView } from "@web/features/rooms/room-client.js";

afterEach(cleanup);

function details(visibility: "PUBLIC" | "CODE_ONLY" | "LOCKED") {
  const room = {
    timeMinutes: 10,
    viewerLimit: 5,
    visibility,
  } as unknown as RoomView["room"];
  render(createElement(RoomDetails, { room }));
}

describe("room details", () => {
  it("lists the fixed time control, viewer limit and mode", () => {
    details("CODE_ONLY");
    expect(
      screen.getByRole("heading", { name: "Phòng của kỳ hữu" }),
    ).toBeTruthy();
    expect(screen.getByText("10 phút")).toBeTruthy();
    expect(screen.getByText("5")).toBeTruthy();
    expect(screen.getByText("Theo mã mời")).toBeTruthy();
    expect(
      screen.getByText("Thời gian và trần người xem đã cố định."),
    ).toBeTruthy();
    expect(screen.queryByText(/Mã mời đã bị khoá/)).toBeNull();
  });

  it("shows the public mode without the lock notice", () => {
    details("PUBLIC");
    expect(screen.getByText("Công khai")).toBeTruthy();
    expect(screen.queryByText(/Mã mời đã bị khoá/)).toBeNull();
  });

  it("warns that new people cannot join when the room is locked", () => {
    details("LOCKED");
    expect(screen.getByText("Đã khóa")).toBeTruthy();
    expect(
      screen.getByText("Mã mời đã bị khoá, người mới không vào được."),
    ).toBeTruthy();
  });
});
