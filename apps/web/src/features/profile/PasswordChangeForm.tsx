import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button, Notice, TextField } from "../../shared/ui/primitives.js";
import { ProfileRequestError, type ProfileClient } from "./profile-client.js";

const passwordRule = "Mật khẩu mới cần ít nhất 8 ký tự và khớp với xác nhận.";

function changeError(error: unknown) {
  if (error instanceof ProfileRequestError)
    switch (error.code) {
      case "PASSWORD_CURRENT_INVALID":
        return "Mật khẩu hiện tại không đúng.";
      case "PASSWORD_INVALID_INPUT":
        return passwordRule;
      case "PASSWORD_RATE_LIMITED":
        return "Bạn thử quá nhiều lần. Vui lòng thử lại sau.";
      case "PASSWORD_PROVIDER_ERROR":
        return "Chưa thể đổi mật khẩu lúc này. Vui lòng thử lại sau.";
    }
  return "Chưa thể đổi mật khẩu. Kiểm tra kết nối rồi thử lại.";
}

/**
 * Đổi mật khẩu cho thành viên đang đăng nhập; phiên hiện tại được giữ, các phiên khác bị đăng xuất phía máy chủ.
 */
export function PasswordChangeForm({ client }: { client: ProfileClient }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [visible, setVisible] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const sending = useRef(false);
  const errorRegion = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (error) errorRegion.current?.focus();
  }, [error]);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (sending.current) return;
    setDone(false);
    setError("");
    if (!current) {
      setError("Nhập mật khẩu hiện tại.");
      return;
    }
    if (next.length < 8 || next !== confirmation) {
      setError(passwordRule);
      return;
    }
    sending.current = true;
    setSaving(true);
    try {
      await client.changePassword({
        currentPassword: current,
        newPassword: next,
        passwordConfirmation: confirmation,
      });
      setCurrent("");
      setNext("");
      setConfirmation("");
      setDone(true);
    } catch (failure) {
      setError(changeError(failure));
    } finally {
      sending.current = false;
      setSaving(false);
    }
  }

  const type = visible ? "text" : "password";
  return (
    <form
      onSubmit={submit}
      noValidate
      aria-label="Đổi mật khẩu"
      aria-busy={saving}
    >
      {error && (
        <div id="password-change-error" ref={errorRegion} tabIndex={-1}>
          <Notice tone="error" message={error} />
        </div>
      )}
      {done && (
        <Notice
          tone="success"
          message="Đã đổi mật khẩu. Các thiết bị khác đã bị đăng xuất; phiên này vẫn tiếp tục."
        />
      )}
      <TextField
        label="Mật khẩu hiện tại"
        id="password-current"
        type={type}
        autoComplete="current-password"
        aria-describedby={error ? "password-change-error" : undefined}
        value={current}
        disabled={saving}
        onChange={(event) => setCurrent(event.target.value)}
      />
      <TextField
        label="Mật khẩu mới"
        helper="Ít nhất 8 ký tự. Mật khẩu được giữ nguyên, không tự cắt khoảng trắng."
        id="password-new"
        type={type}
        autoComplete="new-password"
        aria-describedby={error ? "password-change-error" : undefined}
        value={next}
        disabled={saving}
        onChange={(event) => setNext(event.target.value)}
      />
      <TextField
        label="Nhập lại mật khẩu mới"
        id="password-confirm"
        type={type}
        autoComplete="new-password"
        aria-describedby={error ? "password-change-error" : undefined}
        value={confirmation}
        disabled={saving}
        onChange={(event) => setConfirmation(event.target.value)}
      />
      <label>
        <input
          type="checkbox"
          checked={visible}
          onChange={(event) => setVisible(event.target.checked)}
        />{" "}
        Hiện mật khẩu
      </label>
      <Button type="submit" loading={saving}>
        Đổi mật khẩu
      </Button>
    </form>
  );
}
