import { NavigationLink } from "../routing/NavigationLink.js";
import { useState, type ReactNode } from "react";
import { Button, Dialog, Tooltip } from "../ui/primitives.js";
import "./AppShell.css";
export interface ShellUser {
  displayName: string;
  guest: boolean;
}
export function AppShell({
  title,
  user,
  children,
  active = "/lobby",
  onLogout,
}: {
  title: string;
  user?: ShellUser;
  children: ReactNode;
  active?: string;
  onLogout?: () => void;
}) {
  const [menu, setMenu] = useState(false);
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
      <Tooltip text="Sắp ra mắt">
        <Button variant="ghost" disabledReason="Sắp ra mắt">
          Lịch sử
        </Button>
      </Tooltip>
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
          <span aria-hidden="true">帥</span>
          <span>Cờ Tướng Online</span>
        </NavigationLink>
        <nav className="xq-desktop-nav" aria-label="Điều hướng chính">
          {navigation}
        </nav>
        <div className="xq-account">
          {user && (
            <span>
              {user.displayName}
              {user.guest ? " (Khách)" : ""}
            </span>
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
