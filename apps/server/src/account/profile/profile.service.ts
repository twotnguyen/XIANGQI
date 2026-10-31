import {
  containsForbiddenName,
  normalizeDisplayName,
  isValidDisplayName,
  isThemeChoice,
  type ThemeChoice,
} from "@xiangqi/shared";
import type { ProfileStore } from "./profile.store.js";
import {
  ProfileError,
  type ProfileLocation,
  type ProfileView,
} from "./profile.types.js";

function fail(code: string, message: string, status = 409): never {
  throw new ProfileError(code, message, status);
}
/** Body chỉ được có đúng khóa `theme` với giá trị trong danh sách cho phép; không mặc định. */
function themeInput(input: unknown): ThemeChoice {
  if (typeof input !== "object" || input === null || Array.isArray(input))
    fail("PROFILE_THEME_INVALID", "Giao diện không hợp lệ", 400);
  const keys = Object.keys(input);
  if (keys.length !== 1 || keys[0] !== "theme")
    fail("PROFILE_THEME_INVALID", "Giao diện không hợp lệ", 400);
  if (!("theme" in input) || !isThemeChoice(input.theme))
    fail("PROFILE_THEME_INVALID", "Giao diện không hợp lệ", 400);
  return input.theme;
}
function displayName(input: unknown): string {
  if (typeof input !== "string")
    fail("PROFILE_NAME_INVALID", "Tên hiển thị cần 2–30 ký tự", 400);
  const name = normalizeDisplayName(input);
  if (containsForbiddenName(name))
    fail("PROFILE_NAME_FORBIDDEN", "Tên hiển thị chứa từ không được phép", 400);
  if (!isValidDisplayName(name))
    fail("PROFILE_NAME_INVALID", "Tên hiển thị cần 2–30 ký tự hợp lệ", 400);
  return name;
}
/**
 * Dịch vụ xử lý nghiệp vụ hồ sơ người dùng:
 * Đọc thông tin cá nhân, kiểm tra tính hợp lệ và từ cấm của tên hiển thị, và xác định vị trí trong phòng chơi.
 */
export class ProfileService {
  constructor(private readonly store: ProfileStore) {}
  /**
   * Đọc thông tin hồ sơ của người dùng (tên đăng nhập, email, tên hiển thị).
   */
  async read(
    userId: string,
    identity: { username: string; email: string },
  ): Promise<ProfileView> {
    const row = await this.store.read(userId);
    return {
      userId,
      username: row.username ?? identity.username,
      email: row.email,
      displayName: row.displayName,
    };
  }
  /**
   * Kiểm tra định dạng và cập nhật tên hiển thị mới của người dùng.
   */
  async updateDisplayName(
    userId: string,
    input: unknown,
  ): Promise<{ displayName: string }> {
    const name = displayName(input);
    await this.store.updateDisplayName(userId, name);
    return { displayName: name };
  }
  /**
   * Đọc lựa chọn giao diện đã lưu của tài khoản.
   */
  async readTheme(userId: string): Promise<{ theme: ThemeChoice }> {
    return { theme: await this.store.theme(userId) };
  }
  /**
   * Lưu lựa chọn giao diện; lỗi validation không ghi gì vào CSDL.
   */
  async updateTheme(
    userId: string,
    input: unknown,
  ): Promise<{ theme: ThemeChoice }> {
    const theme = themeInput(input);
    await this.store.setTheme(userId, theme);
    return { theme };
  }
  /**
   * Xác định vị trí phòng chơi hiện tại của người dùng (chưa vào phòng, đang chờ, hoặc đang trong ván cờ).
   */
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
