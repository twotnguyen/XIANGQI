import { Injectable } from "@nestjs/common";
import { createHash, randomBytes } from "node:crypto";
import { LoginError, type LoginStore, type PasswordAuth } from "./contracts.js";
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
  async requireValidSession(appSession: unknown) {
    const session = await this.store.sessionByHash(tokenHash(appSession));
    if (
      !session ||
      session.revokedAt ||
      session.expiresAt.getTime() <= this.now().getTime()
    )
      throw new LoginError("SESSION_EXPIRED", "Phiên đăng nhập đã hết hạn");
    if (!(await this.store.accountById(session.userId))?.active)
      throw new LoginError(
        "ACCOUNT_PENDING",
        "Tài khoản chưa xác minh hoặc chưa hoàn tất",
        403,
      );
    return {
      userId: session.userId,
      expiresAt: session.expiresAt.toISOString(),
      remember: session.remember,
    };
  }
  async requireActive(
    accessToken: unknown,
    appSession: unknown,
  ): Promise<string> {
    const session = await this.requireValidSession(appSession);
    if (typeof accessToken !== "string" || !accessToken)
      throw new LoginError("SESSION_INVALID", "Phiên đăng nhập không hợp lệ");
    const user = await this.auth.getUser(accessToken);
    const account = await this.store.accountById(session.userId);
    if (
      user.id !== session.userId ||
      !user.email_confirmed_at ||
      user.app_metadata?.registration_pending === true ||
      !account?.active ||
      user.email?.toLowerCase() !== account.email.toLowerCase()
    )
      throw new LoginError("SESSION_INVALID", "Phiên đăng nhập không hợp lệ");
    await this.requireValidSession(appSession);
    return session.userId;
  }
  async revoke(appSession: unknown) {
    await this.store.revokeSession(tokenHash(appSession), this.now());
  }
}
