import { Injectable } from "@nestjs/common";
import { createHash, randomBytes } from "node:crypto";
import {
  LoginError,
  type LoginStore,
  type PasswordAuth,
} from "./login.types.js";
import type { Session } from "../auth/registration.types.js";
export interface ValidatedSession {
  userId: string;
  username: string;
  email: string;
  expiresAt: string;
  remember: boolean;
}
function tokenHash(token: unknown): string {
  if (typeof token !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(token))
    throw new LoginError("SESSION_INVALID", "Phiên đăng nhập không hợp lệ");
  return createHash("sha256").update(token).digest("hex");
}
@Injectable()
export class SessionService {
  constructor(
    public readonly store: LoginStore,
    private readonly auth: PasswordAuth,
    private readonly now = () => new Date(),
  ) {}
  async issue(userId: string, remember = true, store = this.store) {
    if (!(await store.accountById(userId))?.active)
      throw new LoginError(
        "ACCOUNT_PENDING",
        "Tài khoản chưa xác minh hoặc chưa hoàn tất",
        403,
      );
    const appSession = randomBytes(32).toString("base64url");
    const createdAt = this.now();
    const expiresAt = new Date(
      createdAt.getTime() + (remember ? 30 * 24 : 12) * 3600000,
    );
    await store.saveSession({
      tokenHash: tokenHash(appSession),
      userId,
      createdAt,
      expiresAt,
      remember,
      revokedAt: null,
    });
    return { appSession, expiresAt: expiresAt.toISOString() };
  }
  private async currentSession(appSession: unknown): Promise<ValidatedSession> {
    const session = await this.store.sessionByHash(tokenHash(appSession));
    if (
      !session ||
      session.revokedAt ||
      session.expiresAt.getTime() <= this.now().getTime()
    )
      throw new LoginError("SESSION_EXPIRED", "Phiên đăng nhập đã hết hạn");
    if (!session.account?.active)
      throw new LoginError(
        "ACCOUNT_PENDING",
        "Tài khoản chưa xác minh hoặc chưa hoàn tất",
        403,
      );
    return {
      userId: session.userId,
      username: session.account.username,
      email: session.account.email,
      expiresAt: session.expiresAt.toISOString(),
      remember: session.remember,
    };
  }
  async requireValidSession(appSession: unknown) {
    const { userId, expiresAt, remember } =
      await this.currentSession(appSession);
    return { userId, expiresAt, remember };
  }
  private async validateProviderUser(
    user: Session["user"],
    appSession: unknown,
    userId: string,
  ): Promise<ValidatedSession> {
    // Re-read after the provider: revocation, expiry and activation may change in flight.
    const current = await this.currentSession(appSession);
    if (
      user.id !== userId ||
      user.id !== current.userId ||
      !user.email_confirmed_at ||
      user.app_metadata?.registration_pending === true ||
      user.email?.toLowerCase() !== current.email.toLowerCase()
    )
      throw new LoginError("SESSION_INVALID", "Phiên đăng nhập không hợp lệ");
    return current;
  }
  private async validateAccessToken(
    accessToken: unknown,
    appSession: unknown,
    userId: string,
  ): Promise<ValidatedSession> {
    if (typeof accessToken !== "string" || !accessToken)
      throw new LoginError("SESSION_INVALID", "Phiên đăng nhập không hợp lệ");
    const user = await this.auth.getUser(accessToken);
    return this.validateProviderUser(user, appSession, userId);
  }
  async requireActiveSession(accessToken: unknown, appSession: unknown) {
    const session = await this.currentSession(appSession);
    return this.validateAccessToken(accessToken, appSession, session.userId);
  }
  async requireActive(
    accessToken: unknown,
    appSession: unknown,
  ): Promise<string> {
    return (await this.requireActiveSession(accessToken, appSession)).userId;
  }
  async refresh(appSession: unknown, refresh: () => Promise<Session>) {
    const initial = await this.currentSession(appSession);
    const session = await refresh();
    const actor = await this.validateProviderUser(
      session.user,
      appSession,
      initial.userId,
    );
    return { session, actor };
  }
  async revoke(appSession: unknown) {
    await this.store.revokeSession(tokenHash(appSession), this.now());
  }
}
