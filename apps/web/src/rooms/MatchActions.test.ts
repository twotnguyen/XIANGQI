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
import { MatchActions, type MatchActionsProps } from "./MatchActions.js";
const original = ["showModal", "close"].map(
  (name) =>
    [
      name,
      Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, name),
    ] as const,
);
let monotonic = 1000;
beforeEach(() => {
  vi.useFakeTimers({ toFake: ["setInterval", "clearInterval", "Date"] });
  monotonic = 1000;
  vi.spyOn(performance, "now").mockImplementation(() => monotonic);
  for (const name of ["showModal", "close"])
    Object.defineProperty(HTMLDialogElement.prototype, name, {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        if (name === "showModal") this.setAttribute("open", "");
        else this.removeAttribute("open");
      },
    });
});
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
  for (const [name, value] of original) {
    if (value) Object.defineProperty(HTMLDialogElement.prototype, name, value);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, name);
  }
});
const match: NonNullable<MatchActionsProps["match"]> = {
  id: "33333333-3333-4333-8333-333333333333",
  version: 3,
  position: "unused",
  lastMove: null,
  turn: "red",
  status: "ACTIVE",
  winner: null,
  endedAt: null,
  result: null,
};
const incoming = {
  id: "44444444-4444-4444-8444-444444444444",
  sender: "black" as const,
  expiresAt: "2026-10-11T00:00:30Z",
};
const own = {
  ...incoming,
  id: "55555555-5555-4555-8555-555555555555",
  sender: "red" as const,
};
function setup(overrides: Partial<MatchActionsProps> = {}) {
  const props: MatchActionsProps = {
    match,
    role: "red",
    draw: { offers: [], remainingMoves: { red: 0, black: 0 } },
    serverNow: "2026-10-11T00:00:00Z",
    canAct: true,
    onAction: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
  return { props, ...render(createElement(MatchActions, props)) };
}
function advance(ms: number) {
  act(() => {
    monotonic += ms;
    vi.advanceTimersByTime(ms);
  });
}
it.each([
  null,
  { ...match, status: "FINISHED" as const },
  { ...match, status: "INTERRUPTED" as const },
])("has no actions or offers outside active play", (state) => {
  setup({
    match: state,
    draw: { offers: [incoming], remainingMoves: { red: 0, black: 0 } },
  });
  expect(screen.queryByRole("button", { name: "Đầu hàng" })).toBeNull();
  expect(
    screen.queryByRole("group", { name: "Đề nghị hòa của đối thủ" }),
  ).toBeNull();
});
it("spectators have no player actions", () => {
  setup({ role: "spectator", draw: null });
  expect(screen.queryByRole("button", { name: "Đầu hàng" })).toBeNull();
  expect(screen.queryByRole("button", { name: "Xin hòa" })).toBeNull();
});
it("opens the existing danger confirmation with exact bold consequence and cancel focus", async () => {
  const view = setup();
  fireEvent.click(screen.getByRole("button", { name: "Đầu hàng" }));
  const dialog = screen.getByRole("dialog", { name: "Đầu hàng?" });
  expect(
    within(dialog).getByText("Bạn sẽ thua ván này ngay lập tức.").tagName,
  ).toBe("STRONG");
  expect(document.activeElement).toBe(
    within(dialog).getByRole("button", { name: "Huỷ" }),
  );
  expect(view.props.onAction).not.toHaveBeenCalled();
  await act(async () =>
    fireEvent.click(within(dialog).getByRole("button", { name: "Đầu hàng" })),
  );
  expect(view.props.onAction).toHaveBeenCalledExactlyOnceWith({
    type: "match.resign",
    payload: { matchId: match.id, matchVersion: 3 },
  });
  expect(screen.queryByRole("dialog")).toBeNull();
});
it("cancelling confirmation never resigns and new authoritative versions are used at confirmation", async () => {
  const view = setup();
  fireEvent.click(screen.getByRole("button", { name: "Đầu hàng" }));
  fireEvent.click(screen.getByRole("button", { name: "Huỷ" }));
  expect(view.props.onAction).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Đầu hàng" }));
  view.rerender(
    createElement(MatchActions, {
      ...view.props,
      match: { ...match, version: 4 },
    }),
  );
  await act(async () =>
    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Đầu hàng",
      }),
    ),
  );
  expect(view.props.onAction).toHaveBeenCalledExactlyOnceWith({
    type: "match.resign",
    payload: { matchId: match.id, matchVersion: 4 },
  });
});
it.each([0, 1, 2, 3, 4, 5])(
  "uses authoritative own cooldown %i without inventing a move counter",
  async (remaining) => {
    const view = setup({
      draw: { offers: [], remainingMoves: { red: remaining, black: 0 } },
    });
    const button = screen.getByRole("button", { name: "Xin hòa" });
    expect(button.matches(":disabled")).toBe(remaining > 0);
    if (remaining > 0)
      expect(
        screen.getByText(
          `Cần đi thêm ${remaining} nước của bạn để xin hòa lại.`,
        ),
      ).toBeTruthy();
    else {
      await act(async () => fireEvent.click(button));
      expect(view.props.onAction).toHaveBeenCalledExactlyOnceWith({
        type: "match.draw.offer",
        payload: { matchId: match.id, matchVersion: 3 },
      });
    }
  },
);
it("old schema draw null and lost control fail closed with explanations", () => {
  const view = setup({ draw: null });
  expect(
    screen.getByRole("button", { name: "Xin hòa" }).matches(":disabled"),
  ).toBe(true);
  expect(
    screen.getByText("Xin hòa chưa sẵn sàng trong phòng này."),
  ).toBeTruthy();
  view.rerender(createElement(MatchActions, { ...view.props, canAct: false }));
  expect(
    screen.getByRole("button", { name: "Đầu hàng" }).matches(":disabled"),
  ).toBe(true);
});
it("shows incoming nonmodal offer without stealing board focus or disabling a board control", () => {
  const board = document.createElement("button");
  board.textContent = "Ô bàn cờ";
  document.body.append(board);
  board.focus();
  setup({ draw: { offers: [incoming], remainingMoves: { red: 0, black: 0 } } });
  expect(document.activeElement).toBe(board);
  expect(board.disabled).toBe(false);
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(
    screen.getByRole("group", { name: "Đề nghị hòa của đối thủ" }),
  ).toBeTruthy();
  board.remove();
});
it("only scoped Escape/X collapses; reopening preserves deadline and sends no rejection", () => {
  const view = setup({
    draw: { offers: [incoming], remainingMoves: { red: 0, black: 0 } },
  });
  advance(7000);
  fireEvent.keyDown(document, { key: "Escape" });
  expect(screen.getByRole("button", { name: "Đồng ý" })).toBeTruthy();
  const panel = screen.getByRole("group", { name: "Đề nghị hòa của đối thủ" });
  fireEvent.keyDown(panel, { key: "Escape" });
  expect(screen.queryByRole("button", { name: "Đồng ý" })).toBeNull();
  expect(view.props.onAction).not.toHaveBeenCalled();
  advance(3000);
  fireEvent.click(screen.getByRole("button", { name: "Mở đề nghị hòa" }));
  expect(screen.getByRole("timer").textContent).toBe("Còn 00:20");
  fireEvent.click(screen.getByRole("button", { name: "Thu gọn đề nghị hòa" }));
  expect(view.props.onAction).not.toHaveBeenCalled();
});
it.each([true, false])(
  "sends explicit receiver response accept=%s for this offer",
  async (accept) => {
    const view = setup({
      draw: { offers: [incoming], remainingMoves: { red: 0, black: 0 } },
    });
    await act(async () =>
      fireEvent.click(
        screen.getByRole("button", { name: accept ? "Đồng ý" : "Từ chối" }),
      ),
    );
    expect(view.props.onAction).toHaveBeenCalledExactlyOnceWith({
      type: "match.draw.respond",
      payload: {
        matchId: match.id,
        matchVersion: 3,
        offerId: incoming.id,
        accept,
      },
    });
  },
);
it("displays both offers independently and sender withdrawal never touches opponent offer", async () => {
  const view = setup({
    draw: { offers: [own, incoming], remainingMoves: { red: 0, black: 0 } },
  });
  expect(screen.getByText("Đang chờ đối thủ trả lời…")).toBeTruthy();
  expect(
    screen.getByRole("button", { name: "Xin hòa" }).matches(":disabled"),
  ).toBe(true);
  await act(async () =>
    fireEvent.click(screen.getByRole("button", { name: "Rút đề nghị" })),
  );
  expect(view.props.onAction).toHaveBeenCalledExactlyOnceWith({
    type: "match.draw.withdraw",
    payload: { matchId: match.id, matchVersion: 3, offerId: own.id },
  });
  expect(screen.getByRole("button", { name: "Đồng ý" })).toBeTruthy();
});
it("server deadline catches up hidden time, local wall clock has no effect, and zero never sends or resets cooldown", () => {
  const view = setup({
    draw: { offers: [incoming], remainingMoves: { red: 2, black: 0 } },
  });
  vi.setSystemTime(new Date("2045-01-01"));
  act(() => {
    monotonic += 31000;
  });
  fireEvent(document, new Event("visibilitychange"));
  expect(screen.queryByRole("button", { name: "Đồng ý" })).toBeNull();
  expect(
    screen.getByText("Đề nghị đã hết hạn. Đang chờ máy chủ cập nhật."),
  ).toBeTruthy();
  expect(view.props.onAction).not.toHaveBeenCalled();
  expect(
    screen.getByText("Cần đi thêm 2 nước của bạn để xin hòa lại."),
  ).toBeTruthy();
});
it("identical props do not refund countdown and cleanup cancels the original interval", () => {
  const schedule = vi.spyOn(window, "setInterval"),
    cancel = vi.spyOn(window, "clearInterval");
  const view = setup({
    draw: { offers: [incoming], remainingMoves: { red: 0, black: 0 } },
  });
  advance(6000);
  view.rerender(
    createElement(MatchActions, {
      ...view.props,
      draw: { offers: [{ ...incoming }], remainingMoves: { red: 0, black: 0 } },
    }),
  );
  expect(screen.getByRole("timer").textContent).toBe("Còn 00:24");
  const handle = schedule.mock.results[0]!.value;
  view.unmount();
  expect(cancel).toHaveBeenCalledWith(handle);
});
it("pending resignation disables duplicate confirmation and a terminal snapshot clears the dialog without inventing a result", async () => {
  let done!: () => void;
  const onAction = vi.fn(
    () =>
      new Promise<void>((r) => {
        done = r;
      }),
  );
  const view = setup({ onAction });
  fireEvent.click(screen.getByRole("button", { name: "Đầu hàng" }));
  const button = within(screen.getByRole("dialog")).getByRole("button", {
    name: "Đầu hàng",
  });
  fireEvent.click(button);
  fireEvent.click(button);
  expect(onAction).toHaveBeenCalledTimes(1);
  expect(button.matches(":disabled")).toBe(true);
  view.rerender(
    createElement(MatchActions, {
      ...view.props,
      match: {
        ...match,
        status: "FINISHED",
        winner: "black",
        result: "RESIGN",
      },
    }),
  );
  expect(screen.queryByRole("dialog")).toBeNull();
  await act(async () => done());
  expect(screen.queryByText("Bạn thắng!")).toBeNull();
});
it("late failure from a previous match cannot poison the new match actions", async () => {
  let fail!: (error: Error) => void;
  const onAction = vi.fn(
    () =>
      new Promise<void>((_, reject) => {
        fail = reject;
      }),
  );
  const view = setup({ onAction });
  fireEvent.click(screen.getByRole("button", { name: "Xin hòa" }));
  view.rerender(
    createElement(MatchActions, {
      ...view.props,
      match: { ...match, id: "66666666-6666-4666-8666-666666666666" },
    }),
  );
  await act(async () => fail(new Error("private token")));
  expect(screen.queryByRole("alert")).toBeNull();
  expect(
    screen.getByRole("button", { name: "Xin hòa" }).matches(":disabled"),
  ).toBe(false);
});
it("rejected commands show safe retry feedback without removing canonical offer or cooldown", async () => {
  const onAction = vi.fn().mockRejectedValue(new Error("upstream secret"));
  setup({
    onAction,
    draw: { offers: [incoming], remainingMoves: { red: 0, black: 0 } },
  });
  await act(async () =>
    fireEvent.click(screen.getByRole("button", { name: "Từ chối" })),
  );
  expect(screen.getByRole("alert").textContent).toContain(
    "Chưa thể thực hiện thao tác",
  );
  expect(document.body.textContent).not.toContain("upstream secret");
  expect(screen.getByRole("button", { name: "Đồng ý" })).toBeTruthy();
});
it("failed resignation closes its confirmation and exposes safe accessible retry feedback", async () => {
  const view = setup({
    onAction: vi.fn().mockRejectedValue(new Error("private provider trace")),
  });
  fireEvent.click(screen.getByRole("button", { name: "Đầu hàng" }));
  await act(async () =>
    fireEvent.click(
      within(screen.getByRole("dialog")).getByRole("button", {
        name: "Đầu hàng",
      }),
    ),
  );
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.getByRole("alert").textContent).toContain(
    "Chưa thể thực hiện thao tác",
  );
  expect(document.body.textContent).not.toContain("private provider trace");
  expect(view.props.match!.status).toBe("ACTIVE");
});
it("loss of control while an action waits fences its late failure after reconnect", async () => {
  let reject!: (error: Error) => void;
  const view = setup({
    onAction: () =>
      new Promise<void>((_, r) => {
        reject = r;
      }),
  });
  fireEvent.click(screen.getByRole("button", { name: "Xin hòa" }));
  view.rerender(createElement(MatchActions, { ...view.props, canAct: false }));
  view.rerender(createElement(MatchActions, view.props));
  await act(async () => reject(new Error("stale private")));
  expect(screen.queryByRole("alert")).toBeNull();
  expect(
    screen.getByRole("button", { name: "Xin hòa" }).matches(":disabled"),
  ).toBe(false);
});
