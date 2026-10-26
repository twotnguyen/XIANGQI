import { Injectable } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import { performance } from "node:perf_hooks";
import { setTimeout } from "node:timers/promises";
import { RegistrationError, type Session } from "../auth/registration.types.js";
import {
  invalidLogin,
  LoginError,
  type LoginStore,
  type PasswordAuth,
  type RegistrationPasswordAccount,
} from "./login.types.js";
import { SessionService } from "./session.service.js";
const RESPONSE_FLOOR_MS = 250;
const PASSWORD_TIMEOUT_MS = 2000;
const INVALID_RESPONSE_FLOOR_MS = 2150;
function locked() {
  return new LoginError(
    "LOGIN_LOCKED",
    "Bạn đã thử quá nhiều lần, vui lòng thử lại sau 15 phút",
    429,
  );
}
function unavailable() {
  return new LoginError(
    "LOGIN_UNAVAILABLE",
    "Dịch vụ đăng nhập chưa thể xử lý yêu cầu",
    503,
  );
}
/**
 * Dịch vụ xử lý nghiệp vụ đăng nhập:
 * Kiểm soát số lần thử sai chống brute-force, làm trễ phản hồi (timing attack mitigation)
 * và phối hợp giữa Supabase Auth cùng session lưu tại Postgres.
 */
@Injectable()
export class LoginService {
  constructor(
    public readonly store: LoginStore,
    private readonly auth: PasswordAuth,
    private readonly sessions: SessionService,
    private readonly now = () => new Date(),
    private readonly invalidFloorMs = process.env.LOGIN_RESPONSE_FLOOR_MS !==
    undefined
      ? Number(process.env.LOGIN_RESPONSE_FLOOR_MS)
      : INVALID_RESPONSE_FLOOR_MS,
  ) {}
  private async withResponseFloor<T>(work: () => Promise<T>): Promise<T> {
    const started = performance.now();
    let floor = RESPONSE_FLOOR_MS;
    try {
      return await work();
    } catch (error) {
      if (
        error instanceof LoginError &&
        ["LOGIN_INVALID", "LOGIN_UNAVAILABLE", "LOGIN_LOCKED"].includes(
          error.code,
        )
      )
        floor = this.invalidFloorMs;
      throw error;
    } finally {
      await setTimeout(Math.max(0, floor - (performance.now() - started)));
    }
  }
  /**
   * Thực hiện quy trình đăng nhập tài khoản với thời gian phản hồi sàn an toàn.
   */
  async login(input: unknown) {
    return this.withResponseFloor(() => this.authenticate(input));
  }
  /**
   * Xác thực tài khoản với mật khẩu trong luồng khôi phục / hoàn tất đăng ký.
   */
  async authenticateRegistration(
    account: RegistrationPasswordAccount,
    password: string,
  ): Promise<Session> {
    return this.withResponseFloor(async () => {
      if (
        !/^[A-Za-z0-9_]{3,20}$/.test(account.username) ||
        typeof password !== "string" ||
        !password
      )
        throw invalidLogin();
      const key = account.username.toLowerCase();
      return this.store.withUsernameLock(key, async (store) => {
        const provider = await this.withResponseFloor(() =>
          this.passwordAttempt(key, account, password, store, true),
        );
        await store.resetAttempts(key);
        return provider;
      });
    });
  }
  private async authenticate(input: unknown) {
    if (!input || typeof input !== "object") throw invalidLogin();
    const {
      username,
      password,
      remember = true,
    } = input as Record<string, unknown>;
    if (
      typeof username !== "string" ||
      !/^[A-Za-z0-9_]{3,20}$/.test(username) ||
      typeof password !== "string" ||
      !password ||
      typeof remember !== "boolean"
    )
      throw invalidLogin();
    const key = username.toLowerCase();
    return this.store.withUsernameLock(key, async (store) => {
      const account = await store.accountByUsername(key);
      const provider = await this.withResponseFloor(() =>
        this.passwordAttempt(
          key,
          account?.active ? account : null,
          password,
          store,
        ),
      );
      if (!account) throw unavailable();
      const session = await this.sessions.issue(
        account.userId,
        remember,
        store,
      );
      await store.resetAttempts(key);
      return {
        access_token: provider.access_token,
        refresh_token: provider.refresh_token,
        expires_in: provider.expires_in,
        userId: account.userId,
        username: account.username,
        ...session,
      };
    });
  }
  private async passwordAttempt(
    key: string,
    account: RegistrationPasswordAccount | null,
    password: string,
    store: LoginStore,
    allowPending = false,
  ): Promise<Session> {
    const attempts = await store.attempts(key);
    if (
      attempts.blockedUntil &&
      attempts.blockedUntil.getTime() > this.now().getTime()
    )
      throw locked();
    const fail = async (): Promise<never> => {
      const failedAt = this.now();
      const failures = attempts.failures.filter(
        (item) => item.getTime() > failedAt.getTime() - 15 * 60000,
      );
      failures.push(failedAt);
      const blockedUntil =
        failures.length >= 5 ? new Date(failedAt.getTime() + 15 * 60000) : null;
      await store.saveAttempts(key, { failures, blockedUntil });
      throw blockedUntil ? locked() : invalidLogin();
    };
    let provider;
    try {
      const email = account?.email ?? `${randomUUID()}@example.invalid`;
      const deadline = AbortSignal.timeout(PASSWORD_TIMEOUT_MS);
      provider = await Promise.race([
        this.auth.signInPassword(email, password, deadline),
        new Promise<never>((_resolve, reject) => {
          deadline.addEventListener("abort", () => reject(unavailable()), {
            once: true,
          });
        }),
      ]);
    } catch (error) {
      if (
        error instanceof RegistrationError &&
        error.code === "RECOVERY_PASSWORD_INVALID"
      )
        return fail();
      throw unavailable();
    }
    if (!account) return fail();
    if (
      provider.user.id !== account.userId ||
      !provider.user.email_confirmed_at ||
      (!allowPending &&
        provider.user.app_metadata?.registration_pending === true) ||
      provider.user.email?.toLowerCase() !== account.email.toLowerCase()
    )
      throw unavailable();
    return provider;
  }
}
