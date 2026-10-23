import type { PoolClient, QueryResultRow } from "pg";
import { createHash, randomInt, randomUUID } from "node:crypto";
import {
  invalidRoomInput,
  RoomError,
  RoomRosterChanged,
  type MatchStartPort,
  type PresenceProof,
  type RoomEntry,
  type RoomEvent,
  type RoomScope,
  type RoomView,
} from "./room.types.js";
const alphabet = "0123456789";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export class RoomStore {
  constructor(
    private readonly matches?: MatchStartPort,
    private readonly media?: {
      revoke(roomId: string, userId: string): Promise<void>;
    },
  ) {}
  private swapTableReady: boolean | null = null;
  private async swapTableExists(s: RoomScope): Promise<boolean> {
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
  private async pendingSwapOffer(
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
  // Internal authenticated admission lookup; caller acquires all sorted actor locks afterwards.
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
  async dueRooms(client: PoolClient): Promise<string[]> {
    return (
      await client.query(
        "SELECT r.id FROM public.rooms r WHERE r.invite_code IS NOT NULL AND r.status IN('WAITING','FINISHED','PLAYING') AND (EXISTS(SELECT 1 FROM public.room_members m WHERE m.room_id=r.id AND m.role='SPECTATOR' AND m.disconnected_at+interval '5 minutes'<=clock_timestamp()) OR (r.status IN('WAITING','FINISHED') AND (EXISTS(SELECT 1 FROM xiangqi_room.countdowns d WHERE d.room_id=r.id AND d.due_at<=clock_timestamp()) OR EXISTS(SELECT 1 FROM public.room_members m WHERE m.room_id=r.id AND m.role='PLAYER' AND m.disconnected_at+interval '60 seconds'<=clock_timestamp())))) ORDER BY r.id LIMIT 50",
      )
    ).rows.map((r) => r.id as string);
  }
  async pendingEvents(client: PoolClient): Promise<RoomEvent[]> {
    return (
      await client.query(
        `SELECT id,room_id AS "roomId",room_version::float8 AS version,type,payload FROM xiangqi_room.outbox WHERE delivered_at IS NULL AND type<>'media.revoke-room' AND next_attempt_at<=clock_timestamp() ORDER BY created_at,id LIMIT 50`,
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
  private scope(s: RoomScope, roomId?: string) {
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
  private async event(
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
  private async replay(
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
  private async receipt(
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
  async create(
    s: RoomScope,
    input: {
      commandId: string;
      timeMinutes?: number;
      viewerLimit?: number;
    },
  ): Promise<RoomEntry> {
    this.scope(s);
    if (!uuid.test(input.commandId)) invalidRoomInput();
    const time = input.timeMinutes ?? 10,
      viewers = input.viewerLimit ?? 5;
    if (
      ![5, 10, 15].includes(time) ||
      !Number.isInteger(viewers) ||
      viewers < 0 ||
      viewers > 5
    )
      invalidRoomInput();
    const digest = createHash("sha256")
        .update(JSON.stringify({ type: "create", time, viewers }))
        .digest("hex"),
      old = await this.replay(s, input.commandId, digest);
    if (old) return old;
    const limits = (
      await s.client.query<{ seated: boolean; guestRoom: boolean }>(
        `SELECT EXISTS(SELECT 1 FROM public.active_players WHERE user_id=$1) AS seated,
         ($2::boolean AND EXISTS(SELECT 1 FROM public.rooms WHERE owner_id=$1 AND closed_at IS NULL)) AS "guestRoom"`,
        [s.actor.userId, s.actor.kind === "guest"],
      )
    ).rows[0]!;
    if (limits.seated)
      throw new RoomError(
        "ALREADY_SEATED",
        "Bạn đang giữ vị trí chơi ở nơi khác",
      );
    if (limits.guestRoom)
      throw new RoomError(
        "GUEST_ROOM_LIMIT",
        "Khách chỉ được tạo một phòng đang mở",
      );
    const id = randomUUID();
    let code = "";
    for (let attempt = 0; attempt < 5; attempt++) {
      code = Array.from({ length: 8 }, () => alphabet[randomInt(10)]!).join("");
      const row = await s.client.query(
        "INSERT INTO public.rooms(id,owner_id,name,visibility,time_control,viewer_limit,invite_code,room_version) VALUES($1,$2,$3,'CODE_ONLY',$4,$5,$6,1) ON CONFLICT(invite_code) WHERE invite_code IS NOT NULL DO NOTHING RETURNING id",
        [id, s.actor.userId, `Phòng ${code}`, time * 60, viewers, code],
      );
      if (row.rowCount) break;
      code = "";
    }
    if (!code)
      throw new RoomError("ROOM_UNAVAILABLE", "Chưa thể tạo mã phòng", 503);
    await s.client.query(
      `WITH reserved AS (
        INSERT INTO public.active_players(user_id,room_id)
        VALUES($1,$2) RETURNING user_id,room_id
      ), seated AS (
        INSERT INTO public.room_members(room_id,user_id,role,side,disconnected_at)
        SELECT room_id,user_id,'PLAYER','RED',clock_timestamp() FROM reserved
        RETURNING room_id
      )
      INSERT INTO xiangqi_room.outbox(id,room_id,room_version,type,payload)
      SELECT $3,room_id,1,'room.created','{}'::jsonb FROM seated`,
      [s.actor.userId, id, randomUUID()],
    );
    const response: RoomEntry = {
      roomId: id,
      version: 1,
      role: "red",
      inviteCode: code,
    };
    await this.receipt(s, input.commandId, digest, response);
    return response;
  }
  private async room(s: RoomScope, id: string) {
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
  private async member(s: RoomScope, id: string, allowExpiredViewer = false) {
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
  private async bump(
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
  private async cancel(s: RoomScope, id: string) {
    await s.client.query(
      "DELETE FROM xiangqi_room.countdowns WHERE room_id=$1",
      [id],
    );
    await s.client.query(
      "UPDATE public.room_members SET ready=false WHERE room_id=$1",
      [id],
    );
  }
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
  async changeVisibility(
    s: RoomScope,
    id: string,
    expectedVersion: number,
    visibility: "PUBLIC" | "CODE_ONLY" | "LOCKED",
  ): Promise<RoomView> {
    if (
      !uuid.test(id) ||
      !Number.isSafeInteger(expectedVersion) ||
      expectedVersion < 0 ||
      !["PUBLIC", "CODE_ONLY", "LOCKED"].includes(visibility)
    )
      invalidRoomInput();
    this.scope(s, id);
    await s.client.query("SELECT id FROM public.rooms WHERE id=$1 FOR UPDATE", [
      id,
    ]);
    const { r, members } = await this.member(s, id);
    if (r.owner_id !== s.actor.userId)
      throw new RoomError(
        "ROOM_FORBIDDEN",
        "Chỉ chủ phòng được đổi chế độ",
        403,
      );
    if (Number(r.room_version) !== expectedVersion)
      throw new RoomError("VERSION_STALE", "Trạng thái đã thay đổi");
    if (r.visibility === visibility) return this.snapshot(s, id);
    if (
      visibility === "LOCKED" &&
      members.filter((m) => m.role === "PLAYER").length !== 2
    )
      throw new RoomError(
        "ROOM_LOCK_REQUIRES_PLAYERS",
        "Chỉ khoá được khi đã đủ 2 người chơi",
      );
    if (r.visibility === "LOCKED") {
      let rotated = false;
      for (let attempt = 0; attempt < 5; attempt++) {
        const code = Array.from(
          { length: 8 },
          () => alphabet[randomInt(10)]!,
        ).join("");
        if (code === r.invite_code) continue;
        await s.client.query("SAVEPOINT room_code_rotation");
        try {
          const row = await s.client.query(
            "UPDATE public.rooms SET invite_code=$2,visibility=$3,public_opened_at=CASE WHEN $3='PUBLIC' THEN clock_timestamp() ELSE public_opened_at END WHERE id=$1 AND NOT EXISTS(SELECT 1 FROM public.rooms WHERE invite_code=$2) RETURNING id",
            [id, code, visibility],
          );
          rotated = !!row.rowCount;
        } catch (error) {
          await s.client.query("ROLLBACK TO SAVEPOINT room_code_rotation");
          if ((error as { code?: string }).code !== "23505") throw error;
        }
        await s.client.query("RELEASE SAVEPOINT room_code_rotation");
        if (rotated) break;
      }
      if (!rotated)
        throw new RoomError("ROOM_UNAVAILABLE", "Chưa thể tạo mã phòng", 503);
    } else {
      await s.client.query(
        "UPDATE public.rooms SET visibility=$2,public_opened_at=CASE WHEN $2='PUBLIC' THEN clock_timestamp() ELSE public_opened_at END WHERE id=$1",
        [id, visibility],
      );
    }
    if (visibility === "LOCKED")
      await s.client.query(
        "UPDATE public.invitations SET status='REVOKED',resolved_at=clock_timestamp() WHERE room_id=$1 AND status='ACTIVE'",
        [id],
      );
    await this.bump(s, id, "room.visibility-changed", { visibility });
    return this.snapshot(s, id);
  }
  async join(
    s: RoomScope,
    input: {
      commandId: string;
      roomId: string;
      intent: "auto" | "play" | "watch";
      expectedVersion?: number;
    },
  ): Promise<RoomEntry> {
    if (
      !uuid.test(input.commandId) ||
      !uuid.test(input.roomId) ||
      !["auto", "play", "watch"].includes(input.intent)
    )
      invalidRoomInput();
    const { r, members } = await this.room(s, input.roomId),
      digest = createHash("sha256")
        .update(
          JSON.stringify({
            type: "join",
            roomId: input.roomId,
            intent: input.intent,
            expectedVersion: input.expectedVersion ?? null,
          }),
        )
        .digest("hex"),
      old = await this.replay(s, input.commandId, digest);
    if (old) return old;
    const existing = members.find((m) => m.user_id === s.actor.userId);
    if (existing?.role === "SPECTATOR" && existing.viewer_expired)
      throw new RoomError(
        "ROOM_FORBIDDEN",
        "Chỗ xem trong phòng đã hết hạn",
        403,
      );
    if (existing)
      return {
        roomId: input.roomId,
        version: Number(r.room_version),
        role:
          existing.side === "RED"
            ? "red"
            : existing.side === "BLACK"
              ? "black"
              : "spectator",
      };
    if (r.visibility === "LOCKED")
      throw new RoomError("ROOM_LOCKED", "Phòng đã khóa", 403);
    if (await this.kickedOut(s, input.roomId, s.actor.userId))
      throw new RoomError("ROOM_BLOCKED", "Bạn đã bị đuổi khỏi phòng này", 403);
    if (
      input.expectedVersion !== undefined &&
      input.expectedVersion !== Number(r.room_version)
    )
      throw new RoomError("VERSION_STALE", "Trạng thái đã thay đổi");
    const seats = members.filter((m) => m.role === "PLAYER"),
      occupied = (
        await s.client.query(
          "SELECT 1 FROM public.active_players WHERE user_id=$1",
          [s.actor.userId],
        )
      ).rowCount;
    const playing =
      input.intent !== "watch" &&
      r.status === "WAITING" &&
      seats.length < 2 &&
      !occupied;
    if (
      !playing &&
      members.filter((m) => m.role === "SPECTATOR").length >= r.viewer_limit
    )
      throw new RoomError("ROOM_FULL", "Phòng đã đầy");
    const side = playing
      ? seats.some((m) => m.side === "RED")
        ? "BLACK"
        : "RED"
      : null;
    if (playing) {
      await s.client.query(
        "INSERT INTO public.active_players(user_id,room_id) VALUES($1,$2)",
        [s.actor.userId, input.roomId],
      );
      await this.cancel(s, input.roomId);
      await this.closeDownOffers(s, input.roomId);
      await this.closeSwapOffers(s, input.roomId);
    }
    await s.client.query(
      "INSERT INTO public.room_members(room_id,user_id,role,side,disconnected_at) VALUES($1,$2,$3,$4,clock_timestamp())",
      [input.roomId, s.actor.userId, playing ? "PLAYER" : "SPECTATOR", side],
    );
    const version = await this.bump(s, input.roomId, "room.members-changed");
    const response: RoomEntry = {
      roomId: input.roomId,
      version,
      role: side === "RED" ? "red" : side === "BLACK" ? "black" : "spectator",
      ...(input.intent === "play" && !playing
        ? { notice: "Ghế vừa có người, bạn đang xem trận" }
        : {}),
    };
    await this.receipt(s, input.commandId, digest, response);
    return response;
  }
  async switchSeat(s: RoomScope, id: string) {
    const { r, members, member } = await this.member(s, id);
    if (
      r.status !== "WAITING" ||
      r.owner_id !== s.actor.userId ||
      member.role !== "PLAYER" ||
      members.filter((m) => m.role === "PLAYER").length !== 1 ||
      (
        await s.client.query(
          "SELECT 1 FROM xiangqi_room.countdowns WHERE room_id=$1",
          [id],
        )
      ).rowCount
    )
      throw new RoomError(
        "SEAT_SWITCH_DENIED",
        "Chỉ Host ngồi một mình được đổi ghế",
      );
    await s.client.query(
      "UPDATE public.room_members SET side=CASE side WHEN 'RED' THEN 'BLACK' ELSE 'RED' END,ready=false WHERE room_id=$1 AND user_id=$2",
      [id, s.actor.userId],
    );
    await this.closeSwapOffers(s, id);
    await this.bump(s, id, "room.seats-changed");
    return this.snapshot(s, id);
  }
  private seatTableReady: boolean | null = null;
  private async downTableExists(s: RoomScope): Promise<boolean> {
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
  private async closeDownOffers(s: RoomScope, id: string) {
    if (!(await this.downTableExists(s))) return;
    await s.client.query(
      "UPDATE xiangqi_room.seat_invites SET status='CLOSED',resolved_at=clock_timestamp() WHERE room_id=$1 AND status='PENDING'",
      [id],
    );
  }
  private async pendingDownOffer(
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
  private async kickedOut(
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
    try {
      await this.media?.revoke(id, targetId);
    } catch {
      // Media khong bao gio lam hong luong phong (BA 0.14).
    }
    await this.bump(s, id, "room.viewer-kicked", { userId: targetId });
    return this.snapshot(s, id);
  }
  private async closeSwapOffers(s: RoomScope, id: string) {
    if (!(await this.swapTableExists(s))) return;
    await s.client.query(
      "UPDATE xiangqi_room.side_swap_offers SET status='CLOSED',resolved_at=clock_timestamp() WHERE room_id=$1 AND status='PENDING'",
      [id],
    );
  }
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
  async proposeSwap(s: RoomScope, id: string) {
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
        "SELECT resolved_at FROM xiangqi_room.side_swap_offers WHERE room_id=$1 AND proposer_id=$2 AND status IN('DECLINED','EXPIRED') AND resolved_at+interval '60 seconds'>clock_timestamp() ORDER BY resolved_at DESC LIMIT 1",
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
  async ready(s: RoomScope, id: string, value: boolean) {
    if (typeof value !== "boolean") invalidRoomInput();
    const { r, member } = await this.member(s, id);
    if (r.status !== "WAITING" || member.role !== "PLAYER")
      throw new RoomError("READY_DENIED", "Không thể Sẵn sàng lúc này");
    if (
      !(
        await s.client.query(
          "SELECT 1 FROM xiangqi_room.presence WHERE room_id=$1 AND user_id=$2 AND connected",
          [id, s.actor.userId],
        )
      ).rowCount
    )
      throw new RoomError("PLAYER_DISCONNECTED", "Chưa có kết nối điều khiển");
    if (!value) await this.cancel(s, id);
    else
      await s.client.query(
        "UPDATE public.room_members SET ready=true WHERE room_id=$1 AND user_id=$2",
        [id, s.actor.userId],
      );
    const players = (
      await s.client.query(
        "SELECT m.user_id,m.side,m.ready,p.connected FROM public.room_members m LEFT JOIN xiangqi_room.presence p USING(room_id,user_id) WHERE m.room_id=$1 AND m.role='PLAYER'",
        [id],
      )
    ).rows;
    if (players.length === 2 && players.every((p) => p.ready && p.connected))
      await s.client.query(
        "INSERT INTO xiangqi_room.countdowns(room_id,token,due_at,red_id,black_id) VALUES($1,$2,clock_timestamp()+interval '3 seconds',$3,$4) ON CONFLICT(room_id) DO NOTHING",
        [
          id,
          randomUUID(),
          players.find((p) => p.side === "RED").user_id,
          players.find((p) => p.side === "BLACK").user_id,
        ],
      );
    if (
      (
        await s.client.query(
          "SELECT 1 FROM xiangqi_room.countdowns WHERE room_id=$1",
          [id],
        )
      ).rowCount
    ) {
      await this.closeDownOffers(s, id);
      await this.closeSwapOffers(s, id);
    }
    await this.bump(s, id, "room.ready-changed");
    return this.snapshot(s, id);
  }
  async presence(
    s: RoomScope,
    id: string,
    proof: PresenceProof,
    connected: boolean,
  ) {
    if (
      typeof connected !== "boolean" ||
      typeof proof.connectionId !== "string" ||
      !proof.connectionId ||
      !Number.isSafeInteger(proof.generation) ||
      proof.generation <= 0 ||
      !uuid.test(proof.serverInstance)
    )
      invalidRoomInput();
    const { r, member } = await this.member(s, id, true);
    if (connected && member.role === "SPECTATOR" && member.viewer_expired) {
      await this.release(s, id, s.actor.userId, false);
      return "viewer-expired" as const;
    }
    if (
      connected &&
      member.role === "PLAYER" &&
      (
        await s.client.query(
          "SELECT 1 FROM public.room_members WHERE room_id=$1 AND user_id=$2 AND disconnected_at+interval '60 seconds'<=clock_timestamp()",
          [id, s.actor.userId],
        )
      ).rowCount
    ) {
      if (r.status === "PLAYING")
        throw new RoomError(
          "MATCH_LIFECYCLE_UNAVAILABLE",
          "Chưa thể xử lý kết quả ván",
          503,
        );
      await this.release(s, id, s.actor.userId, true);
      return "seat-expired" as const;
    }
    if (connected) {
      const changed = await s.client.query(
        "INSERT INTO xiangqi_room.presence(room_id,user_id,connection_id,generation,server_instance,connected,last_seen_at) VALUES($1,$2,$3,$4,$5,true,clock_timestamp()) ON CONFLICT(room_id,user_id) DO UPDATE SET connection_id=EXCLUDED.connection_id,generation=EXCLUDED.generation,server_instance=EXCLUDED.server_instance,connected=true,last_seen_at=EXCLUDED.last_seen_at WHERE xiangqi_room.presence.generation<EXCLUDED.generation OR (xiangqi_room.presence.generation=EXCLUDED.generation AND xiangqi_room.presence.connection_id=EXCLUDED.connection_id AND xiangqi_room.presence.server_instance=EXCLUDED.server_instance) RETURNING user_id",
        [
          id,
          s.actor.userId,
          proof.connectionId,
          proof.generation,
          proof.serverInstance,
        ],
      );
      if (!changed.rowCount) return;
      await s.client.query(
        "UPDATE public.room_members SET disconnected_at=NULL WHERE room_id=$1 AND user_id=$2",
        [id, s.actor.userId],
      );
    } else {
      const changed = await s.client.query(
        "UPDATE xiangqi_room.presence SET connected=false,last_seen_at=clock_timestamp() WHERE room_id=$1 AND user_id=$2 AND connection_id=$3 AND generation=$4 AND server_instance=$5 AND connected RETURNING user_id",
        [
          id,
          s.actor.userId,
          proof.connectionId,
          proof.generation,
          proof.serverInstance,
        ],
      );
      if (!changed.rowCount) return;
      await s.client.query(
        "UPDATE public.room_members SET disconnected_at=COALESCE(disconnected_at,clock_timestamp()) WHERE room_id=$1 AND user_id=$2",
        [id, s.actor.userId],
      );
      if (member.role === "PLAYER") await this.cancel(s, id);
    }
    await this.bump(s, id, "room.connection-changed");
  }
  async startDue(s: RoomScope, id: string) {
    const { r, members } = await this.room(s, id);
    const d = (
      await s.client.query(
        "SELECT * FROM xiangqi_room.countdowns WHERE room_id=$1 AND due_at<=clock_timestamp()",
        [id],
      )
    ).rows[0];
    if (!d) return;
    const players = members.filter((m) => m.role === "PLAYER");
    const connected = (
      await s.client.query(
        "SELECT user_id FROM xiangqi_room.presence WHERE room_id=$1 AND connected",
        [id],
      )
    ).rows.map((p) => p.user_id);
    if (
      r.status !== "WAITING" ||
      players.length !== 2 ||
      !players.every(
        (m) =>
          m.ready &&
          connected.includes(m.user_id) &&
          s.activeActorIds?.has(m.user_id),
      ) ||
      players.find((m) => m.side === "RED")?.user_id !== d.red_id ||
      players.find((m) => m.side === "BLACK")?.user_id !== d.black_id
    ) {
      await this.cancel(s, id);
      await this.bump(s, id, "room.countdown-cancelled");
      return;
    }
    if (!this.matches) {
      await this.cancel(s, id);
      await this.bump(s, id, "room.match-start-unavailable");
      return;
    }
    const startedAt = (await s.client.query("SELECT clock_timestamp() AS t"))
      .rows[0].t as Date;
    const result = await this.matches.start(s.client, {
      roomId: id,
      startToken: d.token,
      redId: d.red_id,
      blackId: d.black_id,
      timeControlSeconds: r.time_control,
      startedAt,
    });
    await s.client.query(
      "UPDATE public.rooms SET status='PLAYING',current_match_id=$2 WHERE id=$1",
      [id, result.matchId],
    );
    await s.client.query(
      "UPDATE public.active_players SET match_id=$2 WHERE room_id=$1",
      [id, result.matchId],
    );
    await s.client.query(
      "DELETE FROM xiangqi_room.countdowns WHERE room_id=$1",
      [id],
    );
    await this.bump(s, id, "room.match-started", {
      matchId: result.matchId,
      startToken: d.token,
    });
  }
  async onMatchEnded(s: RoomScope, input: { roomId: string; matchId: string }) {
    const { r } = await this.room(s, input.roomId);
    if (r.current_match_id !== input.matchId) return;
    if (
      !(
        await s.client.query(
          "SELECT 1 FROM public.matches WHERE id=$1 AND room_id=$2 AND status IN('FINISHED','INTERRUPTED')",
          [input.matchId, input.roomId],
        )
      ).rowCount
    )
      throw new RoomError("MATCH_NOT_ENDED", "Ván chưa kết thúc");
    await this.cancel(s, input.roomId);
    await s.client.query(
      "UPDATE public.rooms SET status='WAITING',current_match_id=NULL,finished_at=NULL WHERE id=$1",
      [input.roomId],
    );
    await s.client.query(
      "UPDATE public.active_players SET match_id=NULL WHERE room_id=$1",
      [input.roomId],
    );
    await this.bump(s, input.roomId, "room.match-ended", {
      matchId: input.matchId,
    });
  }
  async leave(s: RoomScope, id: string) {
    const { r, member } = await this.member(s, id);
    if (r.status === "PLAYING" && member.role === "PLAYER") {
      if (!this.matches?.leave || !r.current_match_id)
        throw new RoomError(
          "MATCH_LIFECYCLE_UNAVAILABLE",
          "Chưa thể xử lý rời ván",
          503,
        );
      await this.matches.leave(s.client, {
        roomId: id,
        matchId: r.current_match_id,
        actor: s.actor,
      });
      const current = (
        await s.client.query<{
          status: string;
          current_match_id: string | null;
        }>("SELECT status,current_match_id FROM public.rooms WHERE id=$1", [id])
      ).rows[0];
      const ended = (
        await s.client.query<{ status: string }>(
          "SELECT status FROM public.matches WHERE id=$1 AND room_id=$2",
          [r.current_match_id, id],
        )
      ).rows[0];
      if (
        !current ||
        current.status === "PLAYING" ||
        current.current_match_id !== null ||
        !ended ||
        !["FINISHED", "INTERRUPTED"].includes(ended.status)
      )
        throw new RoomError(
          "MATCH_LIFECYCLE_UNAVAILABLE",
          "Chưa thể xử lý rời ván",
          503,
        );
    }
    await this.release(s, id, s.actor.userId, member.role === "PLAYER");
  }
  private async release(
    s: RoomScope,
    id: string,
    userId: string,
    player: boolean,
  ) {
    if (player) {
      await this.cancel(s, id);
      await this.closeDownOffers(s, id);
      await this.closeSwapOffers(s, id);
      await s.client.query(
        "DELETE FROM public.active_players WHERE user_id=$1 AND room_id=$2",
        [userId, id],
      );
    }
    await s.client.query(
      "DELETE FROM public.room_members WHERE room_id=$1 AND user_id=$2",
      [id, userId],
    );
    try {
      await this.media?.revoke(id, userId);
    } catch {
      // Media khong bao gio lam hong luong roi phong (BA 0.14).
    }
    const others = (
      await s.client.query(
        "SELECT user_id FROM public.room_members WHERE room_id=$1 AND role='PLAYER' ORDER BY user_id",
        [id],
      )
    ).rows;
    if (others.length) {
      await s.client.query(
        "UPDATE public.rooms SET owner_id=CASE WHEN owner_id=$2 THEN $3 ELSE owner_id END WHERE id=$1",
        [id, userId, others[0].user_id],
      );
      await this.bump(s, id, "room.members-changed");
    } else {
      const recipients = (
        await s.client.query(
          "SELECT user_id FROM public.room_members WHERE room_id=$1",
          [id],
        )
      ).rows.map((m) => m.user_id);
      await s.client.query(
        "UPDATE public.rooms SET status='CLOSED',closed_at=clock_timestamp() WHERE id=$1",
        [id],
      );
      await s.client.query(
        "DELETE FROM public.chat_messages WHERE room_id=$1",
        [id],
      );
      await s.client.query("DELETE FROM public.room_members WHERE room_id=$1", [
        id,
      ]);
      const v = await this.bump(s, id, "room.closed", {
        recipients,
        message: "Phòng đã đóng",
      });
      await this.event(s, id, v, "chat.deleted");
      await this.event(s, id, v, "media.revoke-room");
    }
  }
  async expireDisconnected(s: RoomScope, id: string) {
    const { r } = await this.room(s, id);
    const due = (
      await s.client.query(
        "SELECT user_id,role FROM public.room_members WHERE room_id=$1 AND ((role='SPECTATOR' AND disconnected_at+interval '5 minutes'<=clock_timestamp()) OR (role='PLAYER' AND $2::boolean AND disconnected_at+interval '60 seconds'<=clock_timestamp())) ORDER BY user_id",
        [id, r.status !== "PLAYING"],
      )
    ).rows;
    for (const p of due) {
      if (!s.lockedActorIds.has(p.user_id))
        throw new RoomRosterChanged([...s.lockedActorIds, p.user_id].sort());
      await this.release(s, id, p.user_id, p.role === "PLAYER");
    }
    return (
      await s.client.query(
        "SELECT status='CLOSED' AS closed FROM public.rooms WHERE id=$1",
        [id],
      )
    ).rows[0].closed as boolean;
  }
  async recoverWaiting(s: RoomScope, id: string, instance: string) {
    const { r } = await this.room(s, id);
    if (r.status !== "WAITING" && r.status !== "FINISHED") return;
    await s.client.query(
      "UPDATE xiangqi_room.presence SET connected=false WHERE room_id=$1 AND server_instance<>$2 AND connected",
      [id, instance],
    );
    await s.client.query(
      "UPDATE public.room_members m SET disconnected_at=COALESCE(disconnected_at,clock_timestamp()) WHERE room_id=$1 AND NOT EXISTS(SELECT 1 FROM xiangqi_room.presence p WHERE p.room_id=m.room_id AND p.user_id=m.user_id AND p.connected)",
      [id],
    );
    if (
      (
        await s.client.query(
          "SELECT 1 FROM public.room_members m WHERE room_id=$1 AND role='PLAYER' AND NOT EXISTS(SELECT 1 FROM xiangqi_room.presence p WHERE p.room_id=m.room_id AND p.user_id=m.user_id AND p.connected)",
          [id],
        )
      ).rowCount
    )
      await this.cancel(s, id);
    await this.bump(s, id, "room.server-recovered");
  }
}
