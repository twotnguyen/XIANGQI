import type { Session } from "../auth/registration.types.js";

export interface PasswordProvider {
  signInPassword(email: string, password: string): Promise<Session>;
  setPassword(userId: string, password: string): Promise<void>;
}

export interface PasswordAccount {
  userId: string;
  username: string;
  credentialEmail: string;
  contactEmail: string | null;
  active: boolean;
}

export interface PasswordRecovery {
  userId: string;
  requestHash: string;
  contactEmail: string;
  otpHash: string | null;
  sentAt: Date;
  expiresAt: Date;
  attempts: number;
  resetHash: string | null;
  consumedAt: Date | null;
}

export class PasswordError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 400,
  ) {
    super(message);
  }
}

export function invalidRecovery(): PasswordError {
  return new PasswordError(
    "PASSWORD_RECOVERY_INVALID",
    "Yêu cầu khôi phục không còn hiệu lực, vui lòng yêu cầu mã mới",
  );
}

export function recoveryUnavailable(): PasswordError {
  return new PasswordError(
    "PASSWORD_RECOVERY_UNAVAILABLE",
    "Tài khoản không có Gmail đã xác minh nên không thể khôi phục mật khẩu.",
  );
}
