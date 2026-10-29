import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  Inject,
  Post,
  Optional,
  Res,
  Req,
  Header,
  Get,
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";
import { RegistrationService } from "./registration.service.js";
import { RegistrationError, type Credentials } from "./registration.types.js";
import type { IncomingMessage, ServerResponse } from "node:http";
import { writeSessionCookies } from "../session/cookies.js";
import { deviceToken } from "../login/device.js";
/**
 * Guard bảo vệ các route yêu cầu tài khoản đã kích hoạt và hoàn tất đăng ký:
 * Xác thực Bearer token từ Authorization header và kiểm tra trạng thái hoạt động của tài khoản.
 */
@Injectable()
export class AccountActiveGuard implements CanActivate {
  constructor(
    @Inject(RegistrationService)
    private readonly registration: RegistrationService,
  ) {}

  /**
   * Kiểm tra token và đảm bảo tài khoản không ở trạng thái pending hoặc chưa hoàn thiện hồ sơ.
   */
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
/**
 * Controller quản lý luồng đăng ký tài khoản nhiều bước:
 * Kiểm tra username -> gửi OTP qua email -> xác minh OTP và tạo hồ sơ.
 */
@Controller("auth/register")
export class RegistrationController {
  constructor(
    @Inject(RegistrationService)
    private readonly registration: RegistrationService,
    @Optional() @Inject("SESSION_COOKIE_SECURE") private readonly secure = true,
  ) {}

  /**
   * Xử lý thực thi tác vụ đăng ký và chuẩn hóa ngoại lệ RegistrationError thành mã lỗi HTTP.
   */
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
  /**
   * Bước 1: Kiểm tra tính hợp lệ và sự khả dụng của username trước khi đăng ký.
   */
  @Post("check")
  @HttpCode(200)
  check(@Body() body: unknown) {
    return this.respond(() => this.registration.check(body));
  }
  /**
   * Bước 2: Tạo intent đăng ký và gửi mã xác thực OTP đến email người dùng.
   */
  @Post("email")
  @HttpCode(200)
  email(
    @Body() body: Credentials & { email: string; registrationToken?: string },
  ) {
    return this.respond(() => this.registration.email(body));
  }
  /**
   * Bước 3: Xác minh mã OTP, hoàn tất đăng ký tài khoản và thiết lập cookie phiên đăng nhập.
   */
  @Header("Cache-Control", "no-store")
  @Post("verify")
  @HttpCode(200)
  verify(
    @Body() body: { registrationToken: string; otp: string; password?: string },
    @Req() request: IncomingMessage,
    @Res({ passthrough: true }) response: ServerResponse,
  ) {
    return this.respond(async () => {
      const device = deviceToken(request.headers.cookie);
      const session = await this.registration.verify(body, device.token);
      if (session.appSession && session.expiresAt)
        writeSessionCookies(
          response,
          {
            ...session,
            appSession: session.appSession,
            expiresAt: session.expiresAt,
            remember: true,
            deviceToken: device.fresh ? device.token : undefined,
          },
          this.secure,
        );
      return session;
    });
  }
  /**
   * Gửi lại mã OTP xác minh email theo token phiên đăng ký hiện tại.
   */
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
/**
 * Controller cung cấp trạng thái cấu hình của các nhà cung cấp xác thực (Google, Guest).
 */
@Controller("auth")
export class ProvidersController {
  constructor(
    @Inject("AUTH_PROVIDERS") private readonly providers: Providers,
  ) {}

  /**
   * Lấy danh sách các phương thức đăng nhập khả dụng hiện tại.
   */
  @Get("providers")
  @Header("Cache-Control", "no-store")
  current() {
    return { google: this.providers.google, guest: this.providers.guest };
  }
}
