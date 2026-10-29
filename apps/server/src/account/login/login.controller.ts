import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  Inject,
  Optional,
  Post,
  Req,
  Res,
} from "@nestjs/common";
import type { IncomingMessage, ServerResponse } from "node:http";
import { writeSessionCookies } from "../session/cookies.js";
import { deviceToken } from "./device.js";
import { LoginService } from "./login.service.js";
import { LoginError } from "./login.types.js";
/**
 * Controller xử lý yêu cầu đăng nhập người dùng bằng username và mật khẩu.
 */
@Controller("auth")
export class LoginController {
  constructor(
    @Inject(LoginService) private readonly loginService: LoginService,
    @Optional()
    @Inject("SESSION_COOKIE_SECURE")
    private readonly secureCookies = true,
  ) {}
  /**
   * Endpoint POST /auth/login: Xác thực tài khoản, trả về token và thiết lập cookie phiên.
   */
  @Post("login")
  @HttpCode(200)
  async login(
    @Body() body: unknown,
    @Req() request: IncomingMessage,
    @Res({ passthrough: true }) response: ServerResponse,
  ) {
    response.setHeader("Cache-Control", "no-store");
    // Same browser keeps the same opaque device id; a new browser gets a fresh one.
    const device = deviceToken(request.headers.cookie);
    try {
      const result = await this.loginService.login(body, device.token);
      if (result.appSession && result.refresh_token && result.expiresAt) {
        const remember = (body as { remember?: boolean }).remember ?? true;
        writeSessionCookies(
          response,
          {
            ...result,
            remember,
            deviceToken: device.fresh ? device.token : undefined,
          },
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
