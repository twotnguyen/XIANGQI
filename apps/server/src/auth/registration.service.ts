import { Injectable } from "@nestjs/common";
import { createHash, randomBytes } from "node:crypto";
import {
  RegistrationError,
  type Credentials,
  type AuthProvider,
  type RegistrationStore,
  type Draft,
  type Session,
} from "./contracts.js";
import { validateCredentials, validateUsername } from "./name-filter.js";

function hashToken(value: unknown): string {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(value))
    throw new RegistrationError(
      "REGISTRATION_INVALID",
      "Phiên đăng ký không hợp lệ, vui lòng bắt đầu lại",
      400,
      1,
    );
  return createHash("sha256").update(value).digest("hex");
}
function emailAddress(value: unknown): string {
  if (
    typeof value !== "string" ||
    value.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
  )
    throw new RegistrationError("EMAIL_INVALID", "Email không hợp lệ", 400, 2);
  return value.trim().toLowerCase();
}
function times(draft: Draft) {
  return {
    expiresAt: new Date(draft.lastSentAt.getTime() + 180000).toISOString(),
    resendAt: new Date(draft.lastSentAt.getTime() + 60000).toISOString(),
  };
}
@Injectable()
export class RegistrationService {
  constructor(
    public readonly store: RegistrationStore,
    public readonly auth: AuthProvider,
    public readonly now = () => new Date(),
    private readonly issueApplicationSession:
      | ((userId: string) => Promise<{ appSession: string; expiresAt: string }>)
      | null = null,
    private readonly authenticateRecovery:
      | ((
          account: { userId: string; email: string; username: string },
          password: string,
        ) => Promise<Session>)
      | null = null,
  ) {}
  async check(input: unknown) {
    const credentials = validateCredentials(input);
    if (await this.store.usernameTaken(credentials.username))
      throw new RegistrationError(
        "USERNAME_TAKEN",
        "Username đã có người dùng",
        409,
        1,
      );
    return { step: 2 };
  }
  async email(
    input: Credentials & { email: string; registrationToken?: string },
  ) {
    const credentials = validateCredentials(input);
    const address = emailAddress(input.email);
    return this.store.withLocks([`email:${address}`], async (store) => {
      if (await store.usernameTaken(credentials.username))
        throw new RegistrationError(
          "USERNAME_TAKEN",
          "Username đã có người dùng",
          409,
          1,
        );
      if (input.registrationToken) {
        const draft = await this.getDraft(input.registrationToken, store);
        const account = await store.accountById(draft.userId);
        if (
          draft.email !== address ||
          !account ||
          account.completedAt ||
          account.verified
        )
          throw new RegistrationError(
            "REGISTRATION_INVALID",
            "Phiên đăng ký không hợp lệ, vui lòng bắt đầu lại",
            400,
            1,
          );
        this.checkResend(draft);
        await this.auth.updatePendingPassword(
          draft.userId,
          credentials.password,
        );
        await this.auth.resend(address);
        draft.username = credentials.username;
        draft.lastSentAt = this.now();
        await store.saveDraft(draft);
        return { registrationToken: input.registrationToken, ...times(draft) };
      }
      const existing = await store.accountByEmail(address);
      if (existing) {
        // A failed signup can leave an Auth record before a capability was issued.
        if (
          existing.temporary &&
          !existing.hasDraft &&
          !existing.completedAt &&
          !existing.verified
        ) {
          await this.auth.deletePending(existing.userId);
          await store.removeIntent(address);
        } else
          throw new RegistrationError(
            "EMAIL_TAKEN",
            "Email này đã được đăng ký",
            409,
            2,
          );
      }
      const intentNonce = randomBytes(32).toString("base64url");
      await store.beginIntent(address, intentNonce, this.now());
      const userId = await this.auth.signup(
        address,
        credentials.password,
        intentNonce,
      );
      await store.bindIntent(address, userId);
      const token = randomBytes(32).toString("base64url");
      const draft: Draft = {
        tokenHash: hashToken(token),
        userId,
        email: address,
        username: credentials.username,
        createdAt: this.now(),
        lastSentAt: this.now(),
      };
      await store.saveDraft(draft);
      return { registrationToken: token, ...times(draft) };
    });
  }
  private async getDraft(token: unknown, store = this.store): Promise<Draft> {
    const draft = await store.draftByHash(hashToken(token));
    if (
      !draft ||
      this.now().getTime() - draft.createdAt.getTime() >= 65 * 60000
    )
      throw new RegistrationError(
        "REGISTRATION_EXPIRED",
        "Phiên đăng ký đã hết hạn, vui lòng bắt đầu lại",
        400,
        1,
      );
    return draft;
  }
  private checkResend(draft: Draft) {
    if (this.now().getTime() - draft.lastSentAt.getTime() < 60000)
      throw new RegistrationError(
        "RESEND_WAIT",
        "Vui lòng chờ đủ 60 giây trước khi gửi lại mã",
        429,
      );
  }
  async resend(input: { registrationToken: string }) {
    const initial = await this.getDraft(input.registrationToken);
    return this.store.withLocks([`email:${initial.email}`], async (store) => {
      const draft = await this.getDraft(input.registrationToken, store);
      const account = await store.accountById(draft.userId);
      if (!account || account.completedAt || account.verified)
        throw new RegistrationError(
          "REGISTRATION_INVALID",
          "Phiên đăng ký không hợp lệ, vui lòng bắt đầu lại",
          400,
          1,
        );
      this.checkResend(draft);
      await this.auth.resend(draft.email);
      await store.updateSentAt(draft.tokenHash, this.now());
      draft.lastSentAt = this.now();
      return times(draft);
    });
  }
  async verify(input: {
    registrationToken: string;
    otp: string;
    password?: string;
  }) {
    const initial = await this.getDraft(input.registrationToken);
    return this.store.withLocks(
      [`email:${initial.email}`, `username:${initial.username.toLowerCase()}`],
      async (store) => {
        const draft = await this.getDraft(input.registrationToken, store);
        if (draft.username !== initial.username)
          throw new RegistrationError(
            "REGISTRATION_CHANGED",
            "Thông tin đăng ký vừa thay đổi, vui lòng thử xác minh lại",
            409,
            3,
          );
        validateUsername(draft.username);
        const account = await store.accountById(draft.userId);
        if (!account)
          throw new RegistrationError(
            "REGISTRATION_INVALID",
            "Phiên đăng ký không hợp lệ, vui lòng bắt đầu lại",
            400,
            1,
          );
        if (await store.usernameTaken(draft.username, draft.userId))
          throw new RegistrationError(
            "USERNAME_TAKEN",
            "Username đã có người dùng",
            409,
            1,
          );
        if (
          !account.verified &&
          this.now().getTime() - draft.lastSentAt.getTime() >= 180000
        )
          throw new RegistrationError(
            "OTP_EXPIRED",
            "Mã xác minh đã hết hạn, vui lòng gửi mã mới",
          );
        if (
          !account.verified &&
          (typeof input.otp !== "string" || !/^\d{6}$/.test(input.otp))
        )
          throw new RegistrationError(
            "OTP_INVALID",
            "Mã xác minh cần 6 chữ số",
          );
        if (
          account.verified &&
          (typeof input.password !== "string" || input.password.length < 8)
        )
          throw new RegistrationError(
            "RECOVERY_PASSWORD_INVALID",
            "Vui lòng xác thực lại mật khẩu để hoàn tất đăng ký",
            401,
          );
        const session = account.verified
          ? await (this.authenticateRecovery
              ? this.authenticateRecovery(
                  {
                    userId: draft.userId,
                    email: draft.email,
                    username: draft.username,
                  },
                  input.password!,
                )
              : this.auth.signInPassword(draft.email, input.password!))
          : await this.auth.verify(draft.email, input.otp);
        if (
          session.user.id !== draft.userId ||
          !session.user.email_confirmed_at ||
          session.user.email?.toLowerCase() !== draft.email
        )
          throw new RegistrationError(
            "OTP_INVALID",
            "Mã xác minh không hợp lệ",
          );
        let applicationSession:
          { appSession: string; expiresAt: string } | undefined;
        try {
          await store.complete(draft.userId, draft.username, this.now());
          await this.auth.clearPending(draft.userId);
          await store.clearPending(draft.userId);
          applicationSession = await this.issueApplicationSession?.(
            draft.userId,
          );
          await store.removeDraft(draft.userId);
          await store.removeIntent(draft.email);
        } catch (error) {
          if (
            error instanceof RegistrationError &&
            error.code === "USERNAME_TAKEN"
          )
            throw error;
          throw new RegistrationError(
            "REGISTRATION_RECOVERING",
            "Đăng ký đang được phục hồi, vui lòng thử đăng nhập sau",
            503,
          );
        }
        return {
          access_token: session.access_token,
          refresh_token: session.refresh_token,
          expires_in: session.expires_in,
          ...(applicationSession
            ? {
                ...applicationSession,
                userId: draft.userId,
                username: draft.username,
              }
            : {}),
        };
      },
    );
  }
  async requireActive(accessToken: string) {
    const user = await this.auth.getUser(accessToken);
    const account = await this.store.accountById(user.id);
    if (
      !user.email_confirmed_at ||
      user.app_metadata?.registration_pending === true ||
      !account?.verified ||
      !account.completedAt ||
      account.pending ||
      user.email?.toLowerCase() !== account.email.toLowerCase()
    )
      throw new RegistrationError(
        "ACCOUNT_PENDING",
        "Tài khoản chưa xác minh hoặc chưa hoàn tất",
        403,
      );
    return user.id;
  }
  async maintain() {
    const candidates = await this.store.staleAccounts(
      new Date(this.now().getTime() - 60 * 60000),
    );
    const result = { recovered: 0, removed: 0 };
    for (const candidate of candidates) {
      try {
        await this.store.withLocks(
          [`email:${candidate.email.toLowerCase()}`],
          async (store) => {
            const current = await store.accountById(candidate.userId);
            if (!current) return;
            if (current.completedAt) {
              await this.auth.clearPending(current.userId);
              await store.clearPending(current.userId);
              await store.removeDraft(current.userId);
              await store.removeIntent(current.email.toLowerCase());
              result.recovered++;
            } else if (current.temporary) {
              // FK ON DELETE RESTRICT protects any concurrently completed profile.
              await this.auth.deletePending(current.userId);
              await store.removeDraft(current.userId);
              await store.removeIntent(current.email.toLowerCase());
              result.removed++;
            }
          },
        );
      } catch {
        /* Retry on the next maintenance tick; never compensate by deleting a completed account. */
      }
    }
    await this.store.removeEmptyIntents(
      new Date(this.now().getTime() - 65 * 60000),
    );
    return result;
  }
}
