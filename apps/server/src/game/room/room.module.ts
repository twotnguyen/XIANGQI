import { Module, type DynamicModule } from "@nestjs/common";
import type { RoomHttpService } from "./room-http.service.js";
import { RoomController } from "./room.controller.js";
/**
 * Module NestJS đóng gói các endpoint điều khiển phòng cờ (RoomController).
 */
@Module({})
export class RoomModule {
  /**
   * Tạo dynamic module RoomModule với dịch vụ RoomHttpService được cung cấp.
   */
  static forRoot(service: RoomHttpService): DynamicModule {
    return {
      module: RoomModule,
      controllers: [RoomController],
      providers: [{ provide: "ROOM_HTTP_SERVICE", useValue: service }],
    };
  }
}
