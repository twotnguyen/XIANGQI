import { createHash, randomInt, randomUUID } from "node:crypto";
import {
  invalidRoomInput,
  RoomError,
  RoomRosterChanged,
  type PresenceProof,
  type RoomEntry,
  type RoomScope,
  type RoomView,
} from "./room.types.js";
import { RoomViewerStore } from "./room-store-viewers.js";
import { alphabet, uuid } from "./room-store-core.js";
/**
 * Lớp Store hoàn chỉnh quản lý trạng thái và dữ liệu phòng chơi cờ (kế thừa RoomViewerStore):
 * Đảm nhiệm tạo phòng, tham gia, sẵn sàng, đổi bên, ngắt kết nối/hiện diện, bắt đầu và kết thúc trận đấu.
 */
export class RoomStore extends RoomViewerStore {
  /**
   * Tạo phòng cờ mới với mã mời ngẫu nhiên, giữ ghế Đỏ cho chủ phòng và thiết lập thời gian/khán giả.
   */
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
  /**
   * Thay đổi chế độ hiển thị phòng cờ (PUBLIC, CODE_ONLY, LOCKED) và xoay vòng mã mời nếu cần.
   */
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
  /**
   * Tham gia vào phòng chơi: phân bổ vào ghế người chơi còn trống hoặc danh sách khán giả.
   */
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
  /**
   * Chủ phòng đổi vị trí ghế cờ (Đỏ <-> Đen) khi đang ở phòng chờ một mình.
   */
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
  /**
   * Cập nhật trạng thái Sẵn sàng của người chơi; tự động kích hoạt đếm ngược 3 giây khi cả hai bên sẵn sàng.
   */
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
  /**
   * Cập nhật trạng thái hiện diện (presence/heartbeat) và xử lý mốc thời gian ngắt kết nối của thành viên.
   */
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
  /**
   * Khởi chạy ván cờ chính thức khi thời gian đếm ngược kết thúc và cả hai kỳ thủ đều kết nối sẵn sàng.
   */
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
  /**
   * Đưa trạng thái phòng cờ trở về trạng thái phòng chờ (WAITING) sau khi ván đấu hoàn tất.
   */
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
  /**
   * Thành viên rời phòng cờ; tự động xử thua nếu đang trong trận hoặc đóng phòng nếu không còn thành viên nào.
   */
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
      const version = await this.bump(s, id, "room.members-changed");
      await this.event(s, id, version, "media.revoke-user", { userId });
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
  /**
   * Quét và giải phóng các thành viên đã ngắt kết nối quá hạn (player > 60 giây, spectator > 5 phút).
   */
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
  /**
   * Khôi phục trạng thái phòng chờ sau khi server instance khởi động lại.
   */
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
