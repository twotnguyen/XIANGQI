import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { Button, Notice, TextField, Tooltip } from "../ui/primitives.js";
import { NavigationLink } from "../routing/NavigationLink.js";
import "./LoginPage.css";

export interface LoginResult {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  userId: string;
  username: string;
  appSession: string;
  expiresAt: string;
  remember: boolean;
}
const invalid = "Sai tên đăng nhập hoặc mật khẩu";
const locked = "Bạn đã thử quá nhiều lần, vui lòng thử lại sau 15 phút";
const unavailable = "Chưa thể đăng nhập. Vui lòng kiểm tra kết nối và thử lại.";
function validResult(value: unknown): value is Omit<LoginResult, "remember"> {
  if (!value || typeof value !== "object") return false;
  const result = value as Record<string, unknown>;
  return (
    ["access_token", "refresh_token", "userId", "username", "appSession"].every(
      (key) => typeof result[key] === "string" && result[key].length > 0,
    ) &&
    typeof result.expires_in === "number" &&
    Number.isFinite(result.expires_in) &&
    result.expires_in > 0 &&
    typeof result.expiresAt === "string" &&
    Number.isFinite(Date.parse(result.expiresAt))
  );
}
export function LoginPage({
  onLoggedIn,
  onGoogle,
  onGuest,
  renderGoogle,
}: {
  onLoggedIn: (result: LoginResult) => void | Promise<void>;
  onGoogle?: () => void | Promise<void>;
  onGuest?: () => void | Promise<void>;
  renderGoogle?: (
    remember: boolean,
    disabled: boolean,
    onBusyChange: (busy: boolean) => void,
  ) => ReactNode;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [visible, setVisible] = useState(false);
  const [loginBusy, setBusy] = useState(false),
    [googleBusy, setGoogleBusy] = useState(false);
  const googleSending = useRef(false),
    busy = loginBusy || googleBusy;
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState("");
  const sending = useRef(false);
  const controller = useRef<AbortController | null>(null);
  const errorRegion = useRef<HTMLDivElement>(null);
  useEffect(() => () => controller.current?.abort(), []);
  useEffect(() => {
    if (error) errorRegion.current?.focus();
  }, [error]);
  async function submit(event: FormEvent) {
    event.preventDefault();
    if (sending.current || googleSending.current || complete) return;
    setError("");
    if (!/^[A-Za-z0-9_]{3,20}$/.test(username) || !password) {
      setError(invalid);
      return;
    }
    sending.current = true;
    setBusy(true);
    const postedRemember = remember;
    const abort = new AbortController();
    controller.current = abort;
    try {
      const base = (
        import.meta.env.VITE_API_URL || "http://localhost:3000"
      ).replace(/\/$/, "");
      const response = await fetch(`${base}/auth/login`, {
        method: "POST",
        credentials: "include",
        redirect: "error",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password, remember: postedRemember }),
        signal: abort.signal,
      });
      const result: unknown = await response.json();
      if (abort.signal.aborted) return;
      if (!response.ok) {
        const code =
          result && typeof result === "object"
            ? (result as { code?: unknown }).code
            : undefined;
        setError(
          code === "LOGIN_LOCKED" || response.status === 429
            ? locked
            : code === "LOGIN_INVALID" || response.status === 401
              ? invalid
              : unavailable,
        );
        return;
      }
      if (!validResult(result)) {
        setError(unavailable);
        return;
      }
      await onLoggedIn({ ...result, remember: postedRemember });
      if (!abort.signal.aborted) {
        setPassword("");
        setComplete(true);
      }
    } catch {
      if (!abort.signal.aborted) setError(unavailable);
    } finally {
      sending.current = false;
      if (!abort.signal.aborted) setBusy(false);
    }
  }
  async function provider(callback: (() => void | Promise<void>) | undefined) {
    if (!callback || sending.current || complete) return;
    try {
      await callback();
    } catch {
      setError(unavailable);
    }
  }
  return (
    <main className="login-page xq-ui">
      <section className="login-card" aria-labelledby="login-title">
        <header className="login-heading">
          <div className="login-mark" aria-hidden="true">
            <span>帥</span>
            <span>將</span>
          </div>
          <p className="login-brand">Cờ Tướng Online</p>
          <h1 id="login-title">Kỳ Đài Đăng Nhập</h1>
          <p>Mỗi nước cờ, một cuộc gặp.</p>
        </header>
        {error && (
          <div ref={errorRegion} tabIndex={-1} className="login-error">
            <Notice tone="error" message={error} />
          </div>
        )}
        {complete ? (
          <Notice
            tone="success"
            message="Đăng nhập thành công. Đang vào ứng dụng…"
          />
        ) : (
          <>
            <form
              onSubmit={submit}
              noValidate
              aria-label="Đăng nhập tài khoản"
              aria-busy={busy}
            >
              <TextField
                label="Username"
                name="username"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                helper="Dùng tên tài khoản, không dùng Email."
                value={username}
                disabled={busy}
                onChange={(event) => setUsername(event.target.value)}
              />
              <div className="login-password">
                <TextField
                  label="Mật khẩu"
                  name="password"
                  type={visible ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  disabled={busy}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <Button
                  variant="ghost"
                  aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  aria-pressed={visible}
                  onClick={() => setVisible(!visible)}
                >
                  {visible ? "Ẩn" : "Hiện"}
                </Button>
              </div>
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={remember}
                  disabled={busy}
                  onChange={(event) => setRemember(event.target.checked)}
                />{" "}
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <p className="xq-help login-session-help">
                {remember
                  ? "Giữ phiên 30 ngày từ lúc đăng nhập."
                  : "Phiên kết thúc khi đóng trình duyệt hoặc sau 12 giờ."}
              </p>
              <Button type="submit" loading={busy}>
                Đăng nhập
              </Button>
              <Tooltip text="Sắp ra mắt">
                <Button variant="ghost" disabledReason="Sắp ra mắt">
                  Quên mật khẩu?
                </Button>
              </Tooltip>
            </form>
            <div className="login-divider">
              <span>Hoặc</span>
            </div>
            <div className="login-alternatives">
              {renderGoogle ? (
                renderGoogle(remember, loginBusy, (value) => {
                  googleSending.current = value;
                  setGoogleBusy(value);
                })
              ) : (
                <Button
                  variant="secondary"
                  disabled={busy}
                  disabledReason={
                    onGoogle ? undefined : "Chưa kết nối đăng nhập Google."
                  }
                  onClick={() => void provider(onGoogle)}
                >
                  Đăng nhập bằng Google
                </Button>
              )}
              <Button
                variant="secondary"
                disabled={busy}
                disabledReason={
                  onGuest ? undefined : "Chưa kết nối chế độ Khách."
                }
                onClick={() => void provider(onGuest)}
              >
                Chơi với tư cách Khách
              </Button>
              <p className="xq-help">
                Khách không tham gia Đánh Hạng và không lưu lịch sử ván cờ.
              </p>
            </div>
            <footer className="login-footer">
              <span>Chưa có tài khoản?</span>
              <NavigationLink href="/register">
                Đăng ký tài khoản mới
              </NavigationLink>
            </footer>
          </>
        )}
      </section>
    </main>
  );
}
