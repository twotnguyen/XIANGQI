// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  applyTheme,
  isThemeChoice,
  readStoredTheme,
  resolveTheme,
  storeTheme,
} from "@web/shared/theme/theme.js";

afterEach(() => {
  delete document.documentElement.dataset.theme;
  delete document.documentElement.dataset.themeChoice;
});

describe("theme resolution", () => {
  it("defaults to Kỳ Đài Cổ Phong and validates choices", () => {
    expect(DEFAULT_THEME).toBe("co-phong");
    expect(isThemeChoice("paper-light")).toBe(true);
    expect(isThemeChoice("system")).toBe(true);
    expect(isThemeChoice("dark")).toBe(false);
    expect(readStoredTheme({ getItem: () => null })).toBe("co-phong");
    expect(readStoredTheme({ getItem: () => "nope" })).toBe("co-phong");
    expect(readStoredTheme({ getItem: () => "paper-light" })).toBe(
      "paper-light",
    );
  });
  it("follows the OS only for Theo hệ thống and keeps explicit choices", () => {
    expect(resolveTheme("system", true)).toBe("paper-dark");
    expect(resolveTheme("system", false)).toBe("paper-light");
    expect(resolveTheme("paper-light", true)).toBe("paper-light");
    expect(resolveTheme("co-phong", true)).toBe("co-phong");
  });
  it("persists safely and marks the resolved theme on the root dataset", () => {
    const setItem = vi.fn();
    storeTheme({ setItem }, "paper-light");
    expect(setItem).toHaveBeenCalledWith(THEME_STORAGE_KEY, "paper-light");
    storeTheme(
      {
        setItem: () => {
          throw Error("quota");
        },
      },
      "system",
    );
    const resolved = applyTheme(
      "system",
      document.documentElement.dataset,
      true,
    );
    expect(resolved).toBe("paper-dark");
    expect(document.documentElement.dataset.theme).toBe("paper-dark");
    expect(document.documentElement.dataset.themeChoice).toBe("system");
    applyTheme("paper-light", document.documentElement.dataset, true);
    expect(document.documentElement.dataset.theme).toBe("paper-light");
  });
  it("never throws when storage is unavailable", () => {
    expect(
      readStoredTheme({
        getItem: () => {
          throw Error("blocked");
        },
      }),
    ).toBe("co-phong");
  });
});
