import {
  Body,
  Controller,
  Header,
  HttpCode,
  HttpException,
  Inject,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { RegistrationError } from "../auth/registration.types.js";
import {
  SessionGuard,
  type AuthenticatedRequest,
} from "../login/session.guard.js";
import { UsernameService } from "./username.service.js";
import { UsernameError } from "./username.types.js";

function fail(error: unknown): never {
  if (error instanceof UsernameError || error instanceof RegistrationError)
    throw new HttpException(
      { code: error.code, message: error.message },
      error.status,
    );
  throw new HttpException(
    {
      code: "USERNAME_UNAVAILABLE",
      message: "Không thể xử lý tên đăng nhập lúc này",
    },
    503,
  );
}

interface FinalizeBody {
  changeToken?: unknown;
  username?: unknown;
}
interface RequestIdBody {
  requestId?: unknown;
}
interface VerifyBody {
  requestId?: unknown;
  otp?: unknown;
}
interface EmailBody {
  email?: unknown;
}

@Controller("account/username")
@UseGuards(SessionGuard)
export class UsernameController {
  constructor(
    @Inject(UsernameService) private readonly usernames: UsernameService,
  ) {}
  private userId(request: AuthenticatedRequest): string {
    if (!request.session)
      throw new HttpException(
        { code: "SESSION_INVALID", message: "Phiên đăng nhập không hợp lệ" },
        401,
      );
    return request.session.userId;
  }

  @Post("change/request")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  changeRequest(@Req() request: AuthenticatedRequest) {
    return this.usernames.changeRequest(this.userId(request)).catch(fail);
  }

  @Post("change/resend")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  changeResend(
    @Req() request: AuthenticatedRequest,
    @Body() body: RequestIdBody,
  ) {
    return this.usernames.changeResend(this.userId(request), body).catch(fail);
  }

  @Post("change/verify")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  changeVerify(@Req() request: AuthenticatedRequest, @Body() body: VerifyBody) {
    return this.usernames.changeVerify(this.userId(request), body).catch(fail);
  }

  @Post("change/finalize")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  changeFinalize(
    @Req() request: AuthenticatedRequest,
    @Body() body: FinalizeBody,
  ) {
    return this.usernames
      .changeFinalize(this.userId(request), body)
      .catch(fail);
  }
}

@Controller("auth/username/recovery")
export class UsernameRecoveryController {
  constructor(
    @Inject(UsernameService) private readonly usernames: UsernameService,
  ) {}

  @Post()
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  request(@Body() body: EmailBody) {
    return this.usernames.recoveryRequest(body).catch(fail);
  }

  @Post("resend")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  resend(@Body() body: RequestIdBody) {
    return this.usernames.recoveryResend(body).catch(fail);
  }

  @Post("verify")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  verify(@Body() body: VerifyBody) {
    return this.usernames.recoveryVerify(body).catch(fail);
  }
}
