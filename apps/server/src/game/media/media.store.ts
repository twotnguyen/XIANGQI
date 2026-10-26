import type { Pool, PoolClient } from "pg";
import { actorLock, transaction } from "../../core/postgres.js";
import type { ShareLevel } from "./media.types.js";

/** All SQL of the media domain; MediaAccess decides and talks to LiveKit. */
export class MediaStore {
  constructor(private readonly pool: Pool) {}
  /** Transaction holding the actor lock. */
  withUser<T>(userId: string, work: (tx: MediaTx) => Promise<T>): Promise<T> {
    return transaction(this.pool, async (client) => {
      await actorLock(client, userId);
      return work(new MediaTx(client));
    });
  }
  /** Transaction without an actor lock. */
  read<T>(work: (tx: MediaTx) => Promise<T>): Promise<T> {
    return transaction(this.pool, (client) => work(new MediaTx(client)));
  }
}

/** Data access bound to one open transaction. */
export class MediaTx {
  constructor(private readonly client: PoolClient) {}
  /** True when the user holds a player seat in an open WAITING/PLAYING room. */
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
  /** Stored sharing level, or undefined when the user never chose one. */
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
  /** Role of the user in an open room, or undefined when not a member. */
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
}
