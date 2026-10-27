import { describe, expect, it } from "vitest";
import { databaseUrl, pool } from "./match.test-helper.js";
import {
  red,
  run,
  start,
  store,
  useMatchHooks,
} from "./match-store.test-helper.js";

describe.skipIf(!databaseUrl)("match move rollback retry", () => {
  useMatchHooks();
  it("after a rolled-back non-terminal move, the same valid move commits exactly once", async () => {
    const s = await start();
    const input = { matchId: s.matchId, matchVersion: 0, from: 54, to: 45 };
    await expect(
      run(s.room, red, async (scope) => {
        await store().move(scope, input);
        throw new Error("receipt failure");
      }),
    ).rejects.toThrow("receipt failure");
    const retried = await run(s.room, red, (scope) =>
      store().move(scope, input),
    );
    expect(retried).toMatchObject({
      applied: true,
      match: { version: 1, ply: 1, turn: "black" },
    });
    expect(
      (
        await pool.query("SELECT ply,version FROM public.matches WHERE id=$1", [
          s.matchId,
        ])
      ).rows[0],
    ).toEqual({ ply: 1, version: "1" });
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM public.match_moves WHERE match_id=$1",
          [s.matchId],
        )
      ).rows[0].n,
    ).toBe(1);
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM public.match_events WHERE match_id=$1",
          [s.matchId],
        )
      ).rows[0].n,
    ).toBe(2);
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM xiangqi_room.outbox WHERE room_id=$1",
          [s.room],
        )
      ).rows[0].n,
    ).toBe(1);
  });
});
