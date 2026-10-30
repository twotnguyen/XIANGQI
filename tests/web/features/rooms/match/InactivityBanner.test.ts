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
import {
  InactivityBanner,
  type InactivityBannerProps,
} from "@web/features/rooms/match/InactivityBanner.js";

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

const match: NonNullable<InactivityBannerProps["match"]> = {
  id: "33333333-3333-4333-8333-333333333333",
  version: 1,
  position: "unused",
  lastMove: null,
  turn: "red",
  status: "ACTIVE",
  winner: null,
  endedAt: null,
  result: null,
  inactivity: {
    promptAt: "2026-10-31T00:03:00Z",
    expiresAt: "2026-10-31T00:03:30Z",
    confirmsLeft: 2,
  },
};
function setup(overrides: Partial<InactivityBannerProps> = {}) {
  const props: InactivityBannerProps = {
    match,
    role: "red",
    serverNow: "2026-10-31T00:00:00Z",
    onStillHere: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
  return { props, ...render(createElement(InactivityBanner, props)) };
}
function advance(milliseconds: number) {
  act(() => {
    monotonicNow += milliseconds;
    vi.advanceTimersByTime(milliseconds);
  });
}
function countdown() {
  return screen.getByRole("status").querySelector("strong")?.textContent;
}

it("shows the warning after three silent minutes and counts down without another server snapshot", () => {
  const view = setup();
  expect(screen.queryByRole("status")).toBeNull();
  advance(179500);
  expect(screen.queryByRole("status")).toBeNull();
  advance(500);
  expect(countdown()).toBe("30s");
  expect(screen.queryByRole("dialog")).toBeNull();
  advance(1000);
  expect(countdown()).toBe("29s");
  view.rerender(createElement(InactivityBanner, { ...view.props, busy: true }));
  advance(5000);
  expect(countdown()).toBe("24s");
  advance(30000);
  expect(countdown()).toBe("0s");
  expect(view.props.onStillHere).not.toHaveBeenCalled();
  expect(screen.queryByText(/Bạn thua|Bạn thắng/)).toBeNull();
});

it("rebases new server timestamps and confirmation deadlines without resetting on unrelated renders", () => {
  const view = setup({ serverNow: "2026-10-31T00:02:50Z" });
  advance(10000);
  expect(countdown()).toBe("30s");
  const refreshed = { ...view.props, serverNow: "2026-10-31T00:03:12Z" };
  view.rerender(createElement(InactivityBanner, refreshed));
  expect(countdown()).toBe("18s");
  advance(3000);
  expect(countdown()).toBe("15s");
  view.rerender(
    createElement(InactivityBanner, {
      ...refreshed,
      match: {
        ...match,
        version: 2,
        inactivity: {
          promptAt: "2026-10-31T00:06:12Z",
          expiresAt: "2026-10-31T00:06:42Z",
          confirmsLeft: 1,
        },
      },
    }),
  );
  expect(screen.queryByRole("status")).toBeNull();
  advance(180000);
  expect(countdown()).toBe("30s");
});

it.each<Partial<InactivityBannerProps>>([
  { role: "spectator" },
  { role: "black" },
  { match: { ...match, status: "FINISHED" } },
  { match: { ...match, inactivity: undefined } },
  { match: null },
])("keeps warnings and timers out of ineligible views: %j", (overrides) => {
  setup({ serverNow: "2026-10-31T00:03:00Z", ...overrides });
  advance(210000);
  expect(screen.queryByRole("status")).toBeNull();
  expect(vi.getTimerCount()).toBe(0);
});

it("offers confirmation only while the server allows another extension", () => {
  const view = setup({ serverNow: "2026-10-31T00:03:00Z" });
  fireEvent.click(screen.getByRole("button", { name: "Tôi còn đây" }));
  expect(view.props.onStillHere).toHaveBeenCalledOnce();
  view.rerender(
    createElement(InactivityBanner, {
      ...view.props,
      match: {
        ...match,
        inactivity: { ...match.inactivity!, confirmsLeft: 0 },
      },
    }),
  );
  expect(countdown()).toBe("30s");
  expect(screen.queryByRole("button", { name: "Tôi còn đây" })).toBeNull();
  advance(1000);
  expect(countdown()).toBe("29s");
});

it("catches up after background suspension and ignores changes to the local wall clock", () => {
  const view = setup();
  vi.setSystemTime(new Date("2045-06-01T00:00:00Z"));
  act(() => {
    monotonicNow += 185000;
  });
  fireEvent(document, new Event("visibilitychange"));
  expect(countdown()).toBe("25s");
  const remove = vi.spyOn(document, "removeEventListener");
  view.unmount();
  expect(vi.getTimerCount()).toBe(0);
  expect(remove).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
});
