import {
  Body,
  Controller,
  HttpCode,
  HttpException,
  Inject,
  Post,
} from "@nestjs/common";
import { RegistrationService } from "./registration.service.js";
import { RegistrationError, type Credentials } from "./contracts.js";

@Controller("auth/register")
export class RegistrationController {
  constructor(
    @Inject(RegistrationService)
    private readonly registration: RegistrationService,
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
  @Post("verify")
  @HttpCode(200)
  verify(
    @Body() body: { registrationToken: string; otp: string; password?: string },
  ) {
    return this.respond(() => this.registration.verify(body));
  }
  @Post("resend")
  @HttpCode(200)
  resend(@Body() body: { registrationToken: string }) {
    return this.respond(() => this.registration.resend(body));
  }
}
