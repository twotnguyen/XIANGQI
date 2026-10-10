import { useEffect, useRef, useState, type FormEvent } from "react";
import { NavigationLink } from "../routing/NavigationLink.js";
import { containsForbiddenName } from "@xiangqi/shared";
import "./RegistrationPage.css";

export interface RegistrationSession {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  appSession?: string;
  expiresAt?: string;
  userId?: string;
  username?: string;
}
interface Deadline {
  expiresAt: string;
  resendAt: string;
}
interface ApiError {
  code?: string;
  step?: number;
  status: number;
}
const messages: Record<string, string> = {
  USERNAME_TAKEN: "Username đã có người dùng. Vui lòng chọn Username khác.",
  USERNAME_FORBIDDEN: "Username chứa từ không được phép sử dụng.",
  EMAIL_TAKEN: "Email này đã được đăng ký",
  OTP_INVALID: "Mã OTP không đúng. Vui lòng kiểm tra lại mã trong Email.",
  OTP_EXPIRED: "Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.",
  OTP_RATE_LIMIT: "Bạn đã thử quá nhiều lần. Vui lòng chờ và gửi lại mã mới.",
  OTP_SEND_FAILED: "Không gửi được mã, vui lòng thử lại sau",
  RESEND_WAIT: "Vui lòng chờ hết thời gian trước khi gửi lại mã.",
  REGISTRATION_INVALID:
    "Phiên đăng ký đã hết hiệu lực. Vui lòng nhập lại thông tin.",
  REGISTRATION_EXPIRED:
    "Phiên đăng ký đã hết hiệu lực. Vui lòng nhập lại thông tin.",
  REGISTRATION_CHANGED: "Thông tin đăng ký đã thay đổi. Vui lòng thử lại.",
  REGISTRATION_RECOVERING: "Đăng ký đang được xử lý. Vui lòng thử lại sau.",
  RECOVERY_PASSWORD_INVALID: "Vui lòng đăng nhập lại để hoàn tất tài khoản.",
  RECOVERY_RATE_LIMIT: "Bạn đã thử quá nhiều lần, vui lòng thử lại sau 15 phút",
};
async function post<T>(
  path: string,
  body: object,
  signal?: AbortSignal,
): Promise<T> {
  const base = (
    import.meta.env.VITE_API_URL || "http://localhost:3000"
  ).replace(/\/$/, "");
  const response = await fetch(`${base}/auth/register/${path}`, {
    method: "POST",
    credentials: "include",
    redirect: "error",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });
  const result = await response.json();
  if (!response.ok) throw { ...result, status: response.status } as ApiError;
  return result as T;
}
const secondsUntil = (date: string, now: number) =>
  Math.max(0, Math.ceil((Date.parse(date) - now) / 1000));

