import type { PoolClient } from "pg";
import type { AppSession } from "../../account/login/login.types.js";
import { saveAppSession } from "../../account/login/postgres-login-store.js";

export interface SeatMembership {
  room_id: string;
  role: string;
  status: string;
}

/**
 * SQL của ghế phòng và phiên khi đăng nhập thiết bị khác hoặc đăng xuất.
 * Chỉ gọi trong scope RoomTransactions.withRoom đã khóa actor.
 */
export class SessionSeatStore {
  async memberships(client: PoolClient, userId: string) {
    const result = await client.query<SeatMembership>(
      "SELECT m.room_id,m.role,r.status FROM public.room_members m JOIN public.rooms r ON r.id=m.room_id WHERE m.user_id=$1 AND r.closed_at IS NULL ORDER BY m.room_id",
      [userId],
    );
    return result.rows;
  }

  async aiGameId(client: PoolClient, userId: string) {
    const result = await client.query<{ ai_game_id: string | null }>(
      "SELECT to_jsonb(a)->>'ai_game_id' AS ai_game_id FROM public.active_players a WHERE user_id=$1",
      [userId],
    );
    return result.rows[0]?.ai_game_id ?? null;
  }

  /** Phiên còn hiệu lực dưới khóa actor; chặn logout bằng phiên đã bị thu hồi. */
  async sessionActive(client: PoolClient, userId: string, sessionHash: string) {
    // Deadline sampled in the database after the locks are held, not the caller's pre-lock clock.
    const result = await client.query(
      "SELECT 1 FROM xiangqi_auth.app_sessions WHERE token_hash=$1 AND user_id=$2 AND revoked_at IS NULL AND expires_at>clock_timestamp()",
      [sessionHash, userId],
    );
    return (result.rowCount ?? 0) > 0;
  }

  /** Tài khoản còn hoạt động (cùng điều kiện với đăng nhập), đọc dưới khóa actor. */
  async accountActive(client: PoolClient, userId: string) {
    const result = await client.query(
      "SELECT 1 FROM xiangqi_auth.accounts u JOIN public.profiles p ON p.user_id=u.id WHERE u.id=$1 AND u.email_confirmed_at IS NOT NULL AND p.completed_at IS NOT NULL AND NOT p.registration_pending",
      [userId],
    );
    return (result.rowCount ?? 0) > 0;
  }

  replace(client: PoolClient, session: AppSession) {
    return saveAppSession(client, session);
  }
  async revokeAll(client: PoolClient, userId: string, at: Date) {
    await client.query(
      "UPDATE xiangqi_auth.app_sessions SET revoked_at=COALESCE(revoked_at,$2) WHERE user_id=$1 AND revoked_at IS NULL",
      [userId, at],
    );
  }
}
