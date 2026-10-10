import "reflect-metadata";
import {
  Controller,
  Get,
  Inject,
  Module,
  type DynamicModule,
} from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { HealthStatus } from "@xiangqi/shared";
import { Server } from "socket.io";

@Controller()
class HealthController {
  constructor(
    @Inject("DATABASE_CHECK")
    private readonly checkDatabase: (() => Promise<void>) | null,
  ) {}
  @Get("health")
  async health(): Promise<HealthStatus> {
    let database: HealthStatus["database"] = "not_connected";
    if (this.checkDatabase) {
      try {
        await this.checkDatabase();
        database = "ok";
      } catch {
        database = "error";
      }
    }
    return { server: "ok", database, engine: "not_connected" };
  }
}

@Module({ controllers: [HealthController] })
class AppModule {}

export async function createApp(
  corsOrigins = ["http://localhost:5173"],
  imports: DynamicModule[] = [],
  checkDatabase: (() => Promise<void>) | null = null,
) {
  const app = await NestFactory.create(
    {
      module: AppModule,
      imports,
      providers: [{ provide: "DATABASE_CHECK", useValue: checkDatabase }],
    },
    { logger: false },
  );
  app.enableCors({ origin: corsOrigins });
  // Authentication and game events belong to T12. Deny sockets until then.
  new Server(app.getHttpServer(), {
    cors: { origin: corsOrigins },
    allowRequest: (_request, callback) =>
      callback("Authentication not integrated", false),
  });
  return app;
}
