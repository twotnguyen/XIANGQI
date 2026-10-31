// @vitest-environment jsdom
// Helper first: its vi.mock calls must register before AppRouter loads.
import {
  useAppRouterHooks,
  mock,
  feedRooms,
  member,
  room,
  reply,
} from "./AppRouter.test-helper.js";
import { createElement } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { AppRouter } from "@web/app/AppRouter.js";
import { navigate } from "@web/shared/navigation/navigation.js";

useAppRouterHooks();
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
