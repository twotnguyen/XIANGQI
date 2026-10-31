import { randomUUID } from "node:crypto";
import { describe, expect, it } from "vitest";
import { databaseUrl, pool, transaction } from "./match.test-helper.js";
import {
  black,
  red,
  run,
  start,
  store,
  useMatchHooks,
  viewer,
} from "./match-store.test-helper.js";

describe.skipIf(!databaseUrl)("draw projection authority", () => {
  useMatchHooks();
  it("gives a seated player an empty draw state on a FINISHED match and denies spectators both draw reads", async () => {
    const s = await start();
    await run(s.room, black, (scope) =>
      store().resign(scope, { matchId: s.matchId, matchVersion: 0 }),
    );
    const snapshot = await run(s.room, red, (scope) =>
      store().drawSnapshot(scope, { matchId: s.matchId }),
    );
    expect(snapshot.offers).toEqual([]);
    await expect(
      run(
        s.room,
        viewer,
        (scope) => store().drawSnapshot(scope, { matchId: s.matchId }),
        false,
      ),
    ).rejects.toMatchObject({ code: "MATCH_READ_ONLY" });
    await expect(
      run(
        s.room,
        viewer,
        async (scope) => {
          const cur = await store().current(scope.client, s.room, viewer);
          return store().drawOf(scope, cur, cur.match!);
        },
        false,
      ),
    ).rejects.toMatchObject({ code: "MATCH_READ_ONLY" });
  });
  it("rejects a non-seated host on an ACTIVE match before any draw projection", async () => {
    const s = await start();
    await expect(
      run(s.room, viewer, async (scope) => {
        const cur = await store().current(scope.client, s.room, viewer);
        return store().drawOf(scope, cur, cur.match!);
      }),
    ).rejects.toMatchObject({ code: "MATCH_PLAYER_REQUIRED" });
    expect(
      (
        await pool.query(
          "SELECT count(*)::int n FROM xiangqi_room.match_draw_offers WHERE match_id=$1",
          [s.matchId],
        )
      ).rows[0].n,
    ).toBe(0);
  });
  it("rejects drawOf when the loaded room no longer points at the projected match", async () => {
    const s = await start();
    await expect(
      run(s.room, red, async (scope) => {
        const cur = await store().current(scope.client, s.room, red);
        // The room row stays FOR UPDATE-locked for this transaction, so a replacement can only
        // reach drawOf as a loaded snapshot whose room points at another match.
        const replaced = {
          ...cur,
          room: { ...cur.room, current_match_id: randomUUID() },
        };
        return store().drawOf(scope, replaced, cur.match!);
      }),
    ).rejects.toMatchObject({ code: "MATCH_ID_MISMATCH" });
  });
  it("rejects drawOf when the opponent's player lock is missing from the transaction", async () => {
    const s = await start();
    await expect(
      transaction([red], [s.room], async (c) => {
        const scope = {
          client: c,
          actor: { userId: red, kind: "guest" as const },
          roomId: s.room,
          canControl: true,
          lockedActorIds: new Set([red]),
          lockedRoomIds: new Set([s.room]),
        };
        const cur = await store().current(c, s.room, red);
        return store().drawOf(scope, cur, cur.match!);
      }),
    ).rejects.toMatchObject({ code: "MATCH_LOCK_REQUIRED" });
  });
  it("leaves offers and move cooldown unchanged after a rejected drawOf projection", async () => {
    const s = await start();
    const before = await run(s.room, red, (scope) =>
      store().drawSnapshot(scope, { matchId: s.matchId }),
    );
    await expect(
      run(s.room, viewer, async (scope) => {
        const cur = await store().current(scope.client, s.room, viewer);
        return store().drawOf(scope, cur, cur.match!);
      }),
    ).rejects.toMatchObject({ code: "MATCH_PLAYER_REQUIRED" });
    const after = await run(s.room, red, (scope) =>
      store().drawSnapshot(scope, { matchId: s.matchId }),
    );
    expect(after).toEqual(before);
  });
});
