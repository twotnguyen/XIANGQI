import { DEFAULT_THEME, type ThemeChoice } from "@xiangqi/shared";
import type { Pool, PoolClient } from "pg";
import { actorLock, transaction } from "../../core/postgres.js";
import { ProfileError } from "./profile.types.js";

export interface ProfileRow {
  username: string | null;
  displayName: string;
  email: string | null;
}
export interface LocationRow {
  roomId: string | null;
  status: string;
  currentMatchId: string | null;
  mode: string | null;
}
/**
 * Store tương tác cơ sở dữ liệu PostgreSQL cho bảng profiles và thông tin thành viên phòng room_members.
 */
export class ProfileStore {
  constructor(private readonly pool: Pool) {}
  private withUser<T>(
    userId: string,
    work: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    return transaction(this.pool, async (client) => {
      await actorLock(client, userId);
      return work(client);
    });
  }
  private async row(client: PoolClient, userId: string): Promise<ProfileRow> {
    const row = (
      await client.query(
        `SELECT p.username,p.display_name,
          CASE WHEN e.user_id IS NULL THEN a.email ELSE e.email END AS email
         FROM public.profiles p JOIN xiangqi_auth.accounts a ON a.id=p.user_id
         LEFT JOIN xiangqi_auth.username_accounts e ON e.user_id=p.user_id
         WHERE p.user_id=$1`,
        [userId],
      )
    ).rows[0];
    if (!row)
      throw new ProfileError("PROFILE_MISSING", "Không tìm thấy hồ sơ", 404);
    return {
      username: row.username,
      displayName: row.display_name,
      email: row.email,
    };
  }
  /**
   * Truy vấn thông tin hồ sơ của người dùng từ bảng public.profiles.
   */
  read(userId: string): Promise<ProfileRow> {
    return this.withUser(userId, (client) => this.row(client, userId));
  }
  /**
   * Cập nhật trường display_name và thời điểm updated_at trong bảng public.profiles.
   */
  updateDisplayName(userId: string, displayName: string): Promise<void> {
    return this.withUser(userId, async (client) => {
      await this.row(client, userId);
      await client.query(
        "UPDATE public.profiles SET display_name=$2,updated_at=clock_timestamp() WHERE user_id=$1",
        [userId, displayName],
      );
    });
  }
  /**
   * Truy vấn thông tin phòng mở gần nhất mà người dùng đang tham gia (bảng room_members và rooms).
   */
  location(userId: string): Promise<LocationRow | null> {
    return transaction(this.pool, async (client) => {
      const row = (
        await client.query(
          `SELECT NULL::uuid AS room_id,'PLAYING' AS status,
             (to_jsonb(a)->>'ai_game_id')::uuid AS current_match_id,'AI' AS mode
           FROM public.active_players a WHERE a.user_id=$1 AND to_jsonb(a)->>'ai_game_id' IS NOT NULL
           UNION ALL
           SELECT r.id AS room_id,r.status,r.current_match_id,m.mode
           FROM public.room_members rm JOIN public.rooms r ON r.id=rm.room_id
           LEFT JOIN public.matches m ON m.id=r.current_match_id
           WHERE rm.user_id=$1 AND rm.role='PLAYER' AND r.closed_at IS NULL
           LIMIT 1`,
          [userId],
        )
      ).rows[0];
      if (!row) return null;
      return {
        roomId: row.room_id,
        status: row.status,
        currentMatchId: row.current_match_id,
        mode: row.mode,
      };
    });
  }

  /**
   * Đọc lựa chọn giao diện của tài khoản; chưa chọn trả mặc định Kỳ Đài Cổ Phong.
   */
  theme(userId: string): Promise<ThemeChoice> {
    return this.withUser(userId, async (client) => {
      const row = (
        await client.query(
          "SELECT theme_choice FROM public.profiles WHERE user_id=$1",
          [userId],
        )
      ).rows[0];
      if (!row)
        throw new ProfileError("PROFILE_MISSING", "Không tìm thấy hồ sơ", 404);
      return (row.theme_choice as ThemeChoice | null) ?? DEFAULT_THEME;
    });
  }

  /**
   * Ghi lựa chọn giao diện; ghi lại cùng giá trị là không đổi trạng thái.
   */
  setTheme(userId: string, theme: ThemeChoice): Promise<void> {
    return this.withUser(userId, async (client) => {
      const result = await client.query(
        "UPDATE public.profiles SET theme_choice=$2,updated_at=clock_timestamp() WHERE user_id=$1",
        [userId, theme],
      );
      if (result.rowCount !== 1)
        throw new ProfileError("PROFILE_MISSING", "Không tìm thấy hồ sơ", 404);
    });
  }
}
