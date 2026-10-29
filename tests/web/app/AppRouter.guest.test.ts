// @vitest-environment jsdom
import { createElement } from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AppRouter } from "@web/app/AppRouter.js";
import { NavigationLink } from "@web/shared/navigation/NavigationLink.js";
import { GuestRequestError } from "@web/features/auth/SessionProvider.js";

const GUEST_CAPABILITY = "guest-capability-synthetic-0123456789abcdefghijk";

const mock = vi.hoisted(() => ({
  state: { status: "anonymous" } as Record<string, unknown>,
  emailStatus: { status: "idle" } as Record<string, unknown>,
  reloadEmailStatus: vi.fn(),
  accept: vi.fn(),
  refresh: vi.fn(),
  logout: vi.fn(),
  startGuest: vi.fn(),
  logoutGuest: vi.fn(),
  authorizedFetch: vi.fn(),
  guestFetch: vi.fn(),
  friendsPage: vi.fn(),
  // Mirrors SessionProvider.sessionFetch: guest ? guestFetch : authorizedFetch.
  sessionFetch: vi.fn((path: string, init?: RequestInit) =>
    mock.state.status === "guest"
      ? mock.guestFetch(path, init)
      : mock.authorizedFetch(path, init),
  ),
  getRealtimeProof: vi.fn(),
  sockets: [] as {
    handlers: Map<string, (value?: unknown) => void>;
    closed: boolean;
  }[],
}));

vi.mock("socket.io-client", () => ({
  io: (
    _url: string,
    options: { auth: (done: (value: unknown) => void) => void },
  ) => {
    const peer = {
      handlers: new Map<string, (value?: unknown) => void>(),
      closed: false,
    };
    mock.sockets.push(peer);
    return {
      on: (name: string, handler: (value?: unknown) => void) => {
        peer.handlers.set(name, handler);
      },
      connect: () => options.auth(() => undefined),
      disconnect: () => {
        peer.closed = true;
      },
      removeAllListeners: () => peer.handlers.clear(),
    };
  },
}));

vi.mock("@web/features/auth/SessionProvider.js", async (importOriginal) => ({
  ...(await importOriginal()),
  useSession: () => mock,
}));

vi.mock("@web/features/ai/ai-socket-client.js", () => ({
  connectAi: () => ({
    getControl: async () => ({
      tabId: "33333333-3333-4333-8333-333333333333",
      connectionId: "fixture-socket",
      generation: 1,
    }),
    refresh: async () => undefined,
    watch: async () => undefined,
    takeover: async () => undefined,
    disconnect: () => undefined,
  }),
}));

// LoginPage fixture: exposes the guest entry that the real page wires to onGuest.
vi.mock("@web/features/auth/LoginPage.js", () => ({
  LoginPage: ({ onGuest }: { onGuest?: () => void | Promise<void> }) =>
    createElement(
      "section",
      null,
      createElement("h1", null, "Đăng nhập"),
      createElement(NavigationLink, { href: "/register" }, "Đăng ký tài khoản"),
      createElement(
        "button",
        { onClick: () => void onGuest?.() },
        "Chơi nhanh với tư cách Khách (Guest)",
      ),
    ),
}));

