import { createHmac, randomInt, timingSafeEqual } from "node:crypto";
import {
  ALIAS_DOMAIN,
  EmailError,
  RESEND_COOLDOWN_MS,
  type EmailAccountRow,
  type EmailSender,
  type EmailStatus,
} from "./email.types.js";
import type { EmailVerificationStore } from "./email.store.js";

/**
 * Dịch vụ thêm và xác minh email liên hệ cho tài khoản chỉ có username.
 * Email này không thay đổi credential đăng nhập của Auth.
 */
export class EmailVerificationService {
  constructor(
    private readonly store: EmailVerificationStore,
    private readonly mailer: EmailSender,
    private readonly secret: string,
  ) {}

  /** Trạng thái email hiện tại của người dùng. */
  async status(userId: string): Promise<EmailStatus> {
    return toStatus(await this.store.read(userId));
  }

  /** Gửi OTP tới email mới (đã chuẩn hóa, không được là email alias kỹ thuật). */
  async send(userId: string, body: unknown): Promise<EmailStatus> {
    await this.challenge(userId, parseEmail(field(body, "email")));
    return this.status(userId);
  }

  /** Gửi lại OTP tới email đang chờ xác minh. */
  async resend(userId: string): Promise<EmailStatus> {
    await this.challenge(userId, null);
    return this.status(userId);
  }

  /** Xác minh OTP; sai thì ném EMAIL_OTP_INVALID sau khi đã ghi số lần thử. */
  async verify(userId: string, body: unknown): Promise<EmailStatus> {
    const otp = field(body, "otp");
    if (typeof otp !== "string" || !/^\d{6}$/.test(otp))
      throw new EmailError("EMAIL_OTP_INVALID", "Mã xác minh không đúng", 400);
    const ok = await this.store.verify(userId, (row) =>
      this.matches(userId, row, otp),
    );
    if (!ok)
      throw new EmailError("EMAIL_OTP_INVALID", "Mã xác minh không đúng", 400);
    return this.status(userId);
  }

  private async challenge(userId: string, email: string | null): Promise<void> {
    const otp = randomInt(0, 1_000_000).toString().padStart(6, "0");
    const issued = await this.store.challenge(userId, {
      email,
      hash: (target, sentAt) => this.digest(userId, target, sentAt, otp),
    });
    try {
      await this.mailer.sendOtp(issued.target, otp);
    } catch (error) {
      // Gửi thất bại: bỏ challenge chưa giao được, cooldown vẫn giữ nguyên.
      await this.store.discardChallenge(userId, issued.otpHash);
      throw error;
    }
  }

  private digest(
    userId: string,
    email: string,
    sentAt: Date,
    otp: string,
  ): string {
    return createHmac("sha256", this.secret)
      .update(`${userId}\n${email}\n${sentAt.toISOString()}\n${otp}`)
      .digest("hex");
  }

  private matches(userId: string, row: EmailAccountRow, otp: string): boolean {
    if (!row.pendingEmail || !row.lastSentAt || !row.otpHash) return false;
    const expected = Buffer.from(
      this.digest(userId, row.pendingEmail, row.lastSentAt, otp),
      "hex",
    );
    const actual = Buffer.from(row.otpHash, "hex");
    return (
      actual.length === expected.length && timingSafeEqual(expected, actual)
    );
  }
}

/** Đọc một trường từ body không tin cậy mà không ép kiểu. */
function field(body: unknown, key: string): unknown {
  if (typeof body === "object" && body !== null && key in body)
    return Reflect.get(body, key);
  return undefined;
}

function parseEmail(value: unknown): string {
  if (typeof value !== "string")
    throw new EmailError("EMAIL_INVALID", "Email không hợp lệ", 400);
  const email = value.trim().toLowerCase();
  const domain = email.split("@")[1] ?? "";
  if (
    email.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    domain === ALIAS_DOMAIN ||
    domain.endsWith(`.${ALIAS_DOMAIN}`)
  )
    throw new EmailError("EMAIL_INVALID", "Email không hợp lệ", 400);
  return email;
}

function toStatus(row: EmailAccountRow): EmailStatus {
  if (!row.initialized) {
    // Tài khoản username-only thiếu marker là trạng thái lỗi, không được coi là đã xác minh.
    if (row.credentialEmail.endsWith(`@${ALIAS_DOMAIN}`))
      throw new EmailError(
        "EMAIL_NOT_INITIALIZED",
        "Tài khoản chưa sẵn sàng xác minh email",
        409,
      );
    // Tài khoản cũ dùng email Auth đã xác nhận làm email liên hệ.
    return {
      email: row.credentialEmail,
      emailVerified: row.confirmed,
      pendingEmail: null,
      expiresAt: null,
      resendAt: null,
    };
  }
  if (row.verifiedAt)
    return {
      email: row.contactEmail,
      emailVerified: true,
      pendingEmail: null,
      expiresAt: null,
      resendAt: null,
    };
  return {
    email: null,
    emailVerified: false,
    pendingEmail: row.pendingEmail,
    expiresAt:
      row.pendingEmail && row.expiresAt ? row.expiresAt.toISOString() : null,
    resendAt: row.lastSentAt
      ? new Date(row.lastSentAt.getTime() + RESEND_COOLDOWN_MS).toISOString()
      : null,
  };
}
