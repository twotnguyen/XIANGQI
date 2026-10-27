import type { PoolClient, QueryResultRow } from "pg";
import { randomUUID } from "node:crypto";
import {
  RoomError,
  RoomRosterChanged,
  type RoomEntry,
  type RoomEvent,
  type RoomScope,
  type RoomView,
  type MatchStartPort,
} from "./room.types.js";
export const alphabet = "0123456789";
export const uuid =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
/**
 * Tầng lưu trữ cơ sở của phòng cờ:
 * Quản lý sự kiện outbox, kiểm tra biên lai idempotency, giải mã invite code và truy vấn snapshot phòng.
 */
export class RoomStoreCore {
  constructor(protected readonly matches?: MatchStartPort) {}
  protected swapTableReady: boolean | null = null;
  protected seatTableReady: boolean | null = null;
  protected async swapTableExists(s: RoomScope): Promise<boolean> {
    if (this.swapTableReady === null) {
      const present = (
        await s.client.query(
          "SELECT to_regclass('xiangqi_room.side_swap_offers') IS NOT NULL AS present",
        )
      ).rows[0].present as boolean;
      this.swapTableReady = present;
    }
    return this.swapTableReady;
  }
  protected async pendingSwapOffer(
    s: RoomScope,
    id: string,
  ): Promise<{
    id: string;
    proposer_id: string;
    responder_id: string;
    expires_at: Date;
  } | null> {
    // Bang doi ben thuoc migration 13; bo qua khi schema cu chua co bang
    // (test tich hop pin migration, rollback tung phan).
    if (!(await this.swapTableExists(s))) return null;
    try {
      return (
        (
          await s.client.query(
            "SELECT id,proposer_id,responder_id,expires_at FROM xiangqi_room.side_swap_offers WHERE room_id=$1 AND status='PENDING' ORDER BY created_at DESC LIMIT 1",
            [id],
          )
        ).rows[0] ?? null
      );
    } catch (error) {
      if (
        error instanceof Error &&
        (error as { code?: string }).code === "42P01"
      ) {
        this.swapTableReady = false;
        return null;
      }
      throw error;
    }
  }
  /**
   * Tra cứu ID phòng cờ hợp lệ từ mã mời (invite code) 8 chữ số.
   */
  async resolveCode(client: PoolClient, input: unknown): Promise<string> {
    if (typeof input !== "string" || !/^[0-9]{8}$/.test(input))
      throw new RoomError("ROOM_FORBIDDEN", "Phòng không còn khả dụng", 403);
    const row = (
      await client.query(
        "SELECT id FROM public.rooms WHERE invite_code=$1 AND closed_at IS NULL AND visibility<>'LOCKED'",
        [input],
      )
    ).rows[0];
    if (!row)
      throw new RoomError("ROOM_FORBIDDEN", "Phòng không còn khả dụng", 403);
    return row.id as string;
  }
  /**
   * Truy vấn danh sách các phòng cờ cần worker kiểm tra và xử lý định kỳ.
   */
  async dueRooms(client: PoolClient): Promise<string[]> {
    return (
      await client.query(
        "SELECT r.id FROM public.rooms r WHERE r.invite_code IS NOT NULL AND r.status IN('WAITING','FINISHED','PLAYING') AND (EXISTS(SELECT 1 FROM public.room_members m WHERE m.room_id=r.id AND m.role='SPECTATOR' AND m.disconnected_at+interval '5 minutes'<=clock_timestamp()) OR (r.status IN('WAITING','FINISHED') AND (EXISTS(SELECT 1 FROM xiangqi_room.countdowns d WHERE d.room_id=r.id AND d.due_at<=clock_timestamp()) OR EXISTS(SELECT 1 FROM public.room_members m WHERE m.room_id=r.id AND m.role='PLAYER' AND m.disconnected_at+interval '60 seconds'<=clock_timestamp())))) ORDER BY r.id LIMIT 50",
      )
    ).rows.map((r) => r.id as string);
  }
  /**
   * Lấy danh sách các sự kiện phòng cờ chưa được gửi từ bảng xiangqi_room.outbox.
   */
  async pendingEvents(client: PoolClient): Promise<RoomEvent[]> {
    return (
      await client.query(
        `SELECT id,room_id AS "roomId",room_version::float8 AS version,type,payload FROM xiangqi_room.outbox WHERE delivered_at IS NULL AND type NOT IN ('media.revoke-room','media.revoke-user') AND next_attempt_at<=clock_timestamp() ORDER BY created_at,id LIMIT 50`,
      )
    ).rows as RoomEvent[];
  }
  async markDelivered(client: PoolClient, id: string) {
    await client.query(
      "UPDATE xiangqi_room.outbox SET delivered_at=clock_timestamp() WHERE id=$1 AND delivered_at IS NULL",
      [id],
    );
  }
  async markFailed(client: PoolClient, id: string) {
    await client.query(
      "UPDATE xiangqi_room.outbox SET attempts=attempts+1,next_attempt_at=clock_timestamp()+interval '1 second'*LEAST(60,power(2,LEAST(attempts,6))) WHERE id=$1 AND delivered_at IS NULL",
      [id],
    );
  }
  protected scope(s: RoomScope, roomId?: string) {
    if (
      !s.lockedActorIds.has(s.actor.userId) ||
      (roomId && !s.lockedRoomIds.has(roomId))
    )
      throw new RoomError(
        "ROOM_LOCK_REQUIRED",
        "Giao dịch phòng chưa sẵn sàng",
        503,
      );
  }
  protected async event(
    s: RoomScope,
    id: string,
    version: number,
    type: string,
    payload: Record<string, unknown> = {},
  ) {
    await s.client.query(
      "INSERT INTO xiangqi_room.outbox(id,room_id,room_version,type,payload) VALUES($1,$2,$3,$4,$5)",
      [randomUUID(), id, version, type, payload],
    );
  }
  protected async replay(
    s: RoomScope,
    commandId: string,
    digest: string,
  ): Promise<RoomEntry | null> {
    const row = (
      await s.client.query(
        "SELECT fingerprint,response,room_id FROM xiangqi_room.entry_receipts WHERE actor_id=$1 AND command_id=$2 AND expires_at>now()",
        [s.actor.userId, commandId],
      )
    ).rows[0];
    if (!row) return null;
    if (row.fingerprint !== digest)
      throw new RoomError(
        "COMMAND_ID_REUSED",
        "Mã lệnh đã được dùng cho nội dung khác",
      );
    const current = (
      await s.client.query(
        "SELECT r.room_version,r.visibility,r.invite_code,m.side FROM public.room_members m JOIN public.rooms r ON r.id=m.room_id WHERE m.user_id=$1 AND m.room_id=$2 AND r.closed_at IS NULL AND (m.role<>'SPECTATOR' OR m.disconnected_at IS NULL OR m.disconnected_at+interval '5 minutes'>clock_timestamp())",
        [s.actor.userId, row.room_id],
      )
    ).rows[0];
    if (!current)
      throw new RoomError(
        "ROOM_FORBIDDEN",
        "Bạn không có quyền truy cập phòng này",
        403,
      );
    const response = row.response as RoomEntry;
    const projected: RoomEntry = {
      ...response,
      version: Number(current.room_version),
      role:
        current.side === "RED"
          ? "red"
          : current.side === "BLACK"
            ? "black"
            : "spectator",
    };
    delete projected.inviteCode;
    if (
      Object.hasOwn(response, "inviteCode") &&
      current.visibility !== "LOCKED" &&
      current.invite_code !== null
    )
      projected.inviteCode = current.invite_code as string;
    return projected;
  }
  protected async receipt(
    s: RoomScope,
    commandId: string,
    digest: string,
    response: RoomEntry,
  ) {
    await s.client.query(
      "DELETE FROM xiangqi_room.entry_receipts WHERE actor_id=$1 AND command_id=$2 AND expires_at<=now()",
      [s.actor.userId, commandId],
    );
    await s.client.query(
      "INSERT INTO xiangqi_room.entry_receipts(actor_id,command_id,fingerprint,room_id,response) VALUES($1,$2,$3,$4,$5)",
      [s.actor.userId, commandId, digest, response.roomId, response],
    );
  }
  protected async room(s: RoomScope, id: string) {
    this.scope(s, id);
    const rows = (
      await s.client.query(
        "SELECT r.*,clock_timestamp() AS server_now,m.user_id AS member_user_id,m.role AS member_role,m.side AS member_side,m.ready AS member_ready,m.disconnected_at AS member_disconnected_at,(m.role='SPECTATOR' AND m.disconnected_at+interval '5 minutes'<=clock_timestamp()) AS member_viewer_expired FROM public.rooms r LEFT JOIN public.room_members m ON m.room_id=r.id WHERE r.id=$1 ORDER BY m.user_id",
        [id],
      )
    ).rows as (QueryResultRow & {
      member_user_id: string | null;
      member_role: string | null;
      member_side: string | null;
      member_ready: boolean | null;
      member_disconnected_at: Date | null;
      member_viewer_expired: boolean | null;
    })[];
    const r = rows[0];
    if (!r || r.status === "CLOSED")
      throw new RoomError("ROOM_FORBIDDEN", "Phòng không còn khả dụng", 403);
    if (r.invite_code === null)
      throw new RoomError(
        "ROOM_LEGACY_UNSUPPORTED",
        "Phòng cũ chưa được hỗ trợ",
        503,
      );
    const members = [];
    for (const row of rows) {
      if (row.member_user_id === null) continue;
      members.push({
        user_id: row.member_user_id,
        role: row.member_role!,
        side: row.member_side,
        ready: row.member_ready!,
        disconnected_at: row.member_disconnected_at,
        viewer_expired: row.member_viewer_expired,
      });
    }
    const missing = members
      .filter((m) => m.role === "PLAYER" && !s.lockedActorIds.has(m.user_id))
      .map((m) => m.user_id);
    if (missing.length)
      throw new RoomRosterChanged(
        [...new Set([...s.lockedActorIds, ...missing])].sort(),
      );
    return { r, members };
  }
  protected async member(s: RoomScope, id: string, allowExpiredViewer = false) {
    const state = await this.room(s, id);
    const member = state.members.find((m) => m.user_id === s.actor.userId);
    if (
      !member ||
      (!allowExpiredViewer &&
        member.role === "SPECTATOR" &&
        member.viewer_expired)
    )
      throw new RoomError(
        "ROOM_FORBIDDEN",
        "Bạn không có quyền truy cập phòng này",
        403,
      );
    return { ...state, member };
  }
  async authorize(s: RoomScope, id: string) {
    const { member } = await this.member(s, id);
    return { canControl: member.side === "RED" || member.side === "BLACK" };
  }
  protected async bump(
    s: RoomScope,
    id: string,
    type: string,
    payload: Record<string, unknown> = {},
  ) {
    const version = Number(
      (
        await s.client.query(
          "UPDATE public.rooms SET room_version=room_version+1,updated_at=now() WHERE id=$1 RETURNING room_version",
          [id],
        )
      ).rows[0].room_version,
    );
    await this.event(s, id, version, type, payload);
    return version;
  }
  protected async cancel(s: RoomScope, id: string) {
    await s.client.query(
      "DELETE FROM xiangqi_room.countdowns WHERE room_id=$1",
      [id],
    );
    await s.client.query(
      "UPDATE public.room_members SET ready=false WHERE room_id=$1",
      [id],
    );
  }
  /**
   * Lấy ảnh chụp trạng thái toàn diện (snapshot) của phòng cờ: ghế, người sẵn sàng, đếm ngược, khán giả, lời mời.
   */
  async snapshot(s: RoomScope, id: string): Promise<RoomView> {
    const { r, members, member } = await this.member(s, id),
      red = members.find((m) => m.side === "RED"),
      black = members.find((m) => m.side === "BLACK");
    const includeDown = await this.downTableExists(s);
    const includeSwap = await this.swapTableExists(s);
    const offerJoins = `${includeDown ? "LEFT JOIN LATERAL (SELECT id,invitee_id,expires_at FROM xiangqi_room.seat_invites WHERE room_id=$1 AND status='PENDING' ORDER BY created_at DESC LIMIT 1) down_offer ON TRUE" : ""} ${includeSwap ? "LEFT JOIN LATERAL (SELECT id,proposer_id,responder_id,expires_at FROM xiangqi_room.side_swap_offers WHERE room_id=$1 AND status='PENDING' ORDER BY created_at DESC LIMIT 1) swap_offer ON TRUE" : ""}`;
    const offerColumns = `${includeDown ? "down_offer.id AS down_id,down_offer.invitee_id AS down_invitee_id,down_offer.expires_at AS down_expires_at" : "NULL::uuid AS down_id,NULL::uuid AS down_invitee_id,NULL::timestamptz AS down_expires_at"},${includeSwap ? "swap_offer.id AS swap_id,swap_offer.proposer_id AS swap_proposer_id,swap_offer.responder_id AS swap_responder_id,swap_offer.expires_at AS swap_expires_at" : "NULL::uuid AS swap_id,NULL::uuid AS swap_proposer_id,NULL::uuid AS swap_responder_id,NULL::timestamptz AS swap_expires_at"}`;
    const aux = await s.client.query(
      `SELECT (SELECT token FROM xiangqi_room.countdowns WHERE room_id=$1) AS countdown_token,(SELECT due_at FROM xiangqi_room.countdowns WHERE room_id=$1) AS countdown_due_at,COALESCE((SELECT json_agg(json_build_object('user_id',m.user_id,'display_name',COALESCE(p.display_name,'Khách')) ORDER BY m.user_id) FROM public.room_members m LEFT JOIN public.profiles p ON p.user_id=m.user_id WHERE m.room_id=$1 AND m.role='SPECTATOR'),'[]'::json) AS spectators,ARRAY(SELECT user_id::text FROM xiangqi_room.presence WHERE room_id=$1 AND connected) AS online,${offerColumns} FROM (SELECT 1) room_snapshot ${offerJoins}`,
      [id],
    );
    const {
      countdown_token,
      countdown_due_at,
      spectators: watchers,
      online,
      down_id,
      down_invitee_id,
      down_expires_at,
      swap_id,
      swap_proposer_id,
      swap_responder_id,
      swap_expires_at,
    } = aux.rows[0] as {
      countdown_token: string | null;
      countdown_due_at: Date | null;
      spectators: { user_id: string; display_name: string }[];
      online: string[];
      down_id: string | null;
      down_invitee_id: string | null;
      down_expires_at: Date | null;
      swap_id: string | null;
      swap_proposer_id: string | null;
      swap_responder_id: string | null;
      swap_expires_at: Date | null;
    };
    const down = down_id
      ? {
          id: down_id,
          invitee_id: down_invitee_id!,
          expires_at: down_expires_at!,
        }
      : null;
    const swap = swap_id
      ? {
          id: swap_id,
          proposer_id: swap_proposer_id!,
          responder_id: swap_responder_id!,
          expires_at: swap_expires_at!,
        }
      : null;
    const d =
      countdown_token === null
        ? null
        : {
            token: countdown_token,
            due_at: countdown_due_at!,
          };
    return {
      serverNow: (r.server_now as Date).toISOString(),
      roomId: id,
      version: Number(r.room_version),
      room: {
        status: r.status,
        hostId: r.owner_id,
        name: r.name,
        visibility: r.visibility,
        inviteCode:
          r.visibility === "LOCKED" || r.status === "CLOSED"
            ? null
            : r.invite_code,
        timeMinutes: r.time_control / 60,
        viewerLimit: r.viewer_limit,
        seats: { red: red?.user_id ?? null, black: black?.user_id ?? null },
        ready: { red: red?.ready ?? false, black: black?.ready ?? false },
        connected: {
          red: !!red && online.includes(red.user_id),
          black: !!black && online.includes(black.user_id),
        },
        graceUntil: {
          red: red?.disconnected_at
            ? new Date(red.disconnected_at.getTime() + 60000).toISOString()
            : null,
          black: black?.disconnected_at
            ? new Date(black.disconnected_at.getTime() + 60000).toISOString()
            : null,
        },
        countdown: d ? { token: d.token, dueAt: d.due_at.toISOString() } : null,
        downOffer: down
          ? {
              id: down.id,
              inviteeId: down.invitee_id,
              expiresAt: (down.expires_at as Date).toISOString(),
            }
          : null,
        swapOffer: swap
          ? {
              id: swap.id,
              proposerId: swap.proposer_id,
              responderId: swap.responder_id,
              expiresAt: (swap.expires_at as Date).toISOString(),
            }
          : null,
        spectators: watchers.map((m) => ({
          userId: m.user_id,
          displayName: m.display_name,
        })),
      },
      role:
        member.side === "RED"
          ? "red"
          : member.side === "BLACK"
            ? "black"
            : "spectator",
    };
  }
  protected async downTableExists(s: RoomScope): Promise<boolean> {
    if (this.seatTableReady === null) {
      const present = (
        await s.client.query(
          "SELECT to_regclass('xiangqi_room.seat_invites') IS NOT NULL AS present",
        )
      ).rows[0].present as boolean;
      this.seatTableReady = present;
    }
    return this.seatTableReady;
  }
  protected async closeDownOffers(s: RoomScope, id: string) {
    if (!(await this.downTableExists(s))) return;
    await s.client.query(
      "UPDATE xiangqi_room.seat_invites SET status='CLOSED',resolved_at=clock_timestamp() WHERE room_id=$1 AND status='PENDING'",
      [id],
    );
  }
  protected async pendingDownOffer(
    s: RoomScope,
    id: string,
  ): Promise<{ id: string; invitee_id: string; expires_at: Date } | null> {
    if (!(await this.downTableExists(s))) return null;
    try {
      return (
        (
          await s.client.query(
            "SELECT id,invitee_id,expires_at FROM xiangqi_room.seat_invites WHERE room_id=$1 AND status='PENDING' ORDER BY created_at DESC LIMIT 1",
            [id],
          )
        ).rows[0] ?? null
      );
    } catch (error) {
      if (
        error instanceof Error &&
        (error as { code?: string }).code === "42P01"
      ) {
        this.seatTableReady = false;
        return null;
      }
      throw error;
    }
  }
  protected async kickedOut(
    s: RoomScope,
    roomId: string,
    userId: string,
  ): Promise<boolean> {
    try {
      const present = (
        await s.client.query(
          "SELECT to_regclass('xiangqi_room.room_blocks') IS NOT NULL AS present",
        )
      ).rows[0].present as boolean;
      if (!present) return false;
      return Boolean(
        (
          await s.client.query(
            "SELECT 1 FROM xiangqi_room.room_blocks WHERE room_id=$1 AND user_id=$2",
            [roomId, userId],
          )
        ).rowCount,
      );
    } catch (error) {
      if (
        error instanceof Error &&
        (error as { code?: string }).code === "42P01"
      )
        return false;
      throw error;
    }
  }
  protected async closeSwapOffers(s: RoomScope, id: string) {
    if (!(await this.swapTableExists(s))) return;
    await s.client.query(
      "UPDATE xiangqi_room.side_swap_offers SET status='CLOSED',resolved_at=clock_timestamp() WHERE room_id=$1 AND status='PENDING'",
      [id],
    );
  }
}
