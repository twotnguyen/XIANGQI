import {
  Controller,
  Get,
  Header,
  HttpException,
  Inject,
  Module,
  Param,
  Req,
  type DynamicModule,
} from "@nestjs/common";
import type { IncomingMessage } from "node:http";
import { RoomError } from "../room/contracts.js";
import { readMemberRoomProof } from "../room/room.module.js";
import {
  HistoryHttpService,
  historyHttpError,
} from "./history-http.service.js";
import type { HistoryInput } from "./history-store.js";
import { ReplayHttpService, replayHttpError } from "./replay-http.service.js";
function invalid(): never {
  throw new RoomError(
    "HISTORY_INPUT_INVALID",
    "Bộ lọc lịch sử không hợp lệ",
    400,
  );
}
function parse(request: IncomingMessage, summary = false): HistoryInput {
  const query = new URL(request.url ?? "", "http://localhost").searchParams;
  const names = summary ? [] : ["filter", "limit", "cursor"];
  for (const key of query.keys())
    if (!names.includes(key) || query.getAll(key).length !== 1) invalid();
  const input: HistoryInput = {};
  const filter = query.get("filter"),
    limit = query.get("limit"),
    cursor = query.get("cursor");
  if (filter !== null) {
    if (!["ALL", "RANKED", "CASUAL", "AI"].includes(filter)) invalid();
    input.filter = filter as HistoryInput["filter"];
  }
  if (limit !== null) {
    if (!/^[1-9]\d?$/.test(limit) || Number(limit) > 50) invalid();
    input.limit = Number(limit);
  }
  if (cursor !== null) {
    if (cursor.length > 160) invalid();
    let value: unknown;
    try {
      value = JSON.parse(cursor);
    } catch {
      invalid();
    }
    if (!value || typeof value !== "object" || Array.isArray(value)) invalid();
    const fields = value as Record<string, unknown>;
    if (
      Object.keys(fields).length !== 2 ||
      typeof fields.endedAt !== "string" ||
      typeof fields.matchId !== "string"
    )
      invalid();
    input.cursor = { endedAt: fields.endedAt, matchId: fields.matchId };
  }
  return input;
}
@Controller("history")
class HistoryController {
  constructor(
    @Inject("HISTORY_HTTP_SERVICE")
    private readonly service: HistoryHttpService,
  ) {}
  private async respond<T>(work: () => Promise<T>) {
    try {
      return await work();
    } catch (error) {
      const safe = historyHttpError(error);
      throw new HttpException(
        { code: safe.code, message: safe.message },
        safe.status,
      );
    }
  }
  @Get()
  @Header("Cache-Control", "no-store")
  list(@Req() request: IncomingMessage) {
    return this.respond(() =>
      this.service.list(readMemberRoomProof(request), parse(request)),
    );
  }
  @Get("ranked-summary")
  @Header("Cache-Control", "no-store")
  summary(@Req() request: IncomingMessage) {
    return this.respond(() => {
      const proof = readMemberRoomProof(request);
      parse(request, true);
      return this.service.rankedSummary(proof);
    });
  }
}
@Controller("history")
class ReplayController {
  constructor(
    @Inject("REPLAY_HTTP_SERVICE") private readonly service: ReplayHttpService,
  ) {}
  @Get(":id")
  @Header("Cache-Control", "no-store")
  async read(@Req() request: IncomingMessage, @Param("id") id: string) {
    try {
      const proof = readMemberRoomProof(request);
      if (new URL(request.url ?? "", "http://localhost").searchParams.size)
        throw new RoomError(
          "REPLAY_INPUT_INVALID",
          "Định danh ván không hợp lệ",
          400,
        );
      return await this.service.read(proof, id);
    } catch (error) {
      const safe = replayHttpError(error);
      throw new HttpException(
        { code: safe.code, message: safe.message },
        safe.status,
      );
    }
  }
}
@Module({})
export class HistoryModule {
  static forRoot(
    service: HistoryHttpService,
    replay?: ReplayHttpService,
  ): DynamicModule {
    return {
      module: HistoryModule,
      controllers: [HistoryController, ...(replay ? [ReplayController] : [])],
      providers: [
        { provide: "HISTORY_HTTP_SERVICE", useValue: service },
        ...(replay
          ? [{ provide: "REPLAY_HTTP_SERVICE", useValue: replay }]
          : []),
      ],
    };
  }
}
