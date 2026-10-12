import {
  BadRequestException,
  Catch,
  type ArgumentsHost,
  type HttpServer,
} from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import type { IncomingMessage, ServerResponse } from "node:http";

/** Body-parser failures precede controllers and can otherwise echo credential input. */
@Catch()
export class PrivateBodyFilter extends BaseExceptionFilter {
  constructor(private readonly adapter: HttpServer) {
    super(adapter);
  }
  override catch(error: unknown, host: ArgumentsHost) {
    const context = host.switchToHttp(),
      request = context.getRequest<IncomingMessage>(),
      response = context.getResponse<ServerResponse>(),
      path = /^\/(ai|history)(?:\/|\?|$)/.exec(request.url ?? "");
    if (path) {
      response.setHeader("Cache-Control", "no-store");
      if (error instanceof BadRequestException) {
        this.adapter.reply(
          response,
          {
            code:
              path[1] === "ai" ? "AI_INPUT_INVALID" : "HISTORY_INPUT_INVALID",
            message: "Dữ liệu yêu cầu không hợp lệ",
          },
          400,
        );
        return;
      }
    }
    super.catch(error, host);
  }
}
