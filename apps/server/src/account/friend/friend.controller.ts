import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Inject,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { FriendError } from "./friend.types.js";
import { httpFailure, invalidInput } from "../../core/http-errors.js";
import { FriendService } from "./friend.service.js";
import {
  SessionGuard,
  type AuthenticatedRequest,
} from "../login/session.guard.js";
const fail = httpFailure(FriendError);
/**
 * Controller quản lý tính năng bạn bè:
 * Tìm kiếm thành viên, kết bạn, phản hồi/thu hồi lời mời kết bạn, hủy kết bạn và mời bạn bè vào phòng chơi.
 */
@Controller("friends")
@UseGuards(SessionGuard)
export class FriendController {
  constructor(@Inject(FriendService) private readonly friends: FriendService) {}
  private user(request: AuthenticatedRequest) {
    if (!request.userId) invalidInput("FRIEND_INPUT_INVALID");
    return request.userId as string;
  }
  /**
   * Endpoint GET /friends/search: Tìm kiếm thành viên theo tiền tố tên đăng nhập (username).
   */
  @Get("search")
  @Header("Cache-Control", "no-store")
  search(@Req() request: AuthenticatedRequest, @Query("q") q: unknown) {
    if (typeof q !== "string") invalidInput("FRIEND_INPUT_INVALID");
    return this.friends.search(this.user(request), q).catch(fail);
  }
  /**
   * Endpoint GET /friends: Lấy danh sách bạn bè kèm trạng thái trực tuyến (online, offline, in-match).
   */
  @Get()
  @Header("Cache-Control", "no-store")
  list(@Req() request: AuthenticatedRequest) {
    return this.friends.listFriends(this.user(request)).catch(fail);
  }
  /**
   * Endpoint POST /friends/requests: Gửi lời mời kết bạn tới một thành viên khác.
   */
  @Post("requests")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  send(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    const input = (body ?? {}) as Record<string, unknown>;
    if (typeof input.username !== "string")
      invalidInput("FRIEND_INPUT_INVALID");
    return this.friends
      .sendRequest(this.user(request), input.username as string)
      .catch(fail);
  }
  /**
   * Endpoint GET /friends/requests: Danh sách các lời mời kết bạn đang chờ (cả gửi đi và nhận được).
   */
  @Get("requests")
  @Header("Cache-Control", "no-store")
  requests(@Req() request: AuthenticatedRequest) {
    return this.friends.listRequests(this.user(request)).catch(fail);
  }
  /**
   * Endpoint POST /friends/requests/:id/respond: Phản hồi chấp nhận hoặc từ chối lời mời kết bạn.
   */
  @Post("requests/:id/respond")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  respond(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: unknown,
  ) {
    const input = (body ?? {}) as Record<string, unknown>;
    if (typeof input.accept !== "boolean") invalidInput("FRIEND_INPUT_INVALID");
    return this.friends
      .respondRequest(this.user(request), id, input.accept as boolean)
      .catch(fail);
  }
  /**
   * Endpoint POST /friends/requests/:id/revoke: Người gửi thu hồi lời mời kết bạn đã gửi trước đó.
   */
  @Post("requests/:id/revoke")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  revoke(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
    return this.friends.revokeRequest(this.user(request), id).catch(fail);
  }
  /**
   * Endpoint DELETE /friends/:userId: Hủy quan hệ bạn bè với một người dùng.
   */
  @Delete(":userId")
  @Header("Cache-Control", "no-store")
  unfriend(@Req() request: AuthenticatedRequest, @Param("userId") id: string) {
    return this.friends.unfriend(this.user(request), id).catch(fail);
  }
  /**
   * Endpoint POST /friends/invites: Mời bạn bè tham gia vào phòng chơi cờ hiện tại.
   */
  @Post("invites")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  invite(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    const input = (body ?? {}) as Record<string, unknown>;
    if (typeof input.roomId !== "string" || typeof input.username !== "string")
      invalidInput("FRIEND_INPUT_INVALID");
    return this.friends
      .inviteToRoom(
        this.user(request),
        input.roomId as string,
        input.username as string,
      )
      .catch(fail);
  }
  /**
   * Endpoint GET /friends/invites: Danh sách các lời mời vào phòng cờ đang chờ phản hồi.
   */
  @Get("invites")
  @Header("Cache-Control", "no-store")
  invites(@Req() request: AuthenticatedRequest) {
    return this.friends.listRoomInvites(this.user(request)).catch(fail);
  }
  /**
   * Endpoint POST /friends/invites/:id/respond: Phản hồi chấp nhận hoặc từ chối lời mời vào phòng chơi cờ.
   */
  @Post("invites/:id/respond")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  respondInvite(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: unknown,
  ) {
    const input = (body ?? {}) as Record<string, unknown>;
    if (typeof input.accept !== "boolean") invalidInput("FRIEND_INPUT_INVALID");
    return this.friends
      .respondRoomInvite(this.user(request), id, input.accept as boolean)
      .catch(fail);
  }
}
