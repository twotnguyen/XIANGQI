import { Module, type DynamicModule } from "@nestjs/common";
import type { PublicRoomService } from "./public-room-service.js";
import { PublicRoomController } from "./public-room.controller.js";
/**
 * Module NestJS đăng ký controller và provider cho sảnh phòng công khai (PublicRoomController).
 */
@Module({})
export class PublicRoomModule {
  /**
   * Tạo dynamic module PublicRoomModule với PublicRoomService được cấu hình.
   */
  static forRoot(service: PublicRoomService): DynamicModule {
    return {
      module: PublicRoomModule,
      controllers: [PublicRoomController],
      providers: [{ provide: "PUBLIC_ROOM_SERVICE", useValue: service }],
    };
  }
}
