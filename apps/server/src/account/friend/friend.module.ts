import { Module, type DynamicModule } from "@nestjs/common";
import type { Pool } from "pg";
import { FriendStore } from "./friend-store.js";
import { SessionService } from "../login/session.service.js";
import { SessionGuard } from "../login/session.guard.js";
import { FriendController } from "./friend.controller.js";
@Module({})
export class FriendModule {
  static forRoot(pool: Pool, sessions: SessionService): DynamicModule {
    return {
      module: FriendModule,
      controllers: [FriendController],
      providers: [
        { provide: FriendStore, useValue: new FriendStore(pool) },
        { provide: SessionService, useValue: sessions },
        SessionGuard,
      ],
    };
  }
}
export async function createFriendRuntime(
  env: Record<string, string | undefined>,
  registration: {
    pool: Pool;
    sessions: SessionService | null;
  } | null,
): Promise<{ module: DynamicModule; store: FriendStore } | null> {
  const enabled = env.FRIENDS_ENABLED ?? "false";
  if (enabled === "false") return null;
  if (
    enabled !== "true" ||
    env.AUTH_LOGIN_ENABLED !== "true" ||
    !registration?.sessions
  )
    throw new Error("Invalid Friend configuration");
  const pool = registration.pool;
  try {
    const schema = await pool.query(`SELECT
      has_schema_privilege('app_server','xiangqi_social','USAGE') AND
      (SELECT bool_and(pg_catalog.to_regclass(name) IS NOT NULL AND has_table_privilege('app_server',name,'SELECT')) FROM unnest(ARRAY[
        'xiangqi_social.friend_requests','xiangqi_social.friendships',
        'xiangqi_social.friend_decline_counts','xiangqi_social.room_invites']) name) AS ready`);
    if (!schema.rows[0]?.ready) throw new Error();
  } catch {
    throw new Error("Friend schema is not ready");
  }
  const store = new FriendStore(pool);
  return {
    module: FriendModule.forRoot(pool, registration.sessions),
    store,
  };
}
