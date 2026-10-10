import { RegistrationError } from "../auth/contracts.js";
import {
  HttpException,
  Inject,
  Injectable,
  type CanActivate,
  type ExecutionContext,
} from "@nestjs/common";
import { SessionService } from "./session.service.js";
import { LoginError } from "./contracts.js";
import { readSessionCookie } from "../session/cookies.js";
export interface AuthenticatedRequest {
  headers: Record<string, string | string[] | undefined>;
  userId?: string;
}
@Injectable()
export class SessionGuard implements CanActivate {
  constructor(
    @Inject(SessionService) private readonly sessions: SessionService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const authorization = request.headers.authorization;
    const bearer =
      typeof authorization === "string" &&
      /^Bearer [^\s]+$/i.test(authorization)
        ? authorization.slice(7)
        : undefined;
    try {
      const capability = Object.hasOwn(request.headers, "x-xiangqi-session")
        ? request.headers["x-xiangqi-session"]
        : readSessionCookie(request.headers.cookie, "xiangqi_session");
      request.userId = await this.sessions.requireActive(bearer, capability);
      return true;
    } catch (error) {
      if (error instanceof RegistrationError && error.status === 401)
        throw new HttpException(
          { code: "SESSION_INVALID", message: "Phiên đăng nhập không hợp lệ" },
          401,
        );
      if (error instanceof LoginError)
        throw new HttpException(
          { code: error.code, message: error.message },
          error.status,
        );
      throw new HttpException(
        {
          code: "SESSION_UNAVAILABLE",
          message: "Chưa thể xác thực phiên đăng nhập",
        },
        503,
      );
    }
  }
}
