import { SignJWT } from "jose";
import type { MediaStore, MediaTx } from "./media.store.js";
import {
  MediaError,
  SHARE_LEVELS,
  privateRoomName,
  stageRoomName,
  type MediaToken,
  type ShareLevel,
} from "./media.types.js";
export interface MediaConfig {
  url: string;
  apiKey: string;
  apiSecret: string;
}
interface VideoGrant {
  roomJoin?: boolean;
  room?: string;
  canPublish?: boolean;
  canSubscribe?: boolean;
  canPublishData?: boolean;
  roomAdmin?: boolean;
  roomList?: boolean;
  roomCreate?: boolean;
}
async function mint(
  config: MediaConfig,
  identity: string,
  grant: VideoGrant,
  ttlSeconds: number,
): Promise<string> {
  return new SignJWT({ video: grant })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(config.apiKey)
    .setSubject(identity)
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + ttlSeconds)
    .sign(new TextEncoder().encode(config.apiSecret));
}
class MediaServiceError extends Error {
  constructor(
    readonly status: number,
    readonly code: string | undefined,
    path: string,
  ) {
    super(`LiveKit service ${path} HTTP ${status}${code ? ` (${code})` : ""}`);
  }
}
function serviceUrl(config: MediaConfig, path: string): string {
  const url = new URL(config.url);
  if (url.protocol === "wss:") url.protocol = "https:";
  else if (url.protocol === "ws:") url.protocol = "http:";
  url.pathname = `${url.pathname.replace(/\/$/, "")}${path}`;
  url.search = "";
  url.hash = "";
  return url.toString();
}
async function serviceCall(
  config: MediaConfig,
  fetchFn: typeof fetch,
  path: string,
  room: string,
  body: Record<string, string>,
) {
  const grant: VideoGrant = path.endsWith("/DeleteRoom")
    ? { roomCreate: true }
    : { room, roomAdmin: true };
  const token = await mint(config, "xiangqi-server", grant, 60);
  const response = await fetchFn(serviceUrl(config, path), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) {
    let code: string | undefined;
    try {
      const payload: unknown = await response.json();
      if (
        payload &&
        typeof payload === "object" &&
        "code" in payload &&
        typeof payload.code === "string"
      )
        code = payload.code;
    } catch {
      // Non-JSON proxy errors still retain their HTTP status.
    }
    throw new MediaServiceError(response.status, code, path);
  }
}
/**
 * Dịch vụ tạo token LiveKit và quản lý phòng thoại/video cho người chơi và khán giả.
 */
