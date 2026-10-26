import { NavigationLink } from "../../shared/navigation/NavigationLink.js";
import { useState, useRef, useEffect, type ReactNode } from "react";
import { Button, Dialog, Tooltip } from "../../shared/ui/primitives.js";
import "./AppShell.css";
export interface ShellUser {
  displayName: string;
  guest: boolean;
}
/**
 * Khung giao diện bao bọc ứng dụng (header điều hướng, menu người dùng, thông báo chuông và vùng nội dung chính).
 */
export function AppShell({
  title,
  user,
  children,
  active = "/lobby",
  onLogout,
  bell,
}: {
  title: string;
  user?: ShellUser;
  children: ReactNode;
  active?: string;
  onLogout?: () => void;
  bell?: ReactNode;
}) {
  const [menu, setMenu] = useState(false);
  const [userDropdown, setUserDropdown] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userDropdown) return;
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserDropdown(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setUserDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [userDropdown]);

  const navigation = (
    <>
      <NavigationLink
        href="/lobby"
        aria-current={active === "/lobby" ? "page" : undefined}
      >
        Sảnh
      </NavigationLink>
      {user?.guest ? (
        <Button
          variant="ghost"
          disabledReason="Khách không dùng chức năng bạn bè."
        >
          Bạn bè
        </Button>
      ) : (
        <NavigationLink
          href="/friends"
          aria-current={active === "/friends" ? "page" : undefined}
        >
          Bạn bè
        </NavigationLink>
      )}
      {user?.guest ? (
        <Button
          variant="ghost"
          onClick={onLogout}
          disabledReason={
            onLogout ? undefined : "Chưa kết nối chức năng đăng xuất."
          }
        >
          Đăng xuất
        </Button>
      ) : (
        <NavigationLink
          href="/settings"
          aria-current={active === "/settings" ? "page" : undefined}
        >
          Hồ sơ
        </NavigationLink>
      )}
      {user?.guest ? (
        <Button
          variant="ghost"
          disabledReason="Khách không có lịch sử ván đấu."
        >
          Lịch sử
        </Button>
      ) : (
        <NavigationLink
          href="/history"
          aria-current={active === "/history" ? "page" : undefined}
        >
          Lịch sử
        </NavigationLink>
      )}
      <Tooltip text="Sắp ra mắt">
        <Button variant="ghost" disabledReason="Sắp ra mắt">
          Bảng xếp hạng
        </Button>
      </Tooltip>
    </>
  );
  return (
    <div className="xq-ui xq-shell">
      <NavigationLink className="xq-skip" href="#xq-content">
        Bỏ qua điều hướng
      </NavigationLink>
      <header className="xq-header">
        <NavigationLink className="xq-brand" href="/lobby">
          <span className="xq-logo-token" aria-hidden="true">
            帥
          </span>
          <span className="xq-brand-title">Cờ Tướng Online</span>
        </NavigationLink>
        <nav className="xq-desktop-nav" aria-label="Điều hướng chính">
          {navigation}
        </nav>
        <div className="xq-account">
          {bell}
          {user && (
            <div className="xq-user-menu-wrap" ref={userMenuRef}>
              <button
                type="button"
                className="xq-user-pill"
                onClick={() => setUserDropdown((open) => !open)}
                aria-expanded={userDropdown}
                aria-haspopup="true"
                aria-label={`Tài khoản: ${user.displayName}`}
              >
                <span className="xq-user-avatar" aria-hidden="true">
                  {user.displayName.trim().charAt(0).toUpperCase() || "K"}
                </span>
                <span className="xq-user-name">
                  {user.displayName}
                  {user.guest ? " (Khách)" : ""}
                </span>
                <span className="xq-user-arrow" aria-hidden="true">
                  {userDropdown ? "▴" : "▾"}
                </span>
              </button>
              {userDropdown && (
                <div
                  className="xq-user-dropdown"
                  role="menu"
                  aria-label="Tài khoản cá nhân"
                >
                  <div className="xq-dropdown-header">
                    <div className="xq-dropdown-avatar" aria-hidden="true">
                      {user.displayName.trim().charAt(0).toUpperCase() || "K"}
                    </div>
                    <div className="xq-dropdown-user-details">
                      <strong className="xq-dropdown-name">
                        {user.displayName}
                      </strong>
                      <span className="xq-dropdown-role">
                        {user.guest ? "Tài khoản Khách" : "⚔️ Kỳ thủ Kỳ Đài"}
                      </span>
                      <span className="xq-dropdown-status">
                        🟢 Đang trực tuyến
                      </span>
                    </div>
                  </div>
                  <div className="xq-dropdown-divider" />
                  <nav
                    className="xq-dropdown-links"
                    aria-label="Tác vụ tài khoản"
                  >
                    <NavigationLink
                      href="/lobby"
                      className="xq-dropdown-item"
                      onClick={() => setUserDropdown(false)}
                    >
                      <span>🏛️</span>
                      <span>Sảnh cờ</span>
                    </NavigationLink>
                    {!user.guest && (
                      <NavigationLink
                        href="/settings"
                        className="xq-dropdown-item"
                        onClick={() => setUserDropdown(false)}
                      >
                        <span>📜</span>
                        <span>Hồ sơ cá nhân</span>
                      </NavigationLink>
                    )}
                  </nav>
                  <div className="xq-dropdown-divider" />
                  <div className="xq-dropdown-footer">
                    <button
                      type="button"
                      className="xq-dropdown-logout"
                      onClick={() => {
                        setUserDropdown(false);
                        onLogout?.();
                      }}
                      disabled={!onLogout}
                    >
                      <span>🚪</span>
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          <span className="xq-mobile-menu">
            <Button
              variant="secondary"
              onClick={() => setMenu(true)}
              aria-label="Mở điều hướng"
            >
              Menu
            </Button>
          </span>
        </div>
      </header>
      <main
        id="xq-content"
        className="xq-main"
        tabIndex={-1}
        aria-label={title}
      >
        {children}
      </main>
      <Dialog open={menu} onClose={() => setMenu(false)} title="Điều hướng">
        <nav className="xq-menu-nav" aria-label="Điều hướng điện thoại">
          {navigation}
        </nav>
      </Dialog>
    </div>
  );
}
