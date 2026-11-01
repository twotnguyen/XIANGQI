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
import { MatchResult } from "@web/features/rooms/match/MatchResult.js";

const originalShow = Object.getOwnPropertyDescriptor(
  HTMLDialogElement.prototype,
  "showModal",
);
const originalClose = Object.getOwnPropertyDescriptor(
  HTMLDialogElement.prototype,
  "close",
);
beforeEach(() => {
  // jsdom has no native modal boundary; browser focus/inert is a separate gate.
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
  vi.restoreAllMocks();
  vi.useRealTimers();
  for (const [name, descriptor] of [
    ["showModal", originalShow],
    ["close", originalClose],
  ] as const) {
    if (descriptor)
      Object.defineProperty(HTMLDialogElement.prototype, name, descriptor);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, name);
  }
});
function match(
  result = "CHECKMATE",
  winner: "red" | "black" | null = "red",
): NonNullable<RoomStateSnapshot["match"]> {
  return {
    id: "match-1",
    version: 20,
    position: "server-position",
    lastMove: null,
    canAbort: false,
    turn: "black",
    status: "FINISHED",
    winner,
    endedAt: "2026-10-11T00:00:00Z",
    result,
  };
}
function setup(
  value: RoomStateSnapshot["match"] = match(),
  role: RoomStateSnapshot["role"] = "red",
  leaving = false,
) {
  const onStay = vi.fn(),
    onLeave = vi.fn();
  const view = render(
    createElement(MatchResult, {
      match: value,
      role,
      onStay,
      onLeave,
      leaving,
    }),
  );
  return { ...view, onStay, onLeave };
}
it("shows both ranked rating changes and preserves Elo on interruption", () => {
  const props = { role: "red" as const, onStay: vi.fn(), onLeave: vi.fn(), kind: "RANKED" as const };
  const rating = { red: { before: 1200, after: 1216, delta: 16, tier: "Sơ cấp" }, black: { before: 1200, after: 1184, delta: -16, tier: "Người mới" } };
  const view = render(createElement(MatchResult, { ...props, match: { ...match(), rating } }));
  expect(screen.getByText(/1200 → 1216 \(\+16\)/)).toBeTruthy();
  expect(screen.getByText(/1200 → 1184 \(-16\)/)).toBeTruthy();
  view.rerender(createElement(MatchResult, { ...props, match: { ...match(), status: "INTERRUPTED", rating: null } }));
  expect(screen.getByText("Elo giữ nguyên")).toBeTruthy();
});

