import { Module, type DynamicModule } from "@nestjs/common";
import { ProfileStore } from "./profile-store.js";
import { SessionService } from "../login/session.service.js";
import { SessionGuard } from "../login/session.guard.js";
import { ProfileController } from "./profile.controller.js";
@Module({})
export class ProfileModule {
  static forRoot(store: ProfileStore, sessions: SessionService): DynamicModule {
    return {
      module: ProfileModule,
      controllers: [ProfileController],
      providers: [
        { provide: ProfileStore, useValue: store },
        { provide: SessionService, useValue: sessions },
        SessionGuard,
      ],
    };
  }
}
