// @vitest-environment jsdom
import { createElement } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AppRouter } from "@web/app/AppRouter.js";
import { initialPosition, serializePosition } from "@xiangqi/xiangqi-core";
import { LogoutConfirmRequired } from "@web/features/auth/SessionProvider.js";

import { navigate } from "@web/shared/navigation/navigation.js";
const mock = vi.hoisted(() => ({
  state: { status: "anonymous" } as Record<string, unknown>,
  controlMode: "controller" as "controller" | "readonly",
  emailStatus: {
    status: "ready",
    email: "kythu@example.invalid",
    emailVerified: true,
    pendingEmail: null,
    expiresAt: null,
    resendAt: null,
  } as Record<string, unknown>,
  reloadEmailStatus: vi.fn(),
  logout: vi.fn(),
  refresh: vi.fn(),
  accept: vi.fn(),
  authorizedFetch: vi.fn(),
  guestFetch: vi.fn(),
  // Mirrors SessionProvider.sessionFetch: the active actor picks the HTTP boundary.
  sessionFetch: vi.fn((path: string, init?: RequestInit) =>
    mock.state.status === "guest"
      ? mock.guestFetch(path, init)
      : mock.authorizedFetch(path, init),
  ),
  getRealtimeProof: vi.fn(),
  where: { kind: "none", roomId: null, matchId: null } as Record<
    string,
    unknown
  >,
}));

