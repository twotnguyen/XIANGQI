// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AiSetupDialog, type AiSetupDialogProps } from "./AiSetupDialog.js";
const originals = ["showModal", "close"].map(
  (name) =>
    [
      name,
      Object.getOwnPropertyDescriptor(HTMLDialogElement.prototype, name),
    ] as const,
);
beforeEach(() => {
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
  for (const [name, descriptor] of originals) {
    if (descriptor)
      Object.defineProperty(HTMLDialogElement.prototype, name, descriptor);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, name);
  }
});
function props(): AiSetupDialogProps {
  return { open: true, onClose: vi.fn(), onStart: vi.fn(async () => {}) };
}
it("offers exactly three levels and sides with easy/red defaults and focuses the selected level", () => {
  render(createElement(AiSetupDialog, props()));
  expect(
    screen.getByRole("dialog", { name: "Thiết lập ván với máy" }),
  ).toBeTruthy();
  expect(screen.getAllByRole("radio")).toHaveLength(6);
  expect(
    (screen.getByRole("radio", { name: "Dễ" }) as HTMLInputElement).checked,
  ).toBe(true);
  expect(
    (screen.getByRole("radio", { name: /Đỏ/ }) as HTMLInputElement).checked,
  ).toBe(true);
  expect(document.activeElement).toBe(
    screen.getByRole("radio", { name: "Dễ" }),
  );
});
it("prefills the original requested random side and submits only the user's selected setup by keyboard", async () => {
  const p = {
    ...props(),
    initial: { level: "hard", requestedSide: "random" } as const,
  };
  render(createElement(AiSetupDialog, p));
  expect(
    (screen.getByRole("radio", { name: "Khó" }) as HTMLInputElement).checked,
  ).toBe(true);
  expect(
    (screen.getByRole("radio", { name: "Ngẫu nhiên" }) as HTMLInputElement)
      .checked,
  ).toBe(true);
  const user = userEvent.setup();
  await user.click(screen.getByRole("radio", { name: "Trung bình" }));
  await user.click(screen.getByRole("radio", { name: /Đen/ }));
  screen.getByRole("button", { name: "Bắt đầu" }).focus();
  await user.keyboard("{Enter}");
  expect(p.onStart).toHaveBeenCalledExactlyOnceWith({
    level: "medium",
    requestedSide: "black",
  });
  expect(p.onClose).toHaveBeenCalledOnce();
});
it("cancel, native Escape signal and the close control never create a game", async () => {
  const p = props();
  render(createElement(AiSetupDialog, p));
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Huỷ" }));
  fireEvent(
    screen.getByRole("dialog"),
    new Event("cancel", { bubbles: true, cancelable: true }),
  );
  await user.click(screen.getByRole("button", { name: "Đóng hộp thoại" }));
  expect(p.onClose).toHaveBeenCalledTimes(3);
  expect(p.onStart).not.toHaveBeenCalled();
});
it("awaiting start disables choices, blocks dismissal and prevents duplicate requests", async () => {
  let finish!: () => void;
  const p = props();
  p.onStart = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  render(createElement(AiSetupDialog, p));
  const user = userEvent.setup();
  await user.dblClick(screen.getByRole("button", { name: "Bắt đầu" }));
  expect(p.onStart).toHaveBeenCalledOnce();
  expect(
    (screen.getByRole("radio", { name: "Dễ" }) as HTMLInputElement).matches(
      ":disabled",
    ),
  ).toBe(true);
  expect(
    screen
      .getByRole("button", { name: "Đóng hộp thoại" })
      .getAttribute("aria-disabled"),
  ).toBe("true");
  expect(
    (screen.getByRole("button", { name: "Đang tạo ván…" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  await user.click(screen.getByRole("button", { name: "Đóng hộp thoại" }));
  fireEvent(
    screen.getByRole("dialog"),
    new Event("cancel", { bubbles: true, cancelable: true }),
  );
  expect(p.onClose).not.toHaveBeenCalled();
  await act(async () => finish());
  expect(p.onClose).toHaveBeenCalledOnce();
});
it("parent pending also blocks submit and dismiss without inventing a server result", async () => {
  const p = { ...props(), pending: true };
  render(createElement(AiSetupDialog, p));
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Đang xử lý…" }));
  fireEvent.submit(screen.getByRole("dialog").querySelector("form")!);
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Đóng hộp thoại" }));
  expect(p.onStart).not.toHaveBeenCalled();
  expect(p.onClose).not.toHaveBeenCalled();
});
it("safe failure preserves the selected fields for explicit retry", async () => {
  const p = props();
  p.onStart = vi
    .fn()
    .mockRejectedValueOnce(new Error("private-owner-token"))
    .mockResolvedValueOnce(undefined);
  render(createElement(AiSetupDialog, p));
  const user = userEvent.setup();
  await user.click(screen.getByRole("radio", { name: "Khó" }));
  await user.click(screen.getByRole("button", { name: "Bắt đầu" }));
  expect(screen.getByRole("alert").textContent).toBe(
    "Chưa thể bắt đầu ván với máy. Vui lòng thử lại.",
  );
  expect(screen.queryByText(/private-owner/)).toBeNull();
  expect(
    (screen.getByRole("radio", { name: "Khó" }) as HTMLInputElement).checked,
  ).toBe(true);
  expect(p.onClose).not.toHaveBeenCalled();
  await user.click(screen.getByRole("button", { name: "Bắt đầu" }));
  expect(p.onStart).toHaveBeenCalledTimes(2);
  expect(p.onClose).toHaveBeenCalledOnce();
});
it("closing and reopening resets prefill and fences old errors and finally from a new pending start", async () => {
  let rejectOld!: (reason: Error) => void, finishNew!: () => void;
  const p = props();
  p.onStart = vi.fn(
    () =>
      new Promise<void>((_, reject) => {
        rejectOld = reject;
      }),
  );
  const view = render(createElement(AiSetupDialog, p));
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Bắt đầu" }));
  view.rerender(createElement(AiSetupDialog, { ...p, open: false }));
  expect(screen.queryByRole("dialog")).toBeNull();
  const next = {
    ...props(),
    initial: { level: "hard", requestedSide: "random" } as const,
  };
  next.onStart = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        finishNew = resolve;
      }),
  );
  view.rerender(createElement(AiSetupDialog, next));
  expect(
    (screen.getByRole("radio", { name: "Ngẫu nhiên" }) as HTMLInputElement)
      .checked,
  ).toBe(true);
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Bắt đầu" }));
  await act(async () => rejectOld(new Error("private-old-error")));
  expect(screen.queryByRole("alert")).toBeNull();
  expect(
    (screen.getByRole("radio", { name: "Khó" }) as HTMLInputElement).matches(
      ":disabled",
    ),
  ).toBe(true);
  expect(next.onClose).not.toHaveBeenCalled();
  await act(async () => finishNew());
  expect(next.onClose).toHaveBeenCalledOnce();
});
it("equivalent initial objects preserve selection while a changed initial setup resets it", async () => {
  const p = {
    ...props(),
    initial: { level: "easy", requestedSide: "red" } as const,
  };
  const view = render(createElement(AiSetupDialog, p));
  await userEvent.setup().click(screen.getByRole("radio", { name: "Khó" }));
  view.rerender(
    createElement(AiSetupDialog, { ...p, initial: { ...p.initial } }),
  );
  expect(
    (screen.getByRole("radio", { name: "Khó" }) as HTMLInputElement).checked,
  ).toBe(true);
  view.rerender(
    createElement(AiSetupDialog, {
      ...p,
      initial: { level: "medium", requestedSide: "black" },
    }),
  );
  expect(
    (screen.getByRole("radio", { name: "Trung bình" }) as HTMLInputElement)
      .checked,
  ).toBe(true);
  expect(
    (screen.getByRole("radio", { name: /Đen/ }) as HTMLInputElement).checked,
  ).toBe(true);
});
it("a late successful start after external closure cannot close a later dialog", async () => {
  let finishOld!: () => void;
  const p = props();
  p.onStart = vi.fn(
    () =>
      new Promise<void>((resolve) => {
        finishOld = resolve;
      }),
  );
  const view = render(createElement(AiSetupDialog, p));
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Bắt đầu" }));
  view.rerender(createElement(AiSetupDialog, { ...p, open: false }));
  view.rerender(
    createElement(AiSetupDialog, {
      ...p,
      initial: { level: "medium", requestedSide: "black" },
    }),
  );
  await act(async () => finishOld());
  expect(p.onClose).not.toHaveBeenCalled();
  expect(screen.getByRole("dialog")).toBeTruthy();
  expect(
    (screen.getByRole("radio", { name: "Trung bình" }) as HTMLInputElement)
      .checked,
  ).toBe(true);
});
