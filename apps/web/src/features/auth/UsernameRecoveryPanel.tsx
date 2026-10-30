import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button, TextField } from "../../shared/ui/primitives.js";
import { NavigationLink } from "../../shared/navigation/NavigationLink.js";
import { PasswordRequestError } from "./password-recovery.js";
import {
  resendUsernameRecovery,
  startUsernameRecovery,
  verifyUsernameRecovery,
} from "./username-recovery.js";

type Step = "email" | "otp" | "done";

function failureText(error: unknown) {
  if (error instanceof PasswordRequestError)
    switch (error.code) {
      case "USERNAME_INVALID_INPUT":
        return "Email hoặc mã yêu cầu không hợp lệ.";
      case "USERNAME_OTP_INVALID":
        return "Mã xác minh không đúng.";
      case "USERNAME_RATE_LIMITED":
        return "Vui lòng đợi trước khi gửi lại mã.";
      case "USERNAME_PROVIDER_ERROR":
        return "Không gửi được mã, vui lòng thử lại sau.";
      case "USERNAME_REQUEST_INVALID":
        return "Yêu cầu đã hết hạn. Hãy nhập email để bắt đầu lại.";
    }
  return "Chưa thể xử lý yêu cầu. Kiểm tra kết nối rồi thử lại.";
}

/**
 * Khôi phục tên đăng nhập qua OTP gửi tới email đã xác minh. Không tạo phiên đăng nhập, không đặt lại mật khẩu.
 */
export function UsernameRecoveryPanel() {
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [requestId, setRequestId] = useState("");
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const sending = useRef(false);
  const errorRegion = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (error) errorRegion.current?.focus();
  }, [error]);

  useEffect(() => {
    if (step !== "otp") return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [step]);

  async function run(action: () => Promise<void>) {
    if (sending.current) return;
    sending.current = true;
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (failure) {
      setError(failureText(failure));
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }

  function submitEmail(event: FormEvent) {
    event.preventDefault();
    void run(async () => {
      const sent = await startUsernameRecovery(email.trim());
      setRequestId(sent.requestId);
      setResendAt(Date.parse(sent.resendAt));
      setStep("otp");
    });
  }

  function submitOtp(event: FormEvent) {
    event.preventDefault();
    if (!/^[0-9]{6}$/.test(otp)) {
      setError("Mã xác minh gồm 6 chữ số.");
      return;
    }
    void run(async () => {
      setUsername(await verifyUsernameRecovery(requestId, otp));
      setRequestId("");
      setOtp("");
      setStep("done");
    });
  }

  function resend() {
    void run(async () => {
      const sent = await resendUsernameRecovery(requestId);
      setRequestId(sent.requestId);
      setResendAt(Date.parse(sent.resendAt));
      setOtp("");
    });
  }

  function restart() {
    setRequestId("");
    setOtp("");
    setError("");
    setStep("email");
  }

  if (step === "done")
    return (
      <section aria-labelledby="username-recovery-done">
        <h2 className="form-title" id="username-recovery-done">
          Tên đăng nhập của bạn
        </h2>
        <p className="form-subtitle" role="status">
          Tên đăng nhập: <strong>{username}</strong>
        </p>
        <p className="reg-foot">
          <NavigationLink href="/login">Về trang đăng nhập</NavigationLink>
        </p>
      </section>
    );

  const canResend = now >= resendAt;

  return (
    <section aria-labelledby="username-recovery-title">
      <h2 className="form-title" id="username-recovery-title">
        Quên tên đăng nhập
      </h2>
      {error && (
        <div
          ref={errorRegion}
          tabIndex={-1}
          role="alert"
          className="form-alert"
        >
          {error}
        </div>
      )}
      {step === "email" ? (
        <form
          onSubmit={submitEmail}
          noValidate
          aria-label="Quên tên đăng nhập"
          aria-busy={busy}
        >
          <p className="form-subtitle">
            Nhập email đã xác minh của tài khoản. Nếu email hợp lệ, mã OTP sẽ
            được gửi tới email đó.
          </p>
          <TextField
            label="Email đã xác minh"
            id="username-recovery-email"
            name="email"
            type="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            value={email}
            disabled={busy}
            onChange={(event) => setEmail(event.target.value)}
          />
          <Button type="submit" loading={busy} className="btn-submit">
            Gửi mã OTP
          </Button>
        </form>
      ) : (
        <form
          onSubmit={submitOtp}
          noValidate
          aria-label="Xác minh mã tên đăng nhập"
          aria-busy={busy}
        >
          <p className="form-subtitle">
            Nhập mã 6 chữ số đã gửi tới email đã xác minh.
          </p>
          <TextField
            label="Mã OTP"
            id="username-recovery-otp"
            name="otp"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={6}
            value={otp}
            disabled={busy}
            onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))}
          />
          <Button type="submit" loading={busy} className="btn-submit">
            Xác minh
          </Button>
          <Button
            type="button"
            variant="secondary"
            disabledReason={
              canResend ? undefined : "Đợi 60 giây trước khi gửi lại mã."
            }
            disabled={busy}
            onClick={resend}
          >
            Gửi lại mã
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={busy}
            onClick={restart}
          >
            Dùng email khác
          </Button>
        </form>
      )}
    </section>
  );
}
