import { containsForbiddenName } from "@xiangqi/shared";
import type { ProfileStore } from "./profile.store.js";
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
/** Business rules for the profile; all SQL lives in ProfileStore. */
export class ProfileService {
  constructor(private readonly store: ProfileStore) {}
  async read(
    userId: string,
    identity: { username: string; email: string },
  ): Promise<ProfileView> {
    const row = await this.store.read(userId);
    return {
      userId,
      username: row.username ?? identity.username,
      email: identity.email,
      displayName: row.displayName,
    };
  }
  async updateDisplayName(
    userId: string,
    input: unknown,
  ): Promise<{ displayName: string }> {
    const name = displayName(input);
    await this.store.updateDisplayName(userId, name);
    return { displayName: name };
  }
  async location(userId: string): Promise<ProfileLocation> {
    const row = await this.store.location(userId);
    if (!row) return { kind: "none", roomId: null, matchId: null };
    if (row.status === "PLAYING" && row.currentMatchId)
      return {
        kind: row.mode === "AI" ? "playing-ai" : "playing-online",
        roomId: row.roomId,
        matchId: row.currentMatchId,
      };
    return { kind: "waiting", roomId: row.roomId, matchId: null };
  }
}
