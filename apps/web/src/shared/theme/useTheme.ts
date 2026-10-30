import { useSyncExternalStore } from "react";
import { DEFAULT_THEME, type ThemeChoice } from "@xiangqi/shared";
import { applyTheme } from "./theme.js";

/*
 * Chủ đề đang áp dụng trên thiết bị. Nguồn đúng là tài khoản trên server; module này
 * chỉ giữ giá trị đã được server xác nhận (hoặc mặc định khi khách/đăng xuất). Không dùng localStorage.
 */
let applied: ThemeChoice = DEFAULT_THEME;
let writes = 0;
const listeners = new Set<() => void>();
const darkQuery =
  typeof window !== "undefined" && typeof window.matchMedia === "function"
    ? window.matchMedia("(prefers-color-scheme: dark)")
    : null;

function render() {
  applyTheme(
    applied,
    document.documentElement.dataset,
    darkQuery?.matches ?? false,
  );
}

darkQuery?.addEventListener?.("change", () => {
  if (applied === "system") render();
});

/**
 * Đặt chủ đề đang áp dụng và cập nhật thẻ html; chỉ gọi sau khi server xác nhận.
 */
export function setAppliedTheme(choice: ThemeChoice) {
  applied = choice;
  writes += 1;
  render();
  listeners.forEach((listener) => listener());
}

export function currentAppliedTheme(): ThemeChoice {
  return applied;
}

/** Số lần ghi local; đọc trước và sau một request để biết kết quả có bị ghi đè không. */
export function appliedThemeWrites(): number {
  return writes;
}

let accountScope = 0;

/**
 * Gọi khi người dùng đổi (hoặc đăng xuất/khách). Kết quả lưu của phạm vi cũ bị bỏ qua.
 */
export function beginAccountScope() {
  accountScope += 1;
  listeners.forEach((listener) => listener());
}

export function currentAccountScope(): number {
  return accountScope;
}

export function useAccountScope(): number {
  return useSyncExternalStore(
    subscribe,
    () => accountScope,
    () => 0,
  );
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/**
 * Hook trả về chủ đề đang áp dụng trên thiết bị.
 */
export function useAppliedTheme(): ThemeChoice {
  return useSyncExternalStore(
    subscribe,
    () => applied,
    () => DEFAULT_THEME,
  );
}
