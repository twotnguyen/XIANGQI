import { describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { databaseUrl, pool } from "./match.test-helper.js";
import * as implementation from "@server/game/match/match-store.js";
import {
  at,
  end,
  red,
  store,
  start,
  run,
  tactical,
  useMatchHooks,
} from "./match-store.test-helper.js";
describe.skipIf(!databaseUrl)("match transactions", () => {
  useMatchHooks();
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
});
