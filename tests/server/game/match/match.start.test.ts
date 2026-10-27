import { describe, expect, it } from "vitest";
import {
  initialPosition,
  parsePosition,
  serializePosition,
} from "@xiangqi/xiangqi-core";
import { databaseUrl, pool, transaction } from "./match.test-helper.js";
import * as implementation from "@server/game/match/match-store.js";
import { encodePosition } from "@server/game/match/position-codec.js";
import {
  at,
  end,
  red,
  black,
  setup,
  store,
  start,
  run,
  useMatchHooks,
} from "./match-store.test-helper.js";
describe.skipIf(!databaseUrl)("match transactions", () => {
  useMatchHooks();
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
  it("projects verified lastMove across reload, rejected commands and RESULT without changing its MOVE version", async () => {
    const s = await start();
    const snapshot = () =>
      transaction([red, black], [s.room], (c) =>
        store().snapshot(c, s.room, s.matchId),
      );
    expect(await snapshot()).toHaveProperty("lastMove", null);
    const move = await run(s.room, red, (scope) =>
      store().move(scope, {
        matchId: s.matchId,
        matchVersion: 0,
        from: 54,
        to: 45,
      }),
    );
    const lastMove = { from: 54, to: 45, eventVersion: 1 };
    expect(move.match).toHaveProperty("lastMove", lastMove);
    expect(await snapshot()).toHaveProperty("lastMove", lastMove);
    const stale = await run(s.room, black, (scope) =>
      store().move(scope, {
        matchId: s.matchId,
        matchVersion: 0,
        from: 27,
        to: 36,
      }),
    );
    expect(stale.error?.code).toBe("MATCH_VERSION_CONFLICT");
    expect(stale.match).toHaveProperty("lastMove", lastMove);
    const illegal = await run(s.room, black, (scope) =>
      store().move(scope, {
        matchId: s.matchId,
        matchVersion: 1,
        from: 27,
        to: 45,
      }),
    );
    expect(illegal.error?.code).toBe("MATCH_ILLEGAL_MOVE");
    expect(illegal.match).toHaveProperty("lastMove", lastMove);
    const resigned = await run(s.room, black, (scope) =>
      store().resign(scope, { matchId: s.matchId, matchVersion: 1 }),
    );
    expect(resigned.match.version).toBe(2);
    expect(resigned.match).toHaveProperty("lastMove", lastMove);
    expect(await snapshot()).toHaveProperty("lastMove", lastMove);
    const retry = await run(s.room, black, (scope) =>
      store().resign(scope, { matchId: s.matchId, matchVersion: 1 }),
    );
    expect(retry.error?.code).toBe("MATCH_FINISHED");
    expect(retry.match).toHaveProperty("lastMove", lastMove);
  });
  it("lastMove follows the effective branch rather than a newer abandoned MOVE", async () => {
    const s = await start();
    const first = await run(s.room, red, (scope) =>
      store().move(scope, {
        matchId: s.matchId,
        matchVersion: 0,
        from: 54,
        to: 45,
      }),
    );
    await run(s.room, black, (scope) =>
      store().move(scope, {
        matchId: s.matchId,
        matchVersion: 1,
        from: 27,
        to: 36,
      }),
    );
    await pool.query(
      "UPDATE public.matches SET active_move_ids=jsonb_build_array(active_move_ids->0),ply=1,position=$2,version=3 WHERE id=$1",
      [s.matchId, encodePosition(parsePosition(first.match.position))],
    );
    await pool.query(
      "INSERT INTO public.match_events(match_id,version,type,payload) VALUES($1,3,'UNDO','{}')",
      [s.matchId],
    );
    const snapshot = await transaction([red, black], [s.room], (c) =>
      store().snapshot(c, s.room, s.matchId),
    );
    expect(snapshot).toMatchObject({
      version: 3,
      ply: 1,
      lastMove: { from: 54, to: 45, eventVersion: 1 },
    });
    const continued = await run(s.room, black, (scope) =>
      store().move(scope, {
        matchId: s.matchId,
        matchVersion: 3,
        from: 27,
        to: 36,
      }),
    );
    expect(continued.match).toHaveProperty("lastMove", {
      from: 27,
      to: 36,
      eventVersion: 4,
    });
  });
});
