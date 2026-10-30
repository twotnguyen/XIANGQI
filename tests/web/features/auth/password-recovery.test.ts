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
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { ForgotPasswordPage } from "@web/features/auth/ForgotPasswordPage.js";
import { ResetPasswordPage } from "@web/features/auth/ResetPasswordPage.js";
import {
  getPendingRecovery,
  setPendingRecovery,
} from "@web/features/auth/password-recovery.js";
import { PasswordChangeForm } from "@web/features/profile/PasswordChangeForm.js";

const requestId = "a".repeat(43);
const future = () => new Date(Date.now() + 180_000).toISOString();
const past = () => new Date(Date.now() - 1_000).toISOString();

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

let fetchMock: ReturnType<typeof vi.fn>;
beforeEach(() => {
  fetchMock = vi.fn();
  vi.stubGlobal("fetch", fetchMock);
  window.history.replaceState(null, "", "/forgot-password");
  setPendingRecovery(null);
});
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

it("stores the request in memory and moves to the OTP step on send", async () => {
  fetchMock.mockResolvedValueOnce(
    json({ requestId, expiresAt: future(), resendAt: past() }),
  );
  const user = userEvent.setup();
  render(createElement(ForgotPasswordPage));
  await user.type(screen.getByLabelText(/Tên đăng nhập/), "alice");
  await user.click(screen.getByRole("button", { name: "Gửi mã OTP" }));
  expect(JSON.parse(fetchMock.mock.calls[0]![1].body)).toEqual({
    username: "alice",
  });
  expect(window.location.pathname).toBe("/reset-password");
  expect(getPendingRecovery()?.requestId).toBe(requestId);
  expect(window.location.search).toBe("");
});

it("shows the exact unavailable message when no verified Gmail exists", async () => {
  const message =
    "Tài khoản không có Gmail đã xác minh nên không thể khôi phục mật khẩu.";
  fetchMock.mockResolvedValueOnce(
    json({ code: "PASSWORD_RECOVERY_UNAVAILABLE", message }, 400),
  );
  const user = userEvent.setup();
  render(createElement(ForgotPasswordPage));
  await user.type(screen.getByLabelText(/Tên đăng nhập/), "alice");
  await user.click(screen.getByRole("button", { name: "Gửi mã OTP" }));
  expect((await screen.findByRole("alert")).textContent).toBe(message);
  expect(window.location.pathname).toBe("/forgot-password");
  expect(getPendingRecovery()).toBeNull();
});

it("verifies OTP, resets the password and clears recovery context without app login", async () => {
  setPendingRecovery({ requestId, expiresAt: future(), resendAt: past() });
  window.history.replaceState(null, "", "/reset-password");
  fetchMock
    .mockResolvedValueOnce(json({ resetToken: "b".repeat(43) }))
    .mockResolvedValueOnce(json({ ok: true }));
  const user = userEvent.setup();
  render(createElement(ResetPasswordPage));
  await user.type(screen.getByLabelText("Mã OTP"), "123456");
  await user.click(screen.getByRole("button", { name: "Xác minh mã" }));
  await user.type(screen.getByLabelText("Mật khẩu mới"), "newsecret");
  await user.type(screen.getByLabelText("Nhập lại mật khẩu mới"), "newsecret");
  await user.click(screen.getByRole("button", { name: "Đặt lại mật khẩu" }));
  const body = JSON.parse(fetchMock.mock.calls[1]![1].body);
  expect(body).toEqual({
    requestId,
    resetToken: "b".repeat(43),
    newPassword: "newsecret",
    passwordConfirmation: "newsecret",
  });
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(getPendingRecovery()).toBeNull();
});

it("rejects a mismatched new password before calling the server", async () => {
  setPendingRecovery({ requestId, expiresAt: future(), resendAt: past() });
  fetchMock.mockResolvedValueOnce(json({ resetToken: "b".repeat(43) }));
  const user = userEvent.setup();
  render(createElement(ResetPasswordPage));
  await user.type(screen.getByLabelText("Mã OTP"), "123456");
  await user.click(screen.getByRole("button", { name: "Xác minh mã" }));
  await user.type(screen.getByLabelText("Mật khẩu mới"), "newsecret");
  await user.type(screen.getByLabelText("Nhập lại mật khẩu mới"), "other");
  await user.click(screen.getByRole("button", { name: "Đặt lại mật khẩu" }));
  expect(fetchMock).toHaveBeenCalledTimes(1);
  expect((await screen.findByRole("alert")).textContent).toContain(
    "khớp với xác nhận",
  );
});

