import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { Pool, type PoolClient } from "pg";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
const url = process.env.SCHEMA_TEST_DATABASE_URL;
if (url) {
  const target = new URL(url);
  if (
    target.hostname !== "127.0.0.1" ||
    target.port !== "55443" ||
    target.pathname !== "/xiangqi_schema_test" ||
    target.searchParams.size > 0
  )
    throw new Error(
      "Schema tests require the dedicated local 55443 xiangqi_schema_test cluster",
    );
}
const baseline = "supabase/baseline/20260913_legacy_public.sql";
const migration =
  "supabase/migrations/20261011000004_legacy_moves_security.sql";
const rollback = "supabase/rollback/20261011000004_legacy_moves_security.sql";
describe.skipIf(!url)("audited legacy baseline and moves security", () => {
  const pool = new Pool({ connectionString: url });
  async function apply(file: string) {
    const client = await pool.connect();
    try {
      await client.query(await readFile(file, "utf8"));
    } finally {
      await client.query("ROLLBACK");
      client.release();
    }
  }
  async function reset() {
    await pool.query(
      "DROP SCHEMA IF EXISTS xiangqi_realtime CASCADE; DROP SCHEMA IF EXISTS xiangqi_auth CASCADE; DROP SCHEMA IF EXISTS public CASCADE; DROP SCHEMA IF EXISTS auth CASCADE; CREATE SCHEMA public AUTHORIZATION postgres",
    );
    await apply("apps/server/src/schema/managed-auth.test-fixture.sql");
    await apply(baseline);
  }
  async function metadata() {
    return (
      await pool.query(`SELECT relowner::regrole::text AS owner,relrowsecurity,relforcerowsecurity,
    (SELECT array_agg(a::text ORDER BY a::text) FROM unnest(relacl) a) AS acl,
    (SELECT jsonb_agg(jsonb_build_object('name',attname,'acl',attacl::text) ORDER BY attname) FROM pg_attribute WHERE attrelid=c.oid AND attnum>0 AND NOT attisdropped) AS columns,
    (SELECT jsonb_agg(pg_get_constraintdef(oid) ORDER BY conname) FROM pg_constraint WHERE conrelid=c.oid) AS constraints
    FROM pg_class c WHERE oid='public.moves'::regclass`)
    ).rows[0];
  }
  async function asRole<T>(
    role: string,
    work: (client: PoolClient) => Promise<T>,
  ) {
    const client = await pool.connect();
    try {
      await client.query(`SET ROLE ${role}`);
      return await work(client);
    } finally {
      try {
        await client.query("ROLLBACK");
        await client.query("RESET ROLE");
      } finally {
        client.release();
      }
    }
  }
  async function seedMove() {
    const user = randomUUID();
    const match = randomUUID();
    const move = randomUUID();
    await pool.query(
      "INSERT INTO auth.users(id,raw_user_meta_data) VALUES($1,$2)",
      [
        user,
        {
          signup_username: "seed" + user.slice(0, 8),
          signup_display_name: "Fixture Player",
        },
      ],
    );
    await pool.query(
      "INSERT INTO public.matches(id,mode,red_user_id,ai_side,ai_level,position) VALUES($1,'AI',$2,'BLACK','EASY',$3)",
      [match, user, { board: Array(90).fill(null), turn: "RED" }],
    );
    await pool.query(
      "INSERT INTO public.moves(id,match_id,move_number,player_id,side,from_x,from_y,to_x,to_y,piece_type) VALUES($1,$2,1,$3,'RED',0,6,0,5,'PAWN')",
      [move, match, user],
    );
    return move;
  }
  beforeAll(async () => {
    // This is a separate cluster: bootstrap only missing roles; never ALTER shared runtime roles.
    await pool.query(
      (
        await readFile(
          "apps/server/src/schema/managed-auth.test-fixture.sql",
          "utf8",
        )
      ).split("CREATE SCHEMA auth")[0]!,
    );
    await reset();
  });
  afterAll(async () => {
    await pool.end();
  });
  it("rebuilds all 19 legacy tables twice and chains handed migrations with generated profile ids", async () => {
    for (let pass = 0; pass < 2; pass++) {
      if (pass) await reset();
      expect(
        (
          await pool.query(
            "SELECT count(*)::int AS count FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r'",
          )
        ).rows[0].count,
      ).toBe(19);
      const user = randomUUID();
      await pool.query(
        "INSERT INTO auth.users(id,raw_user_meta_data,email_confirmed_at) VALUES($1,$2,now())",
        [
          user,
          {
            signup_username: "legacy" + user.slice(0, 6),
            signup_display_name: "Legacy Fixture",
          },
        ],
      );
      expect(
        (
          await pool.query(
            "SELECT id=user_id AS generated FROM public.profiles WHERE user_id=$1",
            [user],
          )
        ).rows[0].generated,
      ).toBe(true);
      for (const file of [
        "20261011000001_email_registration.sql",
        "20261011000002_realtime.sql",
        "20261011000003_username_login.sql",
      ])
        await asRole("postgres", (client) =>
          readFile(`supabase/migrations/${file}`, "utf8").then((sql) =>
            client.query(sql),
          ),
        );
      expect(
        (
          await pool.query(
            "SELECT to_regclass('xiangqi_auth.app_sessions') IS NOT NULL AS sessions,to_regclass('xiangqi_realtime.receipts') IS NOT NULL AS receipts",
          )
        ).rows[0],
      ).toEqual({ sessions: true, receipts: true });
      await asRole("postgres", (client) =>
        readFile(migration, "utf8").then((sql) => client.query(sql)),
      );
      expect((await metadata()).relforcerowsecurity).toBe(true);
    }
    await reset();
  });
  it("requires managed Auth without recreating it and rolls back an incomplete baseline", async () => {
    const source = await readFile(baseline, "utf8");
    expect(source).not.toMatch(
      /CREATE\s+(SCHEMA\s+auth|TABLE\s+auth\.|ROLE)|ALTER\s+ROLE|PASSWORD\s*=/i,
    );
    await pool.query(
      "DROP SCHEMA public CASCADE; DROP SCHEMA auth CASCADE; CREATE SCHEMA public AUTHORIZATION postgres",
    );
    await expect(apply(baseline)).rejects.toMatchObject({ code: "3F000" });
    expect(
      (
        await pool.query(
          "SELECT count(*)::int AS count FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname='public' AND c.relkind='r'",
        )
      ).rows[0].count,
    ).toBe(0);
    await reset();
  });
  it("denies browser DML, TRUNCATE, REFERENCES, TRIGGER and MAINTAIN after hardening", async () => {
    await apply(migration);
    for (const role of ["anon", "authenticated"]) {
      const rights = (
        await pool.query(
          "SELECT has_table_privilege($1,'public.moves','SELECT,INSERT,UPDATE,DELETE,TRUNCATE,REFERENCES,TRIGGER,MAINTAIN') AS any",
          [role],
        )
      ).rows[0];
      expect(rights.any).toBe(false);
      for (const sql of [
        "SELECT * FROM public.moves",
        "INSERT INTO public.moves DEFAULT VALUES",
        "UPDATE public.moves SET move_number=2",
        "DELETE FROM public.moves",
        "TRUNCATE public.moves",
      ])
        await expect(asRole(role, (c) => c.query(sql))).rejects.toMatchObject({
          code: "42501",
        });
    }
    await apply(rollback);
  });
  it("restores exact ACL/FORCE/columns/FKs and preserves rows through service writes and rollback", async () => {
    const before = await metadata();
    const move = await seedMove();
    const rowBefore = (
      await pool.query("SELECT * FROM public.moves WHERE id=$1", [move])
    ).rows[0];
    await apply(migration);
    expect((await metadata()).relforcerowsecurity).toBe(true);
    await asRole("service_role", (client) =>
      client.query("UPDATE public.moves SET move_number=2 WHERE id=$1", [move]),
    );
    await apply(rollback);
    expect(await metadata()).toEqual(before);
    const after = (
      await pool.query("SELECT * FROM public.moves WHERE id=$1", [move])
    ).rows[0];
    expect(after).toEqual({ ...rowBefore, move_number: 2 });
  });
  it("refuses unknown original grants and refuses rollback over later privilege changes", async () => {
    await pool.query("GRANT SELECT ON public.moves TO PUBLIC");
    await expect(apply(migration)).rejects.toThrow("review required");
    await pool.query("REVOKE SELECT ON public.moves FROM PUBLIC");
    await apply(migration);
    await pool.query("GRANT SELECT ON public.moves TO authenticated");
    await expect(apply(rollback)).rejects.toThrow("rollback requires review");
    expect(
      (
        await pool.query(
          "SELECT has_table_privilege('authenticated','public.moves','SELECT') AS granted",
        )
      ).rows[0].granted,
    ).toBe(true);
    await pool.query("REVOKE SELECT ON public.moves FROM authenticated");
    await apply(rollback);
  });
  it("preserves unexpected column permissions and FORCE changes rather than overwriting them during rollback", async () => {
    await apply(migration);
    await pool.query(
      "GRANT SELECT(move_number) ON public.moves TO authenticated",
    );
    await expect(apply(rollback)).rejects.toThrow("rollback requires review");
    expect(
      (
        await pool.query(
          "SELECT has_column_privilege('authenticated','public.moves','move_number','SELECT') AS granted",
        )
      ).rows[0].granted,
    ).toBe(true);
    await pool.query(
      "REVOKE SELECT(move_number) ON public.moves FROM authenticated",
    );
    // Empty column ACL arrays differ from the audited NULL: restore only our synthetic fixture column state.
    await reset();
    await apply(migration);
    await pool.query("ALTER TABLE public.moves NO FORCE ROW LEVEL SECURITY");
    await expect(apply(rollback)).rejects.toThrow("rollback requires review");
    expect((await metadata()).relforcerowsecurity).toBe(false);
    await pool.query("ALTER TABLE public.moves FORCE ROW LEVEL SECURITY");
    await apply(rollback);
  });
  it("does not let a temporary catalog shadow hide an unexpected policy from rollback", async () => {
    await apply(migration);
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(
        "CREATE POLICY unexpected_browser_read ON public.moves FOR SELECT TO anon USING(true)",
      );
      await client.query(
        "CREATE TEMP VIEW pg_policy AS SELECT * FROM pg_catalog.pg_policy WHERE false",
      );
      const body = (await readFile(rollback, "utf8"))
        .replace(/^BEGIN;$/m, "")
        .replace(/^COMMIT;$/m, "");
      await expect(client.query(body)).rejects.toThrow(
        "rollback requires review",
      );
    } finally {
      await client.query("ROLLBACK");
      client.release();
    }
    await apply(rollback);
  });
});
