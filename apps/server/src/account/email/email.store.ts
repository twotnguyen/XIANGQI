import type { Pool, PoolClient } from "pg";
import { actorLock, transaction } from "../../core/postgres.js";
import { reserveOtpSend, OTP_LIMIT_MESSAGE } from "../auth/otp.store.js";
import {
  ALIAS_DOMAIN,
  EmailError,
  OTP_MAX_ATTEMPTS,
  OTP_TTL_MS,
  RESEND_COOLDOWN_MS,
  type EmailAccountRow,
} from "./email.types.js";

interface Row {
  id: string;
  email: string | null;
  confirmed: boolean;
  initialized: boolean;
  contact: string | null;
  verified_at: Date | null;
  pending_email: string | null;
  otp_hash: string | null;
  last_sent_at: Date | null;
  expires_at: Date | null;
  attempts: number;
}

/** Hàm băm OTP gắn với người dùng, email đang chờ và thời điểm gửi. */
export type OtpHash = (email: string, sentAt: Date) => string;

/**
 * Kho dữ liệu xác minh email cho tài khoản chỉ có username.
 * Mọi thay đổi chạy trong transaction có actorLock theo userId.
 */
export class EmailVerificationStore {
  constructor(private readonly pool: Pool) {}

  /** Đánh dấu tài khoản username-only vừa tạo: credential kỹ thuật đã xác nhận và origin hợp lệ. */
  async createUsernameAccount(userId: string): Promise<void> {
    await transaction(this.pool, async (client) => {
      await actorLock(client, userId);
      const result = await client.query(
        `INSERT INTO xiangqi_auth.username_accounts(user_id)
         SELECT u.id FROM xiangqi_auth.accounts u
           JOIN xiangqi_auth.account_origins o ON o.user_id=u.id
         WHERE u.id=$1 AND u.email_confirmed_at IS NOT NULL
           AND lower(u.email)=u.id::text||'@username.xiangqi.invalid'
           AND o.email_key=lower(u.email) AND o.method='email'`,
        [userId],
      );
      if (result.rowCount !== 1)
        throw new EmailError(
          "EMAIL_NOT_INITIALIZED",
          "Tài khoản chưa sẵn sàng xác minh email",
          409,
        );
    });
  }

  /** Đọc trạng thái email của người dùng (chỉ đọc, không khóa). */
  async read(userId: string): Promise<EmailAccountRow> {
    return transaction(this.pool, (client) => readRow(client, userId));
  }

  /**
   * Ghi challenge trong transaction ngắn; không giữ actorLock khi gửi mail.
   * Trả target và otpHash để service gửi OTP bên ngoài transaction.
   */
  async challenge(
    userId: string,
    input: {
      email: string | null;
      hash: (target: string, sentAt: Date) => string;
    },
  ): Promise<{ target: string; otpHash: string }> {
    return transaction(this.pool, async (client) => {
      await actorLock(client, userId);
      const row = await readRow(client, userId);
      const now = new Date();
      if (!row.initialized)
        throw new EmailError(
          "EMAIL_NOT_INITIALIZED",
          "Tài khoản chưa sẵn sàng xác minh email",
          409,
        );
      if (row.verifiedAt)
        throw new EmailError(
          "EMAIL_ALREADY_VERIFIED",
          "Email đã được xác minh",
          409,
        );
      // Cooldown applies even when the undelivered challenge was cleared after SMTP failure.
      if (
        row.lastSentAt &&
        now.getTime() - row.lastSentAt.getTime() < RESEND_COOLDOWN_MS
      )
        throw new EmailError(
          "EMAIL_RESEND_LIMITED",
          "Vui lòng đợi trước khi gửi lại mã",
          429,
        );
      const target = input.email ?? row.pendingEmail;
      if (!target)
        throw new EmailError(
          "EMAIL_NOT_PENDING",
          "Chưa có email nào đang chờ xác minh",
          409,
        );
      const taken = await client.query(
        "SELECT 1 FROM xiangqi_auth.account_origins WHERE email_key=$1 AND user_id<>$2",
        [target, userId],
      );
      if (taken.rowCount)
        throw new EmailError("EMAIL_TAKEN", "Email này đã được sử dụng", 409);
      const otpHash = input.hash(target, now);
      if (!(await reserveOtpSend(client, userId, target, now)))
        throw new EmailError("EMAIL_OTP_LIMITED", OTP_LIMIT_MESSAGE, 429);
      await client.query(
        `UPDATE xiangqi_auth.username_accounts
           SET pending_email=$2, otp_hash=$3, last_sent_at=$4, expires_at=$5, attempts=0
         WHERE user_id=$1`,
        [userId, target, otpHash, now, new Date(now.getTime() + OTP_TTL_MS)],
      );
      return { target, otpHash };
    });
  }

