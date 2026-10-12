import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { parsePosition } from "@xiangqi/xiangqi-core";
import { MatchStore } from "../match/match-store.js";
import { encodePosition } from "../match/position-codec.js";
import { ClockService } from "./clock-service.js";
import * as workerImplementation from "./clock-worker.js";
import {
  actor,
  databaseUrl,
  pool,
  reset,
  transaction,
} from "./clock.test-helper.js";
import type { ClockWorkerPort } from "./contracts.js";
const clock = new ClockService();
let now = new Date("2030-01-01T00:00:00Z");
const end = {
  onMatchEnded: async (
    c: PoolClient,
    input: { roomId: string; matchId: string },
  ) => {
    await c.query(
      "UPDATE public.rooms SET status='WAITING',current_match_id=NULL,room_version=room_version+1 WHERE id=$1 AND current_match_id=$2",
      [input.roomId, input.matchId],
    );
    await c.query(
      "UPDATE public.room_members SET ready=false WHERE room_id=$1",
      [input.roomId],
    );
    await c.query(
      "UPDATE public.active_players SET match_id=NULL WHERE room_id=$1",
      [input.roomId],
    );
  },
};
const matches = () => new MatchStore(clock, end, () => now);
async function game(
  seconds: 300 | 600 | 900 = 300,
  startAt = new Date("2030-01-01T00:00:00Z"),
) {
  const red = (await actor()).userId,
    black = (await actor()).userId,
    roomId = randomUUID(),
    startToken = randomUUID();
  const matchId = await transaction([red, black], [roomId], async (c) => {
    await c.query(
      "INSERT INTO public.rooms(id,owner_id,name,time_control) VALUES($1,$2,'Synthetic Clock',$3)",
      [roomId, red, seconds],
    );
    await c.query(
      "INSERT INTO public.room_members(room_id,user_id,role,side,ready) VALUES($1,$2,'PLAYER','RED',true),($1,$3,'PLAYER','BLACK',true)",
      [roomId, red, black],
    );
    await c.query(
      "INSERT INTO public.active_players(user_id,room_id) VALUES($1,$3),($2,$3)",
      [red, black, roomId],
    );
    await c.query(
      "INSERT INTO xiangqi_room.countdowns(room_id,token,due_at,red_id,black_id) VALUES($1,$2,$3,$4,$5)",
      [roomId, startToken, startAt, red, black],
    );
    const result = await matches().start(c, {
      roomId,
      startToken,
      redId: red,
      blackId: black,
      timeControlSeconds: seconds,
      startedAt: startAt,
    });
    await c.query(
      "UPDATE public.rooms SET status='PLAYING',current_match_id=$2 WHERE id=$1",
      [roomId, result.matchId],
    );
    await c.query(
      "UPDATE public.active_players SET match_id=$2 WHERE room_id=$1",
      [roomId, result.matchId],
    );
    return result.matchId;
  });
  return { roomId, matchId, red, black, startAt };
}
type Game = Awaited<ReturnType<typeof game>>;
async function move(
  g: Game,
  user: string,
  version: number,
  from = 54,
  to = 45,
) {
  return transaction([g.red, g.black, user], [g.roomId], (c) =>
    matches().move(
      {
        client: c,
        actor: { userId: user, kind: "guest" },
        roomId: g.roomId,
        canControl: true,
        lockedActorIds: new Set([g.red, g.black, user]),
        lockedRoomIds: new Set([g.roomId]),
      },
      { matchId: g.matchId, matchVersion: version, from, to },
    ),
  );
}
async function tactical(g: Game, fen: string) {
  const position = encodePosition(parsePosition(fen));
  await pool.query("UPDATE public.matches SET position=$2 WHERE id=$1", [
    g.matchId,
    position,
  ]);
  await pool.query(
    "UPDATE public.match_events SET payload=jsonb_set(payload,'{initialPosition}',$2::jsonb) WHERE match_id=$1 AND version=0",
    [g.matchId, JSON.stringify(position)],
  );
}
function worker(
  candidates?: { roomId: string; matchId: string }[],
  endPort = end,
) {
  const store = new MatchStore(clock, endPort, () => now);
  const port: ClockWorkerPort = {
    dueMatches: async (cursor) => {
      if (candidates)
        return candidates.map((candidate) => ({
          ...candidate,
          deadlineEpochMs: "0",
        }));
      return transaction([], [], (c) =>
        workerImplementation.dueMatches(c, cursor),
      );
    },
    withMatch: async (candidate, work) => {
      const row = (
        await pool.query(
          "SELECT red_user_id,black_user_id FROM public.matches WHERE id=$1",
          [candidate.matchId],
        )
      ).rows[0];
      if (!row) return;
      await transaction(
        [row.red_user_id, row.black_user_id],
        [candidate.roomId],
        (c) =>
          work({
            client: c,
            ...candidate,
            lockedActorIds: new Set([row.red_user_id, row.black_user_id]),
            lockedRoomIds: new Set([candidate.roomId]),
          }),
      );
    },
  };
  return new workerImplementation.ClockWorker(clock, store, port);
}
describe.skipIf(!databaseUrl)("clock SQL integration", () => {
  beforeAll(() => reset());
  afterAll(() => pool.end());
  it("exports worker and bounded PostgreSQL due query", () => {
    expect(workerImplementation.ClockWorker).toBeTypeOf("function");
    expect(workerImplementation.dueMatches).toBeTypeOf("function");
  });
  it.each([300, 600, 900] as const)(
    "actual MatchStore initializes %ss and consumes just the side to move",
    async (seconds) => {
      const g = await game(seconds);
      now = new Date(g.startAt.getTime() + 1234);
      const first = await move(g, g.red, 0);
      expect(first.match.clock).toEqual({
        redMs: seconds * 1000 - 1234,
        blackMs: seconds * 1000,
        runningSinceEpochMs: now.getTime(),
      });
      now = new Date(g.startAt.getTime() + 2234);
      const second = await move(g, g.black, 1, 27, 36);
      expect(second.match.clock).toEqual({
        redMs: seconds * 1000 - 1234,
        blackMs: seconds * 1000 - 1000,
        runningSinceEpochMs: now.getTime(),
      });
      expect(second.match.turn).toBe("red");
    },
  );
  it.each([-1, 0, 1])(
    "mating move at deadline offset %s ms is judged after time, with canonical SQL effects",
    async (offset) => {
      const g = await game();
      await tactical(g, "4k4/3R1R3/4P4/9/9/9/9/9/9/4K4 w - - 119 1");
      now = new Date(g.startAt.getTime() + 300000 + offset);
      const result = await move(g, g.red, 0, 22, 13);
      expect(result.match.outcome).toEqual(
        offset < 0
          ? { reason: "CHECKMATE", winner: "red" }
          : { reason: "TIMEOUT", winner: "black" },
      );
      expect(result.applied).toBe(offset < 0);
      expect(result.match.clock.redMs).toBe(offset < 0 ? 1 : 0);
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM public.match_moves WHERE match_id=$1",
            [g.matchId],
          )
        ).rows[0].n,
      ).toBe(offset < 0 ? 1 : 0);
      expect(
        (
          await pool.query(
            "SELECT outcome,ended_at FROM public.matches WHERE id=$1",
            [g.matchId],
          )
        ).rows[0].ended_at.toISOString(),
      ).toBe(now.toISOString());
    },
  );
  it("illegal/offturn/stale repeated commands do not pause, switch, increment or refund", async () => {
    const g = await game();
    now = new Date(g.startAt.getTime() + 1000);
    expect((await move(g, g.red, 0, 54, 36)).error?.code).toBe(
      "MATCH_ILLEGAL_MOVE",
    );
    now = new Date(g.startAt.getTime() + 2000);
    expect((await move(g, g.black, 0, 27, 36)).error?.code).toBe(
      "MATCH_NOT_YOUR_TURN",
    );
    now = new Date(g.startAt.getTime() + 3000);
    const good = await move(g, g.red, 0);
    expect(good.match.clock.redMs).toBe(297000);
    now = new Date(g.startAt.getTime() + 4000);
    expect((await move(g, g.red, 0)).error?.code).toBe(
      "MATCH_VERSION_CONFLICT",
    );
    now = new Date(g.startAt.getTime() + 5000);
    const black = await move(g, g.black, 1, 27, 36);
    expect(black.match.clock).toEqual({
      redMs: 297000,
      blackMs: 298000,
      runningSinceEpochMs: now.getTime(),
    });
  });
  it("capture spends time and does not grant an increment; capture at zero never applies", async () => {
    const g = await game();
    await tactical(g, "4k4/9/9/Rr7/9/4P4/9/9/9/4K4 w - - 119 1");
    now = new Date(g.startAt.getTime() + 2500);
    const accepted = await move(g, g.red, 0, 27, 28);
    expect(accepted.match.clock.redMs).toBe(297500);
    expect(accepted.match.position).toContain("b - - 0 1");
    const h = await game();
    await tactical(h, "4k4/9/9/Rr7/9/4P4/9/9/9/4K4 w - - 119 1");
    now = new Date(h.startAt.getTime() + 300000);
    const timeout = await move(h, h.red, 0, 27, 28);
    expect(timeout.match.ply).toBe(0);
    expect(timeout.match.outcome).toEqual({
      reason: "TIMEOUT",
      winner: "black",
    });
  });
  it("actual PostgreSQL time expires a disconnected player without any move command", async () => {
    const c = await pool.connect();
    let serverNow: Date;
    try {
      serverNow = new Date(
        Number(
          (
            await c.query(
              "SELECT floor(extract(epoch FROM clock_timestamp())*1000)::bigint ms",
            )
          ).rows[0].ms,
        ),
      );
    } finally {
      c.release();
    }
    const g = await game(300, new Date(serverNow!.getTime() - 301000));
    await pool.query(
      "UPDATE public.room_members SET disconnected_at=clock_timestamp() WHERE room_id=$1 AND user_id=$2",
      [g.roomId, g.red],
    );
    await worker().tick();
    const result = (
      await pool.query(
        "SELECT status,clock,outcome,ended_at FROM public.matches WHERE id=$1",
        [g.matchId],
      )
    ).rows[0];
    expect(result).toMatchObject({
      status: "FINISHED",
      clock: { redMs: 0, blackMs: 300000 },
      outcome: { reason: "TIMEOUT", winner: "BLACK" },
    });
    expect(result.ended_at.getTime()).toBeGreaterThanOrEqual(
      serverNow!.getTime(),
    );
    expect(
      (
        await pool.query(
          "SELECT type FROM public.match_events WHERE match_id=$1 ORDER BY version",
          [g.matchId],
        )
      ).rows,
    ).toEqual([{ type: "START" }, { type: "RESULT" }]);
    expect(
      (
        await pool.query(
          "SELECT status,current_match_id FROM public.rooms WHERE id=$1",
          [g.roomId],
        )
      ).rows[0],
    ).toEqual({ status: "WAITING", current_match_id: null });
  });
  it("stale/early candidate recomputes current side after a move, and terminal candidate does not rewrite", async () => {
    const serverNow = new Date(
      Number(
        (
          await pool.query(
            "SELECT floor(extract(epoch FROM clock_timestamp())*1000)::bigint ms",
          )
        ).rows[0].ms,
      ),
    );
    const g = await game(300, new Date(serverNow.getTime() - 299000));
    now = serverNow;
    expect((await move(g, g.red, 0)).applied).toBe(true);
    await worker([{ roomId: g.roomId, matchId: g.matchId }]).tick();
    expect(
      (
        await pool.query("SELECT status,ply FROM public.matches WHERE id=$1", [
          g.matchId,
        ])
      ).rows[0],
    ).toEqual({ status: "ACTIVE", ply: 1 });
    now = new Date(serverNow.getTime() + 300000);
    await transaction([g.red, g.black], [g.roomId], (c) =>
      matches().resign(
        {
          client: c,
          actor: { userId: g.red, kind: "guest" },
          roomId: g.roomId,
          canControl: true,
          lockedActorIds: new Set([g.red, g.black]),
          lockedRoomIds: new Set([g.roomId]),
        },
        { matchId: g.matchId, matchVersion: 1 },
      ),
    );
    await worker([{ roomId: g.roomId, matchId: g.matchId }]).tick();
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM public.match_events WHERE match_id=$1 AND type='RESULT'",
          [g.matchId],
        )
      ).rows[0].n,
    ).toBe(1);
  });
  it("due selection is ordered, bounded50 and excludes unsupported and noncurrent matches", async () => {
    const sampled = new Date(
      Number(
        (
          await pool.query(
            "SELECT floor(extract(epoch FROM clock_timestamp())*1000)::bigint ms",
          )
        ).rows[0].ms,
      ),
    );
    const games: Game[] = [];
    for (let i = 0; i < 52; i++)
      games.push(
        await game(300, new Date(sampled.getTime() - 301000 - i * 10)),
      );
    const unsupported = await game(300, new Date(sampled.getTime() - 302000));
    await pool.query(
      "UPDATE public.match_events SET payload=payload-'encoding' WHERE match_id=$1 AND version=0",
      [unsupported.matchId],
    );
    const orphan = await game(300, new Date(sampled.getTime() - 303000));
    await pool.query(
      "UPDATE public.rooms SET status='WAITING',current_match_id=NULL WHERE id=$1",
      [orphan.roomId],
    );
    const candidates = await transaction([], [], (c) =>
      workerImplementation.dueMatches(c),
    );
    expect(candidates).toHaveLength(50);
    expect(candidates.map((c) => c.matchId)).toEqual(
      games
        .slice()
        .reverse()
        .slice(0, 50)
        .map((g) => g.matchId),
    );
    // Close this fixture batch so unrelated later tests cannot select it.
    for (const g of games)
      await worker([{ roomId: g.roomId, matchId: g.matchId }]).tick();
  });
  it("reports corrupt first candidate but still expires the next, without partial writes", async () => {
    const at = new Date(Date.now() - 301000),
      bad = await game(300, at),
      good = await game(300, at);
    await pool.query(
      "UPDATE public.match_events SET payload=jsonb_set(payload,'{roomId}',to_jsonb($2::text)) WHERE match_id=$1 AND version=0",
      [bad.matchId, randomUUID()],
    );
    await expect(worker([bad, good]).tick()).rejects.toBeInstanceOf(
      AggregateError,
    );
    expect(
      (
        await pool.query("SELECT status FROM public.matches WHERE id=$1", [
          bad.matchId,
        ])
      ).rows[0].status,
    ).toBe("ACTIVE");
    expect(
      (
        await pool.query("SELECT status FROM public.matches WHERE id=$1", [
          good.matchId,
        ])
      ).rows[0].status,
    ).toBe("FINISHED");
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM public.match_events WHERE match_id=$1 AND type='RESULT'",
          [bad.matchId],
        )
      ).rows[0].n,
    ).toBe(0);
  });
  it("room-end failure rolls back and retry creates one result", async () => {
    const g = await game(300, new Date(Date.now() - 301000));
    const fail = {
      onMatchEnded: async () => {
        throw new Error("synthetic room-end failure");
      },
    };
    await expect(worker([g], fail).tick()).rejects.toBeInstanceOf(
      AggregateError,
    );
    expect(
      (
        await pool.query("SELECT status FROM public.matches WHERE id=$1", [
          g.matchId,
        ])
      ).rows[0].status,
    ).toBe("ACTIVE");
    expect(
      (
        await pool.query("SELECT status FROM public.rooms WHERE id=$1", [
          g.roomId,
        ])
      ).rows[0].status,
    ).toBe("PLAYING");
    await worker([g]).tick();
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM public.match_events WHERE match_id=$1 AND type='RESULT'",
          [g.matchId],
        )
      ).rows[0].n,
    ).toBe(1);
  });
  it("outbox failure rolls back clock/result/room and a later tick can finish", async () => {
    const g = await game(300, new Date(Date.now() - 301000));
    await pool.query(
      "CREATE FUNCTION public.synthetic_clock_failure() RETURNS trigger LANGUAGE plpgsql AS $$BEGIN RAISE EXCEPTION 'synthetic outbox failure';END$$; CREATE TRIGGER synthetic_failure BEFORE INSERT ON xiangqi_room.outbox FOR EACH ROW EXECUTE FUNCTION public.synthetic_clock_failure()",
    );
    try {
      await expect(worker([g]).tick()).rejects.toBeInstanceOf(AggregateError);
    } finally {
      await pool.query(
        "DROP TRIGGER synthetic_failure ON xiangqi_room.outbox; DROP FUNCTION public.synthetic_clock_failure()",
      );
    }
    expect(
      (
        await pool.query(
          "SELECT status,clock FROM public.matches WHERE id=$1",
          [g.matchId],
        )
      ).rows[0],
    ).toMatchObject({
      status: "ACTIVE",
      clock: { redMs: 300000, blackMs: 300000 },
    });
    expect(
      (
        await pool.query("SELECT status FROM public.rooms WHERE id=$1", [
          g.roomId,
        ])
      ).rows[0].status,
    ).toBe("PLAYING");
    await worker([g]).tick();
    expect(
      (
        await pool.query(
          "SELECT status,clock FROM public.matches WHERE id=$1",
          [g.matchId],
        )
      ).rows[0],
    ).toMatchObject({ status: "FINISHED", clock: { redMs: 0 } });
  });
  it("two workers and resignation at expired deadline preserve a single TIMEOUT and then a fresh game resets both clocks", async () => {
    const g = await game(300, new Date(Date.now() - 301000));
    now = new Date();
    await Promise.all([
      worker([g]).tick(),
      worker([g]).tick(),
      transaction([g.red, g.black], [g.roomId], (c) =>
        matches().resign(
          {
            client: c,
            actor: { userId: g.black, kind: "guest" },
            roomId: g.roomId,
            canControl: true,
            lockedActorIds: new Set([g.red, g.black]),
            lockedRoomIds: new Set([g.roomId]),
          },
          { matchId: g.matchId, matchVersion: 0 },
        ),
      ),
    ]);
    const outcome = (
      await pool.query("SELECT outcome FROM public.matches WHERE id=$1", [
        g.matchId,
      ])
    ).rows[0].outcome;
    expect(outcome).toEqual({ reason: "TIMEOUT", winner: "BLACK" });
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM public.match_events WHERE match_id=$1 AND type='RESULT'",
          [g.matchId],
        )
      ).rows[0].n,
    ).toBe(1);
    const nextId = await transaction(
      [g.red, g.black],
      [g.roomId],
      async (c) => {
        const token = randomUUID();
        await c.query(
          "UPDATE public.room_members SET ready=true WHERE room_id=$1",
          [g.roomId],
        );
        await c.query(
          "UPDATE xiangqi_room.countdowns SET token=$2,due_at=$3 WHERE room_id=$1",
          [g.roomId, token, now],
        );
        const next = await matches().start(c, {
          roomId: g.roomId,
          startToken: token,
          redId: g.red,
          blackId: g.black,
          timeControlSeconds: 300,
          startedAt: now,
        });
        await c.query(
          "UPDATE public.rooms SET status='PLAYING',current_match_id=$2 WHERE id=$1",
          [g.roomId, next.matchId],
        );
        await c.query(
          "UPDATE public.active_players SET match_id=$2 WHERE room_id=$1",
          [g.roomId, next.matchId],
        );
        return next.matchId;
      },
    );
    expect(nextId).not.toBe(g.matchId);
    expect(
      (
        await pool.query("SELECT clock FROM public.matches WHERE id=$1", [
          nextId,
        ])
      ).rows[0].clock,
    ).toEqual({
      redMs: 300000,
      blackMs: 300000,
      runningSinceEpochMs: now.getTime(),
    });
    await worker([{ roomId: g.roomId, matchId: nextId }]).tick();
    expect(
      (
        await pool.query("SELECT status FROM public.matches WHERE id=$1", [
          nextId,
        ])
      ).rows[0].status,
    ).toBe("ACTIVE");
  });
  it("fails closed when the worker scope lacks both-player lock proof", async () => {
    const g = await game(300, new Date(Date.now() - 301000));
    const port: ClockWorkerPort = {
      dueMatches: async () => [g],
      withMatch: async (_, work) => {
        await transaction([g.red, g.black], [g.roomId], (c) =>
          work({
            client: c,
            roomId: g.roomId,
            matchId: g.matchId,
            lockedActorIds: new Set([g.red]),
            lockedRoomIds: new Set([g.roomId]),
          }),
        );
      },
    };
    const bad = new workerImplementation.ClockWorker(clock, matches(), port);
    try {
      await bad.tick();
      throw new Error("Expected lock rejection");
    } catch (error) {
      expect(error).toBeInstanceOf(AggregateError);
      expect((error as AggregateError).errors[0]).toMatchObject({
        code: "CLOCK_LOCK_REQUIRED",
      });
    }
    expect(
      (
        await pool.query("SELECT status FROM public.matches WHERE id=$1", [
          g.matchId,
        ])
      ).rows[0].status,
    ).toBe("ACTIVE");
  });
  it("samples PostgreSQL time after waiting for the actual actor and room locks", async () => {
    const sampled = new Date(
      Number(
        (
          await pool.query(
            "SELECT floor(extract(epoch FROM clock_timestamp())*1000)::bigint ms",
          )
        ).rows[0].ms,
      ),
    );
    const g = await game(300, new Date(sampled.getTime() - 299950));
    const blocker = await pool.connect();
    let pending: Promise<void> | undefined;
    let releasedAt: number;
    try {
      await blocker.query("BEGIN; SET LOCAL ROLE app_server");
      for (const id of [g.red, g.black].sort())
        await blocker.query(
          "SELECT pg_advisory_xact_lock(hashtextextended($1,0))",
          ["actor:" + id],
        );
      await blocker.query(
        "SELECT pg_advisory_xact_lock(hashtextextended($1,0))",
        ["room:" + g.roomId],
      );
      pending = worker([g]).tick();
      await blocker.query("SELECT pg_sleep(0.08)");
      releasedAt = Number(
        (
          await blocker.query(
            "SELECT floor(extract(epoch FROM clock_timestamp())*1000)::bigint ms",
          )
        ).rows[0].ms,
      );
      await blocker.query("COMMIT");
    } finally {
      await blocker.query("ROLLBACK");
      blocker.release();
    }
    await pending;
    const result = (
      await pool.query(
        "SELECT status,outcome,ended_at FROM public.matches WHERE id=$1",
        [g.matchId],
      )
    ).rows[0];
    expect(result.status).toBe("FINISHED");
    expect(result.outcome).toEqual({ reason: "TIMEOUT", winner: "BLACK" });
    expect(result.ended_at.getTime()).toBeGreaterThanOrEqual(releasedAt);
  });
  it("progresses beyond fifty persistent failures while preserving failed match transactions", async () => {
    await reset();
    const sampled = Date.now();
    const failed: Game[] = [];
    for (let i = 0; i < 50; i++) {
      const g = await game(300, new Date(sampled - 302000 - i));
      failed.push(g);
      await pool.query(
        "UPDATE public.match_events SET payload=jsonb_set(payload,'{roomId}',to_jsonb($2::text)) WHERE match_id=$1 AND version=0",
        [g.matchId, randomUUID()],
      );
    }
    const healthy = await game(300, new Date(sampled - 301000));
    const running = worker();
    await expect(running.tick()).rejects.toBeInstanceOf(AggregateError);
    expect(
      (
        await pool.query("SELECT status FROM public.matches WHERE id=$1", [
          healthy.matchId,
        ])
      ).rows[0].status,
    ).toBe("ACTIVE");
    await running.tick().catch(() => {});
    expect(
      (
        await pool.query("SELECT status FROM public.matches WHERE id=$1", [
          healthy.matchId,
        ])
      ).rows[0].status,
    ).toBe("FINISHED");
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM public.matches WHERE id=ANY($1::uuid[]) AND status='ACTIVE'",
          [failed.map((g) => g.matchId)],
        )
      ).rows[0].n,
    ).toBe(50);
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM public.match_events WHERE match_id=ANY($1::uuid[]) AND type='RESULT'",
          [failed.map((g) => g.matchId)],
        )
      ).rows[0].n,
    ).toBe(0);
  });
});
