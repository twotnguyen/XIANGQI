import type { DynamicModule } from "@nestjs/common";
import type { Pool } from "pg";
import { ProfileModule } from "./profile/profile.module.js";
import { ProfileStore } from "./profile/profile-store.js";
import type { SessionService } from "./login/session.service.js";
export async function createProfileRuntime(
  env: Record<string, string | undefined>,
  registration: {
    pool: Pool;
    sessions: SessionService | null;
  } | null,
): Promise<{ module: DynamicModule; store: ProfileStore } | null> {
  const enabled = env.PROFILE_ENABLED ?? "false";
  if (enabled === "false") return null;
  if (
    enabled !== "true" ||
    env.AUTH_LOGIN_ENABLED !== "true" ||
    !registration?.sessions
  )
    throw new Error("Invalid Profile configuration");
  const store = new ProfileStore(registration.pool);
  return {
    module: ProfileModule.forRoot(store, registration.sessions),
    store,
  };
}
