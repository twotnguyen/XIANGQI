import {
  createHash,
  createHmac,
  randomBytes,
  randomInt,
  timingSafeEqual,
} from "node:crypto";
import { validateUsername } from "../auth/registration.service.js";
import type { EmailSender } from "../email/email.types.js";
import { UsernameStore, type Issued } from "./username.store.js";
import {
  UsernameError,
  type UsernameChallenge,
  type UsernamePurpose,
} from "./username.types.js";

export interface UsernameSent {
  requestId: string;
  expiresAt: string;
  resendAt: string;
}
export interface UsernameChangeSent extends UsernameSent {
  maskedEmail: string;
}
export interface UsernameResult {
  username: string;
}
export interface UsernameCapability {
  changeToken: string;
  expiresAt: string;
}

const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,253}$/;
const OTP = /^[0-9]{6}$/;
const REQUEST_ID = /^[A-Za-z0-9_-]{43}$/;
const CHANGE_CAPABILITY_MS = 10 * 60_000;

function invalid(message: string): UsernameError {
  return new UsernameError("USERNAME_INVALID_INPUT", message);
}

function requestInvalid(): UsernameError {
  return new UsernameError(
    "USERNAME_REQUEST_INVALID",
    "Yêu cầu xác minh không hợp lệ",
  );
}

function requireString(value: unknown, message: string): string {
  if (typeof value !== "string") throw invalid(message);
  return value;
}

/**
 * OTP username đổi/khôi phục: HMAC có purpose tag riêng, gắn request và thời điểm gửi,
 * nên mã cũ không dùng được cho purpose khác hay request khác. Email chỉ là đầu vào, không lưu plain.
 */
