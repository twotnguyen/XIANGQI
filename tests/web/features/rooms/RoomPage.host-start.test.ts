// @vitest-environment jsdom
import { expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { snapshot, setup, useRoomPageHooks } from "./RoomPage.test-helper.js";
useRoomPageHooks();

const blocked = (name: string) =>
  screen.getByRole("button", { name }).getAttribute("aria-disabled");
const opponentReady = {
  ...snapshot,
  room: { ...snapshot.room, ready: { red: false, black: true } },
};

it("Host chỉ thấy Bắt đầu: DISABLED khi đối thủ chưa Sẵn sàng (AC-YC2-RV-01)", async () => {
  const f = setup();
  await f.ready();
  expect(screen.queryByRole("button", { name: "Sẵn sàng" })).toBeNull();
  expect(blocked("Bắt đầu")).toBe("true");
  expect(screen.getByText("Chờ đối thủ sẵn sàng")).toBeTruthy();
});

it("Host ngồi một mình thấy Bắt đầu bị khóa kèm lý do (AC-YC2-RV-01)", async () => {
  const f = setup({
    ...snapshot,
    room: { ...snapshot.room, seats: { red: "a", black: null } },
  });
  await f.ready();
  expect(blocked("Bắt đầu")).toBe("true");
  expect(screen.getByText("Chờ người chơi thứ hai")).toBeTruthy();
});

it("Bắt đầu sáng ngay khi đối thủ Sẵn sàng và gửi room.start (AC-YC2-RV-02/03)", async () => {
  const f = setup();
  await f.ready();
  expect(blocked("Bắt đầu")).toBe("true");
  f.publish({ ...opponentReady, version: 4 });
  expect(blocked("Bắt đầu")).toBe("false");
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Bắt đầu" }));
  expect(f.command).toHaveBeenCalledWith(
    { type: "room.start", payload: {} },
    4,
  );
  f.publish({
    ...opponentReady,
    version: 5,
    room: { ...opponentReady.room, ready: { red: false, black: false } },
  });
  expect(blocked("Bắt đầu")).toBe("true");
});

it("người chơi thứ hai chỉ thấy Sẵn sàng, không có Bắt đầu hay Nhường Host", async () => {
  const f = setup({ ...snapshot, role: "black" }, { userId: "b" });
  await f.ready();
  expect(screen.getByRole("button", { name: "Sẵn sàng" })).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Bắt đầu" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Nhường Host" })).toBeNull();
});

it("Nhường Host cần xác nhận rồi gọi API một lần (AC-YC2-RV-06)", async () => {
  const f = setup();
  f.client.transferHost.mockResolvedValue({ ...snapshot, version: 4 });
  await f.ready();
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Nhường Host" }));
  expect(f.client.transferHost).not.toHaveBeenCalled();
  await user.click(
    screen.getByRole("button", { name: "Xác nhận nhường Host" }),
  );
  expect(f.client.transferHost).toHaveBeenCalledExactlyOnceWith(
    "room",
    3,
    f.control,
  );
});

it("không có Nhường Host khi ngồi một mình hoặc đang đếm (AC-YC2-RV-07)", async () => {
  const solo = setup({
    ...snapshot,
    room: { ...snapshot.room, seats: { red: "a", black: null } },
  });
  await solo.ready();
  expect(screen.queryByRole("button", { name: "Nhường Host" })).toBeNull();
  solo.unmount();
  const counting = setup({
    ...snapshot,
    room: {
      ...snapshot.room,
      ready: { red: true, black: true },
      countdown: { token: "t", dueAt: "2026-10-11T00:00:03Z" },
    },
  });
  await counting.ready();
  expect(screen.queryByRole("button", { name: "Nhường Host" })).toBeNull();
});
