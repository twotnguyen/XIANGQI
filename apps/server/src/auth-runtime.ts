import { Pool } from "pg";
import { readFileSync } from "node:fs";
import type { DynamicModule } from "@nestjs/common";
import { RegistrationModule } from "./auth/registration.module.js";
import { PostgresRegistrationStore } from "./auth/postgres-store.js";
import { SupabaseAuth } from "./auth/supabase-auth.js";
import { RegistrationError } from "./auth/contracts.js";
import { LoginError } from "./login/contracts.js";
import { LoginController } from "./login/login.controller.js";
import { LoginService } from "./login/login.service.js";
import { PostgresLoginStore } from "./login/postgres-login-store.js";
import { SessionService } from "./login/session.service.js";
import { SessionModule } from "./session/session.module.js";

export function readRegistrationConfig(
  env: Record<string, string | undefined>,
) {
  const enabled = env.AUTH_REGISTRATION_ENABLED ?? "false";
  const loginEnabled = env.AUTH_LOGIN_ENABLED ?? "false";
  if (
    !["true", "false"].includes(loginEnabled) ||
    (loginEnabled === "true" && enabled !== "true")
  )
    throw new Error("Invalid registration configuration");
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
    return {
      url,
      publishable,
      secret,
      databaseUrl,
      loginEnabled: loginEnabled === "true",
    };
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
  const poolOptions = {
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
  };
  const pool = new Pool(poolOptions);
  let sessionPool: Pool | null = null;
  try {
    const schema = await pool.query(
      "SELECT to_regclass('xiangqi_auth.registration_intents') IS NOT NULL AS ready, pg_has_role(current_user, 'app_server', 'SET') AS \"canAssumeRole\", to_regclass('xiangqi_auth.app_sessions') IS NOT NULL AND to_regclass('xiangqi_auth.login_attempts') IS NOT NULL AS \"loginReady\"",
    );
    if (
      !schema.rows[0]?.ready ||
      !schema.rows[0]?.canAssumeRole ||
      (settings.loginEnabled && !schema.rows[0]?.loginReady)
    )
      throw new Error();
    if (settings.loginEnabled) {
      // Registration keeps its connection while invoking password/session work.
      // A separate pool prevents five concurrent registrations exhausting their own nested calls.
      sessionPool = new Pool(poolOptions);
      await sessionPool.query("SELECT 1");
    }
  } catch {
    await Promise.all([pool.end(), sessionPool?.end()]);
    throw new Error("Registration migration is not ready");
  }
  const auth = new SupabaseAuth(
    settings.url,
    settings.publishable,
    settings.secret,
  );
  const sessions = sessionPool
    ? new SessionService(new PostgresLoginStore(sessionPool), auth)
    : null;
  const login = sessions
    ? new LoginService(sessions.store, auth, sessions)
    : null;
  const module: DynamicModule = RegistrationModule.forRoot(
    new PostgresRegistrationStore(pool),
    auth,
    sessions ? (userId) => sessions.issue(userId) : null,
    login
      ? async (account, password) => {
          try {
            return await login.authenticateRegistration(account, password);
          } catch (error) {
            if (error instanceof LoginError)
              throw new RegistrationError(
                error.code === "LOGIN_LOCKED"
                  ? "RECOVERY_RATE_LIMIT"
                  : error.code === "LOGIN_INVALID"
                    ? "RECOVERY_PASSWORD_INVALID"
                    : "AUTH_PROVIDER_ERROR",
                error.message,
                error.status,
              );
            throw error;
          }
        }
      : null,
  );
  if (sessions && login) {
    module.imports = [
      SessionModule.forRoot(
        sessions,
        (token) => auth.refreshSession(token),
        env.NODE_ENV === "production",
      ),
    ];
    module.controllers = [...(module.controllers ?? []), LoginController];
    module.providers = [
      ...(module.providers ?? []),
      { provide: LoginService, useValue: login },
    ];
  }
  let closing: Promise<void> | undefined;
  const close = () =>
    (closing ??= Promise.all([pool.end(), sessionPool?.end()]).then(() => {}));
  module.providers = [
    ...(module.providers ?? []),
    {
      provide: "SESSION_COOKIE_SECURE",
      useValue: env.NODE_ENV === "production",
    },
    {
      provide: "REGISTRATION_POOL_LIFECYCLE",
      useValue: { onModuleDestroy: close },
    },
  ];
  return {
    module,
    sessions,
    checkDatabase: async () => {
      await pool.query("SELECT 1");
      await sessionPool?.query("SELECT 1");
    },
    close,
  };
}
