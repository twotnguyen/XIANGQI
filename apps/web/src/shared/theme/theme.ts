export type ThemeChoice = "co-phong" | "paper-light" | "system";
export type ResolvedTheme = "co-phong" | "paper-light" | "paper-dark";
export const THEME_STORAGE_KEY = "xiangqi.theme";
export const DEFAULT_THEME: ThemeChoice = "co-phong";
export const THEME_OPTIONS: { value: ThemeChoice; label: string }[] = [
  { value: "co-phong", label: "Kỳ Đài Cổ Phong" },
  { value: "paper-light", label: "Giấy Sáng" },
  { value: "system", label: "Theo hệ thống" },
];
/**
 * Kiểm tra giá trị có phải là một tùy chọn chủ đề giao diện hợp lệ.
 */
export function isThemeChoice(value: unknown): value is ThemeChoice {
  return value === "co-phong" || value === "paper-light" || value === "system";
}
/**
 * Giải định chủ đề thực tế sẽ hiển thị dựa theo lựa chọn và tùy chọn sáng/tối của hệ điều hành.
 */
export function resolveTheme(
  choice: ThemeChoice,
  prefersDark: boolean,
): ResolvedTheme {
  if (choice === "system") return prefersDark ? "paper-dark" : "paper-light";
  return choice;
}
/**
 * Đọc chủ đề giao diện đã lưu từ localStorage.
 */
export function readStoredTheme(
  storage: Pick<Storage, "getItem">,
): ThemeChoice {
  try {
    const value = storage.getItem(THEME_STORAGE_KEY);
    return isThemeChoice(value) ? value : DEFAULT_THEME;
  } catch {
    return DEFAULT_THEME;
  }
}
/**
 * Lưu lựa chọn chủ đề giao diện vào localStorage.
 */
export function storeTheme(
  storage: Pick<Storage, "setItem">,
  choice: ThemeChoice,
) {
  try {
    storage.setItem(THEME_STORAGE_KEY, choice);
  } catch {
    /* Private mode or quota: the in-memory choice still applies this session. */
  }
}
/**
 * Áp dụng chủ đề giao diện lên thuộc tính data-theme của thẻ tài liệu HTML.
 */
export function applyTheme(
  choice: ThemeChoice,
  dataset: DOMStringMap,
  prefersDark: boolean,
): ResolvedTheme {
  const resolved = resolveTheme(choice, prefersDark);
  dataset.theme = resolved;
  dataset.themeChoice = choice;
  return resolved;
}
