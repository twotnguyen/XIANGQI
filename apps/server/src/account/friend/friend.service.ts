import type { FriendStore, FriendTx } from "./friend.store.js";
import {
  FriendError,
  type FriendPeer,
  type FriendRequestView,
  type FriendStatus,
  type RoomInviteView,
} from "./friend.types.js";

function fail(code: string, message: string, status = 409): never {
  throw new FriendError(code, message, status);
}
async function requireMember(tx: FriendTx, userId: string) {
  if (!(await tx.isMember(userId)))
    fail("FRIEND_GUEST_DENIED", "Đăng ký tài khoản để kết bạn", 403);
}
async function statusOf(tx: FriendTx, userId: string): Promise<FriendStatus> {
  if (await tx.isSeated(userId)) return "in-match";
  return (await tx.isOnline(userId)) ? "online" : "offline";
}
/**
 * Dịch vụ xử lý toàn bộ logic nghiệp vụ mạng xã hội bạn bè:
 * Thẩm định điều kiện kết bạn, giới hạn số lượng bạn/lời mời, xử lý từ chối và mời vào phòng chơi cờ.
 */
export class FriendService {
  constructor(private readonly store: FriendStore) {}
  /**
   * Tìm kiếm thành viên hệ thống theo tiền tố username để kết bạn.
   */
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
  /**
   * Gửi lời mời kết bạn tới người dùng khác: kiểm tra giới hạn bạn bè, lời mời chờ và chặn sau 2 lần từ chối.
   */
  async sendRequest(userId: string, username: string) {
    return this.store.withUser(userId, async (tx) => {
      await requireMember(tx, userId);
      await tx.expireStale();
      const peer = await tx.findMember(username);
      if (!peer) fail("FRIEND_NOT_FOUND", "Không tìm thấy người dùng", 404);
      if (peer!.user_id === userId)
        fail("FRIEND_SELF", "Không thể kết bạn với chính mình", 400);
      if (await tx.areFriends(userId, peer!.user_id))
        fail("FRIEND_ALREADY", "Hai bạn đã là bạn bè", 409);
      if (await tx.hasDeclinedTwice(peer!.user_id, userId))
        fail("FRIEND_BLOCKED", "Không thể gửi lời mời lúc này", 403);
      if ((await tx.countFriends(userId)) >= 200)
        fail("FRIEND_LIMIT", "Bạn đã có tối đa 200 bạn", 403);
      if ((await tx.countPendingRequests(userId)) >= 50)
        fail("FRIEND_INVITE_LIMIT", "Quá nhiều lời mời đang chờ", 403);
      return tx.insertRequest(userId, peer!.user_id);
    });
  }
  /**
   * Lấy danh sách các lời mời kết bạn đang chờ xử lý của người dùng.
   */
  async listRequests(userId: string): Promise<FriendRequestView[]> {
    return this.store.withUser(userId, async (tx) => {
      await requireMember(tx, userId);
      await tx.expireStale();
      return tx.listPendingRequests(userId);
    });
  }
  /**
   * Trả lời lời mời kết bạn: chấp nhận tạo quan hệ bạn bè hoặc từ chối và tăng biến đếm từ chối.
   */
  async respondRequest(userId: string, requestId: string, accept: boolean) {
    return this.store.withUser(userId, async (tx) => {
      await requireMember(tx, userId);
      await tx.expireStale();
      const row = await tx.findPendingRequest(requestId);
      if (!row)
        fail("FRIEND_REQUEST_MISSING", "Lời mời không còn hiệu lực", 404);
      if (row!.receiver_id !== userId)
        fail("FRIEND_FORBIDDEN", "Chỉ người được mời trả lời", 403);
      if (!accept) {
        await tx.declineRequest(requestId, userId, row!.sender_id);
        return { accepted: false as const };
      }
      const a =
        row!.sender_id < row!.receiver_id ? row!.sender_id : row!.receiver_id;
      const b =
        row!.sender_id < row!.receiver_id ? row!.receiver_id : row!.sender_id;
      await tx.acceptRequest(requestId, a, b);
      return { accepted: true as const };
    });
  }
  /**
   * Thu hồi lời mời kết bạn đã gửi đi khi đối phương chưa phản hồi.
   */
  async revokeRequest(userId: string, requestId: string) {
    return this.store.withUser(userId, async (tx) => {
      await requireMember(tx, userId);
      if (!(await tx.revokeRequest(requestId, userId)))
        fail("FRIEND_REQUEST_MISSING", "Lời mời không còn hiệu lực", 404);
      return { revoked: true as const };
    });
  }
  /**
   * Hủy quan hệ bạn bè giữa hai người dùng.
   */
  async unfriend(userId: string, otherId: string) {
    return this.store.withUser(userId, async (tx) => {
      await requireMember(tx, userId);
      const a = userId < otherId ? userId : otherId;
      const b = userId < otherId ? otherId : userId;
      if (!(await tx.removeFriendship(a, b)))
        fail("FRIEND_MISSING", "Hai bạn chưa là bạn bè", 404);
      return { removed: true as const };
    });
  }
  /**
   * Lấy danh sách bạn bè kèm trạng thái hoạt động thực tế (online, offline, in-match).
   */
  async listFriends(userId: string): Promise<FriendPeer[]> {
    return this.store.withUser(userId, async (tx) => {
      await requireMember(tx, userId);
      const peers: FriendPeer[] = [];
      for (const r of await tx.listFriendRows(userId))
        peers.push({
          userId: r.user_id,
          username: r.username,
          displayName: r.display_name,
          status: await statusOf(tx, r.user_id),
        });
      return peers;
    });
  }
  /**
   * Mời bạn bè tham gia phòng chơi cờ: kiểm tra bạn bè có đang online và rảnh rỗi không.
   */
  async inviteToRoom(userId: string, roomId: string, username: string) {
    return this.store.withUser(userId, async (tx) => {
      await requireMember(tx, userId);
      await tx.expireStale();
      const peer = await tx.findMember(username);
      if (!peer) fail("FRIEND_NOT_FOUND", "Không tìm thấy người dùng", 404);
      if (!(await tx.areFriends(userId, peer!.user_id)))
        fail("FRIEND_MISSING", "Chỉ mời bạn bè của bạn", 403);
      if (!(await tx.isRoomPlayer(roomId, userId)))
        fail("FRIEND_INVITE_FORBIDDEN", "Chỉ người ngồi ghế được mời", 403);
      if (!(await tx.isOnline(peer!.user_id)))
        fail("FRIEND_OFFLINE", "Bạn bè đang ngoại tuyến", 409);
      if (await tx.isSeated(peer!.user_id))
        fail("FRIEND_BUSY", "Bạn bè đang trong ván khác", 409);
      const invite = await tx.insertRoomInvite(roomId, userId, peer!.user_id);
      if (!invite) fail("FRIEND_ROOM_MISSING", "Phòng không còn khả dụng", 404);
      return invite!;
    });
  }
  /**
   * Lấy danh sách các lời mời vào phòng cờ đang chờ người dùng phản hồi.
   */
  async listRoomInvites(userId: string): Promise<RoomInviteView[]> {
    return this.store.withUser(userId, async (tx) => {
      await requireMember(tx, userId);
      await tx.expireStale();
      return tx.listPendingRoomInvites(userId);
    });
  }
  /**
   * Phản hồi lời mời vào phòng: chấp nhận trả về mã phòng để tham gia, hoặc từ chối.
   */
  async respondRoomInvite(userId: string, inviteId: string, accept: boolean) {
    const outcome = await this.store.withUser(userId, async (tx) => {
      await requireMember(tx, userId);
      await tx.expireStale();
      const row = await tx.findPendingInvite(inviteId);
      if (!row)
        fail("FRIEND_INVITE_MISSING", "Lời mời không còn hiệu lực", 404);
      if (row!.invitee_id !== userId)
        fail("FRIEND_FORBIDDEN", "Chỉ người được mời trả lời", 403);
      if (!accept) {
        await tx.declineInvite(inviteId);
        return { accepted: false as const };
      }
      const room = await tx.findOpenRoom(row!.room_id);
      if (!room || room.visibility === "LOCKED") {
        // Persist the revocation first: throwing here would roll it back.
        await tx.revokeInvite(inviteId);
        return { revoked: true as const };
      }
      if (await tx.isSeated(userId))
        fail("FRIEND_BUSY", "Bạn đang ở trong một ván/phòng khác", 409);
      await tx.acceptInvite(inviteId);
      return {
        accepted: true as const,
        roomId: row!.room_id,
        code: room!.invite_code,
      };
    });
    if ("revoked" in outcome)
      fail("FRIEND_INVITE_REVOKED", "Phòng đã khoá lời mời này", 410);
    return outcome;
  }
}
