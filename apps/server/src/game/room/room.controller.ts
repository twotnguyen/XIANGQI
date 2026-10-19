import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpException,
  Inject,
  Param,
  Post,
  Req,
} from "@nestjs/common";
import type { IncomingMessage } from "node:http";
import { LoginError } from "../../account/login/login.types.js";
import { readSessionCookie } from "../../account/session/cookies.js";
import { invalidRoomInput, RoomError } from "./room.types.js";
import type {
  RoomHttpService,
  MemberRoomRequestProof,
} from "./room-http.service.js";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
function id(value: unknown): string {
  if (typeof value !== "string" || !uuid.test(value)) invalidRoomInput();
  return value.toLowerCase();
}
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    invalidRoomInput();
  return value as Record<string, unknown>;
}
export function readMemberRoomProof(
  request: IncomingMessage,
): MemberRoomRequestProof {
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
export class RoomController {
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
      const authority = readMemberRoomProof(request),
        input = object(body);
      const commandId = id(input.commandId);
      if (
        (input.timeMinutes !== undefined &&
          (typeof input.timeMinutes !== "number" ||
            ![5, 10, 15].includes(input.timeMinutes))) ||
        (input.viewerLimit !== undefined &&
          (typeof input.viewerLimit !== "number" ||
            !Number.isInteger(input.viewerLimit) ||
            input.viewerLimit < 0 ||
            input.viewerLimit > 5))
      )
        invalidRoomInput();
      return this.service.create(authority, {
        commandId,
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
      const authority = readMemberRoomProof(request),
        input = object(body),
        commandId = id(input.commandId);
      if (
        typeof input.code !== "string" ||
        !/^[0-9]{8}$/.test(input.code) ||
        (input.preference !== undefined &&
          (typeof input.preference !== "string" ||
            !["auto", "play", "watch"].includes(input.preference))) ||
        (input.expectedVersion !== undefined &&
          (!Number.isSafeInteger(input.expectedVersion) ||
            (input.expectedVersion as number) < 0))
      )
        invalidRoomInput();
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
  @Post(":roomId/switch-seat")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  switchSeat(
    @Req() request: IncomingMessage,
    @Param("roomId") roomId: string,
    @Body() body: unknown,
  ) {
    return this.respond(() => {
      const authority = readMemberRoomProof(request),
        input = object(body);
      if (
        !Number.isSafeInteger(input.expectedVersion) ||
        (input.expectedVersion as number) < 0
      )
        invalidRoomInput();
      return this.service.switchSeat(
        authority,
        id(roomId),
        input.expectedVersion as number,
      );
    });
  }
  private versioned(input: Record<string, unknown>) {
    if (
      !Number.isSafeInteger(input.expectedVersion) ||
      (input.expectedVersion as number) < 0
    )
      invalidRoomInput();
    return input.expectedVersion as number;
  }
  @Post(":roomId/to-spectator")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  toSpectator(
    @Req() request: IncomingMessage,
    @Param("roomId") roomId: string,
    @Body() body: unknown,
  ) {
    return this.respond(() => {
      const authority = readMemberRoomProof(request),
        input = object(body);
      return this.service.toSpectator(
        authority,
        id(roomId),
        this.versioned(input),
      );
    });
  }
  @Post(":roomId/move-to-spectator")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  moveToSpectator(
    @Req() request: IncomingMessage,
    @Param("roomId") roomId: string,
    @Body() body: unknown,
  ) {
    return this.respond(() => {
      const authority = readMemberRoomProof(request),
        input = object(body);
      if (typeof input.targetId !== "string") invalidRoomInput();
      return this.service.moveToSpectator(
        authority,
        id(roomId),
        this.versioned(input),
        input.targetId as string,
      );
    });
  }
  @Post(":roomId/invite-down")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  inviteDown(
    @Req() request: IncomingMessage,
    @Param("roomId") roomId: string,
    @Body() body: unknown,
  ) {
    return this.respond(() => {
      const authority = readMemberRoomProof(request),
        input = object(body);
      if (typeof input.targetId !== "string") invalidRoomInput();
      return this.service.inviteDown(
        authority,
        id(roomId),
        this.versioned(input),
        input.targetId as string,
      );
    });
  }
  @Post(":roomId/respond-down")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  respondDown(
    @Req() request: IncomingMessage,
    @Param("roomId") roomId: string,
    @Body() body: unknown,
  ) {
    return this.respond(() => {
      const authority = readMemberRoomProof(request),
        input = object(body);
      if (typeof input.accept !== "boolean") invalidRoomInput();
      return this.service.respondDown(
        authority,
        id(roomId),
        this.versioned(input),
        input.accept as boolean,
      );
    });
  }
  @Post(":roomId/kick")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  kickViewer(
    @Req() request: IncomingMessage,
    @Param("roomId") roomId: string,
    @Body() body: unknown,
  ) {
    return this.respond(() => {
      const authority = readMemberRoomProof(request),
        input = object(body);
      if (typeof input.targetId !== "string") invalidRoomInput();
      return this.service.kickViewer(
        authority,
        id(roomId),
        this.versioned(input),
        input.targetId as string,
      );
    });
  }
  @Post(":roomId/leave")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  leave(
    @Req() request: IncomingMessage,
    @Param("roomId") roomId: string,
    @Body() body: unknown,
  ) {
    return this.respond(() => {
      const authority = readMemberRoomProof(request),
        input = object(body);
      if (
        !Number.isSafeInteger(input.expectedVersion) ||
        (input.expectedVersion as number) < 0
      )
        invalidRoomInput();
      return this.service.leave(
        authority,
        id(roomId),
        input.expectedVersion as number,
      );
    });
  }
  @Post(":roomId/swap-propose")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  proposeSwap(
    @Req() request: IncomingMessage,
    @Param("roomId") roomId: string,
    @Body() body: unknown,
  ) {
    return this.respond(() => {
      const authority = readMemberRoomProof(request),
        input = object(body);
      if (
        !Number.isSafeInteger(input.expectedVersion) ||
        (input.expectedVersion as number) < 0
      )
        invalidRoomInput();
      return this.service.proposeSwap(
        authority,
        id(roomId),
        input.expectedVersion as number,
      );
    });
  }
  @Post(":roomId/swap-withdraw")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  withdrawSwap(
    @Req() request: IncomingMessage,
    @Param("roomId") roomId: string,
    @Body() body: unknown,
  ) {
    return this.respond(() => {
      const authority = readMemberRoomProof(request),
        input = object(body);
      if (
        !Number.isSafeInteger(input.expectedVersion) ||
        (input.expectedVersion as number) < 0
      )
        invalidRoomInput();
      return this.service.withdrawSwap(
        authority,
        id(roomId),
        input.expectedVersion as number,
      );
    });
  }
  @Post(":roomId/swap-respond")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  respondSwap(
    @Req() request: IncomingMessage,
    @Param("roomId") roomId: string,
    @Body() body: unknown,
  ) {
    return this.respond(() => {
      const authority = readMemberRoomProof(request),
        input = object(body);
      if (
        !Number.isSafeInteger(input.expectedVersion) ||
        (input.expectedVersion as number) < 0 ||
        typeof input.accept !== "boolean"
      )
        invalidRoomInput();
      return this.service.respondSwap(
        authority,
        id(roomId),
        input.expectedVersion as number,
        input.accept as boolean,
      );
    });
  }
  @Post(":roomId/visibility")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  changeVisibility(
    @Req() request: IncomingMessage,
    @Param("roomId") roomId: string,
    @Body() body: unknown,
  ) {
    return this.respond(() => {
      const authority = readMemberRoomProof(request),
        input = object(body);
      if (
        !Number.isSafeInteger(input.expectedVersion) ||
        (input.expectedVersion as number) < 0 ||
        typeof input.visibility !== "string" ||
        !["PUBLIC", "CODE_ONLY", "LOCKED"].includes(input.visibility)
      )
        invalidRoomInput();
      return this.service.changeVisibility(
        authority,
        id(roomId),
        input.expectedVersion as number,
        input.visibility as "PUBLIC" | "CODE_ONLY" | "LOCKED",
      );
    });
  }
  @Get(":roomId")
  @Header("Cache-Control", "no-store")
  snapshot(@Req() request: IncomingMessage, @Param("roomId") roomId: string) {
    return this.respond(() =>
      this.service.snapshot(readMemberRoomProof(request), id(roomId)),
    );
  }
}
