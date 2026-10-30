import type { Pool, PoolClient } from "pg";
import { actorLock, transaction } from "../../core/postgres.js";
import {
  UsernameError,
  type OtpMatcher,
  type UsernameAccount,
  type UsernameChallenge,
  type UsernamePurpose,
} from "./username.types.js";

const accountSql = `SELECT a.id AS "userId",p.username,
  (a.email_confirmed_at IS NOT NULL AND p.completed_at IS NOT NULL AND NOT p.registration_pending) AS active,
  CASE WHEN u.user_id IS NOT NULL THEN CASE WHEN u.verified_at IS NOT NULL THEN u.email END
    WHEN a.email_confirmed_at IS NOT NULL AND a.email NOT LIKE '%.xiangqi.invalid' THEN a.email END AS "contactEmail"
  FROM xiangqi_auth.accounts a
  JOIN public.profiles p ON p.user_id=a.id
  JOIN xiangqi_auth.principals n ON n.id=a.id AND n.kind='member'
  LEFT JOIN xiangqi_auth.username_accounts u ON u.user_id=a.id`;
const challengeSql = `SELECT user_id AS "userId",purpose,request_hash AS "requestHash",contact_email AS "contactEmail",
  verified_hash AS "verifiedHash",verified_expires_at AS "verifiedExpiresAt",otp_hash AS "otpHash",sent_at AS "sentAt",expires_at AS "expiresAt",attempts
  FROM xiangqi_auth.username_challenges`;
const MAX_ATTEMPTS = 5;
const RESEND_MS = 60_000;
const OTP_MS = 180_000;
const RESERVATION_MS = 30 * 24 * 3600_000;

export interface IssueInput {
  requestHash: string;
  priorHash: string | null;
  sentAt: Date;
  otpHash: (contactEmail: string) => string;
}
export type Issued =
  | { kind: "unavailable" }
  | { kind: "ok"; contactEmail: string; otpHash: string; expiresAt: Date };
export type Applied = { kind: "invalid" } | { kind: "ok"; username: string };

async function readAccount(
  client: PoolClient,
  userId: string,
): Promise<UsernameAccount | null> {
  return (
    (
      await client.query<UsernameAccount>(`${accountSql} WHERE a.id=$1`, [
        userId,
      ])
    ).rows[0] ?? null
  );
}

async function lockUsernames(client: PoolClient, names: string[]) {
  const keys = [...new Set(names.map((n) => `username:${n.toLowerCase()}`))];
  for (const key of keys.sort())
    await client.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [
      key,
    ]);
}

/**
 * Store đổi/khôi phục username: mỗi thao tác là một transaction với actorLock theo userId.
 * Uniqueness được chốt bởi profiles_username_lower_unique tại thời điểm ghi, không bởi pre-check.
 */
export class UsernameStore {
  constructor(private readonly pool: Pool) {}

  async accountByContactEmail(email: string): Promise<UsernameAccount | null> {
    return transaction(
      this.pool,
      async (client) =>
        (
          await client.query<UsernameAccount>(
            `SELECT * FROM (${accountSql}) x WHERE lower(x."contactEmail")=$1 AND x.active`,
            [email],
          )
        ).rows[0] ?? null,
    );
  }

  async challengeByRequest(
    requestHash: string,
  ): Promise<UsernameChallenge | null> {
    return transaction(
      this.pool,
      async (client) =>
        (
          await client.query<UsernameChallenge>(
            `${challengeSql} WHERE request_hash=$1`,
            [requestHash],
          )
        ).rows[0] ?? null,
    );
  }

