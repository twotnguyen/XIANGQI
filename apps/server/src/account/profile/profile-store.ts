import type { Pool, PoolClient } from "pg";
import { containsForbiddenName } from "@xiangqi/shared";
import { actorLock, transaction } from "../google/postgres.js";
import {
  DISPLAY_NAME_MAX,
  DISPLAY_NAME_MIN,
  ProfileError,
  type ProfileLocation,
  type ProfileView,
} from "./profile.types.js";
function fail(code: string, message: string, status = 409): never {
  throw new ProfileError(code, message, status);
}
function displayName(input: unknown): string {
  if (typeof input !== "string")
    fail("PROFILE_NAME_INVALID", "Tên hiển thị cần 2–30 ký tự", 400);
  const name = (input as string).normalize("NFC").trim();
  const length = Array.from(name).length;
  if (length < DISPLAY_NAME_MIN || length > DISPLAY_NAME_MAX)
    fail("PROFILE_NAME_INVALID", "Tên hiển thị cần 2–30 ký tự", 400);
  if (
    Array.from(name).some((character) => {
      const code = character.codePointAt(0)!;
      return code < 32 || (code >= 127 && code <= 159);
    }) ||
    containsForbiddenName(name)
  )
    fail("PROFILE_NAME_FORBIDDEN", "Tên hiển thị chứa từ không được phép", 400);
  return name;
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
  private async row(
    client: PoolClient,
    userId: string,
  ): Promise<{ username: string; display_name: string }> {
    const row = (
      await client.query(
        "SELECT username,display_name FROM public.profiles WHERE user_id=$1",
        [userId],
      )
    ).rows[0];
    if (!row) fail("PROFILE_MISSING", "Không tìm thấy hồ sơ", 404);
    return row;
  }
  async read(
    userId: string,
    identity: { username: string; email: string },
  ): Promise<ProfileView> {
    return this.withUser(userId, async (client) => {
      const row = await this.row(client, userId);
      return {
        userId,
        username: row.username ?? identity.username,
        email: identity.email,
        displayName: row.display_name,
      };
    });
  }
  async updateDisplayName(
    userId: string,
    input: unknown,
  ): Promise<{ displayName: string }> {
    const name = displayName(input);
    return this.withUser(userId, async (client) => {
      await this.row(client, userId);
      await client.query(
        "UPDATE public.profiles SET display_name=$2,updated_at=clock_timestamp() WHERE user_id=$1",
        [userId, name],
      );
      return { displayName: name };
    });
  }
  async location(userId: string): Promise<ProfileLocation> {
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
      if (!row) return { kind: "none", roomId: null, matchId: null };
      if (row.status === "PLAYING" && row.current_match_id)
        return {
          kind: row.mode === "AI" ? "playing-ai" : "playing-online",
          roomId: row.room_id as string,
          matchId: row.current_match_id as string,
        };
      return {
        kind: "waiting",
        roomId: row.room_id as string,
        matchId: null,
      };
    });
  }
}
