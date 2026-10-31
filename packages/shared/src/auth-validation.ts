import { containsForbiddenName } from "./auth-filter.js";

export function normalizeDisplayName(value: string): string {
  return value.normalize("NFC").replace(/ +/g, " ").replace(/^ | $/g, "");
}

export function isValidDisplayName(value: string, maxLength = 30): boolean {
  const name = normalizeDisplayName(value);
  const length = Array.from(name).length;
  return (
    length >= 2 &&
    length <= maxLength &&
    /^[\p{L}\p{M}\p{N} ._'-]+$/u.test(name) &&
    !containsForbiddenName(name)
  );
}

/** Tối thiểu tính theo ký tự; tối đa 72 byte UTF-8 vì bcrypt chỉ đọc 72 byte đầu. */
export function passwordValidationMessage(password: string): string {
  if (Array.from(password).length < 8) return "Mật khẩu cần tối thiểu 8 ký tự";
  if (new TextEncoder().encode(password).length > 72)
    return "Mật khẩu tối đa 72 byte (chữ có dấu tính nhiều byte)";
  return "";
}