  async issue(
    userId: string,
    purpose: UsernamePurpose,
    input: IssueInput,
  ): Promise<Issued> {
    return transaction(this.pool, async (client) => {
      await actorLock(client, userId);
      const account = await readAccount(client, userId);
      if (!account?.active || !account.contactEmail)
        return { kind: "unavailable" };
      const prior = (
        await client.query<{ requestHash: string; sentAt: Date }>(
          `SELECT request_hash AS "requestHash",sent_at AS "sentAt" FROM xiangqi_auth.username_challenges
           WHERE user_id=$1 AND purpose=$2 FOR UPDATE`,
          [userId, purpose],
        )
      ).rows[0];
      if (input.priorHash && prior?.requestHash !== input.priorHash)
        throw new UsernameError(
          "USERNAME_REQUEST_INVALID",
          "Yêu cầu xác minh không hợp lệ",
        );
      if (prior && input.sentAt.getTime() - prior.sentAt.getTime() < RESEND_MS)
        throw new UsernameError(
          "USERNAME_RATE_LIMITED",
          "Vui lòng đợi trước khi gửi lại mã",
          429,
        );
      const contactEmail = account.contactEmail;
      const otpHash = input.otpHash(contactEmail);
      const expiresAt = new Date(input.sentAt.getTime() + OTP_MS);
      await client.query(
        `INSERT INTO xiangqi_auth.username_challenges(user_id,purpose,request_hash,contact_email,otp_hash,sent_at,expires_at)
         VALUES($1,$2,$3,$4,$5,$6,$7)
         ON CONFLICT(user_id,purpose) DO UPDATE SET request_hash=EXCLUDED.request_hash,contact_email=EXCLUDED.contact_email,
           otp_hash=EXCLUDED.otp_hash,sent_at=EXCLUDED.sent_at,expires_at=EXCLUDED.expires_at,
           verified_hash=NULL,verified_expires_at=NULL,
           attempts=CASE WHEN username_challenges.expires_at>EXCLUDED.sent_at THEN username_challenges.attempts ELSE 0 END`,
        [
          userId,
          purpose,
          input.requestHash,
          contactEmail,
          otpHash,
          input.sentAt,
          expiresAt,
        ],
      );
      return { kind: "ok", contactEmail, otpHash, expiresAt };
    });
  }

  async discard(
    userId: string,
    purpose: UsernamePurpose,
    requestHash: string,
    otpHash: string,
  ): Promise<void> {
    await this.pool.query(
      "DELETE FROM xiangqi_auth.username_challenges WHERE user_id=$1 AND purpose=$2 AND request_hash=$3 AND otp_hash=$4",
      [userId, purpose, requestHash, otpHash],
    );
  }

  /**
   * OTP đúng thì cấp capability có phạm vi (chỉ lưu hash) và vô hiệu OTP; sai thì tăng attempts và commit.
   */
  async verifyChange(
    userId: string,
    requestHash: string,
    matcher: OtpMatcher,
    now: Date,
    capabilityHash: string,
    capabilityExpiresAt: Date,
  ): Promise<boolean> {
    return transaction(this.pool, async (client) => {
      await actorLock(client, userId);
      const account = await readAccount(client, userId);
      if (!account?.active) return false;
      const row = await this.verifyRow(
        client,
        userId,
        "username-change",
        requestHash,
        matcher,
        now,
      );
      if (!row) return false;
      await client.query(
        `UPDATE xiangqi_auth.username_challenges SET otp_hash=NULL,verified_hash=$3,verified_expires_at=$4
         WHERE user_id=$1 AND purpose=$2`,
        [userId, "username-change", capabilityHash, capabilityExpiresAt],
      );
      return true;
    });
  }

