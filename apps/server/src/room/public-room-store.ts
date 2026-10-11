import { RoomError, type RoomScope } from "./contracts.js";
import type { RoomStore } from "./room-store.js";
import { uuid } from "../match/position-codec.js";
import type { PublicRoomView } from "@xiangqi/shared";
export type { PublicRoomView } from "@xiangqi/shared";
/** Internal same-client store; the caller supplies a freshly authorized actor scope. */
export class PublicRoomStore {
  constructor(private readonly rooms: RoomStore) {}
  private actor(scope: RoomScope) {
    if (
      !uuid.test(scope.actor.userId) ||
      !["member", "guest"].includes(scope.actor.kind) ||
      !scope.lockedActorIds.has(scope.actor.userId)
    )
      throw new RoomError("AUTH_REQUIRED", "Phiên đăng nhập không hợp lệ", 401);
  }
  async list(scope: RoomScope): Promise<PublicRoomView[]> {
    this.actor(scope);
    const rows = (
      await scope.client.query<{
        id: string;
        name: string;
        display_name: string;
        kind: "member" | "guest";
        time_control: number;
        status: string;
        viewer_limit: number;
        players: number;
        spectators: number;
        public_opened_at: Date | null;
      }>(`WITH server_time AS MATERIALIZED(SELECT clock_timestamp() at)
 SELECT r.id,r.name,p.display_name,n.kind,r.time_control,r.status,r.viewer_limit,r.public_opened_at,
 occupancy.players,occupancy.spectators
 FROM public.rooms r JOIN public.profiles p ON p.user_id=r.owner_id
 JOIN xiangqi_auth.principals n ON n.id=r.owner_id CROSS JOIN server_time
 CROSS JOIN LATERAL(
 SELECT count(*) FILTER(WHERE m.role='PLAYER')::integer players,
 count(*) FILTER(WHERE m.role='SPECTATOR' AND (m.disconnected_at IS NULL OR m.disconnected_at+interval '5 minutes'>server_time.at))::integer spectators
 FROM public.room_members m WHERE m.room_id=r.id) occupancy
 WHERE r.visibility='PUBLIC' AND r.closed_at IS NULL AND r.status IN('WAITING','PLAYING','FINISHED')
 AND r.invite_code IS NOT NULL AND r.time_control IN(300,600,900) AND r.viewer_limit BETWEEN 0 AND 5
 AND EXISTS(SELECT 1 FROM public.room_members host WHERE host.room_id=r.id AND host.user_id=r.owner_id AND host.role='PLAYER')
 ORDER BY r.public_opened_at DESC NULLS LAST,r.id DESC LIMIT 50`)
    ).rows;
    return rows.map((r) => ({
      roomId: r.id,
      name: r.name,
      host: { displayName: r.display_name, isGuest: r.kind === "guest" },
      timeMinutes: r.time_control / 60,
      status: r.status === "PLAYING" ? "playing" : "waiting",
      spectators: r.spectators,
      viewerLimit: r.viewer_limit,
      emptySeats: Math.max(0, 2 - r.players),
      canPlay: r.status === "WAITING" && r.players < 2,
      canWatch: r.spectators < r.viewer_limit,
      publicOpenedAt: r.public_opened_at?.toISOString() ?? null,
    }));
  }
  async join(
    scope: RoomScope,
    roomId: string,
    input: { commandId: string; preference: "play" | "watch" },
  ): Promise<Awaited<ReturnType<RoomStore["join"]>>> {
    this.actor(scope);
    if (
      !uuid.test(roomId) ||
      !uuid.test(input.commandId) ||
      !["play", "watch"].includes(input.preference)
    )
      throw new RoomError(
        "ROOM_INPUT_INVALID",
        "Thông tin phòng không hợp lệ",
        400,
      );
    if (!scope.lockedRoomIds.has(roomId))
      throw new RoomError("ROOM_LOCK_REQUIRED", "Thiếu khóa phòng", 500);
    const current = await scope.client.query(
      `SELECT 1 FROM public.rooms WHERE id=$1 AND visibility='PUBLIC' AND invite_code IS NOT NULL AND closed_at IS NULL AND status IN('WAITING','PLAYING','FINISHED') FOR UPDATE`,
      [roomId],
    );
    if (!current.rowCount) this.unavailable();
    // The coordinator retries with the complete actor union if an expired viewer needs cleanup.
    // Check public visibility first, including before the canonical receipt/member shortcuts.
    if (await this.rooms.expireDisconnected(scope, roomId)) this.unavailable();
    return this.rooms.join(scope, {
      commandId: input.commandId,
      roomId,
      intent: input.preference,
    });
  }
  private unavailable(): never {
    throw new RoomError(
      "ROOM_NOT_PUBLIC",
      "Phòng không còn công khai. Hãy làm mới danh sách.",
      409,
    );
  }
}
