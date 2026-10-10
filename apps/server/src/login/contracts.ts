import type { AuthProvider } from "../auth/contracts.js";
export type PasswordAuth = Pick<AuthProvider, "signInPassword" | "getUser">;
export interface LoginAccount {
  userId: string;
  email: string;
  username: string;
  active: boolean;
}
export type RegistrationPasswordAccount = Pick<
  LoginAccount,
  "userId" | "email" | "username"
>;
export interface AppSession {
  tokenHash: string;
  userId: string;
  createdAt: Date;
  expiresAt: Date;
  remember: boolean;
  revokedAt: Date | null;
}
export interface LoginAttempts {
  failures: Date[];
  blockedUntil: Date | null;
}
export interface LoginStore {
  withUsernameLock<T>(
    username: string,
    work: (store: LoginStore) => Promise<T>,
  ): Promise<T>;
  attempts(username: string): Promise<LoginAttempts>;
  saveAttempts(username: string, attempts: LoginAttempts): Promise<void>;
  resetAttempts(username: string): Promise<void>;
  accountByUsername(username: string): Promise<LoginAccount | null>;
  accountById(userId: string): Promise<LoginAccount | null>;
  saveSession(session: AppSession): Promise<void>;
  sessionByHash(hash: string): Promise<AppSession | null>;
  revokeSession(hash: string, time: Date): Promise<void>;
}
export class LoginError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 401,
  ) {
    super(message);
  }
}
export function invalidLogin(): LoginError {
  return new LoginError("LOGIN_INVALID", "Sai tên đăng nhập hoặc mật khẩu");
}
