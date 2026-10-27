import { describe, expect, it } from "vitest";
import { randomUUID } from "node:crypto";
import { actor, databaseUrl, pool, transaction } from "./match.test-helper.js";
import {
  black,
  red,
  run,
  start,
  store,
  useMatchHooks,
  viewer,
} from "./match-store.test-helper.js";

// Another session can take the match row lock only if the context path did not hold it.
async function lockedByAnother(matchId: string) {
  try {
    await pool.query(
      "SELECT 1 FROM public.matches WHERE id=$1 FOR UPDATE NOWAIT",
      [matchId],
    );
    return false;
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "55P03"
    )
      return true;
    throw error;
  }
}

const move = (matchId: string) => ({
  matchId,
  matchVersion: 0,
  from: 54,
  to: 45,
});

describe.skipIf(!databaseUrl)("match context boundaries", () => {
  useMatchHooks();

  it("keeps the current match row locked after a valid context", async () => {
    const s = await start();
    await run(s.room, red, async (scope) => {
      const result = await store().move(scope, move(s.matchId));
      expect(result).toMatchObject({ applied: true });
      expect(await lockedByAnother(s.matchId)).toBe(true);
    });
  });

  it("rejects a mismatched match id without locking the match row", async () => {
    const s = await start();
    await run(s.room, red, async (scope) => {
      await expect(
        store().move(scope, move(randomUUID())),
      ).rejects.toMatchObject({ code: "MATCH_ID_MISMATCH" });
      expect(await lockedByAnother(s.matchId)).toBe(false);
    });
  });

  it("reports a missing room before any match checks", async () => {
    const s = await start();
    await expect(
      run(randomUUID(), red, (scope) => store().move(scope, move(s.matchId))),
    ).rejects.toMatchObject({ code: "MATCH_ROOM_NOT_FOUND" });
  });

  it("reports a wrong match id before player and seat checks", async () => {
    const s = await start();
    const outsider = (await actor()).userId;
    for (const user of [viewer, outsider]) {
      await expect(
        run(s.room, user, (scope) => store().move(scope, move(randomUUID()))),
      ).rejects.toMatchObject({ code: "MATCH_ID_MISMATCH" });
    }
  });

  it("denies spectators, outsiders and seat-switched players", async () => {
    const s = await start();
    const outsider = (await actor()).userId;
    for (const user of [viewer, outsider]) {
      await expect(
        run(s.room, user, (scope) => store().move(scope, move(s.matchId))),
      ).rejects.toMatchObject({ code: "MATCH_PLAYER_REQUIRED" });
    }
    await pool.query(
      "UPDATE public.room_members SET role='SPECTATOR',side=NULL,ready=false WHERE room_id=$1 AND user_id=$2",
      [s.room, red],
    );
    await expect(
      run(s.room, red, (scope) => store().move(scope, move(s.matchId))),
    ).rejects.toMatchObject({ code: "MATCH_PLAYER_REQUIRED" });
  });

  it("requires the lock for both players of the match", async () => {
    const s = await start();
    await expect(
      transaction([red, black], [s.room], (c) =>
        store().move(
          {
            client: c,
            actor: { userId: red, kind: "guest" },
            roomId: s.room,
            canControl: true,
            lockedActorIds: new Set([red]),
            lockedRoomIds: new Set([s.room]),
          },
          move(s.matchId),
        ),
      ),
    ).rejects.toMatchObject({ code: "MATCH_LOCK_REQUIRED" });
  });
});
