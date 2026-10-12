import { Module, type DynamicModule } from "@nestjs/common";
import type { PublicRoomService } from "./public-room-service.js";
import { PublicRoomController } from "./public-room.controller.js";
@Module({})
export class PublicRoomModule {
  static forRoot(service: PublicRoomService): DynamicModule {
    return {
      module: PublicRoomModule,
      controllers: [PublicRoomController],
      providers: [{ provide: "PUBLIC_ROOM_SERVICE", useValue: service }],
    };
  }
}
