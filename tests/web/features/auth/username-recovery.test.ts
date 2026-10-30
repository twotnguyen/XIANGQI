// @vitest-environment jsdom
import { createElement } from "react";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, expect, it, vi, type Mock } from "vitest";

import { ForgotPasswordPage } from "@web/features/auth/ForgotPasswordPage.js";
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
