import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpException,
  Inject,
  Module,
  Patch,
  Req,
  UseGuards,
  type DynamicModule,
} from "@nestjs/common";
import { ProfileError } from "./contracts.js";
import { ProfileStore } from "./profile-store.js";
import { SessionService } from "../login/session.service.js";
import { LoginError } from "../login/contracts.js";
import {
  SessionGuard,
  type AuthenticatedRequest,
} from "../login/session.guard.js";
import { readSessionCookie } from "../session/cookies.js";
function invalid(): never {
  throw new HttpException(
    { code: "PROFILE_INPUT_INVALID", message: "Dữ liệu không hợp lệ" },
    400,
  );
}
function fail(error: unknown): never {
  if (error instanceof ProfileError)
    throw new HttpException(
      { code: error.code, message: error.message },
      error.status,
    );
  if (error instanceof LoginError)
    throw new HttpException(
      { code: error.code, message: error.message },
      error.status,
    );
  throw error;
}
@Controller("profile")
@UseGuards(SessionGuard)
class ProfileController {
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
    if (!Object.hasOwn(input, "displayName")) invalid();
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
@Module({})
export class ProfileModule {
  static forRoot(store: ProfileStore, sessions: SessionService): DynamicModule {
    return {
      module: ProfileModule,
      controllers: [ProfileController],
      providers: [
        { provide: ProfileStore, useValue: store },
        { provide: SessionService, useValue: sessions },
        SessionGuard,
      ],
    };
  }
}
