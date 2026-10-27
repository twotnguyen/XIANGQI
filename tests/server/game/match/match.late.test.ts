import { describe, expect, it, vi } from "vitest";
import { randomUUID } from "node:crypto";
import { ClockService } from "@server/game/clock/clock.service.js";
import { parsePosition } from "@xiangqi/xiangqi-core";
import { databaseUrl, pool, transaction } from "./match.test-helper.js";
import * as implementation from "@server/game/match/match-store.js";
import { encodePosition } from "@server/game/match/position-codec.js";
import type { ClockPort } from "@server/game/match/match.types.js";
import {
  at,
  clock,
  end,
  red,
  black,
  store,
  start,
  run,
  tactical,
  useMatchHooks,
} from "./match-store.test-helper.js";
describe.skipIf(!databaseUrl)("match transactions", () => {
  useMatchHooks();
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
    expect(
      await transaction([red, black], [s.room], (c) =>
        store().snapshot(c, s.room, s.matchId),
      ),
    ).toHaveProperty("lastMove", null);
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
      lastMove: { from: 3, to: 4, eventVersion: 9 },
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
  it.each([
    ["move", -70, "DISCONNECT", "RED"],
    ["resign", -70, "DISCONNECT", "RED"],
    ["move", -90, "TIMEOUT", "BLACK"],
    ["resign", -90, "TIMEOUT", "BLACK"],
  ] as const)(
    "late %s preserves earliest grace/clock result",
    async (action, clockOffset, reason, winner) => {
      const s = await start(new Date(Date.now() - 200000));
      await pool.query(
        "UPDATE public.rooms SET invite_code=$2,viewer_limit=5 WHERE id=$1",
        [
          s.room,
          randomUUID()
            .replaceAll("-", "")
            .slice(0, 8)
            .split("")
            .map((c) => parseInt(c, 16) % 10)
            .join(""),
        ],
      );
      await pool.query(
        "UPDATE public.matches SET clock=jsonb_set(jsonb_set(clock,'{redMs}','0'),'{runningSinceEpochMs}',to_jsonb(floor(extract(epoch FROM clock_timestamp())*1000)::bigint+$2)) WHERE id=$1",
        [s.matchId, clockOffset * 1000],
      );
      await pool.query(
        "UPDATE public.room_members SET disconnected_at=clock_timestamp()-interval '140 seconds' WHERE room_id=$1 AND user_id=$2",
        [s.room, black],
      );
      const actual = new implementation.MatchStore(new ClockService(), end);
      const result = await run(s.room, red, (scope) =>
        action === "move"
          ? actual.move(scope, {
              matchId: s.matchId,
              matchVersion: 0,
              from: 54,
              to: 45,
            })
          : actual.resign(scope, { matchId: s.matchId, matchVersion: 0 }),
      );
      expect(result.applied).toBe(false);
      expect(result.error?.code).toBe(
        reason === "DISCONNECT" ? "MATCH_FINISHED" : "MATCH_TIME_EXPIRED",
      );
      expect(result.match.outcome).toEqual({
        reason,
        winner: winner === "RED" ? "red" : "black",
      });
      expect(
        (
          await pool.query(
            "SELECT type FROM public.match_events WHERE match_id=$1 ORDER BY version",
            [s.matchId],
          )
        ).rows.map((r) => r.type),
      ).toEqual(["START", "RESULT"]);
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM xiangqi_room.outbox WHERE room_id=$1 AND type='MATCH_RESULT'",
            [s.room],
          )
        ).rows[0].n,
      ).toBe(1);
      const again = await run(s.room, red, (scope) =>
        actual.resign(scope, { matchId: s.matchId, matchVersion: 1 }),
      );
      expect(again.error?.code).toBe("MATCH_FINISHED");
    },
  );
});
