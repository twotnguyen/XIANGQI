import { Module, type DynamicModule } from "@nestjs/common";
import {
  Configuration,
  GoogleController,
  GoogleHttpService,
  GoogleRefreshProvider,
} from "./google.controller.js";
@Module({})
export class GoogleModule {
  static forRoot(
    service: GoogleHttpService,
    refreshProvider: GoogleRefreshProvider,
    secure = true,
    now = () => new Date(),
  ): DynamicModule {
    return {
      module: GoogleModule,
      controllers: [GoogleController],
      providers: [
        {
          provide: "GOOGLE_HTTP_CONFIGURATION",
          useValue: {
            service,
            refreshProvider,
            secure,
            now,
          } satisfies Configuration,
        },
      ],
    };
  }
}
