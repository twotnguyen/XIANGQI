// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, expect, it, vi } from "vitest";
import {
  act,
  cleanup,
  render,
  screen,
  fireEvent,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegistrationPage } from "@web/features/auth/RegistrationPage.js";
import {
  reply,
  draft,
  enterAccount,
  enterEmail,
} from "./RegistrationPage.test-helper.js";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.useRealTimers();
  vi.restoreAllMocks();
});
it("checks new-password limits in UTF-8 bytes before advancing", async () => {
  const request = vi.fn().mockResolvedValue(reply({ step: 2 }));
  vi.stubGlobal("fetch", request);
  render(createElement(RegistrationPage, { onRegistered: vi.fn() }));
  fireEvent.change(screen.getByLabelText("Tên đăng nhập (Username)"), {
    target: { value: "KyThu" },
  });
  for (const password of ["🙂".repeat(7), "🙂".repeat(19)]) {
    fireEvent.change(screen.getByLabelText("Mật khẩu", { exact: true }), {
      target: { value: password },
    });
    fireEvent.change(screen.getByLabelText("Xác nhận mật khẩu"), {
      target: { value: password },
    });
    fireEvent.click(
      screen.getByRole("button", { name: "Tiếp tục: Nhập Email" }),
    );
    expect(request).not.toHaveBeenCalled();
  }
  expect(screen.getByRole("alert").textContent).toContain(
    "Mật khẩu tối đa 72 byte (chữ có dấu tính nhiều byte)",
  );
  const password = "🙂".repeat(18);
  fireEvent.change(screen.getByLabelText("Mật khẩu", { exact: true }), {
    target: { value: password },
  });
  fireEvent.change(screen.getByLabelText("Xác nhận mật khẩu"), {
    target: { value: password },
  });
  await act(async () => {
    fireEvent.click(
      screen.getByRole("button", { name: "Tiếp tục: Nhập Email" }),
    );
  });
  expect(screen.getByLabelText("Email chính chủ")).toBeTruthy();
});

it("offers Google only on the account step while keeping the email wizard unchanged", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(new Response(JSON.stringify({ step: 2 }))),
  );
  const user = userEvent.setup();
  render(
    createElement(RegistrationPage, {
      onRegistered: vi.fn(),
      renderGoogle: () => createElement("span", null, "Official signup Google"),
    }),
  );
  expect(screen.getByText("Official signup Google")).toBeTruthy();
  await user.type(
    screen.getByLabelText("Tên đăng nhập (Username)"),
    "KyThu_2026",
  );
  await user.type(
    screen.getByLabelText("Mật khẩu", { exact: true }),
    "Password123",
  );
  await user.type(screen.getByLabelText("Xác nhận mật khẩu"), "Password123");
  await user.click(
    screen.getByRole("button", { name: "Tiếp tục: Nhập Email" }),
  );
  await screen.findByLabelText("Email chính chủ");
  expect(screen.queryByText("Official signup Google")).toBeNull();
});
it("blocks email-wizard submission while Google authentication is in flight", () => {
  const request = vi.fn();
  vi.stubGlobal("fetch", request);
  render(
    createElement(RegistrationPage, {
      onRegistered: vi.fn(),
      renderGoogle: (_disabled: boolean, busy?: (value: boolean) => void) =>
        createElement(
          "button",
          { onClick: () => busy?.(true) },
          "Google inflight",
        ),
    }),
  );
  fireEvent.change(screen.getByLabelText("Tên đăng nhập (Username)"), {
    target: { value: "KyThu" },
  });
  fireEvent.change(screen.getByLabelText("Mật khẩu", { exact: true }), {
    target: { value: "Password123" },
  });
  fireEvent.change(screen.getByLabelText("Xác nhận mật khẩu"), {
    target: { value: "Password123" },
  });
  fireEvent.click(screen.getByText("Google inflight"));
  expect(
    (screen.getByLabelText("Tên đăng nhập (Username)") as HTMLInputElement)
      .disabled,
  ).toBe(true);
  fireEvent.submit(
    screen.getByLabelText("Tên đăng nhập (Username)").closest("form")!,
  );
  expect(request).not.toHaveBeenCalled();
});