  /**
   * Hủy challenge chưa gửi được. Chỉ xóa khi đúng challenge đó và chưa verify;
   * giữ last_sent_at để cooldown không bị bỏ qua.
   */
  async discardChallenge(userId: string, otpHash: string): Promise<void> {
    await transaction(this.pool, async (client) => {
      await actorLock(client, userId);
      await client.query(
        `UPDATE xiangqi_auth.username_accounts
           SET pending_email=NULL, otp_hash=NULL, expires_at=NULL, attempts=0
         WHERE user_id=$1 AND otp_hash=$2 AND verified_at IS NULL`,
        [userId, otpHash],
      );
    });
  }

  /**
   * Kiểm tra OTP. Trả false khi sai (đã tăng số lần thử và commit).
   * Trả true khi đúng: lưu email đã xác minh và nâng origin khóa kỹ thuật.
   */
  async verify(
    userId: string,
    matches: (row: EmailAccountRow) => boolean,
  ): Promise<boolean> {
    return transaction(this.pool, async (client) => {
      await actorLock(client, userId);
      const row = await readRow(client, userId);
      const now = new Date();
      if (!row.initialized)
        throw new EmailError(
          "EMAIL_NOT_INITIALIZED",
          "Tài khoản chưa sẵn sàng xác minh email",
          409,
        );
      if (row.verifiedAt)
        throw new EmailError(
          "EMAIL_ALREADY_VERIFIED",
          "Email đã được xác minh",
          409,
        );
      if (!row.pendingEmail)
        throw new EmailError(
          "EMAIL_NOT_PENDING",
          "Chưa có email nào đang chờ xác minh",
          409,
        );
      if (!row.expiresAt || row.expiresAt.getTime() <= now.getTime())
        throw new EmailError(
          "EMAIL_OTP_EXPIRED",
          "Mã xác minh đã hết hạn",
          410,
        );
      if (row.attempts >= OTP_MAX_ATTEMPTS)
        throw new EmailError(
          "EMAIL_OTP_LOCKED",
          "Nhập sai quá nhiều lần, vui lòng gửi lại mã",
          429,
        );
      if (!matches(row)) {
        await client.query(
          "UPDATE xiangqi_auth.username_accounts SET attempts=attempts+1 WHERE user_id=$1",
          [userId],
        );
        return false;
      }
      const promoted = await client.query(
        `UPDATE xiangqi_auth.username_accounts
           SET email=pending_email, verified_at=$3, pending_email=NULL,
               otp_hash=NULL, expires_at=NULL, attempts=0
         WHERE user_id=$1 AND pending_email=$2 AND verified_at IS NULL`,
        [userId, row.pendingEmail, now],
      );
      if (promoted.rowCount !== 1)
        throw new EmailError(
          "EMAIL_NOT_PENDING",
          "Mã xác minh đã thay đổi",
          409,
        );
      try {
        const origin = await client.query(
          `UPDATE xiangqi_auth.account_origins SET email_key=$2
           WHERE user_id=$1 AND email_key=user_id::text||'@${ALIAS_DOMAIN}'`,
          [userId, row.pendingEmail],
        );
        if (origin.rowCount !== 1)
          throw new EmailError(
            "EMAIL_NOT_INITIALIZED",
            "Tài khoản chưa sẵn sàng xác minh email",
            409,
          );
      } catch (error) {
        if (
          error instanceof Object &&
          "code" in error &&
          error.code === "23505"
        )
          throw new EmailError("EMAIL_TAKEN", "Email này đã được sử dụng", 409);
        throw error;
      }
      return true;
    });
  }
}

async function readRow(
  client: PoolClient,
  userId: string,
): Promise<EmailAccountRow> {
  const result = await client.query<Row>(
    `SELECT u.id, u.email, (u.email_confirmed_at IS NOT NULL) AS confirmed,
            (a.user_id IS NOT NULL) AS initialized, a.email AS contact,
            a.verified_at, a.pending_email, a.otp_hash, a.last_sent_at,
            a.expires_at, COALESCE(a.attempts, 0) AS attempts
       FROM xiangqi_auth.accounts u
       LEFT JOIN xiangqi_auth.username_accounts a ON a.user_id=u.id
      WHERE u.id=$1`,
    [userId],
  );
  const row = result.rows[0];
  if (!row)
    throw new EmailError(
      "EMAIL_ACCOUNT_MISSING",
      "Không tìm thấy tài khoản",
      404,
    );
  return {
    userId: row.id,
    credentialEmail: row.email ?? "",
    confirmed: row.confirmed,
    initialized: row.initialized,
    contactEmail: row.contact,
    verifiedAt: row.verified_at,
    pendingEmail: row.pending_email,
    otpHash: row.otp_hash,
    lastSentAt: row.last_sent_at,
    expiresAt: row.expires_at,
    attempts: row.attempts,
  };
}
