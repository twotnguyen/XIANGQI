import { Module, type DynamicModule } from "@nestjs/common";
import { AiController, type AiHttpApi } from "./ai.controller.js";
/**
 * Module NestJS cấu hình controller và provider phục vụ chế độ chơi cờ với máy AI.
 */
@Module({})
export class AiModule {
  /**
   * Tạo DynamicModule chứa AiController và provider AI_HTTP_SERVICE.
   */
  static forRoot(service: AiHttpApi): DynamicModule {
    return {
      module: AiModule,
      controllers: [AiController],
      providers: [{ provide: "AI_HTTP_SERVICE", useValue: service }],
    };
  }
}
