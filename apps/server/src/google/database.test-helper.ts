import { readFile } from "node:fs/promises";
import { Pool, type PoolClient } from "pg";
export const databaseUrl = process.env.GOOGLE_GUEST_TEST_DATABASE_URL;
if (databaseUrl) {
  const url = new URL(databaseUrl);
  if (
    url.hostname !== "127.0.0.1" ||
    url.port !== "55445" ||
    url.pathname !== "/google_guest_test" ||
    url.search ||
    url.hash
  )
    throw new Error(
      "Google/Guest tests require the dedicated synthetic database on 127.0.0.1:55445/google_guest_test without URI options",
    );
}
export const pool = new Pool({ connectionString: databaseUrl });
export async function asRole<T>(
  role:
    | "postgres"
    | "app_server"
    | "authenticated"
    | "anon"
    | "supabase_auth_admin",
  work: (client: PoolClient) => Promise<T>,
) {
  const client = await pool.connect();
  try {
    await client.query(`SET ROLE ${role}`);
    return await work(client);
  } finally {
    await client.query("ROLLBACK");
    await client.query("RESET ROLE");
    client.release();
  }
}
export async function apply(path: string) {
  await asRole("postgres", async (client) => {
    await client.query(await readFile(path, "utf8"));
  });
}
export async function baseline() {
  if (!databaseUrl) throw new Error("Dedicated test URL required");
  const admin = (
    await pool.query("SELECT rolsuper FROM pg_roles WHERE rolname=current_user")
  ).rows[0];
  if (!admin?.rolsuper)
    throw new Error(
      "Synthetic fixture requires its own superuser administrator",
    );
  await pool.query(
    (
      await readFile(
        "apps/server/src/schema/managed-auth.test-fixture.sql",
        "utf8",
      )
    ).split("CREATE SCHEMA auth")[0]!,
  );
  await pool.query(
    "DROP SCHEMA IF EXISTS xiangqi_realtime CASCADE; DROP SCHEMA IF EXISTS xiangqi_auth CASCADE; DROP SCHEMA IF EXISTS public CASCADE; DROP SCHEMA IF EXISTS auth CASCADE; CREATE SCHEMA public AUTHORIZATION postgres",
  );
  let managed = await readFile(
    "apps/server/src/schema/managed-auth.test-fixture.sql",
    "utf8",
  );
  managed = managed.slice(
    managed.indexOf("CREATE SCHEMA auth"),
    managed.indexOf("GRANT app_server TO postgres"),
  );
  await pool.query(managed);
  await pool.query(
    "GRANT app_server TO postgres WITH ADMIN TRUE, SET TRUE, INHERIT FALSE",
  );
  await pool.query(
    `CREATE TABLE auth.identities(id uuid PRIMARY KEY, user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE, provider text NOT NULL, provider_id text NOT NULL, identity_data jsonb NOT NULL DEFAULT '{}', UNIQUE(provider,provider_id)); ALTER TABLE auth.identities OWNER TO supabase_auth_admin; ALTER TABLE auth.users ENABLE ROW LEVEL SECURITY; ALTER TABLE auth.identities ENABLE ROW LEVEL SECURITY; GRANT SELECT,TRIGGER,REFERENCES ON auth.identities TO postgres;`,
  );
  await apply("supabase/baseline/20260913_legacy_public.sql");
  for (const name of [
    "20261011000001_email_registration",
    "20261011000002_realtime",
    "20261011000003_username_login",
    "20261011000004_legacy_moves_security",
  ])
    await apply(`supabase/migrations/${name}.sql`);
}
