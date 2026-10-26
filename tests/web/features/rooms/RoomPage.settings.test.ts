// @vitest-environment jsdom
import { expect, it } from "vitest";
import { screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RoomRequestError } from "@web/features/rooms/room-client.js";
import {
  snapshot,
  setup,
  playing,
  clockState,
  terminal,
  useRoomPageHooks,
} from "./RoomPage.test-helper.js";
useRoomPageHooks();

it("only the connected host sees room settings, including during a match", async () => {
  const f = setup(clockState());
  await f.ready();
  expect(screen.getByRole("button", { name: "Cài đặt phòng" })).toBeTruthy();
  f.publish({
    ...clockState(),
    version: 4,
    room: { ...clockState().room, hostId: "b" },
  });
  expect(screen.queryByRole("button", { name: "Cài đặt phòng" })).toBeNull();
});
it("mode save uses current CAS, waits for canonical HTTP and hides the old invite on lock", async () => {
  const f = setup();
  await f.ready();
  let finish!: (value: typeof snapshot) => void;
  f.client.changeVisibility.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const u = userEvent.setup();
  await u.click(screen.getByRole("button", { name: "Cài đặt phòng" }));
  await u.click(screen.getByRole("radio", { name: /Khóa phòng/ }));
  await u.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
  await u.click(screen.getByRole("button", { name: "Khóa phòng" }));
  expect(f.client.changeVisibility).toHaveBeenCalledExactlyOnceWith(
    "room",
    3,
    "LOCKED",
  );
  expect(screen.getByText("70521348")).toBeTruthy();
  await act(async () =>
    finish({
      ...snapshot,
      version: 4,
      room: { ...snapshot.room, visibility: "LOCKED", inviteCode: null },
    }),
  );
  expect(screen.queryByText("70521348")).toBeNull();
  expect(f.refresh).toHaveBeenCalledOnce();
  expect(f.command).not.toHaveBeenCalled();
});
it("an obsolete settings ACK cannot overwrite a newer host or mode", async () => {
  const f = setup();
  await f.ready();
  let finish!: (value: typeof snapshot) => void;
  f.client.changeVisibility.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const u = userEvent.setup();
  await u.click(screen.getByRole("button", { name: "Cài đặt phòng" }));
  await u.click(screen.getByRole("radio", { name: /Công khai/ }));
  await u.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
  f.publish({
    ...snapshot,
    version: 5,
    room: {
      ...snapshot.room,
      hostId: "b",
      visibility: "LOCKED",
      inviteCode: null,
    },
  });
  await act(async () =>
    finish({
      ...snapshot,
      version: 4,
      room: { ...snapshot.room, visibility: "PUBLIC" },
    }),
  );
  expect(screen.queryByText("70521348")).toBeNull();
  expect(screen.queryByRole("button", { name: "Cài đặt phòng" })).toBeNull();
});
it("unlock displays only the new server invite", async () => {
  const f = setup({
    ...snapshot,
    room: { ...snapshot.room, visibility: "LOCKED", inviteCode: null },
  });
  await f.ready();
  f.client.changeVisibility.mockResolvedValue({
    ...snapshot,
    version: 4,
    room: { ...snapshot.room, inviteCode: "90125374" },
  });
  const u = userEvent.setup();
  await u.click(screen.getByRole("button", { name: "Cài đặt phòng" }));
  await u.click(screen.getByRole("radio", { name: /Chỉ qua mã/ }));
  await u.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
  expect(await screen.findByText("90125374")).toBeTruthy();
  expect(screen.queryByText("70521348")).toBeNull();
});

it("settings uses the latest room version while open and preserves the mode on a failed save", async () => {
  const f = setup();
  await f.ready();
  const u = userEvent.setup();
  await u.click(screen.getByRole("button", { name: "Cài đặt phòng" }));
  f.publish({ ...snapshot, version: 7 });
  f.client.changeVisibility.mockRejectedValue(
    new RoomRequestError("VERSION_STALE", 409),
  );
  f.refresh.mockResolvedValue({ ...snapshot, version: 8 });
  await u.click(screen.getByRole("radio", { name: /Công khai/ }));
  await u.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
  expect(f.client.changeVisibility).toHaveBeenCalledExactlyOnceWith(
    "room",
    7,
    "PUBLIC",
  );
  expect(await screen.findByText(/Chế độ hiện tại: Chỉ qua mã/)).toBeTruthy();
  expect(screen.getByRole("dialog").textContent).toContain("Phòng đã thay đổi");
  expect(screen.getByText("70521348")).toBeTruthy();
});
it("a settings ACK after disconnect is ignored even after bare reconnect", async () => {
  const f = setup();
  await f.ready();
  let finish!: (v: typeof snapshot) => void;
  f.client.changeVisibility.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const u = userEvent.setup();
  await u.click(screen.getByRole("button", { name: "Cài đặt phòng" }));
  await u.click(screen.getByRole("radio", { name: /Công khai/ }));
  await u.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
  f.disconnect();
  f.reconnect();
  await act(async () =>
    finish({
      ...snapshot,
      version: 4,
      room: { ...snapshot.room, visibility: "PUBLIC" },
    }),
  );
  expect(screen.queryByText("Đã cập nhật chế độ phòng.")).toBeNull();
  expect(f.refresh).not.toHaveBeenCalled();
  expect(screen.getByText(/Chế độ hiện tại: Chỉ qua mã/)).toBeTruthy();
});

it("closes settings when the authoritative match result arrives", async () => {
  const f = setup(playing());
  await f.ready();
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Cài đặt phòng" }));
  f.publish(terminal());
  expect(screen.getByRole("dialog", { name: "Bạn thắng!" })).toBeTruthy();
  expect(screen.queryByRole("dialog", { name: "Cài đặt phòng" })).toBeNull();
});
