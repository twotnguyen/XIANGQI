import { Module, type DynamicModule } from "@nestjs/common";
import { SessionService } from "../login/session.service.js";
import { SessionGuard } from "../login/session.guard.js";
import {
  PasswordController,
  PasswordRecoveryController,
} from "./password.controller.js";
import { PasswordService } from "./password.service.js";

@Module({})
export class PasswordModule {
  static forRoot(
    passwords: PasswordService,
    sessions: SessionService,
    secure = true,
  ): DynamicModule {
    return {
      module: PasswordModule,
      controllers: [PasswordController, PasswordRecoveryController],
      providers: [
        { provide: PasswordService, useValue: passwords },
        { provide: SessionService, useValue: sessions },
        { provide: "SESSION_COOKIE_SECURE", useValue: secure },
        SessionGuard,
      ],
    };
  }
}
