// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegistrationPage } from "./RegistrationPage.js";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.useRealTimers();
  vi.restoreAllMocks();
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
  await user.type(screen.getByLabelText("Username"), "KyThu_2026");
  await user.type(
    screen.getByLabelText("Mật khẩu", { exact: true }),
    "password123",
  );
  await user.type(screen.getByLabelText("Xác nhận mật khẩu"), "password123");
  await user.click(screen.getByRole("button", { name: "Tiếp tục" }));
  await user.type(
    await screen.findByLabelText("Email chính chủ"),
    "player@example.test",
  );
  await user.click(screen.getByRole("button", { name: "Xác nhận Email" }));
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
  expect(JSON.parse(emailCall[1]!.body as string)).toEqual({
    username: "KyThu_2026",
    password: "password123",
    passwordConfirmation: "password123",
    email: "player@example.test",
  });
});

function reply(body: object, status = 200) {
  return new Response(JSON.stringify(body), { status });
}
const draft = () => ({
  registrationToken: "test-draft",
  expiresAt: new Date(Date.now() + 180000).toISOString(),
  resendAt: new Date(Date.now() + 60000).toISOString(),
});
async function enterAccount(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Username"), "KyThu_2026");
  await user.type(
    screen.getByLabelText("Mật khẩu", { exact: true }),
    "password123",
  );
  await user.type(screen.getByLabelText("Xác nhận mật khẩu"), "password123");
  await user.click(screen.getByRole("button", { name: "Tiếp tục" }));
}
async function enterEmail(user: ReturnType<typeof userEvent.setup>) {
  await user.type(
    await screen.findByLabelText("Email chính chủ"),
    "player@example.test",
  );
  await user.click(screen.getByRole("button", { name: "Xác nhận Email" }));
  await screen.findByLabelText("Chữ số OTP 1");
}
it("blocks short credentials and forbidden names before requesting the server", async () => {
  const request = vi.fn();
  vi.stubGlobal("fetch", request);
  const user = userEvent.setup();
  render(createElement(RegistrationPage, { onRegistered: vi.fn() }));
  await user.click(screen.getByRole("button", { name: "Tiếp tục" }));
  expect(screen.getByRole("alert").textContent).toContain("3–20");
  await user.type(screen.getByLabelText("Username"), "fuck_123");
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
  await user.type(screen.getByLabelText("Username"), "KyThu_2026");
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
  await user.click(screen.getByRole("button", { name: "Xác nhận Email" }));
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
  await user.click(screen.getByRole("button", { name: "Xác nhận Email" }));
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
        name: /Gửi lại mã sau/,
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
it("expires the OTP at three minutes without calling verify", async () => {
  const request = vi.fn(async (url: string) =>
    reply(url.endsWith("/check") ? { step: 2 } : draft()),
  );
  vi.stubGlobal("fetch", request);
  const user = userEvent.setup();
  render(createElement(RegistrationPage, { onRegistered: vi.fn() }));
  await enterAccount(user);
  await enterEmail(user);
  vi.spyOn(Date, "now").mockReturnValue(Date.now() + 181000);
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1100));
  });
  expect(screen.getByText("Mã đã hết hạn. Hãy gửi lại mã mới.")).toBeTruthy();
  expect(
    (
      screen.getByRole("button", {
        name: "Xác thực và vào Sảnh",
      }) as HTMLButtonElement
    ).disabled,
  ).toBe(true);
  expect(request.mock.calls.some(([url]) => url.endsWith("/verify"))).toBe(
    false,
  );
});
it("returns a last-moment username collision to step one and preserves the draft for retry", async () => {
  const request = vi.fn<
    (url: string, options?: RequestInit) => Promise<Response>
  >(async (url) =>
    reply(
      url.endsWith("/check")
        ? { step: 2 }
        : url.endsWith("/email")
          ? draft()
          : { code: "USERNAME_TAKEN", step: 1 },
      url.endsWith("/verify") ? 409 : 200,
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
  await screen.findByLabelText("Username");
  expect(screen.getByRole("alert").textContent).toContain(
    "Username đã có người dùng",
  );
  await user.clear(screen.getByLabelText("Username"));
  await user.type(screen.getByLabelText("Username"), "KyThu_Moi");
  await user.click(screen.getByRole("button", { name: "Tiếp tục" }));
  await screen.findByLabelText("Email chính chủ");
  vi.spyOn(Date, "now").mockReturnValue(Date.now() + 61000);
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1100));
  });
  await user.click(screen.getByRole("button", { name: "Xác nhận Email" }));
  await screen.findByLabelText("Chữ số OTP 1");
  const calls = request.mock.calls.filter(([url]) => url.endsWith("/email"));
  expect(JSON.parse(calls[1]![1]!.body as string)).toMatchObject({
    username: "KyThu_Moi",
    registrationToken: "test-draft",
  });
});

