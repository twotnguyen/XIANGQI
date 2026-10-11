import type { PoolClient } from "pg";
import { createHash, randomInt, randomUUID } from "node:crypto";
import { containsForbiddenName } from "@xiangqi/shared";
import {
  RoomError,
  RoomRosterChanged,
  type MatchStartPort,
  type PresenceProof,
  type RoomEntry,
  type RoomEvent,
  type RoomScope,
  type RoomView,
} from "./contracts.js";
const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function invalid(): never {
  throw new RoomError(
    "ROOM_INPUT_INVALID",
    "Thông tin phòng không hợp lệ",
    400,
  );
}
export class RoomStore {
  constructor(private readonly matches?: MatchStartPort) {}
  // Internal authenticated admission lookup; caller acquires all sorted actor locks afterwards.
  async resolveCode(client: PoolClient, input: unknown): Promise<string> {
    if (typeof input !== "string" || !/^[A-HJ-NP-Z2-9]{8}$/.test(input))
      throw new RoomError("ROOM_FORBIDDEN", "Phòng không còn khả dụng", 403);
    const row = (
      await client.query(
        "SELECT id FROM public.rooms WHERE invite_code=$1 AND closed_at IS NULL",
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
        "SELECT r.id FROM public.rooms r WHERE r.invite_code IS NOT NULL AND r.status IN('WAITING','FINISHED') AND (EXISTS(SELECT 1 FROM xiangqi_room.countdowns d WHERE d.room_id=r.id AND d.due_at<=clock_timestamp()) OR EXISTS(SELECT 1 FROM public.room_members m WHERE m.room_id=r.id AND m.role='PLAYER' AND m.disconnected_at+interval '60 seconds'<=clock_timestamp())) ORDER BY r.id LIMIT 50",
      )
    ).rows.map((r) => r.id as string);
  }
  async pendingEvents(client: PoolClient): Promise<RoomEvent[]> {
    return (
      await client.query(
        'SELECT id,room_id AS "roomId",room_version::float8 AS version,type,payload FROM xiangqi_room.outbox WHERE delivered_at IS NULL AND next_attempt_at<=clock_timestamp() ORDER BY created_at,id LIMIT 50',
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
    if (
      !(
        await s.client.query(
          "SELECT 1 FROM public.room_members m JOIN public.rooms r ON r.id=m.room_id WHERE m.user_id=$1 AND m.room_id=$2 AND r.closed_at IS NULL",
          [s.actor.userId, row.room_id],
        )
      ).rowCount
    )
      throw new RoomError(
        "ROOM_FORBIDDEN",
        "Bạn không có quyền truy cập phòng này",
        403,
      );
    return row.response as RoomEntry;
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
      name: string;
      timeMinutes?: number;
      viewerLimit?: number;
    },
  ): Promise<RoomEntry> {
    this.scope(s);
    if (!uuid.test(input.commandId) || typeof input.name !== "string")
      invalid();
    const name = input.name.normalize("NFC").trim(),
      time = input.timeMinutes ?? 10,
      viewers = input.viewerLimit ?? 5;
    if (
      Array.from(name).length < 1 ||
      Array.from(name).length > 60 ||
      Array.from(name).some((c) => {
        const n = c.codePointAt(0)!;
        return n < 32 || (n >= 127 && n <= 159);
      }) ||
      containsForbiddenName(name) ||
      ![5, 10, 15].includes(time) ||
      !Number.isInteger(viewers) ||
      viewers < 0 ||
      viewers > 5
    )
      invalid();
    const digest = createHash("sha256")
        .update(JSON.stringify({ type: "create", name, time, viewers }))
        .digest("hex"),
      old = await this.replay(s, input.commandId, digest);
    if (old) return old;
    if (
      (
        await s.client.query(
          "SELECT 1 FROM public.active_players WHERE user_id=$1",
          [s.actor.userId],
        )
      ).rowCount
    )
      throw new RoomError(
        "ALREADY_SEATED",
        "Bạn đang giữ vị trí chơi ở nơi khác",
      );
    if (
      s.actor.kind === "guest" &&
      (
        await s.client.query(
          "SELECT 1 FROM public.rooms WHERE owner_id=$1 AND closed_at IS NULL",
          [s.actor.userId],
        )
      ).rowCount
    )
      throw new RoomError(
        "GUEST_ROOM_LIMIT",
        "Khách chỉ được tạo một phòng đang mở",
      );
    const id = randomUUID();
    let code = "";
    for (let attempt = 0; attempt < 5; attempt++) {
      code = Array.from({ length: 8 }, () => alphabet[randomInt(32)]!).join("");
      const row = await s.client.query(
        "INSERT INTO public.rooms(id,owner_id,name,visibility,time_control,viewer_limit,invite_code,room_version) VALUES($1,$2,$3,'CODE_ONLY',$4,$5,$6,1) ON CONFLICT(invite_code) WHERE invite_code IS NOT NULL DO NOTHING RETURNING id",
        [id, s.actor.userId, name, time * 60, viewers, code],
      );
      if (row.rowCount) break;
      code = "";
    }
    if (!code)
      throw new RoomError("ROOM_UNAVAILABLE", "Chưa thể tạo mã phòng", 503);
    await s.client.query(
      "INSERT INTO public.active_players(user_id,room_id) VALUES($1,$2)",
      [s.actor.userId, id],
    );
    await s.client.query(
      "INSERT INTO public.room_members(room_id,user_id,role,side,disconnected_at) VALUES($1,$2,'PLAYER','RED',clock_timestamp())",
      [id, s.actor.userId],
    );
    const response: RoomEntry = {
      roomId: id,
      version: 1,
      role: "red",
      inviteCode: code,
    };
    await this.event(s, id, 1, "room.created");
    await this.receipt(s, input.commandId, digest, response);
    return response;
  }
  private async room(s: RoomScope, id: string) {
    this.scope(s, id);
    const r = (
      await s.client.query(
        "SELECT *,clock_timestamp() AS server_now FROM public.rooms WHERE id=$1",
        [id],
      )
    ).rows[0];
    if (!r || r.status === "CLOSED")
      throw new RoomError("ROOM_FORBIDDEN", "Phòng không còn khả dụng", 403);
    if (r.invite_code === null)
      throw new RoomError(
        "ROOM_LEGACY_UNSUPPORTED",
        "Phòng cũ chưa được hỗ trợ",
        503,
      );
    const members = (
      await s.client.query(
        "SELECT * FROM public.room_members WHERE room_id=$1 ORDER BY user_id",
        [id],
      )
    ).rows as {
      user_id: string;
      role: string;
      side: string | null;
      ready: boolean;
      disconnected_at: Date | null;
    }[];
    const missing = members
      .filter((m) => m.role === "PLAYER" && !s.lockedActorIds.has(m.user_id))
      .map((m) => m.user_id);
    if (missing.length)
      throw new RoomRosterChanged(
        [...new Set([...s.lockedActorIds, ...missing])].sort(),
      );
    return { r, members };
  }
  private async member(s: RoomScope, id: string) {
    const state = await this.room(s, id);
    const member = state.members.find((m) => m.user_id === s.actor.userId);
    if (!member)
      throw new RoomError(
        "ROOM_FORBIDDEN",
        "Bạn không có quyền truy cập phòng này",
        403,
      );
    return { ...state, member };
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
    const d = (
      await s.client.query(
        "SELECT token,due_at FROM xiangqi_room.countdowns WHERE room_id=$1",
        [id],
      )
    ).rows[0];
    const online = (
      await s.client.query(
        "SELECT user_id FROM xiangqi_room.presence WHERE room_id=$1 AND connected",
        [id],
      )
    ).rows.map((p) => p.user_id);
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
      },
      role:
        member.side === "RED"
          ? "red"
          : member.side === "BLACK"
            ? "black"
            : "spectator",
    };
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
      invalid();
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
    await this.bump(s, id, "room.seats-changed");
    return this.snapshot(s, id);
  }
  async ready(s: RoomScope, id: string, value: boolean) {
    if (typeof value !== "boolean") invalid();
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
    await this.bump(s, id, "room.ready-changed");
    return this.snapshot(s, id);
  }
  async presence(
    s: RoomScope,
    id: string,
    proof: PresenceProof,
    connected: boolean,
  ) {
    const { r, member } = await this.member(s, id);
    if (member.role !== "PLAYER") return;
    if (
      connected &&
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
        "INSERT INTO xiangqi_room.presence(room_id,user_id,connection_id,generation,server_instance,connected,last_seen_at) VALUES($1,$2,$3,$4,$5,true,clock_timestamp()) ON CONFLICT(room_id,user_id) DO UPDATE SET connection_id=EXCLUDED.connection_id,generation=EXCLUDED.generation,server_instance=EXCLUDED.server_instance,connected=true,last_seen_at=EXCLUDED.last_seen_at WHERE xiangqi_room.presence.generation<=EXCLUDED.generation RETURNING user_id",
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
      await this.cancel(s, id);
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
    if (r.status === "PLAYING" && member.role === "PLAYER")
      throw new RoomError(
        "MATCH_LIFECYCLE_UNAVAILABLE",
        "Chưa thể xử lý rời ván",
        503,
      );
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
      await s.client.query(
        "DELETE FROM public.active_players WHERE user_id=$1 AND room_id=$2",
        [userId, id],
      );
    }
    await s.client.query(
      "DELETE FROM public.room_members WHERE room_id=$1 AND user_id=$2",
      [id, userId],
    );
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
    if (r.status === "PLAYING") return false;
    const due = (
      await s.client.query(
        "SELECT user_id FROM public.room_members WHERE room_id=$1 AND role='PLAYER' AND disconnected_at+interval '60 seconds'<=clock_timestamp()",
        [id],
      )
    ).rows;
    for (const p of due) {
      if (!s.lockedActorIds.has(p.user_id))
        throw new RoomRosterChanged([...s.lockedActorIds, p.user_id].sort());
      await this.release(s, id, p.user_id, true);
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
      "UPDATE public.room_members m SET disconnected_at=COALESCE(disconnected_at,clock_timestamp()) WHERE room_id=$1 AND role='PLAYER' AND NOT EXISTS(SELECT 1 FROM xiangqi_room.presence p WHERE p.room_id=m.room_id AND p.user_id=m.user_id AND p.connected)",
      [id],
    );
    await this.cancel(s, id);
    await this.bump(s, id, "room.server-recovered");
  }
}
