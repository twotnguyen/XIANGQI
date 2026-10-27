import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Inject,
  Patch,
  Req,
  UseGuards,
} from "@nestjs/common";
import { ProfileError } from "./profile.types.js";
import { httpFailure, invalidInput } from "../../core/http-errors.js";
import { ProfileService } from "./profile.service.js";
import { LoginError } from "../login/login.types.js";
import {
  SessionGuard,
  type AuthenticatedRequest,
} from "../login/session.guard.js";
const fail = httpFailure(ProfileError, LoginError);
/**
 * Controller quản lý hồ sơ cá nhân và vị trí phòng chơi hiện tại của người dùng.
 */
@Controller("profile")
@UseGuards(SessionGuard)
export class ProfileController {
  constructor(
    @Inject(ProfileService) private readonly profiles: ProfileService,
  ) {}
  private async identity(request: AuthenticatedRequest) {
    const session = request.session;
    if (!session)
      throw new LoginError("SESSION_INVALID", "Phiên đăng nhập không hợp lệ");
    return {
      userId: session.userId,
      username: session.username,
      email: session.email,
    };
  }
  /**
   * Endpoint GET /profile: Lấy thông tin hồ sơ cá nhân (userId, username, email, displayName).
   */
  @Get()
  @Header("Cache-Control", "no-store")
  read(@Req() request: AuthenticatedRequest) {
    return this.identity(request)
      .then((identity) => this.profiles.read(identity.userId, identity))
      .catch(fail);
  }
  /**
   * Endpoint PATCH /profile: Cập nhật tên hiển thị (displayName) của người dùng.
   */
  @Patch()
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  update(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    const input = (body ?? {}) as Record<string, unknown>;
    if (!Object.hasOwn(input, "displayName"))
      invalidInput("PROFILE_INPUT_INVALID");
    return this.identity(request)
      .then((identity) =>
        this.profiles.updateDisplayName(identity.userId, input.displayName),
      )
      .catch(fail);
  }
  /**
   * Endpoint GET /profile/location: Kiểm tra người dùng hiện đang ở đâu (phòng chờ, trận đấu online hay trận AI).
   */
  @Get("location")
  @Header("Cache-Control", "no-store")
  location(@Req() request: AuthenticatedRequest) {
    return this.identity(request)
      .then((identity) => this.profiles.location(identity.userId))
      .catch(fail);
  }
}
