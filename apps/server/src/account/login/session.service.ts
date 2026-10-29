import { Injectable } from "@nestjs/common";
import { createHash, randomBytes } from "node:crypto";
import {
  LoginError,
  type LoginStore,
  type SessionSeatPort,
  type SessionTokenVerifier,
  type VerifiedAccessToken,
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
/**
 * Dịch vụ quản lý phiên ứng dụng (app sessions):
 * Khởi tạo, kiểm tra tính hiệu lực, xác thực chéo với token của Auth Provider và thu hồi phiên.
 */
@Injectable()
export class SessionService {
  constructor(
    public readonly store: LoginStore,
    private readonly auth: SessionTokenVerifier,
    private readonly now = () => new Date(),
  ) {}
  private seats: SessionSeatPort | null = null;
  /** Gắn port ghế phòng khi game runtime khởi động. */
  attachSeats(seats: SessionSeatPort) {
    this.seats = seats;
  }
  /**
   * Cấp phiên làm việc mới cho người dùng sau khi đăng nhập thành công.
   */
  async issue(
    userId: string,
    remember = true,
    store = this.store,
    deviceToken: string | null = null,
  ) {
    if (!(await store.accountById(userId))?.active)
      throw new LoginError(
        "ACCOUNT_PENDING",
        "Tài khoản chưa xác minh hoặc chưa hoàn tất",
        403,
      );
    const createdAt = this.now();
    const deviceHash = deviceToken === null ? null : tokenHash(deviceToken);
    // A login from another device ends the seats held by the previous device (same device keeps them).
    const previous = await store.latestDeviceHash(userId);
    const appSession = randomBytes(32).toString("base64url");
    const expiresAt = new Date(
      createdAt.getTime() + (remember ? 30 * 24 : 12) * 3600000,
    );
    const replacement = {
      tokenHash: tokenHash(appSession),
      userId,
      createdAt,
      expiresAt,
      remember,
      revokedAt: null,
      deviceHash,
    };
    let displaced = false;
    if (previous !== undefined && previous !== deviceHash && this.seats)
      ({ displaced } = await this.seats.endSeats({
        userId,
        at: createdAt,
        confirmed: true,
        replacement,
      }));
    else await store.saveSession(replacement);
    return { appSession, expiresAt: expiresAt.toISOString(), displaced };
  }
  private async currentSession(sessionHash: string): Promise<ValidatedSession> {
    const session = await this.store.sessionByHash(sessionHash);
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
  /**
   * Kiểm tra phiên appSession còn hiệu lực và tài khoản đang hoạt động.
   */
  async requireValidSession(appSession: unknown) {
    const { userId, expiresAt, remember } = await this.currentSession(
      tokenHash(appSession),
    );
    return { userId, expiresAt, remember };
  }
  private async validateProviderUser(
    user: Session["user"],
    sessionHash: string,
    userId: string,
  ): Promise<ValidatedSession> {
    // Re-read after the provider: revocation, expiry and activation may change in flight.
    const current = await this.currentSession(sessionHash);
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
  /**
   * Xác thực kép: appSession hiện hành và JWT có chữ ký/hạn/issuer/audience đã kiểm.
   */
  async requireActiveSession(accessToken: unknown, appSession: unknown) {
    const sessionHash = tokenHash(appSession);
    let bearer: VerifiedAccessToken;
    try {
      if (typeof accessToken !== "string" || !accessToken)
        throw new LoginError("SESSION_INVALID", "Phiên đăng nhập không hợp lệ");
      bearer = await this.auth.verifyAccessToken(accessToken);
    } catch (error) {
      // Preserve session-expiry/revocation precedence even if JWT verification failed.
      await this.currentSession(sessionHash);
      throw error;
    }
    // Read after verification/key fetch so changes in flight cannot authorize stale sessions.
    const current = await this.currentSession(sessionHash);
    if (
      bearer.userId !== current.userId ||
      bearer.email.toLowerCase() !== current.email.toLowerCase()
    )
      throw new LoginError("SESSION_INVALID", "Phiên đăng nhập không hợp lệ");
    return current;
  }
  async requireActive(
    accessToken: unknown,
    appSession: unknown,
  ): Promise<string> {
    return (await this.requireActiveSession(accessToken, appSession)).userId;
  }
  /**
   * Làm mới access token của người dùng đồng thời đảm bảo session ứng dụng vẫn nhất quán.
   */
  async refresh(appSession: unknown, refresh: () => Promise<Session>) {
    const sessionHash = tokenHash(appSession);
    const initial = await this.currentSession(sessionHash);
    const session = await refresh();
    const actor = await this.validateProviderUser(
      session.user,
      sessionHash,
      initial.userId,
    );
    return { session, actor };
  }
  /**
   * Thu hồi phiên làm việc (đăng xuất) trong cơ sở dữ liệu.
   */
  async revoke(appSession: unknown) {
    await this.store.revokeSession(tokenHash(appSession), this.now());
  }
  /**
   * Đăng xuất: giữa ván online phải xác nhận đầu hàng; ghế và phiên được xử lý trong cùng giao dịch phòng.
   */
  async logout(
    appSession: unknown,
    session: ValidatedSession,
    confirmed: boolean,
  ) {
    if (!this.seats) return this.revoke(appSession);
    const seats = this.seats;
    const at = this.now();
    await this.store.withUsernameLock(session.username.toLowerCase(), () =>
      seats.endSeats({
        userId: session.userId,
        at,
        confirmed,
        sessionHash: tokenHash(appSession),
      }),
    );
  }
}