vi.mock("@web/features/auth/SessionProvider.js", () => ({
  useSession: () => mock,
  LogoutConfirmRequired: class extends Error {},
}));
// Socket boundary: control is granted; no snapshots are pushed.
vi.mock("@web/features/ai/ai-socket-client.js", () => ({
  connectAi: (handlers: {
    onControl: (control: unknown) => void;
    onConnection: (ready: boolean) => void;
  }) => ({
    getControl: async () => ({
      tabId: "33333333-3333-4333-8333-333333333333",
      connectionId: "fixture-socket",
      generation: 1,
    }),
    refresh: async () => undefined,
    watch: async (gameId: string) => {
      handlers.onConnection(true);
      handlers.onControl({
        tabId: "33333333-3333-4333-8333-333333333333",
        connectionId: "fixture-socket",
        generation: 1,
        mode: mock.controlMode,
        gameId,
        graceUntil: null,
      });
    },
    takeover: async () => undefined,
    disconnect: () => undefined,
  }),
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

const member = {
  status: "active-member",
  userId: "fixture-user",
  username: "KyThu",
  expiresAt: "2030-01-01T00:00:00Z",
  remember: true,
};
const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });

const aiId = "22222222-2222-4222-8222-222222222222";
const fen = serializePosition(initialPosition());
const activeEnvelope = {
  snapshot: {
    id: aiId,
    requestedSide: "red",
    actualSide: "red",
    level: "easy",
    position: fen,
    history: [fen],
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
const resignedEnvelope = {
  ...activeEnvelope,
  snapshot: {
    ...activeEnvelope.snapshot,
    version: 1,
    status: "FINISHED",
    outcome: { reason: "RESIGN", winner: "black" },
  },
};

// HTTP boundary for one active AI game: GET reads it, POST resign answers as given.
function aiServer(resign: () => Response, current: unknown = activeEnvelope) {
  mock.authorizedFetch.mockImplementation(
    async (path: string, init?: RequestInit) => {
      if (path === `/ai/${aiId}` && (init?.method ?? "GET") === "GET")
        return reply(current);
      if (path === `/ai/${aiId}/resign` && init?.method === "POST")
        return resign();
      return reply([]);
    },
  );
}

function resignRequests() {
  const calls = mock.authorizedFetch.mock.calls;
  return calls.filter(
    ([url, init]) => url === `/ai/${aiId}/resign` && init?.method === "POST",
  );
}

async function openLogout() {
  fireEvent.click(
    await screen.findByRole("button", { name: "Tài khoản: Thành viên" }),
  );
  const menu = await screen.findByRole("region", {
    name: "Tài khoản cá nhân",
  });
  fireEvent.click(within(menu).getByRole("button", { name: /Đăng xuất/ }));
}

beforeEach(() => {
  vi.clearAllMocks();
  mock.controlMode = "controller";
  mock.state = member;
  mock.where = { kind: "none", roomId: null, matchId: null };
  mock.getRealtimeProof.mockResolvedValue({
    kind: "member",
    accessToken: "synthetic-bearer",
    appSession: "a".repeat(43),
  });
  mock.logout.mockResolvedValue(undefined);
  mock.refresh.mockResolvedValue(undefined);
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
  window.history.replaceState(null, "", `/ai/${aiId}`);
});
afterEach(() => cleanup());
it("guards an internal logo navigation from an active AI game", async () => {
  aiServer(() => reply(resignedEnvelope));
  render(createElement(AppRouter));
  await screen.findByRole("heading", { name: "Đấu với máy" });
  await vi.waitFor(() =>
    expect(
      screen
        .getByRole("button", { name: "Đầu hàng" })
        .getAttribute("aria-disabled"),
    ).toBe("false"),
  );
  fireEvent.click(screen.getByRole("link", { name: /Kỳ Đài/i }));
  expect(
    await screen.findByRole("dialog", { name: "Rời ván đấu?" }),
  ).toBeTruthy();
  fireEvent.click(screen.getByRole("button", { name: "Ở lại" }));
  expect(window.location.pathname).toBe(`/ai/${aiId}`);
  expect(resignRequests()).toHaveLength(0);
});

it("keeps the mounted AI route when Back is cancelled", async () => {
  aiServer(() => reply(resignedEnvelope));
  window.history.replaceState(null, "", "/lobby");
  navigate(`/ai/${aiId}`);
  render(createElement(AppRouter));
  await screen.findByRole("heading", { name: "Đấu với máy" });
  window.history.back();
  const dialog = await screen.findByRole("dialog", { name: "Rời ván đấu?" });
  fireEvent.click(within(dialog).getByRole("button", { name: "Ở lại" }));
  await vi.waitFor(() => expect(window.location.pathname).toBe(`/ai/${aiId}`));
  expect(screen.getByRole("heading", { name: "Đấu với máy" })).toBeTruthy();
  expect(resignRequests()).toHaveLength(0);
});

it("lets a readonly AI tab navigate without resigning the controller game", async () => {
  mock.controlMode = "readonly";
  aiServer(() => reply(resignedEnvelope), {
    ...activeEnvelope,
    control: { mode: "readonly", reason: "other_tab", generation: 1 },
  });
  render(createElement(AppRouter));
  await screen.findByRole("heading", { name: "Đấu với máy" });
  fireEvent.click(screen.getByRole("link", { name: /Kỳ Đài/i }));
  expect(
    await screen.findByRole("heading", { name: "Sảnh kỳ hữu" }),
  ).toBeTruthy();
  expect(screen.queryByRole("dialog", { name: "Rời ván đấu?" })).toBeNull();
  expect(resignRequests()).toHaveLength(0);
});

it("offers a default-keep confirmation before abandoning an AI game from the lobby", async () => {
  window.history.replaceState(null, "", "/lobby");
  mock.where = { kind: "playing-ai", roomId: null, matchId: aiId };
  aiServer(() => reply(resignedEnvelope));
  render(createElement(AppRouter));
  fireEvent.click(await screen.findByRole("button", { name: "Bỏ ván" }));
  const dialog = await screen.findByRole("dialog");
  expect(within(dialog).getByRole("button", { name: "Giữ ván" })).toBe(
    document.activeElement,
  );
  fireEvent.click(within(dialog).getByRole("button", { name: "Giữ ván" }));
  expect(resignRequests()).toHaveLength(0);
});
it("finds an unfinished guest AI game in the lobby without a member profile", async () => {
  window.history.replaceState(null, "", "/lobby");
  mock.state = { status: "guest", userId: "guest-id", displayName: "Khách" };
  mock.guestFetch.mockImplementation(async (path: string) =>
    reply(path === "/ai/current" ? { gameId: aiId } : []),
  );
  render(createElement(AppRouter));
  expect(
    (await screen.findByRole("link", { name: "Quay lại" })).getAttribute(
      "href",
    ),
  ).toBe(`/ai/${aiId}`);
  expect(screen.getByRole("button", { name: "Bỏ ván" })).toBeTruthy();
});
it("does not resign from the lobby when another tab controls the AI game", async () => {
  window.history.replaceState(null, "", "/lobby");
  mock.where = { kind: "playing-ai", roomId: null, matchId: aiId };
  aiServer(() => reply(resignedEnvelope), {
    ...activeEnvelope,
    control: { mode: "readonly", reason: "other_tab", generation: 1 },
  });
  render(createElement(AppRouter));
  fireEvent.click(await screen.findByRole("button", { name: "Bỏ ván" }));
  const dialog = await screen.findByRole("dialog");
  fireEvent.click(within(dialog).getByRole("button", { name: "Bỏ ván" }));
  expect(await screen.findByText(/Chưa thể đầu hàng/)).toBeTruthy();
  expect(resignRequests()).toHaveLength(0);
});

it.each(["already pending", "resign pending"])(
  "keeps the lobby return path while terminal persistence is %s",
  async (phase) => {
    window.history.replaceState(null, "", "/lobby");
    mock.where = { kind: "playing-ai", roomId: null, matchId: aiId };
    const pending = {
      ...resignedEnvelope,
      snapshot: { ...resignedEnvelope.snapshot, status: "FINALIZING" },
    };
    aiServer(
      () => reply(pending),
      phase === "already pending" ? pending : activeEnvelope,
    );
    render(createElement(AppRouter));
    fireEvent.click(await screen.findByRole("button", { name: "Bỏ ván" }));
    const dialog = await screen.findByRole("dialog");
    fireEvent.click(within(dialog).getByRole("button", { name: "Bỏ ván" }));
    expect(await screen.findByText(/Chưa thể đầu hàng/)).toBeTruthy();
    expect(
      screen.getByRole("link", { name: "Quay lại" }).getAttribute("href"),
    ).toBe(`/ai/${aiId}`);
    expect(screen.getByRole("button", { name: "Bỏ ván" })).toBeTruthy();
  },
);

it("keeps the member signed in and sends no resign when the logout gate is cancelled", async () => {
  aiServer(() => reply(resignedEnvelope));
  render(createElement(AppRouter));
  await openLogout();
  await screen.findByRole("dialog");
  fireEvent.click(screen.getByRole("button", { name: "Ở lại" }));
  await vi.waitFor(() => expect(screen.queryByRole("dialog")).toBeNull());
  expect(resignRequests()).toHaveLength(0);
  expect(mock.logout).not.toHaveBeenCalled();
  expect(window.location.pathname).toBe(`/ai/${aiId}`);
});

it("resigns the active AI game on the server before logging out", async () => {
  aiServer(() => reply(resignedEnvelope));
  render(createElement(AppRouter));
  await openLogout();
  await screen.findByRole("dialog");
  fireEvent.click(
    screen.getByRole("button", { name: "Đầu hàng và đăng xuất" }),
  );
  await vi.waitFor(() => expect(mock.logout).toHaveBeenCalledOnce());
  const resigns = resignRequests();
  expect(resigns).toHaveLength(1);
  expect(JSON.parse(String(resigns[0]![1]!.body))).toEqual({ version: 0 });
  // The resign request must finish before logout starts.
  const resignOrder =
    mock.authorizedFetch.mock.invocationCallOrder[
      mock.authorizedFetch.mock.calls.indexOf(resigns[0]!)
    ]!;
  expect(resignOrder).toBeLessThan(mock.logout.mock.invocationCallOrder[0]!);
});

it("keeps the member signed in and shows a retry notice when the resign request fails", async () => {
  aiServer(() => reply({ code: "AI_UNAVAILABLE" }, 503));
  render(createElement(AppRouter));
  await openLogout();
  await screen.findByRole("dialog");
  fireEvent.click(
    screen.getByRole("button", { name: "Đầu hàng và đăng xuất" }),
  );
  const dismiss = await screen.findByRole("button", {
    name: "Đóng thông báo",
  });
  expect(dismiss.closest(".xq-notice")).not.toBeNull();
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.getByRole("button", { name: /^Tài khoản:/ })).toBeTruthy();
  expect(mock.logout).not.toHaveBeenCalled();
  expect(resignRequests()).toHaveLength(1);
});

it("logs out without a second resign when the server game is already finished", async () => {
  aiServer(() => reply(resignedEnvelope), resignedEnvelope);
  render(createElement(AppRouter));
  await openLogout();
  await screen.findByRole("dialog", { name: "Đăng xuất khi đang có ván?" });
  fireEvent.click(
    screen.getByRole("button", { name: "Đầu hàng và đăng xuất" }),
  );
  await vi.waitFor(() => expect(mock.logout).toHaveBeenCalledOnce());
  expect(resignRequests()).toHaveLength(0);
});

it("does not reuse consent for an old AI game to resign the current online match", async () => {
  mock.where = {
    kind: "playing-online",
    roomId: "current-room",
    matchId: "current-match",
  };
  aiServer(() => reply(resignedEnvelope), resignedEnvelope);
  mock.logout.mockImplementation(async (confirmed: boolean) => {
    if (!confirmed) throw new LogoutConfirmRequired();
  });
  render(createElement(AppRouter));
  await openLogout();
  await screen.findByRole("dialog", { name: "Đăng xuất khi đang có ván?" });
  fireEvent.click(
    screen.getByRole("button", { name: "Đầu hàng và đăng xuất" }),
  );
  await vi.waitFor(() => expect(mock.logout).toHaveBeenCalledWith(false));
  await screen.findByRole("dialog", { name: "Đăng xuất khi đang có ván?" });
  expect(mock.logout.mock.calls.some(([confirmed]) => confirmed === true)).toBe(
    false,
  );
  fireEvent.click(screen.getByRole("button", { name: "Ở lại" }));
  expect(resignRequests()).toHaveLength(0);
  expect(mock.logout).toHaveBeenCalledOnce();
});
