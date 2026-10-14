import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";
import { NavigationLink } from "../../shared/navigation/NavigationLink.js";
import { AuthShell, GoogleMark, type AuthFeature } from "./AuthShell.js";

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
const features: readonly AuthFeature[] = [
  {
    icon: "👥",
    title: "Chơi Cùng Bạn Bè",
    text: "Tạo phòng, mời bằng mã hoặc link",
  },
  {
    icon: "👁️",
    title: "Phòng Có Người Xem",
    text: "Tối đa năm người xem mỗi phòng",
  },
  { icon: "🤖", title: "Máy Cờ 3 Cấp", text: "Rèn luyện từ Dễ đến Khó" },
  { icon: "📹", title: "Face Cam Trực Tiếp", text: "Đàm đạo nét mặt đối thủ" },
];
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
    <AuthShell
      slogan="“Kỳ đạo tương phùng, tương đối kiến diện”"
      features={features}
    >
      <div className="form-head-row">
        <h1 className="form-title" id="login-title">
          Đăng Nhập Kỳ Đài
          <span className="seal-icon" aria-hidden="true">
            印
          </span>
        </h1>
      </div>
      <p className="form-subtitle">— Bước một nước cờ, kết vạn tâm giao —</p>
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
      {complete ? (
        <div className="form-success" role="status">
          Đăng nhập thành công. Đang vào ứng dụng…
        </div>
      ) : (
        <>
          <form
            onSubmit={submit}
            noValidate
            aria-label="Đăng nhập tài khoản"
            aria-busy={busy}
          >
            <div className="field-row">
              <label className="field-lbl" htmlFor="login-username">
                Tên đăng nhập (Username)
              </label>
              <div className="input-box">
                <span className="input-ico" aria-hidden="true">
                  👤
                </span>
                <input
                  className="input-elem"
                  id="login-username"
                  name="username"
                  autoComplete="username"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="nguyen_tinh99"
                  aria-describedby="login-username-help"
                  value={username}
                  disabled={busy}
                  onChange={(event) => setUsername(event.target.value)}
                />
              </div>
              <p className="field-hint" id="login-username-help">
                Dùng tên tài khoản, không dùng Email.
              </p>
            </div>
            <div className="field-row">
              <label className="field-lbl" htmlFor="login-password">
                Mật khẩu
              </label>
              <div className="input-box">
                <span className="input-ico" aria-hidden="true">
                  🔒
                </span>
                <input
                  className="input-elem"
                  id="login-password"
                  name="password"
                  type={visible ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  value={password}
                  disabled={busy}
                  onChange={(event) => setPassword(event.target.value)}
                />
                <button
                  type="button"
                  className="btn-eye"
                  aria-label={visible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                  aria-pressed={visible}
                  onClick={() => setVisible(!visible)}
                >
                  <span aria-hidden="true">{visible ? "🙈" : "👁️"}</span>
                </button>
              </div>
            </div>
            <div className="options-row">
              <label className="check-lbl">
                <input
                  type="checkbox"
                  checked={remember}
                  disabled={busy}
                  onChange={(event) => setRemember(event.target.checked)}
                />
                <span>Ghi nhớ 30 ngày</span>
              </label>
              <button
                type="button"
                className="link-forgot"
                aria-disabled="true"
                title="Sắp ra mắt"
                aria-describedby="login-forgot-help"
                onClick={(event) => event.preventDefault()}
              >
                Quên mật khẩu?
              </button>
            </div>
            <span className="sr-only" id="login-forgot-help">
              Sắp ra mắt
            </span>
            <p className="session-note">
              {remember
                ? "Giữ phiên 30 ngày từ lúc đăng nhập."
                : "Phiên kết thúc khi đóng trình duyệt hoặc sau 12 giờ."}
            </p>
            <button
              type="submit"
              className="btn-submit btn-caps"
              aria-disabled={busy}
              aria-busy={busy}
              onClick={(event) => {
                if (busy) event.preventDefault();
              }}
            >
              {busy ? (
                "Đang xử lý…"
              ) : (
                <>
                  <span aria-hidden="true">🏛️</span>
                  Đăng nhập vào Sảnh
                  <span aria-hidden="true">❯</span>
                </>
              )}
            </button>
          </form>
          <div className="divider">hoặc tiếp tục với</div>
          {renderGoogle ? (
            <div className="google-slot">
              {renderGoogle(remember, loginBusy, (value) => {
                googleSending.current = value;
                setGoogleBusy(value);
              })}
            </div>
          ) : (
            <>
              <button
                type="button"
                className="btn-google"
                aria-disabled={busy || !onGoogle}
                aria-describedby={onGoogle ? undefined : "login-google-help"}
                onClick={(event) => {
                  if (busy || !onGoogle) event.preventDefault();
                  else void provider(onGoogle);
                }}
              >
                <GoogleMark />
                Đăng nhập bằng Google
              </button>
              {!onGoogle && (
                <p className="form-note" id="login-google-help">
                  Chưa kết nối đăng nhập Google.
                </p>
              )}
            </>
          )}
          <div className="guest-wrap">
            <button
              type="button"
              className="btn-guest"
              aria-disabled={busy || !onGuest}
              aria-describedby={onGuest ? undefined : "login-guest-help"}
              onClick={(event) => {
                if (busy || !onGuest) event.preventDefault();
                else void provider(onGuest);
              }}
            >
              <span aria-hidden="true">⚡</span>
              Chơi nhanh với tư cách Khách (Guest)
              <span aria-hidden="true">❯</span>
            </button>
            {!onGuest && (
              <p className="form-note" id="login-guest-help">
                Chưa kết nối chế độ Khách.
              </p>
            )}
            <div className="guest-alert">
              <span aria-hidden="true">⚠️</span>
              <span>
                <strong>Lưu ý:</strong> Khách không tham gia Đánh Hạng và không
                lưu lịch sử ván cờ.
              </span>
            </div>
          </div>
          <div className="reg-foot">
            <span>Chưa có tài khoản?</span>
            <NavigationLink href="/register">
              Đăng ký tài khoản mới
            </NavigationLink>
          </div>
        </>
      )}
    </AuthShell>
  );
}