it.each([
  ["CHECKMATE", "Chiếu hết"],
  ["STALEMATE", "Hết nước đi"],
  ["RESIGN", "Đầu hàng"],
  ["TIMEOUT", "Hết giờ"],
  ["DISCONNECT", "Mất kết nối"],
  ["DRAW_REPETITION", "Lặp thế cờ ba lần"],
  ["DRAW_AGREEMENT", "Thoả thuận hoà"],
  ["DRAW_SIMULTANEOUS_DISCONNECT", "Hai người mất kết nối đồng thời"],
  ["DRAW_NO_CAPTURE", "120 nửa nước không ăn quân"],
  ["PERPETUAL_CHECK", "Chiếu liên tục"],
])("shows the canonical %s reason in Vietnamese", (reason, label) => {
  setup(match(reason));
  expect(within(screen.getByRole("dialog")).getByText(label)).toBeTruthy();
});
it.each(["red", "black"] as const)(
  "shows the winner relative to the %s player",
  (role) => {
    const f = setup(match("TIMEOUT", role), role);
    expect(screen.getByRole("heading", { name: "Bạn thắng!" })).toBeTruthy();
    f.rerender(
      createElement(MatchResult, {
        match: match("RESIGN", role === "red" ? "black" : "red"),
        role,
        onStay: f.onStay,
        onLeave: f.onLeave,
      }),
    );
    expect(screen.getByRole("heading", { name: "Bạn thua" })).toBeTruthy();
  },
);
it.each([
  "DRAW_REPETITION",
  "DRAW_AGREEMENT",
  "DRAW_SIMULTANEOUS_DISCONNECT",
  "DRAW_NO_CAPTURE",
  "PERPETUAL_CHECK",
])("shows a server-confirmed draw for %s", (reason) => {
  setup(match(reason, null));
  expect(screen.getByRole("heading", { name: "Hoà" })).toBeTruthy();
});
it.each(["FINISHED", "INTERRUPTED"] as const)(
  "SERVER_RESTART is neutral with %s status even if a stray winner is present",
  (status) => {
    setup({ ...match("SERVER_RESTART"), status });
    expect(
      screen.getByRole("heading", { name: "Ván bị gián đoạn" }),
    ).toBeTruthy();
    expect(screen.getByText("Máy chủ đã khởi động lại.")).toBeTruthy();
    expect(
      screen.queryByRole("heading", { name: /thắng|thua|hoà/i }),
    ).toBeNull();
    expect(
      screen.getAllByRole("button").map((button) => button.textContent),
    ).toEqual(["Ở lại phòng", "Rời phòng"]);
  },
);
it.each(["red", "black", "spectator"] as const)(
  'ABORTED is a neutral "Ván bị hủy" for %s without win/loss text (AC-YC5-RV-03)',
  (role) => {
    setup({ ...match("ABORTED", null), status: "INTERRUPTED" }, role);
    expect(screen.getByRole("heading", { name: "Ván bị hủy" })).toBeTruthy();
    expect(
      screen.getByText("Ván được hủy trước nước đi đầu tiên."),
    ).toBeTruthy();
    expect(screen.queryByText("Máy chủ đã khởi động lại.")).toBeNull();
    expect(
      screen.queryByRole("heading", { name: /thắng|thua|hoà|gián đoạn/i }),
    ).toBeNull();
    if (role !== "spectator")
      expect(
        screen.getAllByRole("button").map((button) => button.textContent),
      ).toEqual(["Ở lại phòng", "Rời phòng"]);
  },
);
it("INTERRUPTED remains neutral even when its old reason suggests a win", () => {
  setup({ ...match("TIMEOUT"), status: "INTERRUPTED" });
  expect(
    screen.getByRole("heading", { name: "Ván bị gián đoạn" }),
  ).toBeTruthy();
  expect(screen.queryByText("Hết giờ")).toBeNull();
});
it.each(["red", "black", null] as const)(
  "spectators see a readonly %s outcome without player controls or a modal",
  (winner) => {
    const f = setup(
      match(winner ? "CHECKMATE" : "DRAW_REPETITION", winner),
      "spectator",
    );
    expect(screen.getByRole("region", { name: "Kết quả ván cờ" })).toBeTruthy();
    expect(
      screen.getByRole("heading", {
        name:
          winner === "red"
            ? "Đỏ thắng"
            : winner === "black"
              ? "Đen thắng"
              : "Hoà",
      }),
    ).toBeTruthy();
    expect(screen.queryByRole("dialog")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
    expect(f.onStay).not.toHaveBeenCalled();
    expect(f.onLeave).not.toHaveBeenCalled();
  },
);
it("Esc and the cancel event only stay on the result, never leave or decline", () => {
  const f = setup();
  const modal = screen.getByRole("dialog");
  const cancel = new Event("cancel", { bubbles: true, cancelable: true });
  fireEvent(modal, cancel);
  expect(cancel.defaultPrevented).toBe(true);
  expect(f.onStay).toHaveBeenCalledOnce();
  expect(f.onLeave).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Rời phòng" }));
  expect(f.onLeave).toHaveBeenCalledOnce();
  expect(f.onStay).toHaveBeenCalledOnce();
});
it("focuses Stay, wraps Tab between the two actions, and restores the previous focus on unmount", () => {
  const trigger = document.createElement("button");
  document.body.append(trigger);
  trigger.focus();
  const f = setup();
  const stay = screen.getByRole("button", { name: "Ở lại phòng" });
  const leave = screen.getByRole("button", { name: "Rời phòng" });
  expect(document.activeElement).toBe(stay);
  fireEvent.keyDown(stay, { key: "Tab", shiftKey: true });
  expect(document.activeElement).toBe(leave);
  fireEvent.keyDown(leave, { key: "Tab" });
  expect(document.activeElement).toBe(stay);
  f.unmount();
  expect(document.activeElement).toBe(trigger);
  trigger.remove();
});
it("does not render a result for null/ACTIVE state or infer it from a stale result code", () => {
  const f = setup(null);
  expect(screen.queryByRole("dialog")).toBeNull();
  f.rerender(
    createElement(MatchResult, {
      match: { ...match("TIMEOUT"), status: "ACTIVE" },
      role: "red",
      onStay: f.onStay,
      onLeave: f.onLeave,
    }),
  );
  expect(screen.queryByRole("dialog")).toBeNull();
});
it("does not expose unknown raw reasons or turn a missing outcome into a draw", () => {
  setup(match("PRIVATE_PROVIDER_PAYLOAD", null));
  expect(screen.getByRole("heading", { name: "Kết quả ván cờ" })).toBeTruthy();
  expect(screen.getByText("Lý do kết thúc chưa được đồng bộ.")).toBeTruthy();
  expect(screen.queryByText("PRIVATE_PROVIDER_PAYLOAD")).toBeNull();
  expect(screen.queryByRole("heading", { name: "Hoà" })).toBeNull();
});
it("blocks duplicate pending actions and resumes only when the owner clears leaving", () => {
  const f = setup(match(), "red", true);
  fireEvent.click(screen.getByRole("button", { name: "Rời phòng" }));
  fireEvent.click(screen.getByRole("button", { name: "Ở lại phòng" }));
  expect(f.onLeave).not.toHaveBeenCalled();
  expect(f.onStay).not.toHaveBeenCalled();
  expect(
    screen.getByRole("button", { name: "Rời phòng" }).getAttribute("aria-busy"),
  ).toBe("true");
  act(() =>
    f.rerender(
      createElement(MatchResult, {
        match: match(),
        role: "red",
        onStay: f.onStay,
        onLeave: f.onLeave,
        leaving: false,
      }),
    ),
  );
  fireEvent.click(screen.getByRole("button", { name: "Rời phòng" }));
  expect(f.onLeave).toHaveBeenCalledOnce();
});
it("Esc while leave is pending neither stays nor closes the result", () => {
  const f = setup(match(), "red", true);
  const modal = screen.getByRole("dialog");
  const cancel = new Event("cancel", { bubbles: true, cancelable: true });
  fireEvent(modal, cancel);
  expect(cancel.defaultPrevented).toBe(true);
  expect(f.onStay).not.toHaveBeenCalled();
  expect(f.onLeave).not.toHaveBeenCalled();
  expect(screen.getByRole("dialog")).toBeTruthy();
});

it("includes rematch controls in the modal keyboard cycle", () => {
  render(
    createElement(MatchResult, {
      match: match(),
      role: "red",
      onStay: vi.fn(),
      onLeave: vi.fn(),
      rematch: createElement("button", { type: "button" }, "Tái đấu"),
    }),
  );
  const modal = screen.getByRole("dialog");
  const rematch = within(modal).getByRole("button", { name: "Tái đấu" });
  const leave = within(modal).getByRole("button", { name: "Rời phòng" });
  leave.focus();
  fireEvent.keyDown(leave, { key: "Tab" });
  expect(document.activeElement).toBe(rematch);
  fireEvent.keyDown(rematch, { key: "Tab", shiftKey: true });
  expect(document.activeElement).toBe(leave);
});
