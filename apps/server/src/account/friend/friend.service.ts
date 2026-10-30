import type { RoomRequestProof } from "../../game/room/room-session.js";
import type { FriendRoomPort } from "./friend.room-port.js";
import type { FriendStore, FriendTx } from "./friend.store.js";
import {
  FriendError,
  type FriendPeer,
  type FriendRequestView,
  type InviteStateView,
  type RoomInviteResponse,
  type RoomInviteView,
} from "./friend.types.js";

function fail(code: string, message: string, status = 409): never {
  throw new FriendError(code, message, status);
}
async function requireMember(tx: FriendTx, userId: string) {
  if (!(await tx.isMember(userId)))
    fail("FRIEND_GUEST_DENIED", "Đăng ký tài khoản để kết bạn", 403);
}

/** Quyết định trả lời lời mời: decline không cần proof; accept cần proof phòng để join. */
export type RoomInviteDecision =
  | { accept: false; commandId: string }
  | { accept: true; commandId: string; proof: RoomRequestProof };

/** Mã lỗi từ port cho thấy phòng không còn nhận lời mời; lời mời bị revoke. */
const REVOKING_ROOM_CODES: Record<string, true> = {
  FRIEND_ROOM_MISSING: true,
  FRIEND_ROOM_LOCKED: true,
};

/**
 * Dịch vụ bạn bè, presence và lời mời phòng. Không chứa SQL; mọi truy vấn qua FriendStore/FriendTx.
 * Luồng accept lời mời gọi port TRƯỚC mọi withUser để root khóa phòng trước và tránh deadlock.
 */
export class FriendService {
  constructor(
    private readonly store: FriendStore,
    private readonly rooms: FriendRoomPort,
  ) {}

  /** Heartbeat presence của một tab; chỉ thành viên đã đăng ký. */
  async heartbeat(userId: string, connectionId: string): Promise<{ ok: true }> {
    return this.store.withUser(userId, async (tx) => {
      await requireMember(tx, userId);
      await tx.renewLease(userId, connectionId);
      return { ok: true as const };
    });
  }

  /** Tìm kiếm thành viên theo tiền tố username để kết bạn. */
  async search(
    userId: string,
    prefix: string,
  ): Promise<Omit<FriendPeer, "status">[]> {
    if (typeof prefix !== "string" || prefix.trim().length < 1)
      fail("FRIEND_INPUT_INVALID", "Từ tìm kiếm không hợp lệ", 400);
    const clean = prefix.trim().slice(0, 20);
    return this.store.read(async (tx) => {
      await requireMember(tx, userId);
      return tx.searchMembers(clean, userId);
    });
  }

  /** Gửi lời mời kết bạn; dedupe lời mời PENDING cùng cặp, không gia hạn. */
  async sendRequest(userId: string, username: string) {
    const peer = await this.store.read(async (tx) => {
      await requireMember(tx, userId);
      const found = await tx.findMember(username);
      if (!found) fail("FRIEND_NOT_FOUND", "Không tìm thấy người dùng", 404);
      return found!;
    });
    return this.store.withUsers([userId, peer.user_id], async (tx) => {
      await requireMember(tx, userId);
      await tx.expireStale();
      if (peer.user_id === userId)
        fail("FRIEND_SELF", "Không thể kết bạn với chính mình", 400);
      if (await tx.areFriends(userId, peer.user_id))
        fail("FRIEND_ALREADY", "Hai bạn đã là bạn bè", 409);
      if (await tx.hasDeclinedTwice(peer.user_id, userId))
        fail("FRIEND_BLOCKED", "Không thể gửi lời mời lúc này", 403);
      const existing = await tx.findPendingPair(userId, peer.user_id);
      if (existing) return existing;
      if (
        (await tx.countFriends(userId)) >= 200 ||
        (await tx.countFriends(peer.user_id)) >= 200
      )
        fail("FRIEND_LIMIT", "Một trong hai người đã đủ 200 bạn", 403);
      if (
        (await tx.countPendingRequests(userId)) >= 50 ||
        (await tx.countPendingRequests(peer.user_id)) >= 50
      )
        fail(
          "FRIEND_INVITE_LIMIT",
          "Một trong hai người đã đủ 50 lời mời đang chờ",
          403,
        );
      return tx.insertRequest(userId, peer.user_id);
    });
  }

