// @vitest-environment jsdom
// Helper first: its vi.mock calls must register before AppRouter loads.
import {
  useAppRouterHooks,
  mock,
  feedRooms,
  member,
  room,
  reply,
  guest,
} from "./AppRouter.test-helper.js";
import { createElement } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { AppRouter } from "@web/app/AppRouter.js";
import { initialPosition, serializePosition } from "@xiangqi/xiangqi-core";

useAppRouterHooks();
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
