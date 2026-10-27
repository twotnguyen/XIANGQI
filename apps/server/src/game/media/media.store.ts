import type { Pool, PoolClient } from "pg";
import { actorLock, transaction } from "../../core/postgres.js";
import type { ShareLevel } from "./media.types.js";

/**
 * Lớp Repository quản lý lưu trữ cấu hình chia sẻ media trong cơ sở dữ liệu.
 */
export class MediaStore {
  constructor(private readonly pool: Pool) {}
  /**
   * Mở giao dịch ghi có giữ khóa actor lock của người dùng.
   */
  withUser<T>(userId: string, work: (tx: MediaTx) => Promise<T>): Promise<T> {
    return transaction(this.pool, async (client) => {
      await actorLock(client, userId);
      return work(new MediaTx(client));
    });
  }
  /**
   * Mở giao dịch giữ khóa riêng cho cặp phòng–người dùng. Chỉ cấp token và thu hồi media dùng khóa này, không dùng khóa actor/phòng của ván/đồng hồ.
   */
  withParticipant<T>(
    roomId: string,
    userId: string,
    work: (tx: MediaTx) => Promise<T>,
  ): Promise<T> {
    return transaction(this.pool, async (client) => {
      await client.query(
        "SELECT pg_advisory_xact_lock(hashtextextended($1,0))",
        [`media:${roomId}:${userId}`],
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
   * Lưu hoặc cập nhật mức độ chia sẻ camera/mic của người dùng trong phòng.
   */
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
  /**
   * Lấy id các sự kiện media.revoke-user chưa ack của cặp phòng–người dùng.
   */
  async pendingUserRevocations(
    roomId: string,
    userId: string,
  ): Promise<string[]> {
    const rows = (
      await this.client.query<{ id: string }>(
        `SELECT id FROM xiangqi_room.outbox
           WHERE room_id=$1 AND type='media.revoke-user' AND delivered_at IS NULL AND lower(payload->>'userId')=$2
           ORDER BY created_at,id`,
        [roomId, userId],
      )
    ).rows;
    return rows.map((row) => row.id);
  }
  /**
   * Đánh dấu đã thu hồi xong cho đúng các event đã snapshot.
   */
  async markUserRevocationsDelivered(ids: string[]): Promise<void> {
    if (!ids.length) return;
    await this.client.query(
      "UPDATE xiangqi_room.outbox SET delivered_at=clock_timestamp() WHERE id=ANY($1::uuid[]) AND type='media.revoke-user' AND delivered_at IS NULL",
      [ids],
    );
  }
}
