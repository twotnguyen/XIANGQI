import type { Pool, PoolClient } from "pg";
import { transaction } from "../../core/postgres.js";

export interface GoogleAccount {
  userId: string;
  email: string;
  method: "email" | "google";
  createdAt: Date;
  completedAt: Date | null;
  pending: boolean | null;
  username: string | null;
}
export interface DraftRow {
  token_hash: string;
  user_id: string;
  created_at: Date;
  state: string | null;
  remember: boolean;
}
export interface OnboardingRow {
  created_at: Date;
  state: string | null;
  completed_at: Date | null;
  username: string | null;
  email: string;
}
export interface TemporaryAccountRow {
  user_id: string;
  created_at: Date;
}
export interface CleanupCursor {
  createdAt: Date;
  userId: string;
}
const accountQuery = `SELECT o.user_id AS "userId",o.email_key AS email,o.method,o.created_at AS "createdAt",p.completed_at AS "completedAt",p.registration_pending AS pending,p.username FROM xiangqi_auth.account_origins o LEFT JOIN public.profiles p ON p.user_id=o.user_id`;

/**
 * Store tương tác cơ sở dữ liệu PostgreSQL cho tính năng xác thực Google:
 * Quản lý google_challenges, google_drafts, creation_intents và temporary_accounts.
 */
export class GoogleStore {
  constructor(private readonly pool: Pool) {}
  private one<T>(work: (c: PoolClient) => Promise<T>): Promise<T> {
    return transaction(this.pool, work);
  }
  /**
   * Lưu bản ghi challenge (nonce và thời hạn hết hạn) vào database.
   */
  insertChallenge(nonce: string, expires: Date): Promise<void> {
    return this.one(async (c) => {
      await c.query(
        "INSERT INTO xiangqi_auth.google_challenges(token_hash,nonce_hash,expires_at) VALUES($1,$1,$2)",
        [nonce, expires],
      );
    });
  }
  /**
   * Đánh dấu challenge đã được sử dụng (consumed), trả về true nếu challenge còn hạn và chưa dùng.
   */
  consumeChallenge(nonce: string, now: Date): Promise<boolean> {
    return this.one(async (c) =>
      Boolean(
        (
          await c.query(
            "UPDATE xiangqi_auth.google_challenges SET consumed_at=$2 WHERE token_hash=$1 AND consumed_at IS NULL AND expires_at>$2 RETURNING token_hash",
            [nonce, now],
          )
        ).rowCount,
      ),
    );
  }
  findAccountByEmail(email: string): Promise<GoogleAccount | undefined> {
    return this.one(
      async (c) =>
        (await c.query(`${accountQuery} WHERE o.email_key=lower($1)`, [email]))
          .rows[0],
    );
  }
  recordCreationIntent(email: string, providerId: string): Promise<void> {
    return this.one(async (c) => {
      await c.query(
        "DELETE FROM xiangqi_auth.google_creation_intents WHERE email_key=lower($1) AND expires_at<=statement_timestamp()",
        [email],
      );
      await c.query(
        "INSERT INTO xiangqi_auth.google_creation_intents(email_key,provider_id) SELECT lower($1),$2 WHERE NOT EXISTS(SELECT 1 FROM xiangqi_auth.account_origins WHERE email_key=lower($1)) ON CONFLICT(email_key) DO NOTHING",
        [email, providerId],
      );
    });
  }
  findSubject(userId: string): Promise<string | undefined> {
    return this.one(
      async (c) =>
        (
          await c.query(
            "SELECT provider_id FROM xiangqi_auth.google_subjects WHERE user_id=$1",
            [userId],
          )
        ).rows[0]?.provider_id,
    );
  }
  findOnboarding(tokenHash: string): Promise<OnboardingRow | undefined> {
    return this.one(
      async (c) =>
        (
          await c.query(
            "SELECT d.created_at,d.state,p.completed_at,p.username,o.email_key AS email FROM xiangqi_auth.google_drafts d JOIN xiangqi_auth.account_origins o ON o.user_id=d.user_id AND o.method='google' JOIN xiangqi_auth.accounts a ON a.id=d.user_id AND a.email_confirmed_at IS NOT NULL AND lower(a.email)=o.email_key LEFT JOIN public.profiles p ON p.user_id=d.user_id WHERE d.token_hash=$1",
            [tokenHash],
          )
        ).rows[0],
    );
  }
  findDraftOwner(tokenHash: string): Promise<string | undefined> {
    return this.one(
      async (c) =>
        (
          await c.query(
            "SELECT user_id FROM xiangqi_auth.google_drafts WHERE token_hash=$1",
            [tokenHash],
          )
        ).rows[0]?.user_id,
    );
  }
  deleteDraft(userId: string, tokenHash: string): Promise<void> {
    return this.one(async (c) => {
      await c.query(
        "DELETE FROM xiangqi_auth.google_drafts WHERE user_id=$1 AND token_hash=$2",
        [userId, tokenHash],
      );
    });
  }
  purgeExpiredChallenges(now: Date): Promise<void> {
    return this.one(async (c) => {
      await c.query(
        "DELETE FROM xiangqi_auth.google_challenges WHERE expires_at<=$1",
        [now],
      );
    });
  }
  purgeExpiredIntents(): Promise<void> {
    return this.one(async (c) => {
      await c.query(
        "DELETE FROM xiangqi_auth.google_creation_intents WHERE expires_at<=statement_timestamp()",
      );
    });
  }
  temporaryAccountsBefore(
    cutoff: Date,
    cursor: CleanupCursor | null,
  ): Promise<TemporaryAccountRow[]> {
    return this.one(
      async (c) =>
        (
          await c.query(
            "SELECT user_id,created_at FROM xiangqi_auth.google_temporary_accounts WHERE created_at<=$1 AND ($2::timestamptz IS NULL OR (created_at,user_id)>($2,$3::uuid)) ORDER BY created_at,user_id LIMIT 100",
            [cutoff, cursor?.createdAt ?? null, cursor?.userId ?? null],
          )
        ).rows,
    );
  }
  /**
   * Thực thi khối công việc với kết nối chuyên dụng nắm giữ advisory lock theo user (và username).
   */
  async locked<T>(
    id: string,
    username: string | undefined,
    work: (tx: GoogleTx) => Promise<T>,
  ): Promise<T> {
    const c = await this.pool.connect(),
      keys = [
        `google-user:${id}`,
        ...(username ? [`username:${username.toLowerCase()}`] : []),
      ];
    const acquired: string[] = [];
    let broken = false;
    try {
      await c.query("SET ROLE app_server");
      for (const key of keys) {
        await c.query("SELECT pg_advisory_lock(hashtextextended($1,0))", [key]);
        acquired.push(key);
      }
      return await work(new GoogleTx(c));
    } finally {
      try {
        await c.query("ROLLBACK");
        for (const key of acquired.reverse())
          await c.query("SELECT pg_advisory_unlock(hashtextextended($1,0))", [
            key,
          ]);
        await c.query("RESET ROLE");
      } catch {
        broken = true;
      }
      c.release(broken);
    }
  }
}

