import { expect, it } from "vitest";
import {
  isValidDisplayName,
  normalizeDisplayName,
  passwordValidationMessage,
} from "@shared/auth-validation.js";

it("normalizes Vietnamese names and repeated spaces without accepting control characters", () => {
  expect(normalizeDisplayName("  Ky\u0300   Hữu  ")).toBe("Kỳ Hữu");
  for (const name of ["Kỳ Hữu", "O'Brien", "A.B", "Tên-1_2"])
    expect(isValidDisplayName(name)).toBe(true);
  for (const name of ["Tên 🐉", "Tên@bạn", "\nTên", "Tên\tBạn", "địt mẹ"])
    expect(isValidDisplayName(normalizeDisplayName(name))).toBe(false);
  expect(isValidDisplayName("a")).toBe(false);
  expect(isValidDisplayName("a".repeat(30))).toBe(true);
  expect(isValidDisplayName("a".repeat(31))).toBe(false);
  expect(isValidDisplayName("a".repeat(21), 20)).toBe(false);
});

it("counts new passwords as UTF-8 bytes without trimming", () => {
  expect(passwordValidationMessage("🐉".repeat(18))).toBe("");
  expect(passwordValidationMessage("🐉".repeat(19))).toBe(
    "Mật khẩu tối đa 72 byte (chữ có dấu tính nhiều byte)",
  );
  // "ế" (NFC) là 1 ký tự nhưng 3 byte: 24 chữ vừa đủ 72 byte, 25 chữ vượt.
  expect(passwordValidationMessage("ế".repeat(24))).toBe("");
  expect(passwordValidationMessage("ế".repeat(25))).not.toBe("");
  expect(passwordValidationMessage("a".repeat(72))).toBe("");
  expect(passwordValidationMessage("a".repeat(73))).not.toBe("");
  expect(passwordValidationMessage(" ".repeat(8))).toBe("");
  expect(passwordValidationMessage("a".repeat(7))).not.toBe("");
});
