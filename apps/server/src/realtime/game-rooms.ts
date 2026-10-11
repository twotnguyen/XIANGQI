import type { PoolClient } from "pg";
import type {
  RealtimeErrorCode,
  RoomCommand,
  RoomStateSnapshot,
} from "@xiangqi/shared";
import type { ClockService } from "../clock/clock-service.js";
import {
  MatchError,
  type MatchScope,
  type MatchView,
} from "../match/contracts.js";
import type { MatchStore } from "../match/match-store.js";
import { RoomError, type RoomScope, type RoomView } from "../room/contracts.js";
import type { RoomStore } from "../room/room-store.js";
import {
  RealtimeError,
  type RealtimeIdentity,
  type RoomCollaborator,
  type RoomExecutionResult,
} from "./contracts.js";

const messages = {
  MATCH_FINISHED: "Ván đã kết thúc.",
  MATCH_VERSION_CONFLICT: "Thế cờ đã thay đổi.",
  MATCH_NOT_YOUR_TURN: "Chưa đến lượt bạn.",
  MATCH_ILLEGAL_MOVE: "Nước đi không hợp lệ.",
  MATCH_TIME_EXPIRED: "Thời gian suy nghĩ đã hết.",
  MATCH_ID_MISMATCH: "Ván trong phòng đã thay đổi.",
  MATCH_PLAYER_REQUIRED: "Chỉ người chơi được điều khiển ván.",
  MATCH_READ_ONLY: "Tab này chỉ theo dõi ván.",
  MATCH_INVALID_INPUT: "Dữ liệu ván không hợp lệ.",
  MATCH_NOT_FOUND: "Không tìm thấy ván.",
  READY_DENIED: "Không thể Sẵn sàng lúc này",
  PLAYER_DISCONNECTED: "Chưa có kết nối điều khiển",
  ROOM_INPUT_INVALID: "Thông tin phòng không hợp lệ",
  ROOM_FORBIDDEN: "Bạn không có quyền truy cập phòng",
  VERSION_STALE: "Phòng đã thay đổi, vui lòng thử lại",
} satisfies Partial<Record<RealtimeErrorCode, string>>;
function domainError(code: string): RoomExecutionResult["error"] {
  if (!Object.hasOwn(messages, code))
    throw new RealtimeError(
      "REALTIME_UNAVAILABLE",
      "Chưa thể xử lý lệnh phòng",
    );
  const known = code as keyof typeof messages;
  return { code: known, message: messages[known] };
}
export type GameRoomScope = (
  client: PoolClient,
  identity: RealtimeIdentity,
  roomId: string,
) => RoomScope;