/**
 * Đối tượng thao tác dữ liệu gắn liền với kết nối đã được khóa advisory trong GoogleStore.
 */
export class GoogleTx {
  constructor(private readonly client: PoolClient) {}
  async account(id: string): Promise<GoogleAccount | undefined> {
    return (await this.client.query(`${accountQuery} WHERE o.user_id=$1`, [id]))
      .rows[0];
  }
  async draftHash(userId: string): Promise<string | undefined> {
    return (
      await this.client.query(
        "SELECT token_hash FROM xiangqi_auth.google_drafts WHERE user_id=$1",
        [userId],
      )
    ).rows[0]?.token_hash;
  }
  async draftCreatedAt(userId: string): Promise<Date | undefined> {
    return (
      await this.client.query(
        "SELECT created_at FROM xiangqi_auth.google_drafts WHERE user_id=$1",
        [userId],
      )
    ).rows[0]?.created_at;
  }
  async temporaryCreatedAt(userId: string): Promise<Date | undefined> {
    return (
      await this.client.query(
        "SELECT created_at FROM xiangqi_auth.google_temporary_accounts WHERE user_id=$1",
        [userId],
      )
    ).rows[0]?.created_at;
  }
  /** Inserts or re-keys the draft and returns its creation time. */
  async upsertDraft(draft: {
    tokenHash: string;
    userId: string;
    createdAt: Date;
    remember: boolean;
    owned: boolean;
  }): Promise<Date> {
    return (
      await this.client.query(
        `INSERT INTO xiangqi_auth.google_drafts(token_hash,user_id,created_at,remember,owned) VALUES($1,$2,$3,$4,$5) ON CONFLICT(user_id) DO UPDATE SET token_hash=EXCLUDED.token_hash,remember=EXCLUDED.remember RETURNING created_at`,
        [
          draft.tokenHash,
          draft.userId,
          draft.createdAt,
          draft.remember,
          draft.owned,
        ],
      )
    ).rows[0].created_at;
  }
  async findDraft(tokenHash: string): Promise<DraftRow | undefined> {
    return (
      await this.client.query(
        "SELECT * FROM xiangqi_auth.google_drafts WHERE token_hash=$1",
        [tokenHash],
      )
    ).rows[0];
  }
  async isUsernameTaken(
    username: string,
    userId: string,
    now: Date,
  ): Promise<boolean> {
    return (
      await this.client.query(
        `SELECT EXISTS(SELECT 1 FROM public.profiles WHERE lower(username)=lower($1) AND user_id<>$2) OR EXISTS(SELECT 1 FROM xiangqi_auth.username_reservations WHERE username_key=lower($1) AND owner_id<>$2 AND expires_at>$3) taken`,
        [username, userId, now],
      )
    ).rows[0].taken;
  }
  async markDraftRecovering(userId: string): Promise<void> {
    await this.client.query(
      "UPDATE xiangqi_auth.google_drafts SET state='recovering' WHERE user_id=$1",
      [userId],
    );
  }
  async markDraftCleanup(userId: string): Promise<void> {
    await this.client.query(
      "UPDATE xiangqi_auth.google_drafts SET state='cleanup' WHERE user_id=$1",
      [userId],
    );
  }
  /** Returns false when the username is already taken (unique violation). */
  async saveCompletedProfile(
    userId: string,
    username: string,
    at: Date,
  ): Promise<boolean> {
    try {
      await this.client.query(
        `INSERT INTO public.profiles(user_id,username,display_name,completed_at,registration_pending) VALUES($1,$2,$2,$3,true) ON CONFLICT(user_id) DO UPDATE SET username=EXCLUDED.username,display_name=EXCLUDED.display_name,completed_at=EXCLUDED.completed_at`,
        [userId, username, at],
      );
      return true;
    } catch (error) {
      if ((error as { code?: string }).code === "23505") return false;
      throw error;
    }
  }
  async clearRegistrationPending(userId: string): Promise<void> {
    await this.client.query(
      "UPDATE public.profiles SET registration_pending=false WHERE user_id=$1",
      [userId],
    );
  }
}
