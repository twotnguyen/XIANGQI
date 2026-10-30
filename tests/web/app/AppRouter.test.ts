// @vitest-environment jsdom
import { createElement, StrictMode, type ReactNode } from "react";
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
import { navigate } from "@web/shared/navigation/navigation.js";
import { NavigationLink } from "@web/shared/navigation/NavigationLink.js";
import {
  initialPosition,
  playMove,
  serializePosition,
} from "@xiangqi/xiangqi-core";
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
    mock.sockets.push(peer);
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
function feedRooms(rows: unknown[], index = mock.sockets.length - 1) {
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
const member = {
  status: "active-member",
  userId: "fixture-user",
  username: "KyThu",
  expiresAt: "2030-01-01T00:00:00Z",
  remember: true,
};
const room = {
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
const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });
const guest = {
  status: "guest",
  userId: "guest-user-1",
  displayName: "Lữ khách",
  expiresAt: "2030-01-01T12:00:00Z",
  deferred: false,
};
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
const historyId = "77777777-7777-4777-8777-777777777777";
const initialReplay = initialPosition();
const replayRecord = {
  id: historyId,
  mode: "CASUAL",
  side: "red",
  positions: [initialReplay, playMove(initialReplay, { from: 54, to: 45 })].map(
    (p) => ({ fen: serializePosition(p), turn: p.turn }),
  ),
  moves: [{ from: 54, to: 45, side: "red" }],
  result: { reason: "CHECKMATE", winner: "red" },
};
it("loads owned replay at the single canonical route with a readonly board", async () => {
  window.history.replaceState(null, "", `/history/${historyId}`);
  mock.state = member;
  mock.authorizedFetch.mockResolvedValue(reply(replayRecord));
  render(createElement(AppRouter));
  await screen.findByRole("heading", { name: "Biên bản ván đấu" });
  expect(mock.authorizedFetch).toHaveBeenCalledExactlyOnceWith(
    `/history/${historyId}`,
    { method: "GET", redirect: "error" },
  );
  expect(screen.getByText("Tốt 9 tiến 1")).toBeTruthy();
  expect(document.title).toContain("Xem lại ván đấu");
  expect(document.activeElement).toBe(
    screen.getByRole("heading", { name: "Xem lại ván đấu" }),
  );
});
it("never reads a replay for a Guest or an invalid match ID", async () => {
  window.history.replaceState(null, "", `/history/${historyId}`);
  mock.state = guest;
  const view = render(createElement(AppRouter));
  expect(mock.authorizedFetch).not.toHaveBeenCalled();
  mock.state = member;
  act(() => navigate("/history/invalid-id"));
  view.rerender(createElement(AppRouter));
  await screen.findByRole("alert");
  expect(mock.authorizedFetch).not.toHaveBeenCalled();
  expect(
    screen.queryByRole("heading", { name: "Biên bản ván đấu" }),
  ).toBeNull();
});
it("fences a late private replay when the logged-in account changes", async () => {
  window.history.replaceState(null, "", `/history/${historyId}`);
  mock.state = member;
  let release!: (r: Response) => void;
  mock.authorizedFetch.mockImplementationOnce(
    () =>
      new Promise<Response>((done) => {
        release = done;
      }),
  );
  mock.authorizedFetch.mockResolvedValue(
    reply({
      ...replayRecord,
      moves: [],
      positions: [replayRecord.positions[0]],
    }),
  );
  const view = render(createElement(AppRouter));
  await vi.waitFor(() => expect(mock.authorizedFetch).toHaveBeenCalledTimes(1));
  mock.state = { ...member, userId: "new-private-owner" };
  view.rerender(createElement(AppRouter));
  await screen.findByText("Ván đấu kết thúc ở thế cờ ban đầu.");
  await act(async () => release(reply(replayRecord)));
  expect(screen.queryByText("Tốt 9 tiến 1")).toBeNull();
});
const historyPage = {
  items: [
    {
      id: historyId,
      type: "CASUAL",
      typeLabel: "Đánh Thường",
      side: "red",
      opponent: { displayName: "Đối thủ lịch sử", isGuest: false },
      result: {
        kind: "WIN",
        reason: "RESIGN",
        label: "Thắng",
        countsForWdl: true,
      },
      eloDelta: null,
      startedAt: "2026-10-11T00:00:00.000001Z",
      endedAt: "2026-10-11T01:00:00.000001Z",
      replayPath: `/history/${historyId}`,
    },
  ],
  nextCursor: null,
};
it("loads member history through authorized HTTP and opens only the replay route", async () => {
  window.history.replaceState(null, "", "/history");
  mock.state = member;
  mock.authorizedFetch.mockResolvedValue(reply(historyPage));
  render(createElement(AppRouter));
  expect(
    await screen.findByRole("heading", { name: "Đối thủ lịch sử" }),
  ).toBeTruthy();
  expect(mock.authorizedFetch).toHaveBeenCalledExactlyOnceWith(
    "/history?filter=ALL&limit=20",
    { method: "GET", redirect: "error" },
  );
  expect(document.title).toContain("Lịch sử ván đấu");
  fireEvent.click(
    screen.getByRole("button", { name: "Xem lại ván với Đối thủ lịch sử" }),
  );
  expect(window.location.pathname).toBe(`/history/${historyId}`);
});
it("preserves a history destination through login without reading anonymous data", async () => {
  window.history.replaceState(null, "", "/history");
  mock.authorizedFetch.mockResolvedValue(reply(historyPage));
  render(createElement(AppRouter));
  await vi.waitFor(() => expect(window.location.pathname).toBe("/login"));
  expect(mock.authorizedFetch).not.toHaveBeenCalled();
  mock.accept.mockImplementation(() => {
    mock.state = member;
  });
  fireEvent.click(await screen.findByText("Hoàn tất đăng nhập"));
  await screen.findByRole("heading", { name: "Đối thủ lịch sử" });
  expect(window.location.pathname).toBe("/history");
});
it("does not read history for Guests", () => {
  window.history.replaceState(null, "", "/history");
  mock.state = guest;
  render(createElement(AppRouter));
  expect(mock.authorizedFetch).not.toHaveBeenCalled();
  expect(screen.queryByRole("heading", { name: "Đối thủ lịch sử" })).toBeNull();
});
it("drops a late history response after the authenticated owner changes", async () => {
  window.history.replaceState(null, "", "/history");
  mock.state = member;
  let release!: (response: Response) => void;
  mock.authorizedFetch.mockImplementationOnce(
    () =>
      new Promise<Response>((resolve) => {
        release = resolve;
      }),
  );
  mock.authorizedFetch.mockResolvedValue(
    reply({ items: [], nextCursor: null }),
  );
  const view = render(createElement(AppRouter));
  await vi.waitFor(() => expect(mock.authorizedFetch).toHaveBeenCalledTimes(1));
  mock.state = { ...member, userId: "another-member" };
  view.rerender(createElement(AppRouter));
  await screen.findByText("Chưa có ván đấu trong bộ lọc này.");
  await act(async () => {
    release(reply(historyPage));
  });
  expect(screen.queryByRole("heading", { name: "Đối thủ lịch sử" })).toBeNull();
});
it("keeps unknown routes readable and focuses the route heading", async () => {
  window.history.replaceState(null, "", "/unknown");
  mock.state = { status: "checking" };
  render(createElement(AppRouter));
  expect(screen.getByRole("heading", { level: 1 }).textContent).toContain(
    "Không tìm thấy",
  );
  expect(document.activeElement).toBe(
    screen.getByRole("heading", { level: 1 }),
  );
  expect(document.title).toContain("Không tìm thấy");
});
it("shows accessible session checking and retry for bootstrap errors without forcing anonymous", () => {
  mock.state = { status: "checking" };
  const view = render(createElement(AppRouter));
  expect(screen.getByRole("status").textContent).toContain("phiên");
  mock.state = { status: "error", message: "private provider text" };
  view.rerender(createElement(AppRouter));
  expect(screen.queryByText("private provider text")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Thử lại" }));
  expect(mock.refresh).toHaveBeenCalledOnce();
  expect(window.location.pathname).toBe("/login");
});
it("preserves an invalid join destination through registration without claiming a seat", async () => {
  window.history.replaceState(null, "", "/rooms/join?token=fixture-invite");
  mock.accept.mockImplementation(() => {
    mock.state = member;
  });
  render(createElement(AppRouter));
  await vi.waitFor(() => expect(window.location.pathname).toBe("/login"));
  fireEvent.click(
    await screen.findByRole("link", { name: "Đăng ký tài khoản" }),
  );
  fireEvent.click(await screen.findByRole("link", { name: "Về đăng nhập" }));
  fireEvent.click(
    await screen.findByRole("link", { name: "Đăng ký tài khoản" }),
  );
  fireEvent.click(await screen.findByText("Hoàn tất đăng ký"));
  await vi.waitFor(() => expect(window.location.pathname).toBe("/rooms/join"));
  expect(window.location.search).toBe("?token=fixture-invite");
  expect(mock.accept).toHaveBeenCalledWith({
    fixture: "registration",
    remember: true,
  });
  expect(
    await screen.findByRole("heading", { name: "Vào phòng được mời" }),
  ).toBeTruthy();
  expect(mock.authorizedFetch).not.toHaveBeenCalled();
});
it("preserves a room destination through login and handles browser Back/Forward reactively", async () => {
  window.history.replaceState(null, "", "/rooms/fixture-room?intent=spectator");
  mock.accept.mockImplementation(() => {
    mock.state = member;
  });
  render(createElement(AppRouter));
  await vi.waitFor(() => expect(window.location.pathname).toBe("/login"));
  fireEvent.click(await screen.findByText("Hoàn tất đăng nhập"));
  await vi.waitFor(() =>
    expect(window.location.pathname).toBe("/rooms/fixture-room"),
  );
  act(() => navigate("/missing"));
  expect(screen.getByRole("heading", { level: 1 }).textContent).toContain(
    "Không tìm thấy",
  );
  window.history.back();
  await vi.waitFor(() =>
    expect(window.location.pathname).toBe("/rooms/fixture-room"),
  );
  expect(screen.getByText("Định danh phòng không hợp lệ.")).toBeTruthy();
  window.history.forward();
  await vi.waitFor(() => expect(window.location.pathname).toBe("/missing"));
  expect(screen.getByRole("heading", { level: 1 }).textContent).toContain(
    "Không tìm thấy",
  );
});
it("loads validated public rooms and opens the actual create dialog", async () => {
  mock.state = member;
  window.history.replaceState(null, "", "/lobby");
  mock.authorizedFetch.mockResolvedValue(reply([room]));
  render(createElement(AppRouter));
  await vi.waitFor(() => expect(screen.getByText(room.name)).toBeTruthy());
  expect(mock.authorizedFetch).toHaveBeenCalledWith("/public-rooms", {
    method: "GET",
  });
  fireEvent.click(screen.getByRole("button", { name: "Tạo phòng" }));
  expect(screen.getByRole("dialog")).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Huỷ" }));
  feedRooms([room]);
  mock.authorizedFetch.mockResolvedValueOnce(
    reply({ roomId: room.roomId, version: 2, role: "spectator" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Vào xem" }));
  await vi.waitFor(() =>
    expect(window.location.pathname).toBe("/rooms/" + room.roomId),
  );
  expect(window.location.search).toBe("");
});
it.each([
  reply({ private: "hidden" }, 404),
  reply([{ ...room, emptySeats: 9, name: "private fixture" }]),
  reply([room, room]),
])(
  "treats unavailable or malformed room data as error, not empty, and hides private error details",
  async (response) => {
    mock.state = member;
    window.history.replaceState(null, "", "/lobby");
    mock.authorizedFetch.mockResolvedValue(response);
    render(createElement(AppRouter));
    await vi.waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
    expect(screen.queryByText("Chưa có phòng công khai")).toBeNull();
    expect(screen.queryByText("private fixture")).toBeNull();
  },
);

it.each([
  { ...room, status: ["waiting"] },
  { ...room, roomId: "bad\nroom" },
])("rejects values that are not a valid PublicRoom", async (invalidRoom) => {
  mock.state = member;
  window.history.replaceState(null, "", "/lobby");
  mock.authorizedFetch.mockResolvedValue(reply([invalidRoom]));
  render(createElement(AppRouter));
  await vi.waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
});
it("retries a failed public-room request and renders empty only after valid success", async () => {
  mock.state = member;
  window.history.replaceState(null, "", "/lobby");
  mock.authorizedFetch
    .mockRejectedValueOnce(new Error("private upstream"))
    .mockResolvedValueOnce(reply([]));
  render(createElement(AppRouter));
  await vi.waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
  expect(screen.queryByText("private upstream")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Thử lại" }));
  await vi.waitFor(() =>
    expect(screen.getByText("Chưa có phòng công khai")).toBeTruthy(),
  );
  expect(mock.authorizedFetch).toHaveBeenCalledTimes(2);
});
it("closes feed on route leave and ignores its stale HTTP response", async () => {
  mock.state = member;
  window.history.replaceState(null, "", "/lobby");
  let resolve!: (response: Response) => void;
  mock.authorizedFetch.mockImplementationOnce(
    () =>
      new Promise<Response>((done) => {
        resolve = done;
      }),
  );
  render(createElement(AppRouter));
  await vi.waitFor(() => expect(mock.authorizedFetch).toHaveBeenCalledOnce());
  act(() => navigate("/friends"));
  expect(mock.sockets[0]!.closed).toBe(true);
  await act(async () => {
    resolve(reply([room]));
  });
  expect(screen.queryByText(room.name)).toBeNull();
  expect(await screen.findByRole("heading", { level: 1 })).toHaveProperty(
    "textContent",
    "Bạn bè",
  );
});
it("preserves a validated invitation through Google registration, pending onboarding and actual component remount", async () => {
  window.history.replaceState(
    null,
    "",
    "/rooms/join?token=fixture-google-invite",
  );
  mock.accept.mockImplementation((value) => {
    mock.state =
      value.kind === "pending"
        ? {
            status: "pending",
            method: "google",
            expiresAt: value.expiresAt,
            recovering: false,
          }
        : member;
  });
  const view = render(createElement(AppRouter));
  await vi.waitFor(() => expect(window.location.pathname).toBe("/login"));
  fireEvent.click(
    await screen.findByRole("link", { name: "Đăng ký tài khoản" }),
  );
  fireEvent.click(await screen.findByText("Official Google"));
  await vi.waitFor(() => expect(window.location.pathname).toBe("/onboarding"));
  expect(
    await screen.findByRole("heading", { name: "Thiết lập tài khoản" }),
  ).toBeTruthy();
  view.unmount();
  render(createElement(AppRouter));
  fireEvent.click(await screen.findByText("Hoàn tất thiết lập"));
  await vi.waitFor(() => expect(window.location.pathname).toBe("/rooms/join"));
  expect(window.location.search).toBe("?token=fixture-google-invite");
  expect(window.history.state).toBeNull();
  expect(mock.authorizedFetch).not.toHaveBeenCalled();
});
it("rejects a forged external history destination after Google onboarding", async () => {
  window.history.replaceState(
    { xiangqiAuthDestination: "https://outside.invalid/rooms/x" },
    "",
    "/onboarding",
  );
  mock.state = {
    status: "pending",
    method: "google",
    expiresAt: "2030-01-01T00:00:00Z",
    recovering: false,
  };
  mock.accept.mockImplementation(() => {
    mock.state = member;
  });
  render(createElement(AppRouter));
  fireEvent.click(await screen.findByText("Hoàn tất thiết lập"));
  await vi.waitFor(() => expect(window.location.pathname).toBe("/lobby"));
});
it("retains the invitation when an expired onboarding cookie sends a reload back to login", async () => {
  window.history.replaceState(
    { xiangqiAuthDestination: "/rooms/join?token=expired-google-invite" },
    "",
    "/onboarding",
  );
  mock.accept.mockImplementation(() => {
    mock.state = member;
  });
  render(createElement(AppRouter));
  await vi.waitFor(() => expect(window.location.pathname).toBe("/login"));
  fireEvent.click(await screen.findByText("Hoàn tất đăng nhập"));
  await vi.waitFor(() => expect(window.location.pathname).toBe("/rooms/join"));
  expect(window.location.search).toBe("?token=expired-google-invite");
});

it("creates through the authorized form then enters the actual server room route", async () => {
  mock.state = member;
  window.history.replaceState(null, "", "/lobby");
  const roomId = "11111111-1111-4111-8111-111111111111";
  mock.authorizedFetch.mockImplementation(async (path: string) =>
    path === "/rooms"
      ? reply({ roomId, version: 1, role: "red", inviteCode: "12345678" })
      : reply([]),
  );
  render(createElement(AppRouter));
  await vi.waitFor(() =>
    expect(screen.getByText("Chưa có phòng công khai")).toBeTruthy(),
  );
  fireEvent.click(screen.getByRole("button", { name: "Tạo phòng" }));
  expect(screen.getByRole("dialog")).toBeTruthy();
  fireEvent.click(
    within(screen.getByRole("dialog")).getByRole("radio", { name: "15 phút" }),
  );
  fireEvent.change(
    within(screen.getByRole("dialog")).getByLabelText("Người xem"),
    { target: { value: "2" } },
  );
  fireEvent.change(
    within(screen.getByRole("dialog")).getByLabelText("Quyền truy cập"),
    { target: { value: "PUBLIC" } },
  );
  fireEvent.click(
    within(screen.getByRole("dialog")).getByRole("button", {
      name: "Tạo phòng",
    }),
  );
  await vi.waitFor(() =>
    expect(window.location.pathname).toBe(`/rooms/${roomId}`),
  );
  const create = mock.authorizedFetch.mock.calls.find(
    (call) => call[0] === "/rooms",
  );
  expect(JSON.parse(create![1].body)).toEqual({
    commandId: expect.stringMatching(/^[0-9a-f-]{36}$/),
    timeMinutes: 15,
    viewerLimit: 2,
    visibility: "PUBLIC",
  });
  expect(
    await screen.findByRole("heading", { name: "Phòng chờ " + roomId }),
  ).toBeTruthy();
  fireEvent.click(screen.getByText("Server closed fixture"));
  await vi.waitFor(() => expect(window.location.pathname).toBe("/lobby"));
  expect(screen.getByText("Phòng đã đóng")).toBeTruthy();
});

it("automatically joins the valid invitation once after login without another submit", async () => {
  const roomId = "12345678-1234-4234-8234-123456789abc";
  window.history.replaceState(null, "", "/rooms/join?token=12345678");
  mock.accept.mockImplementation(() => {
    mock.state = member;
  });
  mock.authorizedFetch.mockResolvedValue(
    reply({ roomId, version: 2, role: "black", inviteCode: "12345678" }),
  );
  render(createElement(AppRouter));
  await vi.waitFor(() => expect(window.location.pathname).toBe("/login"));
  expect(mock.authorizedFetch).not.toHaveBeenCalled();
  fireEvent.click(await screen.findByText("Hoàn tất đăng nhập"));
  await vi.waitFor(() =>
    expect(window.location.pathname).toBe(`/rooms/${roomId}`),
  );
  expect(mock.authorizedFetch).toHaveBeenCalledOnce();
  const [url, options] = mock.authorizedFetch.mock.calls[0]!;
  expect(url).toBe("/rooms/join");
  expect(options.method).toBe("POST");
  expect(JSON.parse(options.body)).toEqual({
    code: "12345678",
    preference: "auto",
    commandId: expect.stringMatching(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    ),
  });
});

it("uses the lobby's entered room code without requesting it again", async () => {
  const roomId = "12345678-1234-4234-8234-123456789abc";
  window.history.replaceState(null, "", "/lobby");
  mock.state = member;
  mock.authorizedFetch.mockImplementation(async (url: string) =>
    reply(
      url === "/rooms/join"
        ? { roomId, version: 2, role: "black", inviteCode: "12345678" }
        : [],
    ),
  );
  render(createElement(AppRouter));
  fireEvent.change(screen.getByRole("textbox", { name: "Mã phòng" }), {
    target: { value: "12345678" },
  });
  fireEvent.click(screen.getByRole("button", { name: "Vào phòng" }));
  await vi.waitFor(() =>
    expect(window.location.pathname).toBe(`/rooms/${roomId}`),
  );
  const joins = mock.authorizedFetch.mock.calls.filter(
    ([url]) => url === "/rooms/join",
  );
  expect(joins).toHaveLength(1);
  expect(JSON.parse(joins[0]![1].body)).toMatchObject({
    code: "12345678",
    preference: "auto",
  });
});

it("requires a validated feed before allowing admission and wraps only the member proof", async () => {
  mock.state = member;
  window.history.replaceState(null, "", "/lobby");
  mock.authorizedFetch.mockResolvedValue(reply([room]));
  render(createElement(AppRouter));
  await vi.waitFor(() => expect(screen.getByText(room.name)).toBeTruthy());
  expect(
    screen
      .getByRole("button", { name: "Vào chơi" })
      .getAttribute("aria-disabled"),
  ).toBe("true");
  await vi.waitFor(() =>
    expect(mock.sockets[0]!.auth).toEqual({
      kind: "member",
      accessToken: "synthetic-bearer",
      appSession: "a".repeat(43),
    }),
  );
  act(() => mock.sockets[0]!.handlers.get("connect")?.());
  expect(
    screen
      .getByRole("button", { name: "Vào xem" })
      .getAttribute("aria-disabled"),
  ).toBe("true");
  feedRooms([room]);
  expect(
    screen
      .getByRole("button", { name: "Vào chơi" })
      .getAttribute("aria-disabled"),
  ).toBe("false");
});
it("never lets stale HTTP restore a room removed by the newer feed", async () => {
  mock.state = member;
  window.history.replaceState(null, "", "/lobby");
  let done!: (r: Response) => void;
  mock.authorizedFetch.mockImplementationOnce(
    () =>
      new Promise<Response>((r) => {
        done = r;
      }),
  );
  render(createElement(AppRouter));
  await vi.waitFor(() => expect(mock.authorizedFetch).toHaveBeenCalledOnce());
  feedRooms([room]);
  expect(screen.getByText(room.name)).toBeTruthy();
  feedRooms([]);
  await act(async () => done(reply([room])));
  expect(screen.queryByText(room.name)).toBeNull();
  expect(screen.getByText("Chưa có phòng công khai")).toBeTruthy();
});
it("waits for join ACK, blocks a double join and carries the canonical fallback notice", async () => {
  mock.state = member;
  window.history.replaceState(null, "", "/lobby");
  mock.authorizedFetch.mockResolvedValue(reply([room]));
  render(createElement(AppRouter));
  await vi.waitFor(() => expect(mock.authorizedFetch).toHaveBeenCalledOnce());
  feedRooms([room]);
  let done!: (r: Response) => void;
  mock.authorizedFetch.mockImplementationOnce(
    () =>
      new Promise<Response>((r) => {
        done = r;
      }),
  );
  const play = screen.getByRole("button", { name: "Vào chơi" });
  fireEvent.click(play);
  fireEvent.click(play);
  expect(window.location.pathname).toBe("/lobby");
  expect(
    mock.authorizedFetch.mock.calls.filter(([url]) =>
      String(url).endsWith("/join"),
    ),
  ).toHaveLength(1);
  await act(async () =>
    done(
      reply({
        roomId: room.roomId,
        version: 2,
        role: "spectator",
        notice: "Ghế vừa có người, bạn đang xem trận",
      }),
    ),
  );
  expect(window.location.pathname).toBe("/rooms/" + room.roomId);
  expect(screen.getByText("Ghế vừa có người, bạn đang xem trận")).toBeTruthy();
});
it.each(["disconnect", "error", "unmount"])(
  "fences a pending join ACK after %s",
  async (reason) => {
    mock.state = member;
    window.history.replaceState(null, "", "/lobby");
    mock.authorizedFetch.mockResolvedValue(reply([room]));
    render(createElement(AppRouter));
    await vi.waitFor(() => expect(mock.authorizedFetch).toHaveBeenCalledOnce());
    feedRooms([room]);
    let done!: (r: Response) => void;
    mock.authorizedFetch.mockImplementationOnce(
      () =>
        new Promise<Response>((r) => {
          done = r;
        }),
    );
    fireEvent.click(screen.getByRole("button", { name: "Vào xem" }));
    if (reason === "unmount") act(() => navigate("/friends"));
    else
      act(() =>
        mock.sockets[0]!.handlers.get(
          reason === "error" ? "public.error" : "disconnect",
        )?.({ code: "PUBLIC_ROOMS_UNAVAILABLE", message: "PRIVATE_SECRET" }),
      );
    await act(async () =>
      done(reply({ roomId: room.roomId, version: 2, role: "spectator" })),
    );
    expect(window.location.pathname).toBe(
      reason === "unmount" ? "/friends" : "/lobby",
    );
    expect(screen.queryByText("PRIVATE_SECRET")).toBeNull();
  },
);
it("refreshes once after a private-room join failure without retrying the POST or leaking its error", async () => {
  mock.state = member;
  window.history.replaceState(null, "", "/lobby");
  mock.authorizedFetch.mockResolvedValue(reply([room]));
  render(createElement(AppRouter));
  await vi.waitFor(() => expect(mock.authorizedFetch).toHaveBeenCalledOnce());
  feedRooms([room]);
  mock.authorizedFetch
    .mockResolvedValueOnce(
      reply({ code: "ROOM_NOT_PUBLIC", message: "PRIVATE_SECRET" }, 409),
    )
    .mockResolvedValueOnce(reply([]));
  fireEvent.click(screen.getByRole("button", { name: "Vào chơi" }));
  await vi.waitFor(() =>
    expect(
      mock.authorizedFetch.mock.calls.filter(
        ([url]) => url === "/public-rooms",
      ),
    ).toHaveLength(2),
  );
  expect(window.location.pathname).toBe("/lobby");
  expect(
    mock.authorizedFetch.mock.calls.filter(([url]) =>
      String(url).endsWith("/join"),
    ),
  ).toHaveLength(1);
  expect(screen.queryByText("PRIVATE_SECRET")).toBeNull();
  expect(screen.queryByText(room.name)).toBeNull();
});

it("keeps admission disabled across reconnect until a fresh snapshot and rejects the previous join ACK", async () => {
  mock.state = member;
  window.history.replaceState(null, "", "/lobby");
  mock.authorizedFetch.mockResolvedValue(reply([room]));
  render(createElement(AppRouter));
  await vi.waitFor(() => expect(mock.authorizedFetch).toHaveBeenCalledOnce());
  feedRooms([room]);
  let done!: (r: Response) => void;
  mock.authorizedFetch.mockImplementationOnce(
    () =>
      new Promise<Response>((r) => {
        done = r;
      }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Vào chơi" }));
  act(() => {
    mock.sockets[0]!.handlers.get("disconnect")?.();
    mock.sockets[0]!.handlers.get("connect")?.();
  });
  expect(
    screen
      .getByRole("button", { name: "Vào xem" })
      .getAttribute("aria-disabled"),
  ).toBe("true");
  feedRooms([room]);
  await act(async () =>
    done(reply({ roomId: room.roomId, version: 2, role: "black" })),
  );
  expect(window.location.pathname).toBe("/lobby");
  expect(
    screen
      .getByRole("button", { name: "Vào xem" })
      .getAttribute("aria-disabled"),
  ).toBe("false");
});
it("maps canonical canPlay=false even when the presentation has an empty seat", async () => {
  mock.state = member;
  window.history.replaceState(null, "", "/lobby");
  mock.authorizedFetch.mockResolvedValue(reply([room]));
  render(createElement(AppRouter));
  feedRooms([{ ...room, canPlay: false }]);
  expect(screen.queryByRole("button", { name: "Vào chơi" })).toBeNull();
  expect(
    screen
      .getByRole("button", { name: "Vào xem" })
      .getAttribute("aria-disabled"),
  ).toBe("false");
});
it("ignores a stale HTTP error after a valid live snapshot", async () => {
  mock.state = member;
  window.history.replaceState(null, "", "/lobby");
  let reject!: (error: Error) => void;
  mock.authorizedFetch.mockImplementationOnce(
    () =>
      new Promise<Response>((_, no) => {
        reject = no;
      }),
  );
  render(createElement(AppRouter));
  await vi.waitFor(() => expect(mock.authorizedFetch).toHaveBeenCalledOnce());
  feedRooms([room]);
  await act(async () => reject(Error("PRIVATE_UPSTREAM")));
  expect(screen.getByText(room.name)).toBeTruthy();
  expect(screen.queryByRole("alert")).toBeNull();
  expect(
    screen
      .getByRole("button", { name: "Vào chơi" })
      .getAttribute("aria-disabled"),
  ).toBe("false");
});

it("skips StrictMode's discarded HTTP request and fences stale HTTP behind the newest live snapshot", async () => {
  mock.state = member;
  window.history.replaceState(null, "", "/lobby");
  const done: ((response: Response) => void)[] = [];
  mock.authorizedFetch.mockImplementation(
    () => new Promise<Response>((resolve) => done.push(resolve)),
  );
  render(createElement(StrictMode, null, createElement(AppRouter)));
  expect(mock.sockets).toHaveLength(2);
  expect(mock.sockets[0]!.closed).toBe(true);
  expect(mock.sockets[1]!.closed).toBe(false);
  await vi.waitFor(() => expect(mock.authorizedFetch).toHaveBeenCalledOnce());
  feedRooms([]);
  await act(async () => {
    for (const resolve of done) resolve(reply([room]));
  });
  expect(screen.queryByText(room.name)).toBeNull();
  expect(screen.getByText("Chưa có phòng công khai")).toBeTruthy();
  expect(mock.sockets[0]!.auth).toBeUndefined();
});
it("trusts a committed join ACK when a same-connection feed update removes the discovery row", async () => {
  mock.state = member;
  window.history.replaceState(null, "", "/lobby");
  mock.authorizedFetch.mockResolvedValue(reply([room]));
  render(createElement(AppRouter));
  await vi.waitFor(() => expect(mock.authorizedFetch).toHaveBeenCalledOnce());
  feedRooms([room]);
  let done!: (response: Response) => void;
  mock.authorizedFetch.mockImplementationOnce(
    () =>
      new Promise<Response>((resolve) => {
        done = resolve;
      }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Vào chơi" }));
  act(() =>
    mock.sockets[0]!.handlers.get("public.rooms")?.({
      rooms: [],
      serverNow: "2026-10-11T01:00:01Z",
    }),
  );
  await act(async () =>
    done(reply({ roomId: room.roomId, version: 2, role: "black" })),
  );
  expect(window.location.pathname).toBe("/rooms/" + room.roomId);
});
it("sends an anonymous leaderboard visit to login and returns to that P2 route after sign-in", async () => {
  window.history.replaceState(null, "", "/leaderboard");
  mock.accept.mockImplementation(() => {
    mock.state = member;
  });
  render(createElement(AppRouter));
  await vi.waitFor(() => expect(window.location.pathname).toBe("/login"));
  expect(mock.authorizedFetch).not.toHaveBeenCalled();
  fireEvent.click(await screen.findByText("Hoàn tất đăng nhập"));
  expect(
    await screen.findByRole("heading", { name: "Bảng xếp hạng" }),
  ).toBeTruthy();
  expect(window.location.pathname).toBe("/leaderboard");
  expect(
    screen.getByRole("link", { name: "Quay về Sảnh" }).getAttribute("href"),
  ).toBe("/lobby");
});
it.each([
  { path: "/forgot-password", title: "Quên mật khẩu" },
  { path: "/reset-password", title: "Đặt lại mật khẩu" },
])(
  "renders $path for an anonymous visitor and links back to login",
  async ({ path, title }) => {
    window.history.replaceState(null, "", path);
    render(createElement(AppRouter));
    expect(await screen.findByRole("heading", { name: title })).toBeTruthy();
    expect(mock.authorizedFetch).not.toHaveBeenCalled();
    fireEvent.click(
      await screen.findByRole("link", { name: "Quay lại đăng nhập" }),
    );
    await vi.waitFor(() => expect(window.location.pathname).toBe("/login"));
    expect(
      await screen.findByRole("heading", { name: "Đăng nhập" }),
    ).toBeTruthy();
  },
);
it("denies a Guest the P2 leaderboard without redirecting or showing scope actions", () => {
  mock.state = guest;
  window.history.replaceState(null, "", "/leaderboard");
  const { container } = render(createElement(AppRouter));
  expect(container.querySelector("#p2-scope-title")).toBeNull();
  expect(screen.getByRole("heading", { level: 1 })).toBeTruthy();
  expect(window.location.pathname).toBe("/leaderboard");
  const denied = screen
    .getByText("Phiên Khách không có quyền xem nội dung này.")
    .closest("section")!;
  expect(
    within(denied)
      .getAllByRole("link")
      .map((link) => link.getAttribute("href")),
  ).toEqual(["/login"]);
  expect(mock.authorizedFetch).not.toHaveBeenCalled();
});
it("keeps a signed-in member on the P2 scope page and returns to the lobby from it", async () => {
  mock.state = member;
  window.history.replaceState(null, "", "/leaderboard");
  render(createElement(AppRouter));
  expect(
    await screen.findByRole("heading", { name: "Bảng xếp hạng" }),
  ).toBeTruthy();
  expect(window.location.pathname).toBe("/leaderboard");
  fireEvent.click(screen.getByRole("link", { name: "Quay về Sảnh" }));
  await vi.waitFor(() => expect(window.location.pathname).toBe("/lobby"));
  expect(screen.queryByRole("heading", { name: "Bảng xếp hạng" })).toBeNull();
});
const aiId = "22222222-2222-4222-8222-222222222222";
const aiFen = serializePosition(initialPosition());
const aiSnapshot = {
  snapshot: {
    id: aiId,
    requestedSide: "black",
    actualSide: "red",
    level: "hard",
    position: aiFen,
    history: [aiFen],
    version: 0,
    undoUsed: 0,
    status: "ACTIVE",
    engineState: "IDLE",
    engineError: null,
    outcome: null,
  },
  serverNow: "2026-10-11T00:00:00Z",
  control: { mode: "controller", reason: null, generation: 1 },
};
function aiServer(create: () => Response = () => reply(aiSnapshot)) {
  mock.authorizedFetch.mockImplementation(
    async (path: string, init?: RequestInit) => {
      if (path === "/public-rooms") return reply([room]);
      if (path === "/ai" && init?.method === "POST") return create();
      if (path === `/ai/${aiId}`) return reply(aiSnapshot);
      return reply([]);
    },
  );
}
it("starts the chosen AI level and side on the server then opens the server game route", async () => {
  mock.state = member;
  window.history.replaceState(null, "", "/lobby");
  aiServer();
  render(createElement(AppRouter));
  feedRooms([room]);
  fireEvent.click(screen.getByRole("button", { name: "Chọn cấp độ máy" }));
  fireEvent.click(await screen.findByRole("radio", { name: "Khó" }));
  fireEvent.click(screen.getByRole("radio", { name: "Đen (máy đi trước)" }));
  fireEvent.click(screen.getByRole("button", { name: "Bắt đầu" }));
  await vi.waitFor(() => expect(window.location.pathname).toBe(`/ai/${aiId}`));
  const create = mock.authorizedFetch.mock.calls.find(
    ([url, init]) => url === "/ai" && init?.method === "POST",
  );
  expect(JSON.parse(create![1].body)).toEqual({
    level: "hard",
    requestedSide: "black",
  });
  expect(screen.queryByRole("dialog")).toBeNull();
});
it("keeps the chosen AI settings in the dialog and does not navigate when the server refuses the game", async () => {
  mock.state = member;
  window.history.replaceState(null, "", "/lobby");
  aiServer(() => reply({ code: "ACTIVE_GAME_EXISTS" }, 409));
  render(createElement(AppRouter));
  feedRooms([room]);
  fireEvent.click(screen.getByRole("button", { name: "Chọn cấp độ máy" }));
  fireEvent.click(await screen.findByRole("radio", { name: "Khó" }));
  fireEvent.click(screen.getByRole("radio", { name: "Đen (máy đi trước)" }));
  fireEvent.click(screen.getByRole("button", { name: "Bắt đầu" }));
  expect((await screen.findByRole("alert")).textContent).toBe(
    "Chưa thể bắt đầu ván với máy. Vui lòng thử lại.",
  );
  expect(window.location.pathname).toBe("/lobby");
  expect(screen.getByRole("dialog")).toBeTruthy();
  expect(
    (screen.getByRole("radio", { name: "Khó" }) as HTMLInputElement).checked,
  ).toBe(true);
  expect(
    (
      screen.getByRole("radio", {
        name: "Đen (máy đi trước)",
      }) as HTMLInputElement
    ).checked,
  ).toBe(true);
});
it.each(["playing-ai", "playing-online", "waiting"] as const)(
  "shows the held %s position and blocks entering a second room or AI game",
  async (kind) => {
    mock.state = member;
    mock.where = {
      kind,
      roomId: kind === "playing-ai" ? null : room.roomId,
      matchId: kind === "waiting" ? null : aiId,
    };
    window.history.replaceState(null, "", "/lobby");
    aiServer();
    render(createElement(AppRouter));
    feedRooms([room]);
    const resume = await screen.findByRole("link", { name: "Quay lại" });
    expect(resume.getAttribute("href")).toBe(
      kind === "playing-ai" ? `/ai/${aiId}` : `/rooms/${room.roomId}`,
    );
    expect(
      screen
        .getByRole("button", { name: "Vào chơi" })
        .getAttribute("aria-disabled"),
    ).toBe("true");
    for (const name of ["Tạo phòng", "Chọn cấp độ máy"]) {
      const button = screen.getByRole("button", { name });
      expect(button.getAttribute("aria-disabled")).toBe("true");
      fireEvent.click(button);
    }
    expect(screen.queryByRole("dialog")).toBeNull();
    fireEvent.click(resume);
    await vi.waitFor(() =>
      expect(window.location.pathname).toBe(
        kind === "playing-ai" ? `/ai/${aiId}` : `/rooms/${room.roomId}`,
      ),
    );
  },
);

it("sends a displaced login to the lobby instead of a pending room invite", async () => {
  window.history.replaceState(null, "", "/rooms/fixture-room?intent=spectator");
  mock.accept.mockImplementation(() => {
    mock.state = member;
  });
  render(createElement(AppRouter));
  await vi.waitFor(() => expect(window.location.pathname).toBe("/login"));
  fireEvent.click(await screen.findByText("Đăng nhập từ thiết bị mới"));
  await vi.waitFor(() => expect(window.location.pathname).toBe("/lobby"));
  expect(mock.accept).toHaveBeenCalledWith(
    expect.objectContaining({ displaced: true }),
  );
});

it("asks before logging out of a live online match and logs out only after confirmation", async () => {
  window.history.replaceState(null, "", "/lobby");
  mock.state = member;
  mock.where = {
    kind: "playing-online",
    roomId: "fixture-room",
    matchId: "fixture-match",
  };
  render(createElement(AppRouter));
  fireEvent.click(await screen.findByText("Đăng xuất"));
  expect(await screen.findByText("Đăng xuất khi đang có ván?")).toBeTruthy();
  fireEvent.click(screen.getByText("Ở lại"));
  expect(mock.logout).not.toHaveBeenCalled();
  fireEvent.click(screen.getByText("Đăng xuất"));
  fireEvent.click(await screen.findByText("Đầu hàng và đăng xuất"));
  await vi.waitFor(() => expect(mock.logout).toHaveBeenCalledWith(true));
});
