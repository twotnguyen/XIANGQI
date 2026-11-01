// @vitest-environment jsdom
// Helper first: its vi.mock calls must register before AppRouter loads.
import {
  useAppRouterHooks,
  mock,
  member,
  reply,
  guest,
} from "./AppRouter.test-helper.js";
import { createElement } from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { expect, it, vi } from "vitest";
import { AppRouter } from "@web/app/AppRouter.js";
import { navigate } from "@web/shared/navigation/navigation.js";
import {
  initialPosition,
  playMove,
  serializePosition,
} from "@xiangqi/xiangqi-core";

useAppRouterHooks();
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
const historyCalls = () =>
  [...mock.authorizedFetch.mock.calls, ...mock.guestFetch.mock.calls].filter(
    ([path]) => path.startsWith("/history"),
  );

it("loads owned replay at the single canonical route with a readonly board", async () => {
  window.history.replaceState(null, "", `/history/${historyId}`);
  mock.state = member;
  mock.authorizedFetch.mockImplementation(async (path: string) =>
    reply(path === `/history/${historyId}` ? replayRecord : []),
  );
  render(createElement(AppRouter));
  await screen.findByRole("heading", { name: "Biên bản ván đấu" });
  expect(historyCalls()).toEqual([
    [`/history/${historyId}`, { method: "GET", redirect: "error" }],
  ]);
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
  expect(historyCalls()).toEqual([]);
  mock.state = member;
  act(() => navigate("/history/invalid-id"));
  view.rerender(createElement(AppRouter));
  await screen.findByRole("alert");
  expect(historyCalls()).toEqual([]);
  expect(
    screen.queryByRole("heading", { name: "Biên bản ván đấu" }),
  ).toBeNull();
});
it("fences a late private replay when the logged-in account changes", async () => {
  window.history.replaceState(null, "", `/history/${historyId}`);
  mock.state = member;
  let release!: (r: Response) => void;
  let replayRequests = 0;
  mock.authorizedFetch.mockImplementation((path: string) => {
    if (path !== `/history/${historyId}`) return Promise.resolve(reply([]));
    if (replayRequests++ === 0) {
      return new Promise<Response>((done) => {
        release = done;
      });
    }
    return Promise.resolve(reply({
      ...replayRecord,
      moves: [],
      positions: [replayRecord.positions[0]],
    }));
  });
  const view = render(createElement(AppRouter));
  await vi.waitFor(() => expect(historyCalls()).toEqual([
    [`/history/${historyId}`, { method: "GET", redirect: "error" }],
  ]));
  mock.state = { ...member, userId: "new-private-owner" };
  view.rerender(createElement(AppRouter));
  await vi.waitFor(() => expect(historyCalls()).toHaveLength(2));
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
  mock.authorizedFetch.mockImplementation(async (path: string) => {
    if (path === "/history?filter=ALL&limit=20") return reply(historyPage);
    if (path === `/history/${historyId}`) return reply(replayRecord);
    return reply([]);
  });
  render(createElement(AppRouter));
  expect(
    await screen.findByRole("heading", { name: "Đối thủ lịch sử" }),
  ).toBeTruthy();
  expect(historyCalls()).toEqual([
    ["/history?filter=ALL&limit=20", { method: "GET", redirect: "error" }],
  ]);
  expect(document.title).toContain("Lịch sử ván đấu");
  fireEvent.click(
    screen.getByRole("button", { name: "Xem lại ván với Đối thủ lịch sử" }),
  );
  expect(window.location.pathname).toBe(`/history/${historyId}`);
});
it("preserves a history destination through login without reading anonymous data", async () => {
  window.history.replaceState(null, "", "/history");
  mock.authorizedFetch.mockImplementation(async (path: string) =>
    reply(path === "/history?filter=ALL&limit=20" ? historyPage : []),
  );
  render(createElement(AppRouter));
  await vi.waitFor(() => expect(window.location.pathname).toBe("/login"));
  expect(historyCalls()).toEqual([]);
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
  expect(historyCalls()).toEqual([]);
  expect(screen.queryByRole("heading", { name: "Đối thủ lịch sử" })).toBeNull();
});
it("drops a late history response after the authenticated owner changes", async () => {
  window.history.replaceState(null, "", "/history");
  mock.state = member;
  let release!: (response: Response) => void;
  let historyRequests = 0;
  mock.authorizedFetch.mockImplementation((path: string) => {
    if (path !== "/history?filter=ALL&limit=20") return Promise.resolve(reply([]));
    if (historyRequests++ === 0) {
      return new Promise<Response>((resolve) => {
        release = resolve;
      });
    }
    return Promise.resolve(reply({ items: [], nextCursor: null }));
  });
  const view = render(createElement(AppRouter));
  await vi.waitFor(() => expect(historyCalls()).toEqual([
    ["/history?filter=ALL&limit=20", { method: "GET", redirect: "error" }],
  ]));
  mock.state = { ...member, userId: "another-member" };
  view.rerender(createElement(AppRouter));
  await vi.waitFor(() => expect(historyCalls()).toHaveLength(2));
  await screen.findByText("Chưa có ván đấu trong bộ lọc này.");
  await act(async () => {
    release(reply(historyPage));
  });
  expect(screen.queryByRole("heading", { name: "Đối thủ lịch sử" })).toBeNull();
});
