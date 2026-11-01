import { randomUUID } from "node:crypto";
import { initialPosition } from "@xiangqi/xiangqi-core";
import { encodePosition } from "@server/game/match/position-codec.js";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { apply, databaseUrl, pool, resetBase } from "../match/match.test-helper.js";

const migration = "supabase/migrations/20261103000012_yc9_ranked_guards.sql";
const rollback = "supabase/rollback/20261103000012_yc9_ranked_guards.sql";

describe.skipIf(!databaseUrl)("ranked schema hardening", () => {
  beforeEach(async () => {
    await pool.query("DROP SCHEMA IF EXISTS xiangqi_chat CASCADE; DROP SCHEMA IF EXISTS xiangqi_social CASCADE; DROP SCHEMA IF EXISTS xiangqi_ai CASCADE");
    await resetBase();
    await apply("supabase/migrations/20261011000008_room_modes.sql");
    await apply("supabase/migrations/20261011000007_match_outcomes.sql");
    await apply("supabase/migrations/20261102000003_unlimited_inactivity.sql");
    await apply("supabase/migrations/20261011000010_room_chat.sql");
    await apply("supabase/migrations/20261103000011_yc9_ranked.sql");
  });
  afterAll(async () => { await pool.end(); });

  it("restricts results to select and insert while ratings remain updateable", async () => {
    const before = await pool.connect();
    try {
      await before.query("BEGIN; SET LOCAL ROLE app_server");
      await expect(before.query("UPDATE xiangqi_room.ranked_results SET red_before=red_before")).resolves.toBeDefined();
    } finally { await before.query("ROLLBACK"); before.release(); }
    await apply(migration);
    const { rows } = await pool.query(`SELECT has_table_privilege('app_server','xiangqi_room.ranked_results','SELECT') AS can_select,
      has_table_privilege('app_server','xiangqi_room.ranked_results','INSERT') AS can_insert,
      has_table_privilege('app_server','xiangqi_room.ranked_results','UPDATE') AS can_update,
      has_table_privilege('app_server','xiangqi_room.ranked_results','DELETE') AS can_delete,
      has_table_privilege('app_server','xiangqi_room.ratings','UPDATE') AS ratings_update`);
    expect(rows[0]).toEqual({ can_select: true, can_insert: true, can_update: false, can_delete: false, ratings_update: true });
    const client = await pool.connect();
    try {
      await client.query("BEGIN; SET LOCAL ROLE app_server");
      await expect(client.query("UPDATE xiangqi_room.ranked_results SET red_before=red_before")).rejects.toMatchObject({ code: "42501" });
    } finally { await client.query("ROLLBACK"); client.release(); }
  });

  it("protects ranked room settings and kind", async () => {
    await apply(migration);
    const owner = randomUUID(), room = randomUUID();
    await pool.query("INSERT INTO xiangqi_auth.principals(id,kind) VALUES($1,'guest')", [owner]);
    await pool.query("INSERT INTO public.profiles(user_id,username,display_name) VALUES($1,$2,'Player')", [owner, `g${owner.replaceAll('-', '').slice(0, 18)}`]);
    await pool.query("INSERT INTO public.rooms(id,owner_id,name,kind,time_control,viewer_limit) VALUES($1,$2,'Ranked','RANKED',300,5)", [room, owner]);
    for (const update of ["time_control=600", "viewer_limit=4", "kind='CUSTOM'"]) {
      await expect(pool.query(`UPDATE public.rooms SET ${update} WHERE id=$1`, [room])).rejects.toThrow();
    }
    await expect(pool.query("INSERT INTO public.rooms(id,owner_id,name,kind,time_control,viewer_limit) VALUES($1,$2,'Invalid','RANKED',42,5)", [randomUUID(), owner])).rejects.toThrow();
  });

  it.each(["xiangqi_room.guard_settings()", "xiangqi_room.guard_seat_reservation()", "xiangqi_chat.sync_membership()", "xiangqi_room.guard_room_kind()"])("refuses unknown drift in %s atomically", async (fn) => {
    await pool.query(`CREATE OR REPLACE FUNCTION ${fn} RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$ BEGIN RETURN NULL; END $$`);
    const before = (await pool.query("SELECT pg_get_functiondef($1::regprocedure) AS definition", [fn])).rows[0].definition;
    await expect(apply(migration)).rejects.toThrow(/guard.*drift/i);
    expect((await pool.query("SELECT pg_get_functiondef($1::regprocedure) AS definition", [fn])).rows[0].definition).toBe(before);
    expect((await pool.query("SELECT has_table_privilege('app_server','xiangqi_room.ranked_results','UPDATE') AS allowed")).rows[0].allowed).toBe(true);
  });

  it("repairs a known pre-11 settings guard without changing the audited patched definition", async () => {
    const current = (await pool.query("SELECT pg_get_functiondef('xiangqi_room.guard_settings()'::regprocedure) AS def")).rows[0].def as string;
    const original = current
      .replaceAll("(OLD.invite_code IS NOT NULL OR OLD.kind IN ('CASUAL','RANKED'))", "OLD.invite_code IS NOT NULL")
      .replaceAll("(NEW.invite_code IS NOT NULL OR NEW.kind IN ('CASUAL','RANKED'))", "NEW.invite_code IS NOT NULL")
      .replaceAll("(NEW.invite_code IS NULL AND OLD.kind = 'CUSTOM') OR NEW.viewer_limit", "NEW.invite_code IS NULL OR NEW.viewer_limit");
    expect(original).not.toBe(current);
    await pool.query(original);
    await apply(migration);
    expect((await pool.query("SELECT pg_get_functiondef('xiangqi_room.guard_settings()'::regprocedure) AS def")).rows[0].def).toBe(current);
  });

  it("refuses disabled guard triggers atomically", async () => {
    await pool.query("ALTER TABLE public.rooms DISABLE TRIGGER room_kind_guard");
    await expect(apply(migration)).rejects.toThrow(/guard.*drift/i);
    expect((await pool.query("SELECT has_table_privilege('app_server','xiangqi_room.ranked_results','UPDATE') AS allowed")).rows[0].allowed).toBe(true);
  });

  it("rolls back without deleting results or ratings", async () => {
    await apply(migration);
    const owner = randomUUID(), other = randomUUID(), room = randomUUID(), match = randomUUID();
    for (const id of [owner, other]) {
      await pool.query("INSERT INTO xiangqi_auth.principals(id,kind) VALUES($1,'guest')", [id]);
      await pool.query("INSERT INTO public.profiles(user_id,username,display_name) VALUES($1,$2,'Player')", [id, `g${id.replaceAll('-', '').slice(0, 18)}`]);
    }
    await pool.query("INSERT INTO public.rooms(id,owner_id,name,time_control,kind) VALUES($1,$2,'Room',300,'CUSTOM')", [room, owner]);
    await pool.query("INSERT INTO public.matches(id,room_id,mode,status,red_user_id,black_user_id,position,version,created_at,ended_at,outcome) VALUES($1,$2,'ONLINE','FINISHED',$3,$4,$5,2,'2026-01-01','2026-10-01',$6)", [match, room, owner, other, encodePosition(initialPosition()), { reason: "RESIGN", winner: "RED" }]);
    await pool.query("INSERT INTO xiangqi_room.ratings(user_id) VALUES($1)", [owner]);
    await pool.query("INSERT INTO xiangqi_room.ranked_results(match_id,red_id,black_id,red_before,red_after,black_before,black_after,red_tier,black_tier,achieved_at) VALUES($1,$2,$3,1200,1216,1200,1184,'a','b',now())", [match, owner, other]);
    await apply(rollback);
    expect((await pool.query("SELECT count(*)::int AS n FROM xiangqi_room.ratings WHERE user_id=$1", [owner])).rows[0].n).toBe(1);
    expect((await pool.query("SELECT count(*)::int AS n FROM xiangqi_room.ranked_results WHERE match_id=$1", [match])).rows[0].n).toBe(1);
    expect((await pool.query("SELECT has_table_privilege('app_server','xiangqi_room.ranked_results','UPDATE') AS allowed")).rows[0].allowed).toBe(true);
  });
});