export class UsernameService {
  constructor(
    private readonly store: UsernameStore,
    private readonly mailer: EmailSender,
    private readonly secret: string,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async changeRequest(userId: string): Promise<UsernameChangeSent> {
    const now = this.now();
    const requestId = randomBytes(32).toString("base64url");
    const issued = await this.issue(userId, "username-change", {
      requestHash: digest(requestId),
      priorHash: null,
      sentAt: now,
      otp: newOtp(),
    });
    return {
      requestId,
      expiresAt: issued.expiresAt.toISOString(),
      resendAt: new Date(issued.expiresAt.getTime() - 120_000).toISOString(),
      maskedEmail: issued.contactEmail.replace(/^(.).*(@.*)$/, "$1***$2"),
    };
  }

  async changeResend(
    userId: string,
    input: { requestId?: unknown },
  ): Promise<UsernameSent> {
    const requestId = this.capability(input.requestId);
    const row = await this.challenge(requestId, "username-change", userId);
    if (row.verifiedHash) throw requestInvalid();
    const otp = newOtp();
    const issued = await this.issue(userId, "username-change", {
      requestHash: row.requestHash,
      priorHash: row.requestHash,
      sentAt: this.now(),
      otp,
    });
    return {
      requestId,
      expiresAt: issued.expiresAt.toISOString(),
      resendAt: new Date(issued.expiresAt.getTime() - 120_000).toISOString(),
    };
  }

  /** OTP đúng cấp capability có phạm vi đổi tên; chưa đổi username, OTP bị vô hiệu. */
  async changeVerify(
    userId: string,
    input: { requestId?: unknown; otp?: unknown },
  ): Promise<UsernameCapability> {
    const requestHash = digest(this.capability(input.requestId));
    const otp = this.otpInput(input.otp);
    const now = this.now();
    const changeToken = randomBytes(32).toString("base64url");
    const expiresAt = new Date(now.getTime() + CHANGE_CAPABILITY_MS);
    const verified = await this.store.verifyChange(
      userId,
      requestHash,
      (row) => this.matches("username-change", userId, requestHash, row, otp),
      now,
      digest(changeToken),
      expiresAt,
    );
    if (!verified) throw invalidOtp();
    return { changeToken, expiresAt: expiresAt.toISOString() };
  }

  /** Chốt tên mới bằng capability; trùng tên không tiêu thụ capability nên người dùng sửa tên không cần OTP mới. */
  async changeFinalize(
    userId: string,
    input: { changeToken?: unknown; username?: unknown },
  ): Promise<UsernameResult> {
    const changeToken = this.capability(input.changeToken);
    const username = validateUsername(input.username);
    const result = await this.store.finalizeChange(
      userId,
      digest(changeToken),
      username,
      this.now(),
    );
    if (result.kind !== "ok") throw requestInvalid();
    return { username: result.username };
  }

  /**
   * Khôi phục không biết userId trước: response luôn cùng hình dạng, email lạ/chưa xác minh không gửi
   * và trả requestId ngẫu nhiên. Chỉ OTP đúng mới lộ username; không tạo session, không đổi mật khẩu.
   */
  async recoveryRequest(input: { email?: unknown }): Promise<UsernameSent> {
    const email = requireString(input.email, "Email không hợp lệ")
      .trim()
      .toLowerCase();
    if (!EMAIL.test(email)) throw invalid("Email không hợp lệ");
    const now = this.now();
    const requestId = randomBytes(32).toString("base64url");
    const account = await this.store.accountByContactEmail(email);
    if (account)
      await this.quietRecoveryIssue(account.userId, {
        requestHash: digest(requestId),
        priorHash: null,
        sentAt: now,
        otp: newOtp(),
      });
    return generic(requestId, now);
  }

  async recoveryResend(input: { requestId?: unknown }): Promise<UsernameSent> {
    const requestId = this.capability(input.requestId);
    const requestHash = digest(requestId);
    const now = this.now();
    const row = await this.store.challengeByRequest(requestHash);
    if (row?.purpose === "username-recovery")
      await this.quietRecoveryIssue(row.userId, {
        requestHash,
        priorHash: requestHash,
        sentAt: now,
        otp: newOtp(),
      });
    return generic(requestId, now);
  }

  async recoveryVerify(input: {
    requestId?: unknown;
    otp?: unknown;
  }): Promise<UsernameResult> {
    const requestHash = digest(this.capability(input.requestId));
    const otp = this.otpInput(input.otp);
    const row = await this.store.challengeByRequest(requestHash);
    if (!row || row.purpose !== "username-recovery") throw invalidOtp();
    const result = await this.store.consumeRecovery(
      row.userId,
      requestHash,
      (challenge) =>
        this.matches(
          "username-recovery",
          row.userId,
          requestHash,
          challenge,
          otp,
        ),
      this.now(),
    );
    if (result.kind !== "ok") throw invalidOtp();
    return { username: result.username };
  }

  /**
   * Khôi phục công khai: rate limit, email không đủ điều kiện hoặc lỗi SMTP chỉ ghi nội bộ (không log email/OTP)
   * để phản hồi luôn generic, không lộ tài khoản tồn tại.
   */
  private async quietRecoveryIssue(
    userId: string,
    input: {
      requestHash: string;
      priorHash: string | null;
      sentAt: Date;
      otp: string;
    },
  ): Promise<void> {
    try {
      await this.issue(userId, "username-recovery", input);
    } catch (error) {
      if (
        error instanceof UsernameError &&
        [
          "USERNAME_RATE_LIMITED",
          "USERNAME_PROVIDER_ERROR",
          "USERNAME_EMAIL_REQUIRED",
        ].includes(error.code)
      )
        return;
      throw error;
    }
  }

  private async issue(
    userId: string,
    purpose: UsernamePurpose,
    input: {
      requestHash: string;
      priorHash: string | null;
      sentAt: Date;
      otp: string;
    },
  ): Promise<Extract<Issued, { kind: "ok" }>> {
    const issued = await this.store.issue(userId, purpose, {
      requestHash: input.requestHash,
      priorHash: input.priorHash,
      sentAt: input.sentAt,
      otpHash: (contactEmail) =>
        this.otpDigest(
          purpose,
          userId,
          input.requestHash,
          contactEmail,
          input.sentAt,
          input.otp,
        ),
    });
    if (issued.kind !== "ok")
      throw new UsernameError(
        "USERNAME_EMAIL_REQUIRED",
        "Cần email đã xác minh để đổi tên đăng nhập",
        409,
      );
    try {
      await this.mailer.sendOtp(issued.contactEmail, input.otp);
    } catch {
      await this.store.discard(
        userId,
        purpose,
        input.requestHash,
        issued.otpHash,
      );
      throw new UsernameError(
        "USERNAME_PROVIDER_ERROR",
        "Không gửi được mã, vui lòng thử lại sau",
        503,
      );
    }
    return issued;
  }

  private async challenge(
    requestId: unknown,
    purpose: UsernamePurpose,
    userId: string,
  ): Promise<UsernameChallenge> {
    const row = await this.store.challengeByRequest(
      digest(this.capability(requestId)),
    );
    if (!row || row.userId !== userId || row.purpose !== purpose)
      throw requestInvalid();
    return row;
  }

  private matches(
    purpose: UsernamePurpose,
    userId: string,
    requestHash: string,
    row: UsernameChallenge,
    otp: string,
  ): boolean {
    if (!row.otpHash) return false;
    const expected = Buffer.from(row.otpHash, "hex");
    const actual = Buffer.from(
      this.otpDigest(
        purpose,
        userId,
        requestHash,
        row.contactEmail,
        row.sentAt,
        otp,
      ),
      "hex",
    );
    return (
      expected.length === actual.length && timingSafeEqual(expected, actual)
    );
  }

  private otpDigest(
    purpose: UsernamePurpose,
    userId: string,
    requestHash: string,
    contactEmail: string,
    sentAt: Date,
    otp: string,
  ): string {
    return createHmac("sha256", this.secret)
      .update(
        `${purpose}\n${userId}\n${requestHash}\n${contactEmail}\n${sentAt.toISOString()}\n${otp}`,
      )
      .digest("hex");
  }

  private capability(value: unknown): string {
    if (typeof value !== "string" || !REQUEST_ID.test(value))
      throw requestInvalid();
    return value;
  }

  private otpInput(value: unknown): string {
    if (typeof value !== "string" || !OTP.test(value))
      throw new UsernameError(
        "USERNAME_OTP_INVALID",
        "Mã xác minh không đúng",
        400,
      );
    return value;
  }
}

function digest(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function newOtp(): string {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

function invalidOtp(): UsernameError {
  return new UsernameError(
    "USERNAME_OTP_INVALID",
    "Mã xác minh không đúng",
    400,
  );
}

function generic(requestId: string, now: Date): UsernameSent {
  return {
    requestId,
    expiresAt: new Date(now.getTime() + 180_000).toISOString(),
    resendAt: new Date(now.getTime() + 60_000).toISOString(),
  };
}
