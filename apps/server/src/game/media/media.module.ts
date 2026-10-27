import { Module, type DynamicModule } from "@nestjs/common";
import { Pool, type PoolConfig } from "pg";
import { MediaAccess } from "./media.service.js";
import { MediaStore } from "./media.store.js";
import { SessionService } from "../../account/login/session.service.js";
import { SessionGuard } from "../../account/login/session.guard.js";
import { MediaController } from "./media.controller.js";
import { logEvent } from "../../core/logger.js";

/**
 * Số kết nối tối đa của pool media. Mỗi lần cấp/thu hồi token giữ một kết nối qua các lệnh gọi LiveKit
 * (tối đa 10 giây mỗi lệnh), nên pool này phải tách biệt để chờ LiveKit không chiếm pool phòng.
 */
export const MEDIA_POOL_MAX = 3;
const MEDIA_CONNECTION_TIMEOUT_MS = 10000;

/**
 * Module NestJS cấu hình các thành phần API điều khiển media (LiveKit).
 */
@Module({})
export class MediaModule {
  /**
   * Tạo DynamicModule chứa controller và provider cho Media.
   * `lifecycle` đóng pool media khi Nest hủy module (app.close).
   */
  static forRoot(
    access: MediaAccess,
    sessions: SessionService,
    lifecycle: { onModuleDestroy: () => Promise<void> },
  ): DynamicModule {
    return {
      module: MediaModule,
      controllers: [MediaController],
      providers: [
        { provide: MediaAccess, useValue: access },
        { provide: SessionService, useValue: sessions },
        { provide: "MEDIA_POOL_LIFECYCLE", useValue: lifecycle },
        SessionGuard,
      ],
    };
  }
}
export interface MediaRuntime {
  module: DynamicModule;
  access: MediaAccess;
  /** Đóng pool media riêng. Idempotent: mọi lần gọi dùng chung một promise. */
  close: () => Promise<void>;
}
/**
 * Đọc và kiểm tra tính hợp lệ của cấu hình LiveKit từ biến môi trường.
 */
export function readMediaConfig(env: Record<string, string | undefined>) {
  const url = env.LIVEKIT_URL ?? "";
  const apiKey = env.LIVEKIT_API_KEY ?? "";
  const apiSecret = env.LIVEKIT_API_SECRET ?? "";
  if (!url || !apiKey || !apiSecret) return null;
  if (!/^wss?:\/\/.+/.test(url)) throw new Error("Invalid media configuration");
  return { url, apiKey, apiSecret };
}
/**
 * Tạo pool Postgres riêng cho media với cùng kết nối/TLS đã được xác thực của registration,
 * nhưng không dùng chung socket với pool phòng hay pool đăng ký.
 * Lỗi kết nối rỗi được ghi bằng mã sự kiện cố định, không ghi thông điệp hay cấu hình.
 */
export function createMediaPool(connection: PoolConfig): Pool {
  const pool = new Pool({
    ...connection,
    max: MEDIA_POOL_MAX,
    connectionTimeoutMillis: MEDIA_CONNECTION_TIMEOUT_MS,
  });
  pool.on("error", () => {
    process.stderr.write(logEvent("error", "media_pool_failed") + "\n");
  });
  return pool;
}
/**
 * Khởi tạo runtime dịch vụ media, kết nối LiveKit và đăng ký module NestJS.
 * `connection` là cấu hình kết nối đáng tin cậy từ createRegistrationRuntime.
 */
export async function createMediaRuntime(
  env: Record<string, string | undefined>,
  registration: {
    connection: PoolConfig;
    sessions: SessionService | null;
  } | null,
): Promise<MediaRuntime | null> {
  const config = readMediaConfig(env);
  if (!config || !registration?.sessions) return null;
  const pool = createMediaPool(registration.connection);
  let closing: Promise<void> | undefined;
  const close = () => (closing ??= pool.end().then(() => {}));
  const access = new MediaAccess(config, new MediaStore(pool));
  return {
    module: MediaModule.forRoot(access, registration.sessions, {
      onModuleDestroy: close,
    }),
    access,
    close,
  };
}
