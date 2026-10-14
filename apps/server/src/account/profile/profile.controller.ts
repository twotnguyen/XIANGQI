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
import { ProfileStore } from "./profile.service.js";
import { SessionService } from "../login/session.service.js";
import { LoginError } from "../login/login.types.js";
import {
  SessionGuard,
  type AuthenticatedRequest,
} from "../login/session.guard.js";
import { readSessionCookie } from "../session/cookies.js";
const fail = httpFailure(ProfileError, LoginError);
@Controller("profile")
@UseGuards(SessionGuard)
export class ProfileController {
  constructor(
    @Inject(ProfileStore) private readonly profiles: ProfileStore,
    @Inject(SessionService) private readonly sessions: SessionService,
  ) {}
  private capability(request: AuthenticatedRequest) {
    return Object.hasOwn(request.headers, "x-xiangqi-session")
      ? request.headers["x-xiangqi-session"]
      : readSessionCookie(request.headers.cookie, "xiangqi_session");
  }
  private async identity(request: AuthenticatedRequest) {
    const session = await this.sessions.requireValidSession(
      this.capability(request),
    );
    const account = await this.sessions.store.accountById(session.userId);
    if (!account?.active)
      throw new LoginError("SESSION_INVALID", "Phiên đăng nhập không hợp lệ");
    return {
      userId: session.userId,
      username: account.username,
      email: account.email,
    };
  }
  @Get()
  @Header("Cache-Control", "no-store")
  read(@Req() request: AuthenticatedRequest) {
    return this.identity(request)
      .then((identity) => this.profiles.read(identity.userId, identity))
      .catch(fail);
  }
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
  @Get("location")
  @Header("Cache-Control", "no-store")
  location(@Req() request: AuthenticatedRequest) {
    return this.identity(request)
      .then((identity) => this.profiles.location(identity.userId))
      .catch(fail);
  }
}
