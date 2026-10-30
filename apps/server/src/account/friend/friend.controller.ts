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
import type { IncomingMessage } from "node:http";
import { FriendError } from "./friend.types.js";
import { httpFailure, invalidInput } from "../../core/http-errors.js";
import { FriendService } from "./friend.service.js";
import { RoomError } from "../../game/room/room.types.js";
import { readMemberRoomProof } from "../../game/room/room.controller.js";
import {
  SessionGuard,
  type AuthenticatedRequest,
} from "../login/session.guard.js";

const fail = httpFailure(FriendError, RoomError);
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function uuidOf(value: unknown): string {
  if (typeof value !== "string" || !UUID_RE.test(value))
    invalidInput("FRIEND_INPUT_INVALID");
  return (value as string).toLowerCase();
}
/** Đọc một field của body JSON; thiếu hoặc body không phải object thì trả undefined. */
function bodyField(body: unknown, key: string): unknown {
  if (typeof body !== "object" || body === null || Array.isArray(body))
    return undefined;
  const fields = body as Record<string, unknown>;
  return fields[key];
}
function stringField(body: unknown, key: string): string {
  const value = bodyField(body, key);
  if (typeof value !== "string") invalidInput("FRIEND_INPUT_INVALID");
  return value as string;
}
function boolField(body: unknown, key: string): boolean {
  const value = bodyField(body, key);
  if (typeof value !== "boolean") invalidInput("FRIEND_INPUT_INVALID");
  return value as boolean;
}

/**
 * Controller tính năng bạn bè, presence và lời mời phòng.
 * Không truy cập DB: mọi nghiệp vụ đi qua FriendService.
 */
@Controller("friends")
@UseGuards(SessionGuard)
export class FriendController {
  constructor(@Inject(FriendService) private readonly friends: FriendService) {}
  private user(request: AuthenticatedRequest) {
    if (!request.userId) invalidInput("FRIEND_INPUT_INVALID");
    return request.userId as string;
  }
  /** GET /friends/search: tìm thành viên theo tiền tố username. */
  @Get("search")
  @Header("Cache-Control", "no-store")
  search(@Req() request: AuthenticatedRequest, @Query("q") q: unknown) {
    if (typeof q !== "string") invalidInput("FRIEND_INPUT_INVALID");
    return this.friends.search(this.user(request), q as string).catch(fail);
  }
  /** GET /friends: bạn bè kèm trạng thái presence. */
  @Get()
  @Header("Cache-Control", "no-store")
  list(@Req() request: AuthenticatedRequest) {
    return this.friends.listFriends(this.user(request)).catch(fail);
  }
  /** POST /friends/presence: heartbeat lease của một tab (connectionId UUID). */
  @Post("presence")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  presence(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    return this.friends
      .heartbeat(this.user(request), uuidOf(bodyField(body, "connectionId")))
      .catch(fail);
  }
  /** POST /friends/requests: gửi lời mời kết bạn. */
  @Post("requests")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  send(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    return this.friends
      .sendRequest(this.user(request), stringField(body, "username"))
      .catch(fail);
  }
  /** GET /friends/requests: lời mời kết bạn đang chờ, hai chiều. */
  @Get("requests")
  @Header("Cache-Control", "no-store")
  requests(@Req() request: AuthenticatedRequest) {
    return this.friends.listRequests(this.user(request)).catch(fail);
  }
  /** POST /friends/requests/:id/respond: chấp nhận hoặc từ chối lời mời kết bạn. */
  @Post("requests/:id/respond")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  respond(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: unknown,
  ) {
    return this.friends
      .respondRequest(this.user(request), uuidOf(id), boolField(body, "accept"))
      .catch(fail);
  }
  /** POST /friends/requests/:id/revoke: người gửi thu hồi lời mời. */
  @Post("requests/:id/revoke")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  revoke(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
    return this.friends
      .revokeRequest(this.user(request), uuidOf(id))
      .catch(fail);
  }
  /** DELETE /friends/:userId: hủy quan hệ bạn bè. */
  @Delete(":userId")
  @Header("Cache-Control", "no-store")
  unfriend(@Req() request: AuthenticatedRequest, @Param("userId") id: string) {
    return this.friends.unfriend(this.user(request), uuidOf(id)).catch(fail);
  }
  /** POST /friends/invites: mời bạn bè vào phòng. */
  @Post("invites")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  invite(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    return this.friends
      .inviteToRoom(
        this.user(request),
        uuidOf(bodyField(body, "roomId")),
        stringField(body, "username"),
      )
      .catch(fail);
  }
  /** GET /friends/invites: lời mời vào phòng đang chờ phản hồi. */
  @Get("invites")
  @Header("Cache-Control", "no-store")
  invites(@Req() request: AuthenticatedRequest) {
    return this.friends.listRoomInvites(this.user(request)).catch(fail);
  }
  /** GET /friends/invite-state: cooldown toàn cục và thông báo từ chối chưa ack. */
  @Get("invite-state")
  @Header("Cache-Control", "no-store")
  inviteState(@Req() request: AuthenticatedRequest) {
    return this.friends.inviteState(this.user(request)).catch(fail);
  }
  /** POST /friends/invite-state/:id/ack: tiêu thụ thông báo từ chối (idempotent). */
  @Post("invite-state/:id/ack")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  ackDecline(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
    return this.friends.ackDecline(this.user(request), uuidOf(id)).catch(fail);
  }
  /**
   * POST /friends/invites/:id/respond: accept cần proof phòng (thành viên); commandId UUID bắt buộc.
   */
  @Post("invites/:id/respond")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  respondInvite(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: unknown,
  ) {
    const userId = this.user(request);
    const accept = boolField(body, "accept");
    const commandId = uuidOf(bodyField(body, "commandId"));
    if (!accept)
      return this.friends
        .respondRoomInvite(userId, uuidOf(id), { accept: false, commandId })
        .catch(fail);
    const proof = this.proofOf(request);
    return this.friends
      .respondRoomInvite(userId, uuidOf(id), { accept: true, commandId, proof })
      .catch(fail);
  }
  /** Đọc proof thành viên phòng; lỗi phiên/phòng được ánh xạ qua fail. */
  private proofOf(request: AuthenticatedRequest) {
    try {
      return readMemberRoomProof(request as unknown as IncomingMessage);
    } catch (error) {
      return fail(error);
    }
  }
}
