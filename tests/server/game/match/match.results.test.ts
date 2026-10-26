import { describe, expect, it } from "vitest";
import { databaseUrl, pool, transaction } from "./match.test-helper.js";
import * as implementation from "@server/game/match/match-store.js";
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
});