  /** Lời mời kết bạn đang chờ, hai chiều. */
  async listRequests(userId: string): Promise<FriendRequestView[]> {
    return this.store.withUser(userId, async (tx) => {
      await requireMember(tx, userId);
      await tx.expireStale();
      const incoming = await tx.listPendingRequests(userId, "incoming");
      const outgoing = await tx.listPendingRequests(userId, "outgoing");
      return [
        ...incoming.map((r) => toRequestView(r, "incoming")),
        ...outgoing.map((r) => toRequestView(r, "outgoing")),
      ];
    });
  }

  /** Trả lời lời mời kết bạn: chấp nhận cần cả hai còn dưới giới hạn 200 bạn; từ chối tăng bộ đếm. */
  async respondRequest(userId: string, requestId: string, accept: boolean) {
    const row = await this.store.read(async (tx) => {
      await requireMember(tx, userId);
      return tx.findPendingRequest(requestId);
    });
    if (!row) fail("FRIEND_REQUEST_MISSING", "Lời mời không còn hiệu lực", 404);
    if (row!.receiver_id !== userId)
      fail("FRIEND_FORBIDDEN", "Chỉ người được mời trả lời", 403);
    return this.store.withUsers(
      [row!.sender_id, row!.receiver_id],
      async (tx) => {
        await requireMember(tx, userId);
        await tx.expireStale();
        const current = await tx.findPendingRequest(requestId);
        if (!current)
          fail("FRIEND_REQUEST_MISSING", "Lời mời không còn hiệu lực", 404);
        if (!accept) {
          await tx.declineRequest(requestId, userId, current!.sender_id);
          return { accepted: false as const };
        }
        if (
          (await tx.countFriends(current!.sender_id)) >= 200 ||
          (await tx.countFriends(current!.receiver_id)) >= 200
        )
          fail("FRIEND_LIMIT", "Bạn đã có tối đa 200 bạn", 403);
        const [a, b] = [current!.sender_id, current!.receiver_id].sort() as [
          string,
          string,
        ];
        await tx.acceptRequest(requestId, a, b);
        return { accepted: true as const };
      },
    );
  }

  /** Thu hồi lời mời kết bạn đã gửi khi đối phương chưa phản hồi. */
  async revokeRequest(userId: string, requestId: string) {
    return this.store.withUser(userId, async (tx) => {
      await requireMember(tx, userId);
      if (!(await tx.revokeRequest(requestId, userId)))
        fail("FRIEND_REQUEST_MISSING", "Lời mời không còn hiệu lực", 404);
      return { revoked: true as const };
    });
  }

  /** Hủy quan hệ bạn bè; không khôi phục bộ đếm từ chối. */
  async unfriend(userId: string, otherId: string) {
    return this.store.withUser(userId, async (tx) => {
      await requireMember(tx, userId);
      if (!(await tx.removeFriendship(userId, otherId)))
        fail("FRIEND_MISSING", "Hai bạn chưa là bạn bè", 404);
      return { removed: true as const };
    });
  }

  /** Bạn bè kèm trạng thái presence (offline/online/in-match). */
  async listFriends(userId: string): Promise<FriendPeer[]> {
    return this.store.withUser(userId, async (tx) => {
      await requireMember(tx, userId);
      return tx.listFriendRows(userId);
    });
  }

  /** Mời bạn bè vào phòng; khóa actor rồi FOR SHARE phòng trước khi chèn. */
  async inviteToRoom(userId: string, roomId: string, username: string) {
    const peer = await this.store.read(async (tx) => {
      await requireMember(tx, userId);
      const found = await tx.findMember(username);
      if (!found) fail("FRIEND_NOT_FOUND", "Không tìm thấy người dùng", 404);
      return found!;
    });
    return this.store.withUsers([userId, peer.user_id], async (tx) => {
      await requireMember(tx, userId);
      await tx.expireStale();
      if (!(await tx.areFriends(userId, peer.user_id)))
        fail("FRIEND_MISSING", "Chỉ mời bạn bè của bạn", 403);
      if (!(await tx.isRoomPlayer(roomId, userId)))
        fail("FRIEND_INVITE_FORBIDDEN", "Chỉ người ngồi ghế được mời", 403);
      if (!(await tx.isOnline(peer.user_id)))
        fail("FRIEND_OFFLINE", "Bạn bè đang ngoại tuyến", 409);
      if (await tx.isBusy(peer.user_id))
        fail("FRIEND_BUSY", "Bạn bè đang trong ván khác", 409);
      const existing = await tx.findPendingInviteFor(
        roomId,
        userId,
        peer.user_id,
      );
      if (existing)
        return { ...existing, cooldownUntil: await tx.cooldownUntil(userId) };
      if (await tx.cooldownUntil(userId))
        fail("FRIEND_INVITE_COOLDOWN", "Vui lòng chờ trước khi mời tiếp", 429);
      if (!(await tx.lockOpenRoom(roomId)))
        fail("FRIEND_ROOM_MISSING", "Phòng không còn khả dụng", 404);
      const invite = await tx.insertRoomInvite(roomId, userId, peer.user_id);
      const cooldownUntil = await tx.bumpCooldown(userId);
      return { ...invite, cooldownUntil };
    });
  }

