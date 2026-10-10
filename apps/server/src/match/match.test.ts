import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import {
  initialPosition,
  parsePosition,
  serializePosition,
} from "@xiangqi/xiangqi-core";
import type { PoolClient } from "pg";
import {
  actor,
  apply,
  databaseUrl,
  pool,
  reset,
  transaction,
} from "./match.test-helper.js";
import * as implementation from "./match-store.js";
import { encodePosition } from "./position-codec.js";
import {
  noCaptureInitial,
  noCaptureFinal,
  noCaptureMoves,
} from "./fixtures.js";
import type { ClockPort, MatchScope } from "./contracts.js";

// Synthetic port tests ordering/persistence. T23 supplies the real clock/worker.
const at = new Date("2030-01-01T00:00:00.000Z");
const clock: ClockPort = {
  start: vi.fn((seconds, time) => ({
    redMs: seconds * 1000,
    blackMs: seconds * 1000,
    runningSinceEpochMs: time.getTime(),
  })),
  beforeAction: vi.fn((clock) => ({ clock, expired: null })),
  afterMove: vi.fn((clock, _, time) => ({
    ...clock,
    runningSinceEpochMs: time.getTime(),
  })),
};
const end = {
  onMatchEnded: vi.fn(
    async (c: PoolClient, input: { roomId: string; matchId: string }) => {
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
  ),
};
let red: string, black: string, viewer: string;
async function setup() {
  red = (await actor()).userId;
  black = (await actor()).userId;
  viewer = (await actor()).userId;
  const room = randomUUID(),
    token = randomUUID();
  await transaction([red, black], [room], async (c) => {
    await c.query(
      "INSERT INTO public.rooms(id,owner_id,name,time_control) VALUES($1,$2,'Synthetic Board',600)",
      [room, red],
    );
    await c.query(
      "INSERT INTO public.room_members(room_id,user_id,role,side,ready) VALUES($1,$2,'PLAYER','RED',true),($1,$3,'PLAYER','BLACK',true),($1,$4,'SPECTATOR',NULL,false)",
      [room, red, black, viewer],
    );
    await c.query(
      "INSERT INTO public.active_players(user_id,room_id) VALUES($1,$3),($2,$3)",
      [red, black, room],
    );
    await c.query(
      "INSERT INTO xiangqi_room.countdowns(room_id,token,due_at,red_id,black_id) VALUES($1,$2,$3,$4,$5)",
      [room, token, at, red, black],
    );
  });
  return { room, token };
}
function store() {
  return new implementation.MatchStore(clock, end, () => at);
}
async function start() {
  const fixture = await setup();
  const result = await transaction([red, black], [fixture.room], async (c) => {
    const r = await store().start(c, {
      roomId: fixture.room,
      startToken: fixture.token,
      redId: red,
      blackId: black,
      timeControlSeconds: 600,
      startedAt: at,
    });
    await c.query(
      "UPDATE public.rooms SET status='PLAYING',current_match_id=$2 WHERE id=$1",
      [fixture.room, r.matchId],
    );
    await c.query(
      "UPDATE public.active_players SET match_id=$2 WHERE room_id=$1",
      [fixture.room, r.matchId],
    );
    return r;
  });
  return { ...fixture, ...result };
}
async function run<T>(
  room: string,
  user: string,
  fn: (scope: MatchScope) => Promise<T>,
  canControl = true,
) {
  return transaction([red, black, user], [room], (c) =>
    fn({
      client: c,
      actor: { userId: user, kind: "guest" },
      roomId: room,
      canControl,
      lockedActorIds: new Set([red, black, user]),
      lockedRoomIds: new Set([room]),
    }),
  );
}
async function tactical(fen: string) {
  const s = await start();
  await pool.query("UPDATE public.matches SET position=$2 WHERE id=$1", [
    s.matchId,
    encodePosition(parsePosition(fen)),
  ]);
  await pool.query(
    "UPDATE public.match_events SET payload=jsonb_set(payload,'{initialPosition}',$2::jsonb) WHERE match_id=$1 AND version=0",
    [s.matchId, JSON.stringify(encodePosition(parsePosition(fen)))],
  );
  return s;
}
describe.skipIf(!databaseUrl)("match transactions", () => {
  beforeAll(async () => {
    await reset();
    await apply("supabase/migrations/20261011000007_match_outcomes.sql");
    red = (await actor()).userId;
    black = (await actor()).userId;
    viewer = (await actor()).userId;
  });
  afterAll(() => pool.end());
  it("exports the approved MatchStore contract", () =>
    expect(implementation.MatchStore).toBeTypeOf("function"));
  it("starts with initial board and replayable START on the same client; retry token is idempotent", async () => {
    const s = await start();
    const snapshot = await pool.connect();
    try {
      expect(await store().snapshot(snapshot, s.room, s.matchId)).toMatchObject(
        {
          version: 0,
          ply: 0,
          turn: "red",
          position: serializePosition(initialPosition()),
          status: "ACTIVE",
          clock: { redMs: 600000, blackMs: 600000 },
        },
      );
    } finally {
      snapshot.release();
    }
    const repeat = await transaction([red, black], [s.room], (c) =>
      store().start(c, {
        roomId: s.room,
        startToken: s.token,
        redId: red,
        blackId: black,
        timeControlSeconds: 600,
        startedAt: at,
      }),
    );
    expect(repeat.matchId).toBe(s.matchId);
    await expect(
      transaction([red, black], [s.room], (c) =>
        store().start(c, {
          roomId: s.room,
          startToken: s.token,
          redId: black,
          blackId: red,
          timeControlSeconds: 600,
          startedAt: at,
        }),
      ),
    ).rejects.toMatchObject({ code: "MATCH_START_CONFLICT" });
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM public.match_events WHERE match_id=$1",
          [s.matchId],
        )
      ).rows[0].n,
    ).toBe(1);
  });
  it("fails closed without ClockPort and inserts no match", async () => {
    const s = await setup();
    await expect(
      transaction([red, black], [s.room], (c) =>
        new implementation.MatchStore(undefined, end, () => at).start(c, {
          roomId: s.room,
          startToken: s.token,
          redId: red,
          blackId: black,
          timeControlSeconds: 600,
          startedAt: at,
        }),
      ),
    ).rejects.toMatchObject({ code: "MATCH_CLOCK_UNAVAILABLE" });
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM public.matches WHERE room_id=$1",
          [s.room],
        )
      ).rows[0].n,
    ).toBe(0);
  });
  it("persists an actual pawn move, canonical coordinates and effective branch", async () => {
    const s = await start();
    const r = await run(s.room, red, (scope) =>
      store().move(scope, {
        matchId: s.matchId,
        matchVersion: 0,
        from: 54,
        to: 45,
      }),
    );
    expect(r).toMatchObject({
      applied: true,
      match: {
        version: 1,
        ply: 1,
        turn: "black",
        position:
          "rnbakabnr/9/1c5c1/p1p1p1p1p/9/P8/2P1P1P1P/1C5C1/9/RNBAKABNR b - - 1 1",
      },
    });
    const m = (
      await pool.query(
        "SELECT move,parent_move_id,side FROM public.match_moves WHERE match_id=$1",
        [s.matchId],
      )
    ).rows;
    expect(m).toEqual([
      {
        move: { from: { x: 0, y: 6 }, to: { x: 0, y: 5 } },
        parent_move_id: null,
        side: "RED",
      },
    ]);
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM public.moves WHERE match_id=$1",
          [s.matchId],
        )
      ).rows[0].n,
    ).toBe(0);
  });
  it("rejects spectators, readonly tabs, malformed input, wrong identity/version/turn and illegal moves without writes", async () => {
    const s = await start();
    const action = { matchId: s.matchId, matchVersion: 0, from: 54, to: 45 };
    await expect(
      run(s.room, viewer, (scope) => store().move(scope, action)),
    ).rejects.toMatchObject({ code: "MATCH_PLAYER_REQUIRED" });
    await expect(
      run(s.room, red, (scope) => store().move(scope, action), false),
    ).rejects.toMatchObject({ code: "MATCH_READ_ONLY" });
    await expect(
      run(s.room, red, (scope) => store().move(scope, { ...action, from: 90 })),
    ).rejects.toMatchObject({ code: "MATCH_INVALID_INPUT" });
    await expect(
      run(s.room, red, (scope) =>
        store().move(scope, { ...action, matchId: randomUUID() }),
      ),
    ).rejects.toMatchObject({ code: "MATCH_ID_MISMATCH" });
    for (const [user, input, code] of [
      [red, { ...action, matchVersion: 9 }, "MATCH_VERSION_CONFLICT"],
      [black, action, "MATCH_NOT_YOUR_TURN"],
      [red, { ...action, to: 36 }, "MATCH_ILLEGAL_MOVE"],
    ] as const) {
      expect(
        await run(s.room, user, (scope) => store().move(scope, input)),
      ).toMatchObject({
        applied: false,
        error: { code },
        match: { version: 0, ply: 0 },
      });
    }
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM public.match_moves WHERE match_id=$1",
          [s.matchId],
        )
      ).rows[0].n,
    ).toBe(0);
  });
  it("rolls back move/event/position/outbox when the surrounding receipt write fails", async () => {
    const s = await start();
    await expect(
      run(s.room, red, async (scope) => {
        await store().move(scope, {
          matchId: s.matchId,
          matchVersion: 0,
          from: 54,
          to: 45,
        });
        throw new Error("receipt failure");
      }),
    ).rejects.toThrow("receipt failure");
    expect(
      (
        await pool.query("SELECT ply,version FROM public.matches WHERE id=$1", [
          s.matchId,
        ])
      ).rows[0],
    ).toEqual({ ply: 0, version: "0" });
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM public.match_moves WHERE match_id=$1",
          [s.matchId],
        )
      ).rows[0].n,
    ).toBe(0);
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM xiangqi_room.outbox WHERE room_id=$1",
          [s.room],
        )
      ).rows[0].n,
    ).toBe(0);
  });
  it.each([
    ["CHECKMATE", "4k4/3R1R3/4P4/9/9/9/9/9/9/4K4 w - - 119 1", 22, 13],
    ["STALEMATE", "4k4/3R1R3/9/4P4/9/9/9/9/9/4K4 w - - 119 1", 31, 22],
  ] as const)(
    "adjudicates %s through a real move before simultaneous120 draw",
    async (reason, fen, from, to) => {
      const s = await tactical(fen);
      const r = await run(s.room, red, (scope) =>
        store().move(scope, { matchId: s.matchId, matchVersion: 0, from, to }),
      );
      expect(r).toMatchObject({
        applied: true,
        match: {
          status: "FINISHED",
          version: 2,
          ply: 1,
          outcome: { reason, winner: "red" },
        },
      });
      expect(
        (
          await pool.query(
            "SELECT version,type FROM public.match_events WHERE match_id=$1 ORDER BY version",
            [s.matchId],
          )
        ).rows,
      ).toEqual([
        { version: "0", type: "START" },
        { version: "1", type: "MOVE" },
        { version: "2", type: "RESULT" },
      ]);
      expect(
        (
          await pool.query(
            "SELECT status,current_match_id FROM public.rooms WHERE id=$1",
            [s.room],
          )
        ).rows[0],
      ).toEqual({ status: "WAITING", current_match_id: null });
      expect(
        (
          await pool.query(
            "SELECT ready FROM public.room_members WHERE room_id=$1",
            [s.room],
          )
        ).rows.every((row) => !row.ready),
      ).toBe(true);
      expect(
        (
          await pool.query(
            "SELECT match_id FROM public.active_players WHERE room_id=$1",
            [s.room],
          )
        ).rows.every((row) => row.match_id === null),
      ).toBe(true);
    },
  );
  it("rolls back terminal result when room end callback fails", async () => {
    const s = await tactical("4k4/3R1R3/4P4/9/9/9/9/9/9/4K4 w - - 119 1");
    const broken = new implementation.MatchStore(
      clock,
      {
        onMatchEnded: async () => {
          throw new Error("room callback failure");
        },
      },
      () => at,
    );
    await expect(
      run(s.room, red, (scope) =>
        broken.move(scope, {
          matchId: s.matchId,
          matchVersion: 0,
          from: 22,
          to: 13,
        }),
      ),
    ).rejects.toThrow("room callback failure");
    expect(
      (
        await pool.query("SELECT status,ply FROM public.matches WHERE id=$1", [
          s.matchId,
        ])
      ).rows[0],
    ).toEqual({ status: "ACTIVE", ply: 0 });
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM public.match_events WHERE match_id=$1",
          [s.matchId],
        )
      ).rows[0].n,
    ).toBe(1);
  });
  it("checks timeout before a potentially mating move, records RESULT only and preserves terminal on retry", async () => {
    const s = await tactical("4k4/3R1R3/4P4/9/9/9/9/9/9/4K4 w - - 119 1");
    const expiring = {
      ...clock,
      beforeAction: () => ({
        clock: { redMs: 0, blackMs: 600000, runningSinceEpochMs: at.getTime() },
        expired: "red" as const,
      }),
    };
    const m = new implementation.MatchStore(expiring, end, () => at);
    expect(
      await run(s.room, red, (scope) =>
        m.move(scope, {
          matchId: s.matchId,
          matchVersion: 0,
          from: 22,
          to: 13,
        }),
      ),
    ).toMatchObject({
      applied: false,
      error: { code: "MATCH_TIME_EXPIRED" },
      match: {
        version: 1,
        ply: 0,
        outcome: { reason: "TIMEOUT", winner: "black" },
      },
    });
    const later = await transaction([red, black], [s.room], (c) =>
      m.finish(c, {
        roomId: s.room,
        matchId: s.matchId,
        outcome: { reason: "RESIGN", winner: "red" },
        at,
      }),
    );
    expect(later.outcome).toEqual({ reason: "TIMEOUT", winner: "black" });
    expect(
      (
        await pool.query(
          "SELECT type FROM public.match_events WHERE match_id=$1 ORDER BY version",
          [s.matchId],
        )
      ).rows,
    ).toEqual([{ type: "START" }, { type: "RESULT" }]);
  });
  it("resignation is allowed for the player off turn, and restart is neutral INTERRUPTED", async () => {
    const s = await start();
    expect(
      await run(s.room, black, (scope) =>
        store().resign(scope, { matchId: s.matchId, matchVersion: 0 }),
      ),
    ).toMatchObject({
      applied: true,
      match: {
        outcome: { reason: "RESIGN", winner: "red" },
        status: "FINISHED",
      },
    });
    const t = await start();
    expect(
      await transaction([red, black], [t.room], (c) =>
        store().finish(c, {
          roomId: t.room,
          matchId: t.matchId,
          outcome: { reason: "SERVER_RESTART", winner: null },
          at,
        }),
      ),
    ).toMatchObject({
      status: "INTERRUPTED",
      outcome: { reason: "SERVER_RESTART", winner: null },
    });
  });
  it.each([
    [
      "DRAW_REPETITION",
      null,
      "4k4/3R5/9/9/9/4P4/9/9/9/4K4 w - - 0 1",
      [
        [12, 21],
        [4, 5],
        [21, 12],
        [5, 4],
      ],
    ],
    [
      "PERPETUAL_CHECK",
      "black",
      "4k4/3R5/9/9/9/4P4/9/9/9/4K4 w - - 112 1",
      [
        [12, 13],
        [4, 3],
        [13, 12],
        [3, 4],
      ],
    ],
    [
      "PERPETUAL_CHECK",
      null,
      "3k5/9/5r3/9/9/5c3/5N3/9/9/3C1K3 w - - 0 1",
      [
        [59, 66],
        [50, 48],
        [66, 59],
        [48, 50],
      ],
    ],
  ] as const)(
    "adjudicates actual first-to-third legal cycle %s/%s",
    async (reason, winner, fen, cycle) => {
      const s = await tactical(fen);
      let result;
      for (const [i, [from, to]] of [...cycle, ...cycle].entries()) {
        result = await run(s.room, i % 2 === 0 ? red : black, (scope) =>
          store().move(scope, {
            matchId: s.matchId,
            matchVersion: i,
            from,
            to,
          }),
        );
        expect(result.applied).toBe(true);
        expect(result.match.status).toBe(i === 7 ? "FINISHED" : "ACTIVE");
      }
      expect(result!.match).toMatchObject({
        version: 9,
        ply: 8,
        outcome: { reason, winner },
      });
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM public.match_moves WHERE match_id=$1",
            [s.matchId],
          )
        ).rows[0].n,
      ).toBe(8);
    },
  );
  it("replays all120 literal non-capture plies, without an earlier repetition, and ends at independent final FEN", async () => {
    const s = await tactical(noCaptureInitial);
    let result;
    for (const [i, [from, to]] of noCaptureMoves.entries()) {
      result = await run(s.room, i % 2 === 0 ? red : black, (scope) =>
        store().move(scope, { matchId: s.matchId, matchVersion: i, from, to }),
      );
      expect(result.applied).toBe(true);
      expect(result.match.status).toBe(i === 119 ? "FINISHED" : "ACTIVE");
    }
    expect(result!.match).toMatchObject({
      ply: 120,
      version: 121,
      position: noCaptureFinal,
      outcome: { reason: "DRAW_NO_CAPTURE", winner: null },
    });
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM public.match_moves WHERE match_id=$1",
          [s.matchId],
        )
      ).rows[0].n,
    ).toBe(120);
  }, 30000);
  it("a real capture resets the120-ply counter instead of drawing", async () => {
    const s = await tactical("4k4/9/9/Rr7/9/4P4/9/9/9/4K4 w - - 119 1");
    const result = await run(s.room, red, (scope) =>
      store().move(scope, {
        matchId: s.matchId,
        matchVersion: 0,
        from: 27,
        to: 28,
      }),
    );
    expect(result.match).toMatchObject({
      status: "ACTIVE",
      position: "4k4/9/9/1R7/9/4P4/9/9/9/4K4 b - - 0 1",
      outcome: null,
    });
  });
  it("fails closed on corrupted persisted position, missing clock and missing actor lock", async () => {
    const s = await start();
    const input = { matchId: s.matchId, matchVersion: 0, from: 54, to: 45 };
    await expect(
      run(s.room, red, (scope) =>
        new implementation.MatchStore(undefined, end, () => at).move(
          scope,
          input,
        ),
      ),
    ).rejects.toMatchObject({ code: "MATCH_CLOCK_UNAVAILABLE" });
    await expect(
      run(s.room, red, (scope) =>
        store().move({ ...scope, lockedActorIds: new Set([red]) }, input),
      ),
    ).rejects.toMatchObject({ code: "MATCH_LOCK_REQUIRED" });
    await pool.query(
      "UPDATE public.matches SET position=jsonb_set(position,'{halfmove}','91') WHERE id=$1",
      [s.matchId],
    );
    await expect(
      run(s.room, red, (scope) => store().move(scope, input)),
    ).rejects.toMatchObject({ code: "MATCH_HISTORY_CORRUPT" });
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM public.match_moves WHERE match_id=$1",
          [s.matchId],
        )
      ).rows[0].n,
    ).toBe(0);
  });
  it("serializes two concurrent same-version moves to one durable MOVE and one conflict", async () => {
    const s = await start(),
      action = { matchId: s.matchId, matchVersion: 0, from: 54, to: 45 };
    const results = await Promise.all([
      run(s.room, red, (scope) => store().move(scope, action)),
      run(s.room, red, (scope) => store().move(scope, action)),
    ]);
    expect(results.filter((r) => r.applied)).toHaveLength(1);
    expect(results.find((r) => !r.applied)?.error?.code).toBe(
      "MATCH_VERSION_CONFLICT",
    );
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM public.match_moves WHERE match_id=$1",
          [s.matchId],
        )
      ).rows[0].n,
    ).toBe(1);
  });
  it("rejects a managed START with identity metadata inconsistent with its match row", async () => {
    const s = await start();
    await pool.query(
      "UPDATE public.match_events SET payload=jsonb_set(payload,'{roomId}',to_jsonb($2::text)) WHERE match_id=$1 AND version=0",
      [s.matchId, randomUUID()],
    );
    await expect(
      run(s.room, red, (scope) =>
        store().move(scope, {
          matchId: s.matchId,
          matchVersion: 0,
          from: 54,
          to: 45,
        }),
      ),
    ).rejects.toMatchObject({ code: "MATCH_HISTORY_CORRUPT" });
  });
  it("rejects an ACTIVE persisted branch that already ended by core rules", async () => {
    const s = await tactical("4k4/8r/9/R8/9/4P4/9/9/9/4K4 w - - 120 1");
    await expect(
      run(s.room, red, (scope) =>
        store().move(scope, {
          matchId: s.matchId,
          matchVersion: 0,
          from: 27,
          to: 28,
        }),
      ),
    ).rejects.toMatchObject({ code: "MATCH_HISTORY_CORRUPT" });
  });

  it.each(["match_events", "match_moves", "matches", "outbox"])(
    "rolls back all effects when %s storage fails",
    async (table) => {
      const s = await start(),
        schema = table === "outbox" ? "xiangqi_room" : "public";
      await pool.query(
        "CREATE OR REPLACE FUNCTION public.synthetic_match_failure() RETURNS trigger LANGUAGE plpgsql AS $$BEGIN RAISE EXCEPTION 'injected persistence failure';END$$",
      );
      await pool.query(
        `CREATE TRIGGER synthetic_failure BEFORE ${table === "matches" ? "UPDATE" : "INSERT"} ON ${schema}.${table} FOR EACH ROW EXECUTE FUNCTION public.synthetic_match_failure()`,
      );
      try {
        await expect(
          run(s.room, red, (scope) =>
            store().move(scope, {
              matchId: s.matchId,
              matchVersion: 0,
              from: 54,
              to: 45,
            }),
          ),
        ).rejects.toThrow("injected persistence failure");
      } finally {
        await pool.query(
          `DROP TRIGGER synthetic_failure ON ${schema}.${table}`,
        );
        await pool.query("DROP FUNCTION public.synthetic_match_failure()");
      }
      expect(
        (
          await pool.query(
            "SELECT status,ply,version FROM public.matches WHERE id=$1",
            [s.matchId],
          )
        ).rows[0],
      ).toEqual({ status: "ACTIVE", ply: 0, version: "0" });
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM public.match_events WHERE match_id=$1",
            [s.matchId],
          )
        ).rows[0].n,
      ).toBe(1);
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM public.match_moves WHERE match_id=$1",
            [s.matchId],
          )
        ).rows[0].n,
      ).toBe(0);
      expect(
        (
          await pool.query(
            "SELECT room_version FROM public.rooms WHERE id=$1",
            [s.room],
          )
        ).rows[0].room_version,
      ).toBe("0");
    },
  );
  it("an outbox error rolls back the terminal room transition and ready/reservation state", async () => {
    const s = await tactical("4k4/3R1R3/4P4/9/9/9/9/9/9/4K4 w - - 119 1");
    await pool.query(
      "CREATE FUNCTION public.synthetic_match_failure() RETURNS trigger LANGUAGE plpgsql AS $$BEGIN RAISE EXCEPTION 'injected result outbox failure';END$$; CREATE TRIGGER synthetic_failure BEFORE INSERT ON xiangqi_room.outbox FOR EACH ROW EXECUTE FUNCTION public.synthetic_match_failure()",
    );
    try {
      await expect(
        run(s.room, red, (scope) =>
          store().move(scope, {
            matchId: s.matchId,
            matchVersion: 0,
            from: 22,
            to: 13,
          }),
        ),
      ).rejects.toThrow("injected result outbox failure");
    } finally {
      await pool.query(
        "DROP TRIGGER synthetic_failure ON xiangqi_room.outbox; DROP FUNCTION public.synthetic_match_failure()",
      );
    }
    expect(
      (
        await pool.query(
          "SELECT status,current_match_id,room_version FROM public.rooms WHERE id=$1",
          [s.room],
        )
      ).rows[0],
    ).toEqual({
      status: "PLAYING",
      current_match_id: s.matchId,
      room_version: "0",
    });
    expect(
      (
        await pool.query(
          "SELECT ready FROM public.room_members WHERE room_id=$1 AND role='PLAYER'",
          [s.room],
        )
      ).rows.every((row) => row.ready),
    ).toBe(true);
    expect(
      (
        await pool.query(
          "SELECT match_id FROM public.active_players WHERE room_id=$1",
          [s.room],
        )
      ).rows.every((row) => row.match_id === s.matchId),
    ).toBe(true);
    expect(
      (
        await pool.query("SELECT status,ply FROM public.matches WHERE id=$1", [
          s.matchId,
        ])
      ).rows[0],
    ).toEqual({ status: "ACTIVE", ply: 0 });
  });
  it("concurrent resign and trusted server end keep one immutable result/event", async () => {
    const s = await start();
    const results = await Promise.all([
      run(s.room, black, (scope) =>
        store().resign(scope, { matchId: s.matchId, matchVersion: 0 }),
      ),
      transaction([red, black], [s.room], (c) =>
        store().finish(c, {
          roomId: s.room,
          matchId: s.matchId,
          outcome: { reason: "DISCONNECT", winner: "black" },
          at,
        }),
      ),
    ]);
    const first = "match" in results[0]! ? results[0].match : results[0];
    expect(first.outcome).toEqual(results[1].outcome);
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM public.match_events WHERE match_id=$1 AND type='RESULT'",
          [s.matchId],
        )
      ).rows[0].n,
    ).toBe(1);
    const persisted = (
      await pool.query(
        "SELECT outcome,ended_at FROM public.matches WHERE id=$1",
        [s.matchId],
      )
    ).rows[0];
    const published = (
      await pool.query(
        "SELECT payload FROM xiangqi_room.outbox WHERE room_id=$1 AND type='MATCH_RESULT'",
        [s.room],
      )
    ).rows[0].payload;
    expect(published.outcome).toEqual(first.outcome);
    expect(published.endedAt).toBe(persisted.ended_at.toISOString());
    expect(persisted.outcome.winner).toBe(first.outcome?.winner?.toUpperCase());
  });
  it("rejects a move exposing facing generals without switching clock", async () => {
    const s = await tactical("4k4/9/9/9/9/4R4/9/9/9/4K4 w - - 0 1");
    const switched = vi.mocked(clock.afterMove).mock.calls.length;
    const result = await run(s.room, red, (scope) =>
      store().move(scope, {
        matchId: s.matchId,
        matchVersion: 0,
        from: 49,
        to: 48,
      }),
    );
    expect(result).toMatchObject({
      applied: false,
      error: { code: "MATCH_ILLEGAL_MOVE" },
      match: { ply: 0, turn: "red" },
    });
    expect(vi.mocked(clock.afterMove).mock.calls.length).toBe(switched);
  });
  it("terminal snapshot refuses a RESULT event inconsistent with immutable outcome", async () => {
    const s = await start();
    await run(s.room, black, (scope) =>
      store().resign(scope, { matchId: s.matchId, matchVersion: 0 }),
    );
    await pool.query(
      "UPDATE public.match_events SET payload=jsonb_set(payload,'{outcome,winner}','\"BLACK\"') WHERE match_id=$1 AND type='RESULT'",
      [s.matchId],
    );
    const c = await pool.connect();
    try {
      await expect(
        store().snapshot(c, s.room, s.matchId),
      ).rejects.toMatchObject({ code: "MATCH_HISTORY_CORRUPT" });
    } finally {
      c.release();
    }
  });
  it("effective branch excludes abandoned checking cycle and retains the selected parent chain", async () => {
    const s = await tactical("4k4/3R5/9/9/9/4P4/9/9/9/4K4 w - - 0 1");
    const cycle = [
      [12, 13],
      [4, 3],
      [13, 12],
      [3, 4],
    ] as const;
    for (const [i, [from, to]] of cycle.entries())
      await run(s.room, i % 2 === 0 ? red : black, (scope) =>
        store().move(scope, { matchId: s.matchId, matchVersion: i, from, to }),
      );
    // Synthetic UNDO projection: real MOVE rows/events remain, selected branch resets to START.
    const initial = encodePosition(
      parsePosition("4k4/3R5/9/9/9/4P4/9/9/9/4K4 w - - 0 1"),
    );
    await pool.query(
      "UPDATE public.matches SET active_move_ids='[]',ply=0,position=$2,version=5 WHERE id=$1",
      [s.matchId, initial],
    );
    await pool.query(
      "INSERT INTO public.match_events(match_id,version,type,payload) VALUES($1,5,'UNDO','{}')",
      [s.matchId],
    );
    let result;
    for (const [i, [from, to]] of cycle.entries())
      result = await run(s.room, i % 2 === 0 ? red : black, (scope) =>
        store().move(scope, {
          matchId: s.matchId,
          matchVersion: i + 5,
          from,
          to,
        }),
      );
    expect(result!.match).toMatchObject({
      status: "ACTIVE",
      ply: 4,
      version: 9,
      outcome: null,
    });
    const moves = (
      await pool.query(
        "SELECT m.parent_move_id FROM public.match_moves m JOIN public.matches x ON m.id=(x.active_move_ids->>0)::uuid WHERE x.id=$1",
        [s.matchId],
      )
    ).rows;
    expect(moves).toEqual([{ parent_move_id: null }]);
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM public.match_moves WHERE match_id=$1",
          [s.matchId],
        )
      ).rows[0].n,
    ).toBe(8);
  });
  it("a new match in the same room has fresh clock and rejects delayed prior-match commands", async () => {
    const s = await start();
    await run(s.room, black, (scope) =>
      store().resign(scope, { matchId: s.matchId, matchVersion: 0 }),
    );
    const token = randomUUID();
    const nextId = await transaction([red, black], [s.room], async (c) => {
      await c.query(
        "UPDATE public.room_members SET ready=true WHERE room_id=$1 AND role='PLAYER'",
        [s.room],
      );
      await c.query(
        "UPDATE xiangqi_room.countdowns SET token=$2 WHERE room_id=$1",
        [s.room, token],
      );
      const next = await store().start(c, {
        roomId: s.room,
        startToken: token,
        redId: red,
        blackId: black,
        timeControlSeconds: 600,
        startedAt: at,
      });
      await c.query(
        "UPDATE public.rooms SET status='PLAYING',current_match_id=$2 WHERE id=$1",
        [s.room, next.matchId],
      );
      await c.query(
        "UPDATE public.active_players SET match_id=$2 WHERE room_id=$1",
        [s.room, next.matchId],
      );
      return next.matchId;
    });
    expect(nextId).not.toBe(s.matchId);
    await expect(
      run(s.room, red, (scope) =>
        store().move(scope, {
          matchId: s.matchId,
          matchVersion: 0,
          from: 54,
          to: 45,
        }),
      ),
    ).rejects.toMatchObject({ code: "MATCH_ID_MISMATCH" });
    const c = await pool.connect();
    try {
      expect(await store().snapshot(c, s.room, nextId)).toMatchObject({
        version: 0,
        ply: 0,
        clock: { redMs: 600000, blackMs: 600000 },
        status: "ACTIVE",
      });
    } finally {
      c.release();
    }
  });

  it("trusted TIMEOUT still requires actual clock expiry and opposite winner; persists zero without MOVE", async () => {
    const s = await start();
    const outcome = { reason: "TIMEOUT" as const, winner: "black" as const };
    await expect(
      transaction([red, black], [s.room], (c) =>
        store().finish(c, { roomId: s.room, matchId: s.matchId, outcome, at }),
      ),
    ).rejects.toMatchObject({ code: "MATCH_INVALID_OUTCOME" });
    await expect(
      transaction([red, black], [s.room], (c) =>
        new implementation.MatchStore(undefined, end, () => at).finish(c, {
          roomId: s.room,
          matchId: s.matchId,
          outcome,
          at,
        }),
      ),
    ).rejects.toMatchObject({ code: "MATCH_CLOCK_UNAVAILABLE" });
    const expiring: ClockPort = {
      ...clock,
      beforeAction: () => ({
        clock: { redMs: 0, blackMs: 600000, runningSinceEpochMs: at.getTime() },
        expired: "red",
      }),
    };
    const m = new implementation.MatchStore(expiring, end, () => at);
    await expect(
      transaction([red, black], [s.room], (c) =>
        m.finish(c, {
          roomId: s.room,
          matchId: s.matchId,
          outcome: { reason: "TIMEOUT", winner: "red" },
          at,
        }),
      ),
    ).rejects.toMatchObject({ code: "MATCH_INVALID_OUTCOME" });
    const result = await transaction([red, black], [s.room], (c) =>
      m.finish(c, { roomId: s.room, matchId: s.matchId, outcome, at }),
    );
    expect(result).toMatchObject({
      ply: 0,
      version: 1,
      status: "FINISHED",
      clock: { redMs: 0, blackMs: 600000 },
      outcome,
    });
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM public.match_moves WHERE match_id=$1",
          [s.matchId],
        )
      ).rows[0].n,
    ).toBe(0);
  });
});
