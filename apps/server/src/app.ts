import "reflect-metadata";
import type { IncomingMessage, ServerResponse } from "node:http";
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
import {
  attachRealtime,
  type RealtimeDependencies,
} from "./realtime/gateway.js";

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
  realtime: Omit<RealtimeDependencies, "corsOrigins"> | null = null,
) {
  let closeSockets: () => Promise<void> = async () => {};
  const app = await NestFactory.create(
    {
      module: AppModule,
      imports,
      providers: [
        { provide: "DATABASE_CHECK", useValue: checkDatabase },
        {
          provide: "SOCKET_LIFECYCLE",
          useValue: { onModuleDestroy: () => closeSockets() },
        },
      ],
    },
    { logger: false },
  );
  app.use(
    (request: IncomingMessage, response: ServerResponse, next: () => void) => {
      const origin = request.headers.origin;
      if (
        origin &&
        !corsOrigins.includes(origin) &&
        !["GET", "HEAD", "OPTIONS"].includes(request.method ?? "")
      ) {
        response.writeHead(403, {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        });
        response.end(
          JSON.stringify({
            code: "ORIGIN_DENIED",
            message: "Nguồn yêu cầu không được phép",
          }),
        );
        return;
      }
      next();
    },
  );
  app.enableCors({ origin: corsOrigins, credentials: true });
  if (realtime) {
    closeSockets = attachRealtime(app.getHttpServer(), {
      ...realtime,
      corsOrigins,
    }).close;
  } else {
    const io = new Server(app.getHttpServer(), {
      cors: { origin: corsOrigins },
      allowRequest: (_request, callback) =>
        callback("Authentication not integrated", false),
    });
    let closing: Promise<void> | undefined;
    closeSockets = () =>
      (closing ??= new Promise<void>((resolve, reject) =>
        io.close((error) => (error ? reject(error) : resolve())),
      ));
  }
  return app;
}
