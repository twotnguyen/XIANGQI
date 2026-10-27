import { Module, type DynamicModule } from "@nestjs/common";
import {
  GUEST_HTTP_CONFIGURATION,
  GuestController,
  type GuestConfiguration,
  type GuestHttpService,
} from "./guest.controller.js";

/** Module HTTP Khách: cấu hình bằng forRoot, không dùng global module. */
@Module({})
export class GuestModule {
  static forRoot(guests: GuestHttpService, secure = true): DynamicModule {
    return {
      module: GuestModule,
      controllers: [GuestController],
      providers: [
        {
          provide: GUEST_HTTP_CONFIGURATION,
          useValue: { service: guests, secure } satisfies GuestConfiguration,
        },
      ],
    };
  }
}
