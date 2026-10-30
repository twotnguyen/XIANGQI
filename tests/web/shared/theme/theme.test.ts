// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { DEFAULT_THEME, isThemeChoice } from "@xiangqi/shared";
import { applyTheme, resolveTheme } from "@web/shared/theme/theme.js";
import { setAppliedTheme } from "@web/shared/theme/useTheme.js";

afterEach(() => {
  delete document.documentElement.dataset.theme;
  delete document.documentElement.dataset.themeChoice;
});

describe("theme resolution", () => {
  it("defaults to Kỳ Đài Cổ Phong and validates choices", () => {
    expect(DEFAULT_THEME).toBe("co-phong");
    expect(isThemeChoice("paper-light")).toBe(true);
    expect(isThemeChoice("system")).toBe(true);
    expect(isThemeChoice("paper-dark")).toBe(false);
    expect(isThemeChoice("dark")).toBe(false);
  });
  it("follows the OS only for Theo hệ thống and keeps explicit choices", () => {
    expect(resolveTheme("system", true)).toBe("co-phong");
    expect(resolveTheme("system", false)).toBe("paper-light");
    expect(resolveTheme("paper-light", true)).toBe("paper-light");
    expect(resolveTheme("co-phong", false)).toBe("co-phong");
  });
  it("marks the resolved theme on the root dataset", () => {
    expect(applyTheme("system", document.documentElement.dataset, false)).toBe(
      "paper-light",
    );
    expect(document.documentElement.dataset.theme).toBe("paper-light");
    expect(document.documentElement.dataset.themeChoice).toBe("system");
    applyTheme("paper-light", document.documentElement.dataset, true);
    expect(document.documentElement.dataset.theme).toBe("paper-light");
    applyTheme("co-phong", document.documentElement.dataset, false);
    expect(document.documentElement.dataset.theme).toBe("co-phong");
  });
  it("applies only the choice passed by the account store", () => {
    setAppliedTheme("paper-light");
    expect(document.documentElement.dataset.theme).toBe("paper-light");
    setAppliedTheme(DEFAULT_THEME);
    expect(document.documentElement.dataset.theme).toBe("co-phong");
  });
});
