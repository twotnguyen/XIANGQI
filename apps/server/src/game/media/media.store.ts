import type { RoomControlProof } from "@xiangqi/shared";
import { randomUUID } from "node:crypto";
import type { Pool, PoolClient } from "pg";
import { transaction } from "../../core/postgres.js";
import { RoomTransactions } from "../room/room-transactions.js";
import { MediaError, type ShareLevel } from "./media.types.js";

/**
 * Lớp Repository quản lý lưu trữ cấu hình chia sẻ media trong cơ sở dữ liệu.
 */
export class MediaStore {
  constructor(private readonly pool: Pool) {}
  /**
   * Ghi mức chia sẻ và outbox dưới cùng thứ tự khóa actor/phòng của ván.
   */
  async withRoom<T>(
    userId: string,
    roomId: string,
    work: (tx: MediaTx) => Promise<T>,
  ): Promise<T> {
    const actor = await transaction(this.pool, async (client) => {
      const row = (
        await client.query<{ kind: "member" | "guest" }>(
          "SELECT kind FROM xiangqi_auth.principals WHERE id=$1",
          [userId],
        )
      ).rows[0];
      if (!row)
        throw new MediaError("MEDIA_FORBIDDEN", "Bạn không ở trong phòng", 403);
      return { userId, kind: row.kind };
    });
    const result = await new RoomTransactions(this.pool).withRoom(
      { actor, roomIds: [roomId] },
      async () => ({ status: "active", actor }),
      (scope) => work(new MediaTx(scope.client)),
    );
    if (result.status === "ended")
      throw new MediaError("MEDIA_FORBIDDEN", "Bạn không ở trong phòng", 403);
    return result.value;
  }
  /**
   * Khóa media theo phòng, độc lập với khóa actor/phòng của ván.
   */
  withMediaRoom<T>(
    roomId: string,
    work: (tx: MediaTx) => Promise<T>,
  ): Promise<T> {
    return transaction(this.pool, async (client) => {
      await client.query(
        "SELECT pg_advisory_xact_lock(hashtextextended($1,0))",
        [`media:${roomId}`],
      );
      return work(new MediaTx(client));
    });
  }
  /**
   * Mở giao dịch chỉ đọc không giữ khóa.
   */
  read<T>(work: (tx: MediaTx) => Promise<T>): Promise<T> {
    return transaction(this.pool, (client) => work(new MediaTx(client)));
  }
}

/**
 * Đối tượng thao tác cơ sở dữ liệu media gắn liền với một kết nối giao dịch đang mở.
 */
export class MediaTx {
  constructor(private readonly client: PoolClient) {}
  /**
   * Kiểm tra người dùng có đang giữ ghế kỳ thủ trong phòng đang mở không.
   */
  async hasPlayerSeat(roomId: string, userId: string): Promise<boolean> {
    const seat = (
      await this.client.query(
        `SELECT m.side FROM public.room_members m JOIN public.rooms r ON r.id=m.room_id
           WHERE m.room_id=$1 AND m.user_id=$2 AND m.role='PLAYER' AND r.status IN('WAITING','PLAYING') AND r.closed_at IS NULL`,
        [roomId, userId],
      )
    ).rows[0];
    return Boolean(seat);
  }
  /**
   * Tab đang giữ quyền điều khiển phòng của người dùng (nguồn sự thật từ realtime). Thiếu dòng nghĩa là chưa có tab nào.
   */
  async controllingTab(
    roomId: string,
    userId: string,
  ): Promise<string | undefined> {
    const row = (
      await this.client.query<{ tab_id: string }>(
        "SELECT tab_id FROM xiangqi_realtime.controllers WHERE user_id=$1 AND room_id=$2",
        [userId, roomId],
      )
    ).rows[0];
    return row?.tab_id;
  }
  /**
   * Kiểm tra tab, kết nối và thế hệ hiện hành của người dùng dưới actor lock.
   */

