import { Module, type DynamicModule } from "@nestjs/common";
import { HistoryHttpService } from "./history-http.service.js";
import { ReplayHttpService } from "./replay-http.service.js";
import { HistoryController, ReplayController } from "./history.controller.js";
@Module({})
export class HistoryModule {
  static forRoot(
    service: HistoryHttpService,
    replay?: ReplayHttpService,
  ): DynamicModule {
    return {
      module: HistoryModule,
      controllers: [HistoryController, ...(replay ? [ReplayController] : [])],
      providers: [
        { provide: "HISTORY_HTTP_SERVICE", useValue: service },
        ...(replay
          ? [{ provide: "REPLAY_HTTP_SERVICE", useValue: replay }]
          : []),
      ],
    };
  }
}
