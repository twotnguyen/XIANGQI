import {
  Inject,
  Injectable,
  Module,
  type DynamicModule,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
} from "@nestjs/common";
import type {
  AuthProvider,
  RegistrationStore,
  Session,
} from "./registration.types.js";
import { RegistrationService } from "./registration.service.js";
import {
  RegistrationController,
  AccountActiveGuard,
  Providers,
  ProvidersController,
} from "./registration.controller.js";
import { logEvent } from "../../core/logger.js";
import { Pool } from "pg";
import { readFileSync } from "node:fs";
import { PostgresRegistrationStore } from "./registration.store.js";
import { SupabaseAuth } from "./supabase-auth.js";
import { RegistrationError } from "./registration.types.js";
import { LoginError } from "../login/login.types.js";
import { LoginController } from "../login/login.controller.js";
import { LoginService } from "../login/login.service.js";
import { PostgresLoginStore } from "../login/postgres-login-store.js";
import { SessionService } from "../login/session.service.js";
import { SessionModule } from "../session/session.module.js";
@Injectable()
class RegistrationMaintenance
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private timer?: ReturnType<typeof setInterval>;
  private running = false;
  constructor(
    @Inject(RegistrationService)
    private readonly registration: RegistrationService,
  ) {}
  onApplicationBootstrap() {
    const run = async () => {
      if (this.running) return;
      this.running = true;
      try {
        await this.registration.maintain();
      } catch {
        process.stderr.write(
          logEvent("error", "registration_maintenance_failed") + "\n",
        );
      } finally {
        this.running = false;
      }
    };
    void run();
    // First eligible cleanup at 60 minutes; the next tick is at most 65 minutes.
    this.timer = setInterval(() => void run(), 5 * 60000);
    this.timer.unref();
  }
  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
}

@Module({})
export class RegistrationModule {
  static forRoot(
    store: RegistrationStore,
    auth: AuthProvider,
    issueApplicationSession:
      | ((userId: string) => Promise<{ appSession: string; expiresAt: string }>)
      | null = null,
    authenticateRecovery:
      | ((
          account: { userId: string; email: string; username: string },
          password: string,
        ) => Promise<Session>)
      | null = null,
  ): DynamicModule {
    return {
      module: RegistrationModule,
      controllers: [RegistrationController],
      providers: [
        {
          provide: RegistrationService,
          useFactory: () =>
            new RegistrationService(
              store,
              auth,
              undefined,
              issueApplicationSession,
              authenticateRecovery,
            ),
        },
        AccountActiveGuard,
        RegistrationMaintenance,
      ],
      exports: [RegistrationService, AccountActiveGuard],
    };
  }
}
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
        new URL(
          "../../../../../supabase/certs/prod-ca-2021.crt",
          import.meta.url,
        ),
        "utf8",
      ),
      rejectUnauthorized: true,
    },
    max: 5,
    connectionTimeoutMillis: 10000,
  };
  const pool = new Pool(poolOptions);
  let sessionPool: Pool | null = null;
  let schemaReady = true;
  try {
    const schema = await pool.query(
      "SELECT to_regclass('xiangqi_auth.registration_intents') IS NOT NULL AS ready, pg_has_role(current_user, 'app_server', 'SET') AS \"canAssumeRole\", to_regclass('xiangqi_auth.app_sessions') IS NOT NULL AND to_regclass('xiangqi_auth.login_attempts') IS NOT NULL AS \"loginReady\"",
    );
    if (
      !schema.rows[0]?.ready ||
      !schema.rows[0]?.canAssumeRole ||
      (settings.loginEnabled && !schema.rows[0]?.loginReady)
    ) {
      schemaReady = false;
      throw new Error();
    }
    if (settings.loginEnabled) {
      // Registration keeps its connection while invoking password/session work.
      // A separate pool prevents five concurrent registrations exhausting their own nested calls.
      sessionPool = new Pool(poolOptions);
      await sessionPool.query("SELECT 1");
    }
  } catch {
    await Promise.all([pool.end(), sessionPool?.end()]);
    // A connection/TLS/timeout failure must not be reported as a missing migration.
    throw new Error(
      schemaReady
        ? "Registration database unavailable"
        : "Registration migration is not ready",
    );
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
    auth,
    pool,
    checkDatabase: async () => {
      await pool.query("SELECT 1");
      await sessionPool?.query("SELECT 1");
    },
    close,
  };
}
@Module({})
export class AuthProvidersModule {
  static forRoot(providers: Providers): DynamicModule {
    return {
      module: AuthProvidersModule,
      controllers: [ProvidersController],
      providers: [{ provide: "AUTH_PROVIDERS", useValue: providers }],
    };
  }
}