  /**
   * Chốt tên bằng capability còn hạn. Trùng tên/không hợp lệ ném lỗi trong transaction nên capability
   * còn nguyên để sửa tên mà không gửi OTP lại; chỉ khi thành công mới đổi profile, giữ tên cũ 30 ngày và xóa challenge.
   */
  async finalizeChange(
    userId: string,
    capabilityHash: string,
    next: string,
    now: Date,
  ): Promise<Applied> {
    return transaction(this.pool, async (client) => {
      await actorLock(client, userId);
      const account = await readAccount(client, userId);
      if (!account?.active || !account.username) return { kind: "invalid" };
      const row = (
        await client.query<UsernameChallenge>(
          `${challengeSql} WHERE user_id=$1 AND purpose='username-change' FOR UPDATE`,
          [userId],
        )
      ).rows[0];
      if (
        !row?.verifiedHash ||
        row.verifiedHash !== capabilityHash ||
        !row.verifiedExpiresAt ||
        row.verifiedExpiresAt.getTime() <= now.getTime()
      )
        return { kind: "invalid" };
      const old = account.username;
      if (old === next)
        throw new UsernameError(
          "USERNAME_UNCHANGED",
          "Tên đăng nhập mới phải khác tên hiện tại",
        );
      await lockUsernames(client, [old, next]);
      if (await this.reservedForOther(client, next, userId, now))
        throw new UsernameError(
          "USERNAME_TAKEN",
          "Tên đăng nhập đã có người dùng",
          409,
        );
      try {
        await client.query(
          "UPDATE public.profiles SET username=$2 WHERE user_id=$1",
          [userId, next],
        );
      } catch (error) {
        if (
          typeof error === "object" &&
          error !== null &&
          "code" in error &&
          error.code === "23505"
        )
          throw new UsernameError(
            "USERNAME_TAKEN",
            "Tên đăng nhập đã có người dùng",
            409,
          );
        throw error;
      }
      if (old.toLowerCase() !== next.toLowerCase()) {
        await client.query(
          "DELETE FROM xiangqi_auth.username_reservations WHERE username_key=lower($1)",
          [next],
        );
        await client.query(
          `INSERT INTO xiangqi_auth.username_reservations(username_key,owner_id,expires_at) VALUES(lower($1),$2,$3)
           ON CONFLICT(username_key) DO UPDATE SET owner_id=EXCLUDED.owner_id,expires_at=EXCLUDED.expires_at
           WHERE xiangqi_auth.username_reservations.expires_at<=$4 OR xiangqi_auth.username_reservations.owner_id=EXCLUDED.owner_id`,
          [old, userId, new Date(now.getTime() + RESERVATION_MS), now],
        );
      }
      await client.query(
        "DELETE FROM xiangqi_auth.username_challenges WHERE user_id=$1 AND purpose='username-change'",
        [userId],
      );
      return { kind: "ok", username: next };
    });
  }

  /** Khôi phục: OTP đúng mới trả username hiện tại; không tạo session, không đổi credential. */
  async consumeRecovery(
    userId: string,
    requestHash: string,
    matcher: OtpMatcher,
    now: Date,
  ): Promise<Applied> {
    return transaction(this.pool, async (client) => {
      await actorLock(client, userId);
      const account = await readAccount(client, userId);
      if (!account?.active || !account.username) return { kind: "invalid" };
      const row = await this.verifyRow(
        client,
        userId,
        "username-recovery",
        requestHash,
        matcher,
        now,
      );
      if (!row) return { kind: "invalid" };
      await client.query(
        "DELETE FROM xiangqi_auth.username_challenges WHERE user_id=$1 AND purpose='username-recovery'",
        [userId],
      );
      return { kind: "ok", username: account.username };
    });
  }

  private async reservedForOther(
    client: PoolClient,
    username: string,
    userId: string,
    now: Date,
  ) {
    const { rows } = await client.query(
      "SELECT 1 FROM xiangqi_auth.username_reservations WHERE username_key=lower($1) AND owner_id<>$2 AND expires_at>$3",
      [username, userId, now],
    );
    return rows.length > 0;
  }

  /**
   * Khóa challenge và kiểm tra OTP. Sai thì tăng attempts (commit), đủ MAX_ATTEMPTS thì vô hiệu OTP.
   * Trả null khi không hợp lệ; request id khác bản hiện tại không bị tính là sai OTP.
   */
  private async verifyRow(
    client: PoolClient,
    userId: string,
    purpose: UsernamePurpose,
    requestHash: string,
    matcher: OtpMatcher,
    now: Date,
  ): Promise<UsernameChallenge | null> {
    const row = (
      await client.query<UsernameChallenge>(
        `${challengeSql} WHERE user_id=$1 AND purpose=$2 FOR UPDATE`,
        [userId, purpose],
      )
    ).rows[0];
    if (
      !row ||
      row.requestHash !== requestHash ||
      !row.otpHash ||
      row.attempts >= MAX_ATTEMPTS ||
      row.expiresAt.getTime() <= now.getTime()
    )
      return null;
    if (matcher(row)) return row;
    await client.query(
      `UPDATE xiangqi_auth.username_challenges
         SET attempts=attempts+1, otp_hash=CASE WHEN attempts+1>=$3 THEN NULL ELSE otp_hash END
       WHERE user_id=$1 AND purpose=$2`,
      [userId, purpose, MAX_ATTEMPTS],
    );
    return null;
  }
}
