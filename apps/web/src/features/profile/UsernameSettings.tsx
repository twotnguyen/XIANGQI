import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button, Dialog, TextField } from "../../shared/ui/primitives.js";
import { ProfileRequestError, type ProfileClient } from "./profile-client.js";

type Step = "start" | "otp" | "name";

function remainingSeconds(deadline: number, now: number) {
  return Math.max(0, Math.ceil((deadline - now) / 1000));
}

function clock(seconds: number) {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

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
        return "Mã xác minh không đúng hoặc không còn hiệu lực. Hãy kiểm tra mã hoặc gửi mã mới.";
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
  const [expiresAt, setExpiresAt] = useState(0);
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState("");
  const [needsEmail, setNeedsEmail] = useState(false);
  const sending = useRef(false);
  const generation = useRef(0);
  const errorRegion = useRef<HTMLDivElement>(null);

  useEffect(
    () => () => {
      generation.current += 1;
    },
    [],
  );

  useEffect(() => {
    if (error) errorRegion.current?.focus();
  }, [error]);

  useEffect(() => {
    if (step !== "otp") return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [step]);

  function invalidate() {
    generation.current += 1;
    sending.current = false;
    setBusy(false);
  }

  function close() {
    invalidate();
    setOpen(false);
    setStep("start");
    setNextName("");
    setOtp("");
    setRequestId("");
    setChangeToken("");
    setExpiresAt(0);
    setResendAt(0);
    setMaskedEmail("");
    setError("");
    setNeedsEmail(false);
  }

  async function run(action: (current: () => boolean) => Promise<void>) {
    if (sending.current) return;
    sending.current = true;
    const started = generation.current;
    const current = () => generation.current === started;
    setBusy(true);
    setError("");
    setNeedsEmail(false);
    try {
      await action(current);
    } catch (failure) {
      if (!current()) return;
      setError(changeError(failure));
      setNeedsEmail(
        failure instanceof ProfileRequestError &&
          failure.code === "USERNAME_EMAIL_REQUIRED",
      );
    } finally {
      if (current()) {
        sending.current = false;
        setBusy(false);
      }
    }
  }

  function sendCode(event?: FormEvent) {
    event?.preventDefault();
    void run(async (current) => {
      const sent = await client.changeUsernameRequest();
      if (!current()) return;
      if (
        !Number.isFinite(Date.parse(sent.expiresAt)) ||
        !Number.isFinite(Date.parse(sent.resendAt))
      )
        throw new ProfileRequestError("PROFILE_BAD_RESPONSE", 502);
      setExpiresAt(Date.parse(sent.expiresAt));
      setNow(Date.now());
      setRequestId(sent.requestId);
      setMaskedEmail(sent.maskedEmail ?? "");
      setResendAt(Date.parse(sent.resendAt));
      setOtp("");
      setStep("otp");
    });
  }

  function submitOtp(event: FormEvent) {
    event.preventDefault();
    if (Date.now() >= expiresAt) {
      setError("Mã đã hết hạn. Vui lòng gửi lại mã.");
      return;
    }
    if (!/^[0-9]{6}$/.test(otp)) {
      setError("Mã xác minh gồm 6 chữ số.");
      return;
    }
    void run(async (current) => {
      const capability = await client.changeUsernameVerify(requestId, otp);
      if (!current()) return;
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
    void run(async (current) => {
      const changed = await client.changeUsernameFinalize(changeToken, trimmed);
      if (!current()) return;
      onChanged(changed);
      setDone("Đã đổi tên đăng nhập.");
      close();
    });
  }

  function resend() {
    if (Date.now() < resendAt) return;
    void run(async (current) => {
      const sent = await client.changeUsernameResend(requestId);
      if (!current()) return;
      if (
        !Number.isFinite(Date.parse(sent.expiresAt)) ||
        !Number.isFinite(Date.parse(sent.resendAt))
      )
        throw new ProfileRequestError("PROFILE_BAD_RESPONSE", 502);
      setExpiresAt(Date.parse(sent.expiresAt));
      setNow(Date.now());
      setRequestId(sent.requestId);
      setResendAt(Date.parse(sent.resendAt));
      setOtp("");
    });
  }

  const remaining = remainingSeconds(expiresAt, now);
  const cooldown = remainingSeconds(resendAt, now);

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
        dismissible={!(busy && step === "name")}
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
            <p id="username-change-expiry" className="xq-help">
              {remaining > 0
                ? `Mã còn hiệu lực ${clock(remaining)}.`
                : "Mã đã hết hạn. Vui lòng gửi lại mã."}
            </p>
            <TextField
              label="Mã xác minh"
              id="username-change-otp"
              aria-describedby="username-change-expiry"
              name="otp"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={otp}
              disabled={busy}
              onChange={(event) => {
                invalidate();
                setOtp(event.target.value.replace(/\D/g, ""));
                setError("");
              }}
            />
            <Button
              type="submit"
              loading={busy}
              disabledReason={
                remaining === 0
                  ? "Mã đã hết hạn. Vui lòng gửi lại mã."
                  : undefined
              }
            >
              Xác nhận mã
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              disabledReason={
                cooldown > 0 ? `Gửi lại mã sau ${cooldown}s.` : undefined
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
              onChange={(event) => {
                invalidate();
                setNextName(event.target.value);
                setError("");
              }}
            />
            <Button type="submit" loading={busy}>
              Đổi tên đăng nhập
            </Button>
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() => {
                close();
                setOpen(true);
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
