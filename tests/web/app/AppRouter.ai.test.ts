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
}));
// Socket boundary: control is granted; no snapshots are pushed.
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
vi.mock("@web/features/friends/FriendsBell.js", () => ({
  FriendsBell: () => null,
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
  const menu = await screen.findByRole("menu", { name: "Tài khoản cá nhân" });
  fireEvent.click(within(menu).getByRole("button", { name: /Đăng xuất/ }));
}

beforeEach(() => {
  vi.clearAllMocks();
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
