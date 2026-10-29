import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Inject,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { EmailError } from "./email.types.js";
import { EmailVerificationService } from "./email.service.js";
import { httpFailure } from "../../core/http-errors.js";
import { LoginError } from "../login/login.types.js";
import {
  SessionGuard,
  type AuthenticatedRequest,
} from "../login/session.guard.js";

const fail = httpFailure(EmailError, LoginError);

/**
 * Controller quản lý email liên hệ của tài khoản username-only.
 */
@Controller("account/email")
@UseGuards(SessionGuard)
export class EmailController {
  constructor(
    @Inject(EmailVerificationService)
    private readonly emails: EmailVerificationService,
  ) {}

  private userId(request: AuthenticatedRequest): string {
    const session = request.session;
    if (!session)
      throw new LoginError("SESSION_INVALID", "Phiên đăng nhập không hợp lệ");
    return session.userId;
  }

  /** GET /account/email: trạng thái email hiện tại. */
  @Get()
  @Header("Cache-Control", "no-store")
  read(@Req() request: AuthenticatedRequest) {
    return Promise.resolve()
      .then(() => this.emails.status(this.userId(request)))
      .catch(fail);
  }

  /** POST /account/email/send: gửi OTP tới email mới. */
  @Post("send")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  send(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    return Promise.resolve()
      .then(() => this.emails.send(this.userId(request), body))
      .catch(fail);
  }

  /** POST /account/email/resend: gửi lại OTP tới email đang chờ. */
  @Post("resend")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  resend(@Req() request: AuthenticatedRequest) {
    return Promise.resolve()
      .then(() => this.emails.resend(this.userId(request)))
      .catch(fail);
  }

  /** POST /account/email/verify: xác minh OTP. */
  @Post("verify")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  verify(@Req() request: AuthenticatedRequest, @Body() body: unknown) {
    return Promise.resolve()
      .then(() => this.emails.verify(this.userId(request), body))
      .catch(fail);
  }
}
