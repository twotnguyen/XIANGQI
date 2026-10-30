import { useEffect, useRef } from "react";
import { DEFAULT_THEME } from "@xiangqi/shared";

import {
  appliedThemeWrites,
  beginAccountScope,
  currentAppliedTheme,
  setAppliedTheme,
} from "../../shared/theme/useTheme.js";
import type { AuthorizedFetch } from "./profile-client.js";
import { createThemeClient } from "./theme-client.js";

/** Chu kỳ kiểm tra thay đổi chủ đề từ thiết bị khác khi tài khoản đang mở. */
const THEME_POLL_MS = 5000;

/**
 * Đồng bộ chủ đề theo tài khoản: khi đổi người dùng, đặt về mặc định rồi đọc lựa chọn của tài khoản đó.
 * Khách hoặc đăng xuất (userId null) luôn dùng mặc định. Không render gì.
 */
export function AccountThemeSync({
  userId,
  authorizedFetch,
}: {
  userId: string | null;
  authorizedFetch: AuthorizedFetch;
}) {
  const fetchRef = useRef(authorizedFetch);
  useEffect(() => {
    fetchRef.current = authorizedFetch;
  }, [authorizedFetch]);

  useEffect(() => {
    beginAccountScope();
    setAppliedTheme(DEFAULT_THEME);
    if (userId === null) return;
    const client = createThemeClient(fetchRef.current);
    let live = true;
    let busy = false;
    // Kết quả đọc chỉ được áp nếu không có lần lưu cục bộ nào xảy ra trong lúc chờ.
    async function sync() {
      if (busy || !live) return;
      busy = true;
      const before = appliedThemeWrites();
      try {
        const theme = await client.read();
        if (
          live &&
          appliedThemeWrites() === before &&
          theme !== currentAppliedTheme()
        ) {
          setAppliedTheme(theme);
        }
      } catch {
        /* Giữ chủ đề hiện tại; không lưu gì xuống thiết bị. */
      } finally {
        busy = false;
      }
    }
    const onFocus = () => void sync();
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") void sync();
    }, THEME_POLL_MS);
    void sync();
    window.addEventListener("focus", onFocus);
    return () => {
      live = false;
      window.clearInterval(timer);
      window.removeEventListener("focus", onFocus);
    };
  }, [userId]);

  return null;
}
