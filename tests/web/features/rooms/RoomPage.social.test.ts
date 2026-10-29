// @vitest-environment jsdom
import { expect, it, vi } from "vitest";
import { within, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { RoomSnapshot } from "@xiangqi/shared";
import { RoomRequestError } from "@web/features/rooms/room-client.js";
import {
  snapshot,
  setup,
  nativeDialogStub,
  useRoomPageHooks,
} from "./RoomPage.test-helper.js";
useRoomPageHooks();

it("proposes a side swap and shows the waiting state with withdraw", async () => {
  const fixture = setup();
  await fixture.ready();
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Xin đổi bên" }));
  expect(fixture.client.proposeSwap).toHaveBeenCalledWith("room", 3);
  expect(fixture.client.proposeSwap).toHaveBeenCalledTimes(1);
});
it("shows accept and decline to the responder with a countdown", async () => {
  const offer = {
    id: "33333333-3333-4333-8333-333333333333",
    proposerId: "b",
    responderId: "a",
    expiresAt: "2026-10-11T00:00:30Z",
  };
  const fixture = setup({
    ...snapshot,
    version: 4,
    room: { ...snapshot.room, swapOffer: offer },
  });
  await fixture.ready();
  expect(
    screen.getByText("Đối thủ muốn đổi bên Đỏ ↔ Đen.", { exact: false }),
  ).toBeTruthy();
  fixture.client.respondSwap.mockResolvedValue({
    ...snapshot,
    version: 5,
    room: {
      ...snapshot.room,
      seats: { red: "b", black: "a" },
      swapOffer: null,
      downOffer: null,
      spectators: [],
    },
  });
  await userEvent.setup().click(screen.getByRole("button", { name: "Đồng ý" }));
  expect(fixture.client.respondSwap).toHaveBeenCalledWith("room", 4, true);
});
it("maps swap cooldown failures to Vietnamese guidance", async () => {
  const fixture = setup();
  await fixture.ready();
  const { RoomRequestError } =
    await import("@web/features/rooms/room-client.js");
  fixture.client.proposeSwap.mockRejectedValue(
    new RoomRequestError("SWAP_COOLDOWN", 409),
  );
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Xin đổi bên" }));
  expect(
    await screen.findByText("Vừa bị từ chối hoặc hết hạn.", { exact: false }),
  ).toBeTruthy();
});
it("lists spectators with capacity and confirms a kick before calling the server", async () => {
  nativeDialogStub();
  const withViewers: RoomSnapshot = {
    ...snapshot,
    version: 6,
    room: {
      ...snapshot.room,
      hostId: "a",
      seats: { red: "a", black: "b" },
      spectators: [{ userId: "w1", displayName: "Người xem A" }],
    },
  };
  const fixture = setup(withViewers);
  await fixture.ready();
  expect(screen.getByText("Người xem 1/5")).toBeTruthy();
  await userEvent.setup().click(screen.getByRole("button", { name: "Đuổi" }));
  const dialog = screen.getByRole("dialog", { name: "Đuổi người xem" });
  expect(fixture.client.kickViewer).not.toHaveBeenCalled();
  await userEvent
    .setup()
    .click(within(dialog).getByRole("button", { name: "Đuổi khỏi phòng" }));
  expect(fixture.client.kickViewer).toHaveBeenCalledWith("room", 6, "w1");
});
it("answers a host seat invite as the invited viewer", async () => {
  const invited: RoomSnapshot = {
    ...snapshot,
    version: 7,
    role: "spectator",
    room: {
      ...snapshot.room,
      hostId: "a",
      seats: { red: "a", black: null },
      downOffer: {
        id: "44444444-4444-4444-8444-444444444444",
        inviteeId: "a",
        expiresAt: "2026-10-11T00:00:30Z",
      },
    },
  };
  const fixture = setup(invited);
  await fixture.ready();
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Chấp nhận" }));
  expect(fixture.client.respondDown).toHaveBeenCalledWith("room", 7, true);
});
it("moves a non-host player to spectator from the viewers panel", async () => {
  const guest: RoomSnapshot = {
    ...snapshot,
    version: 8,
    role: "black",
    room: { ...snapshot.room, hostId: "b", seats: { red: "b", black: "a" } },
  };
  const fixture = setup(guest);
  await fixture.ready();
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Chuyển sang xem" }));
  expect(fixture.client.toSpectator).toHaveBeenCalledWith("room", 8);
});
it("copies the room code or full invite URL without navigating and hides sharing when locked", async () => {
  const fixture = setup({
    ...snapshot,
    room: { ...snapshot.room, visibility: "CODE_ONLY", inviteCode: "70521348" },
  });
  await fixture.ready();
  expect(screen.getByText("70521348")).toBeTruthy();
  const u = userEvent.setup();
  const copied: string[] = [];
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: { writeText: vi.fn((value: string) => void copied.push(value)) },
  });
  await u.click(screen.getByRole("button", { name: "Sao chép mã" }));
  expect(copied).toEqual(["70521348"]);
  expect(
    within(screen.getByRole("button", { name: "Sao chép mã" })).getByRole(
      "img",
      {
        name: "Sao chép thành công",
      },
    ),
  ).toBeTruthy();
  const pathBeforeCopy = window.location.href;
  await u.click(screen.getByRole("button", { name: "Sao chép link" }));
  expect(copied).toEqual([
    "70521348",
    `${window.location.origin}/rooms/join?token=70521348`,
  ]);
  expect(window.location.href).toBe(pathBeforeCopy);
  expect(
    within(screen.getByRole("button", { name: "Sao chép link" })).getByRole(
      "img",
      {
        name: "Sao chép thành công",
      },
    ),
  ).toBeTruthy();
  expect(
    within(screen.getByRole("button", { name: "Sao chép mã" })).queryByRole(
      "img",
    ),
  ).toBeNull();
  fixture.publish({
    ...snapshot,
    version: 9,
    room: { ...snapshot.room, visibility: "LOCKED", inviteCode: null },
  });
  await waitFor(() => expect(screen.queryByText("70521348")).toBeNull());
});

