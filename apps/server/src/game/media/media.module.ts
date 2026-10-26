import { Module, type DynamicModule } from "@nestjs/common";
import { MediaAccess } from "./media.service.js";
import { MediaStore } from "./media.store.js";
import { SessionService } from "../../account/login/session.service.js";
import { SessionGuard } from "../../account/login/session.guard.js";
import { MediaController } from "./media.controller.js";
import type { Pool } from "pg";
/**
 * Module NestJS cấu hình các thành phần API điều khiển media (LiveKit).
 */
@Module({})
export class MediaModule {
  /**
   * Tạo DynamicModule chứa controller và provider cho Media.
   */
  static forRoot(access: MediaAccess, sessions: SessionService): DynamicModule {
    return {
      module: MediaModule,
      controllers: [MediaController],
      providers: [
        { provide: MediaAccess, useValue: access },
        { provide: SessionService, useValue: sessions },
        SessionGuard,
      ],
    };
  }
}
export interface MediaRuntime {
  module: DynamicModule;
  access: MediaAccess;
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
 * Khởi tạo runtime dịch vụ media, kết nối LiveKit và đăng ký module NestJS.
 */
export async function createMediaRuntime(
  env: Record<string, string | undefined>,
  registration: { pool: Pool; sessions: SessionService | null } | null,
): Promise<MediaRuntime | null> {
  const config = readMediaConfig(env);
  if (!config || !registration?.sessions) return null;
  const access = new MediaAccess(config, new MediaStore(registration.pool));
  return { module: MediaModule.forRoot(access, registration.sessions), access };
}
