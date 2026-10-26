import { describe, expect, it } from "vitest";
import { databaseUrl, pool } from "./match.test-helper.js";
import {
  noCaptureInitial,
  noCaptureFinal,
  noCaptureMoves,
} from "./fixtures.js";
import {
  red,
  black,
  store,
  run,
  tactical,
  useMatchHooks,
} from "./match-store.test-helper.js";
describe.skipIf(!databaseUrl)("match transactions", () => {
  useMatchHooks();
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
      lastMove: {
        from: noCaptureMoves.at(-1)![0],
        to: noCaptureMoves.at(-1)![1],
        eventVersion: 120,
      },
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
});
