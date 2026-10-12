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
  ReconnectStatus,
  type ReconnectStatusProps,
} from "./ReconnectStatus.js";
const originalShow = Object.getOwnPropertyDescriptor(
  HTMLDialogElement.prototype,
  "showModal",
);
const originalClose = Object.getOwnPropertyDescriptor(
  HTMLDialogElement.prototype,
  "close",
);
let monotonicNow = 1000;
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "Date"] });
  monotonicNow = 1000;
  vi.spyOn(performance, "now").mockImplementation(() => monotonicNow);
  // jsdom lacks native dialog modality; actual browser inert/focus is separate.
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.removeAttribute("open");
    },
  });
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  for (const [name, descriptor] of [
    ["showModal", originalShow],
    ["close", originalClose],
  ] as const) {
    if (descriptor)
      Object.defineProperty(HTMLDialogElement.prototype, name, descriptor);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, name);
  }
});
const base: ReconnectStatusProps = {
  connected: true,
  waitingForSnapshot: false,
  ownRole: "red",
  matchStatus: "ACTIVE",
  opponentGraceUntil: null,
  serverNow: "2026-10-11T00:00:00Z",
};
function advance(ms: number) {
  act(() => {
    monotonicNow += ms;
    vi.advanceTimersByTime(ms);
  });
}
function show(props: Partial<ReconnectStatusProps> = {}) {
  return render(createElement(ReconnectStatus, { ...base, ...props }));
}
it("is absent for a healthy synced room", () => {
  show();
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.queryByRole("timer")).toBeNull();
  expect(vi.getTimerCount()).toBe(0);
});
it.each(["red", "black"] as const)(
  "the disconnected %s player's blocking 60s countdown is explicitly estimated",
  (ownRole) => {
    show({ connected: false, ownRole });
    expect(
      screen.getByRole("dialog", { name: "Đang kết nối lại…" }),
    ).toBeTruthy();
    expect(screen.getByText("Thời gian chờ ước tính")).toBeTruthy();
    expect(screen.getByRole("timer").textContent).toBe("01:00");
    advance(1500);
    expect(screen.getByRole("timer").textContent).toBe("00:59");
    expect(screen.getByRole("timer").getAttribute("aria-live")).toBe("off");
    expect(screen.queryByRole("button")).toBeNull();
  },
);
it("retains elapsed estimate on repeated props and bare reconnect until a fresh snapshot has arrived", () => {
  const view = show({ connected: false, waitingForSnapshot: true });
  advance(5000);
  view.rerender(
    createElement(ReconnectStatus, {
      ...base,
      connected: false,
      waitingForSnapshot: true,
    }),
  );
  expect(screen.getByRole("timer").textContent).toBe("00:55");
  view.rerender(
    createElement(ReconnectStatus, { ...base, waitingForSnapshot: true }),
  );
  advance(2000);
  expect(screen.getByRole("dialog")).toBeTruthy();
  expect(screen.getByRole("timer").textContent).toBe("00:53");
  expect(
    screen.getByText("Đã kết nối. Đang đồng bộ trạng thái máy chủ…"),
  ).toBeTruthy();
  view.rerender(createElement(ReconnectStatus, base));
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(vi.getTimerCount()).toBe(0);
});
it("zero remains awaiting server confirmation without declaring defeat, closing, or starting a match", () => {
  show({ connected: false });
  advance(61000);
  expect(screen.getByRole("timer").textContent).toBe("00:00");
  expect(
    screen.getByText("Đang chờ máy chủ xác nhận trạng thái ván."),
  ).toBeTruthy();
  expect(screen.getByRole("dialog")).toBeTruthy();
  expect(screen.queryByText(/bạn thua|bạn thắng|ván mới/i)).toBeNull();
});
it("Escape/backdrop cannot dismiss the own overlay and keyboard focus stays inside until cleanup", () => {
  const trigger = document.createElement("button");
  document.body.append(trigger);
  trigger.focus();
  const view = show({ connected: false });
  const modal = screen.getByRole("dialog");
  expect(document.activeElement).toBe(modal);
  const cancel = new Event("cancel", { cancelable: true, bubbles: true });
  fireEvent(modal, cancel);
  const escape = new KeyboardEvent("keydown", {
    key: "Escape",
    bubbles: true,
    cancelable: true,
  });
  fireEvent(modal, escape);
  expect(escape.defaultPrevented).toBe(true);
  fireEvent.click(modal);
  expect(cancel.defaultPrevented).toBe(true);
  expect(screen.getByRole("dialog")).toBeTruthy();
  const tab = new KeyboardEvent("keydown", {
    key: "Tab",
    bubbles: true,
    cancelable: true,
  });
  fireEvent(modal, tab);
  expect(tab.defaultPrevented).toBe(true);
  view.unmount();
  expect(document.activeElement).toBe(trigger);
  trigger.remove();
});
it.each([null, "FINISHED", "INTERRUPTED"] as const)(
  "%s state uses a connection notice without a game countdown or blocking result",
  (matchStatus) => {
    show({ connected: false, matchStatus });
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByRole("timer")).toBeNull();
    expect(
      screen.getByText(
        "Đang nối lại phòng. Trạng thái sẽ được đồng bộ từ máy chủ.",
      ),
    ).toBeTruthy();
    expect(vi.getTimerCount()).toBe(0);
  },
);
it("a disconnected spectator has no 60-second player threat and no blocking modal", () => {
  show({ connected: false, ownRole: "spectator" });
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.queryByRole("timer")).toBeNull();
  expect(screen.getByText("Đang nối lại kết nối xem phòng.")).toBeTruthy();
});
it("opponent countdown is nonmodal, derives its deadline from server time, and ignores local wall-clock skew", () => {
  const view = show({ opponentGraceUntil: "2026-10-11T07:00:45+07:00" });
  expect(
    screen.getByText("Đối thủ đang mất kết nối. Thời gian chờ:"),
  ).toBeTruthy();
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.getByRole("timer").textContent).toBe("00:45");
  vi.setSystemTime(new Date("2045-01-01T00:00:00Z"));
  advance(2500);
  expect(screen.getByRole("timer").textContent).toBe("00:43");
  view.rerender(
    createElement(ReconnectStatus, {
      ...base,
      opponentGraceUntil: "2026-10-11T07:00:45+07:00",
    }),
  );
  expect(screen.getByRole("timer").textContent).toBe("00:43");
});
it("visibility return catches up suspended callbacks and a fresh server sample rebases actual grace", () => {
  const view = show({ opponentGraceUntil: "2026-10-11T00:01:00Z" });
  act(() => {
    monotonicNow += 30000;
  });
  fireEvent(document, new Event("visibilitychange"));
  expect(screen.getByRole("timer").textContent).toBe("00:30");
  view.rerender(
    createElement(ReconnectStatus, {
      ...base,
      opponentGraceUntil: "2026-10-11T00:01:00Z",
      serverNow: "2026-10-11T00:00:32Z",
    }),
  );
  expect(screen.getByRole("timer").textContent).toBe("00:28");
  advance(29000);
  expect(screen.getByRole("timer").textContent).toBe("00:00");
  expect(
    screen.getByText("Đang chờ máy chủ xác nhận trạng thái ván."),
  ).toBeTruthy();
});
it("fresh terminal status or opponent recovery removes the grace timer without stopping separate game clocks", () => {
  const view = show({ opponentGraceUntil: "2026-10-11T00:01:00Z" });
  view.rerender(
    createElement(ReconnectStatus, {
      ...base,
      opponentGraceUntil: "2026-10-11T00:01:00Z",
      matchStatus: "FINISHED",
    }),
  );
  expect(screen.queryByRole("timer")).toBeNull();
  expect(vi.getTimerCount()).toBe(0);
  view.rerender(createElement(ReconnectStatus, base));
  expect(screen.queryByRole("timer")).toBeNull();
});
it("unmount cancels its original countdown handle and visibility callback", () => {
  const schedule = vi.spyOn(window, "setInterval");
  const cancel = vi.spyOn(window, "clearInterval");
  const add = vi.spyOn(document, "addEventListener");
  const remove = vi.spyOn(document, "removeEventListener");
  const view = show({ connected: false });
  expect(schedule).toHaveBeenCalledTimes(1);
  expect(schedule.mock.calls[0]?.[1]).toBe(200);
  const handle = schedule.mock.results[0]!.value;
  const listener = add.mock.calls.find(
    ([event]) => event === "visibilitychange",
  )?.[1];
  expect(listener).toEqual(expect.any(Function));
  view.unmount();
  expect(cancel).toHaveBeenCalledExactlyOnceWith(handle);
  expect(remove).toHaveBeenCalledWith("visibilitychange", listener);
});
