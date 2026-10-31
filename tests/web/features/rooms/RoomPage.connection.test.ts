// @vitest-environment jsdom
import { expect, it, vi } from "vitest";
import { screen, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { snapshot, setup, useRoomPageHooks } from "./RoomPage.test-helper.js";
useRoomPageHooks();

it("returns to the lobby on trusted closure and ignores closure after unmount", async () => {
  const fixture = setup();
  await fixture.ready();
  fixture.closed();
  expect(fixture.onLeft).toHaveBeenCalledExactlyOnceWith("Phòng đã đóng");
  fixture.unmount();
  fixture.closed();
  expect(fixture.onLeft).toHaveBeenCalledTimes(1);
  expect(fixture.close).toHaveBeenCalledOnce();
});
it("Ready sends current version and remains server-controlled until acknowledgement", async () => {
  const guest = { ...snapshot, role: "black" as const };
  const fixture = setup(guest, { userId: "b" });
  fixture.command.mockResolvedValue({
    status: "ok",
    commandId: "c",
    snapshot: {
      ...guest,
      version: 4,
      room: { ...guest.room, ready: { red: false, black: true } },
    },
  });
  await fixture.ready();
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Sẵn sàng" }));
  expect(fixture.command).toHaveBeenCalledWith(
    { type: "room.ready", payload: { ready: true } },
    3,
  );
  expect(
    await screen.findByRole("button", { name: "Huỷ sẵn sàng" }),
  ).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Đổi ghế" })).toBeNull();
});
it("spectators and superseded tabs cannot issue Ready", async () => {
  const fixture = setup({
    ...snapshot,
    role: "spectator",
    control: { mode: "readonly", generation: 2, reason: "not_allowed" },
  });
  await fixture.ready();
  expect(screen.queryByRole("button", { name: "Sẵn sàng" })).toBeNull();
  expect(fixture.command).not.toHaveBeenCalled();
});
it("solo host switch uses room CAS and never gives itself a seat optimistically", async () => {
  const state = {
    ...snapshot,
    room: { ...snapshot.room, seats: { red: "a", black: null } },
  };
  const fixture = setup(state);
  await fixture.ready();
  fixture.client.switchSeat.mockRejectedValue(new Error("stale"));
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Đổi ghế" }));
  expect(fixture.client.switchSeat).toHaveBeenCalledWith(
    "room",
    3,
    fixture.control,
  );
  expect(fixture.client.switchSeat).toHaveBeenCalledTimes(1);
  expect(screen.getByText("Bạn · Đỏ")).toBeTruthy();
});
it("countdown expiry never creates a local game and disconnect removes the stale count", async () => {
  const fixture = setup({
    ...snapshot,
    room: {
      ...snapshot.room,
      ready: { red: true, black: true },
      countdown: { token: "start", dueAt: "2026-10-11T00:00:03Z" },
    },
  });
  await fixture.ready();
  vi.useFakeTimers();
  fixture.publish({
    ...snapshot,
    room: {
      ...snapshot.room,
      ready: { red: true, black: true },
      countdown: { token: "second", dueAt: "2026-10-11T00:00:03Z" },
    },
  });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(4000);
  });
  expect(screen.getByText("Đang chờ máy chủ xác nhận bắt đầu…")).toBeTruthy();
  expect(screen.queryByLabelText("Bàn cờ đang thi đấu")).toBeNull();
  fixture.disconnect();
  expect(screen.queryByLabelText("Đếm ngược bắt đầu ván")).toBeNull();
  fixture.reconnect();
  expect(screen.queryByLabelText("Đếm ngược bắt đầu ván")).toBeNull();
  expect(fixture.command).not.toHaveBeenCalled();
});
it("rejects late snapshots and updates host/seat only from newer server data", async () => {
  const fixture = setup();
  await fixture.ready();
  fixture.publish({
    ...snapshot,
    version: 5,
    room: { ...snapshot.room, hostId: "b", seats: { red: null, black: "b" } },
  });
  fixture.publish({ ...snapshot, version: 2 });
  expect(screen.getByText("Ghế Đỏ đang trống")).toBeTruthy();
  expect(screen.getByText("Người chơi Đen · Chủ phòng")).toBeTruthy();
});
it("a late socket snapshot cannot undo a newer HTTP seat switch", async () => {
  const solo = {
    ...snapshot,
    room: { ...snapshot.room, seats: { red: "a", black: null } },
  };
  const fixture = setup(solo);
  await fixture.ready();
  fixture.client.switchSeat.mockResolvedValue({
    ...solo,
    version: 4,
    role: "black",
    room: { ...solo.room, seats: { red: null, black: "a" } },
  });
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Đổi ghế" }));
  expect(screen.getByText("Bạn · Đen")).toBeTruthy();
  fixture.publish(solo);
  expect(screen.getByText("Bạn · Đen")).toBeTruthy();
});
