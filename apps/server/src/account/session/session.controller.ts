import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpException,
  Inject,
  Post,
  Optional,
  Res,
  Req,
  UseGuards,
} from "@nestjs/common";
import { RegistrationError, type Session } from "../auth/registration.types.js";
import { LoginError } from "../login/login.types.js";
import {
  SessionService,
  type ValidatedSession,
} from "../login/session.service.js";
import {
  SessionGuard,
  type AuthenticatedRequest,
} from "../login/session.guard.js";
import type { ServerResponse } from "node:http";
import {
  clearSessionCookies,
  readSessionCookie,
  writeSessionCookies,
} from "./cookies.js";
export type RefreshProvider = (refreshToken: unknown) => Promise<Session>;

@Controller("auth")
export class SessionController {
  constructor(
    @Inject(SessionService) private readonly sessions: SessionService,
    @Inject("REFRESH_PROVIDER")
    private readonly refreshProvider: RefreshProvider,
    @Optional() @Inject("SESSION_COOKIE_SECURE") private readonly secure = true,
  ) {}
  private capability(request: AuthenticatedRequest) {
    return Object.hasOwn(request.headers, "x-xiangqi-session")
      ? request.headers["x-xiangqi-session"]
      : readSessionCookie(request.headers.cookie, "xiangqi_session");
  }
  private actor(session: ValidatedSession) {
    return {
      userId: session.userId,
      username: session.username,
      kind: "member" as const,
      expiresAt: session.expiresAt,
      remember: session.remember,
    };
  }
  private async respond<T>(work: () => Promise<T>): Promise<T> {
    try {
      return await work();
    } catch (error) {
      if (error instanceof LoginError)
        throw new HttpException(
          { code: error.code, message: error.message },
          error.status,
        );
      if (error instanceof RegistrationError && error.status === 401)
        throw new HttpException(
          { code: "SESSION_INVALID", message: "Phiên đăng nhập không hợp lệ" },
          401,
        );
      throw new HttpException(
        {
          code: "SESSION_UNAVAILABLE",
          message: "Chưa thể xác thực phiên đăng nhập",
        },
        503,
      );
    }
  }
  @Get("session")
  @Header("Cache-Control", "no-store")
  @UseGuards(SessionGuard)
  current(@Req() request: AuthenticatedRequest) {
    return this.respond(async () => {
      if (!request.session)
        throw new LoginError("SESSION_INVALID", "Phiên đăng nhập không hợp lệ");
      return this.actor(request.session);
    });
  }
  @Post("refresh")
  @Header("Cache-Control", "no-store")
  @HttpCode(200)
  refresh(
    @Req() request: AuthenticatedRequest,
    @Body() body: unknown,
    @Res({ passthrough: true }) response: ServerResponse,
  ) {
    return this.respond(async () => {
      const capability = this.capability(request);
      const supplied =
        body && typeof body === "object"
          ? (body as Record<string, unknown>).refresh_token
          : undefined;
      const token =
        body && typeof body === "object" && Object.hasOwn(body, "refresh_token")
          ? supplied
          : readSessionCookie(request.headers.cookie, "xiangqi_refresh");
      const { session, actor: validated } = await this.sessions.refresh(
        capability,
        async () => {
          if (typeof token !== "string" || !token)
            throw new LoginError(
              "SESSION_INVALID",
              "Phiên đăng nhập không hợp lệ",
            );
          return this.refreshProvider(token);
        },
      );
      const actor = this.actor(validated);
      writeSessionCookies(
        response,
        {
          appSession: capability as string,
          refresh_token: session.refresh_token,
          expiresAt: actor.expiresAt,
          remember: actor.remember,
        },
        this.secure,
      );
      return {
        access_token: session.access_token,
        refresh_token: session.refresh_token,
        expires_in: session.expires_in,
        appSession: capability,
        ...actor,
      };
    });
  }
  @Post("logout")
  @Header("Cache-Control", "no-store")
  @HttpCode(200)
  @UseGuards(SessionGuard)
  logout(
    @Req() request: AuthenticatedRequest,
    @Res({ passthrough: true }) response: ServerResponse,
  ) {
    return this.respond(async () => {
      await this.sessions.revoke(this.capability(request));
      clearSessionCookies(response, this.secure);
      return { loggedOut: true };
    });
  }
}
