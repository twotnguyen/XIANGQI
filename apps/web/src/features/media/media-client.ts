import type { RoomControlProof } from "@xiangqi/shared";
export type ShareLevel = "NONE" | "OPPONENT" | "ALL";
export type AuthorizedFetch = (
  path: string,
  init?: RequestInit,
) => Promise<Response>;
export interface MediaToken {
  url: string;
  token: string;
  roomName: string;
  expiresAt: string;
  stage: { token: string; roomName: string } | null;
}
export class MediaRequestError extends Error {
  constructor(
    public readonly code: string,
    public readonly status: number,
  ) {
    super("Chưa thể kết nối camera hoặc mic. Vui lòng thử lại.");
  }
}
function record(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new MediaRequestError("MEDIA_BAD_RESPONSE", 502);
  return value as Record<string, unknown>;
}
/**
 * Khởi tạo client tương tác API đa phương tiện LiveKit (lấy token kết nối phòng, đọc và cập nhật mức độ chia sẻ camera/mic).
 */
export function createMediaClient(authorizedFetch: AuthorizedFetch) {
  async function request<T>(
    path: string,
    parse: (value: unknown) => T,
    body?: object,
  ): Promise<T> {
    const response = await authorizedFetch(path, {
      method: body ? "POST" : "GET",
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
      let code = "MEDIA_UNAVAILABLE";
      try {
        const value = (await response.json()) as { code?: unknown };
        if (typeof value.code === "string") code = value.code;
      } catch {
        /* Do not display upstream response bodies. */
      }
      throw new MediaRequestError(code, response.status);
    }
    try {
      return parse(await response.json());
    } catch (error) {
      if (error instanceof MediaRequestError) throw error;
      throw new MediaRequestError("MEDIA_BAD_RESPONSE", 502);
    }
  }
  function parseToken(value: unknown): MediaToken {
    const token = record(value),
      stage = token.stage;
    if (
      typeof token.url !== "string" ||
      typeof token.token !== "string" ||
      typeof token.roomName !== "string" ||
      typeof token.expiresAt !== "string"
    )
      throw new MediaRequestError("MEDIA_BAD_RESPONSE", 502);
    if (stage !== null && stage !== undefined) {
      const live = record(stage);
      if (typeof live.token !== "string" || typeof live.roomName !== "string")
        throw new MediaRequestError("MEDIA_BAD_RESPONSE", 502);
    }
    return {
      url: token.url,
      token: token.token,
      roomName: token.roomName,
      expiresAt: token.expiresAt,
      stage:
        stage === null || stage === undefined
          ? null
          : {
              token: (stage as { token: string }).token,
              roomName: (stage as { roomName: string }).roomName,
            },
    };
  }
  return {
    token: (roomId: string, camera: boolean, mic: boolean, tabId: string) =>
      request("/media/token", parseToken, { roomId, camera, mic, tabId }),
    setShare: (roomId: string, level: ShareLevel, control: RoomControlProof) =>
      request(
        "/media/share",
        (value) => {
          const result = record(value);
          if (!["NONE", "OPPONENT", "ALL"].includes(result.level as string))
            throw new MediaRequestError("MEDIA_BAD_RESPONSE", 502);
          return { level: result.level as ShareLevel };
        },
        { roomId, level, control },
      ),
    getShare: (roomId: string) =>
      request(`/media/share?roomId=${encodeURIComponent(roomId)}`, (value) => {
        const result = record(value);
        if (!["NONE", "OPPONENT", "ALL"].includes(result.level as string))
          throw new MediaRequestError("MEDIA_BAD_RESPONSE", 502);
        return { level: result.level as ShareLevel };
      }),
  };
}
export type MediaClient = ReturnType<typeof createMediaClient>;
