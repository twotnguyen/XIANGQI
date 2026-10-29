import { Pool, type PoolClient, type PoolConfig } from "pg";
import type {
  AppSession,
  LoginAccount,
  LoginStore,
  LoginAttempts,
  SessionAccount,
} from "./login.types.js";
const accountActive = `(u.email_confirmed_at IS NOT NULL AND p.completed_at IS NOT NULL AND NOT p.registration_pending)`;
const accountSelect = `SELECT u.id AS "userId",u.email,p.username,
  ${accountActive} AS active
  FROM xiangqi_auth.accounts u JOIN public.profiles p ON p.user_id=u.id`;
/**
 * Tạo pool riêng cho đăng nhập và phiên. Mỗi kết nối vật lý mới chạy `SET ROLE app_server`
 * trong onConnect của pg-pool; nếu lệnh lỗi, kết nối không được đưa vào pool.
 * Chỉ dùng pool này cho PostgresLoginStore. Không RESET ROLE và không dùng chung với pool quản trị.
 */
export function createLoginPool(config: PoolConfig): Pool {
  const options: PoolConfig & {
    onConnect: (client: PoolClient) => Promise<void>;
  } = {
    ...config,
    onConnect: async (client) => {
      await client.query("SET ROLE app_server");
    },
  };
  return new Pool(options);
}
/**
 * Store tương tác cơ sở dữ liệu PostgreSQL cho tính năng đăng nhập và quản lý phiên (app sessions).
 * `pool` BẮT BUỘC lấy từ createLoginPool: store không đổi role, mọi kết nối đã là app_server.
 */
export class PostgresLoginStore implements LoginStore {
  constructor(
    private readonly pool: Pool,
    private readonly client?: PoolClient,
  ) {}
  private query(text: string, values: unknown[] = []) {
    return this.client
      ? this.client.query(text, values)
      : this.pool.query(text, values);
  }
  /**
   * Khóa advisory lock theo username trong thời gian thực thi thao tác để ngăn chặn đăng nhập đồng thời.
   */
  async withUsernameLock<T>(
    username: string,
    work: (store: LoginStore) => Promise<T>,
  ): Promise<T> {
    const client = await this.pool.connect();
    let acquired = false;
    let broken = false;
    try {
      await client.query("SELECT pg_advisory_lock(hashtextextended($1,0))", [
        `login:${username}`,
      ]);
      acquired = true;
      return await work(new PostgresLoginStore(this.pool, client));
    } finally {
      try {
        if (acquired)
          await client.query(
            "SELECT pg_advisory_unlock(hashtextextended($1,0))",
            [`login:${username}`],
          );
      } catch {
        broken = true;
      }
      client.release(broken);
    }
  }
  /**
   * Đọc số lần đăng nhập thất bại và thời gian bị tạm khóa của username.
   */
  async attempts(username: string): Promise<LoginAttempts> {
    return (
      (
        await this.query(
          'SELECT failures,blocked_until AS "blockedUntil" FROM xiangqi_auth.login_attempts WHERE username_key=$1',
          [username],
        )
      ).rows[0] ?? { failures: [], blockedUntil: null }
    );
  }
  /**
   * Lưu lại thông tin các lần đăng nhập sai và mốc khóa tài khoản.
   */
  async saveAttempts(username: string, attempts: LoginAttempts) {
    await this.query(
      `INSERT INTO xiangqi_auth.login_attempts(username_key,failures,blocked_until) VALUES($1,$2,$3) ON CONFLICT(username_key) DO UPDATE SET failures=EXCLUDED.failures,blocked_until=EXCLUDED.blocked_until`,
      [username, attempts.failures, attempts.blockedUntil],
    );
  }
  /**
   * Xóa lịch sử các lần đăng nhập sai sau khi đăng nhập thành công.
   */
  async resetAttempts(username: string) {
    await this.query(
      "DELETE FROM xiangqi_auth.login_attempts WHERE username_key=$1",
      [username],
    );
  }
  /**
   * Tìm kiếm tài khoản đăng nhập theo username.
   */
  async accountByUsername(username: string): Promise<LoginAccount | null> {
    return (
      (
        await this.query(`${accountSelect} WHERE lower(p.username)=lower($1)`, [
          username,
        ])
      ).rows[0] ?? null
    );
  }
  async accountById(userId: string): Promise<LoginAccount | null> {
    return (
      (await this.query(`${accountSelect} WHERE u.id=$1`, [userId])).rows[0] ??
      null
    );
  }
  /**
   * Lưu bản ghi phiên ứng dụng mới (app session) vào bảng xiangqi_auth.app_sessions.
   */
  saveSession(session: AppSession) {
    return saveAppSession(this.client ?? this.pool, session);
  }
  /**
   * Device hash of the user's newest session, or undefined when the user has never logged in.
   */
  async latestDeviceHash(userId: string): Promise<string | null | undefined> {
    const row = (
      await this.query(
        'SELECT device_hash AS "deviceHash" FROM xiangqi_auth.app_sessions WHERE user_id=$1 ORDER BY (revoked_at IS NULL) DESC, created_at DESC, revoked_at DESC NULLS FIRST LIMIT 1',
        [userId],
      )
    ).rows[0] as { deviceHash: string | null } | undefined;
    return row ? row.deviceHash : undefined;
  }
  /**
   * Truy vấn thông tin phiên làm việc và tài khoản liên kết theo mã băm token.
   */
  async sessionByHash(hash: string): Promise<SessionAccount | null> {
    return (
      (
        await this.query(
          `SELECT s.token_hash AS "tokenHash",s.user_id AS "userId",s.created_at AS "createdAt",
            s.expires_at AS "expiresAt",s.remember,s.revoked_at AS "revokedAt",
            CASE WHEN u.id IS NULL OR p.user_id IS NULL THEN NULL ELSE
              jsonb_build_object('userId',u.id,'email',u.email,'username',p.username,'active',${accountActive})
            END AS account
            FROM xiangqi_auth.app_sessions s
            LEFT JOIN xiangqi_auth.accounts u ON u.id=s.user_id
            LEFT JOIN public.profiles p ON p.user_id=u.id
            WHERE s.token_hash=$1`,
          [hash],
        )
      ).rows[0] ?? null
    );
  }
  /**
   * Đánh dấu thu hồi (đăng xuất) phiên làm việc trong cơ sở dữ liệu.
   */
  async revokeSession(hash: string, time: Date) {
    await this.query(
      "UPDATE xiangqi_auth.app_sessions SET revoked_at=COALESCE(revoked_at,$2) WHERE token_hash=$1",
      [hash, time],
    );
  }
}

/** Reuse the same atomic session write inside a room lifecycle transaction. */
export async function saveAppSession(
  client: Pick<PoolClient, "query">,
  session: AppSession,
): Promise<void> {
  await client.query(
    `WITH revoked AS (UPDATE xiangqi_auth.app_sessions SET revoked_at=$3 WHERE user_id=$2 AND revoked_at IS NULL)
     INSERT INTO xiangqi_auth.app_sessions(token_hash,user_id,created_at,expires_at,remember,device_hash) VALUES($1,$2,$3,$4,$5,$6)`,
    [
      session.tokenHash,
      session.userId,
      session.createdAt,
      session.expiresAt,
      session.remember,
      session.deviceHash,
    ],
  );
}