vi.mock("@web/features/auth/RegistrationPage.js", () => ({
  RegistrationPage: () => createElement("h1", null, "Đăng ký"),
}));
vi.mock("@web/features/auth/GoogleSignInButton.js", () => ({
  GoogleSignInButton: () => null,
}));
vi.mock("@web/features/auth/GoogleOnboardingPage.js", () => ({
  GoogleOnboardingPage: () => null,
}));
vi.mock("@web/features/rooms/RoomPage.js", () => ({
  RoomPage: ({ roomId }: { roomId: string }) =>
    createElement("h1", null, "Phòng chờ " + roomId),
}));
vi.mock("@web/features/friends/FriendsPage.js", () => ({
  FriendsPage: () => {
    mock.friendsPage();
    return createElement("h1", null, "Bạn bè");
  },
}));
vi.mock("@web/features/friends/FriendsBell.js", () => ({
  FriendsBell: () => null,
}));
vi.mock("@web/features/friends/RoomInvitePopup.js", () => ({
  RoomInvitePopup: () => null,
}));
vi.mock("@web/features/profile/profile-client.js", () => ({
  createProfileClient: () => ({
    read: async () => ({ displayName: "Thành viên" }),
    updateDisplayName: async (displayName: string) => ({ displayName }),
    location: async () => ({ kind: "none", roomId: null, matchId: null }),
  }),
}));
vi.mock("@web/features/profile/ProfilePage.js", () => ({
  ProfilePage: ({ guest }: { guest: boolean }) =>
    createElement(
      "section",
      null,
      createElement("h1", null, "Hồ sơ"),
      guest ? createElement("p", null, "Khách chỉ có thể đăng xuất.") : null,
    ),
}));

const guest = {
  status: "guest",
  userId: "guest-user-1",
  displayName: "Lữ khách",
  expiresAt: "2030-01-01T12:00:00Z",
  deferred: false,
};
const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

beforeEach(() => {
  vi.clearAllMocks();
  mock.sockets.length = 0;
  mock.state = { status: "anonymous" };
  mock.logout.mockResolvedValue(undefined);
  mock.refresh.mockResolvedValue(undefined);
  mock.startGuest.mockResolvedValue(undefined);
  mock.logoutGuest.mockResolvedValue(undefined);
  mock.authorizedFetch.mockResolvedValue(reply([]));
  mock.guestFetch.mockResolvedValue(reply([]));
  mock.getRealtimeProof.mockResolvedValue({
    guestCapability: GUEST_CAPABILITY,
  });
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
  window.history.replaceState(null, "", "/login");
});

afterEach(() => cleanup());

it("shows the guest lobby with the Khách label and no friends or history entry", () => {
  mock.state = guest;
  window.history.replaceState(null, "", "/lobby");
  render(createElement(AppRouter));
  expect(screen.getByText(/\(Khách\)/)).toBeTruthy();
  expect(screen.queryByRole("link", { name: /Bạn bè/ })).toBeNull();
  expect(screen.queryByRole("link", { name: /Lịch sử/ })).toBeNull();
});

it("denies a Guest the friends page without loading it or fetching friend data", () => {
  mock.state = guest;
  window.history.replaceState(null, "", "/friends");
  render(createElement(AppRouter));
  // The access-denied panel renders instead of FriendsPage, so the page never loads.
  expect(
    screen.getByText("Phiên Khách không có quyền xem nội dung này."),
  ).toBeTruthy();
  expect(mock.friendsPage).not.toHaveBeenCalled();
  expect(mock.authorizedFetch).not.toHaveBeenCalled();
  expect(mock.sessionFetch).not.toHaveBeenCalled();
});

it("renders the Guest profile as logout-only", async () => {
  mock.state = guest;
  window.history.replaceState(null, "", "/settings");
  render(createElement(AppRouter));
  expect(await screen.findByText("Khách chỉ có thể đăng xuất.")).toBeTruthy();
  expect(mock.authorizedFetch).not.toHaveBeenCalled();
});

