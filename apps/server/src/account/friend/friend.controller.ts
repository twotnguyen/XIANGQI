import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpException,
  Inject,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import { FriendError } from "./friend.types.js";
import { FriendStore } from "./friend-store.js";
import {
  SessionGuard,
  type AuthenticatedRequest,
} from "../login/session.guard.js";
function invalid(): never {
  throw new HttpException(
    { code: "FRIEND_INPUT_INVALID", message: "Dữ liệu không hợp lệ" },
    400,
  );
}
function fail(error: unknown): never {
  if (error instanceof FriendError)
    throw new HttpException(
      { code: error.code, message: error.message },
      error.status,
    );
  throw error;
}
@Controller("friends")
@UseGuards(SessionGuard)
export class FriendController {
  constructor(@Inject(FriendStore) private readonly friends: FriendStore) {}
  private user(request: AuthenticatedRequest) {
    if (!request.userId) invalid();
    return request.userId as string;
  }
  @Get("search")
  @Header("Cache-Control", "no-store")
  search(@Req() request: AuthenticatedRequest, @Query("q") q: unknown) {
    if (typeof q !== "string") invalid();
    return this.friends.search(this.user(request), q).catch(fail);
  }
  @Get()
  @Header("Cache-Control", "no-store")
  list(@Req() request: AuthenticatedRequest) {
    return this.friends.listFriends(this.user(request)).catch(fail);
  }
  @Post("requests")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  send(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    const input = (body ?? {}) as Record<string, unknown>;
    if (typeof input.username !== "string") invalid();
    return this.friends
      .sendRequest(this.user(request), input.username as string)
      .catch(fail);
  }
  @Get("requests")
  @Header("Cache-Control", "no-store")
  requests(@Req() request: AuthenticatedRequest) {
    return this.friends.listRequests(this.user(request)).catch(fail);
  }
  @Post("requests/:id/respond")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  respond(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: unknown,
  ) {
    const input = (body ?? {}) as Record<string, unknown>;
    if (typeof input.accept !== "boolean") invalid();
    return this.friends
      .respondRequest(this.user(request), id, input.accept as boolean)
      .catch(fail);
  }
  @Post("requests/:id/revoke")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  revoke(@Req() request: AuthenticatedRequest, @Param("id") id: string) {
    return this.friends.revokeRequest(this.user(request), id).catch(fail);
  }
  @Delete(":userId")
  @Header("Cache-Control", "no-store")
  unfriend(@Req() request: AuthenticatedRequest, @Param("userId") id: string) {
    return this.friends.unfriend(this.user(request), id).catch(fail);
  }
  @Post("invites")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  invite(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    const input = (body ?? {}) as Record<string, unknown>;
    if (typeof input.roomId !== "string" || typeof input.username !== "string")
      invalid();
    return this.friends
      .inviteToRoom(
        this.user(request),
        input.roomId as string,
        input.username as string,
      )
      .catch(fail);
  }
  @Get("invites")
  @Header("Cache-Control", "no-store")
  invites(@Req() request: AuthenticatedRequest) {
    return this.friends.listRoomInvites(this.user(request)).catch(fail);
  }
  @Post("invites/:id/respond")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  respondInvite(
    @Req() request: AuthenticatedRequest,
    @Param("id") id: string,
    @Body() body: unknown,
  ) {
    const input = (body ?? {}) as Record<string, unknown>;
    if (typeof input.accept !== "boolean") invalid();
    return this.friends
      .respondRoomInvite(this.user(request), id, input.accept as boolean)
      .catch(fail);
  }
}
