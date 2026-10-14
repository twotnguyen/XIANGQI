import { Module, type DynamicModule } from "@nestjs/common";
import { SessionService } from "../login/session.service.js";
import { SessionGuard } from "../login/session.guard.js";
import { RefreshProvider, SessionController } from "./session.controller.js";
@Module({})
export class SessionModule {
  static forRoot(
    sessions: SessionService,
    refresh: RefreshProvider,
    secure = true,
  ): DynamicModule {
    return {
      module: SessionModule,
      controllers: [SessionController],
      providers: [
        { provide: SessionService, useValue: sessions },
        { provide: "REFRESH_PROVIDER", useValue: refresh },
        { provide: "SESSION_COOKIE_SECURE", useValue: secure },
        SessionGuard,
      ],
      exports: [SessionService, SessionGuard],
    };
  }
}
