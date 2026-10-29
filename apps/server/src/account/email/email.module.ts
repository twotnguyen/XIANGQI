import { Module, type DynamicModule } from "@nestjs/common";
import { EmailController } from "./email.controller.js";
import { EmailVerificationService } from "./email.service.js";
import { SessionService } from "../login/session.service.js";
import { SessionGuard } from "../login/session.guard.js";

/**
 * Module NestJS cho xác minh email liên hệ của tài khoản username-only.
 */
@Module({})
export class EmailModule {
  /** Khởi tạo DynamicModule với service đã được runtime cấu hình. */
  static forRoot(
    service: EmailVerificationService,
    sessions: SessionService,
  ): DynamicModule {
    return {
      module: EmailModule,
      controllers: [EmailController],
      providers: [
        { provide: EmailVerificationService, useValue: service },
        { provide: SessionService, useValue: sessions },
        SessionGuard,
      ],
    };
  }
}
