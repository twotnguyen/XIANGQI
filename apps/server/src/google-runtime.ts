export function readGoogleConfig(env: Record<string, string | undefined>) {
  const enabled = env.AUTH_GOOGLE_ENABLED ?? "false";
  if (enabled === "false") return null;
  const clientId = env.GOOGLE_CLIENT_ID;
  if (
    enabled !== "true" ||
    env.AUTH_LOGIN_ENABLED !== "true" ||
    !clientId ||
    clientId.length > 255
  )
    throw new Error("Invalid Google configuration");
  return { clientId };
}
import type { createRegistrationRuntime } from "./auth-runtime.js";
import { GoogleTokenVerifier } from "./auth/google-verifier.js";
import { GoogleService } from "./google/google.service.js";
import { GoogleModule } from "./google/google.module.js";
import { logEvent } from "./logger.js";

export async function createGoogleRuntime(
  env: Record<string, string | undefined>,
  registration: Awaited<ReturnType<typeof createRegistrationRuntime>>,
) {
  const settings = readGoogleConfig(env);
  if (!settings) return null;
  if (!registration?.sessions) throw new Error("Google migration is not ready");
  try {
    const schema = await registration.pool.query(`SELECT
      to_regclass('xiangqi_auth.google_challenges') IS NOT NULL
      AND to_regclass('xiangqi_auth.google_drafts') IS NOT NULL
      AND to_regclass('xiangqi_auth.google_creation_intents') IS NOT NULL
      AND to_regclass('xiangqi_auth.google_temporary_accounts') IS NOT NULL
      AND to_regclass('xiangqi_auth.account_origins') IS NOT NULL
      AND to_regclass('xiangqi_auth.google_subjects') IS NOT NULL
      AND EXISTS(SELECT 1 FROM pg_catalog.pg_trigger WHERE tgrelid='auth.users'::regclass AND tgname='a_xiangqi_member_origin' AND tgenabled IN ('O','A'))
      AND EXISTS(SELECT 1 FROM pg_catalog.pg_trigger WHERE tgrelid='auth.identities'::regclass AND tgname='xiangqi_google_identity' AND tgenabled IN ('O','A')) AS ready`);
    if (!schema.rows[0]?.ready) throw new Error();
  } catch {
    throw new Error("Google migration is not ready");
  }
  const sessions = registration.sessions;
  const service = new GoogleService(
    registration.pool,
    new GoogleTokenVerifier(settings.clientId),
    registration.auth,
    (userId, remember) => sessions.issue(userId, remember),
    settings.clientId,
  );
  const module = GoogleModule.forRoot(
    service,
    (token) => registration.auth.refreshSession(token),
    env.NODE_ENV === "production",
  );
  let timer: ReturnType<typeof setInterval> | undefined;
  let pending: Promise<void> | undefined;
  let closing = false;
  const run = () => {
    if (closing || pending) return;
    pending = service
      .maintain()
      .catch(() => {
        process.stderr.write(
          logEvent("error", "google_maintenance_failed") + "\n",
        );
      })
      .finally(() => {
        pending = undefined;
      });
  };
  module.providers = [
    ...(module.providers ?? []),
    {
      provide: "GOOGLE_MAINTENANCE",
      useValue: {
        onApplicationBootstrap() {
          run();
          timer = setInterval(run, 5 * 60000);
          timer.unref();
        },
        async onModuleDestroy() {
          closing = true;
          if (timer) clearInterval(timer);
          await pending;
        },
      },
    },
  ];
  return { module };
}
