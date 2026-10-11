import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { describe, expect, it, vi } from "vitest";
import type { RoomCommand } from "@xiangqi/shared";
import { ClockService } from "../clock/clock-service.js";
import {
  MatchError,
  type MatchCommandResult,
  type MatchView,
} from "../match/contracts.js";
import type { MatchStore } from "../match/match-store.js";
import { RoomError, type RoomScope, type RoomView } from "../room/contracts.js";
import type { RoomStore } from "../room/room-store.js";
import { GameRooms } from "./game-rooms.js";
function fixture() {
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
describe("GameRooms native projection and adapter (synthetic stores, no SQL)", () => {
  it("projects lastMove for reload/new viewers and committed terminal command snapshots", async () => {
    const f = fixture();
    const lastMove = { from: 54, to: 45, eventVersion: 2 };
    Object.assign(f.match, { lastMove });
    expect(
      (await f.adapter.snapshot(f.client, f.identity, f.roomId)).match,
    ).toHaveProperty("lastMove", lastMove);
    f.room.role = "spectator";
    expect(
      (await f.adapter.snapshot(f.client, f.identity, f.roomId)).match,
    ).toHaveProperty("lastMove", lastMove);
    f.room.role = "red";
    f.matchStore.move.mockResolvedValueOnce({
      applied: false,
      match: {
        ...f.match,
        status: "FINISHED",
        version: 4,
        outcome: { reason: "TIMEOUT", winner: "black" },
      },
      error: { code: "MATCH_TIME_EXPIRED", message: "expired" },
    });
    const result = await f.adapter.execute(
      f.client,
      f.identity,
      f.command({
        type: "match.move",
        payload: { matchId: f.matchId, matchVersion: 3, from: 54, to: 45 },
      }),
    );
    expect(result.snapshot.match).toMatchObject({
      version: 4,
      result: "TIMEOUT",
      lastMove,
    });
  });
  it("authorizes actual RoomStore membership and only permits player control", async () => {
    const f = fixture();
    expect(await f.adapter.authorize(f.client, f.identity, f.roomId)).toEqual({
      canControl: true,
    });
    expect(f.roomStore.snapshot).toHaveBeenCalledWith(f.scope, f.roomId);
    f.room.role = "spectator";
    expect(await f.adapter.authorize(f.client, f.identity, f.roomId)).toEqual({
      canControl: false,
    });
    f.roomStore.snapshot.mockRejectedValueOnce(
      new RoomError("ROOM_FORBIDDEN", "private context", 403),
    );
    await expect(
      f.adapter.authorize(f.client, f.identity, f.roomId),
    ).rejects.toMatchObject({ code: "ROOM_FORBIDDEN" });
  });
  it.each(["client", "userId", "kind", "actorLock", "roomLock"])(
    "fails closed on scope mismatch %s before SQL or mutation",
    async (key) => {
      const f = fixture();
      if (key === "client") f.scope.client = {} as PoolClient;
      if (key === "userId")
        f.scope.actor = { ...f.identity, userId: randomUUID() };
      if (key === "kind") f.scope.actor = { ...f.identity, kind: "guest" };
      if (key === "actorLock") f.scope.lockedActorIds = new Set();
      if (key === "roomLock") f.scope.lockedRoomIds = new Set();
      await expect(
        f.adapter.snapshot(f.client, f.identity, f.roomId),
      ).rejects.toMatchObject({ code: "REALTIME_UNAVAILABLE" });
      expect(f.client.query).not.toHaveBeenCalled();
      expect(f.roomStore.snapshot).not.toHaveBeenCalled();
    },
  );
  it("whitelists full RoomView and match projection with authoritative DB time, without mutating clock", async () => {
    const f = fixture(),
      storedClock = { ...f.match.clock };
    Object.assign(f.room, { appSession: "PRIVATE_CAP" });
    Object.assign(f.room.room, { privateRoster: "PRIVATE_ROSTER" });
    Object.assign(f.match, { secret: "PRIVATE_MATCH" });
    const result = await f.adapter.snapshot(f.client, f.identity, f.roomId);
    expect(result).toEqual({
      serverNow: f.room.serverNow,
      roomId: f.roomId,
      version: 8,
      role: "red",
      room: {
        status: "PLAYING",
        hostId: f.userId,
        name: "Synthetic Room",
        visibility: "CODE_ONLY",
        inviteCode: "ABCDEFGH",
        timeMinutes: 10,
        viewerLimit: 5,
        seats: { red: f.userId, black: f.peerId },
        ready: { red: false, black: false },
        connected: { red: true, black: false },
        graceUntil: { red: null, black: "2026-10-11T12:01:00Z" },
        countdown: null,
      },
      match: {
        id: f.matchId,
        version: 3,
        position: "synthetic-fen",
        lastMove: null,
        turn: "red",
        status: "ACTIVE",
        winner: null,
        endedAt: null,
        result: null,
      },
      clocks: {
        redMs: 598000,
        blackMs: 600000,
        running: "red",
        asOf: f.room.serverNow,
      },
    });
    expect(f.matchStore.snapshot).toHaveBeenCalledWith(
      f.client,
      f.roomId,
      f.matchId,
    );
    expect(f.match.clock).toEqual(storedClock);
    expect(JSON.stringify(result)).not.toContain("PRIVATE");
    expect(f.client.query).toHaveBeenCalledTimes(1);
  });
  it("does not query MatchStore when waiting room has no current match", async () => {
    const f = fixture();
    f.room.room.status = "WAITING";
    (f.client.query as ReturnType<typeof vi.fn>).mockResolvedValue({
      rows: [{ current_match_id: null }],
    });
    expect(
      await f.adapter.snapshot(f.client, f.identity, f.roomId),
    ).toMatchObject({ match: null, clocks: null });
    expect(f.matchStore.snapshot).not.toHaveBeenCalled();
  });
  it("falls back to durable managed completed match in WAITING when current match clears", async () => {
    const f = fixture(),
      previous = randomUUID();
    f.room.room.status = "WAITING";
    f.match.id = previous;
    f.match.status = "FINISHED";
    f.match.outcome = { reason: "CHECKMATE", winner: "red" };
    f.match.endedAt = f.room.serverNow;
    (f.client.query as ReturnType<typeof vi.fn>)
      .mockResolvedValueOnce({ rows: [{ current_match_id: null }] })
      .mockResolvedValueOnce({ rows: [{ id: previous }] });
    const result = await f.adapter.snapshot(f.client, f.identity, f.roomId);
    expect(result.match).toMatchObject({
      id: previous,
      status: "FINISHED",
      winner: "red",
      endedAt: f.room.serverNow,
      result: "CHECKMATE",
    });
    expect(result.clocks?.running).toBeNull();
    expect(f.matchStore.snapshot).toHaveBeenCalledWith(
      f.client,
      f.roomId,
      previous,
    );
    const calls = (f.client.query as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls[1]?.[0]).toContain("xiangqi-core-v1");
    expect(calls[1]?.[0]).toContain("ended_at DESC");
  });
  it("new current match takes precedence over any previous finished match", async () => {
    const f = fixture();
    const result = await f.adapter.snapshot(f.client, f.identity, f.roomId);
    expect(result.match).toMatchObject({
      id: f.matchId,
      status: "ACTIVE",
      winner: null,
      endedAt: null,
    });
    expect(f.client.query).toHaveBeenCalledTimes(1);
  });
  it.each(["FINISHED", "INTERRUPTED"] as const)(
    "terminal %s clock never runs or subtracts more elapsed time",
    async (status) => {
      const f = fixture();
      f.match.status = status;
      f.match.outcome = {
        reason: status === "FINISHED" ? "RESIGN" : "SERVER_RESTART",
        winner: status === "FINISHED" ? "black" : null,
      };
      const projection = vi.spyOn(f.clock, "beforeAction"),
        result = await f.adapter.snapshot(f.client, f.identity, f.roomId);
      expect(result.match?.result).toBe(f.match.outcome.reason);
      expect(result.clocks).toMatchObject({
        redMs: 600000,
        blackMs: 600000,
        running: null,
      });
      expect(projection).not.toHaveBeenCalled();
    },
  );
  it("delegates ready and rereads authoritative room version without manual bumps", async () => {
    const f = fixture();
    f.roomStore.ready.mockImplementation(async () => {
      f.room.version = 9;
    });
    const command = f.command({ type: "room.ready", payload: { ready: true } }),
      result = await f.adapter.execute(f.client, f.identity, command);
    expect(f.roomStore.ready).toHaveBeenCalledWith(f.scope, f.roomId, true);
    expect(result.snapshot.version).toBe(9);
    expect(result.error).toBeUndefined();
    expect(f.matchStore.move).not.toHaveBeenCalled();
  });
  it.each(["match.move", "match.resign"] as const)(
    "delegates %s with same client, identity, match identity/version and lock proof",
    async (type) => {
      const f = fixture(),
        payload = {
          matchId: f.matchId,
          matchVersion: 3,
          ...(type === "match.move" ? { from: 0, to: 9 } : {}),
        };
      const command = f.command(
        type === "match.move"
          ? { type, payload: { ...payload, from: 0, to: 9 } }
          : { type, payload },
      );
      const result = await f.adapter.execute(f.client, f.identity, command),
        method =
          type === "match.move" ? f.matchStore.move : f.matchStore.resign;
      expect(method).toHaveBeenCalledWith(
        {
          client: f.client,
          actor: f.identity,
          roomId: f.roomId,
          canControl: true,
          lockedActorIds: f.scope.lockedActorIds,
          lockedRoomIds: f.scope.lockedRoomIds,
        },
        payload,
      );
      expect(result.snapshot.match?.id).toBe(f.matchId);
      expect(result.error).toBeUndefined();
    },
  );
  it("returns committed-intent TIMEOUT error with terminal result even after room current_match_id clears", async () => {
    const f = fixture();
    const terminal: MatchView = {
      ...f.match,
      status: "FINISHED",
      outcome: { reason: "TIMEOUT", winner: "black" },
      clock: { ...f.match.clock, redMs: 0 },
      version: 4,
    };
    f.matchStore.move.mockImplementation(async () => {
      f.room.version = 9;
      f.room.room.status = "WAITING";
      (f.client.query as ReturnType<typeof vi.fn>).mockResolvedValue({
        rows: [{ current_match_id: null }],
      });
      return {
        applied: false,
        match: terminal,
        error: {
          code: "MATCH_TIME_EXPIRED",
          message: "private provider detail",
        },
      };
    });
    const result = await f.adapter.execute(
      f.client,
      f.identity,
      f.command({
        type: "match.move",
        payload: { matchId: f.matchId, matchVersion: 3, from: 0, to: 9 },
      }),
    );
    expect(result).toMatchObject({
      error: {
        code: "MATCH_TIME_EXPIRED",
        message: "Thời gian suy nghĩ đã hết.",
      },
      snapshot: {
        version: 9,
        room: { status: "WAITING" },
        match: { id: f.matchId, version: 4, result: "TIMEOUT" },
        clocks: { redMs: 0, running: null },
      },
    });
    expect(f.matchStore.snapshot).not.toHaveBeenCalled();
    expect(JSON.stringify(result)).not.toContain("private");
  });
  it("maps known MatchError rejection with fresh current snapshot while rethrowing internal corruption", async () => {
    const f = fixture(),
      command = f.command({
        type: "match.resign",
        payload: { matchId: f.matchId, matchVersion: 2 },
      });
    f.matchStore.resign.mockRejectedValueOnce(
      new MatchError("MATCH_ID_MISMATCH", "private context"),
    );
    expect(
      await f.adapter.execute(f.client, f.identity, command),
    ).toMatchObject({
      error: { code: "MATCH_ID_MISMATCH" },
      snapshot: { match: { id: f.matchId } },
    });
    const corrupt = new MatchError(
      "MATCH_HISTORY_CORRUPT",
      "private corrupt",
      500,
    );
    f.matchStore.resign.mockRejectedValueOnce(corrupt);
    await expect(f.adapter.execute(f.client, f.identity, command)).rejects.toBe(
      corrupt,
    );
  });
  it.each([
    "MATCH_VERSION_CONFLICT",
    "MATCH_NOT_YOUR_TURN",
    "MATCH_ILLEGAL_MOVE",
    "MATCH_FINISHED",
  ])(
    "returns MatchStore denial %s as typed error plus authoritative snapshot",
    async (code) => {
      const f = fixture();
      f.matchStore.move.mockResolvedValueOnce({
        applied: false,
        match: f.match,
        error: { code, message: "PRIVATE_DETAIL" },
      });
      const result = await f.adapter.execute(
        f.client,
        f.identity,
        f.command({
          type: "match.move",
          payload: { matchId: f.matchId, matchVersion: 3, from: 0, to: 9 },
        }),
      );
      expect(result.error?.code).toBe(code);
      expect(result.snapshot.match?.id).toBe(f.matchId);
      expect(JSON.stringify(result)).not.toContain("PRIVATE_DETAIL");
    },
  );
  it("maps ready domain rejection and rethrows an unrecognized result error", async () => {
    const f = fixture();
    f.roomStore.ready.mockRejectedValueOnce(
      new RoomError("READY_DENIED", "PRIVATE_DETAIL"),
    );
    const rejected = await f.adapter.execute(
      f.client,
      f.identity,
      f.command({ type: "room.ready", payload: { ready: true } }),
    );
    expect(rejected.error?.code).toBe("READY_DENIED");
    expect(JSON.stringify(rejected)).not.toContain("PRIVATE_DETAIL");
    f.matchStore.resign.mockResolvedValueOnce({
      applied: false,
      match: f.match,
      error: { code: "PRIVATE_CODE", message: "PRIVATE_DETAIL" },
    });
    await expect(
      f.adapter.execute(
        f.client,
        f.identity,
        f.command({
          type: "match.resign",
          payload: { matchId: f.matchId, matchVersion: 3 },
        }),
      ),
    ).rejects.toMatchObject({ code: "REALTIME_UNAVAILABLE" });
  });
  it("spectator cannot execute a match command and missing media port fails closed", async () => {
    const f = fixture();
    f.room.role = "spectator";
    const result = await f.adapter.execute(
      f.client,
      f.identity,
      f.command({
        type: "match.move",
        payload: { matchId: f.matchId, matchVersion: 3, from: 0, to: 9 },
      }),
    );
    expect(result.error?.code).toBe("MATCH_PLAYER_REQUIRED");
    expect(f.matchStore.move).not.toHaveBeenCalled();
    await expect(
      f.adapter.execute(
        f.client,
        f.identity,
        f.command({ type: "media.sharing", payload: { sharing: "room" } }),
      ),
    ).rejects.toMatchObject({ code: "REALTIME_UNAVAILABLE" });
  });
});
