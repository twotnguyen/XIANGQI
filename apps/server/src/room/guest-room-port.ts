import type { PoolClient } from "pg";
import { GuestError, type GuestRoomPort } from "../guest/contracts.js";
export class RoomGuestPort implements GuestRoomPort {
  constructor(private readonly terminate?: GuestRoomPort["end"]) {}
  async seatedSeat(
    client: PoolClient,
    id: string,
  ): ReturnType<GuestRoomPort["seatedSeat"]> {
    const reservation = (
      await client.query(
        "SELECT room_id,match_id FROM public.active_players WHERE user_id=$1",
        [id],
      )
    ).rows[0];
    if (reservation?.room_id)
      return { kind: "room", roomId: reservation.room_id as string };
    if (reservation?.match_id)
      return { kind: "ai", matchId: reservation.match_id as string };
    const rooms = (
      await client.query(
        "SELECT m.room_id FROM public.room_members m JOIN public.rooms r ON r.id=m.room_id WHERE m.user_id=$1 AND m.role='PLAYER' AND r.closed_at IS NULL",
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
  async end(
    client: PoolClient,
    id: string,
    input: Parameters<GuestRoomPort["end"]>[2],
  ) {
    if (!this.terminate)
      throw new GuestError(
        "GUEST_UNAVAILABLE",
        "Dọn dữ liệu phiên Khách chưa sẵn sàng",
        503,
      );
    await this.terminate(client, id, input);
  }
}
