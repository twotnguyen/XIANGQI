import { Button, Notice } from "../../shared/ui/primitives.js";
import { NavigationLink } from "../../shared/navigation/NavigationLink.js";
import type { EmailStatusState } from "../../shared/account-email.js";

/**
 * Thông báo toàn cục không chặn ván cờ: nhắc thành viên chưa có email hoặc email chưa xác minh, và báo khi không kiểm tra được trạng thái.
 */
export function EmailStatusBanner({
  status,
  reloadEmailStatus,
}: {
  status: EmailStatusState;
  reloadEmailStatus: () => Promise<void>;
}) {
  if (status.status === "idle" || status.status === "loading") return null;
  if (status.status === "error")
    return (
      <Notice
        tone="error"
        message="Chưa thể kiểm tra trạng thái email của tài khoản. Vui lòng thử lại."
        action={
          <Button variant="secondary" onClick={() => void reloadEmailStatus()}>
            Thử lại
          </Button>
        }
      />
    );
  if (status.emailVerified) return null;
  const { pendingEmail, email } = status;
  return (
    <Notice
      message={
        pendingEmail
          ? `Email ${pendingEmail} chưa được xác minh. Nhập mã OTP để hoàn tất.`
          : email
            ? "Email của tài khoản chưa được xác minh."
            : "Tài khoản chưa có email. Thêm và xác minh email trong Cài đặt."
      }
      action={
        <NavigationLink href="/settings">
          {pendingEmail || email ? "Xác minh email" : "Thêm email"}
        </NavigationLink>
      }
    />
  );
}
