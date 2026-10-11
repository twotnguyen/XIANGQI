import { randomUUID } from "node:crypto";
import { afterAll, beforeEach, describe, expect, it } from "vitest";
import { actor, apply, databaseUrl, pool, reset } from "./room.test-helper.js";
const rollback = "supabase/rollback/20261011000008_room_modes.sql";
let legacyRoom: string;
async function admin(sql: string) {
  const client = await pool.connect();
  try {
    await client.query("SET ROLE postgres");
    await client.query(sql);
  } finally {
    await client.query("ROLLBACK; RESET ROLE");
    client.release();
  }
}
async function state() {
  const guard = (
    await pool.query(`SELECT pg_catalog.pg_get_functiondef(p.oid) AS definition,
    p.proowner::pg_catalog.regrole::text AS owner,p.proacl::text AS acl,p.proconfig AS config
    FROM pg_catalog.pg_proc p WHERE p.oid='xiangqi_room.guard_settings()'::pg_catalog.regprocedure`)
  ).rows;
  const columns = (
    await pool.query(`SELECT a.attname,a.atttypid::pg_catalog.regtype::text AS type,a.attnotnull,
    a.attacl::text AS acl,a.attstattarget,pg_catalog.pg_get_expr(d.adbin,d.adrelid) AS default_expression
    FROM pg_catalog.pg_attribute a LEFT JOIN pg_catalog.pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum
    WHERE a.attrelid='public.rooms'::pg_catalog.regclass AND a.attnum>0 AND NOT a.attisdropped ORDER BY a.attnum`)
  ).rows;
  const indexes = (
    await pool.query(`SELECT c.relname,c.relowner::pg_catalog.regrole::text AS owner,
    c.relacl::text AS acl,pg_catalog.pg_get_indexdef(c.oid) AS definition
    FROM pg_catalog.pg_index i JOIN pg_catalog.pg_class c ON c.oid=i.indexrelid
    WHERE i.indrelid='public.rooms'::pg_catalog.regclass ORDER BY c.relname`)
  ).rows;
  const sentinel = (
    await pool.query(`SELECT pg_catalog.pg_get_functiondef(p.oid) AS definition,p.proacl::text AS acl
    FROM pg_catalog.pg_proc p WHERE p.oid='xiangqi_room.rollback_sentinel()'::pg_catalog.regprocedure`)
  ).rows;
  const rows = (
    await pool.query(
      "SELECT to_jsonb(r) AS data FROM public.rooms r ORDER BY id",
    )
  ).rows;
  const events = (
    await pool.query(
      "SELECT to_jsonb(e) AS data FROM xiangqi_room.outbox e ORDER BY id",
    )
  ).rows;
  const relations = (
    await pool.query(`SELECT c.relname,c.relowner::pg_catalog.regrole::text AS owner,
    c.relacl::text AS acl,c.relrowsecurity,c.relforcerowsecurity
    FROM pg_catalog.pg_class c WHERE c.oid IN('public.rooms'::pg_catalog.regclass,'xiangqi_room.outbox'::pg_catalog.regclass)
    ORDER BY c.relname`)
  ).rows;
  return { guard, columns, indexes, sentinel, rows, events, relations };
}
describe.skipIf(!databaseUrl)(
  "room modes rollback on dedicated synthetic PostgreSQL",
  () => {
    beforeEach(async () => {
      await reset();
      await apply("supabase/migrations/20261011000006_rooms.sql");
      const owner = await actor();
      legacyRoom = randomUUID();
      await pool.query(
        "INSERT INTO public.rooms(id,owner_id,name,visibility,time_control) VALUES($1,$2,'Retained legacy room','PUBLIC',0)",
        [legacyRoom, owner.userId],
      );
      await pool.query(
        "INSERT INTO xiangqi_room.outbox(id,room_id,room_version,type,payload) VALUES($1,$2,0,'room.created','{}')",
        [randomUUID(), legacyRoom],
      );
      await admin(
        "ALTER TABLE public.rooms ADD COLUMN rollback_sentinel text DEFAULT 'retained'; CREATE FUNCTION xiangqi_room.rollback_sentinel() RETURNS text LANGUAGE sql AS $$ SELECT 'retained'::text $$; GRANT EXECUTE ON FUNCTION xiangqi_room.rollback_sentinel() TO anon",
      );
    });
    afterAll(() => pool.end());
    it("restores guard000006 exactly, preserving legacy data, ACLs and unrelated columns/functions", async () => {
      const before = await state();
      await apply("supabase/migrations/20261011000008_room_modes.sql");
      await apply(rollback);
      expect(await state()).toEqual(before);
      expect(
        (
          await pool.query(
            "SELECT pg_catalog.md5(pg_catalog.pg_get_functiondef('xiangqi_room.guard_settings()'::pg_catalog.regprocedure)) AS hash",
          )
        ).rows[0].hash,
      ).toBe("cc010113700c96512b49314e0fe01886");
    });
    it.each(["timestamp", "event"] as const)(
      "refuses %s feature writes without discarding history or changing metadata",
      async (type) => {
        await apply("supabase/migrations/20261011000008_room_modes.sql");
        if (type === "timestamp")
          await pool.query(
            "UPDATE public.rooms SET public_opened_at=clock_timestamp() WHERE id=$1",
            [legacyRoom],
          );
        else
          await pool.query(
            "INSERT INTO xiangqi_room.outbox(id,room_id,room_version,type,payload) VALUES($1,$2,0,'room.visibility-changed','{\"visibility\":\"CODE_ONLY\"}')",
            [randomUUID(), legacyRoom],
          );
        const before = await state();
        await expect(apply(rollback)).rejects.toThrow(
          "Room mode feature writes exist; rollback refused",
        );
        expect(await state()).toEqual(before);
      },
    );
    it.each([
      [
        "guard source",
        "CREATE OR REPLACE FUNCTION xiangqi_room.guard_settings() RETURNS trigger LANGUAGE plpgsql SET search_path='' AS $$ BEGIN RETURN NEW; END $$",
      ],
      [
        "guard config",
        "ALTER FUNCTION xiangqi_room.guard_settings() SET search_path='public'",
      ],
      [
        "guard owner",
        "GRANT CREATE ON SCHEMA xiangqi_room TO app_server; ALTER FUNCTION xiangqi_room.guard_settings() OWNER TO app_server",
      ],
      [
        "guard ACL",
        "GRANT EXECUTE ON FUNCTION xiangqi_room.guard_settings() TO anon",
      ],
      [
        "column default",
        "ALTER TABLE public.rooms ALTER COLUMN public_opened_at SET DEFAULT now()",
      ],
      ["column ACL", "GRANT SELECT(public_opened_at) ON public.rooms TO anon"],
      [
        "column statistics",
        "ALTER TABLE public.rooms ALTER COLUMN public_opened_at SET STATISTICS 10",
      ],
      [
        "index shape",
        "DROP INDEX public.rooms_public_opened; CREATE INDEX rooms_public_opened ON public.rooms(public_opened_at,id)",
      ],
      [
        "additional column dependency",
        "CREATE INDEX room_opened_unknown ON public.rooms(public_opened_at)",
      ],
    ])(
      "refuses %s drift and preserves that independent change",
      async (_, sql) => {
        await apply("supabase/migrations/20261011000008_room_modes.sql");
        await admin(sql);
        const before = await state();
        await expect(apply(rollback)).rejects.toThrow(
          "Room mode metadata changed; rollback refused",
        );
        expect(await state()).toEqual(before);
      },
    );
    it("does not resolve rollback audit builtins through public shadows", async () => {
      await apply("supabase/migrations/20261011000008_room_modes.sql");
      await admin(
        "CREATE FUNCTION public.md5(text) RETURNS text LANGUAGE sql AS $$ SELECT 'shadow'::text $$; CREATE FUNCTION public.pg_get_functiondef(oid) RETURNS text LANGUAGE sql AS $$ SELECT 'shadow'::text $$",
      );
      await apply(rollback);
      expect(
        (
          await pool.query(
            "SELECT pg_catalog.md5(pg_catalog.pg_get_functiondef('xiangqi_room.guard_settings()'::pg_catalog.regprocedure)) AS hash",
          )
        ).rows[0].hash,
      ).toBe("cc010113700c96512b49314e0fe01886");
      expect(
        (
          await pool.query(
            "SELECT pg_catalog.to_regprocedure('public.md5(text)') IS NOT NULL AS preserved",
          )
        ).rows[0].preserved,
      ).toBe(true);
    });
  },
);
