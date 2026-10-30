import { isThemeChoice, type ThemeChoice } from "@xiangqi/shared";
import { ProfileRequestError, type AuthorizedFetch } from "./profile-client.js";

/**
 * Hợp đồng client đọc/lưu chủ đề theo tài khoản (GET/PUT /profile/theme).
 */
export interface ThemeClient {
  read(): Promise<ThemeChoice>;
  save(theme: ThemeChoice): Promise<ThemeChoice>;
}

function themeOf(value: unknown): ThemeChoice {
  if (
    typeof value !== "object" ||
    value === null ||
    Array.isArray(value) ||
    !("theme" in value) ||
    !isThemeChoice(value.theme)
  )
    throw new ProfileRequestError("PROFILE_BAD_RESPONSE", 502);
  return value.theme;
}

export function createThemeClient(
  authorizedFetch: AuthorizedFetch,
): ThemeClient {
  async function request(
    path: string,
    init?: RequestInit,
  ): Promise<ThemeChoice> {
    const response = await authorizedFetch(path, {
      redirect: "error",
      cache: "no-store",
      ...init,
    });
    if (!response.ok) {
      let code = "PROFILE_UNAVAILABLE";
      try {
        const value: unknown = await response.json();
        if (
          typeof value === "object" &&
          value !== null &&
          "code" in value &&
          typeof value.code === "string"
        )
          code = value.code;
      } catch {
        /* Không hiển thị nội dung phản hồi từ server. */
      }
      throw new ProfileRequestError(code, response.status);
    }
    try {
      return themeOf(await response.json());
    } catch (error) {
      if (error instanceof ProfileRequestError) throw error;
      throw new ProfileRequestError("PROFILE_BAD_RESPONSE", 502);
    }
  }

  return {
    read: () => request("/profile/theme"),
    save: (theme) =>
      request("/profile/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ theme }),
      }),
  };
}
