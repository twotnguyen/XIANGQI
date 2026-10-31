// @vitest-environment jsdom
import { expect, it, vi } from "vitest";
import { act, screen, within } from "@testing-library/react";
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
// Tab người xem thật luôn readonly/not_allowed; fixture này giữ đúng điều kiện đó.
const viewer = (over: Partial<RoomSnapshot["room"]> = {}): RoomSnapshot => ({
  ...open(over),
  role: "spectator",
  room: { ...open(over).room, hostId: "a" },
  control: { mode: "readonly", generation: 1, reason: "not_allowed" },
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
  [
    "a position held elsewhere",
    { occupiedElsewhere: true },
    "Bạn đang ở trong một ván/phòng khác",
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
    room: {
      ...snapshot.room,
      spectators: [],
      seatPlayers: {
        red: { userId: "a", displayName: "Chủ phòng", guest: false },
        black: { userId: "b", displayName: "Kỳ thủ Đen", guest: true },
      },
    },
  };
  const f = setup(state, { userId: "a" });
  await f.ready();
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Mời rời ghế" }));
  const dialog = screen.getByRole("dialog", { name: "Mời rời ghế" });
  expect(
    within(dialog).getByText(
      /Mời Kỳ thủ Đen \(Khách\) rời ghế\? Người này vẫn có thể vào lại phòng nếu phòng chưa bị khóa/,
    ),
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

it("locks Xin ngồi ghế for 10 s from the original deadline when a request times out locally", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(Date.parse(snapshot.serverNow));
  const state = viewer({ seatRequests: [request("w", 2)] });
  const f = setup(state, { userId: "w" });
  // findBy* would hang under fake timers, so connect and publish synchronously.
  act(() => {
    f.reconnect();
    f.publish(state);
  });
  expect(screen.getByText(/Đang chờ chủ phòng/)).toBeTruthy();
  act(() => {
    vi.advanceTimersByTime(3000);
  });
  expect(screen.getByText("Yêu cầu ngồi ghế đã hết hạn.")).toBeTruthy();
  const button = screen.getByRole("button", { name: "Xin ngồi ghế" });
  expect(button.getAttribute("aria-disabled")).toBe("true");
  expect(
    document.getElementById(button.getAttribute("aria-describedby")!)
      ?.textContent,
  ).toBe("Chờ 9 giây để xin lại");
  act(() => {
    vi.advanceTimersByTime(10000);
  });
  expect(
    screen
      .getByRole("button", { name: "Xin ngồi ghế" })
      .getAttribute("aria-disabled"),
  ).toBe("false");
  expect(f.client.requestSeat).not.toHaveBeenCalled();
});

it("tells the viewer when the host declined, not when the request merely expired", async () => {
  const f = setup(viewer({ seatRequests: [request("w", 30)] }), {
    userId: "w",
  });
  await f.ready();
  f.publish({
    ...viewer({ seatRequestCooldownUntil: "2026-10-11T00:00:10Z" }),
    version: 10,
  });
  expect(
    await screen.findByText("Chủ phòng đã từ chối yêu cầu ngồi ghế."),
  ).toBeTruthy();
});

it("locks Mời xuống ghế for the host 10 s after an unanswered invite times out", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(Date.parse(snapshot.serverNow));
  const state = open({
    downOffer: {
      id: "44444444-4444-4444-8444-444444444444",
      inviteeId: "w",
      expiresAt: request("w", 2).expiresAt,
    },
  });
  const f = setup(state, { userId: "a" });
  act(() => {
    f.reconnect();
    f.publish(state);
  });
  act(() => {
    vi.advanceTimersByTime(3000);
  });
  const [first] = screen.getAllByRole("button", { name: "Mời xuống ghế" });
  expect(first!.getAttribute("aria-disabled")).toBe("true");
  expect(screen.getAllByText("Chờ 9 giây để mời lại.").length).toBeGreaterThan(
    0,
  );
});
