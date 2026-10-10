// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Button,
  TextField,
  ErrorState,
  EmptyState,
  Tabs,
  Badge,
  Tooltip,
  Notice,
} from "./primitives.js";
afterEach(() => {
  cleanup();
  vi.useRealTimers();
});
it("performs an enabled action by keyboard", async () => {
  const action = vi.fn();
  const user = userEvent.setup();
  render(createElement(Button, { onClick: action }, "Tạo phòng"));
  await user.tab();
  await user.keyboard("{Enter}");
  expect(action).toHaveBeenCalledTimes(1);
});
it.each([{ disabledReason: "Sắp ra mắt" }, { loading: true }])(
  "blocks unavailable actions with readable explanation",
  async (props) => {
    const action = vi.fn();
    const user = userEvent.setup();
    render(createElement(Button, { ...props, onClick: action }, "Đánh hạng"));
    const button = screen.getByRole("button");
    await user.click(button);
    await user.keyboard("{Enter} ");
    expect(action).not.toHaveBeenCalled();
    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(
      screen.getByText(props.loading ? "Đang xử lý…" : "Sắp ra mắt"),
    ).toBeTruthy();
  },
);

it("associates field labels and readable errors with the editable input", async () => {
  const change = vi.fn();
  render(
    createElement(TextField, {
      label: "Mã phòng",
      error: "Kiểm tra lại 8 ký tự.",
      onChange: change,
    }),
  );
  const input = screen.getByLabelText("Mã phòng");
  await userEvent.setup().type(input, "AB");
  expect(input.getAttribute("aria-invalid")).toBe("true");
  expect(screen.getByText("Kiểm tra lại 8 ký tự.")).toBeTruthy();
  expect(change).toHaveBeenCalled();
});
it("offers distinct empty guidance and a retry action for errors", async () => {
  const retry = vi.fn();
  render(
    createElement(ErrorState, {
      message: "Chưa tải được phòng.",
      onRetry: retry,
    }),
  );
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Thử lại" }));
  expect(retry).toHaveBeenCalledOnce();
  cleanup();
  render(
    createElement(EmptyState, {
      title: "Chưa có phòng công khai",
      children: "Hãy tạo phòng để mời bạn chơi.",
    }),
  );
  expect(screen.getByText("Hãy tạo phòng để mời bạn chơi.")).toBeTruthy();
  expect(screen.queryByRole("alert")).toBeNull();
});
it("changes tab selection with arrows and keeps focus on the chosen tab", async () => {
  render(
    createElement(Tabs, {
      items: [
        { id: "private", label: "Kênh riêng", content: "Tin riêng" },
        { id: "public", label: "Kênh chung", content: "Tin chung" },
      ],
      label: "Kênh chat",
    }),
  );
  const user = userEvent.setup();
  await user.click(screen.getByRole("tab", { name: "Kênh riêng" }));
  await user.keyboard("{ArrowRight}");
  expect(
    screen
      .getByRole("tab", { name: "Kênh chung" })
      .getAttribute("aria-selected"),
  ).toBe("true");
  expect(screen.getByRole("tabpanel").textContent).toBe("Tin chung");
  expect(document.activeElement).toBe(
    screen.getByRole("tab", { name: "Kênh chung" }),
  );
});
it("shows tooltip on keyboard focus and dismisses it with Escape", async () => {
  render(
    createElement(Tooltip, {
      text: "Sắp ra mắt",
      children: createElement("button", {}, "Lịch sử"),
    }),
  );
  const user = userEvent.setup();
  await user.tab();
  expect(screen.getByRole("tooltip").textContent).toBe("Sắp ra mắt");
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("tooltip")).toBeNull();
});
it("renders badge counts accessibly and hides zero", () => {
  const { rerender } = render(
    createElement(Badge, { count: 0, label: "lời mời mới" }),
  );
  expect(screen.queryByText("0")).toBeNull();
  rerender(createElement(Badge, { count: 12, label: "lời mời mới" }));
  expect(screen.getByLabelText("12 lời mời mới").textContent).toBe("9+");
});
it("announces actionable errors without auto-dismiss", async () => {
  const dismiss = vi.fn();
  render(
    createElement(Notice, {
      tone: "error",
      message: "Chưa gửi được tin.",
      onDismiss: dismiss,
    }),
  );
  expect(screen.getByRole("alert").textContent).toContain("Chưa gửi được tin.");
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Đóng thông báo" }));
  expect(dismiss).toHaveBeenCalledOnce();
});

