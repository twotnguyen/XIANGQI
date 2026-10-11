// @vitest-environment jsdom
import { createElement } from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import { HistoryPage } from "./HistoryPage.js";
import {
  HistoryRequestError,
  type HistoryPage as Page,
} from "./history-client.js";
afterEach(cleanup);
it.each([
  ["CHECKMATE", "Chiếu hết"],
  ["STALEMATE", "Hết nước đi hợp lệ"],
  ["TIMEOUT", "Hết giờ"],
  ["DISCONNECT", "Mất kết nối"],
  ["PERPETUAL_CHECK", "Chiếu liên tục"],
  ["AGREED_DRAW", "Đồng ý hòa"],
  ["DRAW_AGREEMENT", "Đồng ý hòa"],
  ["REPETITION", "Lặp thế ba lần"],
  ["DRAW_REPETITION", "Lặp thế ba lần"],
  ["DRAW_NO_CAPTURE", "120 nửa nước không ăn quân"],
  ["BOTH_OFFLINE", "Hai người mất kết nối"],
  ["SERVER_RESTART", "Máy chủ khởi động lại"],
])("renders readable result reason %s", async (reason, label) => {
  const p = page();
  p.items[0]!.result.reason = reason!;
  if (
    [
      "AGREED_DRAW",
      "DRAW_AGREEMENT",
      "REPETITION",
      "DRAW_REPETITION",
      "DRAW_NO_CAPTURE",
    ].includes(reason!)
  )
    p.items[0]!.result = {
      kind: "DRAW",
      reason: reason!,
      label: "Hòa",
      countsForWdl: true,
    };
  if (["BOTH_OFFLINE", "SERVER_RESTART"].includes(reason!))
    p.items[0]!.result = {
      kind: "INTERRUPTED",
      reason: reason!,
      label: "Bị gián đoạn",
      countsForWdl: false,
    };
  render(
    createElement(HistoryPage, {
      client: { list: vi.fn().mockResolvedValue(p) },
      onReplay: vi.fn(),
    }),
  );
  expect(await screen.findByText(label!)).toBeTruthy();
});
it("rejects a newer page returned after the older-history cursor", async () => {
  const first = page("First");
  first.nextCursor = { endedAt: first.items[0]!.endedAt, matchId: id };
  const newer = page("Wrong order", other);
  newer.items[0]!.endedAt = "2026-10-11T03:00:00.000001Z";
  const client = {
    list: vi.fn().mockResolvedValueOnce(first).mockResolvedValueOnce(newer),
  };
  render(createElement(HistoryPage, { client, onReplay: vi.fn() }));
  await screen.findByText("First");
  await userEvent.click(screen.getByRole("button", { name: "Tải thêm ván" }));
  expect(await screen.findByRole("alert")).toBeTruthy();
  expect(screen.queryByText("Wrong order")).toBeNull();
});
const id = "11111111-1111-4111-8111-111111111111",
  other = "22222222-2222-4222-8222-222222222222";
