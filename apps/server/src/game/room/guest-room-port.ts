import type { PoolClient } from "pg";
import {
  GuestError,
  type GuestCommitEffect,
  type GuestRoomEndInput,
  type GuestRoomPort,
} from "../../account/guest/guest.types.js";
import { scrubGuestPrivacy } from "./guest-privacy-store.js";
import type { RoomScope } from "./room.types.js";

export type GuestSeat =
  { kind: "room"; roomId: string } | { kind: "ai"; matchId: string } | null;

/**
 * Rời một phòng thay mặt khách, trong scope khóa đúng thứ tự (actor trước, phòng sau).
 * Trận đang chơi trong phòng được xử thua bởi RoomStore.leave.
 */
export type GuestRoomLeave = (
  client: PoolClient,
  guestId: string,
  roomId: string,
) => Promise<void>;

/**
 * Cổng kết thúc ván AI của khách. Root gắn implementation thật qua attachAiTermination;
 * cho đến khi gắn, khách đang có ván AI bị từ chối (fail closed).
 */
export interface GuestAiTermination {
  terminate(
    scope: RoomScope,
    input: { guestId: string; aiGameId: string; reason: "expiry" | "logout" },
  ): Promise<GuestCommitEffect>;
}

/**
 * Cổng kết nối giữa module Phòng cờ và module Người chơi Khách (Guest).
 */
export class RoomGuestPort implements GuestRoomPort {
  private aiTermination: GuestAiTermination | null = null;

  // scopeOf must return the trusted scope of the outer coordinator transaction for this client.
  constructor(
    private readonly leave: GuestRoomLeave,
    private readonly scopeOf: (client: PoolClient) => RoomScope,
  ) {}

  attachAiTermination(port: GuestAiTermination) {
    this.aiTermination = port;
  }

  /**
   * Kiểm tra và trả về ghế đang giữ: ván AI (ai_game_id) hoặc phòng đang PLAYING.
   */
  async seatedSeat(client: PoolClient, id: string): Promise<GuestSeat> {
    const reservation = (
      await client.query(
        "SELECT room_id,ai_game_id FROM public.active_players WHERE user_id=$1",
        [id],
      )
    ).rows[0];
    if (reservation?.ai_game_id)
      return { kind: "ai", matchId: reservation.ai_game_id as string };
    const rooms = (
      await client.query(
        "SELECT m.room_id FROM public.room_members m JOIN public.rooms r ON r.id=m.room_id WHERE m.user_id=$1 AND m.role='PLAYER' AND r.closed_at IS NULL AND r.status='PLAYING'",
        [id],
      )
    ).rows;
    if (rooms.length > 1)
      throw new GuestError(
        "GUEST_UNAVAILABLE",
        "Vị trí chơi cần được kiểm tra",
        503,
      );
    return rooms[0]
      ? { kind: "room", roomId: rooms[0].room_id as string }
      : null;
  }

  /**
   * Kết thúc ràng buộc phòng của khách khi đăng xuất/hết hạn:
   * kết thúc ván AI (nếu có), rời mọi phòng mở, xóa PII có phạm vi.
   */
  async end(client: PoolClient, id: string, input: GuestRoomEndInput) {
    const reservation = (
      await client.query(
        "SELECT room_id,ai_game_id FROM public.active_players WHERE user_id=$1",
        [id],
      )
    ).rows[0];
    if (input.reason === "logout" && !input.confirmedResign) {
      const playing = (
        await client.query(
          "SELECT 1 FROM public.room_members m JOIN public.rooms r ON r.id=m.room_id WHERE m.user_id=$1 AND m.role='PLAYER' AND r.closed_at IS NULL AND r.status='PLAYING'",
          [id],
        )
      ).rows.length;
      if (playing > 0)
        throw new GuestError(
          "GUEST_RESIGN_CONFIRM_REQUIRED",
          "Cần xác nhận xử thua để đăng xuất",
          409,
        );
    }
    if (reservation?.ai_game_id) {
      if (!this.aiTermination)
        throw new GuestError(
          "GUEST_UNAVAILABLE",
          "Ván với AI cần được kết thúc trước khi dọn phiên Khách",
          503,
        );
      if (!input.confirmedResign)
        throw new GuestError(
          "GUEST_RESIGN_CONFIRM_REQUIRED",
          "Cần xác nhận xử thua để đăng xuất",
          409,
        );
      const effect = await this.aiTermination.terminate(this.scopeOf(client), {
        guestId: id,
        aiGameId: reservation.ai_game_id as string,
        reason: input.reason,
      });
      input.stageCommit(effect);
    }
    const memberships = (
      await client.query(
        "SELECT m.room_id,r.closed_at FROM public.room_members m JOIN public.rooms r ON r.id=m.room_id WHERE m.user_id=$1 ORDER BY m.room_id",
        [id],
      )
    ).rows;
    for (const row of memberships)
      if (row.closed_at === null)
        await this.leave(client, id, row.room_id as string);
    await scrubGuestPrivacy(client, id);
  }
}
