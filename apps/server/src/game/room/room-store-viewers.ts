import { randomUUID } from "node:crypto";
import { invalidRoomInput, RoomError, type RoomScope } from "./room.types.js";
import { RoomSwapStore } from "./room-store-swap.js";
/**
 * Lớp mở rộng của RoomStore quản lý vai trò khán giả và tương tác ghế ngồi:
 * Chuyển đổi vai trò người chơi/khán giả, mời khán giả xuống ghế và đuổi khán giả khỏi phòng.
 */
export class RoomViewerStore extends RoomSwapStore {
  private async expireDownOffers(s: RoomScope, id: string) {
    if (!(await this.downTableExists(s))) return 0;
    const due = (
      await s.client.query(
        "UPDATE xiangqi_room.seat_invites SET status='EXPIRED',resolved_at=clock_timestamp() WHERE room_id=$1 AND status='PENDING' AND expires_at<=clock_timestamp() RETURNING id",
        [id],
      )
    ).rows as { id: string }[];
    for (const offer of due)
      await this.bump(s, id, "room.seat-invite-expired", { offerId: offer.id });
    return due.length;
  }
  /**
   * Người chơi tự nguyện rời ghế thi đấu để chuyển xuống làm khán giả xem phòng.
   */
  async toSpectator(s: RoomScope, id: string) {
    const { r, members, member } = await this.member(s, id);
    if (r.status !== "WAITING" || member.role !== "PLAYER")
      throw new RoomError("SEAT_MOVE_DENIED", "Chỉ đổi vai khi đang chờ");
    if (r.owner_id === s.actor.userId)
      throw new RoomError("HOST_STAYS", "Chủ phòng không tự xuống xem");
    const spectators = members.filter((m) => m.role === "SPECTATOR").length;
    if (spectators >= r.viewer_limit)
      throw new RoomError("ROOM_FULL", "Phòng đã đầy");
    await s.client.query(
      "UPDATE public.room_members SET role='SPECTATOR',side=NULL,ready=false WHERE room_id=$1 AND user_id=$2",
      [id, s.actor.userId],
    );
    await s.client.query(
      "DELETE FROM public.active_players WHERE user_id=$1 AND room_id=$2",
      [s.actor.userId, id],
    );
    await this.closeDownOffers(s, id);
    await this.bump(s, id, "room.seats-changed");
    return this.snapshot(s, id);
  }
  /**
   * Chủ phòng chủ động chuyển một người chơi khác xuống làm khán giả.
   */
  async moveToSpectator(s: RoomScope, id: string, targetId: string) {
    const { r, members } = await this.member(s, id);
    if (r.status !== "WAITING" || r.owner_id !== s.actor.userId)
      throw new RoomError("SEAT_MOVE_DENIED", "Chỉ chủ phòng chuyển ghế");
    const target = members.find((m) => m.user_id === targetId);
    if (!target || target.role !== "PLAYER" || targetId === s.actor.userId)
      throw new RoomError("SEAT_MOVE_DENIED", "Người chơi không hợp lệ");
    const spectators = members.filter((m) => m.role === "SPECTATOR").length;
    if (spectators >= r.viewer_limit)
      throw new RoomError("ROOM_FULL", "Phòng đã đầy");
    await s.client.query(
      "UPDATE public.room_members SET role='SPECTATOR',side=NULL,ready=false WHERE room_id=$1 AND user_id=$2",
      [id, targetId],
    );
    await s.client.query(
      "DELETE FROM public.active_players WHERE user_id=$1 AND room_id=$2",
      [targetId, id],
    );
    await this.closeDownOffers(s, id);
    await this.bump(s, id, "room.seats-changed");
    return this.snapshot(s, id);
  }
  /**
   * Chủ phòng gửi lời mời một khán giả đang xem xuống ghế thi đấu còn trống.
   */
  async inviteDown(s: RoomScope, id: string, targetId: string) {
    const { r, members } = await this.member(s, id);
    if (r.status !== "WAITING" || r.owner_id !== s.actor.userId)
      throw new RoomError("SEAT_INVITE_DENIED", "Chỉ chủ phòng mời xuống ghế");
    const target = members.find((m) => m.user_id === targetId);
    if (!target || target.role !== "SPECTATOR")
      throw new RoomError(
        "SEAT_INVITE_DENIED",
        "Chỉ mời người xem trong phòng",
      );
    const players = members.filter((m) => m.role === "PLAYER");
    if (players.length >= 2)
      throw new RoomError("SEAT_FULL", "Ghế đã đủ hai người");
    await this.expireDownOffers(s, id);
    const blocked = (
      await s.client.query(
        "SELECT 1 FROM public.active_players WHERE user_id=$1 AND room_id IS NOT NULL AND room_id<>$2 LIMIT 1",
        [targetId, id],
      )
    ).rowCount;
    if (blocked)
      throw new RoomError("FRIEND_BUSY", "Người này đang chơi ở nơi khác", 409);
    try {
      await s.client.query("SAVEPOINT seat_invite_insert");
      const offer = (
        await s.client.query(
          "WITH t AS MATERIALIZED(SELECT clock_timestamp() AS now) INSERT INTO xiangqi_room.seat_invites(id,room_id,inviter_id,invitee_id,status,created_at,expires_at,resolved_at) SELECT $1,$2,$3,$4,'PENDING',t.now,t.now+interval '30 seconds',NULL FROM t RETURNING id,expires_at",
          [randomUUID(), id, s.actor.userId, targetId],
        )
      ).rows[0];
      await s.client.query("RELEASE SAVEPOINT seat_invite_insert");
      await this.bump(s, id, "room.seat-invite-sent", {
        offerId: offer.id,
        inviteeId: targetId,
        expiresAt: (offer.expires_at as Date).toISOString(),
      });
      return this.snapshot(s, id);
    } catch (error) {
      await s.client.query("ROLLBACK TO SAVEPOINT seat_invite_insert");
      if (
        error instanceof Error &&
        (error as { code?: string }).code === "23505"
      )
        throw new RoomError("SEAT_INVITE_PENDING", "Đang có lời mời xuống ghế");
      throw error;
    }
  }
  /**
   * Khán giả phản hồi chấp nhận (ngồi vào ghế thi đấu) hoặc từ chối lời mời từ chủ phòng.
   */
  async respondDown(s: RoomScope, id: string, accept: boolean) {
    if (typeof accept !== "boolean") invalidRoomInput();
    if (!(await this.downTableExists(s)))
      throw new RoomError(
        "SEAT_INVITE_MISSING",
        "Lời mời không còn hiệu lực",
        404,
      );
    const offer = (
      await s.client.query(
        "SELECT * FROM xiangqi_room.seat_invites WHERE room_id=$1 AND status='PENDING' ORDER BY created_at DESC LIMIT 1",
        [id],
      )
    ).rows[0];
    if (!offer)
      throw new RoomError(
        "SEAT_INVITE_MISSING",
        "Lời mời không còn hiệu lực",
        404,
      );
    if (offer.invitee_id !== s.actor.userId)
      throw new RoomError(
        "SEAT_INVITE_FORBIDDEN",
        "Chỉ người được mời trả lời",
        403,
      );
    if (new Date(offer.expires_at).getTime() <= Date.now())
      throw new RoomError("SEAT_INVITE_EXPIRED", "Lời mời đã hết hạn");
    if (!accept) {
      await s.client.query(
        "UPDATE xiangqi_room.seat_invites SET status='DECLINED',resolved_at=clock_timestamp() WHERE id=$1 AND status='PENDING'",
        [offer.id],
      );
      await this.bump(s, id, "room.seat-invite-declined", {
        offerId: offer.id,
      });
      return this.snapshot(s, id);
    }
    const { r, members } = await this.member(s, id);
    const players = members.filter((m) => m.role === "PLAYER");
    const me = members.find((m) => m.user_id === s.actor.userId);
    const busy = (
      await s.client.query(
        "SELECT 1 FROM public.active_players WHERE user_id=$1 AND room_id IS NOT NULL AND room_id<>$2 LIMIT 1",
        [s.actor.userId, id],
      )
    ).rowCount;
    if (
      r.status !== "WAITING" ||
      !me ||
      me.role !== "SPECTATOR" ||
      players.length >= 2 ||
      busy ||
      (
        await s.client.query(
          "SELECT 1 FROM xiangqi_room.countdowns WHERE room_id=$1",
          [id],
        )
      ).rowCount
    ) {
      await s.client.query(
        "UPDATE xiangqi_room.seat_invites SET status='CLOSED',resolved_at=clock_timestamp() WHERE id=$1 AND status='PENDING'",
        [offer.id],
      );
      await this.bump(s, id, "room.seat-invite-closed", { offerId: offer.id });
      throw new RoomError("SEAT_STALE", "Ghế hoặc phòng đã thay đổi");
    }
    await s.client.query(
      "UPDATE xiangqi_room.seat_invites SET status='ACCEPTED',resolved_at=clock_timestamp() WHERE id=$1 AND status='PENDING'",
      [offer.id],
    );
    const side = players.some((m) => m.side === "RED") ? "BLACK" : "RED";
    await s.client.query(
      "UPDATE public.room_members SET role='PLAYER',side=$3,ready=false WHERE room_id=$1 AND user_id=$2",
      [id, s.actor.userId, side],
    );
    await s.client.query(
      "INSERT INTO public.active_players(user_id,room_id,match_id) VALUES($1,$2,NULL)",
      [s.actor.userId, id],
    );
    await this.closeDownOffers(s, id);
    await this.bump(s, id, "room.seat-invite-accepted", { offerId: offer.id });
    return this.snapshot(s, id);
  }
  /**
   * Đuổi một khán giả ra khỏi phòng cờ, hủy phân quyền media và chặn người này tham gia lại.
   */
  async kickViewer(s: RoomScope, id: string, targetId: string) {
    const { r, members, member } = await this.member(s, id);
    if (!["WAITING", "PLAYING"].includes(r.status) || member.role !== "PLAYER")
      throw new RoomError("KICK_DENIED", "Chỉ người chơi được đuổi xem");
    const target = members.find((m) => m.user_id === targetId);
    if (!target || target.role !== "SPECTATOR" || targetId === s.actor.userId)
      throw new RoomError("KICK_DENIED", "Chỉ đuổi người xem khác");
    await s.client.query(
      "INSERT INTO xiangqi_room.room_blocks(room_id,user_id,created_at) VALUES($1,$2,clock_timestamp()) ON CONFLICT DO NOTHING",
      [id, targetId],
    );
    await s.client.query(
      "DELETE FROM public.room_members WHERE room_id=$1 AND user_id=$2",
      [id, targetId],
    );
    if (this.media) {
      void this.media.revoke(id, targetId).catch(() => {});
    }
    await this.bump(s, id, "room.viewer-kicked", { userId: targetId });
    return this.snapshot(s, id);
  }
}
