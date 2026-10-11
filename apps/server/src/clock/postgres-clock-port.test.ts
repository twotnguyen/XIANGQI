import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { RoomTransactions } from "../room/room-transactions.js";
import { RoomStore } from "../room/room-store.js";
import { MatchStore } from "../match/match-store.js";
import { ClockService } from "./clock-service.js";
import { ClockWorker } from "./clock-worker.js";
import { PostgresClockWorkerPort } from "./postgres-clock-port.js";
import {
  actor,
  databaseUrl,
  pool,
  reset,
  transaction,
} from "./postgres-clock-port.test-helper.js";
const coordinator = new RoomTransactions(pool),
  clock = new ClockService(),
  rooms = new RoomStore();
const port = new PostgresClockWorkerPort(pool, coordinator);
const matches = new MatchStore(clock, {
  onMatchEnded: async (
    client: PoolClient,
    input: { roomId: string; matchId: string },
  ) => {
    const row = (
      await client.query(
        "SELECT m.red_user_id,p.kind FROM public.matches m JOIN xiangqi_auth.principals p ON p.id=m.red_user_id WHERE m.id=$1",
        [input.matchId],
      )
    ).rows[0];
    const members = (
      await client.query(
        "SELECT user_id FROM public.room_members WHERE room_id=$1",
        [input.roomId],
      )
    ).rows.map((r) => r.user_id as string);
    await rooms.onMatchEnded(
      {
        client,
        actor: { userId: row.red_user_id, kind: row.kind },
        lockedActorIds: new Set(members),
        lockedRoomIds: new Set([input.roomId]),
      },
      input,
    );
  },
});
async function game() {
  const red = await actor(),
    black = await actor();
  const created = await coordinator.withRoom(
    { actor: red, roomIds: [] },
    async (p) => ({ status: "active", actor: p.actor }),
    (s) =>
      rooms.create(s, {
        commandId: randomUUID(),
        name: "Clock Port Room",
        timeMinutes: 5,
      }),
  );
  if (created.status !== "active") throw new Error("synthetic create failed");
  const roomId = created.value.roomId;
  await coordinator.withRoom(
    { actor: black, roomIds: [roomId] },
    async (p) => ({ status: "active", actor: p.actor }),
    (s) => rooms.join(s, { commandId: randomUUID(), roomId, intent: "play" }),
  );
  const matchId = await transaction(
    [red.userId, black.userId],
    [roomId],
    async (c) => {
      const token = randomUUID(),
        at = new Date(Date.now() - 301000);
      await c.query(
        "INSERT INTO xiangqi_room.countdowns(room_id,token,due_at,red_id,black_id) VALUES($1,$2,$3,$4,$5)",
        [roomId, token, at, red.userId, black.userId],
      );
      await c.query(
        "UPDATE public.room_members SET ready=true WHERE room_id=$1",
        [roomId],
      );
      const started = await matches.start(c, {
        roomId,
        startToken: token,
        redId: red.userId,
        blackId: black.userId,
        timeControlSeconds: 300,
        startedAt: at,
      });
      await c.query(
        "UPDATE public.rooms SET status='PLAYING',current_match_id=$2 WHERE id=$1",
        [roomId, started.matchId],
      );
      await c.query(
        "UPDATE public.active_players SET match_id=$2 WHERE room_id=$1",
        [roomId, started.matchId],
      );
      return started.matchId;
    },
  );
  return { roomId, matchId, red: red.userId, black: black.userId };
}
afterAll(() => pool.end());
describe.skipIf(!databaseUrl)("Postgres clock port actual SQL", () => {
  beforeEach(reset);
  it("expires a real match atomically through RoomStore, MatchStore and ClockWorker", async () => {
    const g = await game();
    expect(await port.dueMatches(null)).toEqual([
      expect.objectContaining({ roomId: g.roomId, matchId: g.matchId }),
    ]);
    await new ClockWorker(clock, matches, port).tick();
    expect(
      (
        await pool.query(
          "SELECT status,current_match_id FROM public.rooms WHERE id=$1",
          [g.roomId],
        )
      ).rows[0],
    ).toMatchObject({ status: "WAITING", current_match_id: null });
    expect(
      (
        await pool.query(
          "SELECT status,outcome FROM public.matches WHERE id=$1",
          [g.matchId],
        )
      ).rows[0],
    ).toMatchObject({
      status: "FINISHED",
      outcome: { reason: "TIMEOUT", winner: "BLACK" },
    });
    expect(
      (
        await pool.query(
          "SELECT count(*)::int AS n FROM public.match_events WHERE match_id=$1 AND type='RESULT'",
          [g.matchId],
        )
      ).rows[0].n,
    ).toBe(1);
    expect(
      (
        await pool.query(
          "SELECT count(*)::int AS n FROM xiangqi_room.outbox WHERE room_id=$1 AND type='room.match-ended'",
          [g.roomId],
        )
      ).rows[0].n,
    ).toBe(1);
    await new ClockWorker(clock, matches, port).tick();
  });
  it("passes forward cursor and never repeats an earlier deadline", async () => {
    const a = await game(),
      b = await game(),
      rows = await port.dueMatches(null);
    expect(rows).toHaveLength(2);
    expect(new Set(rows.map((r) => r.matchId))).toEqual(
      new Set([a.matchId, b.matchId]),
    );
    expect(
      await port.dueMatches({
        deadlineEpochMs: rows[0]!.deadlineEpochMs,
        matchId: rows[0]!.matchId,
      }),
    ).toEqual([rows[1]]);
  });
  it("reaches candidate 51 when the oldest fifty transactions fail", async () => {
    for (let i = 0; i < 51; i++) await game();
    const oldest = await port.dueMatches(null),
      blocked = new Set(oldest.map((c) => c.matchId));
    expect(oldest).toHaveLength(50);
    const worker = new ClockWorker(clock, matches, {
      dueMatches: (cursor) => port.dueMatches(cursor),
      withMatch: (candidate, work) =>
        port.withMatch(candidate, async (scope) => {
          if (blocked.has(candidate.matchId))
            throw new Error("synthetic blocked timeout");
          await work(scope);
        }),
    });
    await expect(worker.tick()).rejects.toBeInstanceOf(AggregateError);
    await worker.tick();
    expect(
      (
        await pool.query(
          "SELECT count(*)::int AS n FROM public.matches WHERE status='FINISHED'",
        )
      ).rows[0].n,
    ).toBe(1);
    expect(
      (
        await pool.query(
          "SELECT count(*)::int AS n FROM public.matches WHERE status='ACTIVE'",
        )
      ).rows[0].n,
    ).toBe(50);
  }, 15000);
  it("locks actual principals and room on the same callback client", async () => {
    const g = await game();
    await port.withMatch(g, async (s) => {
      expect(s.lockedActorIds.has(g.red)).toBe(true);
      expect(s.lockedActorIds.has(g.black)).toBe(true);
      expect(s.lockedRoomIds.has(g.roomId)).toBe(true);
      const c = await pool.connect();
      try {
        await c.query("BEGIN");
        for (const key of [
          "actor:" + g.red,
          "actor:" + g.black,
          "room:" + g.roomId,
        ])
          expect(
            (
              await c.query(
                "SELECT pg_try_advisory_xact_lock(hashtextextended($1,0)) AS acquired",
                [key],
              )
            ).rows[0].acquired,
          ).toBe(false);
      } finally {
        await c.query("ROLLBACK");
        c.release();
      }
      expect(
        (await s.client.query("SELECT current_user AS role")).rows[0].role,
      ).toBe("app_server");
    });
  });
  it("skips absent, stale and cross-room candidates without work", async () => {
    const g = await game(),
      work = vi.fn();
    await port.withMatch({ roomId: g.roomId, matchId: randomUUID() }, work);
    await port.withMatch({ roomId: randomUUID(), matchId: g.matchId }, work);
    await pool.query(
      "UPDATE public.rooms SET status='WAITING',current_match_id=NULL WHERE id=$1",
      [g.roomId],
    );
    await port.withMatch(g, work);
    expect(work).not.toHaveBeenCalled();
  });
  it("rejects malformed candidate before obtaining a SQL connection", async () => {
    const spy = vi.spyOn(pool, "connect"),
      work = vi.fn();
    try {
      await expect(
        port.withMatch({ roomId: "bad", matchId: randomUUID() }, work),
      ).rejects.toMatchObject({ code: "CLOCK_INVALID_STATE" });
      expect(spy).not.toHaveBeenCalled();
    } finally {
      spy.mockRestore();
    }
  });
  it("rolls back callback mutations and releases the connection on failure", async () => {
    const g = await game();
    await expect(
      port.withMatch(g, async (s) => {
        await s.client.query(
          "UPDATE public.rooms SET name='Rollback' WHERE id=$1",
          [g.roomId],
        );
        throw new Error("synthetic callback failure");
      }),
    ).rejects.toThrow("synthetic callback failure");
    expect(
      (
        await pool.query("SELECT name FROM public.rooms WHERE id=$1", [
          g.roomId,
        ])
      ).rows[0].name,
    ).toBe("Clock Port Room");
    expect(pool.waitingCount).toBe(0);
    await port.withMatch(g, async () => {});
  });
  it("rechecks current-match identity after the unlocked candidate lookup", async () => {
    const g = await game(),
      work = vi.fn(),
      original = coordinator.withRoom.bind(coordinator);
    const spy = vi
      .spyOn(coordinator, "withRoom")
      .mockImplementationOnce(async (input, authorize, callback) => {
        await pool.query(
          "UPDATE public.rooms SET status='WAITING',current_match_id=NULL WHERE id=$1",
          [g.roomId],
        );
        return original(input, authorize, callback);
      });
    try {
      await port.withMatch(g, work);
      expect(work).not.toHaveBeenCalled();
    } finally {
      spy.mockRestore();
    }
  });
  it("rolls back failed due-query reads and restores the pool connection role", async () => {
    const c = await pool.connect(),
      original = c.query.bind(c);
    const querySpy = vi.spyOn(c, "query").mockImplementation(((
      text: string,
      values?: unknown[],
    ) => {
      if (text.includes("WITH server_time"))
        throw new Error("synthetic SQL read failure");
      return original(text, values);
    }) as typeof c.query);
    const connectSpy = vi.spyOn(pool, "connect").mockResolvedValueOnce(c);
    try {
      await expect(port.dueMatches(null)).rejects.toThrow(
        "synthetic SQL read failure",
      );
    } finally {
      querySpy.mockRestore();
      connectSpy.mockRestore();
    }
    expect((await pool.query("SELECT current_user AS role")).rows[0].role).toBe(
      new URL(databaseUrl!).username,
    );
    expect(pool.waitingCount).toBe(0);
    expect(await port.dueMatches(null)).toEqual([]);
  });
});
