import "reflect-metadata";
import type { IncomingMessage, ServerResponse } from "node:http";
import {
  Controller,
  Get,
  Inject,
  Module,
  Res,
  type DynamicModule,
} from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { PrivateBodyFilter } from "./core/private-body-filter.js";
import type { HealthStatus } from "@xiangqi/shared";
import { Server } from "socket.io";
import {
  attachPublicRoomFeed,
  type PublicRoomFeedDependencies,
} from "./game/room/public/public-room-feed.js";
import {
  attachRealtime,
  type RealtimeDependencies,
} from "./game/realtime/gateway.js";

/**
 * Trạng thái sẵn sàng phục vụ: database và runtime (room/AI) chỉ được tính khi đã cấu hình.
 */
export interface ReadyStatus {
  status: "ready" | "not_ready";
  database: "ok" | "error" | "not_connected";
  runtime: "ok" | "error" | "not_connected";
}
/**
 * Controller kiểm tra trạng thái hoạt động (health check) của server và kết nối database.
 */
@Controller()
class HealthController {
  constructor(
    @Inject("DATABASE_CHECK")
    private readonly checkDatabase: (() => Promise<void>) | null,
  ) {}

  /**
   * Endpoint GET /health: Trả về trạng thái của server và kiểm tra kết nối cơ sở dữ liệu.
   */
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

/**
 * Controller readiness: GET /ready trả 503 khi database hoặc runtime đã cấu hình nhưng chưa sẵn sàng.
 * /health vẫn là liveness, giữ nguyên hình dạng và trạng thái 200.
 */
@Controller()
class ReadinessController {
  constructor(
    @Inject("DATABASE_CHECK")
    private readonly checkDatabase: (() => Promise<void>) | null,
    @Inject("RUNTIME_CHECK")
    private readonly checkRuntime: (() => Promise<void>) | null,
  ) {}

  @Get("ready")
  async ready(
    @Res({ passthrough: true }) response: { status(code: number): unknown },
  ): Promise<ReadyStatus> {
    let database: ReadyStatus["database"] = "not_connected";
    if (this.checkDatabase) {
      try {
        await this.checkDatabase();
        database = "ok";
      } catch {
        database = "error";
      }
    }
    let runtime: ReadyStatus["runtime"] = "not_connected";
    if (this.checkRuntime) {
      try {
        await this.checkRuntime();
        runtime = "ok";
      } catch {
        runtime = "error";
      }
    }
    const ready = database !== "error" && runtime !== "error";
    if (!ready) response.status(503);
    return { status: ready ? "ready" : "not_ready", database, runtime };
  }
}

@Module({ controllers: [HealthController, ReadinessController] })
class AppModule {}

/**
 * Khởi tạo và thiết lập ứng dụng NestJS:
 * Cấu hình CORS, middleware kiểm tra Origin, gắn bộ lọc lỗi bảo mật PrivateBodyFilter,
 * và tích hợp Socket.IO Gateway cho realtime ván cờ và feed sảnh phòng chờ.
 */
export async function createApp(
  corsOrigins = ["http://localhost:5173"],
  imports: DynamicModule[] = [],
  checkDatabase: (() => Promise<void>) | null = null,
  realtime: Omit<RealtimeDependencies, "corsOrigins"> | null = null,
  publicRooms: Omit<PublicRoomFeedDependencies, "corsOrigins"> | null = null,
  runtimeCheck: (() => Promise<void>) | null = null,
) {
  let closeSockets: () => Promise<void> = async () => {};
  const app = await NestFactory.create(
    {
      module: AppModule,
      imports,
      providers: [
        { provide: "DATABASE_CHECK", useValue: checkDatabase },
        { provide: "RUNTIME_CHECK", useValue: runtimeCheck },
        {
          provide: "SOCKET_LIFECYCLE",
          useValue: { onModuleDestroy: () => closeSockets() },
        },
      ],
    },
    { logger: false },
  );
  app.useGlobalFilters(new PrivateBodyFilter(app.getHttpAdapter()));
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
  if (runtimeCheck) {
    app.use(
      async (
        request: IncomingMessage,
        response: ServerResponse,
        next: () => void,
      ) => {
        if (["GET", "HEAD", "OPTIONS"].includes(request.method ?? "")) {
          next();
          return;
        }
        try {
          await runtimeCheck();
        } catch {
          response.writeHead(503, {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          });
          response.end(
            JSON.stringify({
              code: "RUNTIME_UNAVAILABLE",
              message: "Máy chủ chưa sẵn sàng xử lý thao tác",
            }),
          );
          return;
        }
        next();
      },
    );
  }
  app.enableCors({ origin: corsOrigins, credentials: true });
  if (realtime) {
    const gateway = attachRealtime(app.getHttpServer(), {
      ...realtime,
      corsOrigins,
    });
    realtime.onAttached?.(gateway);
    closeSockets = gateway.close;
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
  if (publicRooms) {
    const gatewayClose = closeSockets;
    const feed = attachPublicRoomFeed(app.getHttpServer(), {
      ...publicRooms,
      corsOrigins,
    });
    let closingFeed: Promise<void> | undefined;
    closeSockets = () =>
      (closingFeed ??= (async () => {
        await feed.close();
        await gatewayClose();
      })());
  }
  // Đóng socket trước khi nhả khóa runtime; app.close() gọi lại (idempotent).
  realtimeDrains.set(app, () => closeSockets());
  return app;
}

/** Socket drain hook của app: lưu ngoài instance Nest (Nest proxy không nhận gán thuộc tính). */
const realtimeDrains = new WeakMap<object, () => Promise<void>>();

/** Đóng socket realtime của app trước khi nhả khóa runtime. Idempotent. */
export function drainRealtime(app: object): Promise<void> {
  const drain = realtimeDrains.get(app);
  if (!drain) throw new Error("App has no realtime drain hook");
  return drain();
}
