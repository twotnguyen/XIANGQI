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
