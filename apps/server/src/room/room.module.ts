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
import { readSessionCookie } from "../session/cookies.js";
import { RoomError } from "./contracts.js";
import type {
  RoomHttpService,
  MemberRoomRequestProof,
} from "./room-http.service.js";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function invalid(): never {
  throw new RoomError(
    "ROOM_INPUT_INVALID",
    "Thông tin phòng không hợp lệ",
    400,
  );
}
function id(value: unknown): string {
  if (typeof value !== "string" || !uuid.test(value)) invalid();
  return value.toLowerCase();
}
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) invalid();
  return value as Record<string, unknown>;
}
function proof(request: IncomingMessage): MemberRoomRequestProof {
  const auth = request.headers.authorization;
  const cap = Object.hasOwn(request.headers, "x-xiangqi-session")
    ? request.headers["x-xiangqi-session"]
    : readSessionCookie(request.headers.cookie, "xiangqi_session");
  if (
    typeof auth !== "string" ||
    !/^Bearer [A-Za-z0-9._~+/-]+$/i.test(auth) ||
    auth.length > 16391 ||
    typeof cap !== "string" ||
    !/^[A-Za-z0-9_-]{43}$/.test(cap)
  )
    throw new RoomError("AUTH_REQUIRED", "Phiên đăng nhập không hợp lệ", 401);
  return { accessToken: auth.slice(7), appSession: cap };
}
@Controller("rooms")
class RoomController {
  constructor(
    @Inject("ROOM_HTTP_SERVICE") private readonly service: RoomHttpService,
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
  @Post()
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  create(@Req() request: IncomingMessage, @Body() body: unknown) {
    return this.respond(async () => {
      const authority = proof(request),
        input = object(body);
      const commandId = id(input.commandId);
      if (
        typeof input.name !== "string" ||
        (input.timeMinutes !== undefined &&
          (typeof input.timeMinutes !== "number" ||
            ![5, 10, 15].includes(input.timeMinutes))) ||
        (input.viewerLimit !== undefined &&
          (typeof input.viewerLimit !== "number" ||
            !Number.isInteger(input.viewerLimit) ||
            input.viewerLimit < 0 ||
            input.viewerLimit > 5))
      )
        invalid();
      return this.service.create(authority, {
        commandId,
        name: input.name,
        ...(input.timeMinutes === undefined
          ? {}
          : { timeMinutes: input.timeMinutes as number }),
        ...(input.viewerLimit === undefined
          ? {}
          : { viewerLimit: input.viewerLimit as number }),
      });
    });
  }
  @Post("join")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  join(@Req() request: IncomingMessage, @Body() body: unknown) {
    return this.respond(async () => {
      const authority = proof(request),
        input = object(body),
        commandId = id(input.commandId);
      if (
        typeof input.code !== "string" ||
        !/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/.test(input.code) ||
        (input.preference !== undefined &&
          (typeof input.preference !== "string" ||
            !["auto", "play", "watch"].includes(input.preference))) ||
        (input.expectedVersion !== undefined &&
          (!Number.isSafeInteger(input.expectedVersion) ||
            (input.expectedVersion as number) < 0))
      )
        invalid();
      return this.service.join(authority, {
        commandId,
        code: input.code,
        preference: (input.preference ?? "auto") as "auto" | "play" | "watch",
        ...(input.expectedVersion === undefined
          ? {}
          : { expectedVersion: input.expectedVersion as number }),
      });
    });
  }
  @Get(":roomId")
  @Header("Cache-Control", "no-store")
  snapshot(@Req() request: IncomingMessage, @Param("roomId") roomId: string) {
    return this.respond(() =>
      this.service.snapshot(proof(request), id(roomId)),
    );
  }
}
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
