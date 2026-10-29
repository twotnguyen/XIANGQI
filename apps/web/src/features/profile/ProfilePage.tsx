import { useEffect, useState, type ReactNode } from "react";
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
import { PasswordChangeForm } from "./PasswordChangeForm.js";
import { THEME_OPTIONS } from "../../shared/theme/theme.js";
import { useTheme } from "../../shared/theme/useTheme.js";
import "./profile.css";

const SETTINGS_SECTIONS = [
  {
    id: "profile",
    label: "Hồ sơ cá nhân",
    icon: "M20 21v-2a7 7 0 0 0-14 0v2M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z",
  },
  {
    id: "appearance",
    label: "Giao diện",
    icon: "M4 3h16v13H4zM8 21h8M12 16v5",
  },
  {
    id: "password",
    label: "Đổi mật khẩu",
    icon: "M7 11V7a5 5 0 0 1 10 0v4M5 11h14v10H5z",
  },
  {
    id: "session",
    label: "Phiên đăng nhập",
    icon: "M12 3 3 7v5c0 5 9 9 9 9s9-4 9-9V7l-9-4Zm-4 9 3 3 5-6",
  },
] as const;

const THEME_DESCRIPTIONS = {
  "co-phong": "Nâu trầm và sắc vàng, đậm chất kỳ đài.",
  "paper-light": "Nền giấy sáng, nhẹ nhàng và rõ nét.",
  system: "Tự chọn sáng hoặc tối theo thiết bị.",
};

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
  emailSection,
}: {
  client: ProfileClient;
  guest: boolean;
  onSaved: (displayName: string) => void;
  onLogout: () => void;
  emailSection?: ReactNode;
}) {
  const theme = useTheme();
  const [section, setSection] =
    useState<(typeof SETTINGS_SECTIONS)[number]["id"]>("profile");
  const activeSection = guest ? "session" : section;
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
    // Khách không có hồ sơ máy chủ: không gọi API hồ sơ hay vị trí của thành viên.
    if (guest) return;
    try {
      const [view, where] = await Promise.all([
        client.read(),
        client.location().catch(() => null),
      ]);
      setProfile(view);
      setName(view.displayName);
      setLocation(where);
    } catch {
      setFailed(true);
    }
  }
  useEffect(() => {
    void load();
  }, [guest]);

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
        <h1>Cài đặt</h1>
        <ErrorState message="Chưa thể tải hồ sơ." onRetry={() => void load()} />
      </main>
    );
  if (!guest && !profile)
    return (
      <main className="xq-profile">
        <h1>Cài đặt</h1>
        <Skeleton label="Đang tải hồ sơ…" />
      </main>
    );

  return (
    <main className="xq-profile">
      <header className="xq-profile-heading">
        <h1>Cài đặt</h1>
        <p>Không gian của bạn, theo cách bạn muốn.</p>
      </header>
      <div className="xq-profile-layout">
        <aside className="xq-profile-sidebar">
          <div className="xq-profile-identity">
            <div className="xq-profile-avatar" aria-hidden="true">
              {guest
                ? "K"
                : Array.from(profile?.displayName ?? "?")[0]?.toUpperCase()}
            </div>
            <div>
              <strong>
                {guest ? "Người chơi (Khách)" : profile?.displayName}
              </strong>
              <span>
                {guest ? "Phiên chơi tạm thời" : `@${profile?.username}`}
              </span>
            </div>
          </div>
          <nav className="xq-profile-nav" aria-label="Danh mục cài đặt">
            {SETTINGS_SECTIONS.filter(
              (item) => !guest || item.id === "session",
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={activeSection === item.id}
                aria-controls={`xq-settings-${item.id}`}
                onClick={() => setSection(item.id)}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d={item.icon} />
                </svg>
                {item.label}
                <span className="xq-profile-nav-arrow" aria-hidden="true">
                  ›
                </span>
              </button>
            ))}
          </nav>
          <div className="xq-profile-sidebar-footer">
            <p>Đã xong thiết lập? Trở lại kỳ đài để tiếp tục ván cờ.</p>
            <Button
              variant="secondary"
              loading={loggingOut}
              onClick={requestLogout}
            >
              Đăng xuất
            </Button>
          </div>
        </aside>
        <div className="xq-profile-content">
          {!guest && (
            <>
              <section
                id="xq-settings-profile"
                aria-labelledby="xq-profile-title"
                className="xq-profile-card"
                hidden={activeSection !== "profile"}
              >
                <header className="xq-profile-section-heading">
                  <h2 id="xq-profile-title">Hồ sơ cá nhân</h2>
                  <p>Thông tin giúp kỳ hữu nhận ra bạn trên bàn cờ.</p>
                </header>
                <div className="xq-profile-summary">
                  <div className="xq-profile-avatar" aria-hidden="true">
                    {Array.from(profile?.displayName ?? "?")[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h3>{profile?.displayName}</h3>
                    <p>
                      Ảnh đại diện được tạo từ chữ cái đầu trong tên của bạn.
                    </p>
                  </div>
                </div>
                <dl className="xq-profile-details">
                  <div>
                    <dt>Tên đăng nhập</dt>
                    <dd>{profile?.username}</dd>
                  </div>
                  {!emailSection && (
                    <div>
                      <dt>Email</dt>
                      <dd>{profile?.email ?? "Chưa có email"}</dd>
                    </div>
                  )}
                </dl>
                <p className="xq-profile-note">
                  Tên đăng nhập chỉ để xem, chưa hỗ trợ thay đổi tại đây.
                </p>
                {emailSection}
                <form
                  className="xq-profile-form"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void save();
                  }}
                >
                  <TextField
                    label="Tên hiển thị"
                    helper="2–30 ký tự, là tên người khác nhìn thấy."
                    autoComplete="nickname"
                    value={name}
                    error={fieldError}
                    onChange={(event) => setName(event.target.value)}
                  />
                  {status && (
                    <Notice
                      tone="success"
                      message={status}
                      onDismiss={() => setStatus("")}
                    />
                  )}
                  <div className="xq-profile-form-footer">
                    <p>Đổi tên hiển thị không cần mã OTP.</p>
                    <Button type="submit" loading={saving}>
                      Lưu tên hiển thị
                    </Button>
                  </div>
                </form>
              </section>
              <section
                id="xq-settings-appearance"
                aria-labelledby="xq-appearance-title"
                className="xq-profile-card"
                hidden={activeSection !== "appearance"}
              >
                <header className="xq-profile-section-heading">
                  <h2 id="xq-appearance-title">Giao diện</h2>
                  <p>Chọn sắc thái phù hợp cho những giờ bên bàn cờ.</p>
                </header>
                <fieldset className="xq-profile-theme">
                  <legend>Chủ đề hiển thị</legend>
                  <div className="xq-profile-theme-options">
                    {THEME_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className="xq-profile-theme-option"
                      >
                        <span
                          className={`xq-profile-theme-preview xq-profile-theme-${option.value}`}
                          aria-hidden="true"
                        >
                          <span className="xq-profile-preview-sidebar" />
                          <span className="xq-profile-preview-content">
                            <span />
                            <span />
                            <span />
                          </span>
                        </span>
                        <span className="xq-profile-theme-label">
                          <input
                            type="radio"
                            name="xq-theme"
                            value={option.value}
                            aria-label={option.label}
                            checked={theme.choice === option.value}
                            onChange={() => theme.setChoice(option.value)}
                          />
                          <strong>{option.label}</strong>
                        </span>
                        <span className="xq-profile-theme-description">
                          {THEME_DESCRIPTIONS[option.value]}
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
                <p className="xq-profile-tip">
                  Chủ đề được áp dụng ngay và ghi nhớ trên trình duyệt này.
                  Không cần bấm lưu.
                </p>
              </section>
              <section
                id="xq-settings-password"
                aria-labelledby="xq-password-title"
                className="xq-profile-card"
                hidden={activeSection !== "password"}
              >
                <header className="xq-profile-section-heading">
                  <h2 id="xq-password-title">Đổi mật khẩu</h2>
                  <p>Phiên hiện tại vẫn đăng nhập; các thiết bị khác sẽ bị đăng xuất.</p>
                </header>
                <PasswordChangeForm client={client} />
              </section>
            </>
          )}
          <section
            id="xq-settings-session"
            aria-labelledby="xq-session-title"
            className="xq-profile-card"
            hidden={activeSection !== "session"}
          >
            <header className="xq-profile-section-heading">
              <h2 id="xq-session-title">Phiên đăng nhập</h2>
              <p>Quản lý phiên đang sử dụng trên trình duyệt này.</p>
            </header>
            <div className="xq-profile-session">
              <span
                className="xq-profile-session-indicator"
                aria-hidden="true"
              />
              <div>
                <h3>{guest ? "Chế độ Khách" : "Tài khoản thành viên"}</h3>
                <p>Phiên hiện tại đang hoạt động</p>
              </div>
            </div>
            {guest && (
              <p className="xq-profile-tip">
                Khách không có phần sửa hồ sơ. Bạn có thể đăng xuất tại đây, sau
                đó đăng ký hoặc đăng nhập bằng tài khoản thành viên.
              </p>
            )}
            <div className="xq-profile-session-warning">
              <h3>Trước khi đăng xuất</h3>
              <p>
                Nếu đang trong ván đấu, đăng xuất có thể được tính là đầu hàng.
                Hãy hoàn tất ván cờ trước khi kết thúc phiên.
              </p>
              <p>
                Sử dụng nút Đăng xuất ở thanh bên để thoát tài khoản an toàn.
              </p>
            </div>
          </section>
        </div>
      </div>
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
