import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpException,
  Inject,
  Module,
  Param,
  Post,
  Req,
  UseInterceptors,
  type CallHandler,
  type DynamicModule,
  type ExecutionContext,
  type NestInterceptor,
} from "@nestjs/common";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { EngineLevel } from "@xiangqi/engine";
import type { Move, Side } from "@xiangqi/xiangqi-core";
import { LoginError } from "../login/contracts.js";
import { RoomError } from "../room/contracts.js";
import { readMemberRoomProof } from "../room/room.module.js";
import type { MemberRoomRequestProof } from "../room/room-http.service.js";
import { AiError, type AiSnapshot } from "./ai-games.js";
import type { AiOrigin } from "./ai-transactions.js";

type Human = Extract<AiOrigin, { kind: "human" }>;
export interface AiHttpResult {
  snapshot: AiSnapshot;
  serverNow: string;
  control: {
    mode: "controller" | "readonly";
    reason: "other_tab" | null;
    generation: number;
  };
}
/** Required authenticated service; this module never constructs an owner from HTTP input. */
export interface AiHttpApi {
  current(proof: MemberRoomRequestProof): Promise<{ gameId: string | null }>;
  read(origin: Human, gameId: string): Promise<AiHttpResult>;
  create(
    origin: Human,
    input: { level: EngineLevel; requestedSide: Side | "random" },
  ): Promise<AiHttpResult>;
  move(
    origin: Human,
    gameId: string,
    input: { version: number; move: Move },
  ): Promise<AiHttpResult>;
  resign(origin: Human, gameId: string, version: number): Promise<AiHttpResult>;
  retry(origin: Human, gameId: string, version: number): Promise<AiHttpResult>;
}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const safeCodes = new Set([
  "AUTH_REQUIRED",
  "SESSION_INVALID",
  "SESSION_EXPIRED",
  "TAB_READ_ONLY",
  "ACTIVE_GAME_EXISTS",
  "AI_INPUT_INVALID",
  "AI_FORBIDDEN",
  "AI_NOT_FOUND",
  "AI_ALREADY_PLAYING",
  "AI_VERSION_STALE",
  "AI_ILLEGAL_MOVE",
  "AI_NOT_YOUR_TURN",
  "AI_FINISHED",
  "AI_ENGINE_BUSY",
  "AI_UNAVAILABLE",
  "AI_BOOT_EXPIRED",
  "AI_GAME_EXPIRED",
  "AI_RESERVATION_LOST",
  "AI_PRESENCE_UNAVAILABLE",
  "AI_AUTHORITY_REQUIRED",
  "AI_ADMISSION_REQUIRED",
  "AI_SCOPE_INVALID",
  "AI_GENERATION_EXHAUSTED",
]);
function invalid(): never {
  throw new RoomError(
    "AI_INPUT_INVALID",
    "Thông tin ván với máy không hợp lệ",
    400,
  );
}
function id(value: unknown): string {
  if (typeof value !== "string" || !uuid.test(value)) invalid();
  return value.toLowerCase();
}
function object(value: unknown, keys: string[]): Record<string, unknown> {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    Object.keys(value).length !== keys.length ||
    Object.keys(value).some((key) => !keys.includes(key))
  )
    invalid();
  return value as Record<string, unknown>;
}
function version(value: unknown): number {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || value < 1)
    invalid();
  return value;
}
function human(request: IncomingMessage): Human {
  const proof = readMemberRoomProof(request);
  const tabId = id(request.headers["x-ai-tab"]),
    connectionId = request.headers["x-ai-connection"],
    generation = request.headers["x-ai-generation"];
  if (
    typeof connectionId !== "string" ||
    !/^[A-Za-z0-9_-]{1,64}$/.test(connectionId) ||
    typeof generation !== "string" ||
    !/^[1-9]\d{0,15}$/.test(generation) ||
    !Number.isSafeInteger(Number(generation))
  )
    invalid();
  return {
    kind: "human",
    proof,
    tab: { tabId, connectionId, generation: Number(generation) },
  };
}
function publish(result: AiHttpResult) {
  const s = result.snapshot;
  return {
    snapshot: {
      id: s.id,
      requestedSide: s.requestedSide,
      actualSide: s.actualSide,
      level: s.level,
      position: s.position,
      history: [...s.history],
      version: s.version,
      status: s.status,
      engineState: s.engineState,
      engineError: s.engineError,
      outcome:
        s.outcome === null
          ? null
          : { reason: s.outcome.reason, winner: s.outcome.winner },
    },
    serverNow: result.serverNow,
    control: {
      mode: result.control.mode,
      reason: result.control.reason,
      generation: result.control.generation,
    },
  };
}
class NoStore implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    context
      .switchToHttp()
      .getResponse<ServerResponse>()
      .setHeader("Cache-Control", "no-store");
    return next.handle();
  }
}
@Controller("ai")
@UseInterceptors(NoStore)
class AiController {
  constructor(@Inject("AI_HTTP_SERVICE") private readonly service: AiHttpApi) {}
  private async respond<T>(request: IncomingMessage, work: () => Promise<T>) {
    try {
      if ((request.url ?? "").includes("?")) invalid();
      return await work();
    } catch (error) {
      let code = "AI_UNAVAILABLE",
        status = 503;
      if (error instanceof RoomError || error instanceof LoginError) {
        code = error.code;
        status = error.status;
      } else if (error instanceof AiError) {
        code = error.code;
        status =
          code === "AI_INPUT_INVALID"
            ? 400
            : code === "AI_FORBIDDEN"
              ? 403
              : code === "AI_NOT_FOUND"
                ? 404
                : 409;
        if (code === "AI_VERSION_CONFLICT") code = "AI_VERSION_STALE";
        if (code === "AI_BUSY") code = "AI_ENGINE_BUSY";
        if (["AI_NOT_READY", "AI_CLOSED", "AI_UNAVAILABLE"].includes(code)) {
          code = "AI_UNAVAILABLE";
          status = 503;
        }
      }
      if (!safeCodes.has(code)) {
        code = "AI_UNAVAILABLE";
        status = 503;
      }
      throw new HttpException(
        {
          code,
          message:
            status === 401
              ? "Phiên đăng nhập không hợp lệ"
              : "Chưa thể thực hiện thao tác với máy. Vui lòng thử lại.",
        },
        status,
      );
    }
  }
  @Get("current")
  current(@Req() request: IncomingMessage) {
    return this.respond(request, async () => {
      const result = await this.service.current(readMemberRoomProof(request));
      return { gameId: result.gameId };
    });
  }
  @Get(":gameId")
  read(@Req() request: IncomingMessage, @Param("gameId") gameId: string) {
    return this.respond(request, async () =>
      publish(await this.service.read(human(request), id(gameId))),
    );
  }
  @Post()
  @HttpCode(200)
  create(@Req() request: IncomingMessage, @Body() body: unknown) {
    return this.respond(request, async () => {
      const origin = human(request),
        input = object(body, ["level", "requestedSide"]);
      if (
        !["easy", "medium", "hard"].includes(input.level as string) ||
        !["red", "black", "random"].includes(input.requestedSide as string)
      )
        invalid();
      return publish(
        await this.service.create(origin, {
          level: input.level as EngineLevel,
          requestedSide: input.requestedSide as Side | "random",
        }),
      );
    });
  }
  @Post(":gameId/move")
  @HttpCode(200)
  move(
    @Req() request: IncomingMessage,
    @Param("gameId") gameId: string,
    @Body() body: unknown,
  ) {
    return this.respond(request, async () => {
      const origin = human(request),
        input = object(body, ["version", "move"]),
        move = object(input.move, ["from", "to"]);
      if (
        ![move.from, move.to].every(
          (square) =>
            typeof square === "number" &&
            Number.isInteger(square) &&
            square >= 0 &&
            square < 90,
        ) ||
        move.from === move.to
      )
        invalid();
      return publish(
        await this.service.move(origin, id(gameId), {
          version: version(input.version),
          move: { from: move.from as number, to: move.to as number },
        }),
      );
    });
  }
  @Post(":gameId/resign")
  @HttpCode(200)
  resign(
    @Req() request: IncomingMessage,
    @Param("gameId") gameId: string,
    @Body() body: unknown,
  ) {
    return this.respond(request, async () =>
      publish(
        await this.service.resign(
          human(request),
          id(gameId),
          version(object(body, ["version"]).version),
        ),
      ),
    );
  }
  @Post(":gameId/retry")
  @HttpCode(200)
  retry(
    @Req() request: IncomingMessage,
    @Param("gameId") gameId: string,
    @Body() body: unknown,
  ) {
    return this.respond(request, async () =>
      publish(
        await this.service.retry(
          human(request),
          id(gameId),
          version(object(body, ["version"]).version),
        ),
      ),
    );
  }
}
@Module({})
export class AiModule {
  static forRoot(service: AiHttpApi): DynamicModule {
    return {
      module: AiModule,
      controllers: [AiController],
      providers: [{ provide: "AI_HTTP_SERVICE", useValue: service }],
    };
  }
}
