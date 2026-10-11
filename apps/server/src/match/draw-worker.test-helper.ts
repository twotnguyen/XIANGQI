import { readFile } from "node:fs/promises";
import { Pool } from "pg";
export const databaseUrl = process.env.DRAW_WORKER_TEST_DATABASE_URL;
if (databaseUrl) {
  const u = new URL(databaseUrl);
  if (
    u.hostname !== "127.0.0.1" ||
    u.port !== "55452" ||
    u.pathname !== "/xiangqi_room_runtime_test" ||
    u.search ||
    u.hash
  )
    throw new Error(
      "Draw worker tests require dedicated synthetic 127.0.0.1:55452/xiangqi_room_runtime_test",
    );
}
export const pool = new Pool({ connectionString: databaseUrl });
async function apply(file: string) {
  const client = await pool.connect();
  try {
    if (!file.includes("test-fixture")) await client.query("SET ROLE postgres");
    await client.query(await readFile(file, "utf8"));
  } finally {
    await client.query("ROLLBACK; RESET ROLE");
    client.release();
  }
}
export async function reset() {
  if (!databaseUrl) throw new Error("Dedicated draw worker URL required");
  await pool.query(
    "DROP SCHEMA IF EXISTS xiangqi_room CASCADE; DROP SCHEMA IF EXISTS xiangqi_realtime CASCADE; DROP SCHEMA IF EXISTS xiangqi_auth CASCADE; DROP SCHEMA IF EXISTS public CASCADE; DROP SCHEMA IF EXISTS auth CASCADE; CREATE SCHEMA public",
  );
  await apply("apps/server/src/schema/managed-auth.test-fixture.sql");
  await pool.query(
    "ALTER SCHEMA public OWNER TO postgres; GRANT app_server TO postgres WITH SET TRUE; CREATE TABLE auth.identities(id uuid PRIMARY KEY,user_id uuid REFERENCES auth.users(id),provider text NOT NULL,provider_id text NOT NULL,identity_data jsonb DEFAULT '{}',UNIQUE(provider,provider_id)); ALTER TABLE auth.identities OWNER TO supabase_auth_admin; GRANT SELECT,TRIGGER,REFERENCES ON auth.identities TO postgres",
  );
  await apply("supabase/baseline/20260913_legacy_public.sql");
  for (const name of [
    "email_registration",
    "realtime",
    "username_login",
    "legacy_moves_security",
    "google_guest",
    "rooms",
    "match_outcomes",
    "room_modes",
    "match_draw",
  ].entries())
    await apply(
      `supabase/migrations/20261011${String(name[0] + 1).padStart(6, "0")}_${name[1]}.sql`,
    );
}
