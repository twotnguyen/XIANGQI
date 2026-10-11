import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { Pool, type PoolClient } from "pg";
export const databaseUrl = process.env.MATCH_TEST_DATABASE_URL;
if (databaseUrl) {
  const u = new URL(databaseUrl);
  if (
    u.hostname !== "127.0.0.1" ||
    u.port !== "55447" ||
    u.pathname !== "/xiangqi_match_test" ||
    u.search ||
    u.hash
  )
    throw new Error(
      "Match tests require dedicated synthetic 127.0.0.1:55447/xiangqi_match_test",
    );
}
export const pool = new Pool({ connectionString: databaseUrl });
export async function apply(file: string) {
  const c = await pool.connect();
  try {
    if (!file.includes("test-fixture")) await c.query("SET ROLE postgres");
    await c.query(await readFile(file, "utf8"));
  } finally {
    await c.query("ROLLBACK; RESET ROLE");
    c.release();
  }
}
export async function reset() {
  if (!databaseUrl) throw new Error("Dedicated test URL required");
  await pool.query(
    "DROP SCHEMA IF EXISTS xiangqi_room CASCADE; DROP SCHEMA IF EXISTS xiangqi_realtime CASCADE; DROP SCHEMA IF EXISTS xiangqi_auth CASCADE; DROP SCHEMA IF EXISTS public CASCADE; DROP SCHEMA IF EXISTS auth CASCADE; CREATE SCHEMA public",
  );
  await apply("apps/server/src/schema/managed-auth.test-fixture.sql");
  await pool.query(
    "ALTER SCHEMA public OWNER TO postgres; GRANT app_server TO postgres WITH SET TRUE; CREATE TABLE auth.identities(id uuid PRIMARY KEY,user_id uuid REFERENCES auth.users(id),provider text NOT NULL,provider_id text NOT NULL,identity_data jsonb DEFAULT '{}',UNIQUE(provider,provider_id)); ALTER TABLE auth.identities OWNER TO supabase_auth_admin; GRANT SELECT,TRIGGER,REFERENCES ON auth.identities TO postgres",
  );
  await apply("supabase/baseline/20260913_legacy_public.sql");
  for (const file of [
    "20261011000001_email_registration",
    "20261011000002_realtime",
    "20261011000003_username_login",
    "20261011000004_legacy_moves_security",
    "20261011000005_google_guest",
    "20261011000006_rooms",
  ])
    await apply(`supabase/migrations/${file}.sql`);
}
export async function actor() {
  const id = randomUUID();
  await pool.query(
    "INSERT INTO xiangqi_auth.principals(id,kind) VALUES($1,'guest');",
    [id],
  );
  await pool.query(
    "INSERT INTO public.profiles(user_id,username,display_name) VALUES($1,$2,$3)",
    [id, "g" + id.replaceAll("-", "").slice(0, 18), "Synthetic Guest"],
  );
  return { userId: id, kind: "guest" as const };
}
export async function transaction<T>(
  ids: string[],
  roomIds: string[],
  work: (c: PoolClient) => Promise<T>,
  beforeRooms?: (c: PoolClient) => Promise<void>,
) {
  const c = await pool.connect();
  try {
    await c.query("BEGIN; SET LOCAL ROLE app_server");
    for (const id of [...new Set(ids)].sort())
      await c.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [
        "actor:" + id,
      ]);
    await beforeRooms?.(c);
    for (const id of [...new Set(roomIds)].sort())
      await c.query("SELECT pg_advisory_xact_lock(hashtextextended($1,0))", [
        "room:" + id,
      ]);
    const v = await work(c);
    await c.query("COMMIT");
    return v;
  } catch (e) {
    await c.query("ROLLBACK");
    throw e;
  } finally {
    c.release();
  }
}
