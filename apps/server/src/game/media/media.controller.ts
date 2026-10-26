import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Inject,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { MediaError, SHARE_LEVELS, type ShareLevel } from "./media.types.js";
import { httpFailure, invalidInput } from "../../core/http-errors.js";
import { MediaAccess } from "./media.service.js";
import {
  SessionGuard,
  type AuthenticatedRequest,
} from "../../account/login/session.guard.js";
const fail = httpFailure(MediaError);
/**
 * Controller xử lý các yêu cầu HTTP liên quan đến media (camera, mic) và token LiveKit.
 */
@Controller("media")
@UseGuards(SessionGuard)
export class MediaController {
  constructor(@Inject(MediaAccess) private readonly media: MediaAccess) {}
  private user(request: AuthenticatedRequest) {
    if (!request.userId) invalidInput("MEDIA_INPUT_INVALID");
    return request.userId as string;
  }
  /**
   * Tạo token kết nối LiveKit cho người dùng vào phòng cờ với quyền bật camera/mic tương ứng.
   */
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
      invalidInput("MEDIA_INPUT_INVALID");
    return this.media
      .tokenFor(this.user(request), input.roomId as string, {
        camera: input.camera as boolean,
        mic: input.mic as boolean,
      })
      .catch(fail);
  }
  /**
   * Cập nhật mức độ chia sẻ media (none: tắt, opponent: đối thủ, room: cả phòng).
   */
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
      invalidInput("MEDIA_INPUT_INVALID");
    return this.media
      .setShare(
        this.user(request),
        input.roomId as string,
        input.level as ShareLevel,
      )
      .catch(fail);
  }
  /**
   * Truy vấn trạng thái và quyền chia sẻ media hiện tại của người dùng trong phòng cờ.
   */
  @Get("share")
  @Header("Cache-Control", "no-store")
  getShare(
    @Req() request: AuthenticatedRequest,
    @Query("roomId") roomId: unknown,
  ) {
    if (typeof roomId !== "string") invalidInput("MEDIA_INPUT_INVALID");
    return this.media.getShare(this.user(request), roomId).catch(fail);
  }
}
