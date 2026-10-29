import {
  Body,
  Controller,
  Header,
  HttpCode,
  HttpException,
  Inject,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { ServerResponse } from "node:http";
import {
  SessionGuard,
  type AuthenticatedRequest,
} from "../login/session.guard.js";
import { LoginError } from "../login/login.types.js";
import {
  clearSessionCookies,
  readSessionCookie,
  writeSessionCookies,
} from "../session/cookies.js";
import { PasswordService } from "./password.service.js";
import { PasswordError } from "./password.types.js";

function fail(error: unknown): never {
  if (error instanceof PasswordError || error instanceof LoginError)
    throw new HttpException(
      { code: error.code, message: error.message },
      error.status,
    );
  throw new HttpException(
    {
      code: "PASSWORD_PROVIDER_ERROR",
      message: "Chưa thể xử lý yêu cầu mật khẩu, vui lòng thử lại",
    },
    503,
  );
}

@Controller("account/password")
@UseGuards(SessionGuard)
export class PasswordController {
  constructor(
    @Inject(PasswordService) private readonly passwords: PasswordService,
    @Inject("SESSION_COOKIE_SECURE") private readonly secure: boolean,
  ) {}

  @Post("change")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  change(
    @Req() request: AuthenticatedRequest,
    @Body() body: unknown,
    @Res({ passthrough: true }) response: ServerResponse,
  ) {
    return Promise.resolve()
      .then(async () => {
        if (!request.session)
          throw new LoginError(
            "SESSION_INVALID",
            "Phiên đăng nhập không hợp lệ",
          );
        const capability = Object.hasOwn(request.headers, "x-xiangqi-session")
          ? request.headers["x-xiangqi-session"]
          : readSessionCookie(request.headers.cookie, "xiangqi_session");
        const result = await this.passwords.change(
          request.session,
          capability,
          body,
        );
        writeSessionCookies(
          response,
          {
            appSession: result.appSession,
            refresh_token: result.session.refresh_token,
            expiresAt: result.expiresAt,
            remember: result.remember,
          },
          this.secure,
        );
        return { ok: true };
      })
      .catch(fail);
  }
}

@Controller("auth/password/recovery")
export class PasswordRecoveryController {
  constructor(
    @Inject(PasswordService) private readonly passwords: PasswordService,
    @Inject("SESSION_COOKIE_SECURE") private readonly secure: boolean,
  ) {}

  @Post()
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  request(@Body() body: unknown) {
    return this.passwords.request(body).catch(fail);
  }

  @Post("resend")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  resend(@Body() body: unknown) {
    return this.passwords.resend(body).catch(fail);
  }

  @Post("verify")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  verify(@Body() body: unknown) {
    return this.passwords.verify(body).catch(fail);
  }

  @Post("reset")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  reset(
    @Body() body: unknown,
    @Res({ passthrough: true }) response: ServerResponse,
  ) {
    return this.passwords
      .reset(body)
      .then((result) => {
        clearSessionCookies(response, this.secure);
        return result;
      })
      .catch(fail);
  }
}
