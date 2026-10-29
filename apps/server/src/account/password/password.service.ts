import {
  createHash,
  createHmac,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from "node:crypto";
import { RegistrationError, type Session } from "../auth/registration.types.js";
import type { EmailSender } from "../email/email.types.js";
import { LoginError } from "../login/login.types.js";
import type { ValidatedSession } from "../login/session.service.js";
import { PasswordStore, type PasswordTx } from "./password.store.js";
import {
  invalidRecovery,
  PasswordError,
  recoveryUnavailable,
  type PasswordAccount,
  type PasswordProvider,
  type PasswordRecovery,
} from "./password.types.js";

const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");
const token = () => randomBytes(32).toString("base64url");
function capability(value: unknown): string {
  if (typeof value !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(value))
    throw invalidRecovery();
  return value;
}
function fields(body: unknown, keys: string[]): Record<string, unknown> {
  if (
    !body ||
    typeof body !== "object" ||
    Array.isArray(body) ||
    Object.keys(body).some((key) => !keys.includes(key))
  )
    throw new PasswordError("PASSWORD_INVALID_INPUT", "Dữ liệu không hợp lệ");
  return body as Record<string, unknown>;
}
function password(body: Record<string, unknown>): string {
  if (typeof body.newPassword !== "string" || body.newPassword.length < 8)
    throw new PasswordError(
      "PASSWORD_INVALID_INPUT",
      "Mật khẩu mới phải có ít nhất 8 ký tự",
    );
  if (body.passwordConfirmation !== body.newPassword)
    throw new PasswordError(
      "PASSWORD_INVALID_INPUT",
      "Xác nhận mật khẩu mới không khớp",
    );
  return body.newPassword;
}
function unavailable(): PasswordError {
  return new PasswordError(
    "PASSWORD_PROVIDER_ERROR",
    "Chưa thể hoàn tất thay đổi mật khẩu, vui lòng thử lại",
    503,
  );
}

export class PasswordService {
  constructor(
    private readonly store: PasswordStore,
    private readonly auth: PasswordProvider,
    private readonly mailer: EmailSender,
    private readonly secret: string,
    private readonly now = () => new Date(),
  ) {}

  async change(actor: ValidatedSession, appSession: unknown, input: unknown) {
    const body = fields(input, [
      "currentPassword",
      "newPassword",
      "passwordConfirmation",
    ]);
    const next = password(body);
    if (typeof body.currentPassword !== "string" || !body.currentPassword)
      throw new PasswordError(
        "PASSWORD_INVALID_INPUT",
        "Vui lòng nhập mật khẩu hiện tại",
      );
    const current = body.currentPassword;
    const appSessionToken = capability(appSession);
    const sessionHash = digest(appSessionToken);
    const changeHash = createHmac("sha256", this.secret)
      .update(JSON.stringify(["password-change", sessionHash, current, next]))
      .digest("hex");
    return this.store.withUser(actor.userId, async (tx) => {
      const pending = await tx.session(sessionHash, this.now());
      const account = await tx.account();
      if (!account?.active)
        throw new LoginError("SESSION_INVALID", "Phiên đăng nhập không hợp lệ");
      // A durable proof permits only the exact previously authorized operation to finish after an Auth outage.
      if (pending.passwordChangeHash !== changeHash) {
        let proof: Session;
        try {
          proof = await this.auth.signInPassword(
            account.credentialEmail,
            current,
          );
        } catch (error) {
          if (
            error instanceof RegistrationError &&
            error.code === "RECOVERY_PASSWORD_INVALID"
          )
            throw new PasswordError(
              "PASSWORD_CURRENT_INVALID",
              "Mật khẩu hiện tại không đúng",
            );
          throw unavailable();
        }
        this.validateProvider(account, proof);
      }
      await tx.prepareChange(sessionHash, changeHash, this.now());
      const recovered = await this.update(account, next);
      // Supabase password changes revoke provider refresh sessions: replace tokens, not the app session/deadline.
      let session: Session;
      try {
        session =
          recovered ??
          (await this.auth.signInPassword(account.credentialEmail, next));
        this.validateProvider(account, session);
      } catch {
        throw unavailable();
      }
      const kept = await tx.finishChange(sessionHash, this.now());
      return {
        session,
        appSession: appSessionToken,
        expiresAt: kept.expiresAt.toISOString(),
        remember: kept.remember,
      };
    });
  }

  async request(input: unknown) {
    const body = fields(input, ["username"]);
    if (
      typeof body.username !== "string" ||
      !/^[a-zA-Z0-9_]{3,20}$/.test(body.username)
    )
      throw new PasswordError(
        "PASSWORD_INVALID_INPUT",
        "Tên đăng nhập không hợp lệ",
      );
    const account = await this.store.accountByUsername(
      body.username.toLowerCase(),
    );
    if (!account?.active || !account.contactEmail) throw recoveryUnavailable();
    return this.issue(account.userId);
  }

  async resend(input: unknown) {
    const body = fields(input, ["requestId"]);
    const requestId = capability(body.requestId);
    return this.issue(await this.owner(requestId), requestId);
  }

  private async issue(userId: string, priorId?: string) {
    const requestId = priorId ?? token();
    const requestHash = digest(requestId);
    const issued = await this.store.withUser(userId, async (tx) => {
      if (priorId) await tx.recovery(requestHash, this.now(), false);
      const account = await tx.account();
      if (!account?.active || !account.contactEmail)
        throw recoveryUnavailable();
      const otp = randomInt(0, 1_000_000).toString().padStart(6, "0");
      const sentAt = this.now();
      const otpHash = this.otpDigest(
        userId,
        requestHash,
        account.contactEmail,
        sentAt,
        otp,
      );
      const window = await tx.challenge(
        requestHash,
        account.contactEmail,
        otpHash,
        sentAt,
      );
      return { ...window, target: account.contactEmail, otp, otpHash };
    });
    try {
      // SMTP runs outside actor/login locks so a slow mail server cannot block play or login.
      await this.mailer.sendOtp(issued.target, issued.otp);
    } catch {
      await this.store.withUser(userId, (tx) =>
        tx.discard(requestHash, issued.otpHash),
      );
      throw new PasswordError(
        "PASSWORD_PROVIDER_ERROR",
        "Không gửi được mã, vui lòng thử lại sau",
        503,
      );
    }
    return {
      requestId,
      expiresAt: issued.expiresAt,
      resendAt: issued.resendAt,
    };
  }

  async verify(input: unknown) {
    const body = fields(input, ["requestId", "otp"]);
    const requestId = capability(body.requestId);
    if (typeof body.otp !== "string" || !/^\d{6}$/.test(body.otp))
      throw new PasswordError("PASSWORD_OTP_INVALID", "Mã xác minh không đúng");
    const otp = body.otp;
    const userId = await this.owner(requestId);
    const requestHash = digest(requestId);
    const resetToken = token();
    const verified = await this.store.withUser(userId, (tx) =>
      tx.verify(requestHash, digest(resetToken), this.now(), (row) =>
        this.matchesOtp(row, otp),
      ),
    );
    if (!verified)
      throw new PasswordError("PASSWORD_OTP_INVALID", "Mã xác minh không đúng");
    return { resetToken };
  }

  async reset(input: unknown) {
    const body = fields(input, [
      "requestId",
      "resetToken",
      "newPassword",
      "passwordConfirmation",
    ]);
    const next = password(body);
    const requestId = capability(body.requestId);
    const resetToken = capability(body.resetToken);
    const userId = await this.owner(requestId);
    await this.store.withUser(userId, async (tx: PasswordTx) => {
      const account = await tx.account();
      if (!account?.active) throw invalidRecovery();
      await tx.consumeReset(digest(requestId), digest(resetToken), this.now());
      await this.update(account, next);
    });
    return { ok: true as const };
  }

  private async owner(requestId: string): Promise<string> {
    const userId = await this.store.recoveryOwner(digest(requestId));
    if (!userId) throw invalidRecovery();
    return userId;
  }

  private validateProvider(account: PasswordAccount, proof: Session): void {
    if (
      proof.user.id !== account.userId ||
      proof.user.email?.toLowerCase() !==
        account.credentialEmail.toLowerCase() ||
      !proof.user.email_confirmed_at ||
      proof.user.app_metadata?.registration_pending === true
    )
      throw unavailable();
  }

  private async update(
    account: PasswordAccount,
    next: string,
  ): Promise<Session | null> {
    try {
      await this.auth.setPassword(account.userId, next);
      return null;
    } catch {
      // Reconcile an ambiguous remote write using the intended credential, never by assuming rollback/success.
      try {
        const proof = await this.auth.signInPassword(
          account.credentialEmail,
          next,
        );
        this.validateProvider(account, proof);
        return proof;
      } catch {
        throw unavailable();
      }
    }
  }

  private otpDigest(
    userId: string,
    requestHash: string,
    email: string,
    sentAt: Date,
    otp: string,
  ) {
    return createHmac("sha256", this.secret)
      .update(
        `password-recovery\n${userId}\n${requestHash}\n${email}\n${sentAt.toISOString()}\n${otp}`,
      )
      .digest("hex");
  }

  private matchesOtp(row: PasswordRecovery, otp: string): boolean {
    if (!row.otpHash) return false;
    const expected = Buffer.from(
      this.otpDigest(
        row.userId,
        row.requestHash,
        row.contactEmail,
        row.sentAt,
        otp,
      ),
      "hex",
    );
    const actual = Buffer.from(row.otpHash, "hex");
    return (
      expected.length === actual.length && timingSafeEqual(expected, actual)
    );
  }
}
