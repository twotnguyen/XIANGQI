import { randomUUID } from "node:crypto";
import { invalidRoomInput, RoomError, type RoomScope } from "./room.types.js";
import { RoomRematchStore } from "./room-store-rematch.js";
import { uuid } from "./room-store-core.js";
/**
 * Lớp mở rộng của RoomStore quản lý vai trò khán giả và tương tác ghế ngồi:
 * Chuyển đổi vai trò người chơi/khán giả, mời khán giả xuống ghế và đuổi khán giả khỏi phòng.
 */
export class RoomViewerStore extends RoomRematchStore {
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
    await this.cancel(s, id);
    await this.closeSwapOffers(s, id);
    await this.closeDownOffers(s, id);
    const version = await this.bump(s, id, "room.seats-changed");
    await this.event(s, id, version, "media.revoke-user", {
      userId: s.actor.userId,
    });
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
    await this.cancel(s, id);
    await this.closeSwapOffers(s, id);
    await this.closeDownOffers(s, id);
    const version = await this.bump(s, id, "room.seats-changed");
    await this.event(s, id, version, "media.revoke-user", { userId: targetId });
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
    const wait = await this.seatCooldownLeft(
      s,
      "seat_invites",
      "inviter_id",
      id,
      s.actor.userId,
    );
    if (wait)
      throw new RoomError(
        "SEAT_INVITE_COOLDOWN",
        `Chờ ${wait} giây để mời lại`,
        429,
      );
    const blocked = (
      await s.client.query(
        "SELECT 1 FROM public.active_players WHERE user_id=$1 AND room_id IS DISTINCT FROM $2::uuid LIMIT 1",
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
   * Người xem được mời chấp nhận (ngồi vào ghế) hoặc từ chối đúng lời mời `offerId`.
   * Hết hạn/ghế đổi: đóng lời mời và trả snapshot (không throw để giữ phần đóng đã ghi); người gọi thấy vẫn là người xem.
   */
  async respondDown(
    s: RoomScope,
    id: string,
    offerId: string,
    accept: boolean,
  ) {
    if (typeof accept !== "boolean" || !uuid.test(offerId)) invalidRoomInput();
    if (!(await this.downTableExists(s)))
      throw new RoomError(
        "SEAT_INVITE_MISSING",
        "Lời mời không còn hiệu lực",
        404,
      );
    const offer = (
      await s.client.query(
        "SELECT id,invitee_id,expires_at<=clock_timestamp() AS due FROM xiangqi_room.seat_invites WHERE id=$1 AND room_id=$2 AND status='PENDING'",
        [offerId, id],
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
    if (offer.due) {
      await this.expireDownOffers(s, id);
      return this.snapshot(s, id);
    }
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
    const me = members.find((m) => m.user_id === s.actor.userId);
    if (await this.busyElsewhere(s, s.actor.userId, id))
      throw new RoomError(
        "ALREADY_SEATED",
        "Bạn đang ở trong một ván/phòng khác",
        409,
      );
    if (!(await this.seatOpenFor(s, id, r.status, me))) {
      await s.client.query(
        "UPDATE xiangqi_room.seat_invites SET status='CLOSED',resolved_at=clock_timestamp() WHERE id=$1 AND status='PENDING'",
        [offer.id],
      );
      await this.bump(s, id, "room.seat-invite-closed", { offerId: offer.id });
      return this.snapshot(s, id);
    }
    await s.client.query(
      "UPDATE xiangqi_room.seat_invites SET status='ACCEPTED',resolved_at=clock_timestamp() WHERE id=$1 AND status='PENDING'",
      [offer.id],
    );
    await this.promote(s, id, s.actor.userId, members);
    await this.bump(s, id, "room.seat-invite-accepted", { offerId: offer.id });
    return this.snapshot(s, id);
  }
  /** Người xem đang ở nơi khác (ghế phòng khác, ván AI/online) thì không được ngồi ghế ở phòng này. */
  private async busyElsewhere(s: RoomScope, userId: string, id: string) {
    return Boolean(
      (
        await s.client.query(
          "SELECT 1 FROM public.active_players WHERE user_id=$1 AND room_id IS DISTINCT FROM $2::uuid LIMIT 1",
          [userId, id],
        )
      ).rowCount,
    );
  }
  /** Còn ghế để người xem `who` ngồi: phòng WAITING, chưa đếm ngược, who vẫn là người xem, chưa đủ 2 người chơi. */
  private async seatOpenFor(
    s: RoomScope,
    id: string,
    status: string,
    who: { role: string } | undefined,
  ) {
    const players = (
      await s.client.query(
        "SELECT count(*)::int AS n FROM public.room_members WHERE room_id=$1 AND role='PLAYER'",
        [id],
      )
    ).rows[0].n as number;
    return (
      status === "WAITING" &&
      who?.role === "SPECTATOR" &&
      players < 2 &&
      !(
        await s.client.query(
          "SELECT 1 FROM xiangqi_room.countdowns WHERE room_id=$1",
          [id],
        )
      ).rowCount
    );
  }
  /** Chuyển người xem thành người chơi ở phe còn trống, reset Sẵn sàng/đếm ngược và đóng mọi đề nghị ghế còn lại. */
  private async promote(
    s: RoomScope,
    id: string,
    userId: string,
    members: { role: string; side: string | null }[],
  ) {
    const side = members.some((m) => m.role === "PLAYER" && m.side === "RED")
      ? "BLACK"
      : "RED";
    await s.client.query(
      "UPDATE public.room_members SET role='PLAYER',side=$3,ready=false WHERE room_id=$1 AND user_id=$2",
      [id, userId, side],
    );
    await s.client.query(
      "INSERT INTO public.active_players(user_id,room_id,match_id) VALUES($1,$2,NULL)",
      [userId, id],
    );
    await this.cancel(s, id);
    await this.closeSwapOffers(s, id);
    await this.closeDownOffers(s, id);
  }
  private async expireSeatRequests(s: RoomScope, id: string) {
    if (!(await this.requestTableExists(s))) return;
    const due = (
      await s.client.query(
        "UPDATE xiangqi_room.seat_requests SET status='EXPIRED',resolved_at=clock_timestamp() WHERE room_id=$1 AND status='PENDING' AND expires_at<=clock_timestamp() RETURNING id",
        [id],
      )
    ).rows as { id: string }[];
    if (due.length)
      await this.bump(s, id, "room.seat-request-expired", {
        requestIds: due.map((q) => q.id),
      });
  }
  /** Người xem xin ngồi ghế trống; Host duyệt. Gửi lặp trả lại yêu cầu đang chờ, không tạo bản sao hay gia hạn. */
  async requestSeat(s: RoomScope, id: string) {
    const { r, members, member } = await this.member(s, id);
    if (member.role !== "SPECTATOR")
      throw new RoomError(
        "SEAT_REQUEST_DENIED",
        "Chỉ người xem được xin ngồi ghế",
        403,
      );
    if (!(await this.requestTableExists(s)))
      throw new RoomError(
        "SEAT_REQUEST_DENIED",
        "Chức năng xin ngồi ghế chưa sẵn sàng",
        503,
      );
    if (r.status !== "WAITING")
      throw new RoomError("SEAT_REQUEST_DENIED", "Đang trong ván");
    if (members.filter((m) => m.role === "PLAYER").length >= 2)
      throw new RoomError("SEAT_FULL", "Ghế đã đủ hai người");
    if (!(await this.seatOpenFor(s, id, r.status, member)))
      throw new RoomError("SEAT_REQUEST_DENIED", "Phòng đang đếm ngược");
    await this.expireSeatRequests(s, id);
    if (await this.busyElsewhere(s, s.actor.userId, id))
      throw new RoomError(
        "ALREADY_SEATED",
        "Bạn đang ở trong một ván/phòng khác",
        409,
      );
    const pending = (
      await s.client.query(
        "SELECT 1 FROM xiangqi_room.seat_requests WHERE room_id=$1 AND requester_id=$2 AND status='PENDING'",
        [id, s.actor.userId],
      )
    ).rowCount;
    if (pending) return this.snapshot(s, id);
    const wait = await this.seatCooldownLeft(
      s,
      "seat_requests",
      "requester_id",
      id,
      s.actor.userId,
    );
    if (wait)
      throw new RoomError(
        "SEAT_REQUEST_COOLDOWN",
        `Chờ ${wait} giây để xin lại`,
        429,
      );
    const request = (
      await s.client.query(
        "WITH t AS MATERIALIZED(SELECT clock_timestamp() AS now) INSERT INTO xiangqi_room.seat_requests(id,room_id,requester_id,status,created_at,expires_at,resolved_at) SELECT $1,$2,$3,'PENDING',t.now,t.now+interval '30 seconds',NULL FROM t RETURNING id,expires_at",
        [randomUUID(), id, s.actor.userId],
      )
    ).rows[0];
    await this.bump(s, id, "room.seat-request-sent", {
      requestId: request.id,
      requesterId: s.actor.userId,
      expiresAt: (request.expires_at as Date).toISOString(),
    });
    return this.snapshot(s, id);
  }
  /**
   * Host đồng ý/từ chối một yêu cầu xin ngồi. Đồng ý: kiểm lại dưới khóa phòng rồi cho ngồi ngay.
   * Quá hạn: ghi EXPIRED và trả snapshot (không báo "bị từ chối").
   */
  async respondSeatRequest(
    s: RoomScope,
    id: string,
    requestId: string,
    accept: boolean,
  ) {
    if (typeof accept !== "boolean" || !uuid.test(requestId))
      invalidRoomInput();
    const { r, members } = await this.member(s, id);
    if (r.owner_id !== s.actor.userId)
      throw new RoomError(
        "SEAT_REQUEST_DENIED",
        "Chỉ chủ phòng trả lời yêu cầu ngồi ghế",
        403,
      );
    const request = (await this.requestTableExists(s))
      ? (
          await s.client.query(
            "SELECT id,requester_id,expires_at<=clock_timestamp() AS due FROM xiangqi_room.seat_requests WHERE id=$1 AND room_id=$2 AND status='PENDING'",
            [requestId, id],
          )
        ).rows[0]
      : null;
    if (!request)
      throw new RoomError(
        "SEAT_REQUEST_MISSING",
        "Yêu cầu không còn hiệu lực",
        404,
      );
    if (request.due) {
      await this.expireSeatRequests(s, id);
      return this.snapshot(s, id);
    }
    if (!accept) {
      await s.client.query(
        "UPDATE xiangqi_room.seat_requests SET status='DECLINED',resolved_at=clock_timestamp() WHERE id=$1 AND status='PENDING'",
        [request.id],
      );
      await this.bump(s, id, "room.seat-request-declined", {
        requestId: request.id,
      });
      return this.snapshot(s, id);
    }
    const requester = members.find((m) => m.user_id === request.requester_id);
    if (
      !requester ||
      requester.role !== "SPECTATOR" ||
      requester.viewer_expired
    )
      throw new RoomError(
        "SEAT_REQUEST_MISSING",
        "Người xin đã không còn xem phòng",
        404,
      );
    if (await this.busyElsewhere(s, request.requester_id, id))
      throw new RoomError("FRIEND_BUSY", "Người này đang chơi ở nơi khác", 409);
    if (!(await this.seatOpenFor(s, id, r.status, requester)))
      throw new RoomError(
        "SEAT_FULL",
        "Ghế đã có người hoặc phòng đã thay đổi",
      );
    await s.client.query(
      "UPDATE xiangqi_room.seat_requests SET status='ACCEPTED',resolved_at=clock_timestamp() WHERE id=$1 AND status='PENDING'",
      [request.id],
    );
    await this.promote(s, id, request.requester_id, members);
    await this.bump(s, id, "room.seat-request-accepted", {
      requestId: request.id,
      userId: request.requester_id,
    });
    return this.snapshot(s, id);
  }
  /**
   * Host mời người chơi thứ hai rời ghế (không chặn): chỉ khi WAITING, đủ hai người, không đếm ngược.
   * Người bị gỡ mất ghế/Kênh Riêng/media và được đưa về Sảnh; vào lại được nếu phòng chưa LOCKED.
   */
  async inviteLeave(s: RoomScope, id: string, targetId: string) {
    const { r, members } = await this.member(s, id);
    if (r.owner_id !== s.actor.userId)
      throw new RoomError(
        "SEAT_LEAVE_DENIED",
        "Chỉ chủ phòng mời rời ghế",
        403,
      );
    const players = members.filter((m) => m.role === "PLAYER");
    const counting = (
      await s.client.query(
        "SELECT 1 FROM xiangqi_room.countdowns WHERE room_id=$1",
        [id],
      )
    ).rowCount;
    if (
      r.status !== "WAITING" ||
      counting ||
      players.length < 2 ||
      targetId === s.actor.userId ||
      !players.some((m) => m.user_id === targetId)
    )
      throw new RoomError(
        "SEAT_LEAVE_DENIED",
        "Chưa thể mời người này rời ghế",
      );
    await s.client.query(
      "DELETE FROM public.room_members WHERE room_id=$1 AND user_id=$2",
      [id, targetId],
    );
    await s.client.query(
      "DELETE FROM public.active_players WHERE user_id=$1 AND room_id=$2",
      [targetId, id],
    );
    await this.cancel(s, id);
    await this.closeSwapOffers(s, id);
    await this.closeDownOffers(s, id);
    const version = await this.bump(s, id, "room.seat-left", {
      userId: targetId,
    });
    await this.event(s, id, version, "media.revoke-user", { userId: targetId });
    await this.event(s, id, version, "room.removed", {
      recipients: [targetId],
      message: "Chủ phòng đã mời bạn rời ghế",
    });
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
    const version = await this.bump(s, id, "room.viewer-kicked", {
      userId: targetId,
    });
    await this.event(s, id, version, "media.revoke-user", { userId: targetId });
    await this.event(s, id, version, "room.removed", {
      recipients: [targetId],
      message: "Bạn đã bị đuổi khỏi phòng và không thể vào lại.",
    });
    return this.snapshot(s, id);
  }
}
