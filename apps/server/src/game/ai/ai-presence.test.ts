import { randomUUID } from "node:crypto";
import type { PoolClient } from "pg";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import {
  apply,
  databaseUrl,
  pool,
  reset,
  actor as guest,
} from "../room/room.test-helper.js";
import { RoomTransactions } from "../room/room-transactions.js";
import type { RoomActor, RoomScope } from "../room/contracts.js";
import type { AiOrigin } from "./ai-transactions.js";
import { AiReservations } from "./ai-reservations.js";
import { AiPresence } from "./ai-presence.js";
const coordinator = new RoomTransactions(pool),
  reservations = new AiReservations();
const migration = "supabase/migrations/20261011000012_ai_presence.sql",
  rollback = "supabase/rollback/20261011000012_ai_presence.sql";
async function sql<T>(work: (c: PoolClient) => Promise<T>) {
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
async function run<T>(a: RoomActor, work: (s: RoomScope) => Promise<T>) {
  const result = await coordinator.withRoom(
    { actor: a, roomIds: [] },
    async () => ({ status: "active", actor: a }),
    work,
  );
  if (result.status !== "active") throw Error("fixture ended");
  return result.value;
}
async function member() {
  const userId = randomUUID();
  await pool.query(
    "INSERT INTO auth.users(id,email,email_confirmed_at) VALUES($1,$2,clock_timestamp())",
    [userId, userId + "@example.invalid"],
  );
  await pool.query(
    "INSERT INTO public.profiles(user_id,username,display_name,completed_at,registration_pending) VALUES($1,$2,'Synthetic member',clock_timestamp(),false)",
    [userId, "m" + userId.replaceAll("-", "").slice(0, 18)],
  );
  return { userId, kind: "member" as const };
}
function origin(
  tabId = randomUUID(),
  connectionId = randomUUID(),
  generation = 1,
): Extract<AiOrigin, { kind: "human" }> {
  return {
    kind: "human",
    proof: { accessToken: "synthetic-token", appSession: "synthetic-cap" },
    tab: { tabId, connectionId, generation },
  };
}
async function fixture() {
  const a = await member(),
    boot = await sql((c) => reservations.createBoot(c)),
    port = new AiPresence(boot.id, reservations),
    o = origin();
  return { a, boot, port, o };
}
async function game(f: Awaited<ReturnType<typeof fixture>>) {
  const id = randomUUID();
  await run(f.a, async (s) => {
    const attached = await f.port.attach(s, f.o.tab);
    f.o.tab.generation = attached.control.generation;
    await reservations.reserve(s, { gameId: id, bootId: f.boot.id });
    await f.port.bindGame(s, id, f.o);
  });
  return id;
}
afterAll(() => pool.end());
describe.skipIf(!databaseUrl)(
  "AI SQL physical control and fixed thirty-minute retention",
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
        "11_ai_reservations",
      ])
        await apply(`supabase/migrations/202610110000${suffix}.sql`);
      await apply(migration);
    });
    it("attaches physical controller before creation and binds only the actual reserved game", async () => {
      const f = await fixture();
      const initial = await run(f.a, (s) => f.port.attach(s, f.o.tab));
      expect(initial).toMatchObject({
        control: { mode: "writable", generation: 1 },
        gameId: null,
      });
      const id = await game(f);
      const row = await pool.query(
        "SELECT game_id,connected,disconnected_at,generation::text FROM xiangqi_ai.presence",
      );
      expect(row.rows[0]).toMatchObject({
        game_id: id,
        connected: true,
        disconnected_at: null,
        generation: "2",
      });
      f.o.tab.generation = 2;
      await run(f.a, (s) => f.port.authorize(s, f.o));
    });
    it("new tab takes over while known superseded reconnect stays readonly until explicit takeover", async () => {
      const f = await fixture(),
        id = await game(f),
        newer = origin();
      const second = await run(f.a, (s) => f.port.attach(s, newer.tab));
      expect(second.control).toEqual({ mode: "writable", generation: 2 });
      newer.tab.generation = 2;
      await expect(
        run(f.a, (s) => f.port.authorize(s, f.o)),
      ).rejects.toMatchObject({ code: "TAB_READ_ONLY" });
      const old = await run(f.a, (s) =>
        f.port.attach(s, { ...f.o.tab, connectionId: randomUUID() }),
      );
      expect(old.control.mode).toBe("readonly");
      expect(old.gameId).toBe(id);
      const taking = await run(f.a, (s) =>
        f.port.attach(s, { ...f.o.tab, takeover: true }),
      );
      expect(taking.control).toEqual({ mode: "writable", generation: 3 });
    });
    it("starts grace once for exact physical generation and ignores old/readonly disconnects", async () => {
      const f = await fixture(),
        id = await game(f);
      await run(f.a, (s) => f.port.disconnected(s, { ...f.o.tab, gameId: id }));
      const first = (
        await pool.query("SELECT disconnected_at FROM xiangqi_ai.presence")
      ).rows[0].disconnected_at;
      await run(f.a, (s) => f.port.disconnected(s, { ...f.o.tab, gameId: id }));
      expect(
        (await pool.query("SELECT disconnected_at FROM xiangqi_ai.presence"))
          .rows[0].disconnected_at,
      ).toEqual(first);
      const newer = origin();
      await run(f.a, (s) => f.port.attach(s, newer.tab));
      await run(f.a, (s) => f.port.disconnected(s, { ...f.o.tab, gameId: id }));
      expect(
        (
          await pool.query(
            "SELECT connected,disconnected_at FROM xiangqi_ai.presence",
          )
        ).rows[0],
      ).toEqual({ connected: true, disconnected_at: null });
    });
    it("same controller reconnects before deadline with incremented fence and keeps exact game", async () => {
      const f = await fixture(),
        id = await game(f);
      await run(f.a, (s) => f.port.disconnected(s, { ...f.o.tab, gameId: id }));
      const reconnect = await run(f.a, (s) =>
        f.port.attach(s, { tabId: f.o.tab.tabId, connectionId: randomUUID() }),
      );
      expect(reconnect).toMatchObject({
        gameId: id,
        control: { mode: "writable", generation: 2 },
        graceUntil: null,
      });
      await run(f.a, (s) => f.port.assertRetained(s, id));
    });
    it("expiry blocks human and autonomous retention and cannot be revived by a new tab", async () => {
      const f = await fixture(),
        id = await game(f);
      await run(f.a, (s) => f.port.disconnected(s, { ...f.o.tab, gameId: id }));
      await pool.query(
        "UPDATE xiangqi_ai.presence SET disconnected_at=clock_timestamp()-interval '30 minutes' WHERE game_id=$1",
        [id],
      );
      await expect(
        run(f.a, (s) => f.port.assertRetained(s, id)),
      ).rejects.toMatchObject({ code: "AI_GAME_EXPIRED" });
      const before = (await pool.query("SELECT * FROM xiangqi_ai.controllers"))
        .rows;
      const result = await run(f.a, (s) => f.port.attach(s, origin().tab));
      expect(result.status).toBe("expired");
      expect(
        (await pool.query("SELECT * FROM xiangqi_ai.controllers")).rows,
      ).toEqual(before);
      await expect(
        run(f.a, (s) => f.port.authorize(s, f.o)),
      ).rejects.toMatchObject({ code: "AI_GAME_EXPIRED" });
    });
    it("rejects Guest and binding a foreign game or boot without touching another reservation", async () => {
      const f = await fixture(),
        id = await game(f);
      await expect(
        run(await guest(), (s) => f.port.attach(s, origin().tab)),
      ).rejects.toMatchObject({ code: "AUTH_REQUIRED" });
      await expect(
        run(f.a, (s) => f.port.bindGame(s, randomUUID(), f.o)),
      ).rejects.toMatchObject({ code: "AI_RESERVATION_LOST" });
      const other = await sql((c) => reservations.createBoot(c));
      await expect(
        run(f.a, (s) =>
          new AiPresence(other.id, reservations).attach(s, origin().tab),
        ),
      ).rejects.toMatchObject({ code: "AI_RESERVATION_LOST" });
      expect(
        (await pool.query("SELECT ai_game_id FROM public.active_players"))
          .rows[0].ai_game_id,
      ).toBe(id);
    });
    it("rejects forged scope and rolls a connected update back on collaborator failure", async () => {
      const f = await fixture(),
        id = await game(f);
      await expect(
        run(f.a, (s) =>
          f.port.authorize({ ...s, lockedActorIds: new Set() }, f.o),
        ),
      ).rejects.toMatchObject({ code: "AI_SCOPE_INVALID" });
      await expect(
        run(f.a, async (s) => {
          await f.port.disconnected(s, { ...f.o.tab, gameId: id });
          throw Error("rollback fixture");
        }),
      ).rejects.toThrow("rollback fixture");
      expect(
        (await pool.query("SELECT connected FROM xiangqi_ai.presence")).rows[0]
          .connected,
      ).toBe(true);
    });
    it("bounds expiry candidates and forwards beyond fifty without touching slots", async () => {
      const f = await fixture();
      for (let n = 0; n < 51; n++) {
        const a = await member(),
          o = origin(),
          id = randomUUID();
        await run(a, async (s) => {
          await f.port.attach(s, o.tab);
          await reservations.reserve(s, { gameId: id, bootId: f.boot.id });
          await f.port.bindGame(s, id, o);
          await f.port.disconnected(s, { ...o.tab, gameId: id });
        });
      }
      await pool.query(
        "UPDATE xiangqi_ai.presence SET disconnected_at=clock_timestamp()-interval '31 minutes'",
      );
      const first = await sql((c) => f.port.dueExpired(c)),
        next = await sql((c) => f.port.dueExpired(c, first[49]!.cursor));
      expect(first).toHaveLength(50);
      expect(next).toHaveLength(1);
      expect(new Set([...first, ...next].map((x) => x.gameId)).size).toBe(51);
      expect(
        (await pool.query("SELECT count(*)::int n FROM public.active_players"))
          .rows[0].n,
      ).toBe(51);
    });
    it("denies every private table to anonymous/authenticated/service_role and forces RLS", async () => {
      for (const role of ["anon", "authenticated", "service_role"]) {
        const c = await pool.connect();
        try {
          await c.query("BEGIN");
          await c.query(`SET LOCAL ROLE ${role}`);
          await expect(
            c.query("SELECT * FROM xiangqi_ai.controllers"),
          ).rejects.toMatchObject({ code: "42501" });
        } finally {
          await c.query("ROLLBACK");
          c.release();
        }
      }
      expect(
        (
          await pool.query(
            "SELECT bool_and(relrowsecurity AND relforcerowsecurity) AS safe FROM pg_catalog.pg_class WHERE oid IN('xiangqi_ai.tabs'::regclass,'xiangqi_ai.controllers'::regclass,'xiangqi_ai.presence'::regclass)",
          )
        ).rows[0].safe,
      ).toBe(true);
    });
    it("refuses rollback writes and preserves existing reservation11 after empty inverse", async () => {
      const f = await fixture();
      await apply(rollback);
      expect(
        (
          await pool.query(
            "SELECT to_regclass('xiangqi_ai.boots') IS NOT NULL present",
          )
        ).rows[0].present,
      ).toBe(true);
      await apply(migration);
      await run(f.a, (s) => f.port.attach(s, f.o.tab));
      await expect(apply(rollback)).rejects.toThrow("AI presence writes exist");
    });
    it.each(["retention", "boot"] as const)(
      "samples %s deadline after unchanged controller-row lock waits",
      async (operation) => {
        const f = await fixture(),
          id = await game(f);
        if (operation === "retention") {
          await run(f.a, (s) =>
            f.port.disconnected(s, { ...f.o.tab, gameId: id }),
          );
          await pool.query(
            "UPDATE xiangqi_ai.presence SET disconnected_at=clock_timestamp()-interval '30 minutes'+interval '1 second' WHERE game_id=$1",
            [id],
          );
        } else
          await pool.query(
            "UPDATE xiangqi_ai.boots SET lease_until=clock_timestamp()+interval '1 second' WHERE id=$1",
            [f.boot.id],
          );
        const holder = await pool.connect();
        let committed = false;
        try {
          await holder.query("BEGIN");
          await holder.query(
            "SELECT owner_id FROM xiangqi_ai.controllers WHERE owner_id=$1 FOR UPDATE",
            [f.a.userId],
          );
          const pending = (
            operation === "retention"
              ? run(f.a, (s) =>
                  f.port.attach(s, {
                    tabId: f.o.tab.tabId,
                    connectionId: randomUUID(),
                  }),
                )
              : run(f.a, (s) => f.port.authorize(s, f.o))
          ).then(
            (value) => ({ value, error: undefined }),
            (error) => ({ value: undefined, error }),
          );
          let blocked = false;
          for (let n = 0; n < 100; n++) {
            blocked =
              (
                await pool.query(
                  "SELECT count(*)::int n FROM pg_catalog.pg_stat_activity WHERE wait_event_type='Lock' AND query LIKE '%xiangqi_ai.controllers%'",
                )
              ).rows[0].n > 0;
            if (blocked) break;
            await new Promise((r) => setTimeout(r, 2));
          }
          expect(blocked).toBe(true);
          if (operation === "retention")
            await pool.query(
              "SELECT pg_sleep(GREATEST(0,extract(epoch FROM disconnected_at+interval '30 minutes'-clock_timestamp()))+0.02) FROM xiangqi_ai.presence WHERE game_id=$1",
              [id],
            );
          else
            await pool.query(
              "SELECT pg_sleep(GREATEST(0,extract(epoch FROM lease_until-clock_timestamp()))+0.02) FROM xiangqi_ai.boots WHERE id=$1",
              [f.boot.id],
            );
          await holder.query("COMMIT");
          committed = true;
          const result = await pending;
          if (operation === "retention")
            expect(result.value).toMatchObject({ status: "expired" });
          else expect(result.error).toMatchObject({ code: "AI_BOOT_EXPIRED" });
        } finally {
          if (!committed) await holder.query("ROLLBACK");
          holder.release();
        }
      },
    );

    it("disconnects pre-admission physical control without inventing a game", async () => {
      const f = await fixture();
      await run(f.a, (s) => f.port.attach(s, f.o.tab));
      await run(f.a, (s) =>
        f.port.disconnected(s, { ...f.o.tab, gameId: null }),
      );
      await expect(
        run(f.a, (s) => f.port.authorize(s, f.o)),
      ).rejects.toMatchObject({ code: "TAB_READ_ONLY" });
      expect(
        (await pool.query("SELECT count(*)::int n FROM xiangqi_ai.presence"))
          .rows[0].n,
      ).toBe(0);
    });
    it("never applies an old game disconnect to a replacement game on the same socket", async () => {
      const f = await fixture(),
        old = await game(f),
        next = randomUUID();
      await run(f.a, async (scope) => {
        await reservations.release(scope, { gameId: old, bootId: f.boot.id });
        await reservations.reserve(scope, { gameId: next, bootId: f.boot.id });
        await f.port.bindGame(scope, next, f.o);
      });
      await run(f.a, (s) =>
        f.port.disconnected(s, { ...f.o.tab, gameId: old }),
      );
      await run(f.a, (s) => f.port.authorize(s, f.o));
      expect(
        (
          await pool.query(
            "SELECT game_id,connected,disconnected_at FROM xiangqi_ai.presence",
          )
        ).rows[0],
      ).toEqual({ game_id: next, connected: true, disconnected_at: null });
    });
    it("does not silently accept missing physical binding or malformed socket identifiers", async () => {
      const f = await fixture();
      await expect(
        run(f.a, (s) =>
          f.port.attach(s, {
            tabId: f.o.tab.tabId,
            connectionId: "bad\nconnection",
          }),
        ),
      ).rejects.toMatchObject({ code: "AI_INPUT_INVALID" });
      const id = randomUUID();
      await run(f.a, (s) =>
        reservations.reserve(s, { gameId: id, bootId: f.boot.id }),
      );
      await expect(
        run(f.a, (s) => f.port.assertRetained(s, id)),
      ).rejects.toMatchObject({ code: "AI_PRESENCE_UNAVAILABLE" });
      await expect(
        sql((c) =>
          f.port.dueExpired(c, { leaseMilliseconds: "NaN", gameId: id }),
        ),
      ).rejects.toMatchObject({ code: "AI_INPUT_INVALID" });
    });
    it("denies runtime deletes/immutable namespace updates and bounds durable generation", async () => {
      const f = await fixture();
      await game(f);
      for (const query of [
        "DELETE FROM xiangqi_ai.tabs",
        "DELETE FROM xiangqi_ai.controllers",
        "DELETE FROM xiangqi_ai.presence",
        "UPDATE xiangqi_ai.controllers SET owner_id=owner_id",
        "UPDATE xiangqi_ai.controllers SET boot_id=boot_id",
        "UPDATE xiangqi_ai.presence SET boot_id=boot_id",
        "UPDATE xiangqi_ai.tabs SET first_seen_at=first_seen_at",
      ]) {
        await expect(sql((c) => c.query(query))).rejects.toMatchObject({
          code: "42501",
        });
      }
      await expect(
        sql((c) =>
          c.query(
            "UPDATE xiangqi_ai.controllers SET generation=9007199254740992",
          ),
        ),
      ).rejects.toMatchObject({ code: "23514" });
    });
    it.each([
      "ALTER TABLE xiangqi_ai.controllers NO FORCE ROW LEVEL SECURITY",
      "GRANT SELECT ON xiangqi_ai.presence TO authenticated",
      "ALTER TABLE xiangqi_ai.controllers ALTER COLUMN connected SET DEFAULT true",
      "CREATE VIEW public.unexpected_ai_controller AS SELECT owner_id FROM xiangqi_ai.controllers",
      "CREATE TABLE public.unexpected_ai_tab(owner_id uuid,boot_id uuid,tab_id uuid,FOREIGN KEY(owner_id,boot_id,tab_id) REFERENCES xiangqi_ai.tabs(owner_id,boot_id,tab_id))",
    ])(
      "refuses rollback drift/dependency before dropping tables: %s",
      async (change) => {
        await pool.query(change);
        await expect(apply(rollback)).rejects.toThrow(
          "AI presence metadata changed",
        );
        expect(
          (
            await pool.query(
              "SELECT to_regclass('xiangqi_ai.controllers') IS NOT NULL present",
            )
          ).rows[0].present,
        ).toBe(true);
      },
    );
  },
);
