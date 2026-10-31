import type { Pool, PoolClient } from "pg";
import { actorLock, transaction } from "../../core/postgres.js";
import { reserveOtpSend, OTP_LIMIT_MESSAGE } from "../auth/otp.store.js";
import { LoginError } from "../login/login.types.js";
import {
  invalidRecovery,
  PasswordError,
  type PasswordAccount,
  type PasswordRecovery,
} from "./password.types.js";

const accountSql = `SELECT a.id AS "userId",p.username,a.email AS "credentialEmail",
  (a.email_confirmed_at IS NOT NULL AND p.completed_at IS NOT NULL AND NOT p.registration_pending) AS active,
  CASE WHEN u.user_id IS NOT NULL THEN CASE WHEN u.verified_at IS NOT NULL THEN u.email END
    WHEN a.email_confirmed_at IS NOT NULL AND a.email NOT LIKE '%.xiangqi.invalid' THEN a.email END AS "contactEmail"
  FROM xiangqi_auth.accounts a JOIN public.profiles p ON p.user_id=a.id
  LEFT JOIN xiangqi_auth.username_accounts u ON u.user_id=a.id`;
const recoverySql = `SELECT user_id AS "userId",request_hash AS "requestHash",contact_email AS "contactEmail",
  otp_hash AS "otpHash",sent_at AS "sentAt",expires_at AS "expiresAt",attempts,
  reset_hash AS "resetHash",reset_expires_at AS "resetExpiresAt",reset_operation_hash AS "resetOperationHash",consumed_at AS "consumedAt" FROM xiangqi_auth.password_recoveries`;

/** Password and login locks serialize credential proofs; actor locks cover short DB writes only. */
export class PasswordStore {
  constructor(private readonly pool: Pool) {}

  async accountByUsername(username: string): Promise<PasswordAccount | null> {
    return transaction(
      this.pool,
      async (client) =>
        (
          await client.query<PasswordAccount>(
            `${accountSql} WHERE lower(p.username)=$1`,
            [username],
          )
        ).rows[0] ?? null,
    );
  }

  async recoveryOwner(requestHash: string): Promise<string | null> {
    return transaction(
      this.pool,
      async (client) =>
        (
          await client.query<{ user_id: string }>(
            "SELECT user_id FROM xiangqi_auth.password_recoveries WHERE request_hash=$1",
            [requestHash],
          )
        ).rows[0]?.user_id ?? null,
    );
  }

  async withUser<T>(
    userId: string,
    work: (tx: PasswordTx) => Promise<T>,
  ): Promise<T> {
    const client = await this.pool.connect();
    const keys: string[] = [];
    let broken = false;
    try {
      const lock = async (key: string) => {
        await client.query("SELECT pg_advisory_lock(hashtextextended($1,0))", [
          key,
        ]);
        keys.push(key);
      };
      await lock(`password:${userId}`);
      const tx = new PasswordTx(client, userId);
      const account = await tx.account();
      if (!account) throw invalidRecovery();
      await lock(`login:${account.username.toLowerCase()}`);
      return await work(tx);
    } finally {
      try {
        for (const key of keys.reverse())
          await client.query(
            "SELECT pg_advisory_unlock(hashtextextended($1,0))",
            [key],
          );
      } catch {
        broken = true;
      }
      client.release(broken);
    }
  }
}

export class PasswordTx {
  constructor(
    private readonly client: PoolClient,
    private readonly userId: string,
  ) {}

  private async run<T>(work: () => Promise<T>): Promise<T> {
    await this.client.query("BEGIN");
    try {
      await this.client.query("SET LOCAL ROLE app_server");
      await actorLock(this.client, this.userId);
      const value = await work();
      await this.client.query("COMMIT");
      return value;
    } catch (error) {
      await this.client.query("ROLLBACK");
      throw error;
    }
  }

  private async readAccount(): Promise<PasswordAccount | null> {
    return (
      (
        await this.client.query<PasswordAccount>(
          `${accountSql} WHERE a.id=$1`,
          [this.userId],
        )
      ).rows[0] ?? null
    );
  }

  account(): Promise<PasswordAccount | null> {
    return this.run(() => this.readAccount());
  }

  private async readSession(sessionHash: string, now: Date) {
    const account = await this.readAccount();
    const row = (
      await this.client.query<{
        expiresAt: Date;
        remember: boolean;
        passwordChangeHash: string | null;
      }>(
        `SELECT expires_at AS "expiresAt",remember,password_change_hash AS "passwordChangeHash" FROM xiangqi_auth.app_sessions
       WHERE token_hash=$1 AND user_id=$2 AND revoked_at IS NULL AND expires_at>$3 FOR UPDATE`,
        [sessionHash, this.userId, now],
      )
    ).rows[0];
    if (!account?.active || !row)
      throw new LoginError("SESSION_EXPIRED", "Phiên đăng nhập đã hết hạn");
    return row;
  }

