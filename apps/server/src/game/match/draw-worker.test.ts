import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { ClockService } from "../clock/clock-service.js";
import { RoomRosterChanged } from "../room/contracts.js";
import { RoomTransactions } from "../room/room-transactions.js";
import type { MatchScope } from "./contracts.js";
import { MatchStore } from "./match-store.js";
import {
  DrawWorker,
  dueDrawOffers,
  type DrawDueOffer,
  type DrawWorkerPort,
} from "./draw-worker.js";
import { databaseUrl, pool, reset } from "./draw-worker.test-helper.js";

function candidate(): DrawDueOffer {
  return {
    roomId: randomUUID(),
    matchId: randomUUID(),
    offerId: randomUUID(),
    deadlineEpochMs: "1000.123000",
  };
}
function unitScope(c: DrawDueOffer): MatchScope {
  const actor = randomUUID();
  return {
    client: {
      query: vi
        .fn()
        .mockResolvedValue({ rowCount: 1, rows: [{ id: c.offerId }] }),
    } as unknown as PoolClient,
    roomId: c.roomId,
    actor: { userId: actor, kind: "member" },
    canControl: true,
    lockedActorIds: new Set([actor]),
    lockedRoomIds: new Set([c.roomId]),
  };
}
describe("draw worker bounded transaction port", () => {
  it("continues later candidates after a failed transaction and aggregates the failure", async () => {
    const a = candidate(),
      b = candidate(),
      expiry = vi.fn();
    const port: DrawWorkerPort = {
      dueOffers: vi.fn().mockResolvedValue([a, b]),
      withMatch: vi.fn(async (c, work) => {
        if (c.offerId === a.offerId)
          throw new Error("synthetic transaction failure");
        await work(unitScope(c));
      }),
    };
    const worker = new DrawWorker(
      { expireDrawOffers: expiry } as unknown as MatchStore,
      port,
    );
    await expect(worker.tick()).rejects.toBeInstanceOf(AggregateError);
    expect(expiry).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ roomId: b.roomId }),
      { matchId: b.matchId },
    );
  });
  it("bounds a page to 50, advances past failures and wraps after a partial page", async () => {
    const page = Array.from({ length: 51 }, candidate),
      next = candidate();
    const due = vi
      .fn()
      .mockResolvedValueOnce(page)
      .mockResolvedValueOnce([next])
      .mockResolvedValueOnce([]);
    const withMatch = vi.fn(async (c: DrawDueOffer) => {
      if (c.offerId !== next.offerId) throw new Error("synthetic failure");
    });
    const worker = new DrawWorker({} as MatchStore, {
      dueOffers: due,
      withMatch,
    });
    await expect(worker.tick()).rejects.toBeInstanceOf(AggregateError);
    expect(withMatch).toHaveBeenCalledTimes(50);
    await worker.tick();
    await worker.tick();
    expect(due.mock.calls.map(([cursor]) => cursor)).toEqual([
      null,
      {
        deadlineEpochMs: page[49]!.deadlineEpochMs,
        offerId: page[49]!.offerId,
      },
      null,
    ]);
  });
  it.each(["candidate", "room", "actor", "readonly"])(
    "refuses %s proof before accessing SQL or expiring proposals",
    async (change) => {
      const c = candidate(),
        s = unitScope(c),
        expiry = vi.fn();
      if (change === "candidate") c.offerId = "forged";
      if (change === "room") s.lockedRoomIds = new Set();
      if (change === "actor") s.lockedActorIds = new Set();
      if (change === "readonly") s.canControl = false;
      const worker = new DrawWorker(
        { expireDrawOffers: expiry } as unknown as MatchStore,
        { dueOffers: async () => [c], withMatch: async (_, work) => work(s) },
      );
      await expect(worker.tick()).rejects.toBeInstanceOf(AggregateError);
      expect(s.client.query).not.toHaveBeenCalled();
      expect(expiry).not.toHaveBeenCalled();
    },
  );
});
const roomEnd = {
  async onMatchEnded(
    client: PoolClient,
    input: { roomId: string; matchId: string },
  ) {
    await client.query(
      "UPDATE public.rooms SET status='WAITING',current_match_id=NULL,room_version=room_version+1 WHERE id=$1 AND current_match_id=$2",
      [input.roomId, input.matchId],
    );
    await client.query(
      "UPDATE public.active_players SET match_id=NULL WHERE room_id=$1",
      [input.roomId],
    );
  },
};
const matches = new MatchStore(new ClockService(), roomEnd);
const coordinator = new RoomTransactions(pool);
async function game() {
  const red = randomUUID(),
    black = randomUUID(),
    roomId = randomUUID(),
    startToken = randomUUID();
  for (const id of [red, black]) {
    await pool.query(
      "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,$2,clock_timestamp())",
      [id, `synthetic-${id}@example.invalid`],
    );
    await pool.query(
      "INSERT INTO public.profiles(user_id,username,display_name,completed_at,registration_pending) VALUES($1,$2,'Synthetic Draw Worker',clock_timestamp(),false)",
      [id, "d" + id.replaceAll("-", "").slice(0, 18)],
    );
  }
  const created = await coordinator.withRoom(
    {
      actor: { userId: red, kind: "member" },
      roomIds: [roomId],
    },
    async (p) => ({ status: "active", actor: p.actor }),
    async (scope) => {
      if (!scope.lockedActorIds.has(black))
        throw new RoomRosterChanged([black]);
      const client = scope.client;
      await client.query(
        "INSERT INTO public.rooms(id,owner_id,name,time_control,viewer_limit,invite_code) VALUES($1,$2,'Draw Worker Fixture',600,5,$3)",
        [
          roomId,
          red,
          randomUUID()
            .replaceAll("-", "")
            .slice(0, 8)
            .toUpperCase()
            .replaceAll("0", "G")
            .replaceAll("1", "H"),
        ],
      );
      await client.query(
        "INSERT INTO public.room_members(room_id,user_id,role,side,ready) VALUES($1,$2,'PLAYER','RED',true),($1,$3,'PLAYER','BLACK',true)",
        [roomId, red, black],
      );
      await client.query(
        "INSERT INTO public.active_players(user_id,room_id) VALUES($1,$3),($2,$3)",
        [red, black, roomId],
      );
      const at = new Date();
      await client.query(
        "INSERT INTO xiangqi_room.countdowns(room_id,token,due_at,red_id,black_id) VALUES($1,$2,$3,$4,$5)",
        [roomId, startToken, at, red, black],
      );
      const result = await matches.start(client, {
        roomId,
        startToken,
        redId: red,
        blackId: black,
        timeControlSeconds: 600,
        startedAt: at,
      });
      await client.query(
        "UPDATE public.rooms SET status='PLAYING',current_match_id=$2 WHERE id=$1",
        [roomId, result.matchId],
      );
      await client.query(
        "UPDATE public.active_players SET match_id=$2 WHERE room_id=$1",
        [roomId, result.matchId],
      );
      return result;
    },
  );
  if (created.status !== "active") throw new Error("Synthetic start ended");
  return { red, black, roomId, matchId: created.value.matchId };
}
async function withGame<T>(
  g: Awaited<ReturnType<typeof game>>,
  work: (scope: MatchScope) => Promise<T>,
  actor = g.red,
) {
  const result = await coordinator.withRoom(
    { actor: { userId: actor, kind: "member" }, roomIds: [g.roomId] },
    async (p) => ({ status: "active", actor: p.actor }),
    (s) => work({ ...s, roomId: g.roomId, canControl: true }),
  );
  if (result.status !== "active") throw new Error("Synthetic scope ended");
  return result.value;
}
async function offer(g: Awaited<ReturnType<typeof game>>, actor = g.red) {
  const version = (
    await pool.query(
      "SELECT version::integer v FROM public.matches WHERE id=$1",
      [g.matchId],
    )
  ).rows[0].v;
  return withGame(
    g,
    (s) => matches.offerDraw(s, { matchId: g.matchId, matchVersion: version }),
    actor,
  );
}
async function overdue(g: Awaited<ReturnType<typeof game>>) {
  await pool.query(
    "WITH t AS MATERIALIZED(SELECT clock_timestamp() at) UPDATE xiangqi_room.match_draw_offers SET created_at=t.at-interval '31 seconds',expires_at=t.at-interval '1 second' FROM t WHERE match_id=$1 AND status='PENDING'",
    [g.matchId],
  );
}
function sqlPort(): DrawWorkerPort {
  return {
    dueOffers: async (cursor) => {
      const client = await pool.connect();
      try {
        return await dueDrawOffers(client, cursor);
      } finally {
        client.release();
      }
    },
    withMatch: async (c, work) => {
      const row = (
        await pool.query(
          "SELECT red_user_id FROM public.matches WHERE id=$1 AND room_id=$2",
          [c.matchId, c.roomId],
        )
      ).rows[0];
      if (!row) return;
      const result = await coordinator.withRoom(
        {
          actor: { userId: row.red_user_id, kind: "member" },
          roomIds: [c.roomId],
        },
        async (p) => ({ status: "active", actor: p.actor }),
        (s) => work({ ...s, roomId: c.roomId, canControl: true }),
      );
      if (result.status !== "active") throw new Error("Synthetic expiry ended");
    },
  };
}
async function terminal(g: Awaited<ReturnType<typeof game>>) {
  return (
    await pool.query(
      "SELECT status,outcome,clock FROM public.matches WHERE id=$1",
      [g.matchId],
    )
  ).rows[0];
}
afterAll(() => pool.end());
describe.skipIf(!databaseUrl)(
  "draw expiry actual RoomTransactions/MatchStore on dedicated synthetic SQL",
  () => {
    beforeEach(reset);
    it("selects only due managed current ONLINE ACTIVE offers", async () => {
      const g = await game();
      await offer(g);
      expect(await sqlPort().dueOffers(null)).toEqual([]);
      await overdue(g);
      expect(await sqlPort().dueOffers(null)).toEqual([
        expect.objectContaining({ roomId: g.roomId, matchId: g.matchId }),
      ]);
      await pool.query(
        "UPDATE public.rooms SET status='WAITING',current_match_id=NULL WHERE id=$1",
        [g.roomId],
      );
      expect(await sqlPort().dueOffers(null)).toEqual([]);
      await pool.query(
        "UPDATE public.rooms SET status='PLAYING',current_match_id=$2 WHERE id=$1",
        [g.roomId, g.matchId],
      );
      await pool.query(
        "UPDATE public.match_events SET payload=jsonb_set(payload,'{encoding}','\"legacy\"') WHERE match_id=$1 AND type='START'",
        [g.matchId],
      );
      expect(await sqlPort().dueOffers(null)).toEqual([]);
    });
    it("expires once, persists five-own-move cooldown and leaves both clocks unchanged", async () => {
      const g = await game();
      await offer(g);
      await overdue(g);
      const before = await terminal(g),
        worker = new DrawWorker(matches, sqlPort());
      await worker.tick();
      await worker.tick();
      expect(await terminal(g)).toEqual(before);
      expect(
        (
          await pool.query(
            "SELECT status,cooldown_after_move_count FROM xiangqi_room.match_draw_offers WHERE match_id=$1",
            [g.matchId],
          )
        ).rows[0],
      ).toEqual({ status: "EXPIRED", cooldown_after_move_count: 0 });
      expect(
        (
          await withGame(g, (s) =>
            matches.drawSnapshot(s, { matchId: g.matchId }),
          )
        ).remainingMoves,
      ).toEqual({ red: 5, black: 0 });
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM public.match_events WHERE match_id=$1 AND type='PROPOSAL_RESOLVED'",
            [g.matchId],
          )
        ).rows[0].n,
      ).toBe(1);
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM xiangqi_room.outbox WHERE room_id=$1 AND type='MATCH_DRAW' AND payload->>'status'='EXPIRED'",
            [g.roomId],
          )
        ).rows[0].n,
      ).toBe(1);
    });
    it.each(["TIMEOUT", "DISCONNECT"])(
      "preserves canonical %s priority over expiry and produces only one RESULT",
      async (reason) => {
        const g = await game();
        await offer(g);
        await overdue(g);
        if (reason === "TIMEOUT")
          await pool.query(
            "UPDATE public.matches SET clock=jsonb_build_object('redMs',0,'blackMs',600000,'runningSinceEpochMs',floor(extract(epoch FROM clock_timestamp())*1000)::bigint) WHERE id=$1",
            [g.matchId],
          );
        else
          await pool.query(
            "UPDATE public.room_members SET disconnected_at=clock_timestamp()-interval '61 seconds' WHERE room_id=$1 AND user_id=$2",
            [g.roomId, g.red],
          );
        const worker = new DrawWorker(matches, sqlPort());
        await worker.tick();
        await worker.tick();
        expect(await terminal(g)).toMatchObject({
          status: "FINISHED",
          outcome: { reason, winner: "BLACK" },
        });
        expect(
          (
            await pool.query(
              "SELECT status FROM xiangqi_room.match_draw_offers WHERE match_id=$1",
              [g.matchId],
            )
          ).rows[0].status,
        ).toBe("CLOSED");
        expect(
          (
            await pool.query(
              "SELECT count(*)::int n FROM public.match_events WHERE match_id=$1 AND type='RESULT'",
              [g.matchId],
            )
          ).rows[0].n,
        ).toBe(1);
      },
    );
    it.each(["resolved", "room"])(
      "rechecks %s changes after enumeration without mutation",
      async (change) => {
        const g = await game();
        await offer(g);
        await overdue(g);
        const candidates = await sqlPort().dueOffers(null);
        if (change === "resolved")
          await pool.query(
            "UPDATE xiangqi_room.match_draw_offers SET status='WITHDRAWN',resolved_at=clock_timestamp() WHERE match_id=$1",
            [g.matchId],
          );
        else
          await pool.query(
            "UPDATE public.rooms SET current_match_id=NULL,status='WAITING' WHERE id=$1",
            [g.roomId],
          );
        const before = await terminal(g);
        const offers = (
          await pool.query(
            "SELECT * FROM xiangqi_room.match_draw_offers WHERE match_id=$1",
            [g.matchId],
          )
        ).rows;
        await new DrawWorker(matches, {
          ...sqlPort(),
          dueOffers: async () => candidates,
        }).tick();
        expect(await terminal(g)).toEqual(before);
        expect(
          (
            await pool.query(
              "SELECT * FROM xiangqi_room.match_draw_offers WHERE match_id=$1",
              [g.matchId],
            )
          ).rows,
        ).toEqual(offers);
      },
    );
    it("two simultaneously due proposals resolve once each and a terminal stale candidate never creates another result", async () => {
      const g = await game();
      await offer(g);
      await offer(g, g.black);
      await overdue(g);
      const base = sqlPort(),
        candidates = await base.dueOffers(null);
      expect(candidates).toHaveLength(2);
      const before = (await terminal(g)).clock;
      await new DrawWorker(matches, base).tick();
      expect((await terminal(g)).clock).toEqual(before);
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM public.match_events WHERE match_id=$1 AND type='PROPOSAL_RESOLVED'",
            [g.matchId],
          )
        ).rows[0].n,
      ).toBe(2);
      const version = (
        await pool.query(
          "SELECT version::integer v FROM public.matches WHERE id=$1",
          [g.matchId],
        )
      ).rows[0].v;
      await withGame(g, (s) =>
        matches.resign(s, { matchId: g.matchId, matchVersion: version }),
      );
      const ended = await terminal(g);
      await new DrawWorker(matches, {
        ...base,
        dueOffers: async () => candidates,
      }).tick();
      expect(await terminal(g)).toEqual(ended);
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM public.match_events WHERE match_id=$1 AND type='RESULT'",
            [g.matchId],
          )
        ).rows[0].n,
      ).toBe(1);
    });
    it("exact SQL keyset progresses past fifty failed offers to a healthy fifty-first", async () => {
      const games = [];
      for (let i = 0; i < 51; i++) {
        const g = await game();
        await offer(g);
        await overdue(g);
        games.push(g);
      }
      const base = sqlPort(),
        page = await base.dueOffers(null),
        healthy = games[50]!;
      const failed = new Set(page.map((c) => c.offerId));
      const worker = new DrawWorker(matches, {
        ...base,
        withMatch: async (c, work) => {
          if (failed.has(c.offerId))
            throw new Error("Synthetic unavailable room");
          await base.withMatch(c, work);
        },
      });
      await expect(worker.tick()).rejects.toBeInstanceOf(AggregateError);
      await worker.tick();
      expect(
        (
          await pool.query(
            "SELECT status FROM xiangqi_room.match_draw_offers WHERE match_id=$1",
            [healthy.matchId],
          )
        ).rows[0].status,
      ).toBe("EXPIRED");
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM xiangqi_room.match_draw_offers WHERE status='PENDING'",
          )
        ).rows[0].n,
      ).toBe(50);
    }, 15000);
  },
);
