// @vitest-environment jsdom
import { createElement } from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi, type Mock } from "vitest";

import { ForgotPasswordPage } from "@web/features/auth/ForgotPasswordPage.js";
import { UsernameRecoveryPanel } from "@web/features/auth/UsernameRecoveryPanel.js";
const requestId = "a".repeat(43);
const future = () => new Date(Date.now() + 180_000).toISOString();
const past = () => new Date(Date.now() - 1_000).toISOString();

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

let fetchMock: Mock;
beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  window.history.replaceState(null, "", "/forgot-password");
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.useRealTimers();
});

it("switches the forgot page to username recovery and shows the username only after the OTP", async () => {
  const user = userEvent.setup();
  fetchMock
    .mockResolvedValueOnce(
      json({ requestId, expiresAt: future(), resendAt: past() }),
    )
    .mockResolvedValueOnce(json({ username: "chessfan" }));
  render(createElement(ForgotPasswordPage));
  await user.click(screen.getByRole("button", { name: "Quên tên đăng nhập?" }));
  await user.type(screen.getByLabelText(/email/i), "member@example.invalid");
  await user.click(screen.getByRole("button", { name: /gửi/i }));
  await user.type(await screen.findByLabelText("Mã OTP"), "123456");
  await user.click(screen.getByRole("button", { name: "Xác minh" }));
  expect(await screen.findByText(/chessfan/)).toBeTruthy();
  const [url, init] = fetchMock.mock.calls[0] ?? [];
  expect(String(url)).toContain("/auth/username/recovery");
  expect(String(init?.body)).not.toContain("chessfan");
});

it("uses the returned expiry and cooldown without resetting them on rerender", async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-31T00:00:00Z"));
  const started = Date.now();
  fetchMock.mockResolvedValueOnce(
    json({
      requestId,
      expiresAt: new Date(started + 180_000).toISOString(),
      resendAt: new Date(started + 60_000).toISOString(),
    }),
  );
  const view = render(createElement(UsernameRecoveryPanel));
  fireEvent.change(screen.getByLabelText("Email đã xác minh"), {
    target: { value: "member@example.invalid" },
  });
  await act(async () => {
    fireEvent.submit(screen.getByRole("form", { name: "Quên tên đăng nhập" }));
  });
  expect(screen.getByText("Mã còn hiệu lực 3:00.")).toBeTruthy();
  expect(
    screen
      .getByRole("button", { name: "Gửi lại mã" })
      .getAttribute("aria-disabled"),
  ).toBe("true");
  act(() => vi.advanceTimersByTime(60_000));
  view.rerender(createElement(UsernameRecoveryPanel));
  expect(screen.getByText("Mã còn hiệu lực 2:00.")).toBeTruthy();
  expect(
    screen
      .getByRole("button", { name: "Gửi lại mã" })
      .getAttribute("aria-disabled"),
  ).toBe("false");
  fireEvent.change(screen.getByLabelText("Mã OTP"), {
    target: { value: "123456" },
  });
  act(() => vi.advanceTimersByTime(120_000));
  fireEvent.submit(
    screen.getByRole("form", { name: "Xác minh mã tên đăng nhập" }),
  );
  expect(screen.getByRole("alert").textContent).toContain("Mã đã hết hạn");
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

it("does not reveal a verified name after the user starts over with another email", async () => {
  let finish!: (response: Response) => void;
  fetchMock
    .mockResolvedValueOnce(
      json({ requestId, expiresAt: future(), resendAt: past() }),
    )
    .mockReturnValueOnce(
      new Promise<Response>((resolve) => {
        finish = resolve;
      }),
    );
  render(createElement(UsernameRecoveryPanel));
  fireEvent.change(screen.getByLabelText("Email đã xác minh"), {
    target: { value: "old@example.invalid" },
  });
  await act(async () => {
    fireEvent.submit(screen.getByRole("form", { name: "Quên tên đăng nhập" }));
  });
  fireEvent.change(screen.getByLabelText("Mã OTP"), {
    target: { value: "123456" },
  });
  fireEvent.submit(
    screen.getByRole("form", { name: "Xác minh mã tên đăng nhập" }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Dùng email khác" }));
  fireEvent.change(screen.getByLabelText("Email đã xác minh"), {
    target: { value: "new@example.invalid" },
  });
  await act(async () => {
    finish(json({ username: "old_account_name" }));
  });
  expect(screen.queryByText("old_account_name")).toBeNull();
  expect(
    (screen.getByLabelText("Email đã xác minh") as HTMLInputElement).value,
  ).toBe("new@example.invalid");
});

it("keeps the new recovery request when an old resend returns late", async () => {
  let finish!: (response: Response) => void;
  const nextId = "b".repeat(43);
  fetchMock
    .mockResolvedValueOnce(
      json({ requestId, expiresAt: future(), resendAt: past() }),
    )
    .mockReturnValueOnce(
      new Promise<Response>((resolve) => {
        finish = resolve;
      }),
    )
    .mockResolvedValueOnce(
      json({ requestId: nextId, expiresAt: future(), resendAt: past() }),
    )
    .mockResolvedValueOnce(json({ username: "new_account_name" }));
  render(createElement(UsernameRecoveryPanel));
  fireEvent.change(screen.getByLabelText("Email đã xác minh"), {
    target: { value: "old@example.invalid" },
  });
  await act(async () => {
    fireEvent.submit(screen.getByRole("form", { name: "Quên tên đăng nhập" }));
  });
  fireEvent.click(screen.getByRole("button", { name: "Gửi lại mã" }));
  fireEvent.click(screen.getByRole("button", { name: "Dùng email khác" }));
  fireEvent.change(screen.getByLabelText("Email đã xác minh"), {
    target: { value: "new@example.invalid" },
  });
  await act(async () => {
    fireEvent.submit(screen.getByRole("form", { name: "Quên tên đăng nhập" }));
  });
  await act(async () => {
    finish(json({ requestId, expiresAt: future(), resendAt: past() }));
  });
  fireEvent.change(screen.getByLabelText("Mã OTP"), {
    target: { value: "123456" },
  });
  await act(async () => {
    fireEvent.submit(
      screen.getByRole("form", { name: "Xác minh mã tên đăng nhập" }),
    );
  });
  expect(
    JSON.parse(String(fetchMock.mock.calls.at(-1)?.[1]?.body)).requestId,
  ).toBe(nextId);
  expect(screen.getByText("new_account_name")).toBeTruthy();
});
