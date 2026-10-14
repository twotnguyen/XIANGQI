import { Module, type DynamicModule } from "@nestjs/common";
import type { RoomHttpService } from "./room-http.service.js";
import { RoomController } from "./room.controller.js";
@Module({})
export class RoomModule {
  static forRoot(service: RoomHttpService): DynamicModule {
    return {
      module: RoomModule,
      controllers: [RoomController],
      providers: [{ provide: "ROOM_HTTP_SERVICE", useValue: service }],
    };
  }
}
