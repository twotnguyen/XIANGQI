// @vitest-environment jsdom
import { createElement } from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { AppRouter } from "./AppRouter.js";
import { navigate } from "./navigation.js";
import { NavigationLink } from "./NavigationLink.js";
const mock = vi.hoisted(() => ({
  state: { status: "anonymous" } as Record<string, unknown>,
  accept: vi.fn(),
  refresh: vi.fn(),
  logout: vi.fn(),
  authorizedFetch: vi.fn(),
}));
vi.mock("../auth/SessionProvider.js", () => ({ useSession: () => mock }));
vi.mock("../auth/LoginPage.js", () => ({
  LoginPage: ({ onLoggedIn }: { onLoggedIn: (value: unknown) => void }) =>
    createElement(
      "section",
      null,
      createElement("h1", null, "Đăng nhập"),
      createElement(NavigationLink, { href: "/register" }, "Đăng ký tài khoản"),
      createElement(
        "button",
        { onClick: () => onLoggedIn({ fixture: "login" }) },
        "Hoàn tất đăng nhập",
      ),
    ),
}));
vi.mock("../auth/RegistrationPage.js", () => ({
  RegistrationPage: ({
    onRegistered,
  }: {
    onRegistered: (value: unknown) => void;
  }) =>
    createElement(
      "section",
      null,
      createElement("h1", null, "Đăng ký"),
      createElement(NavigationLink, { href: "/login" }, "Về đăng nhập"),
      createElement(
        "button",
        { onClick: () => onRegistered({ fixture: "registration" }) },
        "Hoàn tất đăng ký",
      ),
    ),
}));
const member = {
  status: "active-member",
  userId: "fixture-user",
  username: "KyThu",
  expiresAt: "2030-01-01T00:00:00Z",
  remember: true,
};
const room = {
  id: "fixture-room",
  name: "Kỳ hữu",
  hostName: "Chủ phòng",
  hostGuest: false,
  timeMinutes: 10,
  status: "waiting",
  seats: 1,
  viewers: 0,
  spectatorLimit: 5,
};
const reply = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status });
beforeEach(() => {
  vi.clearAllMocks();
  mock.accept.mockReset();
  mock.logout.mockResolvedValue(undefined);
  mock.refresh.mockResolvedValue(undefined);
  mock.state = { status: "anonymous" };
  mock.authorizedFetch.mockResolvedValue(reply({ rooms: [] }));
  window.history.replaceState(null, "", "/login");
});
afterEach(() => cleanup());
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
it("preserves a join destination in memory through registration, then routes without claiming a seat", async () => {
  window.history.replaceState(null, "", "/rooms/join?token=fixture-invite");
  mock.accept.mockImplementation(() => {
    mock.state = member;
  });
  render(createElement(AppRouter));
  await vi.waitFor(() => expect(window.location.pathname).toBe("/login"));
  fireEvent.click(screen.getByRole("link", { name: "Đăng ký tài khoản" }));
  fireEvent.click(screen.getByRole("link", { name: "Về đăng nhập" }));
  fireEvent.click(screen.getByRole("link", { name: "Đăng ký tài khoản" }));
  fireEvent.click(screen.getByText("Hoàn tất đăng ký"));
  await vi.waitFor(() => expect(window.location.pathname).toBe("/rooms/join"));
  expect(window.location.search).toBe("?token=fixture-invite");
  expect(mock.accept).toHaveBeenCalledWith({
    fixture: "registration",
    remember: true,
  });
  expect(screen.getByText(/chưa thể vào phòng/i)).toBeTruthy();
  expect(mock.authorizedFetch).not.toHaveBeenCalled();
});
it("preserves a room destination through login and handles browser Back/Forward reactively", async () => {
  window.history.replaceState(null, "", "/rooms/fixture-room?intent=spectator");
  mock.accept.mockImplementation(() => {
    mock.state = member;
  });
  render(createElement(AppRouter));
  await vi.waitFor(() => expect(window.location.pathname).toBe("/login"));
  fireEvent.click(screen.getByText("Hoàn tất đăng nhập"));
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
  expect(screen.getByText(/chưa thể vào phòng/i)).toBeTruthy();
  window.history.forward();
  await vi.waitFor(() => expect(window.location.pathname).toBe("/missing"));
  expect(screen.getByRole("heading", { level: 1 }).textContent).toContain(
    "Không tìm thấy",
  );
});
it("loads validated public rooms only and makes unavailable create and AI actions explicit", async () => {
  mock.state = member;
  window.history.replaceState(null, "", "/lobby");
  mock.authorizedFetch.mockResolvedValue(reply({ rooms: [room] }));
  render(createElement(AppRouter));
  await vi.waitFor(() => expect(screen.getByText(room.name)).toBeTruthy());
  expect(mock.authorizedFetch).toHaveBeenCalledWith(
    "/rooms/public",
    expect.objectContaining({ signal: expect.any(AbortSignal) }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Tạo phòng" }));
  expect(screen.getByRole("alert").textContent).toContain("chưa khả dụng");
  fireEvent.click(screen.getByRole("button", { name: "Vào xem" }));
  expect(window.location.pathname).toBe("/rooms/fixture-room");
  expect(window.location.search).toBe("?intent=spectator");
});
it.each([
  reply({ private: "hidden" }, 404),
  reply({ rooms: [{ ...room, seats: 9, name: "private fixture" }] }),
  reply({ rooms: [room, room] }),
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
  { ...room, id: "bad\nroom" },
])("rejects values that are not a valid PublicRoom", async (invalidRoom) => {
  mock.state = member;
  window.history.replaceState(null, "", "/lobby");
  mock.authorizedFetch.mockResolvedValue(reply({ rooms: [invalidRoom] }));
  render(createElement(AppRouter));
  await vi.waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
});
it("retries a failed public-room request and renders empty only after valid success", async () => {
  mock.state = member;
  window.history.replaceState(null, "", "/lobby");
  mock.authorizedFetch
    .mockRejectedValueOnce(new Error("private upstream"))
    .mockResolvedValueOnce(reply({ rooms: [] }));
  render(createElement(AppRouter));
  await vi.waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
  expect(screen.queryByText("private upstream")).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Thử lại" }));
  await vi.waitFor(() =>
    expect(screen.getByText("Chưa có phòng công khai")).toBeTruthy(),
  );
  expect(mock.authorizedFetch).toHaveBeenCalledTimes(2);
});
it("aborts room loading on route leave and ignores its stale response", async () => {
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
  act(() => navigate("/friends"));
  expect(mock.authorizedFetch.mock.calls[0]![1].signal.aborted).toBe(true);
  await act(async () => {
    resolve(reply({ rooms: [room] }));
  });
  expect(screen.queryByText(room.name)).toBeNull();
  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Bạn bè");
});
