import { createElement, type ReactNode } from "react";
import { act, cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";
import { NavigationLink } from "@web/shared/navigation/NavigationLink.js";

export { mock };
const mock = vi.hoisted(() => ({
  state: { status: "anonymous" } as Record<string, unknown>,
  emailStatus: {
    status: "ready",
    email: "kythu@example.invalid",
    emailVerified: true,
    pendingEmail: null,
    expiresAt: null,
    resendAt: null,
  } as Record<string, unknown>,
  reloadEmailStatus: vi.fn(),
  accept: vi.fn(),
  refresh: vi.fn(),
  logout: vi.fn(),
  authorizedFetch: vi.fn(),
  guestFetch: vi.fn(),
  // Mirrors SessionProvider.sessionFetch: guest ? guestFetch : authorizedFetch.
  sessionFetch: vi.fn((path: string, init?: RequestInit) =>
    mock.state.status === "guest"
      ? mock.guestFetch(path, init)
      : mock.authorizedFetch(path, init),
  ),
  where: { kind: "none", roomId: null, matchId: null } as Record<
    string,
    unknown
  >,
  getRealtimeProof: vi.fn(),
  sockets: [] as {
    handlers: Map<string, (value?: unknown) => void>;
    closed: boolean;
    auth?: unknown;
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
      auth: undefined as unknown,
    };
    if (!_url.endsWith("/matchmaking")) mock.sockets.push(peer);
    return {
      on: (name: string, handler: (value?: unknown) => void) => {
        peer.handlers.set(name, handler);
      },
      connect: () =>
        options.auth((value) => {
          peer.auth = value;
        }),
      disconnect: () => {
        peer.closed = true;
        peer.handlers.get("disconnect")?.();
      },
      removeAllListeners: () => peer.handlers.clear(),
    };
  },
}));
export function feedRooms(rows: unknown[], index = mock.sockets.length - 1) {
  const socket = mock.sockets[index]!;
  act(() => {
    socket.handlers.get("connect")?.();
    socket.handlers.get("public.rooms")?.({
      rooms: rows,
      serverNow: "2026-10-11T01:00:00Z",
    });
  });
}
vi.mock("@web/features/auth/SessionProvider.js", () => ({
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
vi.mock("@web/features/auth/LoginPage.js", () => ({
  LoginPage: ({
    onLoggedIn,
    renderGoogle,
  }: {
    onLoggedIn: (value: unknown) => void;
    renderGoogle?: (remember: boolean, disabled: boolean) => ReactNode;
  }) =>
    createElement(
      "section",
      null,
      createElement("h1", null, "Đăng nhập"),
      createElement(NavigationLink, { href: "/register" }, "Đăng ký tài khoản"),
      renderGoogle?.(true, false),
      createElement(
        "button",
        { onClick: () => onLoggedIn({ fixture: "login" }) },
        "Hoàn tất đăng nhập",
      ),
      createElement(
        "button",
        { onClick: () => onLoggedIn({ fixture: "login", displaced: true }) },
        "Đăng nhập từ thiết bị mới",
      ),
    ),
}));
vi.mock("@web/features/auth/RegistrationPage.js", () => ({
  RegistrationPage: ({
    onRegistered,
    renderGoogle,
  }: {
    onRegistered: (value: unknown) => void;
    renderGoogle?: (disabled: boolean) => ReactNode;
  }) =>
    createElement(
      "section",
      null,
      createElement("h1", null, "Đăng ký"),
      createElement(NavigationLink, { href: "/login" }, "Về đăng nhập"),
      renderGoogle?.(false),
      createElement(
        "button",
        { onClick: () => onRegistered({ fixture: "registration" }) },
        "Hoàn tất đăng ký",
      ),
    ),
}));
vi.mock("@web/features/auth/GoogleSignInButton.js", () => ({
  GoogleSignInButton: ({ onResult }: { onResult: (result: unknown) => void }) =>
    createElement(
      "button",
      {
        onClick: () =>
          onResult({ kind: "pending", expiresAt: "2030-01-01T00:00:00Z" }),
      },
      "Official Google",
    ),
}));
vi.mock("@web/features/auth/GoogleOnboardingPage.js", () => ({
  GoogleOnboardingPage: ({
    onResult,
  }: {
    onResult: (result: unknown) => void;
  }) =>
    createElement(
      "section",
      null,
      createElement("h1", null, "Thiết lập tài khoản"),
      createElement(
        "button",
        {
          onClick: () => onResult({ kind: "member", fixture: "google-member" }),
        },
        "Hoàn tất thiết lập",
      ),
    ),
}));
vi.mock("@web/features/rooms/RoomPage.js", () => ({
  RoomPage: ({
    roomId,
    onLeft,
  }: {
    roomId: string;
    onLeft: (message?: string) => void;
  }) =>
    createElement(
      "section",
      null,
      createElement("h1", null, "Phòng chờ " + roomId),
      createElement(
        "button",
        { onClick: () => onLeft("Phòng đã đóng") },
        "Server closed fixture",
      ),
    ),
}));
vi.mock("@web/features/friends/FriendsPage.js", () => ({
  FriendsPage: () => createElement("h1", null, "Bạn bè"),
}));
vi.mock("@web/features/friends/FriendsBell.js", () => ({
  FriendsBell: () => null,
}));
vi.mock("@web/features/friends/DirectChatHub.js", () => ({
  DirectChatHub: () => null,
}));
vi.mock("@web/features/profile/AccountThemeSync.js", () => ({
  AccountThemeSync: () => null,
}));
vi.mock("@web/features/friends/FriendsPresence.js", () => ({
  FriendsPresence: () => null,
}));
vi.mock("@web/features/friends/RoomInvitePopup.js", () => ({
  RoomInvitePopup: () => null,
}));
vi.mock("@web/features/profile/profile-client.js", () => ({
  createProfileClient: () => ({
    read: async () => ({
      userId: "fixture-user",
      username: "fixture",
      email: "fixture@example.invalid",
      displayName: "Thành viên",
    }),
    updateDisplayName: async (displayName: string) => ({ displayName }),
    location: async () => mock.where,
  }),
}));
vi.mock("@web/features/profile/ProfilePage.js", () => ({
  ProfilePage: () => createElement("h1", null, "Hồ sơ"),
}));
export const member = {
  status: "active-member",
  userId: "fixture-user",
  username: "KyThu",
  expiresAt: "2030-01-01T00:00:00Z",
  remember: true,
};
export const room = {
  roomId: "11111111-1111-4111-8111-111111111111",
  name: "Kỳ hữu",
  host: { displayName: "Chủ phòng", isGuest: false },
  timeMinutes: 10,
  status: "waiting",
  emptySeats: 1,
  spectators: 0,
  viewerLimit: 5,
  canPlay: true,
  canWatch: true,
  publicOpenedAt: "2026-10-11T00:00:00Z",
};
export const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });
export const guest = {
  status: "guest",
  userId: "guest-user-1",
  displayName: "Lữ khách",
  expiresAt: "2030-01-01T12:00:00Z",
  deferred: false,
};
export function useAppRouterHooks() {
  beforeEach(() => {
    vi.clearAllMocks();
    mock.sockets.length = 0;
    mock.where = { kind: "none", roomId: null, matchId: null };
    mock.getRealtimeProof.mockResolvedValue({
      kind: "member",
      accessToken: "synthetic-bearer",
      appSession: "a".repeat(43),
    });
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute("open", "");
    };
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute("open");
    };
    mock.accept.mockReset();
    mock.logout.mockResolvedValue(undefined);
    mock.refresh.mockResolvedValue(undefined);
    mock.state = { status: "anonymous" };
    mock.authorizedFetch.mockResolvedValue(reply([]));
    mock.guestFetch.mockResolvedValue(reply([]));
    window.history.replaceState(null, "", "/login");
  });
  afterEach(() => cleanup());
}
