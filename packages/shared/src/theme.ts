/**
 * Lựa chọn giao diện lưu theo tài khoản. Server là nguồn đúng; giá trị khác bị từ chối.
 */
export const THEME_CHOICES = ["co-phong", "paper-light", "system"] as const;
export type ThemeChoice = (typeof THEME_CHOICES)[number];
/** Chưa chọn thì dùng Kỳ Đài Cổ Phong, không tự theo hệ điều hành. */
export const DEFAULT_THEME: ThemeChoice = "co-phong";

export function isThemeChoice(value: unknown): value is ThemeChoice {
  return (
    typeof value === "string" &&
    (THEME_CHOICES as readonly string[]).includes(value)
  );
}