it("registers in three steps, sends the exact backend payload and hands the active session to its caller", async () => {
  const session = {
    access_token: "test-access",
    refresh_token: "test-refresh",
    expires_in: 3600,
  };
  const request = vi.fn<
    (url: string, options?: RequestInit) => Promise<Response>
  >(async (url) => {
    const body = url.endsWith("/check")
      ? { step: 2 }
      : url.endsWith("/email")
        ? {
            registrationToken: "test-draft",
            expiresAt: new Date(Date.now() + 180000).toISOString(),
            resendAt: new Date(Date.now() + 60000).toISOString(),
          }
        : session;
    return new Response(JSON.stringify(body), { status: 200 });
  });
  vi.stubGlobal("fetch", request);
  const onRegistered = vi.fn();
  const user = userEvent.setup();
  render(createElement(RegistrationPage, { onRegistered }));
  await user.type(
    screen.getByLabelText("Tên đăng nhập (Username)"),
    "KyThu_2026",
  );
  await user.type(
    screen.getByLabelText("Mật khẩu", { exact: true }),
    "password123",
  );
  await user.type(screen.getByLabelText("Xác nhận mật khẩu"), "password123");
  await user.click(
    screen.getByRole("button", { name: "Tiếp tục: Nhập Email" }),
  );
  await user.type(
    await screen.findByLabelText("Email chính chủ"),
    "player@example.test",
  );
  await user.click(
    screen.getByRole("button", { name: "Gửi mã OTP qua Email" }),
  );
  await user.click(await screen.findByLabelText("Chữ số OTP 1"));
  await user.paste("123456");
  await user.click(
    screen.getByRole("button", { name: "Xác thực và vào Sảnh" }),
  );
  await vi.waitFor(() => expect(onRegistered).toHaveBeenCalledWith(session));
  expect(request.mock.calls.map(([url]) => url.endsWith("/verify"))).toContain(
    true,
  );
  const emailCall = request.mock.calls.find(([url]) => url.endsWith("/email"))!;
  expect(
    request.mock.calls.every(([, init]) => init?.redirect === "error"),
  ).toBe(true);
  expect(JSON.parse(emailCall[1]!.body as string)).toEqual({
    username: "KyThu_2026",
    password: "password123",
    passwordConfirmation: "password123",
    email: "player@example.test",
  });
  const verifyCall = request.mock.calls.find(([url]) =>
    url.endsWith("/verify"),
  )!;
  expect(JSON.parse(verifyCall[1]!.body as string)).toEqual({
    registrationToken: "test-draft",
    otp: "123456",
    password: "password123",
  });
});