it("submits the change-password body and rejects a mismatched confirmation", async () => {
  const changePassword = vi.fn().mockResolvedValue(undefined);
  const user = userEvent.setup();
  render(
    createElement(PasswordChangeForm, {
      client: { changePassword } as never,
    }),
  );
  await user.type(screen.getByLabelText("Mật khẩu hiện tại"), "oldsecret");
  await user.type(screen.getByLabelText("Mật khẩu mới"), "newsecret");
  await user.type(screen.getByLabelText("Nhập lại mật khẩu mới"), "other");
  fireEvent.submit(screen.getByRole("form", { name: "Đổi mật khẩu" }));
  expect(changePassword).not.toHaveBeenCalled();
  expect((await screen.findByRole("alert")).textContent).toContain(
    "khớp với xác nhận",
  );
  await user.clear(screen.getByLabelText("Nhập lại mật khẩu mới"));
  await user.type(screen.getByLabelText("Nhập lại mật khẩu mới"), "newsecret");
  await user.click(screen.getByRole("button", { name: "Đổi mật khẩu" }));
  expect((await screen.findByRole("status")).textContent).toContain(
    "phiên này vẫn tiếp tục",
  );
  for (const label of [
    "Mật khẩu hiện tại",
    "Mật khẩu mới",
    "Nhập lại mật khẩu mới",
  ])
    expect((screen.getByLabelText(label) as HTMLInputElement).value).toBe("");
});

it.each([
  { code: "PASSWORD_PROVIDER_ERROR", status: 503, notice: "yêu cầu mã mới" },
  { code: "PASSWORD_OTP_EXPIRED", status: 410, notice: "Vui lòng bắt đầu lại" },
])(
  "abandons unusable reset authorization after $code and offers a fresh request",
  async ({ code, status, notice }) => {
    setPendingRecovery({ requestId, expiresAt: future(), resendAt: past() });
    fetchMock
      .mockResolvedValueOnce(json({ resetToken: "b".repeat(43) }))
      .mockResolvedValueOnce(json({ code }, status));
    const user = userEvent.setup();
    render(createElement(ResetPasswordPage));
    await user.type(screen.getByLabelText("Mã OTP"), "123456");
    await user.click(screen.getByRole("button", { name: "Xác minh mã" }));
    await user.type(screen.getByLabelText("Mật khẩu mới"), "newsecret");
    await user.type(
      screen.getByLabelText("Nhập lại mật khẩu mới"),
      "newsecret",
    );
    await user.click(screen.getByRole("button", { name: "Đặt lại mật khẩu" }));
    expect((await screen.findByRole("status")).textContent).toContain(notice);
    expect(screen.queryByRole("form", { name: "Đặt mật khẩu mới" })).toBeNull();
    expect(getPendingRecovery()).toBeNull();
    expect(
      screen.getByRole("link", { name: "Quên mật khẩu" }).getAttribute("href"),
    ).toBe("/forgot-password");
  },
);

it("ignores a password request after switching to username recovery", async () => {
  let finish!: (response: Response) => void;
  fetchMock.mockReturnValueOnce(
    new Promise<Response>((resolve) => {
      finish = resolve;
    }),
  );
  render(createElement(ForgotPasswordPage));
  fireEvent.change(screen.getByLabelText("Tên đăng nhập (Username)"), {
    target: { value: "alice" },
  });
  fireEvent.submit(screen.getByRole("form", { name: "Quên mật khẩu" }));
  fireEvent.click(screen.getByRole("button", { name: "Quên tên đăng nhập?" }));
  await act(async () => {
    finish(json({ requestId, expiresAt: future(), resendAt: past() }));
  });
  expect(screen.getByLabelText("Email đã xác minh")).toBeTruthy();
  expect(getPendingRecovery()).toBeNull();
  expect(window.location.pathname).toBe("/forgot-password");
});

