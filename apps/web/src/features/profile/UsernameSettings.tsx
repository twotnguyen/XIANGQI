import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button, Dialog, TextField } from "../../shared/ui/primitives.js";
import { ProfileRequestError, type ProfileClient } from "./profile-client.js";

type Step = "start" | "otp" | "name";

function changeError(error: unknown) {
  if (error instanceof ProfileRequestError)
    switch (error.code) {
      case "USERNAME_INVALID":
      case "USERNAME_INVALID_INPUT":
        return "Tên đăng nhập gồm 3–20 ký tự chữ, số hoặc dấu gạch dưới.";
      case "USERNAME_FORBIDDEN":
        return "Tên đăng nhập này không được phép sử dụng.";
      case "USERNAME_UNCHANGED":
        return "Tên đăng nhập mới phải khác tên hiện tại.";
      case "USERNAME_TAKEN":
        return "Tên đăng nhập đã có người dùng. Hãy chọn tên khác.";
      case "USERNAME_EMAIL_REQUIRED":
        return "Cần email đã xác minh để đổi tên đăng nhập.";
      case "USERNAME_OTP_INVALID":
        return "Mã xác minh không đúng.";
      case "USERNAME_REQUEST_INVALID":
        return "Yêu cầu đã hết hạn. Hãy bắt đầu lại.";
      case "USERNAME_RATE_LIMITED":
        return "Vui lòng đợi trước khi gửi lại mã.";
      case "USERNAME_PROVIDER_ERROR":
        return "Không gửi được mã, vui lòng thử lại sau.";
    }
  return "Chưa thể đổi tên đăng nhập. Vui lòng thử lại.";
}

/**
 * Đổi tên đăng nhập của thành viên: gửi OTP tới email đã xác minh, xác minh xong mới nhập tên mới.
 * Trùng tên chỉ báo lỗi ở bước nhập tên (không gửi lại OTP). Phiên hiện tại được giữ nguyên.
 */
export function UsernameSettings({
  client,
  username,
  onChanged,
  onVerifyEmail,
}: {
  client: ProfileClient;
  username: string;
  onChanged: (username: string) => void;
  onVerifyEmail?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("start");
  const [nextName, setNextName] = useState("");
  const [otp, setOtp] = useState("");
  const [requestId, setRequestId] = useState("");
  const [changeToken, setChangeToken] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [resendAt, setResendAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [needsEmail, setNeedsEmail] = useState(false);
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

  function close() {
    setOpen(false);
    setStep("start");
    setNextName("");
    setOtp("");
    setRequestId("");
    setChangeToken("");
    setError("");
    setNeedsEmail(false);
  }

  async function run(action: () => Promise<void>) {
    if (sending.current) return;
    sending.current = true;
    setBusy(true);
    setError("");
    setNeedsEmail(false);
    try {
      await action();
    } catch (failure) {
      setError(changeError(failure));
      setNeedsEmail(
        failure instanceof ProfileRequestError &&
          failure.code === "USERNAME_EMAIL_REQUIRED",
      );
    } finally {
      sending.current = false;
      setBusy(false);
    }
  }

  function sendCode(event?: FormEvent) {
    event?.preventDefault();
    void run(async () => {
      const sent = await client.changeUsernameRequest();
      setRequestId(sent.requestId);
      setMaskedEmail(sent.maskedEmail ?? "");
      setResendAt(Date.parse(sent.resendAt));
      setOtp("");
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
      const capability = await client.changeUsernameVerify(requestId, otp);
      setChangeToken(capability.changeToken);
      setStep("name");
    });
  }

  function submitName(event: FormEvent) {
    event.preventDefault();
    const trimmed = nextName.trim();
    if (!/^[a-zA-Z0-9_]{3,20}$/.test(trimmed)) {
      setError("Tên đăng nhập gồm 3–20 ký tự chữ, số hoặc dấu gạch dưới.");
      return;
    }
    void run(async () => {
      const changed = await client.changeUsernameFinalize(changeToken, trimmed);
      onChanged(changed);
      setDone("Đã đổi tên đăng nhập.");
      close();
    });
  }

  function resend() {
    void run(async () => {
      const sent = await client.changeUsernameResend(requestId);
      setRequestId(sent.requestId);
      setResendAt(Date.parse(sent.resendAt));
      setOtp("");
    });
  }

  const canResend = now >= resendAt;

  return (
    <div className="xq-username-settings">
      <Button
        variant="secondary"
        onClick={() => {
          setDone("");
          setOpen(true);
        }}
      >
        Đổi tên đăng nhập
      </Button>
      {done && <p role="status">{done}</p>}
      <Dialog
        open={open}
        onClose={close}
        title="Đổi tên đăng nhập"
        cancelLabel="Đóng"
        dismissible={!busy}
      >
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
        {needsEmail && onVerifyEmail && (
          <Button
            variant="secondary"
            onClick={() => {
              close();
              onVerifyEmail();
            }}
          >
            Thêm hoặc xác minh email
          </Button>
        )}
        {step === "start" && (
          <form onSubmit={sendCode} noValidate aria-busy={busy}>
            <p>
              Mã xác minh 6 chữ số cho <strong>{username}</strong> sẽ gửi tới
              email đã xác minh. Các phiên đăng nhập hiện có vẫn giữ nguyên.
            </p>
            <Button type="submit" loading={busy}>
              Gửi mã xác minh
            </Button>
          </form>
        )}
        {step === "otp" && (
          <form
            onSubmit={submitOtp}
            noValidate
            aria-label="Xác minh đổi tên đăng nhập"
            aria-busy={busy}
          >
            <p>
              Nhập mã 6 chữ số đã gửi tới {maskedEmail || "email đã xác minh"}.
            </p>
            <TextField
              label="Mã xác minh"
              id="username-change-otp"
              name="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              disabled={busy}
              onChange={(event) =>
                setOtp(event.target.value.replace(/\D/g, ""))
              }
            />
            <Button type="submit" loading={busy}>
              Xác nhận mã
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              disabledReason={
                canResend ? undefined : "Đợi 60 giây trước khi gửi lại mã."
              }
              onClick={resend}
            >
              Gửi lại mã
            </Button>
          </form>
        )}
        {step === "name" && (
          <form
            onSubmit={submitName}
            noValidate
            aria-label="Nhập tên đăng nhập mới"
            aria-busy={busy}
          >
            <p>
              Mã đã xác minh. Nhập tên đăng nhập mới gồm 3–20 ký tự chữ, số hoặc
              dấu gạch dưới. Nếu tên bị trùng, bạn có thể nhập tên khác mà không
              cần mã mới.
            </p>
            <TextField
              label="Tên đăng nhập mới"
              id="username-change-name"
              name="username"
              autoComplete="off"
              autoCapitalize="none"
              spellCheck={false}
              value={nextName}
              disabled={busy}
              onChange={(event) => setNextName(event.target.value)}
            />
            <Button type="submit" loading={busy}>
              Đổi tên đăng nhập
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() => {
                setStep("start");
                setError("");
              }}
            >
              Bắt đầu lại
            </Button>
          </form>
        )}
      </Dialog>
    </div>
  );
}
