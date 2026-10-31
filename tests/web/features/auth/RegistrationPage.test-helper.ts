import { screen } from "@testing-library/react";
import type userEvent from "@testing-library/user-event";

export function reply(body: object, status = 200) {
  return new Response(JSON.stringify(body), { status });
}
export const draft = () => ({
  registrationToken: "test-draft",
  expiresAt: new Date(Date.now() + 180000).toISOString(),
  resendAt: new Date(Date.now() + 60000).toISOString(),
});
export async function enterAccount(user: ReturnType<typeof userEvent.setup>) {
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
export async function enterEmail(user: ReturnType<typeof userEvent.setup>) {
  await user.type(
    await screen.findByLabelText("Email chính chủ"),
    "player@example.test",
  );
  await user.click(
    screen.getByRole("button", { name: "Gửi mã OTP qua Email" }),
  );
  await screen.findByLabelText("Chữ số OTP 1");
}