export function RegistrationPage({
  onRegistered,
}: {
  onRegistered: (session: RegistrationSession) => void | Promise<void>;
}) {
  const [step, setStep] = useState(1);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [registrationToken, setToken] = useState("");
  const [deadline, setDeadline] = useState<Deadline | null>(null);
  const [now, setNow] = useState(Date.now());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [availability, setAvailability] = useState("");
  const [rateLimited, setRateLimited] = useState(false);
  const [recovery, setRecovery] = useState<"confirmed" | "uncertain" | null>(
    null,
  );
  const recovering = recovery !== null;
  const [complete, setComplete] = useState(false);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const focusAfterResend = useRef(false);
  const heading = useRef<HTMLHeadingElement>(null);
  const submitButton = useRef<HTMLButtonElement>(null);
  const forbidden = username.length > 0 && containsForbiddenName(username);
  const usernameInvalid =
    username.length > 0 && !/^[a-zA-Z0-9_]{3,20}$/.test(username);
  const credentialError = forbidden
    ? messages.USERNAME_FORBIDDEN
    : !/^[a-zA-Z0-9_]{3,20}$/.test(username)
      ? "Username gồm 3–20 chữ cái, số hoặc dấu gạch dưới."
      : password.length < 8
        ? "Mật khẩu cần ít nhất 8 ký tự."
        : password !== passwordConfirmation
          ? "Xác nhận mật khẩu chưa khớp."
          : "";
  const credentials = { username, password, passwordConfirmation };
  const resendSeconds = deadline ? secondsUntil(deadline.resendAt, now) : 0;
  const expirySeconds = deadline ? secondsUntil(deadline.expiresAt, now) : 0;

  useEffect(() => {
    if (recovering && !busy) submitButton.current?.focus();
  }, [recovering, busy]);
  useEffect(() => {
    if (step === 3) inputs.current[0]?.focus();
    else heading.current?.focus();
  }, [step]);
  useEffect(() => {
    if (!busy && focusAfterResend.current) {
      focusAfterResend.current = false;
      inputs.current[0]?.focus();
    }
  }, [busy]);
  useEffect(() => {
    if (!deadline || complete) return;
    setNow(Date.now());
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [deadline, complete]);
  useEffect(() => {
    setAvailability("");
    if (step !== 1 || credentialError || busy) return;
    const controller = new AbortController();
    const timer = setTimeout(() => {
      setAvailability("Đang kiểm tra Username…");
      void post(
        "check",
        { username, password, passwordConfirmation },
        controller.signal,
      )
        .then(() => {
          if (!controller.signal.aborted)
            setAvailability("Username có thể sử dụng.");
        })
        .catch((reason: ApiError) => {
          if (!controller.signal.aborted)
            setAvailability(
              reason.code === "USERNAME_TAKEN"
                ? messages.USERNAME_TAKEN!
                : "Chưa kiểm tra được Username. Bạn có thể thử Tiếp tục.",
            );
        });
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [username, password, passwordConfirmation, credentialError, step, busy]);

  function handleError(reason: unknown) {
    const failure = reason as ApiError;
    setError(
      messages[failure.code ?? ""] ??
        (failure.status === 429
          ? "Có quá nhiều yêu cầu. Vui lòng thử lại sau."
          : "Dịch vụ đăng ký chưa thể xử lý yêu cầu, vui lòng thử lại sau"),
    );
    if (failure.code === "OTP_RATE_LIMIT") {
      setRateLimited(true);
      if (recovering)
        setError(
          "Bạn đã thử quá nhiều lần. Vui lòng chờ rồi thử hoàn tất đăng ký lại.",
        );
    }
    if (failure.code === "REGISTRATION_RECOVERING") setRecovery("confirmed");
    else if (
      step === 3 &&
      (!failure.code ||
        ["AUTH_PROVIDER_ERROR", "REGISTRATION_UNAVAILABLE"].includes(
          failure.code,
        ))
    )
      setRecovery("uncertain");
    else if (["OTP_INVALID", "OTP_EXPIRED"].includes(failure.code ?? ""))
      setRecovery(null);
    if (failure.step === 1 || failure.step === 2) {
      setRecovery(null);
      setStep(failure.step);
      setOtp(Array(6).fill(""));
      setAttempted(false);
      if (
        failure.code === "REGISTRATION_INVALID" ||
        failure.code === "REGISTRATION_EXPIRED"
      ) {
        setToken("");
        setDeadline(null);
      }
    }
  }
  async function submit(event: FormEvent) {
    event.preventDefault();
    setAttempted(true);
    setError("");
    if (busy || complete || (step === 1 && credentialError)) return;
    if (step === 2 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("Vui lòng nhập Email hợp lệ.");
      return;
    }
    if (
      step === 3 &&
      !recovering &&
      (otp.join("").length !== 6 || expirySeconds === 0 || rateLimited)
    ) {
      setError(
        rateLimited
          ? messages.OTP_RATE_LIMIT!
          : expirySeconds === 0
            ? messages.OTP_EXPIRED!
            : "Vui lòng nhập đủ 6 chữ số OTP.",
      );
      return;
    }
    setBusy(true);
    try {
      if (step === 1) {
        await post("check", credentials);
        setStep(2);
        setAttempted(false);
      } else if (step === 2) {
        const result = await post<Deadline & { registrationToken: string }>(
          "email",
          {
            ...credentials,
            email: email.trim().toLowerCase(),
            ...(registrationToken ? { registrationToken } : {}),
          },
        );
        setEmail(email.trim().toLowerCase());
        setToken(result.registrationToken);
        setDeadline(result);
        setNow(Date.now());
        setRateLimited(false);
        setRecovery(null);
        setStep(3);
        setAttempted(false);
      } else {
        const session = await post<RegistrationSession>("verify", {
          registrationToken,
          otp: otp.join(""),
          password,
        });
        setComplete(true);
        setPassword("");
        setPasswordConfirmation("");
        setToken("");
        setOtp(Array(6).fill(""));
        try {
          await onRegistered(session);
        } catch {
          setError("Tài khoản đã được tạo. Vui lòng đăng nhập để vào Sảnh.");
        }
      }
    } catch (reason) {
      handleError(reason);
    } finally {
      setBusy(false);
    }
  }
  async function resend() {
    if (busy || resendSeconds > 0) return;
    setBusy(true);
    setError("");
    try {
      setDeadline(await post<Deadline>("resend", { registrationToken }));
      setNow(Date.now());
      setOtp(Array(6).fill(""));
      setRateLimited(false);
      focusAfterResend.current = true;
    } catch (reason) {
      handleError(reason);
    } finally {
      setBusy(false);
    }
  }
  function updateOtp(index: number, value: string) {
    const digits = value.replace(/\D/g, "");
    if (!digits) {
      setOtp((previous) =>
        previous.map((digit, i) => (i === index ? "" : digit)),
      );
      return;
    }
    setOtp((previous) =>
      previous.map((digit, i) =>
        i >= index && i < index + digits.length ? digits[i - index]! : digit,
      ),
    );
    inputs.current[Math.min(5, index + digits.length)]?.focus();
  }
  const shownError =
    error ||
    ((attempted || forbidden || usernameInvalid) && step === 1
      ? credentialError
      : "");
  return (
    <main className="registration-page">
      <div className="registration-shell">
        <NavigationLink
          className="registration-brand"
          href="/"
          aria-label="Cờ Tướng Online — Trang chủ"
        >
          <span aria-hidden="true">帥</span>
          <strong>
            Cờ Tướng <em>Online</em>
          </strong>
        </NavigationLink>
        <section
          className="registration-card"
          aria-labelledby="registration-title"
        >
          <p className="registration-eyebrow">MỘT TÀI KHOẢN · VẠN THẾ CỜ</p>
          <h1 id="registration-title" ref={heading} tabIndex={-1}>
            {complete ? "Sẵn sàng vào Sảnh" : "Tạo tài khoản"}
          </h1>
          <p className="registration-intro">
            Lưu lại hành trình kỳ thủ của bạn.
          </p>
          <ol className="registration-steps" aria-label="Các bước đăng ký">
            {["Tài khoản", "Email", "Xác thực OTP"].map((label, index) => (
              <li
                key={label}
                aria-current={step === index + 1 ? "step" : undefined}
                data-completed={step > index + 1}
              >
                <span aria-hidden="true">
                  {step > index + 1 ? "✓" : index + 1}
                </span>
                {label}
              </li>
            ))}
          </ol>
          {complete ? (
            <div className="registration-success" role="status">
              <strong>Tài khoản đã được tạo.</strong>
              <p>Đang đưa bạn vào Sảnh…</p>
            </div>
          ) : (
            <form
              onSubmit={(event) => void submit(event)}
              noValidate
              aria-busy={busy}
            >
              {step === 1 && (
                <>
                  <label htmlFor="registration-username">Username</label>
                  <input
                    id="registration-username"
                    value={username}
                    onChange={(event) => {
                      setUsername(event.target.value);
                      setError("");
                    }}
                    autoComplete="username"
                    maxLength={20}
                    aria-describedby="username-help username-availability registration-error"
                    aria-invalid={Boolean(
                      forbidden || usernameInvalid || (attempted && !username),
                    )}
                    disabled={busy}
                  />
                  <p id="username-help" className="registration-help">
                    3–20 chữ cái, số hoặc dấu gạch dưới. Không dùng từ bị cấm.
                  </p>
                  <p
                    id="username-availability"
                    className="registration-availability"
                    role="status"
                  >
                    {availability}
                  </p>
                  <label htmlFor="registration-password">Mật khẩu</label>
                  <input
                    id="registration-password"
                    type="password"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setError("");
                    }}
                    autoComplete="new-password"
                    aria-describedby="password-help registration-error"
                    aria-invalid={attempted && password.length < 8}
                    disabled={busy}
                  />
                  <p id="password-help" className="registration-help">
                    Ít nhất 8 ký tự.
                  </p>
                  <label htmlFor="registration-confirmation">
                    Xác nhận mật khẩu
                  </label>
                  <input
                    id="registration-confirmation"
                    type="password"
                    value={passwordConfirmation}
                    onChange={(event) => {
                      setPasswordConfirmation(event.target.value);
                      setError("");
                    }}
                    autoComplete="new-password"
                    aria-describedby="registration-error"
                    aria-invalid={
                      attempted && password !== passwordConfirmation
                    }
                    disabled={busy}
                  />
                </>
              )}
              {step === 2 && (
                <>
                  <h2>Email chính chủ của bạn</h2>
                  <p className="registration-copy">
                    Mã xác thực sẽ được gửi đến Email này. Hãy dùng địa chỉ bạn
                    có thể truy cập.
                  </p>
                  <label htmlFor="registration-email">Email chính chủ</label>
                  <input
                    id="registration-email"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setError("");
                    }}
                    autoComplete="email"
                    aria-describedby="registration-error"
                    aria-invalid={Boolean(error)}
                    maxLength={254}
                    disabled={busy}
                  />
                  <p className="registration-help">
                    Email đã đăng ký sẽ không nhận thêm mã OTP.
                  </p>
                </>
              )}
              {step === 3 && !recovering && (
                <>
                  <h2>Kiểm tra hộp thư của bạn</h2>
                  <p className="registration-copy">
                    Nhập mã 6 chữ số đã gửi đến <strong>{email}</strong>.
                  </p>
                  <fieldset className="registration-otp">
                    <legend>Mã xác thực OTP</legend>
                    <div>
                      {otp.map((digit, index) => (
                        <input
                          key={index}
                          ref={(input) => {
                            inputs.current[index] = input;
                          }}
                          aria-label={`Chữ số OTP ${index + 1}`}
                          aria-invalid={Boolean(shownError)}
                          aria-describedby="registration-error"
                          inputMode="numeric"
                          autoComplete={index === 0 ? "one-time-code" : "off"}
                          value={digit}
                          disabled={busy}
                          onChange={(event) =>
                            updateOtp(index, event.target.value)
                          }
                          onPaste={(event) => {
                            event.preventDefault();
                            updateOtp(
                              index,
                              event.clipboardData.getData("text"),
                            );
                          }}
                          onKeyDown={(event) => {
                            if (
                              event.key === "Backspace" &&
                              !digit &&
                              index > 0
                            )
                              inputs.current[index - 1]?.focus();
                          }}
                          autoFocus={index === 0}
                        />
                      ))}
                    </div>
                  </fieldset>
                  <p className="registration-expiry">
                    {expirySeconds > 0
                      ? `Mã có hiệu lực trong ${Math.floor(expirySeconds / 60)}:${String(expirySeconds % 60).padStart(2, "0")}`
                      : "Mã đã hết hạn. Hãy gửi lại mã mới."}
                  </p>
                  <button
                    className="registration-resend"
                    type="button"
                    onClick={() => void resend()}
                    disabled={busy || resendSeconds > 0}
                  >
                    {resendSeconds > 0
                      ? `Gửi lại mã sau ${resendSeconds}s`
                      : "Gửi lại mã"}
                  </button>
                </>
              )}
              {step === 3 && recovering && (
                <p className="registration-help">
                  {recovery === "confirmed"
                    ? "Email đã được xác minh. Nhấn Hoàn tất đăng ký để thử phục hồi tài khoản; không cần gửi mã mới."
                    : "Chưa xác định được kết quả xác minh. Nhấn Kiểm tra đăng ký để thử lại an toàn."}
                </p>
              )}
              <div
                id="registration-error"
                className="registration-error"
                role="alert"
              >
                {shownError}
              </div>
              <button
                ref={submitButton}
                className="registration-primary"
                type="submit"
                disabled={
                  busy ||
                  (step === 2 &&
                    Boolean(registrationToken) &&
                    resendSeconds > 0) ||
                  (step === 3 &&
                    !recovering &&
                    (rateLimited || expirySeconds === 0))
                }
              >
                {busy
                  ? "Đang xử lý…"
                  : step === 1
                    ? "Tiếp tục"
                    : step === 2
                      ? "Xác nhận Email"
                      : recovering
                        ? recovery === "confirmed"
                          ? "Hoàn tất đăng ký"
                          : "Kiểm tra đăng ký"
                        : "Xác thực và vào Sảnh"}
              </button>
              {step === 2 && registrationToken && resendSeconds > 0 && (
                <p className="registration-help">
                  Có thể gửi mã mới sau {resendSeconds}s.
                </p>
              )}
              {step > 1 && !recovering && (
                <button
                  className="registration-back"
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setStep(step - 1);
                    setError("");
                    setAttempted(false);
                  }}
                >
                  ← Quay lại {step === 2 ? "Tài khoản" : "Email"}
                </button>
              )}
            </form>
          )}
          {complete && error && (
            <p className="registration-error" role="alert">
              {error}
            </p>
          )}
        </section>
        <p className="registration-footer">
          Một nước đi tốt bắt đầu từ sự bình tĩnh.
        </p>
      </div>
    </main>
  );
}
