import { Module, type DynamicModule } from "@nestjs/common";
import { SessionService } from "../login/session.service.js";
import { SessionGuard } from "../login/session.guard.js";
import {
  UsernameController,
  UsernameRecoveryController,
} from "./username.controller.js";
import { UsernameService } from "./username.service.js";

@Module({})
export class UsernameModule {
  static forRoot(
    usernames: UsernameService,
    sessions: SessionService,
  ): DynamicModule {
    return {
      module: UsernameModule,
      controllers: [UsernameController, UsernameRecoveryController],
      providers: [
        { provide: UsernameService, useValue: usernames },
        { provide: SessionService, useValue: sessions },
        SessionGuard,
      ],
    };
  }
}
