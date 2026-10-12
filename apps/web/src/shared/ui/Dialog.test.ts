// @vitest-environment jsdom
import { createElement, useState } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button, Dialog } from "./primitives.js";
// jsdom lacks the native dialog boundary; focus trapping is verified in Chrome.
const originalShow = Object.getOwnPropertyDescriptor(
  HTMLDialogElement.prototype,
  "showModal",
);
const originalClose = Object.getOwnPropertyDescriptor(
  HTMLDialogElement.prototype,
  "close",
);
beforeEach(() => {
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
  if (originalShow)
    Object.defineProperty(
      HTMLDialogElement.prototype,
      "showModal",
      originalShow,
    );
  else Reflect.deleteProperty(HTMLDialogElement.prototype, "showModal");
  if (originalClose)
    Object.defineProperty(HTMLDialogElement.prototype, "close", originalClose);
  else Reflect.deleteProperty(HTMLDialogElement.prototype, "close");
});
function Example({ danger = false }: { danger?: boolean }) {
  const [open, setOpen] = useState(false);
  return createElement(
    "div",
    {},
    createElement(Button, { onClick: () => setOpen(true) }, "Mở"),
    createElement(Dialog, {
      open,
      danger,
      title: "Xác nhận",
      onClose: () => setOpen(false),
      children: "Nội dung",
    }),
  );
}
it("focuses Cancel for a dangerous action and returns focus to its trigger", async () => {
  render(createElement(Example, { danger: true }));
  const user = userEvent.setup();
  const trigger = screen.getByRole("button", { name: "Mở" });
  await user.click(trigger);
  const cancel = within(screen.getByRole("dialog")).getByRole("button", {
    name: "Huỷ",
  });
  expect(document.activeElement).toBe(cancel);
  await user.click(cancel);
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(document.activeElement).toBe(trigger);
});
it("handles the native cancel signal and explicit close control", async () => {
  render(createElement(Example));
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Mở" }));
  fireEvent(
    screen.getByRole("dialog"),
    new Event("cancel", { bubbles: true, cancelable: true }),
  );
  expect(screen.queryByRole("dialog")).toBeNull();
  await user.click(screen.getByRole("button", { name: "Mở" }));
  await user.click(screen.getByRole("button", { name: "Đóng hộp thoại" }));
  expect(screen.queryByRole("dialog")).toBeNull();
});
it("wraps keyboard focus from the final action to the first and back", async () => {
  render(createElement(Example, { danger: true }));
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Mở" }));
  const modal = within(screen.getByRole("dialog"));
  const first = modal.getByRole("button", { name: "Đóng hộp thoại" });
  const last = modal.getByRole("button", { name: "Huỷ" });
  await user.tab();
  expect(document.activeElement).toBe(first);
  await user.tab({ shift: true });
  expect(document.activeElement).toBe(last);
});