function page(name = "Khách", gameId = id): Page {
  return {
    items: [
      {
        id: gameId,
        type: "CASUAL",
        typeLabel: "Đánh Thường",
        side: "red",
        opponent: { displayName: name, isGuest: true },
        result: {
          kind: "WIN",
          reason: "RESIGN",
          label: "Thắng",
          countsForWdl: true,
        },
        eloDelta: null,
        startedAt: "2026-10-11T01:00:00.000001Z",
        endedAt: "2026-10-11T02:00:00.000001Z",
        replayPath: `/history/${gameId}`,
      },
    ],
    nextCursor: null,
  };
}
function deferred() {
  let resolve!: (p: Page) => void;
  const promise = new Promise<Page>((r) => (resolve = r));
  return { promise, resolve };
}
it("loads actual account rows, own side/reason and replay callback without Elo/avatar", async () => {
  const client = { list: vi.fn().mockResolvedValue(page()) },
    onReplay = vi.fn();
  render(createElement(HistoryPage, { client, onReplay }));
  expect(await screen.findByText("Khách")).toBeTruthy();
  expect(screen.getByText("Đỏ")).toBeTruthy();
  expect(screen.getByText("Đầu hàng")).toBeTruthy();
  await userEvent.click(screen.getByRole("button", { name: /Xem lại/ }));
  expect(onReplay).toHaveBeenCalledWith(id);
  expect(screen.queryByText(/Elo/)).toBeNull();
  expect(screen.queryByRole("img")).toBeNull();
});
it("keyboard filter loads Ranked unavailable instead of fake stats", async () => {
  const client = {
    list: vi
      .fn()
      .mockResolvedValueOnce(page())
      .mockRejectedValueOnce(
        new HistoryRequestError(503, "HISTORY_RANKED_UNAVAILABLE"),
      ),
  };
  render(createElement(HistoryPage, { client, onReplay: vi.fn() }));
  await screen.findByText("Khách");
  screen.getByRole("button", { name: "Đánh Hạng" }).focus();
  await userEvent.keyboard("{Enter}");
  expect(screen.queryByText("Khách")).toBeNull();
  expect((await screen.findByRole("alert")).textContent).toBe(
    "Lịch sử Đánh Hạng chưa sẵn sàng.",
  );
  expect(client.list).toHaveBeenLastCalledWith({ filter: "RANKED", limit: 20 });
});
it("drops late previous-filter response", async () => {
  const old = deferred(),
    current = deferred();
  const client = {
    list: vi
      .fn()
      .mockReturnValueOnce(old.promise)
      .mockReturnValueOnce(current.promise),
  };
  render(createElement(HistoryPage, { client, onReplay: vi.fn() }));
  await userEvent.click(screen.getByRole("button", { name: "Đấu với Máy" }));
  old.resolve(page("Private old"));
  current.resolve({ items: [], nextCursor: null });
  expect(
    await screen.findByText("Chưa có ván đấu trong bộ lọc này."),
  ).toBeTruthy();
  expect(screen.queryByText("Private old")).toBeNull();
});
it("hides previous-client data immediately and ignores its pending page after logout/client replacement", async () => {
  const old = deferred(),
    next = deferred();
  const client = { list: vi.fn().mockReturnValueOnce(old.promise) },
    replacement = { list: vi.fn().mockReturnValueOnce(next.promise) };
  const view = render(
    createElement(HistoryPage, { client, onReplay: vi.fn() }),
  );
  view.rerender(
    createElement(HistoryPage, { client: replacement, onReplay: vi.fn() }),
  );
  old.resolve(page("Private prior account"));
  next.resolve(page("New account"));
  await screen.findByText("New account");
  expect(screen.queryByText("Private prior account")).toBeNull();
  view.unmount();
});
it("clears loaded rows when client identity changes", async () => {
  const client = { list: vi.fn().mockResolvedValue(page("Old account")) },
    next = deferred();
  const view = render(
    createElement(HistoryPage, { client, onReplay: vi.fn() }),
  );
  await screen.findByText("Old account");
  view.rerender(
    createElement(HistoryPage, {
      client: { list: vi.fn().mockReturnValue(next.promise) },
      onReplay: vi.fn(),
    }),
  );
  expect(screen.queryByText("Old account")).toBeNull();
  next.resolve({ items: [], nextCursor: null });
  await screen.findByText("Chưa có ván đấu trong bộ lọc này.");
});
it("appends canonical cursor pages once and rejects duplicate rows", async () => {
  const first = page("First");
  first.nextCursor = { endedAt: first.items[0]!.endedAt, matchId: id };
  const pending = deferred();
  const client = {
    list: vi
      .fn()
      .mockResolvedValueOnce(first)
      .mockReturnValueOnce(pending.promise)
      .mockResolvedValueOnce(first),
  };
  render(createElement(HistoryPage, { client, onReplay: vi.fn() }));
  await screen.findByText("First");
  await userEvent.dblClick(
    screen.getByRole("button", { name: "Tải thêm ván" }),
  );
  expect(client.list).toHaveBeenCalledTimes(2);
  expect(client.list).toHaveBeenLastCalledWith({
    filter: "ALL",
    limit: 20,
    cursor: first.nextCursor,
  });
  const second = page("Second", other);
  second.items[0]!.endedAt = "2026-10-11T02:00:00.000000Z";
  second.nextCursor = { endedAt: second.items[0]!.endedAt, matchId: other };
  pending.resolve(second);
  await screen.findByText("Second");
  await userEvent.click(screen.getByRole("button", { name: "Tải thêm ván" }));
  expect(await screen.findByRole("alert")).toBeTruthy();
  expect(screen.getAllByText("First")).toHaveLength(1);
});
it("preserves rows on transient page error, sanitizes raw failure and allows explicit retry", async () => {
  const first = page();
  first.nextCursor = { endedAt: first.items[0]!.endedAt, matchId: id };
  const client = {
    list: vi
      .fn()
      .mockResolvedValueOnce(first)
      .mockRejectedValueOnce(Error("secret@example.invalid"))
      .mockResolvedValueOnce({ items: [], nextCursor: null }),
  };
  render(createElement(HistoryPage, { client, onReplay: vi.fn() }));
  await screen.findByText("Khách");
  await userEvent.click(screen.getByRole("button", { name: "Tải thêm ván" }));
  expect((await screen.findByRole("alert")).textContent).toBe(
    "Chưa thể tải lịch sử. Vui lòng thử lại.",
  );
  expect(screen.queryByText(/secret/)).toBeNull();
  expect(screen.getByText("Khách")).toBeTruthy();
  await userEvent.click(screen.getByRole("button", { name: "Thử lại" }));
  await waitFor(() => expect(client.list).toHaveBeenCalledTimes(3));
});
it("clears private history on auth/permission denial", async () => {
  const first = page();
  first.nextCursor = { endedAt: first.items[0]!.endedAt, matchId: id };
  const client = {
    list: vi
      .fn()
      .mockResolvedValueOnce(first)
      .mockRejectedValueOnce(new HistoryRequestError(401, "AUTH_REQUIRED")),
  };
  render(createElement(HistoryPage, { client, onReplay: vi.fn() }));
  await screen.findByText("Khách");
  await userEvent.click(screen.getByRole("button", { name: "Tải thêm ván" }));
  await screen.findByRole("alert");
  expect(screen.queryByText("Khách")).toBeNull();
});
it("shows AI difficulty and interrupted exclusion, handles unmount before completion", async () => {
  const p = page();
  Object.assign(p.items[0]!, {
    type: "AI",
    typeLabel: "Đấu với Máy - Khó",
    aiLevel: "HARD",
    opponent: { displayName: "Máy", isGuest: false },
    result: {
      kind: "INTERRUPTED",
      reason: "AI_UNAVAILABLE",
      label: "Bị gián đoạn",
      countsForWdl: false,
    },
  });
  const client = { list: vi.fn().mockResolvedValue(p) };
  const view = render(
    createElement(HistoryPage, { client, onReplay: vi.fn() }),
  );
  expect(await screen.findByText("Đấu với Máy - Khó")).toBeTruthy();
  expect(screen.getByText("Không tính thắng/thua/hòa")).toBeTruthy();
  view.unmount();
  const late = deferred();
  const view2 = render(
    createElement(HistoryPage, {
      client: { list: vi.fn().mockReturnValue(late.promise) },
      onReplay: vi.fn(),
    }),
  );
  view2.unmount();
  late.resolve(page());
});
