export interface ProfileView {
  userId: string;
  username: string;
  email: string | null;
  displayName: string;
}
export type ProfileLocationKind =
  "none" | "waiting" | "playing-online" | "playing-ai";
export interface ProfileLocation {
  kind: ProfileLocationKind;
  roomId: string | null;
  matchId: string | null;
}
export type AuthorizedFetch = (
  path: string,
  init?: RequestInit,
) => Promise<Response>;
export class ProfileRequestError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
  ) {
    super("Chưa thể cập nhật hồ sơ. Vui lòng thử lại.");
  }
}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new ProfileRequestError("PROFILE_BAD_RESPONSE", 502);
  return value as Record<string, unknown>;
}
/**
 * Khởi tạo client gọi API hồ sơ cá nhân (đọc thông tin, cập nhật tên hiển thị, kiểm tra trạng thái phòng/trận đang tham gia).
 */
export function createProfileClient(authorizedFetch: AuthorizedFetch) {
  async function request<T>(
    path: string,
    parse: (value: unknown) => T,
    body?: object,
    method?: "PATCH",
  ): Promise<T> {
    const response = await authorizedFetch(path, {
      method: method ?? (body ? "POST" : "GET"),
      redirect: "error",
      cache: "no-store",
      ...(body
        ? {
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body),
          }
        : {}),
    });
    if (!response.ok) {
      let code = "PROFILE_UNAVAILABLE";
      try {
        const value = (await response.json()) as { code?: unknown };
        if (typeof value.code === "string") code = value.code;
      } catch {
        /* Do not display upstream response bodies. */
      }
      throw new ProfileRequestError(code, response.status);
    }
    try {
      return parse(await response.json());
    } catch (error) {
      if (error instanceof ProfileRequestError) throw error;
      throw new ProfileRequestError("PROFILE_BAD_RESPONSE", 502);
    }
  }
  function accepted(value: unknown) {
    record(value);
  }
  return {
    read: () =>
      request("/profile", (value) => {
        const view = record(value);
        if (
          typeof view.userId !== "string" ||
          typeof view.username !== "string" ||
          (view.email !== null && typeof view.email !== "string") ||
          typeof view.displayName !== "string"
        )
          throw new ProfileRequestError("PROFILE_BAD_RESPONSE", 502);
        return view as unknown as ProfileView;
      }),
    updateDisplayName: (displayName: string) =>
      request(
        "/profile",
        (value) => {
          const result = record(value);
          if (typeof result.displayName !== "string")
            throw new ProfileRequestError("PROFILE_BAD_RESPONSE", 502);
          return { displayName: result.displayName };
        },
        { displayName },
        "PATCH",
      ),
    location: () =>
      request("/profile/location", (value) => {
        const result = record(value);
        if (
          !["none", "waiting", "playing-online", "playing-ai"].includes(
            result.kind as string,
          )
        )
          throw new ProfileRequestError("PROFILE_BAD_RESPONSE", 502);
        return {
          kind: result.kind as ProfileLocationKind,
          roomId: typeof result.roomId === "string" ? result.roomId : null,
          matchId: typeof result.matchId === "string" ? result.matchId : null,
        };
      }),
    sendEmail: (email: string) =>
      request("/account/email/send", accepted, { email }),
    resendEmail: () => request("/account/email/resend", accepted, {}),
    verifyEmail: (otp: string) =>
      request("/account/email/verify", accepted, { otp }),
  };
}
export type ProfileClient = ReturnType<typeof createProfileClient>;