it("reports a rejected clipboard write without navigating or claiming success", async () => {
  const fixture = setup({
    ...snapshot,
    room: { ...snapshot.room, visibility: "CODE_ONLY", inviteCode: "70521348" },
  });
  await fixture.ready();
  const u = userEvent.setup();
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: {
      writeText: vi.fn().mockRejectedValue(new Error("NotAllowedError")),
    },
  });
  const pathBeforeCopy = window.location.href;
  await u.click(screen.getByRole("button", { name: "Sao chép link" }));
  expect(
    await screen.findByText(
      "Chưa sao chép được link. Hãy thử lại hoặc chia sẻ mã phòng.",
    ),
  ).toBeTruthy();
  expect(screen.queryByRole("img", { name: "Sao chép thành công" })).toBeNull();
  expect(window.location.href).toBe(pathBeforeCopy);
  expect(
    screen
      .getByRole("button", { name: "Sao chép link" })
      .getAttribute("aria-disabled"),
  ).toBe("false");
});

it.each([
  ["ROOM_FORBIDDEN", 403, true],
  ["AUTH_REQUIRED", 401, false],
] as const)(
  "handles %s from Leave without confusing room access with login expiry",
  async (code, status, terminal) => {
    const f = setup();
    await f.ready();
    f.client.leave.mockRejectedValue(new RoomRequestError(code, status));
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Rời phòng" }));
    if (terminal) expect(f.onLeft).toHaveBeenCalledOnce();
    else {
      expect(f.onLeft).not.toHaveBeenCalled();
      expect(screen.getByRole("heading", { name: "Kỳ hữu" })).toBeTruthy();
    }
  },
);

it("allows manual reconnection after a failed admission without granting HTTP control", async () => {
  const f = setup();
  await f.ready();
  f.disconnect();
  f.error("Kết nối chưa sẵn sàng.");
  await screen.findByRole("heading", { name: "Kỳ hữu" });
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Thử lại" }));
  expect(screen.queryByRole("button", { name: "Sẵn sàng" })).toBeNull();
  await f.ready();
  expect(
    screen
      .getByRole("button", { name: "Sẵn sàng" })
      .getAttribute("aria-disabled"),
  ).not.toBe("true");
});
