import { Module, type DynamicModule } from "@nestjs/common";
import { AiController, type AiHttpApi } from "./ai.controller.js";
@Module({})
export class AiModule {
  static forRoot(service: AiHttpApi): DynamicModule {
    return {
      module: AiModule,
      controllers: [AiController],
      providers: [{ provide: "AI_HTTP_SERVICE", useValue: service }],
    };
  }
}
