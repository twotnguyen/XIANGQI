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
import { RoomSettings, type RoomSettingsProps } from "./RoomSettings.js";
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
  vi.restoreAllMocks();
  for (const [name, descriptor] of originals) {
    if (descriptor)
      Object.defineProperty(HTMLDialogElement.prototype, name, descriptor);
    else Reflect.deleteProperty(HTMLDialogElement.prototype, name);
  }
});
const room: RoomSettingsProps["room"] = {
  name: "Kỳ hữu",
  status: "PLAYING",
  hostId: "11111111-1111-4111-8111-111111111111",
  visibility: "CODE_ONLY",
  inviteCode: "K7M2XQP4",
  timeMinutes: 10,
  viewerLimit: 5,
  seats: {
    red: "11111111-1111-4111-8111-111111111111",
    black: "22222222-2222-4222-8222-222222222222",
  },
  ready: { red: true, black: true },
  connected: { red: true, black: true },
  graceUntil: { red: null, black: null },
  countdown: null,
};
function setup(overrides: Partial<RoomSettingsProps> = {}) {
  const props: RoomSettingsProps = {
    open: true,
    onClose: vi.fn(),
    room,
    canManage: true,
    busy: false,
    onChange: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
  return { props, ...render(createElement(RoomSettings, props)) };
}
function mode(name: string) {
  fireEvent.click(screen.getByRole("radio", { name }));
}
function apply() {
  fireEvent.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
}
it("shows the canonical current mode and immutable room settings without sending on selection", () => {
  const { props } = setup();
  expect(
    (
      screen.getByRole("radio", {
        name: "Chỉ qua mã hoặc link",
      }) as HTMLInputElement
    ).checked,
  ).toBe(true);
  expect(
    screen.getByText("Chế độ hiện tại: Chỉ qua mã hoặc link"),
  ).toBeTruthy();
  expect(screen.getByText("10 phút · Tối đa 5 người xem")).toBeTruthy();
  mode("Công khai");
  expect(props.onChange).not.toHaveBeenCalled();
  expect(
    screen.getByText("Chế độ hiện tại: Chỉ qua mã hoặc link"),
  ).toBeTruthy();
});
it("disables enabling lock with the exact tooltip when fewer than two seats exist", () => {
  setup({ room: { ...room, seats: { red: room.seats.red, black: null } } });
  const lock = screen.getByRole("radio", { name: "Khóa phòng" });
  expect(lock.matches(":disabled")).toBe(true);
  expect(lock.closest("label")?.title).toBe(
    "Chỉ khoá được khi đã đủ 2 người chơi",
  );
});
it("keeps existing lock selected after a seat leaves and allows unlocking", async () => {
  const { props } = setup({
    room: {
      ...room,
      visibility: "LOCKED",
      inviteCode: null,
      seats: { red: room.seats.red, black: null },
    },
  });
  expect(
    (screen.getByRole("radio", { name: "Khóa phòng" }) as HTMLInputElement)
      .checked,
  ).toBe(true);
  mode("Chỉ qua mã hoặc link");
  await act(async () => apply());
  expect(props.onChange).toHaveBeenCalledExactlyOnceWith("CODE_ONLY");
});
it("confirms locking midgame with exact bold consequence and cancel focus", async () => {
  const { props } = setup();
  mode("Khóa phòng");
  apply();
  const dialog = screen.getByRole("dialog", { name: "Khóa phòng?" });
  expect(
    within(dialog).getByText(
      "Người mới sẽ không vào được. Người xem đang có vẫn được giữ lại.",
    ).tagName,
  ).toBe("STRONG");
  expect(document.activeElement).toBe(
    within(dialog).getByRole("button", { name: "Huỷ" }),
  );
  expect(props.onChange).not.toHaveBeenCalled();
  await act(async () =>
    fireEvent.click(within(dialog).getByRole("button", { name: "Khóa phòng" })),
  );
  expect(props.onChange).toHaveBeenCalledExactlyOnceWith("LOCKED");
});
it.each(["host", "seat"] as const)(
  "rechecks latest %s state while danger confirmation is open",
  (reason) => {
    const view = setup();
    mode("Khóa phòng");
    apply();
    view.rerender(
      createElement(RoomSettings, {
        ...view.props,
        ...(reason === "host"
          ? { canManage: false }
          : { room: { ...room, seats: { red: room.seats.red, black: null } } }),
      }),
    );
    expect(screen.queryByRole("dialog", { name: "Khóa phòng?" })).toBeNull();
    expect(view.props.onChange).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: "Lưu thay đổi" }).matches(":disabled"),
    ).toBe(true);
  },
);
it("blocks duplicate submission and closing until the pending operation settles", async () => {
  let resolve!: () => void;
  const onChange = vi.fn(
    () =>
      new Promise<void>((r) => {
        resolve = r;
      }),
  );
  const { props } = setup({ onChange });
  mode("Công khai");
  apply();
  apply();
  fireEvent.click(screen.getByRole("button", { name: "Đóng hộp thoại" }));
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(props.onClose).not.toHaveBeenCalled();
  expect(
    screen.getByRole("button", { name: "Lưu thay đổi" }).matches(":disabled"),
  ).toBe(true);
  await act(async () => resolve());
  expect(
    screen.getByText("Chế độ hiện tại: Chỉ qua mã hoặc link"),
  ).toBeTruthy();
});
it("renders safe errors, preserves canonical state, and permits a retry", async () => {
  const onChange = vi
    .fn()
    .mockRejectedValue(new Error("private token upstream"));
  setup({ onChange });
  mode("Công khai");
  await act(async () => apply());
  expect(screen.getByRole("alert").textContent).toContain(
    "Chưa thể đổi chế độ phòng",
  );
  expect(document.body.textContent).not.toContain("private token");
  expect(
    screen.getByText("Chế độ hiện tại: Chỉ qua mã hoặc link"),
  ).toBeTruthy();
  await act(async () => apply());
  expect(onChange).toHaveBeenCalledTimes(2);
});
it("accepts a fresh server mode and renders parent success/error status", () => {
  const view = setup();
  mode("Công khai");
  view.rerender(
    createElement(RoomSettings, {
      ...view.props,
      room: { ...room, visibility: "PUBLIC", inviteCode: "P8M2XQP4" },
      status: "Đã đổi chế độ phòng.",
    }),
  );
  expect(screen.getByText("Chế độ hiện tại: Công khai")).toBeTruthy();
  expect(
    (screen.getByRole("radio", { name: "Công khai" }) as HTMLInputElement)
      .checked,
  ).toBe(true);
  expect(screen.getByRole("status").textContent).toBe("Đã đổi chế độ phòng.");
});
it("uses the existing closable keyboard dialog and resets intent on reopening", () => {
  const view = setup();
  mode("Công khai");
  fireEvent(
    screen.getByRole("dialog"),
    new Event("cancel", { cancelable: true }),
  );
  expect(view.props.onClose).toHaveBeenCalledTimes(1);
  view.rerender(createElement(RoomSettings, { ...view.props, open: false }));
  view.rerender(createElement(RoomSettings, view.props));
  expect(
    (
      screen.getByRole("radio", {
        name: "Chỉ qua mã hoặc link",
      }) as HTMLInputElement
    ).checked,
  ).toBe(true);
});
it("danger pending keeps one request and disables cancel, escape and confirm until completion", async () => {
  let reject!: (error: Error) => void;
  const onChange = vi.fn(
    () =>
      new Promise<void>((_, r) => {
        reject = r;
      }),
  );
  const view = setup({ onChange });
  mode("Khóa phòng");
  apply();
  const dialog = screen.getByRole("dialog", { name: "Khóa phòng?" });
  const confirm = within(dialog).getByRole("button", { name: "Khóa phòng" });
  fireEvent.click(confirm);
  fireEvent.click(confirm);
  fireEvent(dialog, new Event("cancel", { cancelable: true }));
  expect(view.props.onClose).not.toHaveBeenCalled();
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(
    within(dialog)
      .getByRole("button", { name: "Đang khóa…" })
      .matches(":disabled"),
  ).toBe(true);
  expect(
    within(dialog).getByRole("button", { name: "Huỷ" }).matches(":disabled"),
  ).toBe(true);
  await act(async () => reject(new Error("secret")));
  expect(screen.getByRole("dialog", { name: "Cài đặt phòng" })).toBeTruthy();
  expect(
    screen.getByText("Chế độ hiện tại: Chỉ qua mã hoặc link"),
  ).toBeTruthy();
});
it("cancel danger leaves canonical mode alone and restores the normal settings dialog", () => {
  const view = setup();
  mode("Khóa phòng");
  apply();
  fireEvent.click(screen.getByRole("button", { name: "Huỷ" }));
  expect(screen.getByRole("dialog", { name: "Cài đặt phòng" })).toBeTruthy();
  expect(view.props.onChange).not.toHaveBeenCalled();
  expect(view.props.onClose).not.toHaveBeenCalled();
});
