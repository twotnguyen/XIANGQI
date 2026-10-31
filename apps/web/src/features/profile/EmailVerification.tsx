import { useEffect, useRef, useState, type FormEvent } from "react";
import {
  Button,
  ErrorState,
  Notice,
  Skeleton,
  TextField,
} from "../../shared/ui/primitives.js";
import { ProfileRequestError, type ProfileClient } from "./profile-client.js";
import type { EmailStatusState } from "../../shared/account-email.js";

const emailErrors: Record<string, string> = {
  EMAIL_ALREADY_VERIFIED: "Email của tài khoản này đã được xác minh.",
  EMAIL_TAKEN: "Email này đã được dùng cho tài khoản khác.",
  EMAIL_SEND_FAILED: "Chưa gửi được mã. Vui lòng thử lại sau.",
  EMAIL_NOT_CONFIGURED: "Chưa cấu hình gửi email xác minh.",
  EMAIL_OTP_INVALID: "Mã OTP không đúng.",
  EMAIL_OTP_EXPIRED: "Mã đã hết hạn. Hãy gửi mã mới.",
  EMAIL_OTP_LOCKED: "Nhập sai quá nhiều lần. Hãy gửi mã mới.",
  EMAIL_RESEND_LIMITED: "Vui lòng đợi trước khi gửi lại mã.",
  EMAIL_OTP_LIMITED: "Bạn đã yêu cầu quá nhiều mã, vui lòng thử lại sau",
};

function emailError(error: unknown) {
  if (error instanceof ProfileRequestError)
    return emailErrors[error.code] ?? "Chưa thể thực hiện. Vui lòng thử lại.";
  return "Chưa thể thực hiện. Kiểm tra kết nối rồi thử lại.";
}

function secondsUntil(iso: string | null, now: number) {
  if (!iso) return 0;
  return Math.max(0, Math.ceil((Date.parse(iso) - now) / 1000));
}

function clock(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

/**
 * Mục email trong hồ sơ: thêm email, nhập mã OTP xác minh, gửi lại mã (60 giây) và đổi email khi chưa xác minh.
 */
export function EmailVerification({
  client,
  emailStatus,
  reloadEmailStatus,
}: {
  client: ProfileClient;
  emailStatus: EmailStatusState;
  reloadEmailStatus: () => Promise<void>;
}) {
  const [address, setAddress] = useState("");
  const [otp, setOtp] = useState("");
  const [changing, setChanging] = useState(false);
  const [busy, setBusy] = useState(false);
  const busyRef = useRef(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Chặn gửi lặp: mỗi thao tác chỉ chạy một lần tại một thời điểm.
  async function run(action: () => Promise<unknown>) {
    if (busyRef.current) return false;
    busyRef.current = true;
    setBusy(true);
    setError("");
    try {
      await action();
      await reloadEmailStatus();
      return true;
    } catch (reason) {
      setError(emailError(reason));
      return false;
    } finally {
      busyRef.current = false;
      setBusy(false);
    }
  }

  async function send(event: FormEvent) {
    event.preventDefault();
    const email = address.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Vui lòng nhập email hợp lệ.");
      return;
    }
    if (await run(() => client.sendEmail(email))) {
      setAddress("");
      setChanging(false);
      setOtp("");
    }
  }

  async function verify(event: FormEvent) {
    event.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      setError("Vui lòng nhập đủ 6 chữ số OTP.");
      return;
    }
    if (await run(() => client.verifyEmail(otp))) setOtp("");
  }

  async function resend() {
    if (await run(() => client.resendEmail())) setOtp("");
  }

  if (emailStatus.status === "idle" || emailStatus.status === "loading")
    return <Skeleton label="Đang tải trạng thái email…" />;
  if (emailStatus.status === "error")
    return (
      <ErrorState
        message="Chưa thể tải trạng thái email."
        onRetry={() => void reloadEmailStatus()}
      />
    );

  const { email, emailVerified, pendingEmail, expiresAt, resendAt } =
    emailStatus;
  const resendSeconds = secondsUntil(resendAt, now);
  const expirySeconds = secondsUntil(expiresAt, now);
  const alert = error && <Notice tone="error" message={error} />;

  if (emailVerified)
    return (
      <div className="xq-profile-email">
        <h3>Email đã xác minh</h3>
        <p>
          <strong>{email}</strong> đã được xác minh cho tài khoản này.
        </p>
      </div>
    );

  if (!pendingEmail || changing)
    return (
      <div className="xq-profile-email">
        <h3>{email ? "Xác minh email" : "Thêm email"}</h3>
        <p>
          {email
            ? `Email ${email} chưa được xác minh. Nhập email để nhận mã mới.`
            : "Thêm email để xác minh tài khoản. Email là tùy chọn."}
        </p>
        {alert}
        <form
          className="xq-profile-form"
          aria-label="Gửi mã xác minh email"
          onSubmit={(event) => void send(event)}
        >
          <TextField
            label="Email nhận mã"
            type="email"
            autoComplete="email"
            helper="Mã OTP gồm 6 chữ số, hiệu lực 3 phút."
            value={address}
            onChange={(event) => setAddress(event.target.value)}
          />
          <div className="xq-profile-form-footer">
            {pendingEmail && (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setChanging(false)}
              >
                Huỷ đổi email
              </Button>
            )}
            <Button type="submit" loading={busy}>
              Gửi mã xác minh
            </Button>
          </div>
        </form>
      </div>
    );

  return (
    <div className="xq-profile-email">
      <h3>Nhập mã xác minh</h3>
      <p>
        Mã đã gửi tới <strong>{pendingEmail}</strong>.{" "}
        {expirySeconds > 0
          ? `Mã còn hiệu lực ${clock(expirySeconds)}.`
          : "Mã đã hết hạn. Hãy gửi mã mới."}
      </p>
      {alert}
      <form
        className="xq-profile-form"
        aria-label="Xác minh email bằng mã OTP"
        onSubmit={(event) => void verify(event)}
      >
        <TextField
          label="Mã OTP 6 chữ số"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          value={otp}
          onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
        />
        <div className="xq-profile-form-footer">
          <Button
            type="button"
            variant="secondary"
            disabled={busy || resendSeconds > 0}
            onClick={() => void resend()}
          >
            {resendSeconds > 0
              ? `Gửi lại mã (${resendSeconds}s)`
              : "Gửi lại mã"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => setChanging(true)}
          >
            Đổi email
          </Button>
          <Button type="submit" loading={busy}>
            Xác minh email
          </Button>
        </div>
      </form>
    </div>
  );
}
