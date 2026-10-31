import { useEffect, useRef, useState, type FormEvent } from "react";
import { NavigationLink } from "../../shared/navigation/NavigationLink.js";
import { navigate } from "../../shared/navigation/navigation.js";
import { Button, Tabs, TextField } from "../../shared/ui/primitives.js";
import { AuthShell } from "./AuthShell.js";
import { UsernameRecoveryPanel } from "./UsernameRecoveryPanel.js";
import {
  PasswordRequestError,
  setPendingRecovery,
  startRecovery,
} from "./password-recovery.js";

const recoveryUnavailable =
  "Tài khoản không có email đã xác minh nên không thể khôi phục mật khẩu.";

function sendError(error: unknown) {
  if (error instanceof PasswordRequestError)
    switch (error.code) {
      case "PASSWORD_RECOVERY_UNAVAILABLE":
        return recoveryUnavailable;
      case "PASSWORD_INVALID_INPUT":
        return "Tên đăng nhập gồm 3–20 ký tự chữ, số hoặc dấu gạch dưới.";
      case "PASSWORD_RATE_LIMITED":
        return "Bạn đã yêu cầu quá nhiều lần. Vui lòng thử lại sau.";
      case "PASSWORD_OTP_LIMITED":
        return "Bạn đã yêu cầu quá nhiều mã, vui lòng thử lại sau";
      case "PASSWORD_PROVIDER_ERROR":
        return "Không gửi được mã, vui lòng thử lại sau.";
    }
  return "Chưa thể gửi yêu cầu. Kiểm tra kết nối rồi thử lại.";
}

/**
 * Chọn khôi phục mật khẩu hoặc tìm Username bằng hai mục đích OTP riêng biệt.
 */
export function ForgotPasswordPage() {
  return (
    <AuthShell slogan="“Kỳ đạo tương phùng, tương đối kiến diện”" features={[]}>
      <h1 className="form-title">Khôi phục tài khoản</h1>
      <Tabs
        label="Khôi phục tài khoản"
        defaultId={
          new URLSearchParams(window.location.search).get("tab") === "username"
            ? "username"
            : "password"
        }
        items={[
          {
            id: "password",
            label: "Quên mật khẩu",
            content: <PasswordRecoveryForm />,
          },
          {
            id: "username",
            label: "Quên tên đăng nhập",
            content: <UsernameRecoveryPanel />,
          },
        ]}
      />
      <p className="reg-foot">
        <NavigationLink href="/login">Quay lại đăng nhập</NavigationLink>
      </p>
    </AuthShell>
  );
}

function PasswordRecoveryForm() {
  const [username, setUsername] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
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

  function invalidate() {
    generation.current += 1;
    sending.current = false;
    setBusy(false);
    setError("");
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (sending.current) return;
    setError("");
    if (!/^[A-Za-z0-9_]{3,20}$/.test(username)) {
      setError("Tên đăng nhập gồm 3–20 ký tự chữ, số hoặc dấu gạch dưới.");
      return;
    }
    sending.current = true;
    const started = generation.current;
    const startedPath = window.location.pathname;
    const current = () =>
      generation.current === started &&
      window.location.pathname === startedPath;
    setBusy(true);
    try {
      const recovery = await startRecovery(username);
      if (!current()) return;
      setPendingRecovery(recovery);
      navigate("/reset-password");
    } catch (failure) {
      if (current()) setError(sendError(failure));
    } finally {
      if (current()) {
        sending.current = false;
        setBusy(false);
      }
    }
  }

  return (
    <>
      <h2 className="form-title" id="forgot-title">
        Quên mật khẩu
      </h2>
      <p className="form-subtitle">
        Nhập tên đăng nhập. Mã OTP sẽ được gửi tới email đã xác minh của tài
        khoản.
      </p>
      {error && (
        <div
          ref={errorRegion}
          id="forgot-error"
          tabIndex={-1}
          role="alert"
          className="form-alert"
        >
          {error}
        </div>
      )}
      <form
        onSubmit={submit}
        noValidate
        aria-label="Quên mật khẩu"
        aria-busy={busy}
      >
        <TextField
          label="Tên đăng nhập (Username)"
          helper="Dùng tên tài khoản, không dùng Email."
          id="forgot-username"
          name="username"
          autoComplete="username"
          autoCapitalize="none"
          spellCheck={false}
          aria-describedby={error ? "forgot-error" : undefined}
          value={username}
          disabled={busy}
          onChange={(event) => {
            invalidate();
            setUsername(event.target.value);
          }}
        />
        <Button type="submit" loading={busy} className="btn-submit">
          Gửi mã OTP
        </Button>
      </form>
    </>
  );
}
