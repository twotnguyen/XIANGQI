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
it("never offers playing-room seats through the gallery fallback", async () => {
  const props = callbacks();
  render(
    createElement(LobbyShell, {
      ...props,
      rooms: [{ ...room, status: "playing", seats: 1 }],
    }),
  );
  const list = screen.getByRole("region", { name: "Phòng công khai" });
  expect(within(list).queryByRole("button", { name: "Vào chơi" })).toBeNull();
  await userEvent
    .setup()
    .click(within(list).getByRole("button", { name: "Vào xem" }));
  expect(props.onJoinRoom).toHaveBeenCalledExactlyOnceWith(
    room.id,
    "spectator",
  );
});
it("canonical server admission flags override available local capacity", () => {
  render(
    createElement(LobbyShell, {
      ...callbacks(),
      rooms: [{ ...room, canPlay: false, canWatch: false }],
    }),
  );
  const list = screen.getByRole("region", { name: "Phòng công khai" });
  expect(within(list).queryByRole("button", { name: "Vào chơi" })).toBeNull();
  expect(within(list).queryByRole("button", { name: "Vào xem" })).toBeNull();
});
it("disconnect disables admission without discarding room labels and valid recovery restores actions", async () => {
  const props = callbacks();
  const view = render(
    createElement(LobbyShell, {
      ...props,
      rooms: [room],
      admissionReady: false,
    }),
  );
  const user = userEvent.setup();
  expect(screen.getByText(room.name)).toBeTruthy();
  for (const name of ["Vào chơi", "Vào xem"]) {
    const button = screen.getByRole("button", { name });
    expect(button.getAttribute("aria-disabled")).toBe("true");
    await user.click(button);
  }
  expect(props.onJoinRoom).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Chọn cấp độ máy" }));
  expect(props.onPlayAI).toHaveBeenCalledOnce();
  view.rerender(
    createElement(LobbyShell, {
      ...props,
      rooms: [room],
      admissionReady: true,
    }),
  );
  await user.click(screen.getByRole("button", { name: "Vào chơi" }));
  expect(props.onJoinRoom).toHaveBeenCalledExactlyOnceWith(room.id, "player");
});
it("pending admission disables all room joins and never changes seats optimistically", async () => {
  const props = callbacks(),
    second = { ...room, id: "second-room", name: "Hồ sen" };
  const view = render(
    createElement(LobbyShell, {
      ...props,
      rooms: [room, second],
      joiningRoomId: room.id,
    }),
  );
  const list = screen.getByRole("region", { name: "Phòng công khai" });
  expect(list.getAttribute("aria-busy")).toBe("true");
  for (const button of within(list).getAllByRole("button")) {
    expect(button.getAttribute("aria-disabled")).toBe("true");
    await userEvent.setup().click(button);
  }
  expect(props.onJoinRoom).not.toHaveBeenCalled();
  view.rerender(
    createElement(LobbyShell, {
      ...props,
      rooms: [room, second],
      joiningRoomId: null,
    }),
  );
  expect(
    within(list).getAllByRole("button", { name: "Vào chơi" }),
  ).toHaveLength(2);
  await userEvent
    .setup()
    .click(within(list).getAllByRole("button", { name: "Vào chơi" })[1]!);
  expect(props.onJoinRoom).toHaveBeenCalledExactlyOnceWith(second.id, "player");
});
it("preserves server room ordering and includes the frozen inline keyboard rules disclosure", async () => {
  const second = { ...room, id: "second", name: "A room" };
  render(createElement(LobbyShell, { ...callbacks(), rooms: [room, second] }));
  const list = screen.getByRole("region", { name: "Phòng công khai" });
  expect(
    within(list)
      .getAllByRole("heading", { level: 3 })
      .map((h) => h.textContent),
  ).toEqual([room.name, second.name]);
  const summary = screen.getByText("Luật chơi");
  expect(summary.tagName).toBe("SUMMARY");
  summary.focus();
  expect(document.activeElement).toBe(summary);
  await userEvent.setup().click(summary);
  expect(summary.closest("details")!.open).toBe(true);
  expect(screen.getByText(/Đây là bộ luật rút gọn/)).toBeTruthy();
  expect(document.querySelector("dialog")).toBeNull();
});
