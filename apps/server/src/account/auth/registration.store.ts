import type { Pool, PoolClient } from "pg";
import {
  RegistrationError,
  type RegistrationStore,
  type Account,
  type Draft,
} from "./registration.types.js";

const intentExists = `EXISTS(SELECT 1 FROM xiangqi_auth.registration_intents i WHERE i.user_id=u.id OR (i.user_id IS NULL AND i.email=lower(u.email) AND i.nonce=u.raw_user_meta_data->>'registration_intent'))`;
// Unverified, unfinished signups made by the pre-intent flow (its trigger required signup_username)
// have no intent or draft, so nothing else would ever reclaim them. Auth deletion cascades their profile.
const legacyOrphan = `(u.email_confirmed_at IS NULL AND p.completed_at IS NULL AND u.raw_user_meta_data ? 'signup_username'
  AND NOT EXISTS(SELECT 1 FROM xiangqi_auth.registration_drafts d WHERE d.user_id=u.id))`;
const temporaryAccount = `(${intentExists} OR ${legacyOrphan})`;
const accountSelect = `SELECT u.id AS "userId", u.email, u.email_confirmed_at IS NOT NULL AS verified,
  p.completed_at AS "completedAt", COALESCE(p.registration_pending,true) AS pending,
  ${temporaryAccount} AS temporary,
  EXISTS(SELECT 1 FROM xiangqi_auth.registration_drafts d WHERE d.user_id=u.id) AS "hasDraft"
  FROM xiangqi_auth.accounts u LEFT JOIN public.profiles p ON p.user_id=u.id`;

/**
 * Store tương tác cơ sở dữ liệu PostgreSQL cho luồng đăng ký tài khoản:
 * Sử dụng advisory lock theo key (email/username) để tuần tự hóa các thao tác đồng thời.
 */
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
  /**
   * Thực thi khối công việc dưới phạm vi các khóa advisory (Postgres advisory locks).
   */
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
  /**
   * Kiểm tra username đã được sử dụng trong bảng profiles hoặc đang được giữ chỗ (reservation) hay chưa.
   */
  async usernameTaken(username: string, userId?: string) {
    const { rows } = await this.query(
      `SELECT EXISTS(SELECT 1 FROM public.profiles WHERE lower(username)=lower($1) AND ($2::uuid IS NULL OR user_id<>$2))
      OR EXISTS(SELECT 1 FROM xiangqi_auth.username_reservations WHERE username_key=lower($1) AND expires_at>now() AND ($2::uuid IS NULL OR owner_id<>$2)) AS taken`,
      [username, userId ?? null],
    );
    return rows[0].taken as boolean;
  }
  /**
   * Truy vấn thông tin tài khoản theo địa chỉ email.
   */
  async accountByEmail(email: string): Promise<Account | null> {
    const { rows } = await this.query(
      `${accountSelect} WHERE u.id=(SELECT o.user_id FROM xiangqi_auth.account_origins o WHERE o.email_key=lower($1))`,
      [email],
    );
    return rows[0] ?? null;
  }
  /**
   * Truy vấn thông tin tài khoản theo userId.
   */
  async accountById(userId: string): Promise<Account | null> {
    const { rows } = await this.query(`${accountSelect} WHERE u.id=$1`, [
      userId,
    ]);
    return rows[0] ?? null;
  }
  /**
   * Khởi tạo bản ghi intent đăng ký tài khoản với nonce bảo mật.
   */
  async beginIntent(email: string, nonce: string, time: Date) {
    await this.query(
      "INSERT INTO xiangqi_auth.registration_intents(email,nonce,created_at) VALUES($1,$2,$3) ON CONFLICT(email) DO UPDATE SET nonce=EXCLUDED.nonce,created_at=EXCLUDED.created_at WHERE xiangqi_auth.registration_intents.user_id IS NULL",
      [email, nonce, time],
    );
  }
  /**
   * Ràng buộc userId được tạo từ Supabase Auth với intent đăng ký tương ứng.
   */
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
  /**
   * Lưu hoặc cập nhật phiên nháp đăng ký (draft) vào cơ sở dữ liệu.
   */
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
  /**
   * Hoàn tất quá trình đăng ký: tạo hồ sơ (profile) cho người dùng trong cơ sở dữ liệu.
   */
  async complete(userId: string, username: string, time: Date) {
    try {
      const result = await this.query(
        `INSERT INTO public.profiles(user_id,username,display_name,completed_at,registration_pending)
        SELECT id,$2,$2,$3,true FROM xiangqi_auth.accounts WHERE id=$1 AND email_confirmed_at IS NOT NULL
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
  /**
   * Lấy danh sách các tài khoản đăng ký quá hạn cần được thu hồi hoặc dọn dẹp.
   */
  async staleAccounts(before: Date): Promise<Account[]> {
    const { rows } = await this.query(
      `${accountSelect} WHERE (p.completed_at IS NOT NULL AND p.registration_pending=true)
      OR (u.created_at <= $1 AND ${temporaryAccount} AND p.completed_at IS NULL)`,
      [before],
    );
    return rows;
  }
}
