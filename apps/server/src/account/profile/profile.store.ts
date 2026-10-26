import type { Pool, PoolClient } from "pg";
import { actorLock, transaction } from "../google/postgres.js";
import { ProfileError } from "./profile.types.js";

export interface ProfileRow {
  username: string | null;
  displayName: string;
}
export interface LocationRow {
  roomId: string;
  status: string;
  currentMatchId: string | null;
  mode: string | null;
}
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
        "SELECT username,display_name FROM public.profiles WHERE user_id=$1",
        [userId],
      )
    ).rows[0];
    if (!row)
      throw new ProfileError("PROFILE_MISSING", "Không tìm thấy hồ sơ", 404);
    return { username: row.username, displayName: row.display_name };
  }
  read(userId: string): Promise<ProfileRow> {
    return this.withUser(userId, (client) => this.row(client, userId));
  }
  updateDisplayName(userId: string, displayName: string): Promise<void> {
    return this.withUser(userId, async (client) => {
      await this.row(client, userId);
      await client.query(
        "UPDATE public.profiles SET display_name=$2,updated_at=clock_timestamp() WHERE user_id=$1",
        [userId, displayName],
      );
    });
  }
  location(userId: string): Promise<LocationRow | null> {
    return transaction(this.pool, async (client) => {
      const row = (
        await client.query(
          `SELECT r.id AS room_id,r.status,r.current_match_id,m.mode
           FROM public.room_members rm JOIN public.rooms r ON r.id=rm.room_id
           LEFT JOIN public.matches m ON m.id=r.current_match_id
           WHERE rm.user_id=$1 AND r.closed_at IS NULL
           ORDER BY rm.joined_at DESC LIMIT 1`,
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
}
