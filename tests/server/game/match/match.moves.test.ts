import { describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { databaseUrl, pool } from "./match.test-helper.js";
import {
  red,
  black,
  viewer,
  store,
  start,
  run,
  tactical,
  useMatchHooks,
} from "./match-store.test-helper.js";
describe.skipIf(!databaseUrl)("match transactions", () => {
  useMatchHooks();
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
          lastMove: { from, to, eventVersion: 1 },
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
});
