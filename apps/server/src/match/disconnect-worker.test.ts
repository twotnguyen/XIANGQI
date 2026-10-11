import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, describe, it, expect } from "vitest";
import {
  pool,
  databaseUrl,
  reset,
  apply,
  transaction,
} from "./match.test-helper.js";
import { MatchStore } from "./match-store.js";
import { ClockService } from "../clock/clock-service.js";
import { ClockWorker, dueMatches } from "../clock/clock-worker.js";
import { dueDisconnectMatches, DisconnectWorker } from "./disconnect-worker.js";
import type { ClockWorkerPort } from "../clock/contracts.js";
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
async function setup(guest = false) {
  const red = randomUUID(),
    black = randomUUID(),
    roomId = randomUUID(),
    token = randomUUID();
  for (const id of [red, black]) {
    if (guest) {
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
    (await pool.query("SELECT clock_timestamp() at")).rows[0].at,
  );
  const result = await transaction([red, black], [roomId], async (c) => {
    await c.query(
      "INSERT INTO public.rooms(id,owner_id,name,time_control,invite_code,viewer_limit) VALUES($1,$2,'Synthetic',600,$3,5)",
      [
        roomId,
        red,
        randomUUID()
          .replaceAll("-", "")
          .slice(0, 8)
          .toUpperCase()
          .replace(/[01IO]/g, "A"),
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
      timeControlSeconds: 600,
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
  });
  afterAll(() => pool.end());
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
  it("exact clock/grace tie is TIMEOUT; identical disconnect timestamps use stable UUID order", async () => {
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
    expect((await outcome(t)).outcome.winner).toBe(
      t.red < t.black ? "BLACK" : "RED",
    );
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
  it("fails closed for unsupported Guest principals", async () => {
    const s = await setup(true);
    await offline(s, 61);
    await expect(
      new DisconnectWorker(matches, port()).tick(),
    ).rejects.toThrow();
    expect((await outcome(s)).status).toBe("ACTIVE");
  });
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
