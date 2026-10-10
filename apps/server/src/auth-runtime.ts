import { Pool } from "pg";
import { readFileSync } from "node:fs";
import type { DynamicModule } from "@nestjs/common";
import { RegistrationModule } from "./auth/registration.module.js";
import { PostgresRegistrationStore } from "./auth/postgres-store.js";
import { SupabaseAuth } from "./auth/supabase-auth.js";

export function readRegistrationConfig(
  env: Record<string, string | undefined>,
) {
  const enabled = env.AUTH_REGISTRATION_ENABLED ?? "false";
  if (enabled === "false") return null;
  const {
    SUPABASE_PROJECT_REF: ref,
    SUPABASE_URL: url,
    SUPABASE_PUBLISHABLE_KEY: publishable,
    SUPABASE_SECRET_KEY: secret,
    DIRECT_URL: databaseUrl,
  } = env;
  try {
    if (
      enabled !== "true" ||
      !ref ||
      !url ||
      !publishable ||
      !secret ||
      !databaseUrl
    )
      throw new Error();
    const database = new URL(databaseUrl);
    if (
      url !== `https://${ref}.supabase.co` ||
      !["postgres:", "postgresql:"].includes(database.protocol) ||
      database.port === "6543" ||
      database.searchParams.size > 0 ||
      !(
        database.hostname === `db.${ref}.supabase.co` ||
        decodeURIComponent(database.username) === `postgres.${ref}`
      )
    )
      throw new Error();
    return { url, publishable, secret, databaseUrl };
  } catch {
    throw new Error("Invalid registration configuration");
  }
}

export async function createRegistrationRuntime(
  env: Record<string, string | undefined>,
) {
  const settings = readRegistrationConfig(env);
  if (!settings) return null;
  // Session pooler is required because registration serializes remote Auth calls with session advisory locks.
  const pool = new Pool({
    connectionString: settings.databaseUrl,
    ssl: {
      ca: readFileSync(
        new URL("../../../supabase/certs/prod-ca-2021.crt", import.meta.url),
        "utf8",
      ),
      rejectUnauthorized: true,
    },
    max: 5,
    connectionTimeoutMillis: 10000,
  });
  try {
    const schema = await pool.query(
      "SELECT to_regclass('xiangqi_auth.registration_intents') IS NOT NULL AS ready, pg_has_role(current_user, 'app_server', 'SET') AS \"canAssumeRole\"",
    );
    if (!schema.rows[0]?.ready || !schema.rows[0]?.canAssumeRole)
      throw new Error();
  } catch {
    await pool.end();
    throw new Error("Registration migration is not ready");
  }
  const module: DynamicModule = RegistrationModule.forRoot(
    new PostgresRegistrationStore(pool),
    new SupabaseAuth(settings.url, settings.publishable, settings.secret),
  );
  let closing: Promise<void> | undefined;
  const close = () => (closing ??= pool.end());
  module.providers = [
    ...(module.providers ?? []),
    {
      provide: "REGISTRATION_POOL_LIFECYCLE",
      useValue: { onModuleDestroy: close },
    },
  ];
  return {
    module,
    checkDatabase: async () => {
      await pool.query("SELECT 1");
    },
    close,
  };
}
