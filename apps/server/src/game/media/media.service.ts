import type { RoomControlProof } from "@xiangqi/shared";
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
class MediaGenerationChanged extends Error {}
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
  if (path.endsWith("/ListParticipants"))
    return response.json() as Promise<unknown>;
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
    control: RoomControlProof,
  ): Promise<{ level: ShareLevel }> {
    const userId = rawUserId.toLowerCase(),
      roomId = rawRoomId.toLowerCase();
    if (!SHARE_LEVELS.includes(level))
      throw new MediaError(
        "MEDIA_INPUT_INVALID",
        "Mức chia sẻ không hợp lệ",
        400,
      );
    await this.store.withRoom(userId, roomId, async (tx) => {
      if (!(await tx.hasPlayerSeat(roomId, userId)))
        throw new MediaError(
          "MEDIA_PLAYER_REQUIRED",
          "Chỉ người ngồi ghế đổi mức chia sẻ",
          403,
        );
      if (
        !control ||
        !Number.isSafeInteger(control.generation) ||
        control.generation <= 0 ||
        control.generation > 2_147_483_647 ||
        !(await tx.hasControl(roomId, userId, control))
      )
        throw new MediaError(
          "MEDIA_TAB_READ_ONLY",
          "Tab này chỉ có quyền xem",
          403,
        );
      const previous = (await tx.findShare(roomId, userId)) ?? "OPPONENT";
      await tx.saveShare(roomId, userId, level);
      const rank = { NONE: 0, OPPONENT: 1, ALL: 2 };
      if (rank[level] < rank[previous])
        await tx.queueShareRevoke(roomId, userId);
    });
    return this.store.withMediaRoom(roomId, async (mediaTx) => {
      await this.settleRevocations(
        mediaTx,
        roomId,
        await mediaTx.pendingRevocations(roomId),
      );
      return this.shareIn(mediaTx, roomId, userId);
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
  async sourcesFor(
    rawUserId: string,
    rawRoomId: string,
  ): Promise<{ available: boolean; generation: string }> {
    const userId = rawUserId.toLowerCase(),
      roomId = rawRoomId.toLowerCase();
    const { role, allowed, generation } = await this.store.read(async (tx) => {
      const role = await tx.findMemberRole(roomId, userId);
      if (!role)
        throw new MediaError("MEDIA_FORBIDDEN", "Bạn không ở trong phòng", 403);
      return {
        role,
        allowed: await tx.permittedSources(roomId, userId, role),
        generation: await tx.generation(roomId),
      };
    });
    if (!allowed.length) return { available: false, generation };
    const room =
      role === "PLAYER"
        ? privateRoomName(roomId, generation)
        : stageRoomName(roomId, generation);
    let data: unknown;
    try {
      data = await serviceCall(
        this.config,
        this.fetchFn,
        "/twirp/livekit.RoomService/ListParticipants",
        room,
        { room },
      );
    } catch (error) {
      if (
        error instanceof MediaServiceError &&
        error.status === 404 &&
        error.code === "not_found"
      )
        data = { participants: [] };
      else throw error;
    }
    const participants =
      data && typeof data === "object" && "participants" in data
        ? data.participants
        : [];
    if (!Array.isArray(participants))
      throw new Error("Invalid LiveKit participants response");
    return this.store.read(async (tx) => {
      const currentRole = await tx.findMemberRole(roomId, userId);
      if (currentRole !== role)
        throw new MediaError(
          "MEDIA_FORBIDDEN",
          "Quyền nhận hình tiếng đã thay đổi",
          403,
        );
      const currentGeneration = await tx.generation(roomId);
      const current = new Set(await tx.permittedSources(roomId, userId, role));
      return {
        generation: currentGeneration,
        available:
          currentGeneration === generation &&
          participants.some(
            (participant: {
              identity?: string;
              tracks?: { type?: string; muted?: boolean }[];
            }) =>
              typeof participant.identity === "string" &&
              current.has(participant.identity) &&
              Array.isArray(participant.tracks) &&
              participant.tracks.some(
                (track) =>
                  (track.type === "VIDEO" || track.type === "AUDIO") &&
                  track.muted !== true,
              ),
          ),
      };
    });
  }
  /**
   * Cấp token JWT kết nối LiveKit với quyền phát/nghe tùy theo vai trò (kỳ thủ hoặc khán giả).
   */
  async tokenFor(
    rawUserId: string,
    rawRoomId: string,
    devices: { camera: boolean; mic: boolean },
    tabId: string,
  ): Promise<
    MediaToken & { stage: { token: string; roomName: string } | null }
  > {
    const userId = rawUserId.toLowerCase(),
      roomId = rawRoomId.toLowerCase();
    for (;;)
      try {
        return await this.store.withMediaRoom(roomId, async (tx) => {
          await this.settleRevocations(
            tx,
            roomId,
            await tx.pendingRevocations(roomId),
          );
          const generation = await tx.generation(roomId, true);
          if ((await tx.pendingRevocations(roomId)).length)
            throw new MediaGenerationChanged();
          const role = await tx.findMemberRole(roomId, userId);
          if (!role)
            throw new MediaError(
              "MEDIA_FORBIDDEN",
              "Bạn không ở trong phòng",
              403,
            );
          const publishing = devices.camera || devices.mic;
          // Chỉ tab đang điều khiển phòng mới được phát; tab chỉ xem chỉ nhận hình tiếng.
          if (
            role === "PLAYER" &&
            publishing &&
            (await tx.controllingTab(roomId, userId)) !== tabId.toLowerCase()
          )
            throw new MediaError(
              "MEDIA_TAB_READ_ONLY",
              "Tab này chỉ có thể xem. Hãy chuyển thiết bị sang tab này trước khi bật camera hoặc mic.",
            );
          const ttl = 600;
          const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();
          if (role !== "PLAYER") {
            const token = await mint(
              this.config,
              userId,
              {
                roomJoin: true,
                room: stageRoomName(roomId, generation),
                canPublish: false,
                canSubscribe: true,
                canPublishData: false,
              },
              ttl,
            );
            return {
              url: this.config.url,
              token,
              roomName: stageRoomName(roomId, generation),
              generation,
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
              room: privateRoomName(roomId, generation),
              canPublish: publishing && level !== "NONE",
              canSubscribe: true,
              canPublishData: false,
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
                      room: stageRoomName(roomId, generation),
                      canPublish: true,
                      canSubscribe: false,
                      canPublishData: false,
                    },
                    ttl,
                  ),
                  roomName: stageRoomName(roomId, generation),
                }
              : null;
          return {
            url: this.config.url,
            token: privateToken,
            roomName: privateRoomName(roomId, generation),
            generation,
            expiresAt,
            stage,
          };
        });
      } catch (error) {
        if (!(error instanceof MediaGenerationChanged)) throw error;
      }
  }
  private async shareIn(
    tx: MediaTx,
    roomId: string,
    userId: string,
  ): Promise<{ level: ShareLevel }> {
    return { level: (await tx.findShare(roomId, userId)) ?? "OPPONENT" };
  }
  async revoke(
    rawRoomId: string,
    _rawUserId: string,
    rawEventId: string,
  ): Promise<void> {
    await this.revokeRoom(rawRoomId, rawEventId);
  }
  async revokeRoom(rawRoomId: string, rawEventId: string): Promise<void> {
    const roomId = rawRoomId.toLowerCase(),
      eventId = rawEventId.toLowerCase();
    await this.store.withMediaRoom(roomId, async (tx) => {
      const pending = await tx.pendingRevocations(roomId);
      if (pending.some((event) => event.id === eventId))
        await this.settleRevocations(tx, roomId, pending);
    });
  }
  private async settleRevocations(
    tx: MediaTx,
    roomId: string,
    pending: { id: string; generation: string | null }[],
  ): Promise<void> {
    for (const generation of new Set(
      pending.map((event) => event.generation),
    )) {
      const rooms = generation
        ? [
            privateRoomName(roomId, generation),
            stageRoomName(roomId, generation),
          ]
        : [`xiangqi-${roomId}`, `xiangqi-${roomId}-stage`];
      const failures: unknown[] = [];
      for (const room of rooms) {
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
    await tx.markRevocationsDelivered(pending.map((event) => event.id));
  }
}
