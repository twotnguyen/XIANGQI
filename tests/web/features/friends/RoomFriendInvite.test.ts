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
import { RoomFriendInvite } from "@web/features/friends/RoomFriendInvite.js";
import {
  type FriendClient,
  FriendRequestError,
} from "@web/features/friends/friend-client.js";
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
const peers = [
  { userId: "a", username: "a", displayName: "Bạn A", status: "online" },
  { userId: "b", username: "b", displayName: "Bạn B", status: "online" },
];
it("uses one sender deadline for every recipient and refreshes decline feedback while the dialog is open", async () => {
  vi.useFakeTimers();
  const api = {
    list: vi.fn().mockResolvedValue(peers),
    inviteState: vi
      .fn()
      .mockResolvedValue({ cooldownUntil: null, declines: [] }),
    invite: vi
      .fn()
      .mockResolvedValue({
        id: "i",
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30000).toISOString(),
        cooldownUntil: new Date(Date.now() + 10000).toISOString(),
      }),
  } as unknown as FriendClient;
  render(createElement(RoomFriendInvite, { client: api, roomId: "R" }));
  await act(async () => {});
  fireEvent.click(
    within(screen.getAllByRole("listitem")[0]!).getByRole("button", {
      name: "Mời",
    }),
  );
  await act(async () => {});
  expect(
    screen
      .getAllByRole("button", { name: "Mời" })
      .every((b) => b.getAttribute("aria-disabled") === "true"),
  ).toBe(true);
  vi.mocked(api.inviteState).mockResolvedValue({
    cooldownUntil: new Date(Date.now() + 12000).toISOString(),
    declines: [
      {
        id: "d",
        inviteId: "i",
        displayName: "Bạn A",
        createdAt: new Date().toISOString(),
      },
    ],
  });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(2000);
  });
  expect(
    screen.getByText("Bạn A đã từ chối lời mời tham gia phòng."),
  ).toBeTruthy();
  await act(async () => {
    await vi.advanceTimersByTimeAsync(11000);
  });
  expect(
    screen
      .getAllByRole("button", { name: "Mời" })
      .every((b) => b.getAttribute("aria-disabled") === "false"),
  ).toBe(true);
});
it("does not claim success when sending fails", async () => {
  const api = {
    list: vi.fn().mockResolvedValue(peers),
    inviteState: vi
      .fn()
      .mockResolvedValue({ cooldownUntil: null, declines: [] }),
    invite: vi
      .fn()
      .mockRejectedValue(new FriendRequestError("FRIEND_OFFLINE", 409)),
  } as unknown as FriendClient;
  render(createElement(RoomFriendInvite, { client: api, roomId: "R" }));
  const items = await screen.findAllByRole("listitem");
  fireEvent.click(within(items[0]!).getByRole("button", { name: "Mời" }));
  expect(await screen.findByRole("alert")).toBeTruthy();
  expect(screen.queryByText(/Đã gửi lời mời/)).toBeNull();
});