  session(sessionHash: string, now: Date) {
    return this.run(() => this.readSession(sessionHash, now));
  }

  private async revokeOthers(keepHash: string | null, now: Date) {
    await this.client.query(
      `UPDATE xiangqi_auth.app_sessions SET revoked_at=COALESCE(revoked_at,$3)
       WHERE user_id=$1 AND ($2::text IS NULL OR token_hash<>$2)`,
      [this.userId, keepHash, now],
    );
  }

  prepareChange(sessionHash: string, changeHash: string, now: Date) {
    return this.run(async () => {
      const session = await this.readSession(sessionHash, now);
      await this.client.query(
        "UPDATE xiangqi_auth.app_sessions SET password_change_hash=$2 WHERE token_hash=$1",
        [sessionHash, changeHash],
      );
      return session;
    });
  }

  cancelChange(sessionHash: string, changeHash: string, now: Date) {
    return this.run(async () => {
      await this.readSession(sessionHash, now);
      await this.client.query(
        "UPDATE xiangqi_auth.app_sessions SET password_change_hash=NULL WHERE token_hash=$1 AND password_change_hash=$2",
        [sessionHash, changeHash],
      );
    });
  }

  acceptChange(sessionHash: string, now: Date) {
    return this.run(async () => {
      await this.revokeOthers(sessionHash, now);
      await this.client.query(
        "DELETE FROM xiangqi_auth.password_recoveries WHERE user_id=$1",
        [this.userId],
      );
    });
  }

  finishChange(sessionHash: string, now: Date) {
    return this.run(async () => {
      const session = await this.readSession(sessionHash, now);
      await this.revokeOthers(sessionHash, now);
      await this.client.query(
        "UPDATE xiangqi_auth.app_sessions SET password_change_hash=NULL WHERE token_hash=$1",
        [sessionHash],
      );
      return session;
    });
  }

  challenge(
    requestHash: string,
    contactEmail: string,
    otpHash: string,
    now: Date,
  ) {
    return this.run(async () => {
      const account = await this.readAccount();
      if (!account?.active || account.contactEmail !== contactEmail)
        throw invalidRecovery();
      const prior = (
        await this.client.query<{ sent_at: Date }>(
          "SELECT sent_at FROM xiangqi_auth.password_recoveries WHERE user_id=$1",
          [this.userId],
        )
      ).rows[0];
      if (prior && now.getTime() - prior.sent_at.getTime() < 60_000)
        throw new PasswordError(
          "PASSWORD_RATE_LIMITED",
          "Vui lòng đợi trước khi gửi lại mã",
          429,
        );
      const expiresAt = new Date(now.getTime() + 180_000);
      if (!(await reserveOtpSend(this.client, this.userId, contactEmail, now)))
        throw new PasswordError("PASSWORD_OTP_LIMITED", OTP_LIMIT_MESSAGE, 429);
      await this.client.query(
        `INSERT INTO xiangqi_auth.password_recoveries(user_id,request_hash,contact_email,otp_hash,sent_at,expires_at)
         VALUES($1,$2,$3,$4,$5,$6) ON CONFLICT(user_id) DO UPDATE SET
           request_hash=EXCLUDED.request_hash,contact_email=EXCLUDED.contact_email,otp_hash=EXCLUDED.otp_hash,
           sent_at=EXCLUDED.sent_at,expires_at=EXCLUDED.expires_at,attempts=0,reset_hash=NULL,reset_expires_at=NULL,reset_operation_hash=NULL,consumed_at=NULL`,
        [this.userId, requestHash, contactEmail, otpHash, now, expiresAt],
      );
      return {
        expiresAt: expiresAt.toISOString(),
        resendAt: new Date(now.getTime() + 60_000).toISOString(),
      };
    });
  }

  discard(requestHash: string, otpHash: string) {
    return this.run(async () => {
      // Keep cooldown, but an undelivered challenge must not be verifiable.
      await this.client.query(
        `UPDATE xiangqi_auth.password_recoveries SET otp_hash=NULL,reset_hash=NULL,reset_expires_at=NULL,reset_operation_hash=NULL
         WHERE user_id=$1 AND request_hash=$2 AND otp_hash=$3`,
        [this.userId, requestHash, otpHash],
      );
    });
  }

