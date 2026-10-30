import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Inject,
  Injectable,
  Optional,
  Post,
  Query,
  Req,
  UseGuards,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";
import { MediaError, SHARE_LEVELS, type ShareLevel } from "./media.types.js";
import { httpFailure, invalidInput } from "../../core/http-errors.js";
import { MediaAccess } from "./media.service.js";
import {
  SessionGuard,
  type AuthenticatedRequest,
} from "../../account/login/session.guard.js";
import { readSessionCookie } from "../../account/session/cookies.js";
import { GuestService } from "../../account/guest/guest.service.js";
import { GuestError } from "../../account/guest/guest.types.js";
import { guestFailure } from "../../account/guest/guest.dto.js";
const fail = httpFailure(MediaError);
const GUEST_BEARER = /^Guest ([A-Za-z0-9_-]{43})$/;
const TAB_ID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

type MediaRequest = AuthenticatedRequest & {
  headers: Record<string, string | string[] | undefined>;
  body?: unknown;
  query?: Record<string, unknown>;
};

function roomIdOf(request: MediaRequest): string | undefined {
  const body = request.body;
  if (body && typeof body === "object") {
    const fromBody = (body as Record<string, unknown>).roomId;
    if (typeof fromBody === "string") return fromBody;
  }
  const fromQuery = request.query?.roomId;
  return typeof fromQuery === "string" ? fromQuery : undefined;
}

function hasMemberCredential(request: MediaRequest): boolean {
  return (
    request.headers["x-xiangqi-session"] !== undefined ||
    readSessionCookie(request.headers.cookie, "xiangqi_session") !== undefined
  );
}

/**
 * Cho phép tài khoản thành viên (SessionGuard) hoặc Khách (Authorization: Guest <capability>).
 * Khách chỉ dùng header; trộn với thông tin xác thực thành viên bị từ chối.
 */
@Injectable()
export class MediaPrincipalGuard implements CanActivate {
  constructor(
    @Inject(SessionGuard) private readonly member: SessionGuard,
    @Optional() @Inject(GuestService) private readonly guests?: GuestService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<MediaRequest>();
    const authorization = request.headers.authorization;
    if (typeof authorization !== "string" || !/^Guest /i.test(authorization))
      return this.member.canActivate(context);
    const match = GUEST_BEARER.exec(authorization);
    if (!match)
      throw guestFailure(
        new GuestError("GUEST_INVALID", "Phiên Khách không hợp lệ"),
      );
    if (hasMemberCredential(request))
      throw guestFailure(
        new GuestError(
          "AUTH_MIXED_CREDENTIALS",
          "Chỉ được dùng một loại thông tin xác thực",
        ),
      );
    if (!this.guests)
      throw guestFailure(
        new GuestError(
          "GUEST_UNAVAILABLE",
          "Chức năng Khách chưa sẵn sàng",
          503,
        ),
      );
    try {
      const actor = await this.guests.requireActive(
        match[1],
        "existing-room",
        roomIdOf(request),
      );
      request.userId = actor.userId;
      return true;
    } catch (error) {
      throw guestFailure(error);
    }
  }
}

/**
 * Controller xử lý các yêu cầu HTTP liên quan đến media (camera, mic) và token LiveKit.
 */
@Controller("media")
@UseGuards(MediaPrincipalGuard)
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
      typeof input.mic !== "boolean" ||
      typeof input.tabId !== "string" ||
      !TAB_ID.test(input.tabId)
    )
      invalidInput("MEDIA_INPUT_INVALID");
    return this.media
      .tokenFor(
        this.user(request),
        input.roomId as string,
        {
          camera: input.camera as boolean,
          mic: input.mic as boolean,
        },
        input.tabId as string,
      )
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
