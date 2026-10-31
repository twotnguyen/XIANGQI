import { randomUUID } from "node:crypto";
import { invalidRoomInput, RoomError, type RoomScope } from "./room.types.js";
import { RoomStoreCore, swapCooldownOpen } from "./room-store-core.js";
/**
 * Lớp mở rộng của RoomStore hỗ trợ tính năng đề nghị đổi bên (Red <-> Black) giữa 2 người chơi.
 */
export class RoomSwapStore extends RoomStoreCore {
  private async swapPair(s: RoomScope, id: string) {
    const { r, members, member } = await this.member(s, id);
    if (r.status !== "WAITING" || member.role !== "PLAYER")
      throw new RoomError(
        "SWAP_DENIED",
        "Chỉ đổi bên khi đang chờ đủ hai người",
      );
    const players = members.filter((m) => m.role === "PLAYER");
    if (players.length !== 2)
      throw new RoomError(
        "SWAP_DENIED",
        "Chỉ đổi bên khi đang chờ đủ hai người",
      );
    if (
      (
        await s.client.query(
          "SELECT 1 FROM xiangqi_room.countdowns WHERE room_id=$1",
          [id],
        )
      ).rowCount
    )
      throw new RoomError("SWAP_DENIED", "Đang đếm vào ván, không đổi bên");
    const other = players.find((m) => m.user_id !== s.actor.userId)!;
    return { r, me: member, other };
  }
  /**
   * Tạo đề nghị đổi bên gửi tới đối phương (thời hạn 30 giây, giới hạn cooldown sau khi bị từ chối).
   */
  async proposeSwap(s: RoomScope, id: string) {
    this.throttle(s, "swap");
    const { other } = await this.swapPair(s, id);
    // Tu het han truoc khi kiem: phong khoe khong co worker ghe tham van tu phuc hoi.
    await this.expireSwapOffers(s, id);
    const pending = (
      await s.client.query(
        "SELECT id FROM xiangqi_room.side_swap_offers WHERE room_id=$1 AND status='PENDING'",
        [id],
      )
    ).rows[0];
    if (pending)
      throw new RoomError("SWAP_ALREADY_PENDING", "Đang có đề nghị đổi bên");
    const cooling = (
      await s.client.query(
        `SELECT resolved_at FROM xiangqi_room.side_swap_offers WHERE room_id=$1 AND proposer_id=$2 AND ${swapCooldownOpen} ORDER BY resolved_at DESC LIMIT 1`,
        [id, s.actor.userId],
      )
    ).rows[0];
    if (cooling)
      throw new RoomError("SWAP_COOLDOWN", "Vui lòng chờ trước khi gửi lại");
    const offer = (
      await s.client.query(
        "WITH t AS MATERIALIZED(SELECT clock_timestamp() AS now) INSERT INTO xiangqi_room.side_swap_offers(id,room_id,proposer_id,responder_id,status,created_at,expires_at,resolved_at) SELECT $1,$2,$3,$4,'PENDING',t.now,t.now+interval '30 seconds',NULL FROM t RETURNING id,expires_at",
        [randomUUID(), id, s.actor.userId, other.user_id],
      )
    ).rows[0];
    await this.bump(s, id, "room.swap-proposed", {
      offerId: offer.id,
      proposerId: s.actor.userId,
      responderId: other.user_id,
      expiresAt: (offer.expires_at as Date).toISOString(),
    });
    return this.snapshot(s, id);
  }
  /**
   * Người gửi rút lại đề nghị đổi bên đang chờ phản hồi.
   */
  async withdrawSwap(s: RoomScope, id: string) {
    const { r } = await this.member(s, id);
    if (r.status !== "WAITING")
      throw new RoomError("SWAP_DENIED", "Không thể rút đề nghị lúc này");
    const done = (
      await s.client.query(
        "UPDATE xiangqi_room.side_swap_offers SET status='WITHDRAWN',resolved_at=clock_timestamp() WHERE room_id=$1 AND proposer_id=$2 AND status='PENDING' RETURNING id",
        [id, s.actor.userId],
      )
    ).rows[0];
    if (!done)
      throw new RoomError("SWAP_NOT_PENDING", "Không có đề nghị đang chờ");
    await this.bump(s, id, "room.swap-withdrawn", { offerId: done.id });
    return this.snapshot(s, id);
  }
  /**
   * Người nhận phản hồi chấp nhận (hoán đổi ghế Đỏ/Đen) hoặc từ chối đề nghị đổi bên.
   */
  async respondSwap(s: RoomScope, id: string, accept: boolean) {
    if (typeof accept !== "boolean") invalidRoomInput();
    const offer = (
      await s.client.query(
        "SELECT * FROM xiangqi_room.side_swap_offers WHERE room_id=$1 AND status='PENDING' ORDER BY created_at DESC LIMIT 1",
        [id],
      )
    ).rows[0];
    if (!offer)
      throw new RoomError("SWAP_NOT_PENDING", "Không có đề nghị đang chờ");
    if (offer.responder_id !== s.actor.userId)
      throw new RoomError("SWAP_FORBIDDEN", "Chỉ người được mời trả lời");
    if (new Date(offer.expires_at).getTime() <= Date.now()) {
      // Het han do worker ket luan (expireSwapOffers) de tranh rollback
      // khi throw; day chi la kiem tra doc.
      throw new RoomError("SWAP_EXPIRED", "Đề nghị đã hết hạn");
    }
    if (!accept) {
      await s.client.query(
        "UPDATE xiangqi_room.side_swap_offers SET status='DECLINED',resolved_at=clock_timestamp() WHERE id=$1 AND status='PENDING'",
        [offer.id],
      );
      await this.bump(s, id, "room.swap-declined", { offerId: offer.id });
      return this.snapshot(s, id);
    }
    const { members } = await this.member(s, id);
    const seated = new Set(
      members.filter((m) => m.role === "PLAYER").map((m) => m.user_id),
    );
    if (
      seated.size !== 2 ||
      !seated.has(offer.proposer_id) ||
      !seated.has(offer.responder_id) ||
      (
        await s.client.query(
          "SELECT 1 FROM xiangqi_room.countdowns WHERE room_id=$1",
          [id],
        )
      ).rowCount
    ) {
      await s.client.query(
        "UPDATE xiangqi_room.side_swap_offers SET status='CLOSED',resolved_at=clock_timestamp() WHERE id=$1 AND status='PENDING'",
        [offer.id],
      );
      await this.bump(s, id, "room.swap-closed", { offerId: offer.id });
      throw new RoomError("SWAP_STALE", "Thành phần phòng đã thay đổi");
    }
    await s.client.query(
      "UPDATE xiangqi_room.side_swap_offers SET status='ACCEPTED',resolved_at=clock_timestamp() WHERE id=$1 AND status='PENDING'",
      [offer.id],
    );
    await s.client.query(
      "UPDATE public.room_members SET side=CASE side WHEN 'RED' THEN 'BLACK' ELSE 'RED' END,ready=false WHERE room_id=$1 AND role='PLAYER'",
      [id],
    );
    await this.bump(s, id, "room.swap-accepted", { offerId: offer.id });
    return this.snapshot(s, id);
  }
  /**
   * Đánh dấu hết hạn cho các đề nghị đổi bên đã quá thời hạn 30 giây.
   */
  async expireSwapOffers(s: RoomScope, id: string) {
    if (!(await this.swapTableExists(s))) return 0;
    const due = (
      await s.client.query(
        "UPDATE xiangqi_room.side_swap_offers SET status='EXPIRED',resolved_at=clock_timestamp() WHERE room_id=$1 AND status='PENDING' AND expires_at<=clock_timestamp() RETURNING id",
        [id],
      )
    ).rows as { id: string }[];
    for (const offer of due)
      await this.bump(s, id, "room.swap-expired", { offerId: offer.id });
    return due.length;
  }
}
