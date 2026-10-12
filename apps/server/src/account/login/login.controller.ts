import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  Inject,
  Optional,
  Post,
  Res,
} from "@nestjs/common";
import type { ServerResponse } from "node:http";
import { writeSessionCookies } from "../session/cookies.js";
import { LoginService } from "./login.service.js";
import { LoginError } from "./contracts.js";
@Controller("auth")
export class LoginController {
  constructor(
    @Inject(LoginService) private readonly loginService: LoginService,
    @Optional()
    @Inject("SESSION_COOKIE_SECURE")
    private readonly secureCookies = true,
  ) {}
  @Post("login")
  @HttpCode(200)
  async login(
    @Body() body: unknown,
    @Res({ passthrough: true }) response: ServerResponse,
  ) {
    response.setHeader("Cache-Control", "no-store");
    try {
      const result = await this.loginService.login(body);
      if (result.appSession && result.refresh_token && result.expiresAt) {
        const remember = (body as { remember?: boolean }).remember ?? true;
        writeSessionCookies(
          response,
          { ...result, remember },
          this.secureCookies,
        );
      }
      return result;
    } catch (error) {
      if (error instanceof LoginError)
        throw new HttpException(
          { code: error.code, message: error.message },
          error.status,
        );
      throw new HttpException(
        {
          code: "LOGIN_UNAVAILABLE",
          message: "Dịch vụ đăng nhập chưa thể xử lý yêu cầu",
        },
        503,
      );
    }
  }
}
