export type ThemeChoice = "co-phong" | "paper-light" | "system";
export type ResolvedTheme = "co-phong" | "paper-light" | "paper-dark";
export const THEME_STORAGE_KEY = "xiangqi.theme";
export const DEFAULT_THEME: ThemeChoice = "co-phong";
export const THEME_OPTIONS: { value: ThemeChoice; label: string }[] = [
  { value: "co-phong", label: "Kỳ Đài Cổ Phong" },
  { value: "paper-light", label: "Giấy Sáng" },
  { value: "system", label: "Theo hệ thống" },
];
export function isThemeChoice(value: unknown): value is ThemeChoice {
  return value === "co-phong" || value === "paper-light" || value === "system";
}
/** "Theo hệ thống" follows the OS preference; explicit choices never change. */
export function resolveTheme(
  choice: ThemeChoice,
  prefersDark: boolean,
): ResolvedTheme {
  if (choice === "system") return prefersDark ? "paper-dark" : "paper-light";
  return choice;
}
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