  /** Lời mời vào phòng đang chờ người dùng phản hồi. */
  async listRoomInvites(userId: string): Promise<RoomInviteView[]> {
    return this.store.withUser(userId, async (tx) => {
      await requireMember(tx, userId);
      await tx.expireStale();
      return tx.listPendingRoomInvites(userId);
    });
  }

  /** Trạng thái cooldown toàn cục và thông báo từ chối chưa ack của người gửi. */
  async inviteState(userId: string): Promise<InviteStateView> {
    return this.store.read(async (tx) => {
      await requireMember(tx, userId);
      return {
        cooldownUntil: await tx.cooldownUntil(userId),
        declines: await tx.listOpenDeclines(userId),
      };
    });
  }

  /** Ack thông báo từ chối; idempotent cho cùng notice của cùng người gửi. */
  async ackDecline(userId: string, noticeId: string): Promise<{ ok: true }> {
    return this.store.withUser(userId, async (tx) => {
      await requireMember(tx, userId);
      if (!(await tx.ackDecline(noticeId, userId)))
        fail("FRIEND_NOTICE_MISSING", "Thông báo không tồn tại", 404);
      return { ok: true as const };
    });
  }

  /**
   * Trả lời lời mời vào phòng. Từ chối: ghi quyết định bền vững và cooldown.
   * Chấp nhận: gọi port root TRƯỚC mọi withUser; lỗi phòng khóa/đóng thì revoke, lỗi khác giữ PENDING.
   */
  async respondRoomInvite(
    userId: string,
    inviteId: string,
    decision: RoomInviteDecision,
  ): Promise<RoomInviteResponse> {
    if (!decision.accept)
      return this.declineRoomInvite(userId, inviteId, decision.commandId);
    await this.store.read((tx) => requireMember(tx, userId));
    const roomId = await this.store.inviteRoomId(inviteId);
    if (!roomId)
      fail("FRIEND_INVITE_MISSING", "Lời mời không còn hiệu lực", 404);
    try {
      const join = await this.rooms.acceptInvite(decision.proof, {
        userId,
        inviteId,
        commandId: decision.commandId,
      });
      return {
        accepted: true,
        roomId: join.roomId,
        version: join.version,
        role: join.role,
        ...(join.notice ? { notice: join.notice } : {}),
      };
    } catch (error) {
      if (
        error instanceof FriendError &&
        REVOKING_ROOM_CODES[error.code] === true
      ) {
        await this.store.revokeInvite(inviteId, userId);
        fail("FRIEND_INVITE_REVOKED", "Phòng đã khoá lời mời này", 410);
      }
      throw error;
    }
  }

  private async declineRoomInvite(
    userId: string,
    inviteId: string,
    commandId: string,
  ): Promise<RoomInviteResponse> {
    const parties = await this.store.read((tx) => tx.inviteParties(inviteId));
    if (!parties)
      fail("FRIEND_INVITE_MISSING", "Lời mời không còn hiệu lực", 404);
    return this.store.withUsers([parties!.inviter_id, userId], async (tx) => {
      await requireMember(tx, userId);
      await tx.expireStale();
      const lock = await tx.lockInviteForResponse(
        inviteId,
        userId,
        commandId,
        false,
      );
      if (lock.kind === "replay") return lock.body;
      if (lock.kind === "missing")
        fail("FRIEND_INVITE_MISSING", "Lời mời không còn hiệu lực", 404);
      if (lock.kind === "forbidden")
        fail("FRIEND_FORBIDDEN", "Chỉ người được mời trả lời", 403);
      return tx.declineInvite(inviteId, commandId);
    });
  }
}

function toRequestView(
  row: {
    id: string;
    userId: string;
    username: string;
    displayName: string;
    createdAt: string;
    expiresAt: string;
  },
  direction: "incoming" | "outgoing",
): FriendRequestView {
  return {
    id: row.id,
    direction,
    peer: {
      userId: row.userId,
      username: row.username,
      displayName: row.displayName,
    },
    createdAt: row.createdAt,
    expiresAt: row.expiresAt,
  };
}
