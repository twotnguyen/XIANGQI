import { containsForbiddenName } from "@xiangqi/shared";
import { RegistrationError, type Credentials } from "./contracts.js";
export { containsForbiddenName } from "@xiangqi/shared";
export function validateUsername(value: unknown): string {
  if (typeof value !== "string" || !/^[a-zA-Z0-9_]{3,20}$/.test(value)) {
    throw new RegistrationError(
      "USERNAME_INVALID",
      "Tên tài khoản cần 3–20 ký tự Latin không dấu, số hoặc gạch dưới",
      400,
      1,
    );
  }
  if (containsForbiddenName(value))
    throw new RegistrationError(
      "USERNAME_FORBIDDEN",
      "Tên tài khoản chứa từ không được phép",
      400,
      1,
    );
  return value;
}
export function validateCredentials(value: unknown): Credentials {
  if (!value || typeof value !== "object")
    throw new RegistrationError(
      "INPUT_INVALID",
      "Thông tin đăng ký không hợp lệ",
    );
  const input = value as Partial<Credentials>;
  const username = validateUsername(input.username);
  if (typeof input.password !== "string" || input.password.length < 8)
    throw new RegistrationError(
      "PASSWORD_INVALID",
      "Mật khẩu cần tối thiểu 8 ký tự",
      400,
      1,
    );
  if (input.password !== input.passwordConfirmation)
    throw new RegistrationError(
      "PASSWORD_MISMATCH",
      "Mật khẩu xác nhận không khớp",
      400,
      1,
    );
  return {
    username,
    password: input.password,
    passwordConfirmation: input.passwordConfirmation,
  };
}
