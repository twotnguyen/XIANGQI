import type { RoomRequestProof } from "../../game/room/room-session.js";

/** Kết quả vào phòng khi chấp nhận lời mời; `version` là phiên bản phòng sau khi vào. */
export interface FriendRoomJoin {
  accepted: true;
  roomId: string;
  version: number;
  role: "red" | "black" | "spectator";
  notice?: string;
}

/**
 * Port do root cung cấp. Root sở hữu transaction `withRoom`, xác thực lại proof, khóa roster
 * theo thứ tự sắp xếp và gọi helper của FriendTx trên cùng client. Port KHÔNG nhận client
 * và KHÔNG khóa actor xã hội trước phòng.
 *
 * Lỗi ném ra dùng FriendError:
 * - FRIEND_ROOM_MISSING, FRIEND_ROOM_LOCKED: friend service revoke lời mời (410 FRIEND_INVITE_REVOKED).
 * - FRIEND_BUSY, FRIEND_ROOM_FULL và lỗi khác: giữ lời mời PENDING, không từ chối.
 */
export interface FriendRoomPort {
  acceptInvite(
    proof: RoomRequestProof,
    input: { userId: string; inviteId: string; commandId: string },
  ): Promise<FriendRoomJoin>;
}
