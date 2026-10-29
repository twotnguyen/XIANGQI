// @vitest-environment jsdom
import { createElement } from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, expect, it, vi, type Mock } from "vitest";
import type { EmailStatusState } from "@web/shared/account-email.js";
import { EmailStatusBanner } from "@web/features/profile/EmailStatusBanner.js";
import { EmailVerification } from "@web/features/profile/EmailVerification.js";
import {
  ProfileRequestError,
  type ProfileClient,
} from "@web/features/profile/profile-client.js";

afterEach(() => {
  cleanup();
});

const pending: EmailStatusState = {
  status: "ready",
  email: "kythu@example.invalid",
  emailVerified: false,
  pendingEmail: "new@example.invalid",
  expiresAt: new Date(Date.now() + 180000).toISOString(),
  resendAt: new Date(Date.now() + 60000).toISOString(),
};

interface FakeProfileClient {
  read: Mock;
  updateDisplayName: Mock;
  sendEmail: Mock;
  resendEmail: Mock;
  verifyEmail: Mock;
}

function client(): FakeProfileClient {
  return {
    read: vi.fn(),
    updateDisplayName: vi.fn(),
    sendEmail: vi.fn().mockResolvedValue(undefined),
    resendEmail: vi.fn().mockResolvedValue(undefined),
    verifyEmail: vi.fn().mockResolvedValue(undefined),
  };
}

function asProfileClient(api: FakeProfileClient) {
  return api as unknown as ProfileClient;
}

function submitOtp() {
  fireEvent.submit(
    screen.getByRole("form", { name: "Xác minh email bằng mã OTP" }),
  );
}

it("shows a banner for a pending email and links to settings", () => {
  render(
    createElement(EmailStatusBanner, {
      status: pending,
      reloadEmailStatus: vi.fn(),
    }),
  );
  expect(screen.getByText(/chưa được xác minh/)).toBeTruthy();
  expect(screen.getByRole("link").getAttribute("href")).toBe("/settings");
});

it("shows a banner when the account has no email", () => {
  render(
    createElement(EmailStatusBanner, {
      status: {
        status: "ready",
        email: null,
        emailVerified: false,
        pendingEmail: null,
        expiresAt: null,
        resendAt: null,
      },
      reloadEmailStatus: vi.fn(),
    }),
  );
  expect(screen.getByText(/Tài khoản chưa có email/)).toBeTruthy();
});

it("renders nothing for a verified email", () => {
  const view = render(
    createElement(EmailStatusBanner, {
      status: {
        status: "ready",
        email: "kythu@example.invalid",
        emailVerified: true,
        pendingEmail: null,
        expiresAt: null,
        resendAt: null,
      },
      reloadEmailStatus: vi.fn(),
    }),
  );
  expect(view.container.textContent).toBe("");
});

it("shows a banner error with retry that reloads the status", () => {
  const reload = vi.fn().mockResolvedValue(undefined);
  render(
    createElement(EmailStatusBanner, {
      status: { status: "error" },
      reloadEmailStatus: reload,
    }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Thử lại" }));
  expect(reload).toHaveBeenCalledTimes(1);
});

it("submits the OTP, calls verifyEmail and reloads the status on success", async () => {
  const reload = vi.fn().mockResolvedValue(undefined);
  const api = client();
  render(
    createElement(EmailVerification, {
      client: asProfileClient(api),
      emailStatus: pending,
      reloadEmailStatus: reload,
    }),
  );
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Mã OTP 6 chữ số"), "123456");
  submitOtp();
  await vi.waitFor(() => expect(reload).toHaveBeenCalledTimes(1));
  expect(api.verifyEmail).toHaveBeenCalledWith("123456");
});

it("maps EMAIL_OTP_INVALID to the wrong-code message and does not reload", async () => {
  const reload = vi.fn().mockResolvedValue(undefined);
  const api = client();
  api.verifyEmail.mockRejectedValueOnce(
    new ProfileRequestError("EMAIL_OTP_INVALID", 400),
  );
  render(
    createElement(EmailVerification, {
      client: asProfileClient(api),
      emailStatus: pending,
      reloadEmailStatus: reload,
    }),
  );
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Mã OTP 6 chữ số"), "000000");
  submitOtp();
  expect(await screen.findByText("Mã OTP không đúng.")).toBeTruthy();
  expect(reload).not.toHaveBeenCalled();
});

it("maps EMAIL_OTP_EXPIRED to the expired-code message", async () => {
  const api = client();
  api.verifyEmail.mockRejectedValueOnce(
    new ProfileRequestError("EMAIL_OTP_EXPIRED", 410),
  );
  render(
    createElement(EmailVerification, {
      client: asProfileClient(api),
      emailStatus: pending,
      reloadEmailStatus: vi.fn().mockResolvedValue(undefined),
    }),
  );
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Mã OTP 6 chữ số"), "123456");
  submitOtp();
  expect(
    await screen.findByText("Mã đã hết hạn. Hãy gửi mã mới."),
  ).toBeTruthy();
});

it("maps EMAIL_OTP_LOCKED to the too-many-attempts message", async () => {
  const api = client();
  api.verifyEmail.mockRejectedValueOnce(
    new ProfileRequestError("EMAIL_OTP_LOCKED", 429),
  );
  render(
    createElement(EmailVerification, {
      client: asProfileClient(api),
      emailStatus: pending,
      reloadEmailStatus: vi.fn().mockResolvedValue(undefined),
    }),
  );
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Mã OTP 6 chữ số"), "123456");
  submitOtp();
  expect(
    await screen.findByText("Nhập sai quá nhiều lần. Hãy gửi mã mới."),
  ).toBeTruthy();
});

it("maps EMAIL_RESEND_LIMITED to the wait message on resend", async () => {
  const api = client();
  api.resendEmail.mockRejectedValueOnce(
    new ProfileRequestError("EMAIL_RESEND_LIMITED", 429),
  );
  render(
    createElement(EmailVerification, {
      client: asProfileClient(api),
      emailStatus: pending,
      reloadEmailStatus: vi.fn().mockResolvedValue(undefined),
    }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Gửi lại mã" }));
  expect(
    await screen.findByText("Vui lòng đợi trước khi gửi lại mã."),
  ).toBeTruthy();
});

it("rejects an incomplete OTP before calling verifyEmail", async () => {
  const api = client();
  render(
    createElement(EmailVerification, {
      client: asProfileClient(api),
      emailStatus: pending,
      reloadEmailStatus: vi.fn().mockResolvedValue(undefined),
    }),
  );
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Mã OTP 6 chữ số"), "12");
  submitOtp();
  expect(
    await screen.findByText("Vui lòng nhập đủ 6 chữ số OTP."),
  ).toBeTruthy();
  expect(api.verifyEmail).not.toHaveBeenCalled();
});
