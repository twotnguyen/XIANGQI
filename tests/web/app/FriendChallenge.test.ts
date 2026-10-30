// @vitest-environment jsdom
import { createElement } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { FriendChallenge } from "@web/app/FriendChallenge.js";
import type { FriendClient } from "@web/features/friends/friend-client.js";
import type { RoomClient } from "@web/features/rooms/room-client.js";

HTMLDialogElement.prototype.showModal = function () {
  this.setAttribute("open", "");
};
HTMLDialogElement.prototype.close = function () {
  this.removeAttribute("open");
};
afterEach(cleanup);
const peer = { userId: "friend-id", username: "kyhuu", displayName: "Kỳ hữu" };
const entry = { roomId: "room-id", role: "red" as const, version: 1 };
function setup() {
  const friends = {
    list: vi.fn().mockResolvedValue([{ ...peer, status: "online" }]),
    inviteState: vi
      .fn()
      .mockResolvedValue({ cooldownUntil: null, declines: [] }),
    invite: vi.fn().mockResolvedValue({ id: "invite-id" }),
  };
  const rooms = { create: vi.fn().mockResolvedValue(entry) };
  const onEntered = vi.fn(),
    onClose = vi.fn();
  render(
    createElement(FriendChallenge, {
      peer,
      friends: friends as unknown as FriendClient,
      rooms: rooms as unknown as RoomClient,
      onEntered,
      onClose,
    }),
  );
  return { friends, rooms, onEntered, onClose };
}
async function confirm() {
  fireEvent.click(await screen.findByRole("button", { name: "Tạo phòng" }));
}

it("does not create a room when the dialog is cancelled before confirmation", async () => {
  const app = setup();
  await screen.findByRole("button", { name: "Tạo phòng" });
  fireEvent.click(screen.getByRole("button", { name: "Huỷ" }));
  expect(app.onClose).toHaveBeenCalledOnce();
  expect(app.rooms.create).not.toHaveBeenCalled();
  expect(app.friends.invite).not.toHaveBeenCalled();
});
it("rechecks that the selected friend is still eligible before creating", async () => {
  const app = setup();
  app.friends.list.mockResolvedValue([{ ...peer, status: "in-match" }]);
  await confirm();
  expect(await screen.findByText(/hiện không thể nhận lời mời/)).toBeTruthy();
  expect(app.rooms.create).not.toHaveBeenCalled();
  expect(app.onEntered).not.toHaveBeenCalled();
});
it("does not create an orphan room while the sender cooldown is active", async () => {
  const app = setup();
  app.friends.inviteState.mockResolvedValue({
    cooldownUntil: new Date(Date.now() + 9000).toISOString(),
    declines: [],
  });
  await confirm();
  expect(await screen.findByText(/đang trong thời gian chờ/)).toBeTruthy();
  expect(app.rooms.create).not.toHaveBeenCalled();
  expect(app.onEntered).not.toHaveBeenCalled();
});
it("keeps an already-created room when the recipient becomes unavailable during creation", async () => {
  const app = setup();
  app.friends.invite.mockRejectedValue(new Error("PRIVATE_PROVIDER_MESSAGE"));
  await confirm();
  await waitFor(() =>
    expect(app.onEntered).toHaveBeenCalledWith(
      expect.objectContaining({
        roomId: entry.roomId,
        notice: expect.stringContaining("Phòng đã tạo và vẫn được giữ"),
      }),
    ),
  );
  expect(JSON.stringify(app.onEntered.mock.calls)).not.toContain(
    "PRIVATE_PROVIDER_MESSAGE",
  );
  expect(app.rooms.create).toHaveBeenCalledTimes(1);
});
it("reuses the first creation command after an ambiguous network error instead of creating another room", async () => {
  const app = setup();
  app.rooms.create.mockRejectedValueOnce(new TypeError("network interrupted"));
  await confirm();
  const retry = await screen.findByRole("button", {
    name: "Thử lại yêu cầu tạo phòng",
  });
  expect(app.onEntered).not.toHaveBeenCalled();
  expect(app.friends.invite).not.toHaveBeenCalled();
  expect(screen.queryByRole("button", { name: "Tạo phòng" })).toBeNull();
  fireEvent.click(retry);
  await waitFor(() =>
    expect(app.onEntered).toHaveBeenCalledWith(
      expect.objectContaining({ roomId: entry.roomId }),
    ),
  );
  expect(app.rooms.create.mock.calls[1]).toEqual(
    app.rooms.create.mock.calls[0],
  );
  expect(app.rooms.create.mock.calls[0]![1]).toMatch(/^[a-f0-9-]{36}$/);
});
