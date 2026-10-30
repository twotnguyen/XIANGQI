// @vitest-environment jsdom
import { createElement } from "react";
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ThemeSettings } from "@web/features/profile/ThemeSettings.js";
import {
  beginAccountScope,
  setAppliedTheme,
} from "@web/shared/theme/useTheme.js";

const mocks = vi.hoisted(() => ({ save: vi.fn() }));
vi.mock("@web/features/profile/theme-client.js", () => ({
  createThemeClient: () => ({ read: vi.fn(), save: mocks.save }),
}));
vi.mock("@web/shared/preferences.js", () => ({ playClickSound: vi.fn() }));

beforeEach(() => {
  setAppliedTheme("co-phong");
  mocks.save.mockReset();
});

afterEach(() => {
  cleanup();
});

describe("ThemeSettings account switch", () => {
  it("does not apply, flag, or lock account B when A's save resolves late", async () => {
    const pending = Promise.withResolvers<"paper-light">();
    mocks.save.mockReturnValueOnce(pending.promise);
    render(createElement(ThemeSettings, { authorizedFetch: vi.fn() }));

    fireEvent.click(screen.getByRole("radio", { name: "Giấy Sáng" }));
    expect(mocks.save).toHaveBeenCalledTimes(1);
    expect(mocks.save).toHaveBeenCalledWith("paper-light");
    expect(screen.getByText("Đang lưu giao diện…")).toBeTruthy();

    // AccountThemeSync của tài khoản B: đặt mặc định rồi áp lựa chọn đã đọc của B.
    act(() => {
      beginAccountScope();
      setAppliedTheme("system");
    });
    expect(
      (screen.getByRole("radio", { name: "Theo hệ thống" }) as HTMLInputElement)
        .checked,
    ).toBe(true);
    expect(screen.queryByText("Đang lưu giao diện…")).toBeNull();
    expect(
      screen.getByRole("radio", { name: "Giấy Sáng" }).closest("fieldset")
        ?.disabled,
    ).toBe(false);

    await act(async () => {
      pending.resolve("paper-light");
      await pending.promise;
    });
    expect(
      (screen.getByRole("radio", { name: "Theo hệ thống" }) as HTMLInputElement)
        .checked,
    ).toBe(true);
    expect(
      (screen.getByRole("radio", { name: "Giấy Sáng" }) as HTMLInputElement)
        .checked,
    ).toBe(false);
    expect(screen.queryByRole("alert")).toBeNull();
    expect(mocks.save).toHaveBeenCalledTimes(1);
  });

  it("drops A's failure after switching instead of showing it on B", async () => {
    const pending = Promise.withResolvers<"paper-light">();
    mocks.save.mockReturnValueOnce(pending.promise);
    render(createElement(ThemeSettings, { authorizedFetch: vi.fn() }));

    fireEvent.click(screen.getByRole("radio", { name: "Giấy Sáng" }));
    act(() => {
      beginAccountScope();
    });
    await act(async () => {
      pending.reject(new Error("network"));
      await pending.promise.catch(() => undefined);
    });
    expect(screen.queryByRole("alert")).toBeNull();
    expect(
      (
        screen.getByRole("radio", {
          name: "Kỳ Đài Cổ Phong",
        }) as HTMLInputElement
      ).checked,
    ).toBe(true);
  });

  it("applies the server-confirmed choice for the same account", async () => {
    mocks.save.mockResolvedValueOnce("paper-light");
    render(createElement(ThemeSettings, { authorizedFetch: vi.fn() }));

    fireEvent.click(screen.getByRole("radio", { name: "Giấy Sáng" }));
    await waitFor(() =>
      expect(
        (screen.getByRole("radio", { name: "Giấy Sáng" }) as HTMLInputElement)
          .checked,
      ).toBe(true),
    );
  });

  it("shows the failure and keeps the current theme for the same account", async () => {
    mocks.save.mockRejectedValueOnce(new Error("network"));
    render(createElement(ThemeSettings, { authorizedFetch: vi.fn() }));

    fireEvent.click(screen.getByRole("radio", { name: "Giấy Sáng" }));
    expect(await screen.findByRole("alert")).toBeTruthy();
    expect(
      (
        screen.getByRole("radio", {
          name: "Kỳ Đài Cổ Phong",
        }) as HTMLInputElement
      ).checked,
    ).toBe(true);
  });
});
