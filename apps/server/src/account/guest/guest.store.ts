import type { Pool, PoolClient } from "pg";
import { actorLock, transaction } from "../../core/postgres.js";

export interface StoredGuest {
  userId: string;
  displayName: string;
  expiresAt: Date;
}
export interface ExpiryCursor {
  expiresAt: Date;
  tokenHash: string;
}
export interface ExpiredSession {
  token_hash: string;
  expires_at: Date;
}

/**
 * Store tương tác PostgreSQL cho miền dữ liệu khách (guest):
 * Quản lý phiên tạm guest_sessions, định danh principals và hồ sơ profiles.
 */
export class GuestStore {
  constructor(private readonly pool: Pool) {}
  transaction<T>(work: (c: PoolClient) => Promise<T>): Promise<T> {
    return transaction(this.pool, work);
  }
  /**
   * Thêm người dùng khách mới: chèn principal, profile và guest_session vào database.
   */
  async insertGuest(
    c: PoolClient,
    guest: {
      userId: string;
      displayName: string;
      tokenHash: string;
      createdAt: Date;
      expiresAt: Date;
    },
  ): Promise<void> {
    await c.query(
      "INSERT INTO xiangqi_auth.principals(id,kind) VALUES($1,'guest')",
      [guest.userId],
    );
    await c.query(
      "INSERT INTO public.profiles(user_id,username,display_name) VALUES($1,$2,$3)",
      [
        guest.userId,
        "g" + guest.userId.replaceAll("-", "").slice(0, 19),
        guest.displayName,
      ],
    );
    await c.query(
      "INSERT INTO xiangqi_auth.guest_sessions(token_hash,guest_id,created_at,expires_at) VALUES($1,$2,$3,$4)",
      [guest.tokenHash, guest.userId, guest.createdAt, guest.expiresAt],
    );
  }
  /**
   * Tìm guest_id sở hữu phiên dựa trên mã băm của token.
   */
  async findSessionOwner(
    c: PoolClient,
    tokenHash: string,
  ): Promise<string | undefined> {
    const row = (
      await c.query(
        "SELECT guest_id FROM xiangqi_auth.guest_sessions WHERE token_hash=$1",
        [tokenHash],
      )
    ).rows[0];
    return row?.guest_id;
  }
  lockActor(c: PoolClient, userId: string): Promise<void> {
    return actorLock(c, userId);
  }
  /**
   * Khóa dòng và truy vấn thông tin phiên khách đang hoạt động.
   */
  async findActiveGuest(
    c: PoolClient,
    tokenHash: string,
  ): Promise<StoredGuest | undefined> {
    return (
      await c.query(
        `SELECT s.guest_id AS "userId",s.expires_at AS "expiresAt",p.display_name AS "displayName" FROM xiangqi_auth.guest_sessions s JOIN xiangqi_auth.principals a ON a.id=s.guest_id AND a.kind='guest' JOIN public.profiles p ON p.user_id=s.guest_id WHERE s.token_hash=$1 AND s.ended_at IS NULL FOR UPDATE OF s`,
        [tokenHash],
      )
    ).rows[0];
  }
  /**
   * Kiểm tra xem khách có đang làm chủ phòng mở nào chưa kết thúc không.
   */
  async ownsOpenRoom(c: PoolClient, userId: string): Promise<boolean> {
    return Boolean(
      (
        await c.query(
          "SELECT 1 FROM public.rooms WHERE owner_id=$1 AND closed_at IS NULL LIMIT 1",
          [userId],
        )
      ).rowCount,
    );
  }
  async activeSessionExpiry(
    c: PoolClient,
    userId: string,
  ): Promise<Date | undefined> {
    const row = (
      await c.query(
        "SELECT expires_at FROM xiangqi_auth.guest_sessions WHERE guest_id=$1 AND ended_at IS NULL",
        [userId],
      )
    ).rows[0];
    return row?.expires_at;
  }
  /**
   * Ẩn danh hóa thông tin hiển thị của khách và xóa phiên guest_sessions.
   */
  async clearGuest(c: PoolClient, userId: string, at: Date): Promise<void> {
    await c.query(
      "UPDATE public.profiles SET display_name='Khách',updated_at=$2 WHERE user_id=$1",
      [userId, at],
    );
    await c.query("DELETE FROM xiangqi_auth.guest_sessions WHERE guest_id=$1", [
      userId,
    ]);
  }
  /**
   * Lấy danh sách các phiên khách đã quá hạn cần được thu hồi theo batch.
   */
  expiredSessions(
    now: Date,
    cursor: ExpiryCursor | null,
  ): Promise<ExpiredSession[]> {
    return transaction(
      this.pool,
      async (c) =>
        (
          await c.query(
            "SELECT token_hash,expires_at FROM xiangqi_auth.guest_sessions WHERE expires_at<=$1 AND ended_at IS NULL AND ($2::timestamptz IS NULL OR (expires_at,token_hash)>($2,$3)) ORDER BY expires_at,token_hash LIMIT 100",
            [now, cursor?.expiresAt ?? null, cursor?.tokenHash ?? null],
          )
        ).rows,
    );
  }
}
