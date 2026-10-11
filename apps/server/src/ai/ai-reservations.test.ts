import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { RoomTransactions } from "../room/room-transactions.js";
import { RoomStore } from "../room/room-store.js";
import type { RoomActor, RoomScope } from "../room/contracts.js";
import { AiReservations } from "./ai-reservations.js";
import { actor } from "../room/room.test-helper.js";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { apply, databaseUrl, pool, reset } from "../room/room.test-helper.js";
const migration = "supabase/migrations/20261011000011_ai_reservations.sql";
const rollback = "supabase/rollback/20261011000011_ai_reservations.sql";
const reservations = new AiReservations(),
  coordinator = new RoomTransactions(pool),
  rooms = new RoomStore();
async function sql<T>(work: (client: PoolClient) => Promise<T>) {
  const c = await pool.connect();
  try {
    await c.query("BEGIN; SET LOCAL ROLE app_server");
    const result = await work(c);
    await c.query("COMMIT");
    return result;
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  } finally {
    c.release();
  }
}
async function run<T>(a: RoomActor, work: (scope: RoomScope) => Promise<T>) {
  const result = await coordinator.withRoom(
    { actor: a, roomIds: [] },
    async () => ({ status: "active", actor: a }),
    work,
  );
  if (result.status !== "active") throw Error("synthetic admission failed");
  return result.value;
}
async function boot() {
  return sql((c) => reservations.createBoot(c));
}
afterAll(() => pool.end());
describe.skipIf(!databaseUrl)(
  "AI reservations with actual isolated SQL",
  () => {
    beforeEach(async () => {
      await pool.query(
        "DROP SCHEMA IF EXISTS xiangqi_ai CASCADE; DROP SCHEMA IF EXISTS xiangqi_chat CASCADE",
      );
      await reset();
      for (const suffix of [
        "06_rooms",
        "07_match_outcomes",
        "08_room_modes",
        "09_match_draw",
        "10_room_chat",
      ])
        await apply(`supabase/migrations/202610110000${suffix}.sql`);
      await apply(migration);
    });
    it("installs additive AI columns and private forced-RLS lease metadata", async () => {
      const columns = (
        await pool.query(
          "SELECT attname FROM pg_catalog.pg_attribute WHERE attrelid='public.active_players'::regclass AND attname IN('ai_game_id','ai_boot_id') AND NOT attisdropped ORDER BY attname",
        )
      ).rows.map((r) => r.attname);
      expect(columns).toEqual(["ai_boot_id", "ai_game_id"]);
      expect(
        (
          await pool.query(
            "SELECT relrowsecurity,relforcerowsecurity FROM pg_catalog.pg_class WHERE oid='xiangqi_ai.boots'::regclass",
          )
        ).rows[0],
      ).toEqual({ relrowsecurity: true, relforcerowsecurity: true });
    });

    it("acquires one exact live AI slot and rejects duplicates or a different boot", async () => {
      const a = await actor(),
        b = await boot(),
        other = await boot(),
        gameId = randomUUID();
      await run(a, (s) => reservations.reserve(s, { gameId, bootId: b.id }));
      const proof = await run(a, (s) =>
        reservations.check(s, { gameId, bootId: b.id }),
      );
      expect(proof).toEqual(
        expect.objectContaining({ gameId, bootId: b.id, ownerId: a.userId }),
      );
      expect(proof.acquiredAt).toBe(
        (
          await pool.query(
            "SELECT acquired_at FROM public.active_players WHERE user_id=$1",
            [a.userId],
          )
        ).rows[0].acquired_at.toISOString(),
      );
      await expect(
        run(a, (s) =>
          reservations.reserve(s, { gameId: randomUUID(), bootId: b.id }),
        ),
      ).rejects.toMatchObject({ code: "ALREADY_SEATED" });
      await expect(
        run(a, (s) => reservations.release(s, { gameId, bootId: other.id })),
      ).rejects.toMatchObject({ code: "AI_RESERVATION_LOST" });
      await run(a, (s) => reservations.release(s, { gameId, bootId: b.id }));
      expect(
        (await pool.query("SELECT count(*)::int n FROM public.active_players"))
          .rows[0].n,
      ).toBe(0);
    });
    it("arbitrates simultaneous AI versus AI under actual actor locks", async () => {
      const a = await actor(),
        b = await boot();
      const results = await Promise.allSettled([
        run(a, (s) =>
          reservations.reserve(s, { gameId: randomUUID(), bootId: b.id }),
        ),
        run(a, (s) =>
          reservations.reserve(s, { gameId: randomUUID(), bootId: b.id }),
        ),
      ]);
      expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM public.active_players WHERE user_id=$1",
            [a.userId],
          )
        ).rows[0].n,
      ).toBe(1);
    });
    it("arbitrates simultaneous managed room seat versus AI without a fake match", async () => {
      const a = await actor(),
        b = await boot();
      const results = await Promise.allSettled([
        run(a, (s) =>
          rooms.create(s, {
            commandId: randomUUID(),
            name: "Synthetic AI race",
          }),
        ),
        run(a, (s) =>
          reservations.reserve(s, { gameId: randomUUID(), bootId: b.id }),
        ),
      ]);
      expect(results.filter((r) => r.status === "fulfilled")).toHaveLength(1);
      const row = (
        await pool.query(
          "SELECT room_id,match_id,ai_game_id FROM public.active_players WHERE user_id=$1",
          [a.userId],
        )
      ).rows[0];
      expect(row.match_id).toBeNull();
      expect(Boolean(row.room_id) !== Boolean(row.ai_game_id)).toBe(true);
      expect(
        (await pool.query("SELECT count(*)::int n FROM public.matches")).rows[0]
          .n,
      ).toBe(0);
    });
    it("requires caller actor and canonical online room locks, preserving online slot", async () => {
      const a = await actor(),
        b = await boot();
      const room = await run(a, (s) =>
        rooms.create(s, {
          commandId: randomUUID(),
          name: "Synthetic existing seat",
        }),
      );
      await expect(
        run(a, (s) =>
          reservations.reserve(
            { ...s, lockedActorIds: new Set() },
            { gameId: randomUUID(), bootId: b.id },
          ),
        ),
      ).rejects.toMatchObject({ code: "AI_SCOPE_INVALID" });
      await expect(
        run(a, (s) =>
          reservations.reserve(
            { ...s, lockedRoomIds: new Set() },
            { gameId: randomUUID(), bootId: b.id },
          ),
        ),
      ).rejects.toMatchObject({ code: "AI_SCOPE_INVALID" });
      expect(
        (
          await pool.query(
            "SELECT room_id FROM public.active_players WHERE user_id=$1",
            [a.userId],
          )
        ).rows[0].room_id,
      ).toBe(room.roomId);
    });
    it("heartbeats only a live boot and refuses resurrection after expiry", async () => {
      const b = await boot();
      const refreshed = await sql((c) => reservations.heartbeat(c, b.id));
      expect(Date.parse(refreshed.leaseUntil)).toBeGreaterThanOrEqual(
        Date.parse(b.leaseUntil),
      );
      await pool.query(
        "UPDATE xiangqi_ai.boots SET created_at=clock_timestamp()-interval '2 minutes',lease_until=clock_timestamp()-interval '1 second' WHERE id=$1",
        [b.id],
      );
      await expect(
        sql((c) => reservations.heartbeat(c, b.id)),
      ).rejects.toMatchObject({ code: "AI_BOOT_EXPIRED" });
    });
    it("reclaims only exact expired boot/game and preserves live foreign boots and new game fences", async () => {
      const a = await actor(),
        other = await actor(),
        old = await boot(),
        live = await boot(),
        gameId = randomUUID(),
        foreignGame = randomUUID();
      await run(a, (s) => reservations.reserve(s, { gameId, bootId: old.id }));
      await run(other, (s) =>
        reservations.reserve(s, { gameId: foreignGame, bootId: live.id }),
      );
      expect(
        await run(other, (s) =>
          reservations.reclaimExpired(s, {
            gameId: foreignGame,
            bootId: live.id,
          }),
        ),
      ).toBe(false);
      await pool.query(
        "UPDATE xiangqi_ai.boots SET created_at=clock_timestamp()-interval '2 minutes',lease_until=clock_timestamp()-interval '1 second' WHERE id=$1",
        [old.id],
      );
      await expect(
        run(a, (s) => reservations.check(s, { gameId, bootId: old.id })),
      ).rejects.toMatchObject({ code: "AI_BOOT_EXPIRED" });
      const replacement = randomUUID();
      await run(a, async (s) => {
        expect(
          await reservations.reclaimExpired(s, { gameId, bootId: old.id }),
        ).toBe(true);
        await reservations.reserve(s, { gameId: replacement, bootId: live.id });
      });
      expect(
        await run(a, (s) =>
          reservations.reclaimExpired(s, { gameId, bootId: old.id }),
        ),
      ).toBe(false);
      expect(
        (
          await pool.query(
            "SELECT ai_game_id FROM public.active_players ORDER BY ai_game_id",
          )
        ).rows
          .map((r) => r.ai_game_id)
          .sort(),
      ).toEqual([replacement, foreignGame].sort());
    });
    it("rolls reservation changes back atomically after collaborator failure", async () => {
      const a = await actor(),
        b = await boot(),
        gameId = randomUUID();
      await expect(
        run(a, async (s) => {
          await reservations.reserve(s, { gameId, bootId: b.id });
          throw Error("synthetic downstream rollback");
        }),
      ).rejects.toThrow("synthetic downstream rollback");
      expect(
        (await pool.query("SELECT count(*)::int n FROM public.active_players"))
          .rows[0].n,
      ).toBe(0);
    });

    it("denies private lease data to anon/authenticated/service_role and immutable columns to app_server", async () => {
      const b = await boot();
      for (const role of ["anon", "authenticated", "service_role"]) {
        const c = await pool.connect();
        try {
          await c.query(`BEGIN; SET LOCAL ROLE ${role}`);
          await expect(
            c.query("SELECT * FROM xiangqi_ai.boots"),
          ).rejects.toMatchObject({ code: "42501" });
        } finally {
          await c.query("ROLLBACK");
          c.release();
        }
      }
      for (const query of [
        "DELETE FROM xiangqi_ai.boots",
        "UPDATE xiangqi_ai.boots SET id=id",
        "UPDATE xiangqi_ai.boots SET created_at=created_at",
        "UPDATE public.active_players SET ai_game_id=ai_game_id",
      ]) {
        await expect(sql((c) => c.query(query))).rejects.toMatchObject({
          code: "42501",
        });
      }
      expect(
        (
          await pool.query(
            "SELECT count(*)::int n FROM xiangqi_ai.boots WHERE id=$1",
            [b.id],
          )
        ).rows[0].n,
      ).toBe(1);
    });
    it("enforces AI pair and exclusive online/AI shape in the actual database", async () => {
      const a = await actor(),
        b = await boot();
      await expect(
        sql((c) =>
          c.query(
            "INSERT INTO public.active_players(user_id,ai_game_id) VALUES($1,$2)",
            [a.userId, randomUUID()],
          ),
        ),
      ).rejects.toMatchObject({ code: "23514" });
      await expect(
        sql((c) =>
          c.query(
            "INSERT INTO public.active_players(user_id,ai_game_id,ai_boot_id,match_id) VALUES($1,$2,$3,$4)",
            [a.userId, randomUUID(), b.id, randomUUID()],
          ),
        ),
      ).rejects.toMatchObject({ code: "23514" });
      await expect(
        sql((c) =>
          c.query(
            "INSERT INTO public.active_players(user_id,ai_boot_id) VALUES($1,$2)",
            [a.userId, b.id],
          ),
        ),
      ).rejects.toMatchObject({ code: "23514" });
    });
    it("bounds expired candidates to fifty and forwards past unreclaimed entries without starving fifty-first", async () => {
      const b = await boot();
      for (let n = 0; n < 51; n++) {
        const a = await actor();
        await run(a, (s) =>
          reservations.reserve(s, { gameId: randomUUID(), bootId: b.id }),
        );
      }
      await pool.query(
        "UPDATE xiangqi_ai.boots SET created_at=clock_timestamp()-interval '2 minutes',lease_until=clock_timestamp()-interval '1 second' WHERE id=$1",
        [b.id],
      );
      const first = await sql((c) => reservations.expired(c));
      expect(first).toHaveLength(50);
      const second = await sql((c) =>
        reservations.expired(c, first[49]!.cursor),
      );
      expect(second).toHaveLength(1);
      expect(new Set([...first, ...second].map((r) => r.gameId)).size).toBe(51);
      await expect(
        sql((c) =>
          reservations.expired(c, {
            leaseMilliseconds: "NaN",
            gameId: randomUUID(),
          }),
        ),
      ).rejects.toMatchObject({ code: "AI_INPUT_INVALID" });
    });
    it("refuses rollback after any boot/reservation write rather than losing recoverable lease data", async () => {
      await boot();
      await expect(apply(rollback)).rejects.toThrow(
        "AI reservation writes exist",
      );
      expect(
        (await pool.query("SELECT count(*)::int n FROM xiangqi_ai.boots"))
          .rows[0].n,
      ).toBe(1);
    });
    it.each([
      "ALTER TABLE xiangqi_ai.boots NO FORCE ROW LEVEL SECURITY",
      "GRANT SELECT ON xiangqi_ai.boots TO authenticated",
      "ALTER TABLE public.active_players ALTER COLUMN ai_game_id SET DEFAULT gen_random_uuid()",
      "ALTER TABLE public.active_players ADD CONSTRAINT unknown_ai_check CHECK(ai_game_id IS NULL OR true)",
      "CREATE TABLE public.unexpected_boot_ref(id uuid REFERENCES xiangqi_ai.boots(id))",
    ])(
      "refuses rollback metadata/dependency drift before destructive writes: %s",
      async (change) => {
        await pool.query(change);
        await expect(apply(rollback)).rejects.toThrow(
          "AI reservation metadata changed",
        );
        expect(
          (
            await pool.query(
              "SELECT count(*)::int n FROM pg_catalog.pg_attribute WHERE attrelid='public.active_players'::regclass AND attname IN('ai_game_id','ai_boot_id') AND NOT attisdropped",
            )
          ).rows[0].n,
        ).toBe(2);
      },
    );
    it("rollback and reapply preserve the untouched online baseline", async () => {
      const baseline = await pool.query(
        "SELECT conname,pg_catalog.pg_get_constraintdef(oid) AS definition FROM pg_catalog.pg_constraint WHERE conrelid='public.active_players'::regclass AND conname NOT LIKE 'active_players_ai_%' ORDER BY conname",
      );
      await apply(rollback);
      expect(
        (
          await pool.query(
            "SELECT to_regnamespace('xiangqi_ai') IS NULL AS absent",
          )
        ).rows[0].absent,
      ).toBe(true);
      const after = await pool.query(
        "SELECT conname,pg_catalog.pg_get_constraintdef(oid) AS definition FROM pg_catalog.pg_constraint WHERE conrelid='public.active_players'::regclass ORDER BY conname",
      );
      expect(after.rows).toEqual(baseline.rows);
      await apply(migration);
      await apply(rollback);
    });
    it.each(["heartbeat", "check"] as const)(
      "samples expiry after waiting for an unchanged boot row lock: %s",
      async (operation) => {
        const a = await actor(),
          b = await boot(),
          gameId = randomUUID();
        await run(a, (s) => reservations.reserve(s, { gameId, bootId: b.id }));
        await pool.query(
          "UPDATE xiangqi_ai.boots SET lease_until=clock_timestamp()+interval '1 second' WHERE id=$1",
          [b.id],
        );
        const holder = await pool.connect();
        let committed = false;
        try {
          await holder.query("BEGIN");
          await holder.query(
            `SELECT id FROM xiangqi_ai.boots WHERE id=$1 FOR ${operation === "heartbeat" ? "SHARE" : "UPDATE"}`,
            [b.id],
          );
          const pending = (
            operation === "heartbeat"
              ? sql((c) => reservations.heartbeat(c, b.id))
              : run(a, (s) => reservations.check(s, { gameId, bootId: b.id }))
          ).then(
            (value) => ({ value, error: undefined }),
            (error) => ({ value: undefined, error }),
          );
          let blocked = false;
          for (let n = 0; n < 100; n++) {
            blocked =
              (
                await pool.query(
                  "SELECT count(*)::int n FROM pg_catalog.pg_stat_activity WHERE wait_event_type='Lock' AND query LIKE '%xiangqi_ai.boots%'",
                )
              ).rows[0].n > 0;
            if (blocked) break;
            await new Promise((r) => setTimeout(r, 2));
          }
          expect(blocked).toBe(true);
          await pool.query(
            "SELECT pg_sleep(GREATEST(0,extract(epoch FROM lease_until-clock_timestamp()))+0.02) FROM xiangqi_ai.boots WHERE id=$1",
            [b.id],
          );
          await holder.query("COMMIT");
          committed = true;
          expect((await pending).error).toMatchObject({
            code: "AI_BOOT_EXPIRED",
          });
        } finally {
          if (!committed) await holder.query("ROLLBACK");
          holder.release();
        }
      },
    );
  },
);
