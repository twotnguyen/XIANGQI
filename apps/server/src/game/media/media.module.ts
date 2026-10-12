import { Module, type DynamicModule } from "@nestjs/common";
import { MediaAccess } from "./media-access.js";
import { SessionService } from "../../account/login/session.service.js";
import { SessionGuard } from "../../account/login/session.guard.js";
import { MediaController } from "./media.controller.js";
@Module({})
export class MediaModule {
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
