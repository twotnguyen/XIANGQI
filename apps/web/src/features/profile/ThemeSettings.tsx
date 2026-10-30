import { useMemo, useState } from "react";
import type { ThemeChoice } from "@xiangqi/shared";
import { THEME_OPTIONS } from "../../shared/theme/theme.js";
import {
  currentAccountScope,
  setAppliedTheme,
  useAccountScope,
  useAppliedTheme,
} from "../../shared/theme/useTheme.js";
import { playClickSound } from "../../shared/preferences.js";
import type { AuthorizedFetch } from "./profile-client.js";
import { createThemeClient } from "./theme-client.js";

const THEME_DESCRIPTIONS: Record<ThemeChoice, string> = {
  "co-phong": "Nâu trầm và sắc vàng, đậm chất kỳ đài.",
  "paper-light": "Nền giấy sáng, nhẹ nhàng và rõ nét.",
  system: "Tự chọn sáng hoặc tối theo thiết bị.",
};

/**
 * Bộ chọn giao diện cho thành viên. Chỉ đổi giao diện sau khi server xác nhận lưu.
 */
export function ThemeSettings({
  authorizedFetch,
}: {
  authorizedFetch: AuthorizedFetch;
}) {
  const applied = useAppliedTheme();
  const scope = useAccountScope();
  // Trạng thái lưu gắn với tài khoản đã bắt đầu; đổi tài khoản thì không ảnh hưởng form mới.
  const [pending, setPending] = useState<{
    scope: number;
    failed: boolean;
  } | null>(null);
  const saving = pending?.scope === scope && !pending.failed;
  const error =
    pending?.scope === scope && pending.failed
      ? "Chưa lưu được giao diện. Giao diện hiện tại vẫn được giữ."
      : null;
  const client = useMemo(
    () => createThemeClient(authorizedFetch),
    [authorizedFetch],
  );

  function choose(theme: ThemeChoice) {
    if (saving || theme === applied) return;
    const started = currentAccountScope();
    setPending({ scope: started, failed: false });
    client.save(theme).then(
      (saved) => {
        if (currentAccountScope() !== started) return;
        setPending(null);
        setAppliedTheme(saved);
      },
      () => {
        if (currentAccountScope() !== started) return;
        setPending({ scope: started, failed: true });
      },
    );
  }

  return (
    <fieldset className="xq-profile-theme" disabled={saving}>
      <legend>Chủ đề hiển thị</legend>
      <div className="xq-profile-theme-options">
        {THEME_OPTIONS.map((option) => (
          <label
            key={option.value}
            className="xq-profile-theme-option"
            onClick={playClickSound}
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
                checked={applied === option.value}
                onChange={() => choose(option.value)}
              />
              <strong>{option.label}</strong>
            </span>
            <span className="xq-profile-theme-description">
              {THEME_DESCRIPTIONS[option.value]}
            </span>
          </label>
        ))}
      </div>
      <p role="status" aria-live="polite" className="xq-profile-theme-status">
        {saving ? "Đang lưu giao diện…" : null}
      </p>
      {error ? (
        <p role="alert" className="xq-profile-theme-error">
          {error}
        </p>
      ) : null}
    </fieldset>
  );
}
