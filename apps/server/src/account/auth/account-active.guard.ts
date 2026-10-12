import {
  Inject,
  Injectable,
  HttpException,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";
import { RegistrationService } from "./registration.service.js";
import { RegistrationError } from "./contracts.js";

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
