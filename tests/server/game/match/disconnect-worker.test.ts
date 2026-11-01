import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, it, expect } from "vitest";
import {
  pool,
  databaseUrl,
  reset,
  apply,
  transaction,
} from "./match.test-helper.js";
import { MatchStore } from "@server/game/match/match-store.js";
import { ClockService } from "@server/game/clock/clock.service.js";
import { ClockWorker, dueMatches } from "@server/game/clock/clock-worker.js";
import {
  dueDisconnectMatches,
  DisconnectWorker,
} from "@server/game/match/disconnect-worker.js";
import type { ClockWorkerPort } from "@server/game/clock/clock.types.js";
import type { PoolClient } from "pg";
let failEnd = false;
const clock = new ClockService();
const matches = new MatchStore(clock, {
  onMatchEnded: async (c, input) => {
    await c.query(
      "UPDATE public.rooms SET status='WAITING',current_match_id=NULL WHERE id=$1",
      [input.roomId],
    );
    await c.query(
      "UPDATE public.room_members SET ready=false WHERE room_id=$1",
      [input.roomId],
    );
    await c.query(
      "UPDATE public.active_players SET match_id=NULL WHERE room_id=$1",
      [input.roomId],
    );

    if (failEnd) throw Error("Synthetic end failure");
  },
});
async function read<T>(work: (c: PoolClient) => Promise<T>) {
  const c = await pool.connect();
  try {
    return await work(c);
  } finally {
    c.release();
  }
}
async function setup(
  guest: boolean | "mixed" = false,
  timeControl: 0 | 600 = 600,
  matched: boolean | "RANKED" = false,
) {
  const red = randomUUID(),
    black = randomUUID(),
    roomId = randomUUID(),
    token = randomUUID();
  for (const id of [red, black]) {
    if (guest === true || (guest === "mixed" && id === black)) {
      await pool.query(
        "INSERT INTO xiangqi_auth.principals(id,kind) VALUES($1,'guest')",
        [id],
      );
    } else
      await pool.query(
        "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,$2,clock_timestamp())",
        [id, id + "@example.invalid"],
      );
    await pool.query(
      "INSERT INTO public.profiles(user_id,username,display_name) VALUES($1,$2,$2)",
      [id, "u" + id.replaceAll("-", "").slice(0, 18)],
    );
  }
  const at = new Date(
    (
      await pool.query(
        "SELECT clock_timestamp() - interval '5 minutes' AS \"at\"",
      )
    ).rows[0].at,
  );
  const result = await transaction([red, black], [roomId], async (c) => {
    await c.query(
      "INSERT INTO public.rooms(id,owner_id,name,time_control,invite_code,viewer_limit,kind) VALUES($1,$2,'Synthetic',$4,$3,5,$5)",
      [
        roomId,
        red,
        matched ? null : randomUUID()
          .replaceAll("-", "")
          .slice(0, 8)
          .split("")
          .map((c) => parseInt(c, 16) % 10)
          .join(""),
        timeControl,
        matched === "RANKED" ? "RANKED" : matched ? "CASUAL" : "CUSTOM",
      ],
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
      [roomId, token, at, red, black],
    );
    const r = await matches.start(c, {
      roomId,
      startToken: token,
      redId: red,
      blackId: black,
      timeControlSeconds: timeControl,
      startedAt: at,
    });
    await c.query(
      "UPDATE public.rooms SET status='PLAYING',current_match_id=$2 WHERE id=$1",
      [roomId, r.matchId],
    );
    await c.query(
      "UPDATE public.active_players SET match_id=$2 WHERE room_id=$1",
      [roomId, r.matchId],
    );
    return r;
  });
  return { red, black, roomId, matchId: result.matchId };
}
function port(query = dueDisconnectMatches): ClockWorkerPort {
  return {
    dueMatches: (cursor) => read((c) => query(c, cursor)),
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
}
async function offline(
  s: Awaited<ReturnType<typeof setup>>,
  redSeconds: number,
  blackSeconds?: number,
) {
  await pool.query(
    "UPDATE public.room_members SET disconnected_at=clock_timestamp()-($3::text||' seconds')::interval WHERE room_id=$1 AND user_id=$2",
    [s.roomId, s.red, redSeconds],
  );
  if (blackSeconds !== undefined)
    await pool.query(
      "UPDATE public.room_members SET disconnected_at=clock_timestamp()-($3::text||' seconds')::interval WHERE room_id=$1 AND user_id=$2",
      [s.roomId, s.black, blackSeconds],
    );
}
async function outcome(s: { matchId: string }) {
  return (
    await pool.query("SELECT status,outcome FROM public.matches WHERE id=$1", [
      s.matchId,
    ])
  ).rows[0];
}
describe.skipIf(!databaseUrl)("managed disconnect adjudication", () => {
  beforeAll(async () => {
    await reset();
    await apply("supabase/migrations/20261011000007_match_outcomes.sql");
    await apply("supabase/migrations/20261102000003_unlimited_inactivity.sql");
    await apply("supabase/migrations/20261103000005_match_aborted.sql");
    await apply("supabase/migrations/20261103000006_online_undo.sql");
    await apply(
      "supabase/migrations/20261103000007_match_simultaneous_disconnect.sql",
    );
    await apply("supabase/migrations/20261011000010_room_chat.sql");
    await apply("supabase/migrations/20261011000014_friendships.sql");
    await apply("supabase/migrations/20261102000004_direct_messages.sql");
    await apply("supabase/migrations/20261103000009_yc7_chat_quota.sql");
    await apply("supabase/migrations/20261103000010_media_generation.sql");
    await apply("supabase/migrations/20261103000011_yc9_ranked.sql");
  });
  afterAll(() => pool.end());
  it("adjudicates a matched room without an invite code", async () => {
    const s = await setup(false, 600, true);
    await offline(s, 61);
    expect(await read((c) => dueDisconnectMatches(c))).toContainEqual(
      expect.objectContaining({ roomId: s.roomId, matchId: s.matchId }),
    );
    await new DisconnectWorker(matches, port()).tick();
    expect((await outcome(s)).outcome).toEqual({ reason: "DISCONNECT", winner: "BLACK" });
  });
  it("settles a ranked simultaneous no-show draw once through the disconnect worker", async () => {
    const s = await setup(false, 600, "RANKED");
    await offline(s, 61);
    await pool.query("UPDATE public.room_members SET disconnected_at=(SELECT disconnected_at FROM public.room_members WHERE room_id=$1 AND user_id=$2) WHERE room_id=$1", [s.roomId, s.red]);
    const worker = new DisconnectWorker(matches, port());
    await worker.tick();
    await worker.tick();
    expect((await outcome(s)).outcome).toEqual({ reason: "DRAW_SIMULTANEOUS_DISCONNECT", winner: null });
    const ratings = await pool.query("SELECT elo,completed,draws FROM xiangqi_room.ratings WHERE user_id=ANY($1::uuid[])", [[s.red, s.black]]);
    expect(ratings.rows).toEqual([{ elo: 1200, completed: 1, draws: 1 }, { elo: 1200, completed: 1, draws: 1 }]);
    expect((await pool.query("SELECT count(*)::int AS n FROM xiangqi_room.ranked_results WHERE match_id=$1", [s.matchId])).rows[0].n).toBe(1);
  });
  it("settles a ranked disconnect win through the worker", async () => {
    const s = await setup(false, 600, "RANKED");
    await offline(s, 61);
    await new DisconnectWorker(matches, port()).tick();
    expect((await outcome(s)).outcome).toEqual({ reason: "DISCONNECT", winner: "BLACK" });
    expect((await pool.query("SELECT red_after,black_after FROM xiangqi_room.ranked_results WHERE match_id=$1", [s.matchId])).rows[0]).toEqual({ red_after: 1184, black_after: 1216 });
  });
  it("settles a ranked timeout through the clock worker", async () => {
    const s = await setup(false, 600, "RANKED");
    await pool.query("UPDATE public.matches SET clock=jsonb_set(jsonb_set(clock,'{redMs}','0'),'{runningSinceEpochMs}',to_jsonb(floor(extract(epoch FROM clock_timestamp())*1000)::bigint-1000)) WHERE id=$1", [s.matchId]);
    await new ClockWorker(clock, matches, port(dueMatches)).tick();
    expect((await outcome(s)).outcome).toEqual({ reason: "TIMEOUT", winner: "BLACK" });
    expect((await pool.query("SELECT red_after,black_after FROM xiangqi_room.ranked_results WHERE match_id=$1", [s.matchId])).rows[0]).toEqual({ red_after: 1184, black_after: 1216 });
  });
  it("does not settle ranked Elo when a match is interrupted by restart", async () => {
    const s = await setup(false, 600, "RANKED");
    await transaction([s.red, s.black], [s.roomId], c => matches.finish(c, { roomId: s.roomId, matchId: s.matchId, outcome: { reason: "SERVER_RESTART", winner: null }, at: new Date() }));
    expect(await outcome(s)).toMatchObject({ status: "INTERRUPTED", outcome: { reason: "SERVER_RESTART", winner: null } });
    expect((await pool.query("SELECT count(*)::int AS n FROM xiangqi_room.ranked_results WHERE match_id=$1", [s.matchId])).rows[0].n).toBe(0);
    expect((await pool.query("SELECT count(*)::int AS n FROM xiangqi_room.ratings WHERE user_id=ANY($1::uuid[])", [[s.red, s.black]])).rows[0].n).toBe(0);
  });
  it("ends at the SQL 60-second boundary, publishes atomically and never repeats", async () => {
    const s = await setup();
    await offline(s, 60);
    const worker = new DisconnectWorker(matches, port());
    await worker.tick();
    expect((await outcome(s)).outcome).toEqual({
      reason: "DISCONNECT",
      winner: "BLACK",
    });
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM public.match_events WHERE match_id=$1 AND type='RESULT'",
          [s.matchId],
        )
      ).rows[0].n,
    ).toBe(1);
    expect(
      (
        await pool.query("SELECT status FROM public.rooms WHERE id=$1", [
          s.roomId,
        ])
      ).rows[0].status,
    ).toBe("WAITING");
    await worker.tick();
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM xiangqi_room.outbox WHERE room_id=$1",
          [s.roomId],
        )
      ).rows[0].n,
    ).toBe(1);
  });
  it("keeps the match before 60 seconds and rechecks reconnect under locks", async () => {
    const s = await setup();
    await offline(s, 59);
    await new DisconnectWorker(matches, port()).tick();
    expect((await outcome(s)).status).toBe("ACTIVE");
    await offline(s, 61);
    const candidates = await read((c) => dueDisconnectMatches(c));
    await pool.query(
      "UPDATE public.room_members SET disconnected_at=NULL WHERE room_id=$1",
      [s.roomId],
    );
    const p = port();
    p.dueMatches = async () => candidates;
    await new DisconnectWorker(matches, p).tick();
    expect((await outcome(s)).status).toBe("ACTIVE");
  });
  it.each([
    [-70, -80, "TIMEOUT"],
    [-80, -70, "DISCONNECT"],
  ] as const)(
    "uses earliest actual deadline even when both overdue (%s,%s)",
    async (graceOffset, clockOffset, reason) => {
      const s = await setup();
      await offline(s, 60 - graceOffset);
      await pool.query(
        "UPDATE public.matches SET clock=jsonb_set(jsonb_set(clock,'{redMs}','0'),'{runningSinceEpochMs}',to_jsonb(floor(extract(epoch FROM clock_timestamp())*1000)::bigint+$2)) WHERE id=$1",
        [s.matchId, clockOffset * 1000],
      );
      await new ClockWorker(clock, matches, port(dueMatches)).tick();
      await new DisconnectWorker(matches, port()).tick();
      expect((await outcome(s)).outcome.reason).toBe(reason);
    },
  );
  it("both offline: earliest disconnected loses, never INTERRUPTED", async () => {
    const s = await setup();
    await offline(s, 61, 70);
    await new DisconnectWorker(matches, port()).tick();
    expect((await outcome(s)).outcome).toEqual({
      reason: "DISCONNECT",
      winner: "RED",
    });
  });
  it("rolls result, room and outbox back when the room-end collaborator fails", async () => {
    const s = await setup();
    await offline(s, 61);
    failEnd = true;
    try {
      await expect(
        new DisconnectWorker(matches, port()).tick(),
      ).rejects.toThrow();
    } finally {
      failEnd = false;
    }
    expect((await outcome(s)).status).toBe("ACTIVE");
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM public.match_events WHERE match_id=$1 AND type='RESULT'",
          [s.matchId],
        )
      ).rows[0].n,
    ).toBe(0);
    await new DisconnectWorker(matches, port()).tick();
  });
  it("exact clock/grace tie is TIMEOUT; identical disconnect timestamps draw", async () => {
    const s = await setup();
    await offline(s, 61);
    await pool.query(
      "UPDATE public.room_members SET disconnected_at=(SELECT disconnected_at FROM public.room_members WHERE room_id=$1 AND user_id=$2) WHERE room_id=$1",
      [s.roomId, s.red],
    );
    await pool.query(
      "UPDATE public.matches SET clock=jsonb_set(jsonb_set(clock,'{redMs}','0'),'{runningSinceEpochMs}',to_jsonb(floor(extract(epoch FROM (SELECT disconnected_at+interval '60 seconds' FROM public.room_members WHERE room_id=$2 AND user_id=$3))*1000)::bigint)) WHERE id=$1",
      [s.matchId, s.roomId, s.red],
    );
    await new DisconnectWorker(matches, port()).tick();
    expect((await outcome(s)).outcome.reason).toBe("TIMEOUT");
    const t = await setup();
    await offline(t, 61);
    await pool.query(
      "UPDATE public.room_members SET disconnected_at=(SELECT disconnected_at FROM public.room_members WHERE room_id=$1 AND user_id=$2) WHERE room_id=$1",
      [t.roomId, t.red],
    );
    await new DisconnectWorker(matches, port()).tick();
    expect((await outcome(t)).outcome).toEqual({
      reason: "DRAW_SIMULTANEOUS_DISCONNECT",
      winner: null,
    });
    await expect(
      apply(
        "supabase/rollback/20261103000007_match_simultaneous_disconnect.sql",
      ),
    ).rejects.toThrow("Simultaneous disconnect outcomes exist");
  });
  it("rechecks current match, connection presence and required actor locks", async () => {
    const s = await setup();
    await offline(s, 61);
    const candidates = await read((c) => dueDisconnectMatches(c));
    const p = port();
    p.dueMatches = async () => candidates;
    const original = p.withMatch;
    p.withMatch = (candidate, work) =>
      original(candidate, (scope) =>
        work({ ...scope, lockedActorIds: new Set() }),
      );
    await expect(new DisconnectWorker(matches, p).tick()).rejects.toThrow();
    expect((await outcome(s)).status).toBe("ACTIVE");
    p.withMatch = original;
    await pool.query(
      "INSERT INTO xiangqi_room.presence(room_id,user_id,connection_id,generation,server_instance,connected,last_seen_at) VALUES($1,$2,'current',1,$3,true,clock_timestamp())",
      [s.roomId, s.red, randomUUID()],
    );
    await new DisconnectWorker(matches, p).tick();
    expect((await outcome(s)).status).toBe("ACTIVE");
    await pool.query(
      "UPDATE public.rooms SET status='WAITING',current_match_id=NULL WHERE id=$1",
      [s.roomId],
    );
    await new DisconnectWorker(matches, p).tick();
    expect((await outcome(s)).status).toBe("ACTIVE");
  });
  it("adjudicates Guest principals", async () => {
    const s = await setup(true);
    await offline(s, 61);
    await new DisconnectWorker(matches, port()).tick();
    expect((await outcome(s)).outcome).toEqual({
      reason: "DISCONNECT",
      winner: "BLACK",
    });
  });
  it.each([false, true, "mixed"] as const)(
    "distinguishes equal and microsecond-apart disconnects for principals %s",
    async (guest) => {
      for (const delta of [0, 1, -1]) {
        const s = await setup(guest);
        await pool.query(
          `UPDATE public.room_members SET disconnected_at = date_trunc('milliseconds', statement_timestamp() - interval '61 seconds') +
          CASE WHEN user_id=$2 THEN interval '0 microseconds' ELSE $3::int * interval '1 microsecond' END
         WHERE room_id=$1`,
          [s.roomId, s.red, delta],
        );
        const before = Date.now();
        await new DisconnectWorker(matches, port()).tick();
        const after = Date.now();
        expect((await outcome(s)).outcome).toEqual(
          delta === 0
            ? { reason: "DRAW_SIMULTANEOUS_DISCONNECT", winner: null }
            : { reason: "DISCONNECT", winner: delta > 0 ? "BLACK" : "RED" },
        );
        expect(
          (
            await pool.query(
              "SELECT count(*)::int AS n FROM public.match_events WHERE match_id=$1 AND type='RESULT'",
              [s.matchId],
            )
          ).rows[0].n,
        ).toBe(1);
        const stored = (
          await pool.query("SELECT ended_at FROM public.matches WHERE id=$1", [
            s.matchId,
          ])
        ).rows[0];
        expect(stored.ended_at.getTime()).toBeGreaterThanOrEqual(before);
        expect(stored.ended_at.getTime()).toBeLessThanOrEqual(after);
      }
    },
  );
  it.each([true, false])(
    "arbitrates inactivity against disconnect regardless of worker order (%s)",
    async (clockFirst) => {
      for (const offset of [-1, 0, 1]) {
        const s = await setup("mixed", 0);
        await pool.query(
          `UPDATE public.room_members SET disconnected_at =
          to_timestamp(((SELECT (clock->>'runningSinceEpochMs')::bigint FROM public.matches WHERE id=$3) + 210000 + $4 - 60000)::numeric / 1000)
         WHERE room_id=$1 AND user_id=$2`,
          [s.roomId, s.red, s.matchId, offset],
        );
        const clockWorker = new ClockWorker(clock, matches, port(dueMatches));
        const disconnectWorker = new DisconnectWorker(matches, port());
        if (clockFirst) {
          await clockWorker.tick();
          await disconnectWorker.tick();
        } else {
          await disconnectWorker.tick();
          await clockWorker.tick();
        }
        expect((await outcome(s)).outcome.reason).toBe(
          offset <= 0 ? "DISCONNECT" : "INACTIVITY",
        );
      }
    },
  );
  it("rejects malformed cursor/candidate and cross-room transaction scopes", async () => {
    await expect(
      read((c) =>
        dueDisconnectMatches(c, {
          deadlineEpochMs: "bad",
          matchId: randomUUID(),
        }),
      ),
    ).rejects.toThrow("CLOCK_INVALID_STATE");
    const s = await setup();
    await offline(s, 61);
    const p = port();
    const original = p.withMatch;
    p.withMatch = (candidate, work) =>
      original(candidate, (scope) => work({ ...scope, roomId: randomUUID() }));
    await expect(new DisconnectWorker(matches, p).tick()).rejects.toThrow();
    expect((await outcome(s)).status).toBe("ACTIVE");
    p.dueMatches = async () => [
      { roomId: "invalid", matchId: s.matchId, deadlineEpochMs: "1" },
    ];
    p.withMatch = (_candidate, work) =>
      transaction([s.red, s.black], [s.roomId], (client) =>
        work({
          client,
          roomId: s.roomId,
          matchId: s.matchId,
          lockedActorIds: new Set([s.red, s.black]),
          lockedRoomIds: new Set([s.roomId]),
        }),
      );
    await expect(new DisconnectWorker(matches, p).tick()).rejects.toThrow();
    await pool.query(
      "UPDATE public.room_members SET disconnected_at=NULL WHERE room_id=$1",
      [s.roomId],
    );
  });
  it("advances past fifty failed oldest rows and adjudicates row 51", async () => {
    await reset();
    await apply("supabase/migrations/20261011000007_match_outcomes.sql");
    await apply("supabase/migrations/20261102000003_unlimited_inactivity.sql");
    await apply("supabase/migrations/20261103000005_match_aborted.sql");
    await apply("supabase/migrations/20261103000006_online_undo.sql");
    await apply(
      "supabase/migrations/20261103000007_match_simultaneous_disconnect.sql",
    );
    await apply("supabase/migrations/20261011000010_room_chat.sql");
    await apply("supabase/migrations/20261011000014_friendships.sql");
    await apply("supabase/migrations/20261102000004_direct_messages.sql");
    await apply("supabase/migrations/20261103000009_yc7_chat_quota.sql");
    await apply("supabase/migrations/20261103000010_media_generation.sql");
    await apply("supabase/migrations/20261103000011_yc9_ranked.sql");
    const bad = [];
    for (let i = 0; i < 50; i++) {
      const s = await setup();
      await offline(s, 120);
      await pool.query(
        "UPDATE public.match_events SET payload=jsonb_set(payload,'{initialPosition}','{}') WHERE match_id=$1 AND version=0",
        [s.matchId],
      );
      bad.push(s);
    }
    const good = await setup();
    await offline(good, 61);
    const worker = new DisconnectWorker(matches, port());
    await expect(worker.tick()).rejects.toThrow();
    await worker.tick();
    expect((await outcome(good)).outcome.reason).toBe("DISCONNECT");
    expect((await outcome(bad[0]!)).status).toBe("ACTIVE");
  });
});