it("does not replace a newer recovery context after leaving the forgot page", async () => {
  let finish!: (response: Response) => void;
  fetchMock.mockReturnValueOnce(
    new Promise<Response>((resolve) => {
      finish = resolve;
    }),
  );
  const view = render(createElement(ForgotPasswordPage));
  fireEvent.change(screen.getByLabelText("Tên đăng nhập (Username)"), {
    target: { value: "alice" },
  });
  fireEvent.submit(screen.getByRole("form", { name: "Quên mật khẩu" }));
  view.unmount();
  const newer = {
    requestId: "n".repeat(43),
    expiresAt: future(),
    resendAt: past(),
  };
  setPendingRecovery(newer);
  window.history.replaceState(null, "", "/login");
  await act(async () => {
    finish(json({ requestId, expiresAt: future(), resendAt: past() }));
  });
  expect(getPendingRecovery()).toEqual(newer);
  expect(window.location.pathname).toBe("/login");
});

it("drops an OTP grant when its input changed while verification was pending", async () => {
  let finish!: (response: Response) => void;
  setPendingRecovery({ requestId, expiresAt: future(), resendAt: past() });
  fetchMock.mockReturnValueOnce(
    new Promise<Response>((resolve) => {
      finish = resolve;
    }),
  );
  render(createElement(ResetPasswordPage));
  fireEvent.change(screen.getByLabelText("Mã OTP"), {
    target: { value: "123456" },
  });
  fireEvent.submit(screen.getByRole("form", { name: "Nhập mã OTP" }));
  fireEvent.change(screen.getByLabelText("Mã OTP"), {
    target: { value: "654321" },
  });
  await act(async () => {
    finish(json({ resetToken: "b".repeat(43) }));
  });
  expect(screen.queryByRole("form", { name: "Đặt mật khẩu mới" })).toBeNull();
  expect((screen.getByLabelText("Mã OTP") as HTMLInputElement).value).toBe(
    "654321",
  );
});

it("does not apply a resend response after a different recovery request was started", async () => {
  let finish!: (response: Response) => void;
  setPendingRecovery({ requestId, expiresAt: future(), resendAt: past() });
  fetchMock.mockReturnValueOnce(
    new Promise<Response>((resolve) => {
      finish = resolve;
    }),
  );
  render(createElement(ResetPasswordPage));
  fireEvent.click(screen.getByRole("button", { name: "Gửi lại mã" }));
  const newer = {
    requestId: "n".repeat(43),
    expiresAt: future(),
    resendAt: past(),
  };
  setPendingRecovery(newer);
  await act(async () => {
    finish(json({ requestId, expiresAt: future(), resendAt: past() }));
  });
  expect(getPendingRecovery()).toEqual(newer);
  expect(screen.queryByText("Đã gửi lại mã OTP.")).toBeNull();
});

it("does not clear a new context or redirect after leaving an in-flight reset", async () => {
  let finish!: (response: Response) => void;
  setPendingRecovery({ requestId, expiresAt: future(), resendAt: past() });
  window.history.replaceState(null, "", "/reset-password");
  fetchMock
    .mockResolvedValueOnce(json({ resetToken: "b".repeat(43) }))
    .mockReturnValueOnce(
      new Promise<Response>((resolve) => {
        finish = resolve;
      }),
    );
  const view = render(createElement(ResetPasswordPage));
  fireEvent.change(screen.getByLabelText("Mã OTP"), {
    target: { value: "123456" },
  });
  await act(async () => {
    fireEvent.submit(screen.getByRole("form", { name: "Nhập mã OTP" }));
  });
  fireEvent.change(screen.getByLabelText("Mật khẩu mới"), {
    target: { value: "newsecret" },
  });
  fireEvent.change(screen.getByLabelText("Nhập lại mật khẩu mới"), {
    target: { value: "newsecret" },
  });
  fireEvent.submit(screen.getByRole("form", { name: "Đặt mật khẩu mới" }));
  fireEvent.click(screen.getByRole("link", { name: "Quay lại đăng nhập" }));
  view.unmount();
  const newer = {
    requestId: "n".repeat(43),
    expiresAt: future(),
    resendAt: past(),
  };
  setPendingRecovery(newer);
  await act(async () => {
    finish(json({ ok: true }));
  });
  expect(getPendingRecovery()).toEqual(newer);
  expect(window.location.pathname).toBe("/login");
  expect(window.location.search).toBe("");
});
