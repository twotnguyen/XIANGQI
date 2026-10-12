import { useCallback, useEffect, useState } from "react";
import {
  applyTheme,
  isThemeChoice,
  readStoredTheme,
  storeTheme,
  type ThemeChoice,
} from "./theme.js";

function browserStorage(): Storage | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage;
  } catch {
    return null;
  }
}

/** Reads the stored choice, applies it to <html> and follows the OS for "system". */
export function useTheme() {
  const [choice, setChoiceState] = useState<ThemeChoice>(() =>
    readStoredTheme(browserStorage() ?? { getItem: () => null }),
  );
  useEffect(() => {
    const media =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : null;
    const apply = () =>
      applyTheme(
        choice,
        document.documentElement.dataset,
        media?.matches ?? false,
      );
    apply();
    if (choice !== "system" || !media) return;
    const listener = () => apply();
    media.addEventListener?.("change", listener);
    return () => media.removeEventListener?.("change", listener);
  }, [choice]);
  const setChoice = useCallback((next: ThemeChoice) => {
    if (!isThemeChoice(next)) return;
    const storage = browserStorage();
    if (storage) storeTheme(storage, next);
    setChoiceState(next);
  }, []);
  return { choice, setChoice };
}