it("starts a Guest from login and resumes the invitation exactly once without exposing the capability", async () => {
  const roomId = "12345678-1234-4234-8234-123456789abc";
  window.history.replaceState(null, "", "/rooms/join?token=12345678");
  mock.startGuest.mockImplementation(async () => {
    mock.state = guest;
  });
  mock.guestFetch.mockResolvedValue(
    reply({ roomId, version: 2, role: "black", inviteCode: "12345678" }),
  );
  render(createElement(AppRouter));
  await vi.waitFor(() => expect(window.location.pathname).toBe("/login"));
  expect(mock.sessionFetch).not.toHaveBeenCalled();
  // LoginPage is lazy-loaded; wait for its guest entry before clicking.
  const guestEntry = await screen.findByRole("button", {
    name: /Chơi nhanh với tư cách Khách/,
  });
  await act(async () => {
    fireEvent.click(guestEntry);
  });
  fireEvent.change(
    await screen.findByRole("textbox", { name: "Tên hiển thị" }),
    {
      target: { value: "Lữ khách" },
    },
  );
  await act(async () => {
    fireEvent.click(screen.getByRole("button", { name: "Vào chơi" }));
  });
  await vi.waitFor(() =>
    expect(window.location.pathname).toBe(`/rooms/${roomId}`),
  );
  expect(mock.startGuest).toHaveBeenCalledOnce();
  expect(mock.sessionFetch).toHaveBeenCalledOnce();
  const [url, options] = mock.sessionFetch.mock.calls[0]!;
  expect(url).toBe("/rooms/join");
  expect(options).toMatchObject({ method: "POST" });
  expect(mock.authorizedFetch).not.toHaveBeenCalled();
  expect(window.location.href).not.toContain(GUEST_CAPABILITY);
});
async function signOutGuest() {
  window.history.replaceState(null, "", "/lobby");
  mock.state = guest;
  render(createElement(AppRouter));
  // Scope to the AppShell account menu; the Lobby has its own Đăng xuất button.
  fireEvent.click(
    await screen.findByRole("button", { name: "Tài khoản: Lữ khách" }),
  );
  const menu = await screen.findByRole("region", {
    name: "Tài khoản cá nhân",
  });
  await act(async () => {
    fireEvent.click(within(menu).getByRole("button", { name: /Đăng xuất/ }));
  });
}

it("asks a Guest to confirm the resign when the server requires it", async () => {
  mock.logoutGuest.mockRejectedValueOnce(
    new GuestRequestError(409, "GUEST_RESIGN_CONFIRM_REQUIRED"),
  );
  await signOutGuest();
  expect(
    await screen.findByText("Đăng xuất sẽ xin thua ván đang chơi"),
  ).toBeTruthy();
  expect(mock.logoutGuest).toHaveBeenCalledWith(false);
});

it("keeps the Guest in play when the resign dialog is cancelled", async () => {
  mock.logoutGuest.mockRejectedValueOnce(
    new GuestRequestError(409, "GUEST_RESIGN_CONFIRM_REQUIRED"),
  );
  await signOutGuest();
  fireEvent.click(await screen.findByRole("button", { name: "Ở lại" }));
  await vi.waitFor(() =>
    expect(
      screen.queryByText("Đăng xuất sẽ xin thua ván đang chơi"),
    ).toBeNull(),
  );
  expect(mock.logoutGuest).toHaveBeenCalledOnce();
  expect(mock.logoutGuest).toHaveBeenCalledWith(false);
});

it("confirms the resign and logs the Guest out with confirmedResign true", async () => {
  mock.logoutGuest.mockRejectedValueOnce(
    new GuestRequestError(409, "GUEST_RESIGN_CONFIRM_REQUIRED"),
  );
  await signOutGuest();
  fireEvent.click(
    await screen.findByRole("button", { name: "Xin thua và đăng xuất" }),
  );
  await vi.waitFor(() =>
    expect(mock.logoutGuest).toHaveBeenLastCalledWith(true),
  );
  expect(mock.logoutGuest).toHaveBeenCalledTimes(2);
});

it("shows the retry notice when a Guest logout fails for another reason", async () => {
  mock.logoutGuest.mockRejectedValueOnce(
    new GuestRequestError(503, "UNAVAILABLE"),
  );
  await signOutGuest();
  expect(
    await screen.findByText("Chưa thể đăng xuất. Vui lòng thử lại."),
  ).toBeTruthy();
  expect(screen.queryByText("Đăng xuất sẽ xin thua ván đang chơi")).toBeNull();
});
