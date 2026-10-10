import type { Pool, PoolClient } from "pg";
import type {
  AppSession,
  LoginAccount,
  LoginStore,
  LoginAttempts,
} from "./contracts.js";
const accountSelect = `SELECT u.id AS "userId",u.email,p.username,
  (u.email_confirmed_at IS NOT NULL AND p.completed_at IS NOT NULL AND NOT p.registration_pending) AS active
  FROM xiangqi_auth.accounts u JOIN public.profiles p ON p.user_id=u.id`;
export class PostgresLoginStore implements LoginStore {
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
  async withUsernameLock<T>(
    username: string,
    work: (store: LoginStore) => Promise<T>,
  ): Promise<T> {
    const client = await this.pool.connect();
    let acquired = false;
    let broken = false;
    try {
      await client.query("SET ROLE app_server");
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
        await client.query("RESET ROLE");
      } catch {
        broken = true;
      }
      client.release(broken);
    }
  }
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
  async saveAttempts(username: string, attempts: LoginAttempts) {
    await this.query(
      `INSERT INTO xiangqi_auth.login_attempts(username_key,failures,blocked_until) VALUES($1,$2,$3) ON CONFLICT(username_key) DO UPDATE SET failures=EXCLUDED.failures,blocked_until=EXCLUDED.blocked_until`,
      [username, attempts.failures, attempts.blockedUntil],
    );
  }
  async resetAttempts(username: string) {
    await this.query(
      "DELETE FROM xiangqi_auth.login_attempts WHERE username_key=$1",
      [username],
    );
  }
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
  async saveSession(session: AppSession) {
    await this.query(
      `INSERT INTO xiangqi_auth.app_sessions(token_hash,user_id,created_at,expires_at,remember) VALUES($1,$2,$3,$4,$5)`,
      [
        session.tokenHash,
        session.userId,
        session.createdAt,
        session.expiresAt,
        session.remember,
      ],
    );
  }
  async sessionByHash(hash: string): Promise<AppSession | null> {
    return (
      (
        await this.query(
          `SELECT token_hash AS "tokenHash",user_id AS "userId",created_at AS "createdAt",expires_at AS "expiresAt",remember,revoked_at AS "revokedAt" FROM xiangqi_auth.app_sessions WHERE token_hash=$1`,
          [hash],
        )
      ).rows[0] ?? null
    );
  }
  async revokeSession(hash: string, time: Date) {
    await this.query(
      "UPDATE xiangqi_auth.app_sessions SET revoked_at=COALESCE(revoked_at,$2) WHERE token_hash=$1",
      [hash, time],
    );
  }
}
