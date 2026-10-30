// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { RoomInvitePopup } from "@web/features/friends/RoomInvitePopup.js";
import {
  FriendRequestError,
  type FriendClient,
  type RoomInvite,
} from "@web/features/friends/friend-client.js";

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
function invite(
  id: string,
  expiresAt = new Date(Date.now() + 30000).toISOString(),
): RoomInvite {
  return {
    id,
    roomId: `room-${id}`,
    roomName: `Phòng ${id}`,
    inviter: {
      userId: `sender-${id}`,
      username: `sender${id}`,
      displayName: `Người gửi ${id}`,
    },
    createdAt: new Date().toISOString(),
    expiresAt,
  };
}
function client(
  invites: RoomInvite[],
  respondInvite = vi
    .fn()
    .mockResolvedValue({ accepted: false, cooldownUntil: null }),
) {
  return {
    invites: vi.fn().mockResolvedValue(invites),
    inviteState: vi
      .fn()
      .mockResolvedValue({ cooldownUntil: null, declines: [] }),
    respondInvite,
  } as unknown as FriendClient;
}
it("shows independent invitations and Escape declines only the focused invitation", async () => {
  const api = client([invite("a"), invite("b")]);
  render(createElement(RoomInvitePopup, { client: api }));
  const cards = await screen.findAllByRole("region", {
    name: "Lời mời vào phòng",
  });
  expect(cards).toHaveLength(2);
  fireEvent.keyDown(
    within(cards[0]!).getByRole("button", { name: "Tham gia" }),
    { key: "Escape" },
  );
  await act(async () => {});
  expect(api.respondInvite).toHaveBeenCalledWith(
    "a",
    false,
    expect.any(String),
  );
  expect(
    screen.getAllByRole("region", { name: "Lời mời vào phòng" }),
  ).toHaveLength(1);
  expect(screen.getByText(/Người gửi b/)).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Từ chối lời mời" }));
  await act(async () => {});
  expect(api.respondInvite).toHaveBeenCalledWith("b", false, expect.any(String));
  expect(screen.queryByRole("region", { name: "Lời mời vào phòng" })).toBeNull();
});
it("keeps the source page and invitation after failed join, reusing its command on retry", async () => {
  const respond = vi
    .fn()
    .mockRejectedValueOnce(new FriendRequestError("ROOM_FULL", 409))
    .mockResolvedValueOnce({
      accepted: true,
      roomId: "B",
      version: 3,
      role: "black",
    });
  const api = client([invite("a")], respond),
    entered = vi.fn();
  render(createElement(RoomInvitePopup, { client: api, onEntered: entered }));
  fireEvent.click(await screen.findByRole("button", { name: "Tham gia" }));
  await screen.findByRole("alert");
  expect(entered).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Tham gia" }));
  await act(async () => {});
  expect(respond.mock.calls[0]![2]).toBe(respond.mock.calls[1]![2]);
  expect(entered).toHaveBeenCalledExactlyOnceWith({
    accepted: true,
    roomId: "B",
    version: 3,
    role: "black",
  });
});
it("expires at the original deadline without manufacturing a decline", async () => {
  vi.useFakeTimers();
  const api = client([invite("a", new Date(Date.now() + 1500).toISOString())]);
  render(createElement(RoomInvitePopup, { client: api }));
  await act(async () => {});
  expect(screen.getByRole("button", { name: "Tham gia" })).toBeTruthy();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(2000);
  });
  expect(screen.queryByRole("button", { name: "Tham gia" })).toBeNull();
  expect(api.respondInvite).not.toHaveBeenCalled();
});
