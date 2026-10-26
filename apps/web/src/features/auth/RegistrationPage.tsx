import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { NavigationLink } from "../../shared/navigation/NavigationLink.js";
import { containsForbiddenName } from "@xiangqi/shared";
import { AuthShell, type AuthFeature } from "./AuthShell.js";

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
import { getApiBaseUrl } from "../../shared/api.js";

async function post<T>(
  path: string,
  body: object,
  signal?: AbortSignal,
): Promise<T> {
  const base = getApiBaseUrl();
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
const features: readonly AuthFeature[] = [
  { icon: "🛡️", title: "Bảo Toàn Hồ Sơ", text: "Email cố định, bảo mật OTP" },
  {
    icon: "👥",
    title: "Chơi Cùng Bạn Bè",
    text: "Tạo phòng, mời bằng mã hoặc link",
  },
  { icon: "📜", title: "Lưu Trữ Kỳ Phổ", text: "Tự động lưu lịch sử ván cờ" },
  { icon: "✨", title: "Hồ Sơ Riêng", text: "Tên hiển thị gán theo Username" },
];
const clock = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
const secondsUntil = (date: string, now: number) =>
  Math.max(0, Math.ceil((Date.parse(date) - now) / 1000));

/**
 * Màn hình đăng ký tài khoản thành viên đa bước (nhập thông tin tài khoản, xác thực OTP qua Email và hoàn tất).
 */
export function RegistrationPage({
  onRegistered,
  renderGoogle,
}: {
  onRegistered: (session: RegistrationSession) => void | Promise<void>;
  renderGoogle?: (
    disabled: boolean,
    onBusyChange: (busy: boolean) => void,
  ) => ReactNode;
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
  const [emailBusy, setBusy] = useState(false),
    [googleBusy, setGoogleBusy] = useState(false);
  const googleSending = useRef(false),
    busy = emailBusy || googleBusy;
  const [error, setError] = useState("");
  const [attempted, setAttempted] = useState(false);
  const [availability, setAvailability] = useState("");
  const [rateLimited, setRateLimited] = useState(false);
  const [recovery, setRecovery] = useState<"confirmed" | "uncertain" | null>(
    null,
  );
  const recovering = recovery !== null;
  const [complete, setComplete] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
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
    if (
      busy ||
      googleSending.current ||
      complete ||
      (step === 1 && credentialError)
    )
      return;
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
  const availabilityTone =
    availability === "Username có thể sử dụng."
      ? " valid"
      : availability &&
          availability !== "Đang kiểm tra Username…" &&
          availability.startsWith("Username đã")
        ? " error"
        : "";
  return (
    <AuthShell
      slogan="“Đăng kỳ lập chí, bách chiến xưng vương”"
      features={features}
      spread
    >
      <div>
        <div className="form-head-row">
          <h1
            className="form-title"
            id="registration-title"
            ref={heading}
            tabIndex={-1}
          >
            {complete ? "Sẵn sàng vào Sảnh" : "Đăng Ký Tài Khoản"}
            <span className="seal-icon" aria-hidden="true">
              印
            </span>
          </h1>
        </div>
        <ol className="stepper-wrap" aria-label="Các bước đăng ký">
          {["Tài khoản", "Email", "Xác thực OTP"].map((label, index) => (
            <li
              className="step-item"
              key={label}
              aria-current={step === index + 1 ? "step" : undefined}
              data-completed={step > index + 1}
            >
              <span className="step-num" aria-hidden="true">
                {step > index + 1 ? "✓" : index + 1}
              </span>
              <span className="step-text">{label}</span>
            </li>
          ))}
        </ol>
        {complete ? (
          <div className="form-success" role="status">
            <strong>Tài khoản đã được tạo.</strong>
            <p>Đang đưa bạn vào Sảnh…</p>
          </div>
        ) : (
          <form
            className="wizard-step"
            key={step}
            onSubmit={(event) => void submit(event)}
            noValidate
            aria-busy={busy}
          >
            {step === 1 && (
              <>
                <div className="field-row">
                  <label className="field-lbl" htmlFor="registration-username">
                    Tên đăng nhập (Username)
                  </label>
                  <div className="input-box">
                    <span className="input-ico" aria-hidden="true">
                      👤
                    </span>
                    <input
                      className="input-elem"
                      id="registration-username"
                      value={username}
                      onChange={(event) => {
                        setUsername(event.target.value);
                        setError("");
                      }}
                      autoComplete="username"
                      autoCapitalize="none"
                      spellCheck={false}
                      placeholder="3–20 ký tự (chữ, số, gạch dưới)"
                      maxLength={20}
                      aria-describedby="username-help username-availability registration-error"
                      aria-invalid={Boolean(
                        forbidden ||
                        usernameInvalid ||
                        (attempted && !username),
                      )}
                      disabled={busy}
                    />
                  </div>
                  <p id="username-help" className="field-hint">
                    3–20 chữ cái, số hoặc dấu gạch dưới. Không dùng từ bị cấm.
                  </p>
                  <p
                    id="username-availability"
                    className={`field-hint${availabilityTone}`}
                    role="status"
                  >
                    {availability}
                  </p>
                </div>
                <div className="field-row">
                  <label className="field-lbl" htmlFor="registration-password">
                    Mật khẩu
                  </label>
                  <div className="input-box">
                    <span className="input-ico" aria-hidden="true">
                      🔒
                    </span>
                    <input
                      className="input-elem"
                      id="registration-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(event) => {
                        setPassword(event.target.value);
                        setError("");
                      }}
                      autoComplete="new-password"
                      placeholder="Tối thiểu 8 ký tự"
                      aria-describedby="password-help registration-error"
                      aria-invalid={attempted && password.length < 8}
                      disabled={busy}
                    />
                    <button
                      type="button"
                      className="btn-eye"
                      aria-label={
                        showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                      }
                      aria-pressed={showPassword}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span aria-hidden="true">
                        {showPassword ? "🙈" : "👁️"}
                      </span>
                    </button>
                  </div>
                  <p id="password-help" className="field-hint">
                    Ít nhất 8 ký tự.
                  </p>
                </div>
                <div className="field-row">
                  <label
                    className="field-lbl"
                    htmlFor="registration-confirmation"
                  >
                    Xác nhận mật khẩu
                  </label>
                  <div className="input-box">
                    <span className="input-ico" aria-hidden="true">
                      🔒
                    </span>
                    <input
                      className="input-elem"
                      id="registration-confirmation"
                      type={showConfirmation ? "text" : "password"}
                      value={passwordConfirmation}
                      onChange={(event) => {
                        setPasswordConfirmation(event.target.value);
                        setError("");
                      }}
                      autoComplete="new-password"
                      placeholder="Nhập lại mật khẩu"
                      aria-describedby="registration-error"
                      aria-invalid={
                        attempted && password !== passwordConfirmation
                      }
                      disabled={busy}
                    />
                    <button
                      type="button"
                      className="btn-eye"
                      aria-label={
                        showConfirmation
                          ? "Ẩn xác nhận mật khẩu"
                          : "Hiện xác nhận mật khẩu"
                      }
                      aria-pressed={showConfirmation}
                      onClick={() => setShowConfirmation(!showConfirmation)}
                    >
                      <span aria-hidden="true">
                        {showConfirmation ? "🙈" : "👁️"}
                      </span>
                    </button>
                  </div>
                </div>
              </>
            )}
            {step === 2 && (
              <>
                <h2 className="sr-only">Email chính chủ của bạn</h2>
                <div className="alert-callout">
                  <span aria-hidden="true">🛡️</span>
                  <span>
                    <strong>Bảo mật danh tính:</strong> Email sau khi xác thực
                    là cố định để bảo vệ toàn vẹn tài khoản và lịch sử thi đấu.
                  </span>
                </div>
                <div className="field-row">
                  <label className="field-lbl" htmlFor="registration-email">
                    Email chính chủ
                  </label>
                  <div className="input-box">
                    <span className="input-ico" aria-hidden="true">
                      ✉️
                    </span>
                    <input
                      className="input-elem"
                      id="registration-email"
                      type="email"
                      value={email}
                      onChange={(event) => {
                        setEmail(event.target.value);
                        setError("");
                      }}
                      autoComplete="email"
                      placeholder="kythu@gmail.com"
                      aria-describedby="registration-email-help registration-error"
                      aria-invalid={Boolean(error)}
                      maxLength={254}
                      disabled={busy}
                    />
                  </div>
                  <p id="registration-email-help" className="field-hint">
                    Mã xác thực 6 chữ số sẽ được gửi đến hộp thư này. Email đã
                    đăng ký sẽ không nhận thêm mã OTP.
                  </p>
                </div>
              </>
            )}
            {step === 3 && !recovering && (
              <>
                <h2 className="sr-only">Kiểm tra hộp thư của bạn</h2>
                <p className="otp-info-card">
                  <span aria-hidden="true">✉️</span> Mã xác thực 6 số đã được
                  gửi đến:
                  <br />
                  <strong>{email}</strong>
                </p>
                <fieldset className="otp-fieldset">
                  <legend>Nhập mã OTP 6 số:</legend>
                  <div className="otp-grid">
                    {otp.map((digit, index) => (
                      <input
                        className="otp-input"
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
                          updateOtp(index, event.clipboardData.getData("text"));
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "Backspace" && !digit && index > 0)
                            inputs.current[index - 1]?.focus();
                        }}
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                </fieldset>
                <div className="otp-timer-row">
                  <p>
                    {expirySeconds > 0 ? (
                      <>
                        Thời hạn mã:{" "}
                        <span className="otp-countdown">
                          {clock(expirySeconds)}
                        </span>
                      </>
                    ) : (
                      "Mã đã hết hạn. Hãy gửi lại mã mới."
                    )}
                  </p>
                  <button
                    className="btn-resend"
                    type="button"
                    onClick={() => void resend()}
                    disabled={busy || resendSeconds > 0}
                  >
                    {resendSeconds > 0
                      ? `Gửi lại mã (${resendSeconds}s)`
                      : "Gửi lại mã"}
                  </button>
                </div>
              </>
            )}
            {step === 3 && recovering && (
              <p className="form-note">
                {recovery === "confirmed"
                  ? "Email đã được xác minh. Nhấn Hoàn tất đăng ký để thử phục hồi tài khoản; không cần gửi mã mới."
                  : "Chưa xác định được kết quả xác minh. Nhấn Kiểm tra đăng ký để thử lại an toàn."}
              </p>
            )}
            <div id="registration-error" className="form-alert" role="alert">
              {shownError}
            </div>
            <button
              ref={submitButton}
              className={`btn-submit${step === 3 && !recovering ? " btn-caps" : ""}`}
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
              {busy ? (
                "Đang xử lý…"
              ) : step === 1 ? (
                <>
                  Tiếp tục: Nhập Email <span aria-hidden="true">❯</span>
                </>
              ) : step === 2 ? (
                <>
                  Gửi mã OTP qua Email <span aria-hidden="true">❯</span>
                </>
              ) : recovering ? (
                recovery === "confirmed" ? (
                  "Hoàn tất đăng ký"
                ) : (
                  "Kiểm tra đăng ký"
                )
              ) : (
                <>
                  <span aria-hidden="true">🏛️</span>
                  Xác thực và vào Sảnh
                  <span aria-hidden="true">❯</span>
                </>
              )}
            </button>
            {step === 2 && registrationToken && resendSeconds > 0 && (
              <p className="form-note">
                Có thể gửi mã mới sau {resendSeconds}s.
              </p>
            )}
            {step > 1 && !recovering && (
              <button
                className="btn-back"
                type="button"
                disabled={busy}
                onClick={() => {
                  setStep(step - 1);
                  setError("");
                  setAttempted(false);
                }}
              >
                <span aria-hidden="true">❮</span>{" "}
                {step === 2
                  ? "Quay lại chỉnh sửa thông tin tài khoản"
                  : "Đổi email nhận mã OTP"}
              </button>
            )}
          </form>
        )}
        {complete && error && (
          <p className="form-alert" role="alert">
            {error}
          </p>
        )}
        {step === 1 && !complete && renderGoogle && (
          <>
            <div className="divider">hoặc đăng ký nhanh</div>
            <div className="google-slot">
              {renderGoogle(emailBusy, (value) => {
                googleSending.current = value;
                setGoogleBusy(value);
              })}
            </div>
          </>
        )}
      </div>
      <div className="reg-foot">
        <span>Đã có tài khoản kỳ đài?</span>
        <NavigationLink href="/login">Đăng nhập ngay →</NavigationLink>
      </div>
    </AuthShell>
  );
}
