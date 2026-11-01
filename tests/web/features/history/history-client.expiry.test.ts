// @vitest-environment jsdom
import { createElement } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import {
  makeHistoryClient,
  type HistoryItem,
} from "@web/features/history/history-client.js";
import { HistoryPage } from "@web/features/history/HistoryPage.js";
afterEach(cleanup);
const id = "00000000-0000-0000-0000-000000000001";
function item(): HistoryItem {
  return {
    id,
    type: "AI",
    typeLabel: "Đấu với Máy - Dễ",
    side: "red",
    aiLevel: "EASY",
    opponent: { displayName: "Máy", isGuest: false },
    result: {
      kind: "ABANDONED",
      reason: "AI_UNAVAILABLE",
      label: "Bỏ dở",
      countsForWdl: false,
    },
    eloDelta: null,
    startedAt: "2026-10-10T01:00:00.000000Z",
    endedAt: "2026-10-10T01:31:00.000000Z",
    replayPath: `/history/${id}`,
  };
}
function client(value: HistoryItem) {
  return makeHistoryClient(
    vi.fn(
      async () =>
        new Response(JSON.stringify({ items: [value], nextCursor: null }), {
          headers: { "Content-Type": "application/json" },
        }),
    ),
  );
}
it("accepts ranked Elo changes through the real client and rejects casual Elo", async () => {
  const value = item();
  delete value.aiLevel;
  value.type = "RANKED";
  value.typeLabel = "Đánh Hạng";
  value.opponent = { displayName: "Đối thủ", isGuest: false };
  value.result = { kind: "WIN", reason: "RESIGN", label: "Thắng", countsForWdl: true };
  value.eloDelta = 16;
  render(createElement(HistoryPage, { client: client(value), onReplay: vi.fn() }));
  expect(await screen.findByText("+16")).toBeTruthy();
  value.type = "CASUAL";
  value.typeLabel = "Đánh Thường";
  await expect(client(value).list()).rejects.toThrow();
});
it("accepts expiry history through the real client parser and renders Bỏ dở without an engine failure claim", async () => {
  render(
    createElement(HistoryPage, { client: client(item()), onReplay: vi.fn() }),
  );
  expect(await screen.findByText("Bỏ dở")).toBeTruthy();
  expect(screen.getByText("Mất kết nối quá 30 phút")).toBeTruthy();
  expect(screen.getByText("Không tính thắng/thua/hòa")).toBeTruthy();
  expect(screen.queryByText("Máy cờ gặp sự cố")).toBeNull();
});
it("keeps ordinary engine interruption distinct from disconnect abandonment", async () => {
  const value = item();
  value.result = {
    kind: "INTERRUPTED",
    reason: "AI_UNAVAILABLE",
    label: "Bị gián đoạn",
    countsForWdl: false,
  };
  expect((await client(value).list()).items[0]?.result).toEqual(value.result);
});
it.each([{ countsForWdl: true }, { label: "Thua" }, { reason: "RESIGN" }])(
  "rejects contradictory abandoned history: %j",
  async (change) => {
    const value = item();
    Object.assign(value.result, change);
    await expect(client(value).list()).rejects.toThrow();
  },
);
it("does not accept AI abandonment as a custom online match result", async () => {
  const value = item();
  value.type = "CASUAL";
  value.typeLabel = "Đánh Thường";
  delete value.aiLevel;
  await expect(client(value).list()).rejects.toThrow();
});

it("parses an aborted match and shows a neutral row without a replay button (AC-YC5-RV-06)", async () => {
  const value = item();
  value.type = "CASUAL";
  value.typeLabel = "Đánh Thường";
  delete value.aiLevel;
  value.opponent = { displayName: "Đối thủ", isGuest: false };
  value.result = {
    kind: "INTERRUPTED",
    reason: "ABORTED",
    label: "Ván bị hủy",
    countsForWdl: false,
  };
  expect((await client(value).list()).items[0]?.result).toEqual(value.result);
  render(
    createElement(HistoryPage, { client: client(value), onReplay: vi.fn() }),
  );
  expect(await screen.findByText("Ván bị hủy")).toBeTruthy();
  expect(screen.getByText("Hủy trước nước đầu tiên")).toBeTruthy();
  expect(screen.getByText("Không tính thắng/thua/hòa")).toBeTruthy();
  expect(screen.queryByRole("button", { name: /Xem lại/ })).toBeNull();
});
