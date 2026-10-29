// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RegistrationPage } from "@web/features/auth/RegistrationPage.js";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

const session = {
  access_token: "skip-access",
  refresh_token: "skip-refresh",
  expires_in: 3600,
};

function reply(body: object, status = 200) {
  return new Response(JSON.stringify(body), { status });
}
function draft(expiresInMs: number) {
  return {
    registrationToken: "test-draft",
    expiresAt: new Date(Date.now() + expiresInMs).toISOString(),
    resendAt: new Date(Date.now() + 60000).toISOString(),
  };
}
async function enterAccount(user: ReturnType<typeof userEvent.setup>) {
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
}
async function enterEmail(user: ReturnType<typeof userEvent.setup>) {
  await user.type(
    await screen.findByLabelText("Email chính chủ"),
    "player@example.test",
  );
  await user.click(
    screen.getByRole("button", { name: "Gửi mã OTP qua Email" }),
  );
  await screen.findByLabelText("Chữ số OTP 1");
}

it("completes the account from step two without an email and removes the form", async () => {
  const request = vi.fn(async (url: string) =>
    reply(url.endsWith("/check") ? { step: 2 } : session),
  );
  vi.stubGlobal("fetch", request);
  const onRegistered = vi.fn();
  const user = userEvent.setup();
  render(createElement(RegistrationPage, { onRegistered }));
  await enterAccount(user);
  await user.click(
    await screen.findByRole("button", { name: "Bỏ qua email, vào Sảnh" }),
  );
  expect(await screen.findByText("Tài khoản đã được tạo.")).toBeTruthy();
  expect(screen.queryByLabelText("Email chính chủ")).toBeNull();
  expect(
    screen.queryByRole("button", { name: "Gửi mã OTP qua Email" }),
  ).toBeNull();
  expect(onRegistered).toHaveBeenCalledWith(session);
});

it("still completes from step three when the OTP has expired", async () => {
  const request = vi.fn(async (url: string) => {
    if (url.endsWith("/check")) return reply({ step: 2 });
    if (url.endsWith("/email")) return reply(draft(-1000));
    return reply(session);
  });
  vi.stubGlobal("fetch", request);
  const onRegistered = vi.fn();
  const user = userEvent.setup();
  render(createElement(RegistrationPage, { onRegistered }));
  await enterAccount(user);
  await enterEmail(user);
  await user.click(
    screen.getByRole("button", { name: "Bỏ qua email, vào Sảnh" }),
  );
  expect(await screen.findByText("Tài khoản đã được tạo.")).toBeTruthy();
  expect(screen.queryByLabelText("Chữ số OTP 1")).toBeNull();
  expect(onRegistered).toHaveBeenCalledWith(session);
});

it("returns to step one with the username error when skip hits USERNAME_TAKEN", async () => {
  const request = vi.fn(async (url: string) =>
    url.endsWith("/skip")
      ? reply({ code: "USERNAME_TAKEN", step: 1 }, 409)
      : reply({ step: 2 }),
  );
  vi.stubGlobal("fetch", request);
  const onRegistered = vi.fn();
  const user = userEvent.setup();
  render(createElement(RegistrationPage, { onRegistered }));
  await enterAccount(user);
  await user.click(
    await screen.findByRole("button", { name: "Bỏ qua email, vào Sảnh" }),
  );
  expect(
    await screen.findByText(
      "Username đã có người dùng. Vui lòng chọn Username khác.",
    ),
  ).toBeTruthy();
  expect(
    screen.getByRole("button", { name: "Tiếp tục: Nhập Email" }),
  ).toBeTruthy();
  expect(screen.queryByText("Tài khoản đã được tạo.")).toBeNull();
  expect(onRegistered).not.toHaveBeenCalled();
});
