// @vitest-environment jsdom
import { createElement, type ReactNode } from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AppRouter } from "@web/app/AppRouter.js";
import type {
  ProfileLocation,
  ProfileView,
} from "@web/features/profile/profile-client.js";

const mock = vi.hoisted(() => ({
  state: {} as Record<string, unknown>,
  authorizedFetch: vi.fn(),
  sessionFetch: vi.fn(),
  logout: vi.fn(),
  logoutGuest: vi.fn(),
  accept: vi.fn(),
  refresh: vi.fn(),
  reloadEmailStatus: vi.fn(),
  getRealtimeProof: vi.fn(),
  emailStatus: {
    status: "ready",
    email: null,
    emailVerified: false,
    pendingEmail: null,
    expiresAt: null,
    resendAt: null,
  },
  profile: { read: vi.fn(), location: vi.fn() },
  saved: new Map<string, (name: string) => void>(),
  headerRenders: [] as { userId: string; name: string }[],
  aiMounts: [] as string[],
  creations: 0,
}));
vi.mock("@web/features/auth/SessionProvider.js", async (importOriginal) => ({
  ...(await importOriginal<
    typeof import("@web/features/auth/SessionProvider.js")
  >()),
  useSession: () => mock,
}));
vi.mock("@web/features/profile/profile-client.js", () => ({
  createProfileClient: () => {
    mock.creations++;
    return mock.profile;
  },
}));
vi.mock("@web/app/layouts/AppShell.js", () => ({
  AppShell: ({
    user,
    children,
    onLogout,
  }: {
    user: { displayName: string };
    children: ReactNode;
    onLogout: () => void;
  }) => {
    mock.headerRenders.push({
      userId: String(mock.state.userId),
      name: user.displayName,
    });
    return createElement(
      "div",
      null,
      createElement(
        "header",
        null,
        createElement("span", null, user.displayName),
        createElement("button", { onClick: onLogout }, "Đăng xuất header"),
      ),
      children,
    );
  },
}));
vi.mock("@web/features/profile/ProfilePage.js", () => ({
  ProfilePage: ({ onSaved }: { onSaved: (name: string) => void }) => {
    mock.saved.set(String(mock.state.userId), onSaved);
    return createElement("h1", null, "Hồ sơ");
  },
}));
vi.mock("@web/features/profile/AccountThemeSync.js", () => ({
  AccountThemeSync: () => null,
}));
vi.mock("@web/features/profile/EmailVerification.js", () => ({
  EmailVerification: () => null,
}));
vi.mock("@web/features/profile/EmailStatusBanner.js", () => ({
  EmailStatusBanner: () => null,
}));
vi.mock("@web/features/friends/FriendsBell.js", () => ({
  FriendsBell: () => null,
}));
vi.mock("@web/features/friends/FriendsPresence.js", () => ({
  FriendsPresence: () => null,
}));
vi.mock("@web/features/friends/RoomInvitePopup.js", () => ({
  RoomInvitePopup: () => null,
}));
vi.mock("@web/features/friends/DirectChatHub.js", () => ({
  DirectChatHub: () => null,
}));
vi.mock("@web/features/ai/AiGamePage.js", async () => {
  const { createElement, useState } = await import("react");
  return {
    AiGamePage: ({ gameId }: { gameId: string }) => {
      const [owner] = useState(() => {
        const value = String(mock.state.userId);
        mock.aiMounts.push(value);
        return value;
      });
      return createElement("h1", null, `Ván AI của ${owner}: ${gameId}`);
    },
  };
});

function member(userId: string) {
  return {
    status: "active-member",
    userId,
    username: `User${userId}`,
    expiresAt: "2030-01-01T00:00:00Z",
    remember: true,
  };
}
function profile(userId: string, displayName: string): ProfileView {
  return { userId, displayName, username: `User${userId}`, email: null };
}
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => (resolve = done));
  return { promise, resolve };
}
const none: ProfileLocation = { kind: "none", roomId: null, matchId: null };
beforeEach(() => {
  vi.clearAllMocks();
  mock.saved.clear();
  mock.headerRenders.length = 0;
  mock.creations = 0;
  mock.aiMounts.length = 0;
  mock.state = member("A");
  mock.profile.read.mockReset().mockResolvedValue(profile("A", "Tên A"));
  mock.profile.location.mockReset().mockResolvedValue(none);
  mock.logout.mockResolvedValue(undefined);
  mock.logoutGuest.mockResolvedValue(undefined);
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
  window.history.replaceState(null, "", "/settings");
});
afterEach(cleanup);

