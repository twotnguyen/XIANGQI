// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { act, cleanup, render, screen } from "@testing-library/react";
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
it("retries confirmed registration after a completion failure without requiring another OTP", async () => {
  let verified = false;
  const session = {
    access_token: "recovered-access",
    refresh_token: "recovered-refresh",
    expires_in: 3600,
  };
  const request = vi.fn(async (url: string) => {
    if (url.endsWith("/verify")) {
      if (verified) return reply(session);
      verified = true;
      return reply({ code: "REGISTRATION_RECOVERING" }, 503);
    }
    return reply(url.endsWith("/check") ? { step: 2 } : draft());
  });
  vi.stubGlobal("fetch", request);
  const user = userEvent.setup();
  const onRegistered = vi.fn();
  render(createElement(RegistrationPage, { onRegistered }));
  await enterAccount(user);
  await enterEmail(user);
  await user.click(screen.getByLabelText("Chữ số OTP 1"));
  await user.paste("123456");
  await user.click(
    screen.getByRole("button", { name: "Xác thực và vào Sảnh" }),
  );
  expect(onRegistered).not.toHaveBeenCalled();
  expect(screen.queryByRole("button", { name: /Gửi lại mã/ })).toBeNull();
  vi.spyOn(Date, "now").mockReturnValue(Date.now() + 181000);
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1100));
  });
  await user.click(screen.getByRole("button", { name: "Hoàn tất đăng ký" }));
  await vi.waitFor(() => expect(onRegistered).toHaveBeenCalledWith(session));
});
it.each(["AUTH_PROVIDER_ERROR", "REGISTRATION_UNAVAILABLE"])(
  "checks an uncertain %s verification result after the OTP deadline",
  async (code) => {
    let calls = 0;
    const callback = vi.fn();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.endsWith("/verify"))
          return ++calls === 1
            ? reply({ code }, 503)
            : reply({
                access_token: "recovered",
                refresh_token: "refresh",
                expires_in: 3600,
              });
        return reply(url.endsWith("/check") ? { step: 2 } : draft());
      }),
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
    vi.spyOn(Date, "now").mockReturnValue(Date.now() + 181000);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1100));
    });
    expect(screen.queryByText(/Email đã được xác minh/)).toBeNull();
    await user.click(screen.getByRole("button", { name: "Kiểm tra đăng ký" }));
    await vi.waitFor(() => expect(callback).toHaveBeenCalledOnce());
  },
);
it("resets recovery when an expired draft starts a new registration", async () => {
  let calls = 0;
  vi.stubGlobal(
    "fetch",
    vi.fn(async (url: string) => {
      if (url.endsWith("/verify")) {
        calls++;
        return reply(
          calls === 1
            ? { code: "REGISTRATION_RECOVERING" }
            : { code: "REGISTRATION_EXPIRED", step: 1 },
          calls === 1 ? 503 : 400,
        );
      }
      return reply(url.endsWith("/check") ? { step: 2 } : draft());
    }),
  );
  const user = userEvent.setup();
  render(createElement(RegistrationPage, { onRegistered: vi.fn() }));
  await enterAccount(user);
  await enterEmail(user);
  await user.click(screen.getByLabelText("Chữ số OTP 1"));
  await user.paste("123456");
  await user.click(
    screen.getByRole("button", { name: "Xác thực và vào Sảnh" }),
  );
  await user.click(screen.getByRole("button", { name: "Hoàn tất đăng ký" }));
  await user.click(
    screen.getByRole("button", { name: "Tiếp tục: Nhập Email" }),
  );
  await user.click(
    screen.getByRole("button", { name: "Gửi mã OTP qua Email" }),
  );
  expect(await screen.findByLabelText("Chữ số OTP 1")).toBeTruthy();
  expect(screen.getByRole("button", { name: /Gửi lại mã/ })).toBeTruthy();
});
it.each(["OTP_RATE_LIMIT", "RECOVERY_RATE_LIMIT"])(
  "keeps confirmed recovery after a rate-limited password retry (%s)",
  async (rateCode) => {
    let calls = 0;
    const callback = vi.fn();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) => {
        if (url.endsWith("/verify")) {
          calls++;
          if (calls === 1)
            return reply({ code: "REGISTRATION_RECOVERING" }, 503);
          if (calls === 2) return reply({ code: rateCode }, 429);
          return reply({
            access_token: "recovered",
            refresh_token: "refresh",
            expires_in: 3600,
          });
        }
        return reply(url.endsWith("/check") ? { step: 2 } : draft());
      }),
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
    await user.click(screen.getByRole("button", { name: "Hoàn tất đăng ký" }));
    if (rateCode === "RECOVERY_RATE_LIMIT")
      expect(screen.getByRole("alert").textContent).toContain("15 phút");
    vi.spyOn(Date, "now").mockReturnValue(Date.now() + 181000);
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 1100));
    });
    expect(screen.queryByRole("button", { name: /Gửi lại mã/ })).toBeNull();
    await user.click(screen.getByRole("button", { name: "Hoàn tất đăng ký" }));
    await vi.waitFor(() => expect(callback).toHaveBeenCalledOnce());
  },
);
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
  await screen.findByLabelText("Tên đăng nhập (Username)");
  expect(screen.getByRole("alert").textContent).toContain(
    "Username đã có người dùng",
  );
  await user.clear(screen.getByLabelText("Tên đăng nhập (Username)"));
  await user.type(
    screen.getByLabelText("Tên đăng nhập (Username)"),
    "KyThu_Moi",
  );
  await user.click(
    screen.getByRole("button", { name: "Tiếp tục: Nhập Email" }),
  );
  await screen.findByLabelText("Email chính chủ");
  vi.spyOn(Date, "now").mockReturnValue(Date.now() + 61000);
  await act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 1100));
  });
  await user.click(
    screen.getByRole("button", { name: "Gửi mã OTP qua Email" }),
  );
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
  await user.type(screen.getByLabelText("Tên đăng nhập (Username)"), "Ky Thu");
  expect(screen.getByRole("alert").textContent).toContain("3–20");
  expect(
    screen
      .getByLabelText("Tên đăng nhập (Username)")
      .getAttribute("aria-invalid"),
  ).toBe("true");
  expect(request).not.toHaveBeenCalled();
});

it("uses the shared shell, a three-step indicator and a link back to login", () => {
  const { container } = render(
    createElement(RegistrationPage, { onRegistered: vi.fn() }),
  );
  expect(
    screen.getByRole("heading", { level: 1, name: "Đăng Ký Tài Khoản" }),
  ).toBeTruthy();
  expect(container.querySelector(".auth-shell .wing-brand")).toBeTruthy();
  const steps = screen.getByRole("list", { name: "Các bước đăng ký" });
  expect(steps.querySelectorAll("li").length).toBe(3);
  expect(
    screen.getByRole("link", { name: "Đăng nhập ngay →" }).getAttribute("href"),
  ).toBe("/login");
});
