import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  ErrorState,
  Notice,
  Skeleton,
  TextField,
} from "../../shared/ui/primitives.js";
import {
  ProfileRequestError,
  type ProfileClient,
  type ProfileLocation,
  type ProfileView,
} from "./profile-client.js";
import { THEME_OPTIONS } from "../../shared/theme/theme.js";
import { useTheme } from "../../shared/theme/useTheme.js";
import "./profile.css";

function nameError(error: unknown) {
  if (error instanceof ProfileRequestError) {
    switch (error.code) {
      case "PROFILE_NAME_FORBIDDEN":
        return "Tên hiển thị chứa từ không được phép.";
      case "PROFILE_NAME_INVALID":
        return "Tên hiển thị cần 2–30 ký tự.";
      default:
        return "Chưa thể lưu tên hiển thị. Vui lòng thử lại.";
    }
  }
  return "Chưa thể lưu tên hiển thị. Kiểm tra kết nối rồi thử lại.";
}

/**
 * Màn hình hồ sơ cá nhân: đổi tên hiển thị, tùy chọn chủ đề giao diện và xử lý đăng xuất an toàn khi đang trong trận.
 */
export function ProfilePage({
  client,
  guest,
  onSaved,
  onLogout,
}: {
  client: ProfileClient;
  guest: boolean;
  onSaved: (displayName: string) => void;
  onLogout: () => void;
}) {
  const theme = useTheme();
  const [profile, setProfile] = useState<ProfileView | null>(null);
  const [location, setLocation] = useState<ProfileLocation | null>(null);
  const [failed, setFailed] = useState(false);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function load() {
    setFailed(false);
    try {
      const [view, where] = await Promise.all([
        guest ? Promise.resolve(null) : client.read(),
        client.location().catch(() => null),
      ]);
      setProfile(view);
      setName(view?.displayName ?? "");
      setLocation(where);
    } catch {
      setFailed(true);
    }
  }
  useEffect(() => {
    void load();
  }, []);

  async function save() {
    if (saving) return;
    const trimmed = name.trim();
    const length = Array.from(trimmed).length;
    if (length < 2 || length > 30) {
      setFieldError("Tên hiển thị cần 2–30 ký tự.");
      setStatus("");
      return;
    }
    setSaving(true);
    setFieldError("");
    setStatus("");
    try {
      const result = await client.updateDisplayName(trimmed);
      onSaved(result.displayName);
      setName(result.displayName);
      setProfile((previous) =>
        previous ? { ...previous, displayName: result.displayName } : previous,
      );
      setStatus("Đã lưu tên hiển thị.");
    } catch (error) {
      setFieldError(nameError(error));
    } finally {
      setSaving(false);
    }
  }

  function requestLogout() {
    if (location && location.kind === "playing-online") setConfirmLogout(true);
    else void finishLogout();
  }
  async function finishLogout() {
    setLoggingOut(true);
    try {
      onLogout();
    } finally {
      setLoggingOut(false);
    }
  }

  if (failed)
    return (
      <main className="xq-profile">
        <h1>Hồ sơ</h1>
        <ErrorState message="Chưa thể tải hồ sơ." onRetry={() => void load()} />
      </main>
    );
  if (!guest && !profile)
    return (
      <main className="xq-profile">
        <h1>Hồ sơ</h1>
        <Skeleton label="Đang tải hồ sơ…" />
      </main>
    );

  return (
    <main className="xq-profile">
      <h1>Hồ sơ</h1>
      {guest ? (
        <p>Khách không có phần sửa hồ sơ. Bạn có thể đăng xuất tại đây.</p>
      ) : (
        <section aria-label="Thông tin tài khoản" className="xq-profile-card">
          <div className="xq-profile-avatar" aria-hidden="true">
            {(profile?.displayName ?? "?").slice(0, 1).toUpperCase()}
          </div>
          <dl>
            <dt>Tên đăng nhập</dt>
            <dd>{profile?.username}</dd>
            <dt>Email</dt>
            <dd>{profile?.email}</dd>
          </dl>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              void save();
            }}
          >
            <TextField
              label="Tên hiển thị"
              helper="2–30 ký tự, là tên người khác nhìn thấy."
              value={name}
              error={fieldError}
              onChange={(event) => setName(event.target.value)}
            />
            <Button type="submit" loading={saving}>
              Lưu tên hiển thị
            </Button>
          </form>
          <fieldset className="xq-profile-theme">
            <legend>Giao diện</legend>
            {THEME_OPTIONS.map((option) => (
              <label key={option.value}>
                <input
                  type="radio"
                  name="xq-theme"
                  value={option.value}
                  checked={theme.choice === option.value}
                  onChange={() => theme.setChoice(option.value)}
                />
                {option.label}
              </label>
            ))}
          </fieldset>
          <p className="xq-profile-note">
            Không đổi Tên đăng nhập, email hay ảnh đại diện trong màn này.
          </p>
        </section>
      )}
      {status && <Notice message={status} onDismiss={() => setStatus("")} />}
      <Button variant="secondary" loading={loggingOut} onClick={requestLogout}>
        Đăng xuất
      </Button>
      <Dialog
        open={confirmLogout}
        danger
        title="Đăng xuất khi đang đấu"
        confirmLabel="Đồng ý đăng xuất"
        cancelLabel="Huỷ"
        onClose={() => setConfirmLogout(false)}
        onConfirm={() => {
          setConfirmLogout(false);
          void finishLogout();
        }}
      >
        <p>
          Bạn đang trong ván online. Đăng xuất sẽ bị xử thua do đầu hàng. Bạn có
          chắc muốn tiếp tục?
        </p>
      </Dialog>
    </main>
  );
}