it("immediately hides A's cached header/location when B keeps the same status and client/fetch references", async () => {
  mock.profile.location.mockResolvedValue({
    kind: "playing-ai",
    roomId: null,
    matchId: "11111111-1111-4111-8111-111111111111",
  });
  const view = render(createElement(AppRouter));
  await screen.findByRole("heading", { name: "Hồ sơ" });
  await screen.findByText("Tên A");
  await waitFor(() => expect(mock.profile.location).toHaveBeenCalledTimes(1));
  const readB = deferred<ProfileView>(),
    locationB = deferred<ProfileLocation>();
  mock.profile.read.mockReturnValue(readB.promise);
  mock.profile.location.mockReturnValue(locationB.promise);
  const fetch = mock.authorizedFetch;
  mock.state = member("B");
  view.rerender(createElement(AppRouter));
  expect(within(screen.getByRole("banner")).queryByText("Tên A")).toBeNull();
  expect(within(screen.getByRole("banner")).getByText("UserB")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Đăng xuất header" }));
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(mock.logout).toHaveBeenCalledExactlyOnceWith(false);
  await waitFor(() => expect(mock.profile.read).toHaveBeenCalledTimes(2));
  expect(mock.profile.location).toHaveBeenCalledTimes(2);
  expect(mock.authorizedFetch).toBe(fetch);
  expect(mock.creations).toBe(1);
  expect(
    mock.headerRenders
      .filter((entry) => entry.userId === "B")
      .every((entry) => entry.name !== "Tên A"),
  ).toBe(true);
  await act(async () => {
    readB.resolve(profile("B", "Tên B"));
    locationB.resolve(none);
  });
  expect(await screen.findByText("Tên B")).toBeTruthy();
});

it("ignores delayed A profile/location responses and the captured A onSaved callback after B loads", async () => {
  const readA = deferred<ProfileView>(),
    locationA = deferred<ProfileLocation>();
  mock.profile.read.mockReturnValueOnce(readA.promise);
  mock.profile.location.mockReturnValueOnce(locationA.promise);
  const view = render(createElement(AppRouter));
  await screen.findByRole("heading", { name: "Hồ sơ" });
  await waitFor(() => expect(mock.profile.read).toHaveBeenCalledTimes(1));
  const savedA = mock.saved.get("A")!;
  mock.profile.read.mockResolvedValue(profile("B", "Tên B"));
  mock.profile.location.mockResolvedValue(none);
  mock.state = member("B");
  view.rerender(createElement(AppRouter));
  await screen.findByText("Tên B");
  await act(async () => {
    readA.resolve(profile("A", "Tên A trả chậm"));
    locationA.resolve({
      kind: "playing-online",
      roomId: "old-room",
      matchId: "old-game",
    });
  });
  act(() => savedA("Tên A lưu chậm"));
  expect(within(screen.getByRole("banner")).getByText("Tên B")).toBeTruthy();
  expect(screen.queryByText(/Tên A/)).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Đăng xuất header" }));
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(mock.logout).toHaveBeenCalledExactlyOnceWith(false);
  act(() => mock.saved.get("B")!("Tên B mới"));
  expect(
    within(screen.getByRole("banner")).getByText("Tên B mới"),
  ).toBeTruthy();
});

it("rejects a response whose profile userId differs from the actor that requested it", async () => {
  mock.state = member("B");
  mock.profile.read.mockResolvedValue(profile("A", "Tên A sai tài khoản"));
  render(createElement(AppRouter));
  await screen.findByRole("heading", { name: "Hồ sơ" });
  await waitFor(() => expect(mock.profile.read).toHaveBeenCalledTimes(1));
  expect(within(screen.getByRole("banner")).getByText("UserB")).toBeTruthy();
  expect(screen.queryByText("Tên A sai tài khoản")).toBeNull();
});

it("keeps a saved header name when an older profile lookup returns for the same actor", async () => {
  const read = deferred<ProfileView>();
  mock.profile.read.mockReturnValueOnce(read.promise);
  render(createElement(AppRouter));
  await screen.findByRole("heading", { name: "Hồ sơ" });
  await waitFor(() => expect(mock.profile.read).toHaveBeenCalledTimes(1));
  act(() => mock.saved.get("A")!("Tên vừa lưu"));
  expect(
    within(screen.getByRole("banner")).getByText("Tên vừa lưu"),
  ).toBeTruthy();
  await act(async () => read.resolve(profile("A", "Tên cũ trả chậm")));
  expect(
    within(screen.getByRole("banner")).getByText("Tên vừa lưu"),
  ).toBeTruthy();
  expect(screen.queryByText("Tên cũ trả chậm")).toBeNull();
});

it("hides A's pending resignation dialog when the signed-in actor changes to B", async () => {
  mock.profile.location.mockResolvedValue({
    kind: "playing-online",
    roomId: "old-room",
    matchId: "old-game",
  });
  const view = render(createElement(AppRouter));
  await screen.findByText("Tên A");
  await waitFor(() => expect(mock.profile.location).toHaveBeenCalledTimes(1));
  fireEvent.click(screen.getByRole("button", { name: "Đăng xuất header" }));
  expect(screen.getByRole("dialog")).toBeTruthy();
  const locationB = deferred<ProfileLocation>();
  mock.profile.read.mockResolvedValue(profile("B", "Tên B"));
  mock.profile.location.mockReturnValue(locationB.promise);
  mock.state = member("B");
  view.rerender(createElement(AppRouter));
  expect(screen.queryByRole("dialog")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Đăng xuất header" }));
  expect(mock.logout).toHaveBeenCalledExactlyOnceWith(false);
  await act(async () => locationB.resolve(none));
});

it("remounts private AI state when A changes to B on the same game route and fetch reference", async () => {
  const gameId = "11111111-1111-4111-8111-111111111111";
  window.history.replaceState(null, "", `/ai/${gameId}`);
  const view = render(createElement(AppRouter));
  await screen.findByRole("heading", { name: `Ván AI của A: ${gameId}` });
  mock.profile.read.mockResolvedValue(profile("B", "Tên B"));
  mock.state = member("B");
  view.rerender(createElement(AppRouter));
  expect(
    await screen.findByRole("heading", { name: `Ván AI của B: ${gameId}` }),
  ).toBeTruthy();
  expect(
    screen.queryByRole("heading", { name: `Ván AI của A: ${gameId}` }),
  ).toBeNull();
  expect(mock.aiMounts).toEqual(["A", "B"]);
});
