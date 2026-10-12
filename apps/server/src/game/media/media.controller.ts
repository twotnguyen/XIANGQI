import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpException,
  Inject,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { MediaError, SHARE_LEVELS, type ShareLevel } from "./media.types.js";
import { MediaAccess } from "./media.service.js";
import {
  SessionGuard,
  type AuthenticatedRequest,
} from "../../account/login/session.guard.js";
function invalid(): never {
  throw new HttpException(
    { code: "MEDIA_INPUT_INVALID", message: "Dữ liệu không hợp lệ" },
    400,
  );
}
function fail(error: unknown): never {
  if (error instanceof MediaError)
    throw new HttpException(
      { code: error.code, message: error.message },
      error.status,
    );
  throw error;
}
@Controller("media")
@UseGuards(SessionGuard)
export class MediaController {
  constructor(@Inject(MediaAccess) private readonly media: MediaAccess) {}
  private user(request: AuthenticatedRequest) {
    if (!request.userId) invalid();
    return request.userId as string;
  }
  @Post("token")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  token(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    const input = (body ?? {}) as Record<string, unknown>;
    if (
      typeof input.roomId !== "string" ||
      typeof input.camera !== "boolean" ||
      typeof input.mic !== "boolean"
    )
      invalid();
    return this.media
      .tokenFor(this.user(request), input.roomId as string, {
        camera: input.camera as boolean,
        mic: input.mic as boolean,
      })
      .catch(fail);
  }
  @Post("share")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  share(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    const input = (body ?? {}) as Record<string, unknown>;
    if (
      typeof input.roomId !== "string" ||
      typeof input.level !== "string" ||
      !(SHARE_LEVELS as string[]).includes(input.level as string)
    )
      invalid();
    return this.media
      .setShare(
        this.user(request),
        input.roomId as string,
        input.level as ShareLevel,
      )
      .catch(fail);
  }
  @Get("share")
  @Header("Cache-Control", "no-store")
  getShare(
    @Req() request: AuthenticatedRequest,
    @Query("roomId") roomId: unknown,
  ) {
    if (typeof roomId !== "string") invalid();
    return this.media.getShare(this.user(request), roomId).catch(fail);
  }
}
