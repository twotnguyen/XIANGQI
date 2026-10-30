import type { ThemeChoice } from "@xiangqi/shared";

export type ResolvedTheme = "co-phong" | "paper-light";

export const THEME_OPTIONS: { value: ThemeChoice; label: string }[] = [
  { value: "co-phong", label: "Kỳ Đài Cổ Phong" },
  { value: "paper-light", label: "Giấy Sáng" },
  { value: "system", label: "Theo hệ thống" },
];

/**
 * Chủ đề thực tế. `system` theo OS của thiết bị hiện tại: sáng → Giấy Sáng, tối → Kỳ Đài.
 */
export function resolveTheme(
  choice: ThemeChoice,
  prefersDark: boolean,
): ResolvedTheme {
  if (choice === "system") return prefersDark ? "co-phong" : "paper-light";
  return choice;
}

/**
 * Ghi chủ đề đã phân giải vào thẻ html để CSS tokens chọn đúng palette.
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