export class MediaAccess {
  constructor(
    private readonly config: MediaConfig,
    private readonly store: MediaStore,
    private readonly fetchFn: typeof fetch = fetch,
  ) {}
  /**
   * Cập nhật mức độ chia sẻ camera/mic của người chơi trong phòng cờ.
   */
  async setShare(
    rawUserId: string,
    rawRoomId: string,
    level: ShareLevel,
  ): Promise<{ level: ShareLevel }> {
    const userId = rawUserId.toLowerCase(),
      roomId = rawRoomId.toLowerCase();
    if (!SHARE_LEVELS.includes(level))
      throw new MediaError(
        "MEDIA_INPUT_INVALID",
        "Mức chia sẻ không hợp lệ",
        400,
      );
    return this.store.withUser(userId, async (tx) => {
      if (!(await tx.hasPlayerSeat(roomId, userId)))
        throw new MediaError(
          "MEDIA_PLAYER_REQUIRED",
          "Chỉ người ngồi ghế đổi mức chia sẻ",
          403,
        );
      await tx.saveShare(roomId, userId, level);
      return { level };
    });
  }
  /**
   * Lấy mức chia sẻ camera/mic hiện tại của người dùng trong phòng cờ.
   */
  async getShare(
    rawUserId: string,
    rawRoomId: string,
  ): Promise<{ level: ShareLevel }> {
    const userId = rawUserId.toLowerCase(),
      roomId = rawRoomId.toLowerCase();
    return this.store.read((tx) => this.shareIn(tx, roomId, userId));
  }
  /**
   * Cấp token JWT kết nối LiveKit với quyền phát/nghe tùy theo vai trò (kỳ thủ hoặc khán giả).
   */
  async tokenFor(
    rawUserId: string,
    rawRoomId: string,
    devices: { camera: boolean; mic: boolean },
  ): Promise<
    MediaToken & { stage: { token: string; roomName: string } | null }
  > {
    const userId = rawUserId.toLowerCase(),
      roomId = rawRoomId.toLowerCase();
    return this.store.withParticipant(roomId, userId, async (tx) => {
      // Revoke đang chờ của cặp này phải được gỡ trước khi đọc vai trò và cấp token.
      await this.settleRevocations(
        tx,
        roomId,
        userId,
        await tx.pendingUserRevocations(roomId, userId),
      );
      const role = await tx.findMemberRole(roomId, userId);
      if (!role)
        throw new MediaError("MEDIA_FORBIDDEN", "Bạn không ở trong phòng", 403);
      const publishing = devices.camera || devices.mic;
      const ttl = 600;
      const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();
      if (role !== "PLAYER") {
        const token = await mint(
          this.config,
          userId,
          {
            roomJoin: true,
            room: stageRoomName(roomId),
            canPublish: false,
            canSubscribe: true,
            canPublishData: false,
          },
          ttl,
        );
        return {
          url: this.config.url,
          token,
          roomName: stageRoomName(roomId),
          expiresAt,
          stage: null,
        };
      }
      const { level } = await this.shareIn(tx, roomId, userId);
      const privateToken = await mint(
        this.config,
        userId,
        {
          roomJoin: true,
          room: privateRoomName(roomId),
          canPublish: publishing && level !== "NONE",
          canSubscribe: true,
          canPublishData: true,
        },
        ttl,
      );
      const stage =
        level === "ALL" && publishing
          ? {
              token: await mint(
                this.config,
                userId,
                {
                  roomJoin: true,
                  room: stageRoomName(roomId),
                  canPublish: true,
                  canSubscribe: true,
                  canPublishData: true,
                },
                ttl,
              ),
              roomName: stageRoomName(roomId),
            }
          : null;
      return {
        url: this.config.url,
        token: privateToken,
        roomName: privateRoomName(roomId),
        expiresAt,
        stage,
      };
    });
  }
  private async shareIn(
    tx: MediaTx,
    roomId: string,
    userId: string,
  ): Promise<{ level: ShareLevel }> {
    return { level: (await tx.findShare(roomId, userId)) ?? "OPPONENT" };
  }
  /**
   * Thu hồi quyền và xóa người dùng khỏi các phòng media LiveKit khi rời phòng hoặc mất quyền.
   */
  async revoke(
    rawRoomId: string,
    rawUserId: string,
    rawEventId: string,
  ): Promise<void> {
    const roomId = rawRoomId.toLowerCase(),
      userId = rawUserId.toLowerCase(),
      eventId = rawEventId.toLowerCase();
    await this.store.withParticipant(roomId, userId, async (tx) => {
      const pending = await tx.pendingUserRevocations(roomId, userId);
      // Event đã được ack trước đó: không gọi LiveKit lại.
      if (!pending.includes(eventId)) return;
      await this.settleRevocations(tx, roomId, userId, pending);
    });
  }
  /**
   * Gỡ người dùng khỏi phòng riêng và stage rồi ack đúng các event đã snapshot.
   * Nếu LiveKit lỗi thì không ack event nào để worker thử lại.
   */
  private async settleRevocations(
    tx: MediaTx,
    roomId: string,
    userId: string,
    pending: string[],
  ): Promise<void> {
    if (!pending.length) return;
    await this.removeFromRooms(roomId, userId);
    await tx.markUserRevocationsDelivered(pending);
  }
  /**
   * Gọi RemoveParticipant trên phòng riêng và stage. 404 not_found coi như đã gỡ.
   */
  private async removeFromRooms(roomId: string, userId: string): Promise<void> {
    const failures: unknown[] = [];
    for (const room of [privateRoomName(roomId), stageRoomName(roomId)]) {
      try {
        await serviceCall(
          this.config,
          this.fetchFn,
          "/twirp/livekit.RoomService/RemoveParticipant",
          room,
          { room, identity: userId },
        );
      } catch (error) {
        if (!(
          error instanceof MediaServiceError &&
          error.status === 404 &&
          error.code === "not_found"
        ))
          failures.push(error);
      }
    }
    if (failures.length === 1) throw failures[0];
    if (failures.length > 1)
      throw new AggregateError(
        failures,
        "LiveKit participant revocation failed",
      );
  }
  /**
   * Xóa toàn bộ phòng LiveKit (phòng riêng và stage) khi phòng cờ bị đóng.
   */
  async revokeRoom(rawRoomId: string): Promise<void> {
    const roomId = rawRoomId.toLowerCase();
    const failures: unknown[] = [];
    for (const room of [privateRoomName(roomId), stageRoomName(roomId)]) {
      try {
        await serviceCall(
          this.config,
          this.fetchFn,
          "/twirp/livekit.RoomService/DeleteRoom",
          room,
          { room },
        );
      } catch (error) {
        if (!(
          error instanceof MediaServiceError &&
          error.status === 404 &&
          error.code === "not_found"
        ))
          failures.push(error);
      }
    }
    if (failures.length === 1) throw failures[0];
    if (failures.length > 1)
      throw new AggregateError(failures, "LiveKit room revocation failed");
  }
}
