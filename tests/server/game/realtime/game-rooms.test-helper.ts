import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { vi } from "vitest";
import type { RoomCommand } from "@xiangqi/shared";
import { ClockService } from "@server/game/clock/clock.service.js";
import {
  type MatchCommandResult,
  type MatchView,
} from "@server/game/match/match.types.js";
import type { MatchStore } from "@server/game/match/match-store.js";
import { type RoomScope, type RoomView } from "@server/game/room/room.types.js";
import type { RoomStore } from "@server/game/room/room-store.js";
import { GameRooms } from "@server/game/realtime/game-rooms.js";
export function fixture() {
  const roomId = randomUUID(),
    userId = randomUUID(),
    peerId = randomUUID(),
    matchId = randomUUID();
  const client = {
    query: vi.fn(async () => ({ rows: [{ current_match_id: matchId }] })),
  } as unknown as PoolClient;
  const identity = { userId, kind: "member" as const };
  const scope: RoomScope = {
    client,
    actor: identity,
    lockedActorIds: new Set([userId, peerId]),
    lockedRoomIds: new Set([roomId]),
  };
  const at = new Date("2026-10-11T12:00:02Z"),
    room: RoomView = {
      serverNow: at.toISOString(),
      roomId,
      version: 8,
      role: "red",
      room: {
        status: "PLAYING",
        hostId: userId,
        name: "Synthetic Room",
        visibility: "CODE_ONLY",
        inviteCode: "ABCDEFGH",
        timeMinutes: 10,
        viewerLimit: 5,
        seats: { red: userId, black: peerId },
        ready: { red: false, black: false },
        connected: { red: true, black: false },
        graceUntil: { red: null, black: "2026-10-11T12:01:00Z" },
        countdown: null,
        swapOffer: null,
        rematchOffer: null,
        downOffer: null,
        spectators: [],
      },
    };
  const match: MatchView = {
    id: matchId,
    version: 3,
    ply: 1,
    position: "synthetic-fen",
    lastMove: null,
    turn: "red",
    status: "ACTIVE",
    outcome: null,
    endedAt: null,
    clock: {
      redMs: 600000,
      blackMs: 600000,
      runningSinceEpochMs: at.getTime() - 2000,
    },
    inactivity: null,
    unlimited: false,
  };
  const roomStore = {
    snapshot: vi.fn(async () => room),
    ready: vi.fn(async () => undefined),
  };
  const matchStore = {
    snapshot: vi.fn(async () => match),
    move: vi.fn(async (): Promise<MatchCommandResult> => ({
      applied: true,
      match,
    })),
    resign: vi.fn(async (): Promise<MatchCommandResult> => ({
      applied: true,
      match,
    })),
    current: vi.fn(async (client: PoolClient, roomId: string) => {
      const currentId = (
        await client.query<{ current_match_id: string | null }>(
          "SELECT current_match_id FROM public.rooms WHERE id=$1",
          [roomId],
        )
      ).rows[0]?.current_match_id;
      return {
        room: {
          id: roomId,
          status: "PLAYING",
          current_match_id: currentId ?? null,
          time_control: 10,
          closed_at: null,
          room_version: "8",
        },
        row: null,
        seat: "red",
        match: currentId ? match : null,
      };
    }),
  };
  const getScope = vi.fn(() => scope),
    clock = new ClockService();
  const adapter = new GameRooms(
    roomStore as unknown as RoomStore,
    matchStore as unknown as MatchStore,
    clock,
    getScope,
  );
  const command = (action: RoomCommand["action"]): RoomCommand => ({
    commandId: randomUUID(),
    roomId,
    expectedVersion: 8,
    action,
  });
  return {
    roomId,
    userId,
    peerId,
    matchId,
    client,
    identity,
    scope,
    room,
    match,
    roomStore,
    matchStore,
    getScope,
    clock,
    adapter,
    command,
  };
}
