import type { DynamicModule } from "@nestjs/common";
import type { Pool } from "pg";
import { MediaModule } from "./media.module.js";
import { MediaAccess } from "./media-access.js";
import type { SessionService } from "../login/session.service.js";
export interface MediaRuntime {
  module: DynamicModule;
  access: MediaAccess;
}
export function readMediaConfig(env: Record<string, string | undefined>) {
  const url = env.LIVEKIT_URL ?? "";
  const apiKey = env.LIVEKIT_API_KEY ?? "";
  const apiSecret = env.LIVEKIT_API_SECRET ?? "";
  if (!url || !apiKey || !apiSecret) return null;
  if (!/^wss?:\/\/.+/.test(url)) throw new Error("Invalid media configuration");
  return { url, apiKey, apiSecret };
}
export async function createMediaRuntime(
  env: Record<string, string | undefined>,
  registration: { pool: Pool; sessions: SessionService | null } | null,
): Promise<MediaRuntime | null> {
  const config = readMediaConfig(env);
  if (!config || !registration?.sessions) return null;
  const access = new MediaAccess(config, registration.pool);
  return { module: MediaModule.forRoot(access, registration.sessions), access };
}
