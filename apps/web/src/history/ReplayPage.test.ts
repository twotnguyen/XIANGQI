// @vitest-environment jsdom
import { createElement } from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import {
  initialPosition,
  playMove,
  serializePosition,
} from "@xiangqi/xiangqi-core";
import { ReplayPage } from "./ReplayPage.js";
import {
  ReplayRequestError,
  type ReplayClient,
  type ReplayRecord,
} from "./replay-client.js";
afterEach(cleanup);
const id = "11111111-1111-4111-8111-111111111111";
function record(matchId = id): ReplayRecord {
  const p0 = initialPosition(),
    p1 = playMove(p0, { from: 54, to: 45 });
  return {
    id: matchId,
    mode: "CASUAL",
    side: "red",
    positions: [p0, p1].map((p) => ({
      fen: serializePosition(p),
      turn: p.turn,
    })),
    moves: [{ from: 54, to: 45, side: "red" }],
  };
}
it("loads the authorized replay and renders real readonly board with Vietnamese notation", async () => {
  const client = { read: vi.fn().mockResolvedValue(record()) };
  render(createElement(ReplayPage, { id, client }));
  expect(screen.getByRole("status").textContent).toContain("Đang tải");
  await screen.findByRole("heading", { name: "Biên bản ván đấu" });
  expect(client.read).toHaveBeenCalledExactlyOnceWith(id);
  expect(screen.getByRole("heading", { level: 1 }).textContent).toBe(
    "Xem lại ván đấu",
  );
  expect(screen.getByText("Tốt 9 tiến 1")).toBeTruthy();
  expect(
    screen.getByRole("link", { name: "Về lịch sử" }).getAttribute("href"),
  ).toBe("/history");
});
it("never reflects private upstream details and retries an unavailable replay", async () => {
  const client = {
    read: vi
      .fn()
      .mockRejectedValueOnce(Error("PRIVATE_PROVIDER"))
      .mockResolvedValueOnce(record()),
  };
  render(createElement(ReplayPage, { id, client }));
  await screen.findByRole("alert");
  expect(screen.queryByText("PRIVATE_PROVIDER")).toBeNull();
  expect(
    screen.queryByRole("heading", { name: "Biên bản ván đấu" }),
  ).toBeNull();
  fireEvent.click(screen.getByRole("button", { name: "Thử lại" }));
  await screen.findByRole("heading", { name: "Biên bản ván đấu" });
  expect(client.read).toHaveBeenCalledTimes(2);
});
it.each([401, 403, 404, 409])(
  "shows a safe %s denial with no replay board",
  async (status) => {
    const client = {
      read: vi
        .fn()
        .mockRejectedValue(new ReplayRequestError(status, "REPLAY_NOT_FOUND")),
    };
    render(createElement(ReplayPage, { id, client }));
    await screen.findByRole("alert");
    expect(
      screen.queryByRole("heading", { name: "Biên bản ván đấu" }),
    ).toBeNull();
    expect(screen.queryByRole("button", { name: "Nước tiếp" })).toBeNull();
  },
);
it("hides the previous replay immediately and ignores its late response after match changes", async () => {
  let release!: (r: ReplayRecord) => void;
  const next = "22222222-2222-4222-8222-222222222222";
  const client = {
    read: vi
      .fn()
      .mockImplementationOnce(
        () =>
          new Promise<ReplayRecord>((done) => {
            release = done;
          }),
      )
      .mockResolvedValue(record(next)),
  };
  const view = render(createElement(ReplayPage, { id, client }));
  view.rerender(createElement(ReplayPage, { id: next, client }));
  await screen.findByRole("heading", { name: "Biên bản ván đấu" });
  await act(async () =>
    release({ ...record(), moves: [], positions: [record().positions[0]!] }),
  );
  expect(screen.queryByText("Ván đấu kết thúc ở thế cờ ban đầu.")).toBeNull();
  expect(screen.getByText("Tốt 9 tiến 1")).toBeTruthy();
});
it("removes old data immediately when the authorized client changes and ignores unmounted work", async () => {
  const client = { read: vi.fn().mockResolvedValue(record()) };
  const view = render(createElement(ReplayPage, { id, client }));
  await screen.findByRole("heading", { name: "Biên bản ván đấu" });
  let release!: (r: ReplayRecord) => void;
  const changed: ReplayClient = {
    read: () =>
      new Promise<ReplayRecord>((done) => {
        release = done;
      }),
  };
  view.rerender(createElement(ReplayPage, { id, client: changed }));
  expect(
    screen.queryByRole("heading", { name: "Biên bản ván đấu" }),
  ).toBeNull();
  view.unmount();
  await act(async () => release(record()));
  expect(
    screen.queryByRole("heading", { name: "Biên bản ván đấu" }),
  ).toBeNull();
});
