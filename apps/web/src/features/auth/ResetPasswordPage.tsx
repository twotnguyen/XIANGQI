import { useEffect, useRef, useState, type FormEvent } from "react";
import { NavigationLink } from "../../shared/navigation/NavigationLink.js";
import { Button, TextField } from "../../shared/ui/primitives.js";
import { AuthShell } from "./AuthShell.js";
import {
  PasswordRequestError,
  getPendingRecovery,
  resendRecovery,
  resetPassword,
  setPendingRecovery,
  verifyRecovery,
  type RecoveryWindow,
} from "./password-recovery.js";

const passwordRule = "Mật khẩu mới cần ít nhất 8 ký tự và khớp với xác nhận.";
const restart = "Yêu cầu khôi phục không còn hợp lệ. Vui lòng bắt đầu lại.";
const providerFailed = "Không gửi được mã, vui lòng thử lại sau.";

function secondsUntil(iso: string, now: number) {
  return Math.max(0, Math.ceil((Date.parse(iso) - now) / 1000));
}

function formatRemaining(seconds: number) {
  const minutes = Math.floor(seconds / 60);
  return `${minutes}:${String(seconds % 60).padStart(2, "0")}`;
}

/**
 * Bước 2 khôi phục mật khẩu: nhập OTP, sau đó đặt mật khẩu mới rồi quay về /login (không tự đăng nhập).
 */
