// @vitest-environment jsdom
import { expect, it } from "vitest";
import { screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { RoomSnapshot } from "@xiangqi/shared";
import { RoomRequestError } from "@web/features/rooms/room-client.js";
import {
  setup,
  playing,
  terminal,
  nativeDialogStub,
  useRoomPageHooks,
} from "./RoomPage.test-helper.js";
useRoomPageHooks();

it("keeps the authoritative final board and stops moves when the result arrives", async () => {
  nativeDialogStub();
  const f = setup(playing());
  await f.ready();
  f.publish(terminal());
  expect(screen.getByRole("dialog", { name: "Bạn thắng!" })).toBeTruthy();
  expect(
    screen.getByRole("group", { name: "Bàn cờ tướng — Đỏ ở phía dưới" }),
  ).toBeTruthy();
  expect(
    screen.queryByRole("button", { name: "Tốt đỏ, cột 1 hàng 7" }),
  ).toBeNull();
  expect(screen.getByRole("timer", { name: "Thời gian Đỏ" }).textContent).toBe(
    "10:00",
  );
  expect(f.command).not.toHaveBeenCalled();
});
it("Stay closes only this result and a duplicate or reconnect cannot reopen it", async () => {
  nativeDialogStub();
  const state = terminal();
  const f = setup(state);
  await f.ready();
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Ở lại phòng" }));
  expect(screen.queryByRole("dialog")).toBeNull();
  f.publish({ ...state, version: state.version + 1 });
  f.disconnect();
  f.reconnect();
  f.publish({ ...state, version: state.version + 2 });
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(f.client.leave).not.toHaveBeenCalled();
  expect(f.command).not.toHaveBeenCalled();
  f.publish({
    ...state,
    version: state.version + 3,
    match: { ...state.match!, id: "second-match" },
  });
  expect(screen.getByRole("dialog", { name: "Bạn thắng!" })).toBeTruthy();
});
it("result Leave waits for HTTP acknowledgement and uses the terminal room version", async () => {
  nativeDialogStub();
  const state = terminal();
  const f = setup(state);
  await f.ready();
  let finish!: (v: unknown) => void;
  f.client.leave.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  await userEvent
    .setup()
    .click(screen.getByRole("dialog").querySelectorAll("button")[1]!);
  expect(f.client.leave).toHaveBeenCalledExactlyOnceWith("room", state.version);
  expect(f.onLeft).not.toHaveBeenCalled();
  expect(
    screen
      .getByRole("button", { name: "Ở lại phòng" })
      .getAttribute("aria-disabled"),
  ).toBe("true");
  await act(async () => finish({ left: true }));
  expect(f.onLeft).toHaveBeenCalledOnce();
});
it("failed result Leave keeps the modal and reports the safe error inside it", async () => {
  nativeDialogStub();
  const f = setup(terminal());
  await f.ready();
  f.client.leave.mockRejectedValue(new Error("private-server-detail"));
  await userEvent
    .setup()
    .click(screen.getByRole("dialog").querySelectorAll("button")[1]!);
  expect(
    screen.getByRole("dialog").querySelector('[role="alert"]')?.textContent,
  ).toContain("Thao tác chưa thực hiện được");
  expect(screen.queryByText("private-server-detail")).toBeNull();
  expect(f.onLeft).not.toHaveBeenCalled();
});
it("spectator sees a neutral inline result and has no player Stay action", async () => {
  const state = terminal();
  const f = setup({
    ...state,
    role: "spectator",
    control: { mode: "readonly", generation: 0, reason: "not_allowed" },
  });
  await f.ready();
  expect(screen.getByRole("region", { name: "Kết quả ván cờ" })).toBeTruthy();
  expect(screen.getByRole("heading", { name: "Đỏ thắng" })).toBeTruthy();
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.queryByRole("button", { name: "Ở lại phòng" })).toBeNull();
  expect(f.command).not.toHaveBeenCalled();
});
it("a disconnected client waits for a fresh authoritative result before opening the modal", async () => {
  nativeDialogStub();
  const f = setup(playing());
  await f.ready();
  f.disconnect();
  f.publish(terminal());
  expect(screen.queryByRole("dialog", { name: "Bạn thắng!" })).toBeNull();
  f.reconnect();
  expect(screen.queryByRole("dialog", { name: "Bạn thắng!" })).toBeNull();
  f.publish(terminal());
  expect(screen.getByRole("dialog", { name: "Bạn thắng!" })).toBeTruthy();
});

it("a stale result Leave keeps the final board and modal until fresh realtime sync", async () => {
  nativeDialogStub();
  const state = terminal();
  const f = setup(state);
  await f.ready();
  f.client.leave.mockRejectedValue(new RoomRequestError("VERSION_STALE", 409));
  f.client.snapshot.mockResolvedValue({ ...state, version: state.version + 1 });
  let sync!: (value: RoomSnapshot) => void;
  f.refresh.mockImplementation(
    () =>
      new Promise((resolve) => {
        sync = resolve;
      }),
  );
  await userEvent
    .setup()
    .click(screen.getByRole("dialog").querySelectorAll("button")[1]!);
  expect(screen.getByRole("dialog", { name: "Bạn thắng!" })).toBeTruthy();
  expect(
    screen.getByRole("group", { name: "Bàn cờ tướng — Đỏ ở phía dưới" }),
  ).toBeTruthy();
  expect(f.refresh).toHaveBeenCalledOnce();
  expect(f.onLeft).not.toHaveBeenCalled();
  await act(async () => sync({ ...state, version: state.version + 1 }));
  expect(screen.getByRole("dialog")).toBeTruthy();
});
it("keeps the reconnect modal through bare transport reconnection until a fresh snapshot arrives", async () => {
  nativeDialogStub();
  const state = playing();
  const f = setup(state);
  await f.ready();
  f.disconnect();
  expect(
    screen.getByRole("dialog", { name: "Đang kết nối lại…" }),
  ).toBeTruthy();
  expect(screen.getByRole("timer", { name: "Thời gian Đỏ" })).toBeTruthy();
  f.reconnect();
  expect(
    screen.getByRole("dialog", { name: "Đang kết nối lại…" }),
  ).toBeTruthy();
  expect(
    screen.queryByRole("button", { name: "Tốt đỏ, cột 1 hàng 7" }),
  ).toBeNull();
  f.publish({ ...state, version: state.version + 1 });
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(
    screen.getByRole("button", { name: "Tốt đỏ, cột 1 hàng 7" }),
  ).toBeTruthy();
});
it("opponent reconnect notice uses canonical grace while the local board remains enabled", async () => {
  const state = playing();
  state.room.connected.black = false;
  state.room.graceUntil.black = "2026-10-11T00:01:00Z";
  const f = setup(state);
  await f.ready();
  expect(
    screen.getByRole("region", { name: "Trạng thái nối lại" }),
  ).toBeTruthy();
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(
    screen
      .getByRole("button", { name: "Tốt đỏ, cột 1 hàng 7" })
      .getAttribute("aria-disabled"),
  ).toBe("false");
  f.publish({
    ...state,
    version: state.version + 1,
    room: {
      ...state.room,
      connected: { red: true, black: true },
      graceUntil: { red: null, black: null },
    },
  });
  expect(
    screen.queryByRole("region", { name: "Trạng thái nối lại" }),
  ).toBeNull();
});
