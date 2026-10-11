// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LobbyShell, type PublicRoom } from "./LobbyShell.js";
afterEach(() => cleanup());
const room: PublicRoom = {
  id: "fixture-room",
  name: "Trà đình",
  hostName: "Kỳ hữu",
  hostGuest: true,
  timeMinutes: 10,
  status: "waiting",
  seats: 1,
  viewers: 1,
  spectatorLimit: 5,
};
const callbacks = () => ({
  onCreate: vi.fn(),
  onJoinCode: vi.fn(),
  onPlayAI: vi.fn(),
  onJoinRoom: vi.fn(),
  onRetry: vi.fn(),
});
it("invites players and spectators through separate callbacks with a Guest host label", async () => {
  const props = callbacks();
  render(createElement(LobbyShell, { ...props, rooms: [room] }));
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Vào chơi" }));
  await user.click(screen.getByRole("button", { name: "Vào xem" }));
  expect(props.onJoinRoom.mock.calls).toEqual([
    ["fixture-room", "player"],
    ["fixture-room", "spectator"],
  ]);
  expect(screen.getByText("Kỳ hữu (Khách)")).toBeTruthy();
});
it.each([
  { seats: 2 as const, viewers: 5, spectatorLimit: 5 },
  { seats: 2 as const, viewers: 0, spectatorLimit: 0 },
])("omits actions when no seats or spectator capacity remain", (props) => {
  render(
    createElement(LobbyShell, {
      ...callbacks(),
      rooms: [{ ...room, ...props }],
    }),
  );
  const list = screen.getByRole("region", { name: "Phòng công khai" });
  expect(within(list).queryByRole("button", { name: "Vào chơi" })).toBeNull();
  expect(within(list).queryByRole("button", { name: "Vào xem" })).toBeNull();
});
it("blocks unfinished P2 actions and dispatches an eight-character room code", async () => {
  const props = callbacks();
  render(createElement(LobbyShell, { ...props, rooms: [] }));
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Đánh hạng" }));
  expect(props.onCreate).not.toHaveBeenCalled();
  await user.type(screen.getByLabelText("Mã phòng"), "K7M2XQP4");
  await user.click(screen.getByRole("button", { name: "Vào phòng" }));
  expect(props.onJoinCode).toHaveBeenCalledWith("K7M2XQP4");
});
it("rejects a malformed code without invoking a room action", async () => {
  const props = callbacks();
  render(createElement(LobbyShell, { ...props, rooms: [] }));
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Mã phòng"), "ABC");
  await user.click(screen.getByRole("button", { name: "Vào phòng" }));
  expect(props.onJoinCode).not.toHaveBeenCalled();
  expect(screen.getByLabelText("Mã phòng").getAttribute("aria-invalid")).toBe(
    "true",
  );
  expect(
    screen.getByText(
      "Mã phòng gồm 8 chữ cái hoặc số. Kiểm tra lại rồi thử lại.",
    ),
  ).toBeTruthy();
});
it("keeps room names as text and offers the error retry callback", async () => {
  const props = callbacks();
  const { rerender } = render(
    createElement(LobbyShell, {
      ...props,
      rooms: [{ ...room, name: "<script>unsafe()</script>" }],
    }),
  );
  expect(screen.getByText("<script>unsafe()</script>")).toBeTruthy();
  expect(document.querySelector("script")).toBeNull();
  rerender(createElement(LobbyShell, { ...props, rooms: [], state: "error" }));
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Thử lại" }));
  expect(props.onRetry).toHaveBeenCalledOnce();
});
