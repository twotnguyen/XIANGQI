import {
  BadRequestException,
  Catch,
  type ArgumentsHost,
  type HttpServer,
} from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import type { IncomingMessage, ServerResponse } from "node:http";

/**
 * Bộ lọc ngoại lệ toàn cục xử lý lỗi parse request body trước khi tới controller.
 * Ngăn chặn việc phản hồi lộ thông tin nhạy cảm (như mật khẩu/token) đối với các endpoint bảo mật (/ai, /history).
 */
@Catch()
export class PrivateBodyFilter extends BaseExceptionFilter {
  constructor(private readonly adapter: HttpServer) {
    super(adapter);
  }
  /**
   * Bắt và xử lý ngoại lệ HTTP, chuẩn hóa lỗi 400 Bad Request cho các route riêng biệt.
   */
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
