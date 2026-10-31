import { expect, it } from "vitest";
import { validateCredentials } from "@server/account/auth/registration.service.js";

it("applies the Unicode password boundary to new registration credentials without trimming", () => {
  const password = "🐉".repeat(18);
  expect(
    validateCredentials({
      username: "player",
      password,
      passwordConfirmation: password,
    }).password,
  ).toBe(password);
  expect(() =>
    validateCredentials({
      username: "player",
      password: "🐉".repeat(19),
      passwordConfirmation: "🐉".repeat(19),
    }),
  ).toThrow("Mật khẩu tối đa 72 byte (chữ có dấu tính nhiều byte)");
  expect(() =>
    validateCredentials({
      username: "player",
      password: "🐉".repeat(7),
      passwordConfirmation: "🐉".repeat(7),
    }),
  ).toThrow("Mật khẩu cần tối thiểu 8 ký tự");
  expect(
    validateCredentials({
      username: "player",
      password: " ".repeat(8),
      passwordConfirmation: " ".repeat(8),
    }).password,
  ).toBe(" ".repeat(8));
});
