import "reflect-metadata";
import { Controller, Get, Module } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { HealthStatus } from "@xiangqi/shared";
import { Server } from "socket.io";

@Controller()
class HealthController {
  @Get("health")
  health(): HealthStatus {
    return { server: "ok", database: "not_connected", engine: "not_connected" };
  }
}

@Module({ controllers: [HealthController] })
class AppModule {}

export async function createApp(corsOrigins = ["http://localhost:5173"]) {
  const app = await NestFactory.create(AppModule, { logger: false });
  app.enableCors({ origin: corsOrigins });
  // Authentication and game events belong to T12. Deny sockets until then.
  new Server(app.getHttpServer(), {
    cors: { origin: corsOrigins },
    allowRequest: (_request, callback) =>
      callback("Authentication not integrated", false),
  });
  return app;
}
