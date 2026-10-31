// @vitest-environment jsdom
import { expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { RoomSnapshot } from "@xiangqi/shared";
import { setup, snapshot, useRoomPageHooks } from "./RoomPage.test-helper.js";
useRoomPageHooks();

const requestId = "55555555-5555-4555-8555-555555555555";
const watchers = [
  { userId: "w", displayName: "Xem một" },
  { userId: "g", displayName: "Khách xem", guest: true },
];
/** Host `a` ngồi Đỏ, ghế Đen trống, hai người xem. */
const open = (over: Partial<RoomSnapshot["room"]> = {}): RoomSnapshot => ({
  ...snapshot,
  version: 9,
  room: {
    ...snapshot.room,
    seats: { red: "a", black: null },
    connected: { red: true, black: false },
    spectators: watchers,
    ...over,
  },
});
const viewer = (over: Partial<RoomSnapshot["room"]> = {}): RoomSnapshot => ({
  ...open(over),
  role: "spectator",
  room: { ...open(over).room, hostId: "a" },
});
const request = (userId: string, seconds: number) => ({
  id: requestId,
  userId,
  expiresAt: new Date(
    Date.parse(snapshot.serverNow) + seconds * 1000,
  ).toISOString(),
});

it("lets a viewer ask for the free seat and shows the server wait afterwards", async () => {
  const f = setup(viewer(), { userId: "w" });
  await f.ready();
  f.client.requestSeat.mockResolvedValue(
    viewer({ seatRequests: [request("w", 30)] }),
  );
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Xin ngồi ghế" }));
  expect(f.client.requestSeat).toHaveBeenCalledExactlyOnceWith(
    "room",
    f.control,
  );
  expect(
    await screen.findByText(/Đang chờ chủ phòng · còn 30 giây/),
  ).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Xin ngồi ghế" })).toBeNull();
});

it.each([
  ["a full table", { seats: { red: "a", black: "b" } }, "Ghế đã đủ người"],
  [
    "a cooldown",
    { seatRequestCooldownUntil: "2026-10-11T00:00:07Z" },
    "Chờ 7 giây để xin lại",
  ],
  [
    "a countdown",
    { countdown: { token: "t", dueAt: "2026-10-11T00:00:03Z" } },
    "Phòng đang đếm ngược",
  ],
])(
  "keeps Xin ngồi ghế visible but disabled with the reason for %s",
  async (_name, over, reason) => {
    const f = setup(viewer(over as Partial<RoomSnapshot["room"]>), {
      userId: "w",
    });
    await f.ready();
    const button = screen.getByRole("button", { name: "Xin ngồi ghế" });
    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(
      document.getElementById(button.getAttribute("aria-describedby")!)
        ?.textContent,
    ).toBe(reason);
    await userEvent.setup().click(button);
    expect(f.client.requestSeat).not.toHaveBeenCalled();
  },
);

it("keeps Xin ngồi ghế away from players", async () => {
  const f = setup(open(), { userId: "a" });
  await f.ready();
  expect(screen.queryByRole("button", { name: "Xin ngồi ghế" })).toBeNull();
});

it("shows the host each request with the name, a countdown and Đồng ý / Từ chối", async () => {
  const f = setup(open({ seatRequests: [request("g", 30)] }), {
    userId: "a",
  });
  await f.ready();
  const list = screen.getByRole("list", { name: "Yêu cầu xin ngồi ghế" });
  expect(
    within(list).getByText("Khách xem (Khách) xin ngồi ghế · còn 30 giây"),
  ).toBeTruthy();
  f.client.respondSeatRequest.mockResolvedValue({
    ...open(),
    room: { ...open().room, seats: { red: "a", black: "g" }, spectators: [] },
  });
  await userEvent
    .setup()
    .click(within(list).getByRole("button", { name: "Đồng ý" }));
  expect(f.client.respondSeatRequest).toHaveBeenCalledExactlyOnceWith(
    "room",
    requestId,
    true,
    f.control,
  );
});

it("declines without seating, and hides requests from other viewers", async () => {
  const host = setup(open({ seatRequests: [request("w", 30)] }), {
    userId: "a",
  });
  await host.ready();
  host.client.respondSeatRequest.mockResolvedValue(open());
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Từ chối" }));
  expect(host.client.respondSeatRequest).toHaveBeenCalledExactlyOnceWith(
    "room",
    requestId,
    false,
    host.control,
  );
});

it("tells a viewer whose request closed because the seat filled", async () => {
  const f = setup(viewer({ seatRequests: [request("w", 30)] }), {
    userId: "w",
  });
  await f.ready();
  f.publish({
    ...viewer({ seats: { red: "a", black: "g" } }),
    version: 10,
  });
  expect(await screen.findByText("Ghế đã có người.")).toBeTruthy();
});

it("names spectators to everyone and shows a Guest tag", async () => {
  const f = setup(viewer(), { userId: "w" });
  await f.ready();
  const panel = screen.getByRole("region", { name: "Người xem" });
  expect(within(panel).getByText("Khách xem (Khách)")).toBeTruthy();
  expect(within(panel).queryByRole("button", { name: "Đuổi" })).toBeNull();
});

it("confirms Mời rời ghế by side, sends the command and cancel sends nothing", async () => {
  const state: RoomSnapshot = {
    ...snapshot,
    version: 11,
    room: { ...snapshot.room, spectators: [] },
  };
  const f = setup(state, { userId: "a" });
  await f.ready();
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Mời rời ghế" }));
  const dialog = screen.getByRole("dialog", { name: "Mời rời ghế" });
  expect(
    within(dialog).getByText(/vẫn có thể vào lại phòng nếu phòng chưa bị khóa/),
  ).toBeTruthy();
  await user.click(within(dialog).getByRole("button", { name: "Hủy" }));
  expect(f.client.inviteLeave).not.toHaveBeenCalled();
  f.client.inviteLeave.mockResolvedValue({
    ...state,
    room: { ...state.room, seats: { red: "a", black: null } },
  });
  await user.click(screen.getByRole("button", { name: "Mời rời ghế" }));
  await user.click(
    within(screen.getByRole("dialog", { name: "Mời rời ghế" })).getByRole(
      "button",
      { name: "Mời rời ghế" },
    ),
  );
  expect(f.client.inviteLeave).toHaveBeenCalledExactlyOnceWith(
    "room",
    11,
    "b",
    f.control,
  );
});

it("never offers Mời rời ghế to the second player", async () => {
  const f = setup({ ...snapshot, role: "black" }, { userId: "b" });
  await f.ready();
  expect(screen.queryByRole("button", { name: "Mời rời ghế" })).toBeNull();
});