it("blocks short credentials and forbidden names before requesting the server", async () => {
  const request = vi.fn();
  vi.stubGlobal("fetch", request);
  const user = userEvent.setup();
  render(createElement(RegistrationPage, { onRegistered: vi.fn() }));
  await user.click(
    screen.getByRole("button", { name: "Tiếp tục: Nhập Email" }),
  );
  expect(screen.getByRole("alert").textContent).toContain("3–20");
  await user.type(
    screen.getByLabelText("Tên đăng nhập (Username)"),
    "fuck_123",
  );
  expect(screen.getByRole("alert").textContent).toContain("không được phép");
  expect(request).not.toHaveBeenCalled();
});
it("checks availability after a pause and keeps the user on the account step", async () => {
  const request = vi.fn(async () =>
    reply({ code: "USERNAME_TAKEN", step: 1 }, 409),
  );
  vi.stubGlobal("fetch", request);
  const user = userEvent.setup();
  render(createElement(RegistrationPage, { onRegistered: vi.fn() }));
  await user.type(
    screen.getByLabelText("Tên đăng nhập (Username)"),
    "KyThu_2026",
  );
  await user.type(
    screen.getByLabelText("Mật khẩu", { exact: true }),
    "password123",
  );
  await user.type(screen.getByLabelText("Xác nhận mật khẩu"), "password123");
  await screen.findByText(
    "Username đã có người dùng. Vui lòng chọn Username khác.",
  );
  expect(screen.queryByLabelText("Email chính chủ")).toBeNull();
});
it("keeps an already registered email at step two and never verifies OTP", async () => {
  const request = vi.fn(async (url: string) =>
    url.endsWith("/check")
      ? reply({ step: 2 })
      : reply({ code: "EMAIL_TAKEN", step: 2 }, 409),
  );
  vi.stubGlobal("fetch", request);
  const user = userEvent.setup();
  render(createElement(RegistrationPage, { onRegistered: vi.fn() }));
  await enterAccount(user);
  await user.type(
    await screen.findByLabelText("Email chính chủ"),
    "player@example.test",
  );
  await user.click(
    screen.getByRole("button", { name: "Gửi mã OTP qua Email" }),
  );
  await screen.findByText("Email này đã được đăng ký");
  expect(screen.queryByLabelText("Chữ số OTP 1")).toBeNull();
});
it.each([
  ["OTP_INVALID", 400, "Mã OTP không đúng"],
  ["REGISTRATION_RECOVERING", 503, "Đăng ký đang được xử lý"],
])("does not create a session for %s", async (code, status, message) => {
  const callback = vi.fn();
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) =>
      reply(
        url.endsWith("/check")
          ? { step: 2 }
          : url.endsWith("/email")
            ? draft()
            : { code },
        url.endsWith("/verify") ? status : 200,
      ),
    ),
  );
  const user = userEvent.setup();
  render(createElement(RegistrationPage, { onRegistered: callback }));
  await enterAccount(user);
  await enterEmail(user);
  await user.click(screen.getByLabelText("Chữ số OTP 1"));
  await user.paste("123456");
  await user.click(
    screen.getByRole("button", { name: "Xác thực và vào Sảnh" }),
  );
  await vi.waitFor(() =>
    expect(screen.getByRole("alert").textContent).toContain(message),
  );
  expect(callback).not.toHaveBeenCalled();
});
it("shows a safe provider failure without exposing server messages", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) =>
      url.endsWith("/check")
        ? reply({ step: 2 })
        : reply(
            { code: "OTP_SEND_FAILED", message: "smtp secret details" },
            503,
          ),
    ),
  );
  const user = userEvent.setup();
  render(createElement(RegistrationPage, { onRegistered: vi.fn() }));
  await enterAccount(user);
  await user.type(
    await screen.findByLabelText("Email chính chủ"),
    "player@example.test",
  );
  await user.click(
    screen.getByRole("button", { name: "Gửi mã OTP qua Email" }),
  );
  await screen.findByText("Không gửi được mã, vui lòng thử lại sau");
  expect(screen.queryByText("smtp secret details")).toBeNull();
});
it("locks rate-limited verification until a successful resend after sixty seconds", async () => {
  const request = vi.fn(async (url: string) =>
    reply(
      url.endsWith("/check")
        ? { step: 2 }
        : url.endsWith("/verify")
          ? { code: "OTP_RATE_LIMIT" }
          : draft(),
      url.endsWith("/verify") ? 429 : 200,
    ),
  );
  vi.stubGlobal("fetch", request);
  const user = userEvent.setup();
  render(createElement(RegistrationPage, { onRegistered: vi.fn() }));
  await enterAccount(user);
  await enterEmail(user);
  await user.click(screen.getByLabelText("Chữ số OTP 1"));
  await user.paste("123456");
  await user.click(
    screen.getByRole("button", { name: "Xác thực và vào Sảnh" }),
  );
  await screen.findByText(
    "Bạn đã thử quá nhiều lần. Vui lòng chờ và gửi lại mã mới.",
  );
  expect(
    (
      screen.getByRole("button", {
        name: "Xác thực và vào Sảnh",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
  expect(
    (
      screen.getByRole("button", {
        name: /Gửi lại mã \(/,
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
  vi.spyOn(Date, "now").mockReturnValue(Date.now() + 61000);
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1100));
  });
  await user.click(screen.getByRole("button", { name: "Gửi lại mã" }));
  await vi.waitFor(() =>
    expect(
      (
        screen.getByRole("button", {
          name: "Xác thực và vào Sảnh",
        }) as HTMLButtonElement
      ).disabled,
    ).toBe(false),
  );
  expect(
    (screen.getByLabelText("Chữ số OTP 1") as HTMLInputElement).value,
  ).toBe("");
  expect(document.activeElement).toBe(screen.getByLabelText("Chữ số OTP 1"));
});
