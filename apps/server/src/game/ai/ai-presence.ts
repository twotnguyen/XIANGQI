import type { PoolClient } from "pg";
import { RoomError, type RoomScope } from "../room/room.types.js";
import type { AiOrigin } from "./ai-transactions.js";
import type { AiReservations, AiExpiredCursor } from "./ai-reservations.js";
type Human = Extract<AiOrigin, { kind: "human" }>;
interface Physical {
  tabId: string;
  connectionId: string;
  generation: number;
}
interface Controller {
  tab_id: string;
  connection_id: string;
  generation: string;
  connected: boolean;
}
interface Presence extends Controller {
  game_id: string;
  disconnected_at: Date | null;
}
export interface AiAttachment {
  control: { mode: "writable" | "readonly"; generation: number };
  gameId: string | null;
  graceUntil: string | null;
  status: "active" | "expired";
}
export interface ExpiredAiPresence {
  ownerId: string;
  gameId: string;
  bootId: string;
  cursor: AiExpiredCursor;
}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function id(value: string) {
  if (typeof value !== "string" || !uuid.test(value))
    sessionNotReady("AI_INPUT_INVALID", 400);
  return value.toLowerCase();
}
export function sessionNotReady(code: string, status = 409): never {
  throw new RoomError(code, "Phiên chơi với máy chưa sẵn sàng", status);
}
function physical<
  T extends {
    tabId: string;
    connectionId: string;
    generation?: number;
  },
>(input: T) {
  const tabId = id(input.tabId);
  if (
    typeof input.connectionId !== "string" ||
    !/^[A-Za-z0-9_-]{1,64}$/.test(input.connectionId)
  )
    sessionNotReady("AI_INPUT_INVALID", 400);
  if (
    input.generation !== undefined &&
    (!Number.isSafeInteger(input.generation) || input.generation <= 0)
  )
    sessionNotReady("AI_INPUT_INVALID", 400);
  return { ...input, tabId };
}
/**
 * Quản lý trạng thái kết nối, hiện diện (presence) và thời gian ân hạn của người chơi cờ với máy trong CSDL.
 */