it("moves OTP focus by digit, accepts pasted digits, and supports Backspace", async () => {
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) =>
      reply(url.endsWith("/check") ? { step: 2 } : draft()),
    ),
  );
  const user = userEvent.setup();
  render(createElement(RegistrationPage, { onRegistered: vi.fn() }));
  await enterAccount(user);
  await enterEmail(user);
  expect(document.activeElement).toBe(screen.getByLabelText("Chữ số OTP 1"));
  await user.type(screen.getByLabelText("Chữ số OTP 1"), "1");
  expect(document.activeElement).toBe(screen.getByLabelText("Chữ số OTP 2"));
  await user.keyboard("{Backspace}");
  expect(document.activeElement).toBe(screen.getByLabelText("Chữ số OTP 1"));
  await user.click(screen.getByLabelText("Chữ số OTP 1"));
  await user.paste("a1234567");
  expect(
    Array.from(
      { length: 6 },
      (_, index) =>
        (screen.getByLabelText(`Chữ số OTP ${index + 1}`) as HTMLInputElement)
          .value,
    ).join(""),
  ).toBe("123456");
});
it.each([429, 503])(
  "handles HTTP %s without exposing provider details or advancing",
  async (status) => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        reply({ message: "private provider diagnostic" }, status),
      ),
    );
    const user = userEvent.setup();
    render(createElement(RegistrationPage, { onRegistered: vi.fn() }));
    await enterAccount(user);
    await vi.waitFor(() =>
      expect(screen.getByRole("alert").textContent).toContain(
        status === 429 ? "Có quá nhiều yêu cầu" : "Dịch vụ đăng ký",
      ),
    );
    expect(screen.queryByLabelText("Email chính chủ")).toBeNull();
    expect(screen.queryByText("private provider diagnostic")).toBeNull();
  },
);
it("explains successful account creation when caller navigation fails instead of retrying OTP", async () => {
  const request = vi.fn(async (url: string) =>
    reply(
      url.endsWith("/check")
        ? { step: 2 }
        : url.endsWith("/email")
          ? draft()
          : {
              access_token: "test-access",
              refresh_token: "test-refresh",
              expires_in: 3600,
            },
    ),
  );
  vi.stubGlobal("fetch", request);
  const user = userEvent.setup();
  render(
    createElement(RegistrationPage, {
      onRegistered: () => Promise.reject(new Error("navigation failed")),
    }),
  );
  await enterAccount(user);
  await enterEmail(user);
  await user.click(screen.getByLabelText("Chữ số OTP 1"));
  await user.paste("123456");
  await user.click(
    screen.getByRole("button", { name: "Xác thực và vào Sảnh" }),
  );
  await screen.findByText(
    "Tài khoản đã được tạo. Vui lòng đăng nhập để vào Sảnh.",
  );
  expect(
    screen.queryByRole("button", { name: "Xác thực và vào Sảnh" }),
  ).toBeNull();
});
it("reports malformed Username while typing without waiting for submission", async () => {
  const request = vi.fn();
  vi.stubGlobal("fetch", request);
  const user = userEvent.setup();
  render(createElement(RegistrationPage, { onRegistered: vi.fn() }));
  await user.type(screen.getByLabelText("Username"), "Ky Thu");
  expect(screen.getByRole("alert").textContent).toContain("3–20");
  expect(screen.getByLabelText("Username").getAttribute("aria-invalid")).toBe(
    "true",
  );
  expect(request).not.toHaveBeenCalled();
});

it.each([
  [undefined, "http://localhost:3000"],
  ["", "http://localhost:3000"],
  ["https://api.example.test/", "https://api.example.test"],
])(
  "posts credentials to the backend when VITE_API_URL is %s",
  async (configured, expectedBase) => {
    vi.stubEnv("VITE_API_URL", configured);
    const request = vi.fn(async () => reply({ step: 2 }));
    vi.stubGlobal("fetch", request);
    const user = userEvent.setup();
    render(createElement(RegistrationPage, { onRegistered: vi.fn() }));
    await enterAccount(user);
    await screen.findByLabelText("Email chính chủ");
    expect(request).toHaveBeenCalledWith(
      `${expectedBase}/auth/register/check`,
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({
          username: "KyThu_2026",
          password: "password123",
          passwordConfirmation: "password123",
        }),
      }),
    );
  },
);