  async hasControl(
    roomId: string,
    userId: string,
    control: RoomControlProof,
  ): Promise<boolean> {
    const current = await this.client.query(
      "SELECT 1 FROM xiangqi_realtime.controllers c JOIN xiangqi_room.presence p ON p.room_id=c.room_id AND p.user_id=c.user_id WHERE c.user_id=$1 AND c.room_id=$2 AND c.tab_id=$3 AND c.connection_id=$4 AND c.generation=$5 AND p.connection_id=c.connection_id AND p.connected",
      [
        userId,
        roomId,
        control.tabId.toLowerCase(),
        control.connectionId,
        control.generation,
      ],
    );
    return Boolean(current.rowCount);
  }
  /** Lưu mức chia sẻ sau khi đã xác minh controller dưới actor lock. */
  async saveShare(
    roomId: string,
    userId: string,
    level: ShareLevel,
  ): Promise<void> {
    await this.client.query(
      "INSERT INTO xiangqi_room.media_share(room_id,user_id,level,updated_at) VALUES($1,$2,$3,clock_timestamp()) ON CONFLICT(room_id,user_id) DO UPDATE SET level=EXCLUDED.level,updated_at=clock_timestamp()",
      [roomId, userId, level],
    );
  }
  async queueShareRevoke(roomId: string, userId: string): Promise<void> {
    const room = await this.client.query<{ room_version: string }>(
      "UPDATE public.rooms SET room_version=room_version+1,updated_at=now() WHERE id=$1 RETURNING room_version",
      [roomId],
    );
    await this.client.query(
      "INSERT INTO xiangqi_room.outbox(id,room_id,room_version,type,payload) VALUES($1,$2,$3,'media.revoke-user',$4)",
      [randomUUID(), roomId, room.rows[0]!.room_version, { userId }],
    );
  }
  /**
   * Lấy mức chia sẻ media đã lưu của người dùng.
   */
  async findShare(
    roomId: string,
    userId: string,
  ): Promise<ShareLevel | undefined> {
    const row = (
      await this.client.query(
        "SELECT level FROM xiangqi_room.media_share WHERE room_id=$1 AND user_id=$2",
        [roomId, userId],
      )
    ).rows[0];
    return row?.level;
  }
  async permittedSources(
    roomId: string,
    userId: string,
    role: string,
  ): Promise<string[]> {
    const result = await this.client.query<{ user_id: string }>(
      `SELECT m.user_id FROM public.room_members m
       LEFT JOIN xiangqi_room.media_share s ON s.room_id=m.room_id AND s.user_id=m.user_id
       WHERE m.room_id=$1 AND m.role='PLAYER' AND m.user_id<>$2
       AND CASE WHEN $3='PLAYER' THEN COALESCE(s.level,'OPPONENT') IN ('OPPONENT','ALL')
                ELSE s.level='ALL' END`,
      [roomId, userId, role],
    );
    return result.rows.map((row) => row.user_id);
  }
  /**
   * Lấy vai trò thành viên của người dùng trong phòng.
   */
  async findMemberRole(
    roomId: string,
    userId: string,
  ): Promise<string | undefined> {
    const member = (
      await this.client.query(
        `SELECT m.role FROM public.room_members m JOIN public.rooms r ON r.id=m.room_id
           WHERE m.room_id=$1 AND m.user_id=$2 AND r.closed_at IS NULL`,
        [roomId, userId],
      )
    ).rows[0];
    return member?.role;
  }
  async generation(roomId: string, lock = false): Promise<string> {
    const result = await this.client.query<{ media_generation: string }>(
      `SELECT media_generation FROM public.rooms WHERE id=$1${lock ? " FOR SHARE" : ""}`,
      [roomId],
    );
    if (!result.rows[0])
      throw new MediaError("MEDIA_FORBIDDEN", "Bạn không ở trong phòng", 403);
    return result.rows[0].media_generation;
  }
  async pendingRevocations(
    roomId: string,
  ): Promise<{ id: string; generation: string | null }[]> {
    return (
      await this.client.query<{ id: string; generation: string | null }>(
        `SELECT id,media_generation AS generation FROM xiangqi_room.outbox
       WHERE room_id=$1 AND type IN ('media.revoke-user','media.revoke-room') AND delivered_at IS NULL
       ORDER BY created_at,id`,
        [roomId],
      )
    ).rows;
  }
  async markRevocationsDelivered(ids: string[]): Promise<void> {
    if (!ids.length) return;
    await this.client.query(
      "UPDATE xiangqi_room.outbox SET delivered_at=clock_timestamp() WHERE id=ANY($1::uuid[]) AND type IN ('media.revoke-user','media.revoke-room') AND delivered_at IS NULL",
      [ids],
    );
  }
}
