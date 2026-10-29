import {
  Body,
  Controller,
  Header,
  HttpCode,
  HttpException,
  Inject,
  Optional,
  Post,
  Res,
} from "@nestjs/common";
import type { ServerResponse } from "node:http";
import { writeSessionCookies } from "../session/cookies.js";
import { RegistrationError } from "./registration.types.js";
import { UsernameRegistrationService } from "./username-registration.service.js";

@Controller("auth/register")
export class UsernameRegistrationController {
  constructor(
    @Inject(UsernameRegistrationService)
    private readonly registration: UsernameRegistrationService,
    @Optional() @Inject("SESSION_COOKIE_SECURE") private readonly secure = true,
  ) {}

  @Post("skip")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  async skip(
    @Body() body: unknown,
    @Res({ passthrough: true }) response: ServerResponse,
  ) {
    try {
      const session = await this.registration.register(body);
      writeSessionCookies(
        response,
        { ...session, remember: true },
        this.secure,
      );
      return session;
    } catch (error) {
      if (error instanceof RegistrationError)
        throw new HttpException(
          { code: error.code, message: error.message, step: error.step },
          error.status,
        );
      throw new HttpException(
        {
          code: "REGISTRATION_UNAVAILABLE",
          message:
            "Chưa thể tạo tài khoản, vui lòng thử lại hoặc đăng nhập nếu tài khoản đã được tạo",
        },
        503,
      );
    }
  }
}