/** Delegates only inside the root's authenticated actor-first transaction. */
export class GameRooms implements RoomCollaborator {
  constructor(
    private readonly rooms: RoomStore,
    private readonly matches: MatchStore,
    private readonly clock: ClockService,
    private readonly getScope: GameRoomScope,
  ) {}
  private scope(
    client: PoolClient,
    identity: RealtimeIdentity,
    roomId: string,
  ) {
    const scope = this.getScope(client, identity, roomId);
    if (
      !scope ||
      scope.client !== client ||
      scope.actor.userId !== identity.userId ||
      scope.actor.kind !== identity.kind ||
      !scope.lockedActorIds.has(identity.userId) ||
      !scope.lockedRoomIds.has(roomId)
    )
      throw new RealtimeError(
        "REALTIME_UNAVAILABLE",
        "Thiếu phạm vi giao dịch phòng",
      );
    return scope;
  }
  private async room(scope: RoomScope, roomId: string) {
    try {
      return await this.rooms.snapshot(scope, roomId);
    } catch (error) {
      if (error instanceof RoomError && error.code === "ROOM_FORBIDDEN")
        throw new RealtimeError("ROOM_FORBIDDEN", messages.ROOM_FORBIDDEN);
      throw error;
    }
  }
  async authorize(
    client: PoolClient,
    identity: RealtimeIdentity,
    roomId: string,
  ) {
    const view = await this.room(this.scope(client, identity, roomId), roomId);
    return { canControl: view.role === "red" || view.role === "black" };
  }
  private async project(
    scope: RoomScope,
    room: RoomView,
    matchOverride?: MatchView,
  ): Promise<RoomStateSnapshot> {
    let match = matchOverride;
    if (!match) {
      const row = (
        await scope.client.query<{ current_match_id: string | null }>(
          "SELECT current_match_id FROM public.rooms WHERE id=$1",
          [room.roomId],
        )
      ).rows[0];
      if (!row)
        throw new RealtimeError(
          "REALTIME_UNAVAILABLE",
          "Không thể đọc trạng thái phòng",
        );
      let matchId = row.current_match_id;
      if (!matchId && room.room.status === "WAITING") {
        const previous = (
          await scope.client.query<{ id: string }>(
            `SELECT m.id FROM public.matches m
           WHERE m.room_id=$1 AND m.status IN ('FINISHED','INTERRUPTED')
           AND EXISTS (SELECT 1 FROM public.match_events e WHERE e.match_id=m.id
             AND e.version=0 AND e.type='START' AND e.payload->>'encoding'='xiangqi-core-v1')
           ORDER BY m.ended_at DESC,m.id DESC LIMIT 1`,
            [room.roomId],
          )
        ).rows[0];
        matchId = previous?.id ?? null;
      }
      if (matchId)
        match = await this.matches.snapshot(scope.client, room.roomId, matchId);
    }
    const current = room.room;
    const clock = match
      ? match.status === "ACTIVE"
        ? this.clock.beforeAction(
            match.clock,
            match.turn,
            new Date(room.serverNow),
          ).clock
        : match.clock
      : null;
    return {
      serverNow: room.serverNow,
      roomId: room.roomId,
      version: room.version,
      role: room.role,
      room: {
        status: current.status,
        hostId: current.hostId,
        name: current.name,
        visibility: current.visibility,
        inviteCode: current.inviteCode,
        timeMinutes: current.timeMinutes,
        viewerLimit: current.viewerLimit,
        seats: { red: current.seats.red, black: current.seats.black },
        ready: { red: current.ready.red, black: current.ready.black },
        connected: {
          red: current.connected.red,
          black: current.connected.black,
        },
        graceUntil: {
          red: current.graceUntil.red,
          black: current.graceUntil.black,
        },
        countdown: current.countdown
          ? { token: current.countdown.token, dueAt: current.countdown.dueAt }
          : null,
      },
      match: match
        ? {
            id: match.id,
            version: match.version,
            position: match.position,
            turn: match.turn,
            status: match.status,
            winner: match.outcome?.winner ?? null,
            endedAt: match.endedAt,
            result: match.outcome?.reason ?? null,
          }
        : null,
      clocks:
        clock && match
          ? {
              redMs: clock.redMs,
              blackMs: clock.blackMs,
              running: match.status === "ACTIVE" ? match.turn : null,
              asOf: room.serverNow,
            }
          : null,
    };
  }
  async snapshot(
    client: PoolClient,
    identity: RealtimeIdentity,
    roomId: string,
  ) {
    const scope = this.scope(client, identity, roomId);
    return this.project(scope, await this.room(scope, roomId));
  }
  async execute(
    client: PoolClient,
    identity: RealtimeIdentity,
    command: RoomCommand,
  ): Promise<RoomExecutionResult> {
    const scope = this.scope(client, identity, command.roomId);
    const view = await this.room(scope, command.roomId);
    try {
      if (command.action.type === "media.sharing")
        throw new RealtimeError(
          "REALTIME_UNAVAILABLE",
          "Chia sẻ camera và mic chưa sẵn sàng",
        );
      if (command.action.type === "room.ready") {
        await this.rooms.ready(
          scope,
          command.roomId,
          command.action.payload.ready,
        );
        return {
          snapshot: await this.project(
            scope,
            await this.room(scope, command.roomId),
          ),
        };
      }
      if (view.role === "spectator")
        throw new MatchError(
          "MATCH_PLAYER_REQUIRED",
          messages.MATCH_PLAYER_REQUIRED,
          403,
        );
      const matchScope: MatchScope = {
        client,
        actor: scope.actor,
        roomId: command.roomId,
        canControl: true,
        lockedActorIds: scope.lockedActorIds,
        lockedRoomIds: scope.lockedRoomIds,
      };
      const result =
        command.action.type === "match.move"
          ? await this.matches.move(matchScope, command.action.payload)
          : await this.matches.resign(matchScope, command.action.payload);
      if (!result.applied && !result.error)
        throw new RealtimeError(
          "REALTIME_UNAVAILABLE",
          "Không thể xác định kết quả lệnh",
        );
      const error = result.error ? domainError(result.error.code) : undefined;
      // Match end clears current_match_id and increments the room once. Preserve
      // terminal match in this command receipt; do not throw and roll it back.
      const snapshot = await this.project(
        scope,
        await this.room(scope, command.roomId),
        result.match,
      );
      return { snapshot, ...(error ? { error } : {}) };
    } catch (error) {
      if (
        (error instanceof MatchError || error instanceof RoomError) &&
        error.status < 500 &&
        Object.hasOwn(messages, error.code)
      )
        return {
          snapshot: await this.project(
            scope,
            await this.room(scope, command.roomId),
          ),
          error: domainError(error.code),
        };
      throw error;
    }
  }
}
