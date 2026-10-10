import type { Pool, PoolClient } from "pg";
import {
  RegistrationError,
  type RegistrationStore,
  type Account,
  type Draft,
} from "./contracts.js";

const accountSelect = `SELECT u.id AS "userId", u.email, u.email_confirmed_at IS NOT NULL AS verified,
  p.completed_at AS "completedAt", COALESCE(p.registration_pending,true) AS pending,
  EXISTS(SELECT 1 FROM xiangqi_auth.registration_intents i WHERE i.user_id=u.id OR (i.user_id IS NULL AND i.email=lower(u.email) AND i.nonce=u.raw_user_meta_data->>'registration_intent')) AS temporary,
  EXISTS(SELECT 1 FROM xiangqi_auth.registration_drafts d WHERE d.user_id=u.id) AS "hasDraft"
  FROM xiangqi_auth.accounts u LEFT JOIN public.profiles p ON p.user_id=u.id`;

// Requires a direct or session-pooling connection; transaction pooling cannot preserve these locks.
export class PostgresRegistrationStore implements RegistrationStore {
  constructor(
    private readonly pool: Pool,
    private readonly client?: PoolClient,
  ) {}
  private async query(text: string, values: unknown[] = []) {
    if (this.client) return this.client.query(text, values);
    const client = await this.pool.connect();
    let broken = false;
    try {
      await client.query("SET ROLE app_server");
      return await client.query(text, values);
    } finally {
      try {
        await client.query("RESET ROLE");
      } catch {
        broken = true;
      }
      client.release(broken);
    }
  }
  async withLocks<T>(
    keys: string[],
    work: (store: RegistrationStore) => Promise<T>,
  ): Promise<T> {
    const client = await this.pool.connect();
    const acquired: string[] = [];
    let broken = false;
    try {
      await client.query("SET ROLE app_server");
      for (const key of [...new Set(keys)].sort()) {
        await client.query("SELECT pg_advisory_lock(hashtextextended($1,0))", [
          key,
        ]);
        acquired.push(key);
      }
      return await work(new PostgresRegistrationStore(this.pool, client));
    } finally {
      try {
        for (const key of acquired.reverse())
          await client.query(
            "SELECT pg_advisory_unlock(hashtextextended($1,0))",
            [key],
          );
        await client.query("RESET ROLE");
      } catch {
        broken = true;
      }
      client.release(broken);
    }
  }
  async usernameTaken(username: string, userId?: string) {
    const { rows } = await this.query(
      `SELECT EXISTS(SELECT 1 FROM public.profiles WHERE lower(username)=lower($1) AND ($2::uuid IS NULL OR user_id<>$2))
      OR EXISTS(SELECT 1 FROM xiangqi_auth.username_reservations WHERE username_key=lower($1) AND expires_at>now() AND ($2::uuid IS NULL OR owner_id<>$2)) AS taken`,
      [username, userId ?? null],
    );
    return rows[0].taken as boolean;
  }
  async accountByEmail(email: string): Promise<Account | null> {
    const { rows } = await this.query(
      `${accountSelect} WHERE lower(u.email)=lower($1)`,
      [email],
    );
    return rows[0] ?? null;
  }
  async accountById(userId: string): Promise<Account | null> {
    const { rows } = await this.query(`${accountSelect} WHERE u.id=$1`, [
      userId,
    ]);
    return rows[0] ?? null;
  }
  async beginIntent(email: string, nonce: string, time: Date) {
    await this.query(
      "INSERT INTO xiangqi_auth.registration_intents(email,nonce,created_at) VALUES($1,$2,$3) ON CONFLICT(email) DO UPDATE SET nonce=EXCLUDED.nonce,created_at=EXCLUDED.created_at WHERE xiangqi_auth.registration_intents.user_id IS NULL",
      [email, nonce, time],
    );
  }
  async bindIntent(email: string, userId: string) {
    const result = await this.query(
      `UPDATE xiangqi_auth.registration_intents i SET user_id=$2
      FROM xiangqi_auth.accounts u WHERE i.email=$1 AND u.id=$2 AND lower(u.email)=i.email
        AND u.raw_user_meta_data->>'registration_intent'=i.nonce`,
      [email, userId],
    );
    if (result.rowCount !== 1)
      throw new RegistrationError(
        "EMAIL_TAKEN",
        "Email này đã được đăng ký",
        409,
        2,
      );
  }
  async removeIntent(email: string) {
    await this.query(
      "DELETE FROM xiangqi_auth.registration_intents WHERE email=$1",
      [email],
    );
  }
  async removeEmptyIntents(before: Date) {
    await this.query(
      "DELETE FROM xiangqi_auth.registration_intents i WHERE user_id IS NULL AND created_at<=$1 AND NOT EXISTS(SELECT 1 FROM xiangqi_auth.accounts u WHERE lower(u.email)=i.email)",
      [before],
    );
  }
  async saveDraft(draft: Draft) {
    await this.query(
      `INSERT INTO xiangqi_auth.registration_drafts(token_hash,user_id,email,username,created_at,last_sent_at) VALUES($1,$2,$3,$4,$5,$6)
      ON CONFLICT(user_id) DO UPDATE SET username=EXCLUDED.username,last_sent_at=EXCLUDED.last_sent_at`,
      [
        draft.tokenHash,
        draft.userId,
        draft.email,
        draft.username,
        draft.createdAt,
        draft.lastSentAt,
      ],
    );
  }
  async draftByHash(hash: string): Promise<Draft | null> {
    const { rows } = await this.query(
      'SELECT token_hash AS "tokenHash", user_id AS "userId", email, username, created_at AS "createdAt", last_sent_at AS "lastSentAt" FROM xiangqi_auth.registration_drafts WHERE token_hash=$1',
      [hash],
    );
    return rows[0] ?? null;
  }
  async updateSentAt(hash: string, time: Date) {
    await this.query(
      "UPDATE xiangqi_auth.registration_drafts SET last_sent_at=$2 WHERE token_hash=$1",
      [hash, time],
    );
  }
  async complete(userId: string, username: string, time: Date) {
    try {
      const result = await this.query(
        `INSERT INTO public.profiles(user_id,id,username,display_name,completed_at,registration_pending)
        SELECT id,id,$2,$2,$3,true FROM xiangqi_auth.accounts WHERE id=$1 AND email_confirmed_at IS NOT NULL
        ON CONFLICT(user_id) DO NOTHING`,
        [userId, username, time],
      );
      if (!result.rowCount && !(await this.accountById(userId))?.completedAt)
        throw new RegistrationError(
          "ACCOUNT_PENDING",
          "Tài khoản chưa xác minh hoặc chưa hoàn tất",
          403,
        );
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        error.code === "23505"
      )
        throw new RegistrationError(
          "USERNAME_TAKEN",
          "Username đã có người dùng",
          409,
          1,
        );
      throw error;
    }
  }
  async clearPending(userId: string) {
    await this.query(
      "UPDATE public.profiles SET registration_pending=false WHERE user_id=$1 AND completed_at IS NOT NULL",
      [userId],
    );
  }
  async removeDraft(userId: string) {
    await this.query(
      "DELETE FROM xiangqi_auth.registration_drafts WHERE user_id=$1",
      [userId],
    );
  }
  async staleAccounts(before: Date): Promise<Account[]> {
    const { rows } = await this.query(
      `${accountSelect} WHERE (p.completed_at IS NOT NULL AND p.registration_pending=true)
      OR (u.created_at <= $1 AND EXISTS(SELECT 1 FROM xiangqi_auth.registration_intents i WHERE i.user_id=u.id OR (i.user_id IS NULL AND i.email=lower(u.email) AND i.nonce=u.raw_user_meta_data->>'registration_intent')) AND p.completed_at IS NULL)`,
      [before],
    );
    return rows;
  }
}
