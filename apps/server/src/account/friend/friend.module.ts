import { Module, type DynamicModule } from "@nestjs/common";
import type { Pool } from "pg";
import { FriendStore } from "./friend.store.js";
import { FriendService } from "./friend.service.js";
import { DirectMessageStore } from "./direct-message.store.js";
import { DirectMessageService } from "./direct-message.service.js";
import type { FriendRoomPort } from "./friend.room-port.js";
import { SessionService } from "../login/session.service.js";
import { SessionGuard } from "../login/session.guard.js";
import { FriendController } from "./friend.controller.js";
/**
 * Module NestJS đóng gói tính năng bạn bè, presence và lời mời phòng.
 */
@Module({})
export class FriendModule {
  /**
   * Tạo dynamic module; `rooms` là port root cung cấp để accept lời mời vào phòng.
   */
  static forRoot(
    pool: Pool,
    sessions: SessionService,
    rooms: FriendRoomPort,
  ): DynamicModule {
    return {
      module: FriendModule,
      controllers: [FriendController],
      providers: [
        {
          provide: FriendService,
          useValue: new FriendService(new FriendStore(pool), rooms),
        },
        { provide: SessionService, useValue: sessions },
        {
          provide: DirectMessageService,
          useValue: new DirectMessageService(new DirectMessageStore(pool)),
        },
        SessionGuard,
      ],
    };
  }
}
/**
 * Khởi tạo runtime cho hệ thống bạn bè nếu biến môi trường FRIENDS_ENABLED được kích hoạt.
 * Thẩm định quyền schema xiangqi_social và các bảng liên quan trước khi khởi chạy.
 */
export async function createFriendRuntime(
  env: Record<string, string | undefined>,
  registration: {
    pool: Pool;
    sessions: SessionService | null;
  } | null,
  rooms?: FriendRoomPort,
): Promise<{ module: DynamicModule; store: FriendStore } | null> {
  const enabled = env.FRIENDS_ENABLED ?? "false";
  if (enabled === "false") return null;
  if (
    enabled !== "true" ||
    env.AUTH_LOGIN_ENABLED !== "true" ||
    !registration?.sessions ||
    !rooms
  )
    throw new Error("Invalid Friend configuration");
  const pool = registration.pool;
  try {
    const schema = await pool.query(`SELECT
      has_schema_privilege('app_server','xiangqi_social','USAGE') AND
      (SELECT bool_and(pg_catalog.to_regclass(name) IS NOT NULL AND has_table_privilege('app_server',name,'SELECT')) FROM unnest(ARRAY[
        'xiangqi_social.friend_requests','xiangqi_social.friendships',
        'xiangqi_social.friend_decline_counts','xiangqi_social.room_invites',
        'xiangqi_social.presence_leases','xiangqi_social.invite_cooldowns',
        'xiangqi_social.room_invite_declines','xiangqi_social.direct_messages',
        'xiangqi_social.direct_message_reads','xiangqi_social.direct_message_rate']) name)
      AND has_table_privilege('app_server','xiangqi_social.friend_decline_counts','DELETE')
      AND EXISTS(SELECT 1 FROM pg_attribute WHERE attrelid='xiangqi_social.room_invites'::regclass AND attname='response_body' AND NOT attisdropped)
      AND EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='public.rooms'::regclass AND tgname='social_room_invites_revoked' AND tgenabled='O') AS ready`);
    if (!schema.rows[0]?.ready) throw new Error();
  } catch {
    throw new Error("Friend schema is not ready");
  }
  const store = new FriendStore(pool);
  return {
    module: FriendModule.forRoot(pool, registration.sessions, rooms),
    store,
  };
}
