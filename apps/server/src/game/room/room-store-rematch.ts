import { randomUUID } from "node:crypto";
import { invalidRoomInput, RoomError, type RoomScope } from "./room.types.js";
import { RoomSwapStore } from "./room-store-swap.js";
/**
 * Lớp mở rộng của RoomStore cho đề nghị tái đấu sau ván phòng tùy chỉnh: giữ phe hoặc đổi phe, 30 giây để đồng ý.
 */
export class RoomRematchStore extends RoomSwapStore {
  private async rematchPair(s: RoomScope, id: string) {
    const room = (
      await s.client.query<{ invite_code: string | null; kind?: string; status: string; finished_at: Date | null; valid: boolean }>(
        "SELECT *, finished_at + interval '10 minutes' > clock_timestamp() AS valid FROM public.rooms WHERE id=$1",
        [id],
      )
    ).rows[0];
    if (!room || room.kind === "RANKED" || (room.kind === "CASUAL" ? room.status !== "FINISHED" || !room.valid : !room.invite_code))
      throw new RoomError(
        "REMATCH_DENIED",
        "Chỉ tái đấu sau ván phòng tùy chỉnh",
      );
    const { r, members, member } = await this.member(s, id);
    if (
      s.actor.kind !== "member" ||
      (room.kind === "CASUAL" ? r.status !== "FINISHED" : r.status !== "WAITING") ||
      member.role !== "PLAYER"
    )
      throw new RoomError(
        "REMATCH_DENIED",
        "Chỉ tái đấu sau ván phòng tùy chỉnh",
      );
    const players = members.filter((m) => m.role === "PLAYER");
    if (players.length !== 2)
      throw new RoomError("REMATCH_DENIED", "Cần đủ hai người chơi để tái đấu");
    const kinds = (
      await s.client.query<{ kind: string }>(
        "SELECT kind FROM xiangqi_auth.principals WHERE id=ANY($1::uuid[])",
        [players.map((p) => p.user_id)],
      )
    ).rows;
    if (kinds.length !== 2 || kinds.some((k) => k.kind !== "member"))
      throw new RoomError("REMATCH_DENIED", "Khách không thể tái đấu");
    if (
      (
        await s.client.query(
          "SELECT 1 FROM xiangqi_room.countdowns WHERE room_id=$1",
          [id],
        )
      ).rowCount
    )
      throw new RoomError("REMATCH_DENIED", "Đang đếm vào ván, không tái đấu");
    const match = (
      await s.client.query<{
        id: string;
        status: string;
        red_user_id: string | null;
        black_user_id: string | null;
      }>(
        "SELECT id,status,red_user_id,black_user_id FROM public.matches WHERE room_id=$1 ORDER BY created_at DESC LIMIT 1",
        [id],
      )
    ).rows[0];
    if (!match || !["FINISHED", "INTERRUPTED"].includes(match.status))
      throw new RoomError("REMATCH_DENIED", "Chưa có ván kết thúc để tái đấu");
    const seated = new Set(players.map((p) => p.user_id));
    if (
      !match.red_user_id ||
      !match.black_user_id ||
      !seated.has(match.red_user_id) ||
      !seated.has(match.black_user_id)
    )
      throw new RoomError(
        "REMATCH_DENIED",
        "Chỉ tái đấu với đúng hai người của ván vừa kết thúc",
      );
    const other = players.find((m) => m.user_id !== s.actor.userId)!;
    return { other, matchId: match.id };
  }
  /**
   * Người vừa kết thúc ván đề nghị tái đấu: giữ phe hoặc đổi phe. Đối thủ có 30 giây để đồng ý.
   */
  async proposeRematch(s: RoomScope, id: string, side: "KEEP" | "SWAP") {
    if (side !== "KEEP" && side !== "SWAP") invalidRoomInput();
    const { other, matchId } = await this.rematchPair(s, id);
    // Tu het han truoc khi kiem, de khong bi chan boi de nghi da qua han chua duoc worker ket luan.
    await this.expireRematchOffers(s, id);
    if (
      (
        await s.client.query(
          "SELECT 1 FROM xiangqi_room.rematch_offers WHERE room_id=$1 AND status='PENDING'",
          [id],
        )
      ).rowCount
    )
      throw new RoomError("REMATCH_ALREADY_PENDING", "Đang có đề nghị tái đấu");
    const offer = (
      await s.client.query(
        "WITH t AS MATERIALIZED(SELECT clock_timestamp() AS now) INSERT INTO xiangqi_room.rematch_offers(id,room_id,match_id,proposer_id,responder_id,side,status,created_at,expires_at,resolved_at) SELECT $1,$2,$3,$4,$5,$6,'PENDING',t.now,t.now+interval '30 seconds',NULL FROM t RETURNING id,expires_at",
        [randomUUID(), id, matchId, s.actor.userId, other.user_id, side],
      )
    ).rows[0];
    await this.bump(s, id, "room.rematch-proposed", {
      offerId: offer.id,
      proposerId: s.actor.userId,
      responderId: other.user_id,
      side,
      expiresAt: (offer.expires_at as Date).toISOString(),
    });
    return this.snapshot(s, id);
  }
  /**
   * Người nhận đồng ý (đếm ngược 3 giây rồi vào ván mới cùng phòng) hoặc từ chối đề nghị tái đấu.
   */
  async respondRematch(s: RoomScope, id: string, accept: boolean) {
    if (typeof accept !== "boolean") invalidRoomInput();
    const offer = (
      await s.client.query(
        "SELECT *, expires_at <= clock_timestamp() AS expired FROM xiangqi_room.rematch_offers WHERE room_id=$1 AND status='PENDING' LIMIT 1",
        [id],
      )
    ).rows[0];
    if (!offer)
      throw new RoomError("REMATCH_NOT_PENDING", "Không có đề nghị tái đấu");
    if (offer.responder_id !== s.actor.userId)
      throw new RoomError("REMATCH_FORBIDDEN", "Chỉ người được mời trả lời");
    // Hạn tính theo đồng hồ DB (cùng nguồn với worker); không ghi ở đây để tránh rollback khi throw.
    if (offer.expired)
      throw new RoomError("REMATCH_EXPIRED", "Đề nghị đã hết hạn");
    if (!accept) {
      await s.client.query(
        "UPDATE xiangqi_room.rematch_offers SET status='DECLINED',resolved_at=clock_timestamp() WHERE id=$1 AND status='PENDING'",
        [offer.id],
      );
      await this.bump(s, id, "room.rematch-declined", { offerId: offer.id });
      return this.snapshot(s, id);
    }
    const { r, members } = await this.member(s, id);
    if (r.kind === "RANKED" || (r.kind === "CASUAL" && (!r.finished_at || (r.server_now as Date).getTime() >= (r.finished_at as Date).getTime() + 600000)))
      throw new RoomError("REMATCH_DENIED", "Đã hết hạn tái đấu");
    const players = members.filter((m) => m.role === "PLAYER");
    const seated = new Set(players.map((m) => m.user_id));
    const latest = (
      await s.client.query<{
        id: string;
        status: string;
        red_user_id: string | null;
        black_user_id: string | null;
      }>(
        "SELECT id,status,red_user_id,black_user_id FROM public.matches WHERE room_id=$1 ORDER BY created_at DESC LIMIT 1",
        [id],
      )
    ).rows[0];
    const connected = (
      await s.client.query(
        "SELECT 1 FROM xiangqi_room.presence WHERE room_id=$1 AND user_id=ANY($2::uuid[]) AND connected",
        [id, [offer.proposer_id, offer.responder_id]],
      )
    ).rowCount;
    if (
      (r.kind === "CASUAL" ? r.status !== "FINISHED" : r.status !== "WAITING") ||
      players.length !== 2 ||
      seated.size !== 2 ||
      !seated.has(offer.proposer_id) ||
      !seated.has(offer.responder_id) ||
      !latest ||
      latest.id !== offer.match_id ||
      !["FINISHED", "INTERRUPTED"].includes(latest.status) ||
      !latest.red_user_id ||
      !latest.black_user_id ||
      !seated.has(latest.red_user_id) ||
      !seated.has(latest.black_user_id) ||
      (
        await s.client.query(
          "SELECT 1 FROM xiangqi_room.countdowns WHERE room_id=$1",
          [id],
        )
      ).rowCount
    )
      throw new RoomError("REMATCH_STALE", "Thành phần phòng đã thay đổi");
    if (connected !== 2)
      throw new RoomError("PLAYER_DISCONNECTED", "Có người chơi chưa kết nối");
    // Ghi ACCEPTED trước khi đổi phe: trigger room_members sẽ đóng các đề nghị PENDING còn lại.
    await s.client.query(
      "UPDATE xiangqi_room.rematch_offers SET status='ACCEPTED',resolved_at=clock_timestamp() WHERE id=$1 AND status='PENDING'",
      [offer.id],
    );
    if (offer.side === "SWAP")
      await s.client.query(
        "UPDATE public.room_members SET side=CASE side WHEN 'RED' THEN 'BLACK' ELSE 'RED' END WHERE room_id=$1 AND role='PLAYER'",
        [id],
      );
    await s.client.query(
      "UPDATE public.room_members SET ready=true WHERE room_id=$1 AND role='PLAYER'",
      [id],
    );
    const sides = (
      await s.client.query<{ user_id: string; side: string }>(
        "SELECT user_id,side FROM public.room_members WHERE room_id=$1 AND role='PLAYER'",
        [id],
      )
    ).rows;
    await s.client.query(
      "INSERT INTO xiangqi_room.countdowns(room_id,token,due_at,red_id,black_id) VALUES($1,$2,clock_timestamp()+interval '3 seconds',$3,$4) ON CONFLICT(room_id) DO NOTHING",
      [
        id,
        randomUUID(),
        sides.find((p) => p.side === "RED")!.user_id,
        sides.find((p) => p.side === "BLACK")!.user_id,
      ],
    );
    await this.bump(s, id, "room.rematch-accepted", { offerId: offer.id });
    return this.snapshot(s, id);
  }
  /**
   * Đánh dấu hết hạn cho các đề nghị tái đấu đã quá 30 giây.
   */
  async expireRematchOffers(s: RoomScope, id: string) {
    const due = (
      await s.client.query(
        "UPDATE xiangqi_room.rematch_offers SET status='EXPIRED',resolved_at=clock_timestamp() WHERE room_id=$1 AND status='PENDING' AND expires_at<=clock_timestamp() RETURNING id",
        [id],
      )
    ).rows as { id: string }[];
    for (const offer of due)
      await this.bump(s, id, "room.rematch-expired", { offerId: offer.id });
    return due.length;
  }
}
