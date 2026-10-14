import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  Inject,
  Post,
  Optional,
  Res,
  Header,
  Get,
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";
import { RegistrationService } from "./registration.service.js";
import { RegistrationError, type Credentials } from "./registration.types.js";
import type { ServerResponse } from "node:http";
import { writeSessionCookies } from "../session/cookies.js";
@Injectable()
export class AccountActiveGuard implements CanActivate {
  constructor(
    @Inject(RegistrationService)
    private readonly registration: RegistrationService,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{
      headers: { authorization?: string };
      authUserId?: string;
    }>();
    const token = request.headers.authorization?.match(/^Bearer (\S+)$/)?.[1];
    if (!token)
      throw new HttpException(
        { code: "SESSION_REQUIRED", message: "Vui lòng đăng nhập" },
        401,
      );
    try {
      request.authUserId = await this.registration.requireActive(token);
      return true;
    } catch (error) {
      if (
        error instanceof RegistrationError &&
        error.code === "ACCOUNT_PENDING"
      )
        throw new HttpException(
          { code: error.code, message: error.message },
          403,
        );
      throw new HttpException(
        { code: "SESSION_INVALID", message: "Phiên đăng nhập không hợp lệ" },
        401,
      );
    }
  }
}
@Controller("auth/register")
export class RegistrationController {
  constructor(
    @Inject(RegistrationService)
    private readonly registration: RegistrationService,
    @Optional() @Inject("SESSION_COOKIE_SECURE") private readonly secure = true,
  ) {}
  private async respond<T>(work: () => Promise<T>): Promise<T> {
    try {
      return await work();
    } catch (error) {
      if (error instanceof RegistrationError)
        throw new HttpException(
          {
            code: error.code,
            message: error.message,
            ...(error.step ? { step: error.step } : {}),
          },
          error.status,
        );
      throw new HttpException(
        {
          code: "REGISTRATION_UNAVAILABLE",
          message:
            "Dịch vụ đăng ký chưa thể xử lý yêu cầu, vui lòng thử lại sau",
        },
        503,
      );
    }
  }
  @Post("check")
  @HttpCode(200)
  check(@Body() body: unknown) {
    return this.respond(() => this.registration.check(body));
  }
  @Post("email")
  @HttpCode(200)
  email(
    @Body() body: Credentials & { email: string; registrationToken?: string },
  ) {
    return this.respond(() => this.registration.email(body));
  }
  @Header("Cache-Control", "no-store")
  @Post("verify")
  @HttpCode(200)
  verify(
    @Body() body: { registrationToken: string; otp: string; password?: string },
    @Res({ passthrough: true }) response: ServerResponse,
  ) {
    return this.respond(async () => {
      const session = await this.registration.verify(body);
      if (session.appSession && session.expiresAt)
        writeSessionCookies(
          response,
          {
            ...session,
            appSession: session.appSession,
            expiresAt: session.expiresAt,
            remember: true,
          },
          this.secure,
        );
      return session;
    });
  }
  @Post("resend")
  @HttpCode(200)
  resend(@Body() body: { registrationToken: string }) {
    return this.respond(() => this.registration.resend(body));
  }
}
export interface Providers {
  google: boolean;
  guest: boolean;
}
@Controller("auth")
export class ProvidersController {
  constructor(
    @Inject("AUTH_PROVIDERS") private readonly providers: Providers,
  ) {}
  @Get("providers")
  @Header("Cache-Control", "no-store")
  current() {
    return { google: this.providers.google, guest: this.providers.guest };
  }
}
