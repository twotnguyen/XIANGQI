import { Module, type DynamicModule } from "@nestjs/common";
import { ProfileStore } from "./profile.store.js";
import { ProfileService } from "./profile.service.js";
import { SessionService } from "../login/session.service.js";
import { SessionGuard } from "../login/session.guard.js";
import { ProfileController } from "./profile.controller.js";
import type { Pool } from "pg";
/**
 * Module NestJS đóng gói các endpoint và service quản lý hồ sơ người dùng.
 */
@Module({})
export class ProfileModule {
  /**
   * Khởi tạo DynamicModule cho tính năng hồ sơ người dùng.
   */
  static forRoot(store: ProfileStore, sessions: SessionService): DynamicModule {
    return {
      module: ProfileModule,
      controllers: [ProfileController],
      providers: [
        { provide: ProfileService, useValue: new ProfileService(store) },
        { provide: SessionService, useValue: sessions },
        SessionGuard,
      ],
    };
  }
}
/**
 * Khởi tạo runtime cho module Profile nếu cờ PROFILE_ENABLED được bật trong môi trường.
 */
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