it("dismisses an informational toast after four seconds but retains an error", () => {
  vi.useFakeTimers();
  const dismiss = vi.fn();
  const { rerender } = render(
    createElement(Notice, {
      message: "Đã lưu",
      toast: true,
      onDismiss: dismiss,
    }),
  );
  act(() => vi.advanceTimersByTime(3999));
  expect(dismiss).not.toHaveBeenCalled();
  act(() => vi.advanceTimersByTime(1));
  expect(dismiss).toHaveBeenCalledOnce();
  dismiss.mockClear();
  rerender(
    createElement(Notice, {
      message: "Chưa gửi được",
      tone: "error",
      toast: true,
      onDismiss: dismiss,
    }),
  );
  act(() => vi.advanceTimersByTime(10000));
  expect(dismiss).not.toHaveBeenCalled();
  expect(screen.getByRole("alert").textContent).toContain("Chưa gửi được");
});
it("retains a tooltip while keyboard focus remains after the pointer leaves", async () => {
  render(
    createElement(Tooltip, {
      text: "Sắp ra mắt",
      children: createElement("button", {}, "Lịch sử"),
    }),
  );
  const user = userEvent.setup();
  const trigger = screen.getByRole("button", { name: "Lịch sử" });
  await user.tab();
  await user.hover(trigger);
  await user.unhover(trigger);
  expect(document.activeElement).toBe(trigger);
  expect(screen.getByRole("tooltip").textContent).toBe("Sắp ra mắt");
  await user.tab();
  expect(screen.queryByRole("tooltip")).toBeNull();
});
it("retains a hovered tooltip when focus moves away and permits hovering its content", async () => {
  render(
    createElement(
      "div",
      {},
      createElement(Tooltip, {
        text: "Sắp ra mắt",
        children: createElement("button", {}, "Lịch sử"),
      }),
      createElement("button", {}, "Khác"),
    ),
  );
  const user = userEvent.setup();
  const trigger = screen.getByRole("button", { name: "Lịch sử" });
  await user.tab();
  await user.hover(trigger);
  await user.tab();
  expect(document.activeElement).toBe(
    screen.getByRole("button", { name: "Khác" }),
  );
  const tooltip = screen.getByRole("tooltip");
  // jsdom has no geometry; user-event omits relatedTarget on pointer transitions.
  // Model the real relatedTarget boundary; the 8px bridge is checked in Chrome.
  fireEvent.mouseOut(trigger, { relatedTarget: tooltip });
  fireEvent.mouseOver(tooltip, { relatedTarget: trigger });
  expect(screen.getByRole("tooltip").textContent).toBe("Sắp ra mắt");
  fireEvent.mouseOut(tooltip, { relatedTarget: document.body });
  expect(screen.queryByRole("tooltip")).toBeNull();
});
it("dismisses a pointer tooltip with Escape even when focus is elsewhere", async () => {
  render(
    createElement(
      "div",
      {},
      createElement(Tooltip, {
        text: "Sắp ra mắt",
        children: createElement("button", {}, "Lịch sử"),
      }),
      createElement("button", {}, "Khác"),
    ),
  );
  const user = userEvent.setup();
  await user.tab();
  await user.hover(screen.getByRole("button", { name: "Lịch sử" }));
  await user.tab();
  expect(screen.getByRole("tooltip")).toBeTruthy();
  await user.keyboard("{Escape}");
  expect(screen.queryByRole("tooltip")).toBeNull();
});
