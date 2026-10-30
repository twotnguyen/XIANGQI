import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";
import { pool, databaseUrl } from "../room/room.test-helper.js";
import { HistoryStore } from "@server/game/history/history-store.js";
import { ReplayStore } from "@server/game/history/replay-store.js";
import {
  loginPool,
  resetExpiry,
  run,
  expiryFixture,
  disconnect,
} from "./ai-expiry.test-helper.js";

afterAll(async () => {
  await pool.end();
  await loginPool.end();
});
describe.skipIf(!databaseUrl)(
  "AI physical grace expiry through actual domain and SQL",
  () => {
    beforeEach(resetExpiry);
    it("persists only effective moves and a neutral Bỏ dở result once under concurrent sweeps", async () => {
      const f = await expiryFixture();
      try {
        await f.games.move(
          f.ownerId,
          f.initial.id,
          { version: f.initial.version, move: { from: 54, to: 45 } },
          f.origin,
        );
        const before = f.games.read(f.ownerId, f.initial.id);
        await disconnect(f);
        expect(
          await Promise.all([
            f.games.expire(f.ownerId, f.initial.id),
            f.games.expire(f.ownerId, f.initial.id),
          ]),
        ).toEqual([true, false]);
        expect(() => f.games.read(f.ownerId, f.initial.id)).toThrow();
        expect(
          (
            await pool.query(
              "SELECT status,outcome,ply FROM public.matches WHERE id=$1",
              [f.initial.id],
            )
          ).rows,
        ).toEqual([
          {
            status: "INTERRUPTED",
            ply: 1,
            outcome: {
              reason: "AI_UNAVAILABLE",
              winner: null,
              abandonedBy: "DISCONNECT",
            },
          },
        ]);
        expect(
          (
            await pool.query(
              "SELECT count(*)::int n FROM public.match_events WHERE match_id=$1 AND type='RESULT'",
              [f.initial.id],
            )
          ).rows[0].n,
        ).toBe(1);
        expect(
          (
            await pool.query(
              "SELECT count(*)::int n FROM public.active_players",
            )
          ).rows[0].n,
        ).toBe(0);
        const history = await run(f.actor, (scope) =>
          new HistoryStore().list(scope, {}),
        );
        expect(history.items[0]?.result).toEqual({
          kind: "ABANDONED",
          label: "Bỏ dở",
          reason: "AI_UNAVAILABLE",
          countsForWdl: false,
        });
        const replay = await run(f.actor, (scope) =>
          new ReplayStore().read(scope, f.initial.id),
        );
        expect(replay.positions.map((position) => position.fen)).toEqual(
          before.history,
        );
        expect(replay.moves).toEqual([{ from: 54, to: 45, side: "red" }]);
        // The exact stale candidate cannot release a newer game owned by the same actor.
        f.origin.tab.connectionId = randomUUID();
        await run(f.actor, async (scope) => {
          const attached = await f.presence.attach(scope, f.origin.tab);
          f.origin.tab.generation = attached.control.generation;
        });
        const next = await f.games.create(
          f.ownerId,
          { requestedSide: "red", level: "medium" },
          f.origin,
        );
        expect(await f.games.expire(f.ownerId, f.initial.id)).toBe(false);
        expect(f.games.read(f.ownerId, next.id)).toEqual(next);
        expect(
          (
            await pool.query(
              "SELECT ai_game_id FROM public.active_players WHERE user_id=$1",
              [f.ownerId],
            )
          ).rows[0].ai_game_id,
        ).toBe(next.id);
      } finally {
        await f.games.close();
      }
    });

    it("rolls back the match, reservation and RAM together when history fails after its SQL writes", async () => {
      const f = await expiryFixture();
      try {
        await disconnect(f);
        const before = f.games.read(f.ownerId, f.initial.id),
          finish = f.history.finish.bind(f.history);
        vi.spyOn(f.history, "finish").mockImplementationOnce(
          async (...args) => {
            await finish(...args);
            throw Error("synthetic history rollback");
          },
        );
        await expect(f.games.expire(f.ownerId, f.initial.id)).rejects.toThrow(
          "synthetic history rollback",
        );
        expect(f.games.read(f.ownerId, f.initial.id)).toEqual(before);
        expect(
          (await pool.query("SELECT count(*)::int n FROM public.matches"))
            .rows[0].n,
        ).toBe(0);
        expect(
          (
            await pool.query(
              "SELECT ai_game_id FROM public.active_players WHERE user_id=$1",
              [f.ownerId],
            )
          ).rows[0].ai_game_id,
        ).toBe(f.initial.id);
        expect(await f.games.expire(f.ownerId, f.initial.id)).toBe(true);
      } finally {
        await f.games.close();
      }
    });

    it("refuses still-retained/reconnected candidates and forbids expiry for human/internal origins", async () => {
      const f = await expiryFixture();
      try {
        await disconnect(f, false);
        expect(await f.games.expire(f.ownerId, f.initial.id)).toBe(false);
        const tab = {
          tabId: randomUUID(),
          connectionId: randomUUID(),
          generation: 1,
        };
        const attached = await run(f.actor, (scope) =>
          f.presence.attach(scope, tab),
        );
        expect(attached.status).toBe("active");
        f.origin.tab = { ...tab, generation: attached.control.generation };
        expect(await f.games.expire(f.ownerId, f.initial.id)).toBe(false);
        for (const origin of [f.origin, { kind: "internal" as const }]) {
          await expect(
            f.transactions.run(f.ownerId, origin, async (tx) => {
              await tx.expire(f.initial.id, null);
              return { value: true, install: () => {} };
            }),
          ).rejects.toMatchObject({ status: 403 });
        }
        expect(f.games.read(f.ownerId, f.initial.id)).toEqual(f.initial);
        expect(
          (await pool.query("SELECT count(*)::int n FROM public.matches"))
            .rows[0].n,
        ).toBe(0);
      } finally {
        await f.games.close();
      }
    });

    it("finishes an already-finalizing resignation with its real result and no abandonment marker", async () => {
      const f = await expiryFixture();
      try {
        vi.spyOn(f.history, "finish").mockRejectedValueOnce(
          Error("synthetic transient history error"),
        );
        await expect(
          f.games.resign(
            f.ownerId,
            f.initial.id,
            { version: f.initial.version },
            f.origin,
          ),
        ).rejects.toMatchObject({ code: "AI_UNAVAILABLE" });
        expect(f.games.read(f.ownerId, f.initial.id).status).toBe("FINALIZING");
        await disconnect(f);
        expect(await f.games.expire(f.ownerId, f.initial.id)).toBe(true);
        expect(
          (
            await pool.query(
              "SELECT status,outcome FROM public.matches WHERE id=$1",
              [f.initial.id],
            )
          ).rows[0],
        ).toEqual({
          status: "FINISHED",
          outcome: { reason: "RESIGN", winner: "BLACK" },
        });
      } finally {
        await f.games.close();
      }
    });

    it("serializes expiry against move, retry and takeover without a second result or restored state", async () => {
      const f = await expiryFixture();
      try {
        await disconnect(f);
        const results = await Promise.allSettled([
          f.games.expire(f.ownerId, f.initial.id),
          f.games.move(
            f.ownerId,
            f.initial.id,
            { version: f.initial.version, move: { from: 54, to: 45 } },
            f.origin,
          ),
          f.games.retry(
            f.ownerId,
            f.initial.id,
            { version: f.initial.version },
            f.origin,
          ),
          run(f.actor, (scope) =>
            f.presence.attach(scope, {
              tabId: randomUUID(),
              connectionId: randomUUID(),
              takeover: true,
            }),
          ),
        ]);
        expect(results[0]).toEqual({ status: "fulfilled", value: true });
        expect(results[1]?.status).toBe("rejected");
        expect(results[2]?.status).toBe("rejected");
        expect(() => f.games.read(f.ownerId, f.initial.id)).toThrow();
        expect(
          (
            await pool.query(
              "SELECT outcome,ply FROM public.matches WHERE id=$1",
              [f.initial.id],
            )
          ).rows[0],
        ).toEqual({
          ply: 0,
          outcome: {
            reason: "AI_UNAVAILABLE",
            winner: null,
            abandonedBy: "DISCONNECT",
          },
        });
        expect(
          (
            await pool.query(
              "SELECT count(*)::int n FROM public.match_events WHERE type='RESULT'",
            )
          ).rows[0].n,
        ).toBe(1);
      } finally {
        await f.games.close();
      }
    });

    it("expires guest RAM and its exact reservation without creating public history", async () => {
      const f = await expiryFixture("guest");
      try {
        await disconnect(f);
        expect(await f.games.expire(f.ownerId, f.initial.id)).toBe(true);
        expect(() => f.games.read(f.ownerId, f.initial.id)).toThrow();
        expect(
          (await pool.query("SELECT count(*)::int n FROM public.matches"))
            .rows[0].n,
        ).toBe(0);
        expect(
          (
            await pool.query(
              "SELECT count(*)::int n FROM public.active_players",
            )
          ).rows[0].n,
        ).toBe(0);
      } finally {
        await f.games.close();
      }
    });
  },
);