export function ResetPasswordPage() {
  const [recovery, setRecovery] = useState<RecoveryWindow | null>(() =>
    getPendingRecovery(),
  );
  const [notice, setNotice] = useState("");
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [now, setNow] = useState(() => Date.now());
  const sending = useRef(false);
  const errorRegion = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (error) errorRegion.current?.focus();
  }, [error]);

  // Mất ngữ cảnh (tải lại trang, hết hạn yêu cầu): buộc bắt đầu lại từ /forgot-password.
  function abandon(message: string) {
    setPendingRecovery(null);
    setRecovery(null);
    setResetToken(null);
    setNotice(message);
  }

  async function run(
    work: () => Promise<void>,
    onError: (failure: unknown) => string | "restart",
  ) {
    if (sending.current) return;
    sending.current = true;
    setBusy(true);
    setError("");
    try {
      await work();
    } catch (failure) {
      const message = onError(failure);
      if (message === "restart") abandon(restart);
      else setError(message);
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }

  function isRestart(failure: unknown) {
    return (
      failure instanceof PasswordRequestError &&
      failure.code === "PASSWORD_RECOVERY_INVALID"
    );
  }

  function resendFailure(failure: unknown) {
    if (isRestart(failure)) return "restart";
    if (failure instanceof PasswordRequestError) {
      if (failure.code === "PASSWORD_RATE_LIMITED")
        return "Vui lòng đợi thêm trước khi gửi lại mã.";
      if (failure.code === "PASSWORD_PROVIDER_ERROR") return providerFailed;
    }
    return "Chưa thể gửi lại mã. Vui lòng thử lại.";
  }

  function verifyFailure(failure: unknown) {
    if (isRestart(failure)) return "restart";
    if (failure instanceof PasswordRequestError) {
      switch (failure.code) {
        case "PASSWORD_OTP_INVALID":
          return "Mã OTP không đúng. Kiểm tra lại mã trong email.";
        case "PASSWORD_OTP_EXPIRED":
          return "Mã OTP đã hết hạn. Vui lòng gửi lại mã.";
        case "PASSWORD_RATE_LIMITED":
          return "Bạn nhập sai quá nhiều lần. Vui lòng thử lại sau.";
        case "PASSWORD_PROVIDER_ERROR":
          return "Chưa thể xác minh mã lúc này. Vui lòng thử lại sau.";
      }
    }
    return "Chưa thể xác minh mã. Vui lòng thử lại.";
  }

  function submitOtp(event: FormEvent) {
    event.preventDefault();
    if (!recovery) return;
    if (!/^\d{6}$/.test(otp)) {
      setError("Mã OTP gồm 6 chữ số.");
      return;
    }
    void run(async () => {
      const result = await verifyRecovery(recovery.requestId, otp);
      setResetToken(result.resetToken);
      setOtp("");
    }, verifyFailure);
  }

  function resend() {
    if (!recovery) return;
    void run(async () => {
      const next = await resendRecovery(recovery.requestId);
      setPendingRecovery(next);
      setRecovery(next);
      setOtp("");
      setNotice("Đã gửi lại mã OTP.");
    }, resendFailure);
  }

  function submitPassword(event: FormEvent) {
    event.preventDefault();
    if (!recovery || !resetToken) return;
    if (newPassword.length < 8 || newPassword !== confirmation) {
      setError(passwordRule);
      return;
    }
    void run(
      async () => {
        await resetPassword({
          requestId: recovery.requestId,
          resetToken,
          newPassword,
          passwordConfirmation: confirmation,
        });
        setPendingRecovery(null);
        setNewPassword("");
        setConfirmation("");
        setResetToken(null);
        // Tải lại trang: máy chủ đã xóa cookie cũ, bỏ mọi token/timer còn trong bộ nhớ.
        window.location.replace("/login?passwordReset=1");
      },
      (failure) => {
        if (isRestart(failure)) return "restart";
        if (failure instanceof PasswordRequestError) {
          if (failure.code === "PASSWORD_INVALID_INPUT") return passwordRule;
          if (failure.code === "PASSWORD_OTP_EXPIRED") return "restart";
          if (failure.code === "PASSWORD_PROVIDER_ERROR") {
            abandon(
              "Chưa thể hoàn tất đổi mật khẩu. Vui lòng yêu cầu mã mới rồi thử lại.",
            );
            return "";
          }
        }
        return "Chưa thể đặt lại mật khẩu. Vui lòng thử lại.";
      },
    );
  }

  const remaining = recovery ? secondsUntil(recovery.expiresAt, now) : 0;
  const cooldown = recovery ? secondsUntil(recovery.resendAt, now) : 0;

  return (
    <AuthShell slogan="“Kỳ đạo tương phùng, tương đối kiến diện”" features={[]}>
      <h1 className="form-title" id="reset-title">
        Đặt lại mật khẩu
      </h1>
      {error && (
        <div
          ref={errorRegion}
          id="reset-error"
          tabIndex={-1}
          role="alert"
          className="form-alert"
        >
          {error}
        </div>
      )}
      {notice && !error && (
        <p className="form-success" role="status">
          {notice}
        </p>
      )}
      {!recovery ? (
        <>
          <p className="form-subtitle">
            Phiên khôi phục không còn hiệu lực. Vui lòng bắt đầu lại.
          </p>
          <p className="reg-foot">
            <NavigationLink href="/forgot-password">
              Quên mật khẩu
            </NavigationLink>
          </p>
        </>
      ) : !resetToken ? (
        <form
          onSubmit={submitOtp}
          noValidate
          aria-label="Nhập mã OTP"
          aria-busy={busy}
        >
          <p className="form-subtitle">
            {remaining > 0
              ? `Nhập mã 6 chữ số đã gửi tới Gmail. Mã còn hiệu lực trong ${formatRemaining(remaining)}.`
              : "Mã đã hết hạn. Vui lòng gửi lại mã."}
          </p>
          <TextField
            label="Mã OTP"
            helper="Gồm 6 chữ số."
            id="reset-otp"
            name="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            aria-describedby={error ? "reset-error" : undefined}
            maxLength={6}
            value={otp}
            disabled={busy}
            onChange={(event) => setOtp(event.target.value)}
          />
          <Button type="submit" loading={busy} className="btn-submit">
            Xác minh mã
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabled={busy || cooldown > 0}
            onClick={resend}
          >
            {cooldown > 0 ? `Gửi lại mã sau ${cooldown}s` : "Gửi lại mã"}
          </Button>
        </form>
      ) : (
        <form
          onSubmit={submitPassword}
          noValidate
          aria-label="Đặt mật khẩu mới"
          aria-busy={busy}
        >
          <TextField
            label="Mật khẩu mới"
            helper="Ít nhất 8 ký tự. Mật khẩu được giữ nguyên, không tự cắt khoảng trắng."
            id="reset-new-password"
            type="password"
            autoComplete="new-password"
            aria-describedby={error ? "reset-error" : undefined}
            value={newPassword}
            disabled={busy}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          <TextField
            label="Nhập lại mật khẩu mới"
            id="reset-confirm-password"
            type="password"
            autoComplete="new-password"
            aria-describedby={error ? "reset-error" : undefined}
            value={confirmation}
            disabled={busy}
            onChange={(event) => setConfirmation(event.target.value)}
          />
          <Button type="submit" loading={busy} className="btn-submit">
            Đặt lại mật khẩu
          </Button>
        </form>
      )}
      <p className="reg-foot">
        <NavigationLink href="/login">Quay lại đăng nhập</NavigationLink>
      </p>
    </AuthShell>
  );
}