  private async readRecovery(
    requestHash: string,
    now: Date,
    checkExpiry = true,
  ): Promise<PasswordRecovery> {
    const row = (
      await this.client.query<PasswordRecovery>(
        `${recoverySql} WHERE user_id=$1 AND request_hash=$2 FOR UPDATE`,
        [this.userId, requestHash],
      )
    ).rows[0];
    const account = await this.readAccount();
    if (
      !row ||
      row.consumedAt ||
      !account?.active ||
      account.contactEmail !== row.contactEmail
    )
      throw invalidRecovery();
    if (checkExpiry && row.expiresAt.getTime() <= now.getTime())
      throw new PasswordError(
        "PASSWORD_OTP_EXPIRED",
        "Mã xác minh đã hết hạn, vui lòng yêu cầu mã mới",
        410,
      );
    return row;
  }

  recovery(requestHash: string, now: Date, checkExpiry = true) {
    return this.run(() => this.readRecovery(requestHash, now, checkExpiry));
  }

  verify(
    requestHash: string,
    resetHash: string,
    now: Date,
    matches: (row: PasswordRecovery) => boolean,
  ) {
    return this.run(async () => {
      const row = await this.readRecovery(requestHash, now);
      if (!row.otpHash || row.resetHash) throw invalidRecovery();
      if (row.attempts >= 5)
        throw new PasswordError(
          "PASSWORD_RATE_LIMITED",
          "Nhập sai quá nhiều lần, vui lòng yêu cầu mã mới",
          429,
        );
      if (!matches(row)) {
        await this.client.query(
          "UPDATE xiangqi_auth.password_recoveries SET attempts=attempts+1 WHERE user_id=$1",
          [this.userId],
        );
        return false;
      }
      await this.client.query(
        "UPDATE xiangqi_auth.password_recoveries SET otp_hash=NULL,reset_hash=$2,reset_expires_at=$3,reset_operation_hash=NULL WHERE user_id=$1",
        [this.userId, resetHash, new Date(now.getTime() + 600_000)],
      );
      return true;
    });
  }

  prepareReset(
    requestHash: string,
    resetHash: string,
    operationHash: string,
    now: Date,
  ) {
    return this.run(async () => {
      const row = await this.readRecovery(requestHash, now, false);
      if (!row.resetHash || row.resetHash !== resetHash || !row.resetExpiresAt)
        throw invalidRecovery();
      if (row.resetExpiresAt.getTime() <= now.getTime()) {
        if (!row.resetOperationHash) throw invalidRecovery();
        await this.consumePreparedReset(now);
        return "expired" as const;
      }
      if (row.resetOperationHash && row.resetOperationHash !== operationHash)
        throw invalidRecovery();
      await this.client.query(
        "UPDATE xiangqi_auth.password_recoveries SET reset_operation_hash=$2 WHERE user_id=$1",
        [this.userId, operationHash],
      );
      return row.resetOperationHash ? ("resume" as const) : ("new" as const);
    });
  }

  cancelReset(
    requestHash: string,
    resetHash: string,
    operationHash: string,
    now: Date,
  ) {
    return this.run(async () => {
      const row = await this.readRecovery(requestHash, now, false);
      if (
        row.resetHash !== resetHash ||
        row.resetOperationHash !== operationHash
      )
        throw invalidRecovery();
      await this.client.query(
        "UPDATE xiangqi_auth.password_recoveries SET reset_operation_hash=NULL WHERE user_id=$1",
        [this.userId],
      );
    });
  }

  finishReset(
    requestHash: string,
    resetHash: string,
    operationHash: string,
    now: Date,
  ) {
    return this.run(async () => {
      const row = await this.readRecovery(requestHash, now, false);
      if (
        row.resetHash !== resetHash ||
        row.resetOperationHash !== operationHash
      )
        throw invalidRecovery();
      const withinDeadline =
        !!row.resetExpiresAt && row.resetExpiresAt.getTime() > now.getTime();
      await this.consumePreparedReset(now);
      return withinDeadline;
    });
  }

  private async consumePreparedReset(now: Date) {
    await this.client.query(
      "UPDATE xiangqi_auth.password_recoveries SET otp_hash=NULL,reset_hash=NULL,reset_expires_at=NULL,reset_operation_hash=NULL,consumed_at=$2 WHERE user_id=$1",
      [this.userId, now],
    );
    await this.revokeOthers(null, now);
  }

  resetLoginAttempts() {
    return this.run(async () => {
      const account = await this.readAccount();
      if (!account?.active) throw invalidRecovery();
      await this.client.query(
        "DELETE FROM xiangqi_auth.login_attempts WHERE username_key=lower($1)",
        [account.username],
      );
    });
  }
}
