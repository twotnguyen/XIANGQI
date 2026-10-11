import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpException,
  Inject,
  Module,
  Param,
  Post,
  Req,
  type DynamicModule,
} from "@nestjs/common";
import type { IncomingMessage } from "node:http";
import { LoginError } from "../login/contracts.js";
import { RoomError } from "./contracts.js";
import { readMemberRoomProof } from "./room.module.js";
import type {
  PublicRoomJoinInput,
  PublicRoomService,
} from "./public-room-service.js";
@Controller("public-rooms")
class PublicRoomController {
  constructor(
    @Inject("PUBLIC_ROOM_SERVICE") private readonly service: PublicRoomService,
  ) {}
  private async respond<T>(work: () => Promise<T>) {
    try {
      return await work();
    } catch (error) {
      if (error instanceof RoomError || error instanceof LoginError)
        throw new HttpException(
          { code: error.code, message: error.message },
          error.status,
        );
      throw new HttpException(
        { code: "ROOM_UNAVAILABLE", message: "Chức năng phòng chưa sẵn sàng" },
        503,
      );
    }
  }
  @Get()
  @Header("Cache-Control", "no-store")
  list(@Req() request: IncomingMessage) {
    return this.respond(() => this.service.list(readMemberRoomProof(request)));
  }
  @Post(":roomId/join")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  join(
    @Req() request: IncomingMessage,
    @Param("roomId") roomId: string,
    @Body() body: unknown,
  ) {
    return this.respond(() => {
      const proof = readMemberRoomProof(request);
      if (
        !body ||
        typeof body !== "object" ||
        Array.isArray(body) ||
        Object.keys(body).length !== 2 ||
        !Object.hasOwn(body, "commandId") ||
        !Object.hasOwn(body, "preference")
      )
        throw new RoomError(
          "ROOM_INPUT_INVALID",
          "Thông tin phòng không hợp lệ",
          400,
        );
      const input = body as Record<string, unknown>;
      if (
        typeof input.commandId !== "string" ||
        !["play", "watch"].includes(input.preference as string)
      )
        throw new RoomError(
          "ROOM_INPUT_INVALID",
          "Thông tin phòng không hợp lệ",
          400,
        );
      return this.service.join(proof, roomId, input as PublicRoomJoinInput);
    });
  }
}
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
