import {
  Inject,
  Injectable,
  Module,
  type DynamicModule,
  type OnApplicationBootstrap,
  type OnModuleDestroy,
} from "@nestjs/common";
import type { AuthProvider, RegistrationStore, Session } from "./contracts.js";
import { RegistrationService } from "./registration.service.js";
import { RegistrationController } from "./registration.controller.js";
import { AccountActiveGuard } from "./account-active.guard.js";
import { logEvent } from "../logger.js";

@Injectable()
class RegistrationMaintenance
  implements OnApplicationBootstrap, OnModuleDestroy
{
  private timer?: ReturnType<typeof setInterval>;
  private running = false;
  constructor(
    @Inject(RegistrationService)
    private readonly registration: RegistrationService,
  ) {}
  onApplicationBootstrap() {
    const run = async () => {
      if (this.running) return;
      this.running = true;
      try {
        await this.registration.maintain();
      } catch {
        process.stderr.write(
          logEvent("error", "registration_maintenance_failed") + "\n",
        );
      } finally {
        this.running = false;
      }
    };
    void run();
    // First eligible cleanup at 60 minutes; the next tick is at most 65 minutes.
    this.timer = setInterval(() => void run(), 5 * 60000);
    this.timer.unref();
  }
  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
  }
}

@Module({})
export class RegistrationModule {
  static forRoot(
    store: RegistrationStore,
    auth: AuthProvider,
    issueApplicationSession:
      | ((userId: string) => Promise<{ appSession: string; expiresAt: string }>)
      | null = null,
    authenticateRecovery:
      | ((
          account: { userId: string; email: string; username: string },
          password: string,
        ) => Promise<Session>)
      | null = null,
  ): DynamicModule {
    return {
      module: RegistrationModule,
      controllers: [RegistrationController],
      providers: [
        {
          provide: RegistrationService,
          useFactory: () =>
            new RegistrationService(
              store,
              auth,
              undefined,
              issueApplicationSession,
              authenticateRecovery,
            ),
        },
        AccountActiveGuard,
        RegistrationMaintenance,
      ],
      exports: [RegistrationService, AccountActiveGuard],
    };
  }
}
