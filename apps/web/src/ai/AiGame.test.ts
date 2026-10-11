// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  initialPosition,
  serializePosition,
  playMove,
} from "@xiangqi/xiangqi-core";
import { AiGame, type AiGameProps, type AiGameSnapshot } from "./AiGame.js";
const originalDialogMethods = ["showModal", "close"].map(
  (name) =>
    [
      name,
      Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, name),
    ] as const,
);
afterEach(() => {
  cleanup();
  for (const [name, descriptor] of originalDialogMethods) {
    if (descriptor)
      Object.defineProperty(HTMLDialogElement.prototype, name, descriptor);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, name);
  }
});
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = function () {
    this.setAttribute("open", "");
  };
  HTMLDialogElement.prototype.close = function () {
    this.removeAttribute("open");
  };
});
function snapshot(): AiGameSnapshot {
  const position = serializePosition(initialPosition());
  return {
    id: "game-a",
    requestedSide: "red",
    actualSide: "red",
    level: "easy",
    position,
    history: [position],
    version: 0,
    status: "ACTIVE",
    engineState: "IDLE",
    engineError: null,
    outcome: null,
  };
}
function props(game = snapshot()): AiGameProps {
  return {
    snapshot: game,
    connected: true,
    canControl: true,
    onMove: vi.fn(async () => {}),
    onResign: vi.fn(async () => {}),
    onRetry: vi.fn(async () => {}),
    onNewGame: vi.fn(),
    onLobby: vi.fn(),
  };
}
it("renders the canonical board, level and no time limit without offering hint, draw or unavailable undo", () => {
  render(createElement(AiGame, props()));
  expect(screen.getByRole("heading", { name: "Đấu với máy" })).toBeTruthy();
  expect(screen.getByText("Dễ")).toBeTruthy();
  expect(screen.getByText("Không giới hạn thời gian")).toBeTruthy();
  expect(
    screen.getByRole("button", { name: "Tốt đỏ, cột 1 hàng 7" }),
  ).toBeTruthy();
  expect(
    screen.queryByRole("button", { name: /Gợi ý|Xin hòa|Đi lại/ }),
  ).toBeNull();
});
function movePawn() {
  fireEvent.click(screen.getByRole("button", { name: "Tốt đỏ, cột 1 hàng 7" }));
  fireEvent.click(screen.getByRole("button", { name: "Trống, cột 1 hàng 6" }));
}
it("requests a canonical human move without modifying the controlled board", async () => {
  const p = props();
  render(createElement(AiGame, p));
  movePawn();
  await waitFor(() =>
    expect(p.onMove).toHaveBeenCalledExactlyOnceWith({ from: 54, to: 45 }),
  );
  expect(
    screen.getByRole("button", { name: "Tốt đỏ, cột 1 hàng 7" }),
  ).toBeTruthy();
});
it.each(["offline", "readonly", "pending", "thinking", "opponent"])(
  "does not grant board control while %s",
  (condition) => {
    const p = props();
    if (condition === "offline") p.connected = false;
    if (condition === "readonly") p.canControl = false;
    if (condition === "pending") p.pending = true;
    if (condition === "thinking") p.snapshot.engineState = "THINKING";
    if (condition === "opponent") p.snapshot.actualSide = "black";
    render(createElement(AiGame, p));
    const piece = screen.queryByRole("button", {
      name: "Tốt đỏ, cột 1 hàng 7",
    });
    if (piece) fireEvent.click(piece);
    expect(p.onMove).not.toHaveBeenCalled();
    if (condition === "offline")
      expect(screen.getByText(/giữ tối đa 30 phút/)).toBeTruthy();
    if (condition === "thinking")
      expect(screen.getByText("Máy đang suy nghĩ…")).toBeTruthy();
  },
);
it("orients Black at the bottom using the canonical position", () => {
  const p = props({
    ...snapshot(),
    actualSide: "black",
    engineState: "THINKING",
  });
  const { container } = render(createElement(AiGame, p));
  const king = Array.from(container.querySelectorAll("[transform]")).find(
    (element) => element.textContent?.includes("將"),
  );
  expect(king?.getAttribute("transform")).toBe("translate(184 384)");
});
it("retries a timed-out engine on the same game without replaying the human move", async () => {
  const p = props({
    ...snapshot(),
    engineState: "RETRY",
    engineError: "ENGINE_TIMEOUT",
  });
  render(createElement(AiGame, p));
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Thử lại" }));
  expect(p.onRetry).toHaveBeenCalledOnce();
  expect(p.onMove).not.toHaveBeenCalled();
  expect(screen.getByText(/cùng thế cờ/)).toBeTruthy();
});
it("resigning requires confirmation and cancellation does not alter the game", async () => {
  const p = props();
  render(createElement(AiGame, p));
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Đầu hàng" }));
  expect(
    screen.getByRole("dialog", { name: "Đầu hàng ván đấu?" }),
  ).toBeTruthy();
  await user.click(screen.getByRole("button", { name: "Ở lại" }));
  expect(p.onResign).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Đầu hàng" }));
  await user.click(screen.getByRole("button", { name: "Xác nhận đầu hàng" }));
  expect(p.onResign).toHaveBeenCalledOnce();
});
function afterHuman(): AiGameSnapshot {
  const initial = initialPosition(),
    next = playMove(initial, { from: 54, to: 45 });
  return {
    ...snapshot(),
    position: serializePosition(next),
    history: [serializePosition(initial), serializePosition(next)],
    version: 1,
    engineState: "THINKING",
  };
}
it("permits authoritative undo while the machine thinks after a human move without locally rewinding", async () => {
  const p = {
    ...props(afterHuman()),
    undoRemaining: 3,
    onUndo: vi.fn(async () => {}),
  };
  render(createElement(AiGame, p));
  expect(screen.getByText("Lượt đi lại: 3/3")).toBeTruthy();
  await userEvent.setup().click(screen.getByRole("button", { name: "Đi lại" }));
  expect(p.onUndo).toHaveBeenCalledOnce();
  expect(
    screen.getByRole("img", { name: "Tốt đỏ, cột 1 hàng 6" }),
  ).toBeTruthy();
  expect(screen.getByText("Lượt đi lại: 3/3")).toBeTruthy();
});
it.each(["initial", "black-first", "exhausted", "finished"])(
  "undo fails closed for %s",
  async (condition) => {
    let game = condition === "initial" ? snapshot() : afterHuman();
    if (condition === "black-first") game = { ...game, actualSide: "black" };
    if (condition === "finished") game.status = "FINISHED";
    const p = {
      ...props(game),
      undoRemaining: condition === "exhausted" ? 0 : 3,
      onUndo: vi.fn(async () => {}),
    };
    render(createElement(AiGame, p));
    const undo = screen.getByRole("button", { name: "Đi lại" });
    expect(undo.getAttribute("aria-disabled")).toBe("true");
    await userEvent.setup().click(undo);
    expect(p.onUndo).not.toHaveBeenCalled();
    if (["initial", "black-first"].includes(condition))
      expect(
        screen.getByText("Chưa có nước nào của bạn để đi lại"),
      ).toBeTruthy();
  },
);
it("completed results open explicit setup preserving the requested random side and support returning to Lobby", async () => {
  const p = props({
    ...snapshot(),
    requestedSide: "random",
    actualSide: "black",
    level: "hard",
    status: "FINISHED",
    outcome: { reason: "RESIGN", winner: "red" },
  });
  render(createElement(AiGame, p));
  expect(screen.getByRole("dialog", { name: "Bạn thua" })).toBeTruthy();
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Ván mới" }));
  expect(p.onNewGame).toHaveBeenCalledExactlyOnceWith({
    level: "hard",
    requestedSide: "random",
  });
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Về Sảnh" }));
  expect(p.onLobby).toHaveBeenCalledOnce();
});
it("abandoned retry explains a new game with the actual side and never claims a loss", async () => {
  const p = props({
    ...snapshot(),
    requestedSide: "random",
    actualSide: "black",
    status: "ABANDONED",
    outcome: { reason: "ENGINE_FAILURE", winner: null },
  });
  render(createElement(AiGame, p));
  expect(screen.getByText("Ván bỏ dở")).toBeTruthy();
  expect(screen.getByText(/ván mới cùng cấp độ và phe Đen/)).toBeTruthy();
  expect(screen.queryByText("Bạn thua")).toBeNull();
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Thử lại" }));
  expect(p.onRetry).toHaveBeenCalledOnce();
});
it("a late failed request from an old game cannot display an error or unlock a new pending request", async () => {
  let rejectOld!: (reason: Error) => void, resolveNew!: () => void;
  const old = props();
  old.onMove = vi.fn(
    () =>
      new Promise<void>((_, reject) => {
        rejectOld = reject;
      }),
  );
  const view = render(createElement(AiGame, old));
  movePawn();
  const next = props({ ...snapshot(), id: "game-b" });
  next.onMove = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        resolveNew = resolve;
      }),
  );
  view.rerender(createElement(AiGame, next));
  movePawn();
  await act(async () => rejectOld(new Error("private-token-from-old-game")));
  expect(screen.queryByRole("alert")).toBeNull();
  expect(
    screen
      .getByRole("button", { name: "Đầu hàng" })
      .getAttribute("aria-disabled"),
  ).toBe("true");
  await act(async () => resolveNew());
  expect(
    screen
      .getByRole("button", { name: "Đầu hàng" })
      .getAttribute("aria-disabled"),
  ).toBe("false");
});
it("failed callbacks show sanitized feedback and do not change the board", async () => {
  const p = props();
  p.onMove = vi.fn(async () => {
    throw new Error("private-bearer-token");
  });
  render(createElement(AiGame, p));
  movePawn();
  await waitFor(() =>
    expect(screen.getByRole("alert").textContent).toBe(
      "Không thực hiện được thao tác. Vui lòng thử lại.",
    ),
  );
  expect(screen.queryByText(/private-bearer/)).toBeNull();
  expect(
    screen.getByRole("button", { name: "Tốt đỏ, cột 1 hàng 7" }),
  ).toBeTruthy();
});
it("authority loss clears selection and old errors even when the game ID remains unchanged", async () => {
  const p = props();
  p.onMove = vi.fn(async () => {
    throw new Error("private-error");
  });
  const view = render(createElement(AiGame, p));
  movePawn();
  await waitFor(() => expect(screen.getByRole("alert")).toBeTruthy());
  fireEvent.click(screen.getByRole("button", { name: "Tốt đỏ, cột 1 hàng 7" }));
  view.rerender(createElement(AiGame, { ...p, canControl: false }));
  expect(screen.queryByRole("alert")).toBeNull();
  view.rerender(createElement(AiGame, p));
  fireEvent.click(screen.getByRole("button", { name: "Trống, cột 1 hàng 6" }));
  expect(p.onMove).toHaveBeenCalledOnce();
});
it("a retry cannot submit twice while awaiting its callback even before parent pending updates", async () => {
  let finish!: () => void;
  const p = props({
    ...snapshot(),
    engineState: "RETRY",
    engineError: "ENGINE_BUSY",
  });
  p.onRetry = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  render(createElement(AiGame, p));
  await userEvent
    .setup()
    .dblClick(screen.getByRole("button", { name: "Thử lại" }));
  expect(p.onRetry).toHaveBeenCalledOnce();
  await act(async () => finish());
});
it("failed resignation closes confirmation so sanitized retry feedback is visible", async () => {
  const p = props();
  p.onResign = vi.fn(async () => {
    throw new Error("private-provider-secret");
  });
  render(createElement(AiGame, p));
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Đầu hàng" }));
  await user.click(screen.getByRole("button", { name: "Xác nhận đầu hàng" }));
  await waitFor(() =>
    expect(
      screen.queryByRole("dialog", { name: "Đầu hàng ván đấu?" }),
    ).toBeNull(),
  );
  expect(screen.getByRole("alert").textContent).toBe(
    "Không thực hiện được thao tác. Vui lòng thử lại.",
  );
  expect(screen.queryByText(/private-provider/)).toBeNull();
});
it("a canonical terminal update closes an outstanding resignation confirmation", async () => {
  const p = props();
  const view = render(createElement(AiGame, p));
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Đầu hàng" }));
  view.rerender(
    createElement(AiGame, {
      ...p,
      snapshot: {
        ...p.snapshot,
        status: "FINISHED",
        outcome: { reason: "DRAW_REPETITION", winner: null },
      },
    }),
  );
  expect(
    screen.queryByRole("dialog", { name: "Đầu hàng ván đấu?" }),
  ).toBeNull();
  expect(screen.getByRole("dialog", { name: "Hòa" })).toBeTruthy();
  expect(p.onResign).not.toHaveBeenCalled();
});
