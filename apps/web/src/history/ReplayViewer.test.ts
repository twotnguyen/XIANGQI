// @vitest-environment jsdom
import { createElement } from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi } from "vitest";
import {
  initialPosition,
  parsePosition,
  playMove,
  serializePosition,
  type PieceType,
} from "@xiangqi/xiangqi-core";
import { ReplayViewer } from "./ReplayViewer.js";
import type { ReplayRecord } from "./replay-client.js";
const labels = ["Tốt 9 tiến 1", "Tốt 1 tiến 1", "Tốt 7 tiến 1"];
function record(): ReplayRecord {
  let p = initialPosition();
  const positions = [{ fen: serializePosition(p), turn: p.turn }];
  const moves: ReplayRecord["moves"] = [];
  for (const move of [
    { from: 54, to: 45 },
    { from: 27, to: 36 },
    { from: 56, to: 47 },
  ]) {
    moves.push({ ...move, side: p.turn });
    p = playMove(p, move);
    positions.push({ fen: serializePosition(p), turn: p.turn });
  }
  return {
    id: "11111111-1111-4111-8111-111111111111",
    mode: "CASUAL",
    side: "red",
    moves,
    positions,
  };
}
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});
function boardAt(r: ReplayRecord, index: number) {
  const p = parsePosition(r.positions[index]!.fen);
  const board = screen.getByRole("group", {
    name: `Bàn cờ tướng — ${r.side === "red" ? "Đỏ" : "Đen"} ở phía dưới`,
  });
  const names: Record<PieceType, string> = {
    king: "Tướng",
    advisor: "Sĩ",
    elephant: "Tượng",
    horse: "Mã",
    rook: "Xe",
    cannon: "Pháo",
    pawn: "Tốt",
  };
  expect(within(board).getAllByRole("img")).toHaveLength(
    p.board.filter(Boolean).length,
  );
  for (const [i, piece] of p.board.entries())
    if (piece)
      expect(
        within(board).getByRole("img", {
          name: `${names[piece.type]} ${piece.side === "red" ? "đỏ" : "đen"}, cột ${(i % 9) + 1} hàng ${Math.floor(i / 9) + 1}`,
        }),
      ).toBeTruthy();
  expect(
    screen.getByText(`Lượt: ${p.turn === "red" ? "Đỏ" : "Đen"}`, {
      exact: false,
    }),
  ).toBeTruthy();
  expect(screen.getByText(`Nước ${index} / ${r.moves.length}`)).toBeTruthy();
  expect(within(board).queryByRole("button")).toBeNull();
}
function button(name: string) {
  return screen.getByRole("button", { name });
}
it("never sends requests when inspecting pieces or stepping the replay", () => {
  const request = vi
    .spyOn(globalThis, "fetch")
    .mockRejectedValue(Error("Unexpected replay request"));
  const r = record();
  render(createElement(ReplayViewer, { record: r, moveLabels: labels }));
  fireEvent.click(screen.getByRole("img", { name: "Tốt đỏ, cột 1 hàng 7" }));
  fireEvent.click(button("Nước tiếp"));
  fireEvent.click(button("Đến cuối ván"));
  boardAt(r, 3);
  expect(request).not.toHaveBeenCalled();
});
it("shows initial actual SVG board with player's black side below, only canonical labels and no move commands", () => {
  const r = record();
  r.side = "black";
  render(createElement(ReplayViewer, { record: r, moveLabels: labels }));
  boardAt(r, 0);
  expect(button("Về đầu ván").getAttribute("aria-disabled")).toBe("true");
  expect(button("Nước trước").getAttribute("aria-disabled")).toBe("true");
  expect(screen.queryByText("54")).toBeNull();
});
it("first/previous/next/last select exact board positions and boundary controls cannot move past limits", () => {
  const r = record();
  render(createElement(ReplayViewer, { record: r, moveLabels: labels }));
  fireEvent.click(button("Nước trước"));
  boardAt(r, 0);
  fireEvent.click(button("Nước tiếp"));
  boardAt(r, 1);
  fireEvent.click(button("Đến cuối ván"));
  boardAt(r, 3);
  expect(button("Nước tiếp").getAttribute("aria-disabled")).toBe("true");
  fireEvent.click(button("Nước tiếp"));
  boardAt(r, 3);
  fireEvent.click(button("Nước trước"));
  boardAt(r, 2);
  fireEvent.click(button("Về đầu ván"));
  boardAt(r, 0);
});
it("jumps to the selected effective move and highlights just that move", () => {
  const r = record();
  render(createElement(ReplayViewer, { record: r, moveLabels: labels }));
  fireEvent.click(button("Nước 2: Tốt 1 tiến 1"));
  boardAt(r, 2);
  expect(button("Nước 2: Tốt 1 tiến 1").getAttribute("aria-current")).toBe(
    "step",
  );
  expect(button("Nước 1: Tốt 9 tiến 1").hasAttribute("aria-current")).toBe(
    false,
  );
});
it("supports keyboard activation while retaining focus on the control", async () => {
  const r = record();
  render(createElement(ReplayViewer, { record: r, moveLabels: labels }));
  const next = button("Nước tiếp");
  next.focus();
  await userEvent.keyboard("{Enter}");
  boardAt(r, 1);
  expect(document.activeElement).toBe(next);
});
it("autoplays every exact1500ms, stops at the final effective move and makes no extra ticks", () => {
  vi.useFakeTimers();
  const r = record();
  render(createElement(ReplayViewer, { record: r, moveLabels: labels }));
  fireEvent.click(button("Tự động phát"));
  act(() => {
    vi.advanceTimersByTime(1499);
  });
  boardAt(r, 0);
  act(() => {
    vi.advanceTimersByTime(1);
  });
  boardAt(r, 1);
  act(() => {
    vi.advanceTimersByTime(1500);
  });
  boardAt(r, 2);
  act(() => {
    vi.advanceTimersByTime(1500);
  });
  boardAt(r, 3);
  expect(button("Tự động phát").getAttribute("aria-pressed")).toBe("false");
  expect(vi.getTimerCount()).toBe(0);
  act(() => {
    vi.advanceTimersByTime(6000);
  });
  boardAt(r, 3);
});
it("pause freezes the current position and resume starts a fresh1500ms interval", () => {
  vi.useFakeTimers();
  const r = record();
  render(createElement(ReplayViewer, { record: r, moveLabels: labels }));
  fireEvent.click(button("Tự động phát"));
  act(() => {
    vi.advanceTimersByTime(1500);
  });
  fireEvent.click(button("Tạm dừng"));
  act(() => {
    vi.advanceTimersByTime(6000);
  });
  boardAt(r, 1);
  fireEvent.click(button("Tự động phát"));
  act(() => {
    vi.advanceTimersByTime(1499);
  });
  boardAt(r, 1);
  act(() => {
    vi.advanceTimersByTime(1);
  });
  boardAt(r, 2);
});
it("manual jump pauses autoplay and removes its timer", () => {
  vi.useFakeTimers();
  const r = record();
  render(createElement(ReplayViewer, { record: r, moveLabels: labels }));
  fireEvent.click(button("Tự động phát"));
  fireEvent.click(button("Nước 2: Tốt 1 tiến 1"));
  expect(vi.getTimerCount()).toBe(0);
  act(() => {
    vi.advanceTimersByTime(3000);
  });
  boardAt(r, 2);
});
it("resets position and playback immediately when record identity changes, and cleans up on unmount", () => {
  vi.useFakeTimers();
  const r = record();
  const view = render(
    createElement(ReplayViewer, { record: r, moveLabels: labels }),
  );
  fireEvent.click(button("Tự động phát"));
  act(() => {
    vi.advanceTimersByTime(1500);
  });
  boardAt(r, 1);
  const other = record();
  other.id = "22222222-2222-4222-8222-222222222222";
  other.side = "black";
  view.rerender(
    createElement(ReplayViewer, { record: other, moveLabels: labels }),
  );
  boardAt(other, 0);
  expect(vi.getTimerCount()).toBe(0);
  fireEvent.click(button("Tự động phát"));
  view.unmount();
  expect(vi.getTimerCount()).toBe(0);
});
it("also resets when a refreshed same-ID record replaces the parsed record", () => {
  const r = record();
  const view = render(
    createElement(ReplayViewer, { record: r, moveLabels: labels }),
  );
  fireEvent.click(button("Đến cuối ván"));
  const fresh = record();
  view.rerender(
    createElement(ReplayViewer, { record: fresh, moveLabels: labels }),
  );
  boardAt(fresh, 0);
});
it("keeps a zero-move initial board valid with all playback controls unavailable", () => {
  const r = record();
  r.moves = [];
  r.positions = r.positions.slice(0, 1);
  render(createElement(ReplayViewer, { record: r, moveLabels: [] }));
  boardAt(r, 0);
  for (const name of [
    "Về đầu ván",
    "Nước trước",
    "Nước tiếp",
    "Đến cuối ván",
    "Tự động phát",
  ]) {
    expect(button(name).getAttribute("aria-disabled")).toBe("true");
    fireEvent.click(button(name));
  }
  boardAt(r, 0);
});
