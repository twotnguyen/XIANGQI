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
    public readonly retryAfterDays?: number,
  ) {
    super("Chưa thể cập nhật hồ sơ. Vui lòng thử lại.");
  }
}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new ProfileRequestError("PROFILE_BAD_RESPONSE", 502);
  return value as Record<string, unknown>;
}
export interface UsernameSent {
  requestId: string;
  expiresAt: string;
  resendAt: string;
  maskedEmail: string | null;
}
function usernameSent(value: unknown): UsernameSent {
  const result = record(value);
  if (
    typeof result.requestId !== "string" ||
    typeof result.expiresAt !== "string" ||
    typeof result.resendAt !== "string"
  )
    throw new ProfileRequestError("PROFILE_BAD_RESPONSE", 502);
  return {
    requestId: result.requestId,
    expiresAt: result.expiresAt,
    resendAt: result.resendAt,
    maskedEmail:
      typeof result.maskedEmail === "string" ? result.maskedEmail : null,
  };
}
function usernameChanged(value: unknown): string {
  const result = record(value);
  if (typeof result.username !== "string")
    throw new ProfileRequestError("PROFILE_BAD_RESPONSE", 502);
  return result.username;
}
export interface UsernameCapability {
  changeToken: string;
  expiresAt: string;
}
function usernameCapability(value: unknown): UsernameCapability {
  const result = record(value);
  if (
    typeof result.changeToken !== "string" ||
    typeof result.expiresAt !== "string"
  )
    throw new ProfileRequestError("PROFILE_BAD_RESPONSE", 502);
  return { changeToken: result.changeToken, expiresAt: result.expiresAt };
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
      let retryAfterDays: number | undefined;
      try {
        const value = (await response.json()) as {
          code?: unknown;
          retryAfterDays?: unknown;
        };
        if (typeof value.code === "string") code = value.code;
        if (
          code === "USERNAME_CHANGE_LIMITED" &&
          typeof value.retryAfterDays === "number" &&
          Number.isInteger(value.retryAfterDays) &&
          value.retryAfterDays >= 1 &&
          value.retryAfterDays <= 7
        )
          retryAfterDays = value.retryAfterDays;
      } catch {
        /* Do not display upstream response bodies. */
      }
      throw new ProfileRequestError(code, response.status, retryAfterDays);
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
    changePassword: (body: {
      currentPassword: string;
      newPassword: string;
      passwordConfirmation: string;
    }) => request("/account/password/change", accepted, body),
    changeUsernameRequest: () =>
      request("/account/username/change/request", usernameSent, {}),
    changeUsernameResend: (requestId: string) =>
      request("/account/username/change/resend", usernameSent, { requestId }),
    changeUsernameVerify: (requestId: string, otp: string) =>
      request("/account/username/change/verify", usernameCapability, {
        requestId,
        otp,
      }),
    changeUsernameFinalize: (changeToken: string, username: string) =>
      request("/account/username/change/finalize", usernameChanged, {
        changeToken,
        username,
      }),
  };
}
export type ProfileClient = ReturnType<typeof createProfileClient>;
