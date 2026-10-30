import type {
  FriendRoomPort,
  FriendRoomJoin,
} from "../../account/friend/friend.room-port.js";
import { FriendStore, FriendTx } from "../../account/friend/friend.store.js";
import { FriendError } from "../../account/friend/friend.types.js";
import type { RoomStore } from "./room-store.js";
import type { RoomTransactions } from "./room-transactions.js";
import type { RoomSessionAuthorizer } from "./room-session.js";
import { RoomError, type RoomScope } from "./room.types.js";

/** The invite and both room memberships commit under the same actor/room locks. */
export class RoomFriendInvites implements FriendRoomPort {
  constructor(
    private readonly friends: FriendStore,
    private readonly rooms: RoomStore,
    private readonly transactions: RoomTransactions,
    private readonly authorizer: RoomSessionAuthorizer,
    private readonly withScope: <T>(
      scope: RoomScope,
      work: () => Promise<T>,
    ) => Promise<T>,
  ) {}

  async acceptInvite(
    proof: Parameters<FriendRoomPort["acceptInvite"]>[0],
    input: Parameters<FriendRoomPort["acceptInvite"]>[1],
  ): Promise<FriendRoomJoin> {
    const actor = await this.authorizer.resolve(proof);
    if (actor.kind !== "member" || actor.userId !== input.userId)
      throw new FriendError(
        "FRIEND_FORBIDDEN",
        "Phiên không khớp người nhận",
        403,
      );
    const roomId = await this.friends.inviteRoomId(input.inviteId);
    if (!roomId)
      throw new FriendError(
        "FRIEND_INVITE_MISSING",
        "Lời mời không còn hiệu lực",
        404,
      );
    try {
      const result = await this.transactions.withRoom(
        { actor, roomIds: [roomId] },
        (p) => this.authorizer.authorize(proof, p, "join-room", roomId),
        (scope) =>
          this.withScope(scope, async () => {
            const tx = new FriendTx(scope.client);
            const invite = await tx.lockInviteForResponse(
              input.inviteId,
              input.userId,
              input.commandId,
              true,
            );
            if (invite.kind === "forbidden")
              throw new FriendError(
                "FRIEND_FORBIDDEN",
                "Chỉ người được mời trả lời",
                403,
              );
            if (invite.kind === "missing")
              throw new FriendError(
                "FRIEND_INVITE_MISSING",
                "Lời mời không còn hiệu lực",
                404,
              );
            if (invite.kind === "replay") {
              await this.rooms.snapshot(scope, roomId);
              return invite.body as FriendRoomJoin;
            }
            if (invite.roomId !== roomId)
              throw new FriendError(
                "FRIEND_INVITE_MISSING",
                "Lời mời đã thay đổi",
                409,
              );
            const entry = await this.rooms.join(scope, {
              commandId: input.commandId,
              roomId,
              intent: "auto",
            });
            const body: FriendRoomJoin = { accepted: true, ...entry };
            await tx.markInviteAccepted(input.inviteId, input.commandId, body);
            await this.authorizer.finish(proof, scope);
            return body;
          }),
      );
      if (result.status === "ended") {
        await this.authorizer.settleEnded(proof);
        throw new RoomError(
          "AUTH_REQUIRED",
          "Phiên đăng nhập không hợp lệ",
          401,
        );
      }
      return result.value;
    } catch (error) {
      if (error instanceof RoomError && error.code === "ROOM_LOCKED")
        throw new FriendError(
          "FRIEND_ROOM_LOCKED",
          "Phòng đã khóa lời mời này",
          410,
        );
      if (error instanceof RoomError && error.code === "ROOM_FORBIDDEN")
        throw new FriendError(
          "FRIEND_ROOM_MISSING",
          "Phòng không còn khả dụng",
          410,
        );
      throw error;
    }
  }
}
