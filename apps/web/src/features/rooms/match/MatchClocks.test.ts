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
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import type { RoomStateSnapshot } from "@xiangqi/shared";
import { MatchClocks } from "./MatchClocks.js";

let monotonicNow = 1000;
beforeEach(() => {
  vi.useFakeTimers();
  monotonicNow = 1000;
  vi.spyOn(performance, "now").mockImplementation(() => monotonicNow);
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
});
function clock(
  redMs = 300000,
  blackMs = 300000,
  running: "red" | "black" | null = "red",
): NonNullable<RoomStateSnapshot["clocks"]> {
  return { redMs, blackMs, running, asOf: "2026-10-11T07:00:00+07:00" };
}
function advance(milliseconds: number) {
  act(() => {
    monotonicNow += milliseconds;
    vi.advanceTimersByTime(milliseconds);
  });
}
function shown(side: "Đỏ" | "Đen") {
  return screen.getByRole("timer", { name: `Thời gian ${side}` }).textContent;
}
it.each([5, 10, 15])(
  "shows the actual %i-minute server allocation with accessible non-live timers",
  (minutes) => {
    render(
      createElement(MatchClocks, {
        clocks: clock(minutes * 60000, minutes * 60000),
        matchStatus: "ACTIVE",
      }),
    );
    expect(shown("Đỏ")).toBe(`${String(minutes).padStart(2, "0")}:00`);
    expect(shown("Đen")).toBe(`${String(minutes).padStart(2, "0")}:00`);
    expect(
      screen
        .getByRole("timer", { name: "Thời gian Đỏ" })
        .getAttribute("aria-live"),
    ).toBe("off");
    expect(
      within(screen.getByRole("group", { name: "Đỏ" })).getByText("Đang lượt"),
    ).toBeTruthy();
  },
);
it("ceil-rounds fractions, reduces only the current side, and rebases on a new authoritative turn", () => {
  const view = render(
    createElement(MatchClocks, {
      clocks: clock(59999, 120000),
      matchStatus: "ACTIVE",
    }),
  );
  expect(shown("Đỏ")).toBe("01:00");
  advance(999);
  expect(shown("Đỏ")).toBe("00:59");
  expect(shown("Đen")).toBe("02:00");
  view.rerender(
    createElement(MatchClocks, {
      clocks: clock(58400, 119900, "black"),
      matchStatus: "ACTIVE",
    }),
  );
  expect(shown("Đỏ")).toBe("00:59");
  expect(shown("Đen")).toBe("02:00");
  advance(1500);
  expect(shown("Đỏ")).toBe("00:59");
  expect(shown("Đen")).toBe("01:59");
  expect(
    within(screen.getByRole("group", { name: "Đen" })).getByText("Đang lượt"),
  ).toBeTruthy();
});
it("does not restart elapsed time on unrelated rerenders or pause on a connection outage", () => {
  const clocks = clock();
  const view = render(
    createElement(MatchClocks, { clocks, matchStatus: "ACTIVE" }),
  );
  advance(2000);
  view.rerender(
    createElement(MatchClocks, {
      clocks,
      matchStatus: "ACTIVE",
      connected: false,
    }),
  );
  advance(3000);
  expect(shown("Đỏ")).toBe("04:55");
  expect(shown("Đen")).toBe("05:00");
});
it("ignores local wall-clock skew and catches up on visibility return even when timer callbacks were suspended", () => {
  render(
    createElement(MatchClocks, { clocks: clock(), matchStatus: "ACTIVE" }),
  );
  vi.setSystemTime(new Date("2045-06-01T00:00:00Z"));
  act(() => {
    monotonicNow += 61000;
  });
  fireEvent(document, new Event("visibilitychange"));
  expect(shown("Đỏ")).toBe("03:59");
  expect(shown("Đen")).toBe("05:00");
});
it("rebases a fresh snapshot after reconnect without subtracting its server asOf again", () => {
  const view = render(
    createElement(MatchClocks, {
      clocks: clock(),
      matchStatus: "ACTIVE",
      connected: false,
    }),
  );
  advance(4500);
  view.rerender(
    createElement(MatchClocks, {
      clocks: { ...clock(293400, 300000), asOf: "2026-10-11T00:00:06.600Z" },
      matchStatus: "ACTIVE",
      connected: true,
    }),
  );
  expect(shown("Đỏ")).toBe("04:54");
  advance(1000);
  expect(shown("Đỏ")).toBe("04:53");
});
it.each(["FINISHED", "INTERRUPTED"] as const)(
  "freezes authoritative terminal times for %s and cleans its timer",
  (matchStatus) => {
    const view = render(
      createElement(MatchClocks, { clocks: clock(), matchStatus: "ACTIVE" }),
    );
    advance(1000);
    view.rerender(
      createElement(MatchClocks, { clocks: clock(12345, 23000), matchStatus }),
    );
    advance(5000);
    expect(shown("Đỏ")).toBe("00:13");
    expect(shown("Đen")).toBe("00:23");
    expect(screen.queryByText("Đang lượt")).toBeNull();
    expect(vi.getTimerCount()).toBe(0);
    view.unmount();
  },
);
it("clamps at zero and waits for the server without declaring a result", () => {
  render(
    createElement(MatchClocks, {
      clocks: clock(900, 30000),
      matchStatus: "ACTIVE",
    }),
  );
  advance(2000);
  expect(shown("Đỏ")).toBe("00:00");
  expect(screen.getByText("Đang chờ máy chủ xác nhận hết giờ.")).toBeTruthy();
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.queryByText(/thắng|thua/i)).toBeNull();
});
it("does not invent clocks before a match and removes timers and visibility listeners on unmount", () => {
  const view = render(
    createElement(MatchClocks, { clocks: null, matchStatus: null }),
  );
  expect(screen.queryByRole("timer")).toBeNull();
  expect(screen.getByText("Chưa có đồng hồ thi đấu.")).toBeTruthy();
  view.rerender(
    createElement(MatchClocks, { clocks: clock(), matchStatus: "ACTIVE" }),
  );
  expect(vi.getTimerCount()).toBe(1);
  const remove = vi.spyOn(document, "removeEventListener");
  view.unmount();
  expect(vi.getTimerCount()).toBe(0);
  expect(remove).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
});