export class AiPresence {
  private readonly bootId: string;
  constructor(
    bootId: string,
    private readonly reservations: Pick<AiReservations, "check">,
  ) {
    this.bootId = id(bootId);
  }
  private owner(scope: RoomScope): string {
    const owner = id(scope.actor.userId);
    if (!scope.lockedActorIds.has(owner)) sessionNotReady("AI_SCOPE_INVALID");
    if (scope.actor.kind !== "member" && scope.actor.kind !== "guest")
      sessionNotReady("AUTH_REQUIRED", 401);
    return owner;
  }
  /** Admission read: principal phải active. Chỉ dùng cho attach/authorize/bind/retention/mutation. */
  private async slot(scope: RoomScope): Promise<string | null> {
    const owner = this.owner(scope);
    const principal = (
      await scope.client.query(
        scope.actor.kind === "guest"
          ? "SELECT 1 FROM xiangqi_auth.principals n WHERE n.id=$1 AND n.kind='guest' AND EXISTS(SELECT 1 FROM xiangqi_auth.guest_sessions s WHERE s.guest_id=n.id AND s.ended_at IS NULL)"
          : `SELECT 1 FROM xiangqi_auth.principals n JOIN xiangqi_auth.accounts a ON a.id=n.id JOIN public.profiles p ON p.user_id=n.id WHERE n.id=$1 AND n.kind='member' AND n.auth_user_id=a.id AND a.email_confirmed_at IS NOT NULL AND p.completed_at IS NOT NULL AND NOT p.registration_pending`,
        [owner],
      )
    ).rowCount;
    if (!principal) sessionNotReady("AUTH_REQUIRED", 401);
    return this.reserved(scope, owner);
  }
  /** Downgrade-only read cho trusted physical disconnect: owner inactive vẫn được hạ connected=false; chỉ cần identity member tồn tại. */
  private async cleanupSlot(scope: RoomScope): Promise<string | null> {
    const owner = this.owner(scope);
    const principal = (
      await scope.client.query(
        "SELECT 1 FROM xiangqi_auth.principals WHERE id=$1 AND kind IN ('member','guest')",
        [owner],
      )
    ).rowCount;
    if (!principal) sessionNotReady("AUTH_REQUIRED", 401);
    return this.reserved(scope, owner);
  }
  /** Fence chung: lock active_players, room scope và reservation/boot; không kiểm tra principal active. */
  private async reserved(
    scope: RoomScope,
    owner: string,
  ): Promise<string | null> {
    const row = (
      await scope.client.query<{
        ai_game_id: string | null;
        ai_boot_id: string | null;
        room_id: string | null;
        match_id: string | null;
        match_room_id: string | null;
      }>(
        `SELECT a.ai_game_id,a.ai_boot_id,a.room_id,a.match_id,m.room_id AS match_room_id FROM public.active_players a LEFT JOIN public.matches m ON m.id=a.match_id WHERE a.user_id=$1 FOR UPDATE OF a`,
        [owner],
      )
    ).rows[0];
    if (
      [row?.room_id, row?.match_room_id].some(
        (room) => room && !scope.lockedRoomIds.has(room),
      )
    )
      sessionNotReady("AI_SCOPE_INVALID");
    if (row?.ai_game_id && row.ai_boot_id !== this.bootId)
      sessionNotReady("AI_RESERVATION_LOST");
    await this.live(scope);
    return row?.ai_game_id ?? null;
  }
  private async live(scope: RoomScope): Promise<void> {
    await scope.client.query(
      "SELECT id FROM xiangqi_ai.boots WHERE id=$1 FOR SHARE",
      [this.bootId],
    );
    const boot = (
      await scope.client.query<{ live: boolean }>(
        "SELECT lease_until>clock_timestamp() AS live FROM xiangqi_ai.boots WHERE id=$1",
        [this.bootId],
      )
    ).rows[0];
    if (!boot?.live) sessionNotReady("AI_BOOT_EXPIRED");
  }
  private async controller(scope: RoomScope) {
    return (
      await scope.client.query<Controller>(
        "SELECT tab_id,connection_id,generation::text,connected FROM xiangqi_ai.controllers WHERE owner_id=$1 AND boot_id=$2 FOR UPDATE",
        [scope.actor.userId, this.bootId],
      )
    ).rows[0];
  }
  private async presence(scope: RoomScope) {
    return (
      await scope.client.query<Presence>(
        "SELECT game_id,tab_id,connection_id,generation::text,connected,disconnected_at FROM xiangqi_ai.presence WHERE owner_id=$1 AND boot_id=$2 FOR UPDATE",
        [scope.actor.userId, this.bootId],
      )
    ).rows[0];
  }
  private async retained(scope: RoomScope, gameId: string): Promise<boolean> {
    const row = await this.presence(scope);
    if (row?.game_id !== gameId)
      sessionNotReady("AI_PRESENCE_UNAVAILABLE", 503);
    return (
      (
        await scope.client.query<{ valid: boolean }>(
          "SELECT connected OR disconnected_at+interval '30 minutes'>clock_timestamp() AS valid FROM xiangqi_ai.presence WHERE owner_id=$1 AND boot_id=$2 AND game_id=$3",
          [scope.actor.userId, this.bootId, gameId],
        )
      ).rows[0]?.valid === true
    );
  }
  private matches(row: Controller | undefined, input: Physical) {
    return (
      row?.tab_id === input.tabId &&
      row.connection_id === input.connectionId &&
      Number(row.generation) === input.generation
    );
  }
  /**
   * Đăng ký gắn tab client vào phiên chơi với AI, xác định quyền writable hoặc readonly và kiểm tra thời gian ân hạn.
   */
  async attach(
    scope: RoomScope,
    input: { tabId: string; connectionId: string; takeover?: boolean },
  ): Promise<AiAttachment> {
    const p = physical(input);
    if (input.takeover !== undefined && typeof input.takeover !== "boolean")
      sessionNotReady("AI_INPUT_INVALID", 400);
    const gameId = await this.slot(scope);
    const current = await this.controller(scope);
    await this.live(scope);
    if (gameId) {
      await this.reservations.check(scope, { gameId, bootId: this.bootId });
      if (!(await this.retained(scope, gameId))) {
        const prior = await this.presence(scope);
        return {
          status: "expired",
          gameId,
          graceUntil: prior?.disconnected_at
            ? new Date(prior.disconnected_at.getTime() + 1800000).toISOString()
            : null,
          control: { mode: "readonly", generation: 0 },
        };
      }
    }
    const known = (
      await scope.client.query(
        "SELECT 1 FROM xiangqi_ai.tabs WHERE owner_id=$1 AND boot_id=$2 AND tab_id=$3",
        [scope.actor.userId, this.bootId, p.tabId],
      )
    ).rowCount;
    await scope.client.query(
      "INSERT INTO xiangqi_ai.tabs(owner_id,boot_id,tab_id) VALUES($1,$2,$3) ON CONFLICT DO NOTHING",
      [scope.actor.userId, this.bootId, p.tabId],
    );
    await this.live(scope);
    if (gameId && !(await this.retained(scope, gameId)))
      sessionNotReady("AI_GAME_EXPIRED");
    const writable =
      !current ||
      !known ||
      input.takeover === true ||
      current.tab_id === p.tabId;
    let generation = Number(current?.generation ?? 0);
    if (writable) {
      if (
        !Number.isSafeInteger(generation) ||
        generation >= Number.MAX_SAFE_INTEGER
      )
        sessionNotReady("AI_GENERATION_EXHAUSTED", 503);
      generation++;
      await scope.client.query(
        `INSERT INTO xiangqi_ai.controllers(owner_id,boot_id,tab_id,connection_id,generation,connected) VALUES($1,$2,$3,$4,$5,true) ON CONFLICT(owner_id,boot_id) DO UPDATE SET tab_id=EXCLUDED.tab_id,connection_id=EXCLUDED.connection_id,generation=EXCLUDED.generation,connected=true`,
        [scope.actor.userId, this.bootId, p.tabId, p.connectionId, generation],
      );
      await this.live(scope);
      if (gameId && !(await this.retained(scope, gameId)))
        sessionNotReady("AI_GAME_EXPIRED");
      if (gameId) await this.writePresence(scope, gameId, { ...p, generation });
    }
    const presence = gameId ? await this.presence(scope) : undefined;
    return {
      status: "active",
      gameId,
      control: { mode: writable ? "writable" : "readonly", generation },
      graceUntil: presence?.disconnected_at
        ? new Date(presence.disconnected_at.getTime() + 1800000).toISOString()
        : null,
    };
  }
  /**
   * Xác thực quyền điều khiển của kết nối trong giao dịch (ném lỗi TAB_READ_ONLY nếu mất quyền).
   */
  async authorize(scope: RoomScope, origin: Human): Promise<void> {
    const p = physical(origin.tab),
      gameId = await this.slot(scope),
      current = await this.controller(scope),
      row = gameId ? await this.presence(scope) : undefined;
    await this.live(scope);
    if (gameId && !(await this.retained(scope, gameId)))
      sessionNotReady("AI_GAME_EXPIRED");
    if (!this.matches(current, p) || !current?.connected)
      sessionNotReady("TAB_READ_ONLY");
    if (gameId && (!this.matches(row, p) || !row?.connected))
      sessionNotReady("TAB_READ_ONLY");
  }
  private async writePresence(scope: RoomScope, gameId: string, p: Physical) {
    await scope.client.query(
      `INSERT INTO xiangqi_ai.presence(owner_id,boot_id,game_id,tab_id,connection_id,generation,connected,disconnected_at) VALUES($1,$2,$3,$4,$5,$6,true,NULL) ON CONFLICT(owner_id,boot_id) DO UPDATE SET game_id=EXCLUDED.game_id,tab_id=EXCLUDED.tab_id,connection_id=EXCLUDED.connection_id,generation=EXCLUDED.generation,connected=true,disconnected_at=NULL`,
      [
        scope.actor.userId,
        this.bootId,
        gameId,
        p.tabId,
        p.connectionId,
        p.generation,
      ],
    );
  }
  /**
   * Gắn kết trận đấu AI vào bản ghi hiện diện của tab đang giữ quyền điều khiển.
   */
  async bindGame(
    scope: RoomScope,
    gameId: string,
    origin: Human,
  ): Promise<void> {
    gameId = id(gameId);
    const actual = await this.slot(scope);
    if (actual !== gameId) sessionNotReady("AI_RESERVATION_LOST");
    await this.reservations.check(scope, { gameId, bootId: this.bootId });
    const p = physical(origin.tab),
      current = await this.controller(scope);
    if (!this.matches(current, p) || !current?.connected)
      sessionNotReady("TAB_READ_ONLY");
    const prior = await this.presence(scope);
    await this.live(scope);
    if (prior?.game_id === gameId && !(await this.retained(scope, gameId)))
      sessionNotReady("AI_GAME_EXPIRED");
    await this.writePresence(scope, gameId, p);
  }
  /**
   * Đánh dấu tab ngắt kết nối và bắt đầu tính thời gian ân hạn 30 phút.
   */
  async disconnected(
    scope: RoomScope,
    input: Physical & { gameId: string | null },
  ): Promise<void> {
    const p = physical(input),
      gameId = input.gameId === null ? null : id(input.gameId),
      actual = await this.cleanupSlot(scope);
    if (actual !== gameId) return;
    const current = await this.controller(scope);
    if (!this.matches(current, p) || !current?.connected) return;
    if (gameId) {
      const row = await this.presence(scope);
      if (row?.game_id !== gameId || !this.matches(row, p) || !row.connected)
        return;
      await this.live(scope);
      await scope.client.query(
        "UPDATE xiangqi_ai.presence SET connected=false,disconnected_at=clock_timestamp() WHERE owner_id=$1 AND boot_id=$2 AND game_id=$3 AND connected",
        [scope.actor.userId, this.bootId, gameId],
      );
    }
    await this.live(scope);
    await scope.client.query(
      "UPDATE xiangqi_ai.controllers SET connected=false WHERE owner_id=$1 AND boot_id=$2 AND generation=$3",
      [scope.actor.userId, this.bootId, p.generation],
    );
  }
  /**
   * Đảm bảo ván đấu AI vẫn còn thời gian giữ hợp lệ (chưa quá 30 phút ngắt kết nối).
   */
  async assertRetained(scope: RoomScope, gameId: string): Promise<void> {
    gameId = id(gameId);
    if ((await this.slot(scope)) !== gameId)
      sessionNotReady("AI_RESERVATION_LOST");
    await this.reservations.check(scope, { gameId, bootId: this.bootId });
    await this.presence(scope);
    await this.live(scope);
    if (!(await this.retained(scope, gameId)))
      sessionNotReady("AI_GAME_EXPIRED");
  }
  /**
   * Quét danh sách các ván đấu AI có người chơi đã ngắt kết nối quá 30 phút để dọn dẹp giải phóng.
   */
  async dueExpired(
    client: PoolClient,
    cursor: AiExpiredCursor | null = null,
  ): Promise<ExpiredAiPresence[]> {
    if (
      cursor &&
      (!/^\d+(\.\d+)?$/.test(cursor.leaseMilliseconds) ||
        cursor.leaseMilliseconds.length > 32)
    )
      sessionNotReady("AI_INPUT_INVALID", 400);
    const rows = (
      await client.query<{
        owner_id: string;
        game_id: string;
        deadline: string;
      }>(
        `SELECT p.owner_id,p.game_id,(extract(epoch FROM p.disconnected_at+interval '30 minutes')*1000)::numeric::text AS deadline FROM xiangqi_ai.presence p JOIN public.active_players a ON a.user_id=p.owner_id AND a.ai_game_id=p.game_id AND a.ai_boot_id=p.boot_id JOIN xiangqi_ai.boots b ON b.id=p.boot_id WHERE p.boot_id=$1 AND NOT p.connected AND p.disconnected_at+interval '30 minutes'<=clock_timestamp() AND b.lease_until>clock_timestamp() AND ($2::numeric IS NULL OR ((extract(epoch FROM p.disconnected_at+interval '30 minutes')*1000)::numeric,p.game_id)>($2::numeric,$3::uuid)) ORDER BY p.disconnected_at,p.game_id LIMIT 50`,
        [
          this.bootId,
          cursor?.leaseMilliseconds ?? null,
          cursor ? id(cursor.gameId) : null,
        ],
      )
    ).rows;
    return rows.map((r) => ({
      ownerId: r.owner_id,
      gameId: r.game_id,
      bootId: this.bootId,
      cursor: { leaseMilliseconds: r.deadline, gameId: r.game_id },
    }));
  }
}
