import { SignJWT } from "jose";
import type { Pool, PoolClient } from "pg";
import { actorLock, transaction } from "../../account/google/postgres.js";
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
async function serviceCall(
  config: MediaConfig,
  fetchFn: typeof fetch,
  path: string,
  body: unknown,
) {
  const token = await mint(config, "xiangqi-server", { roomAdmin: true }, 60);
  const response = await fetchFn(`${config.url.replace(/\/$/, "")}${path}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!response.ok)
    throw new Error(`LiveKit service ${path} HTTP ${response.status}`);
}
export class MediaAccess {
  constructor(
    private readonly config: MediaConfig,
    private readonly pool: Pool,
    private readonly fetchFn: typeof fetch = fetch,
  ) {}
  private async withUser<T>(
    userId: string,
    work: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    return transaction(this.pool, async (client) => {
      await actorLock(client, userId);
      return work(client);
    });
  }
  async setShare(
    userId: string,
    roomId: string,
    level: ShareLevel,
  ): Promise<{ level: ShareLevel }> {
    if (!SHARE_LEVELS.includes(level))
      throw new MediaError(
        "MEDIA_INPUT_INVALID",
        "Mức chia sẻ không hợp lệ",
        400,
      );
    return this.withUser(userId, async (client) => {
      const seat = (
        await client.query(
          `SELECT m.side FROM public.room_members m JOIN public.rooms r ON r.id=m.room_id
           WHERE m.room_id=$1 AND m.user_id=$2 AND m.role='PLAYER' AND r.status IN('WAITING','PLAYING') AND r.closed_at IS NULL`,
          [roomId, userId],
        )
      ).rows[0];
      if (!seat)
        throw new MediaError(
          "MEDIA_PLAYER_REQUIRED",
          "Chỉ người ngồi ghế đổi mức chia sẻ",
          403,
        );
      await client.query(
        "INSERT INTO xiangqi_room.media_share(room_id,user_id,level,updated_at) VALUES($1,$2,$3,clock_timestamp()) ON CONFLICT(room_id,user_id) DO UPDATE SET level=EXCLUDED.level,updated_at=clock_timestamp()",
        [roomId, userId, level],
      );
      return { level };
    });
  }
  async getShare(
    userId: string,
    roomId: string,
  ): Promise<{ level: ShareLevel }> {
    return this.withUser(userId, async (client) => {
      const row = (
        await client.query(
          "SELECT level FROM xiangqi_room.media_share WHERE room_id=$1 AND user_id=$2",
          [roomId, userId],
        )
      ).rows[0];
      return { level: (row?.level ?? "OPPONENT") as ShareLevel };
    });
  }
  async tokenFor(
    userId: string,
    roomId: string,
    devices: { camera: boolean; mic: boolean },
  ): Promise<
    MediaToken & { stage: { token: string; roomName: string } | null }
  > {
    return this.withUser(userId, async (client) => {
      const member = (
        await client.query(
          `SELECT m.role FROM public.room_members m JOIN public.rooms r ON r.id=m.room_id
           WHERE m.room_id=$1 AND m.user_id=$2 AND r.closed_at IS NULL`,
          [roomId, userId],
        )
      ).rows[0];
      if (!member)
        throw new MediaError("MEDIA_FORBIDDEN", "Bạn không ở trong phòng", 403);
      const publishing = devices.camera || devices.mic;
      const ttl = 600;
      const expiresAt = new Date(Date.now() + ttl * 1000).toISOString();
      if (member.role !== "PLAYER") {
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
      const { level } = await this.getShareIn(client, roomId, userId);
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
  private async getShareIn(
    client: PoolClient,
    roomId: string,
    userId: string,
  ): Promise<{ level: ShareLevel }> {
    const row = (
      await client.query(
        "SELECT level FROM xiangqi_room.media_share WHERE room_id=$1 AND user_id=$2",
        [roomId, userId],
      )
    ).rows[0];
    return { level: (row?.level ?? "OPPONENT") as ShareLevel };
  }
  async revoke(roomId: string, userId: string): Promise<void> {
    try {
      for (const room of [privateRoomName(roomId), stageRoomName(roomId)])
        try {
          await serviceCall(
            this.config,
            this.fetchFn,
            "/twirp/livekit.RoomService/RemoveParticipant",
            {
              room,
              identity: userId,
            },
          );
        } catch {
          // Phong stage co the chua ton tai: bo qua, phong con lai van thu hoi.
        }
    } catch {
      // Media khong bao gio lam hong luong choi (BA 0.14).
    }
  }
}
