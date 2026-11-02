import { Module, type DynamicModule } from "@nestjs/common";
import { Pool, type PoolConfig } from "pg";
import { logEvent } from "../../core/logger.js";
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
    lifecycle: { onModuleDestroy: () => Promise<void> },
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
        { provide: "FRIEND_POOL_LIFECYCLE", useValue: lifecycle },
        {
          provide: DirectMessageService,
          useValue: new DirectMessageService(new DirectMessageStore(pool)),
        },
        SessionGuard,
      ],
    };
  }
}
/** Tổng kết nối phải nhỏ hơn pool size của Supabase pooler: 5 chính + 3 đăng nhập + 3 media + 3 bạn bè = 14 < 15. */
export const SOCIAL_POOL_MAX = 3;
function createSocialPool(connection: PoolConfig): Pool {
  const pool = new Pool({
    ...connection,
    max: SOCIAL_POOL_MAX,
    connectionTimeoutMillis: 10000,
  });
  pool.on("error", () => {
    process.stderr.write(logEvent("error", "social_pool_failed") + "\n");
  });
  pool.on("connect", (client) => {
    client.on("error", () => {});
  });
  return pool;
}
/**
 * Khởi tạo runtime cho hệ thống bạn bè nếu biến môi trường FRIENDS_ENABLED được kích hoạt.
 * Thẩm định quyền schema xiangqi_social và các bảng liên quan trước khi khởi chạy.
 */
export async function createFriendRuntime(
  env: Record<string, string | undefined>,
  registration: {
    pool: Pool;
    connection?: PoolConfig;
    sessions: SessionService | null;
  } | null,
  rooms?: FriendRoomPort,
): Promise<{
  module: DynamicModule;
  store: FriendStore;
  /** Đóng pool bạn bè riêng. Idempotent. */
  close: () => Promise<void>;
} | null> {
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
        'xiangqi_social.direct_message_reads']) name)
      AND pg_catalog.to_regclass('xiangqi_chat.rate') IS NOT NULL
      AND has_schema_privilege('app_server','xiangqi_chat','USAGE')
      AND has_table_privilege('app_server','xiangqi_chat.rate','SELECT,INSERT,UPDATE')
      AND has_table_privilege('app_server','xiangqi_social.friend_decline_counts','DELETE')
      AND EXISTS(SELECT 1 FROM pg_attribute WHERE attrelid='xiangqi_social.room_invites'::regclass AND attname='response_body' AND NOT attisdropped)
      AND EXISTS(SELECT 1 FROM pg_trigger WHERE tgrelid='public.rooms'::regclass AND tgname='social_room_invites_revoked' AND tgenabled='O') AS ready`);
    if (!schema.rows[0]?.ready) throw new Error();
  } catch {
    throw new Error("Friend schema is not ready");
  }
  // Presence, danh sách bạn và thông báo poll vài lần mỗi giây; pool riêng để chúng không chiếm kết nối của phòng/ván.
  const socialPool = registration.connection
    ? createSocialPool(registration.connection)
    : pool;
  let closing: Promise<void> | undefined;
  const close = () =>
    socialPool === pool ? Promise.resolve() : (closing ??= socialPool.end());
  const store = new FriendStore(socialPool);
  return {
    module: FriendModule.forRoot(socialPool, registration.sessions, rooms, {
      onModuleDestroy: close,
    }),
    store,
    close,
  };
}
