import { useEffect, useRef, useState, type FormEvent } from "react";
import { containsForbiddenName } from "@xiangqi/shared";
import { Button, Notice, TextField } from "../ui/primitives.js";
import { GoogleSignInButton } from "./GoogleSignInButton.js";
import {
  googleRequest,
  GoogleRequestError,
  parseGooglePending,
  type GooglePending,
} from "./google-gis.js";
import "./LoginPage.css";
export function GoogleOnboardingPage({
  pending,
  onResult,
}: {
  pending: GooglePending;
  onResult: (result: unknown) => void | Promise<void>;
}) {
  const [details, setDetails] = useState<GooglePending | null>(
      pending.email && pending.avatar ? pending : null,
    ),
    [attempt, setAttempt] = useState(0),
    [error, setError] = useState(""),
    [reauth, setReauth] = useState(false),
    [remember, setRemember] = useState(false),
    [reauthBusy, setReauthBusy] = useState(false),
    [now, setNow] = useState(Date.now());
  const [username, setUsername] = useState(""),
    [password, setPassword] = useState(""),
    [confirmation, setConfirmation] = useState(""),
    [busy, setBusy] = useState(false),
    [tried, setTried] = useState(false);
  const userField = useRef<HTMLInputElement>(null),
    focusName = useRef(false),
    heading = useRef<HTMLHeadingElement>(null),
    sending = useRef(false),
    work = useRef<AbortController | null>(null),
    mounted = useRef(false),
    callback = useRef(onResult);
  callback.current = onResult;
  useEffect(() => {
    if (!busy && focusName.current) {
      focusName.current = false;
      userField.current?.focus();
    }
  }, [busy, error]);
  useEffect(() => {
    mounted.current = true;
    heading.current?.focus();
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      mounted.current = false;
      clearInterval(timer);
      work.current?.abort();
    };
  }, []);
  useEffect(() => {
    if (pending.email && pending.avatar) {
      setDetails(pending);
      return;
    }
    const abort = new AbortController();
    setError("");
    queueMicrotask(
      () =>
        void (async () => {
          if (abort.signal.aborted) return;
          try {
            const value = parseGooglePending(
              await googleRequest("onboarding", undefined, abort.signal),
              true,
            );
            if (!abort.signal.aborted) {
              setDetails(value);
              setReauth(false);
            }
          } catch (e) {
            if (!abort.signal.aborted) {
              setError(
                e instanceof GoogleRequestError
                  ? e.message
                  : "Chưa thể tải thông tin Google. Vui lòng thử lại.",
              );
              if (e instanceof GoogleRequestError && e.status === 401)
                setReauth(true);
            }
          }
        })(),
    );
    return () => abort.abort();
  }, [
    pending.email,
    pending.avatar,
    pending.expiresAt,
    pending.recovering,
    attempt,
  ]);
  const forbidden = containsForbiddenName(username);
  const invalidUsername = forbidden
    ? "Username chứa từ không được phép sử dụng."
    : !/^[A-Za-z0-9_]{3,20}$/.test(username)
      ? "Username cần 3–20 chữ, số hoặc dấu gạch dưới."
      : "";
  const validation =
    invalidUsername ||
    (password.length < 8
      ? "Mật khẩu cần tối thiểu 8 ký tự."
      : confirmation !== password
        ? "Hai mật khẩu chưa khớp."
        : "");
  const expired =
    reauth ||
    (!!details && !details.recovering && Date.parse(details.expiresAt) <= now);
  async function submit(event: FormEvent) {
    event.preventDefault();
    setTried(true);
    if (sending.current || !details || expired || validation) return;
    sending.current = true;
    setBusy(true);
    setError("");
    const abort = new AbortController();
    work.current = abort;
    try {
      const result = await googleRequest(
        "complete",
        { username, password },
        abort.signal,
      );
      if (abort.signal.aborted || !mounted.current) return;
      if ((result as { kind?: unknown })?.kind !== "member") throw new Error();
      await callback.current(result);
      if (mounted.current && !abort.signal.aborted) {
        setPassword("");
        setConfirmation("");
      }
    } catch (e) {
      if (mounted.current && !abort.signal.aborted) {
        setError(
          e instanceof GoogleRequestError
            ? e.message
            : "Chưa thể hoàn tất thiết lập. Vui lòng thử lại.",
        );
        if (e instanceof GoogleRequestError && e.status === 401)
          setReauth(true);
        if (
          e instanceof GoogleRequestError &&
          ["USERNAME_TAKEN", "USERNAME_FORBIDDEN"].includes(e.code)
        )
          focusName.current = true;
      }
    } finally {
      sending.current = false;
      if (mounted.current && !abort.signal.aborted) setBusy(false);
    }
  }
  return (
    <main className="login-page xq-ui">
      <section className="login-card" aria-labelledby="google-onboarding-title">
        <header className="login-heading">
          <p className="login-brand">Cờ Tướng Online</p>
          <h1 id="google-onboarding-title" ref={heading} tabIndex={-1}>
            Thiết lập tài khoản
          </h1>
          <p>Chọn tên kỳ thủ và mật khẩu dự phòng.</p>
        </header>
        {error && <Notice tone="error" message={error} />}
        {!details && !reauth && (
          <>
            {!error && <p role="status">Đang tải thông tin Google…</p>}
            {error && (
              <Button onClick={() => setAttempt((n) => n + 1)}>Thử lại</Button>
            )}
          </>
        )}
        {details && (
          <div className="xq-stack">
            <span
              role="img"
              aria-label="Avatar chữ cái đầu"
              style={{
                display: "grid",
                placeItems: "center",
                width: 48,
                height: 48,
                borderRadius: "50%",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                fontSize: 24,
              }}
            >
              {details.avatar?.text}
            </span>
            <TextField
              label="Email Google"
              value={details.email || ""}
              readOnly
              helper="Email đã được Google xác minh. Không cần mã OTP."
            />
          </div>
        )}
        {expired ? (
          <>
            <Notice
              tone="info"
              message="Vui lòng xác thực Google lại để tiếp tục."
            />
            <label className="login-remember">
              <input
                type="checkbox"
                checked={remember}
                disabled={busy || reauthBusy}
                onChange={(event) => setRemember(event.target.checked)}
              />{" "}
              <span>Ghi nhớ đăng nhập</span>
            </label>
            <p className="xq-help login-session-help">
              Không ghi nhớ: 12 giờ. Ghi nhớ: 30 ngày.
            </p>
            <GoogleSignInButton
              remember={remember}
              disabled={busy}
              onBusyChange={setReauthBusy}
              text="continue_with"
              onResult={onResult}
            />
          </>
        ) : (
          details && (
            <form
              onSubmit={submit}
              noValidate
              aria-label="Thiết lập tài khoản Google"
              aria-busy={busy}
            >
              <div className="xq-stack" style={{ marginTop: 20 }}>
                <div className="xq-field">
                  <label htmlFor="google-username">Username</label>
                  <input
                    id="google-username"
                    ref={userField}
                    autoComplete="username"
                    autoCapitalize="none"
                    spellCheck={false}
                    value={username}
                    disabled={busy}
                    onChange={(e) => {
                      setUsername(e.target.value);
                      setError("");
                    }}
                    aria-invalid={Boolean(
                      (tried || forbidden) && invalidUsername,
                    )}
                    aria-describedby="google-username-help"
                  />
                  <p id="google-username-help" className="xq-help">
                    3–20 chữ, số hoặc dấu gạch dưới; tên này sẽ hiển thị trong
                    ứng dụng.
                  </p>
                </div>
                <TextField
                  label="Mật khẩu dự phòng"
                  type="password"
                  autoComplete="new-password"
                  value={password}
                  disabled={busy}
                  onChange={(e) => setPassword(e.target.value)}
                  helper="Ít nhất 8 ký tự, dùng để đăng nhập bằng Username."
                />
                <TextField
                  label="Nhập lại mật khẩu"
                  type="password"
                  autoComplete="new-password"
                  value={confirmation}
                  disabled={busy}
                  onChange={(e) => setConfirmation(e.target.value)}
                />
                {(forbidden || (tried && validation)) && (
                  <Notice tone="error" message={validation} />
                )}
                <Button type="submit" loading={busy}>
                  Hoàn tất thiết lập
                </Button>
              </div>
            </form>
          )
        )}
      </section>
    </main>
  );
}
