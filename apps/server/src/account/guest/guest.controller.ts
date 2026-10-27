import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Inject,
  Post,
  Req,
  Res,
} from "@nestjs/common";
import type { IncomingMessage, ServerResponse } from "node:http";
import { guestFailure, guestSessionDto } from "./guest.dto.js";
import type { GuestService } from "./guest.service.js";
import { GuestError } from "./guest.types.js";
import {
  clearGuestCookie,
  readGuestCookie,
  writeGuestCookie,
} from "./guest-cookies.js";

export type GuestHttpService = Pick<
  GuestService,
  "create" | "requireActive" | "logout"
>;

export interface GuestConfiguration {
  service: GuestHttpService;
  secure: boolean;
}

export const GUEST_HTTP_CONFIGURATION = "GUEST_HTTP_CONFIGURATION";

function invalid(): GuestError {
  return new GuestError(
    "GUEST_INPUT_INVALID",
    "Dữ liệu yêu cầu không hợp lệ",
    400,
  );
}

function object(body: unknown): Record<string, unknown> {
  if (body === undefined || body === null) return {};
  if (typeof body !== "object" || Array.isArray(body)) throw invalid();
  return body as Record<string, unknown>;
}

function capability(request: IncomingMessage): string {
  const value = readGuestCookie(request.headers.cookie);
  if (value === undefined)
    throw new GuestError("GUEST_INVALID", "Phiên Khách không hợp lệ");
  return value;
}

/**
 * Route /account/guest: tạo, khôi phục qua cookie HttpOnly và đăng xuất Khách.
 * Mọi phản hồi đều no-store; capability không bao giờ đến từ body hay query.
 */
@Controller("account/guest")
export class GuestController {
  constructor(
    @Inject(GUEST_HTTP_CONFIGURATION)
    private readonly config: GuestConfiguration,
  ) {}

  @Post()
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  create(
    @Body() body: unknown,
    @Res({ passthrough: true }) response: ServerResponse,
  ) {
    return this.respond(response, async () => {
      const input = object(body);
      const created = await this.config.service.create(input.displayName);
      writeGuestCookie(response, created.capability, this.config.secure);
      return guestSessionDto(created, created.capability);
    });
  }

  @Get("session")
  @Header("Cache-Control", "no-store")
  session(
    @Req() request: IncomingMessage,
    @Res({ passthrough: true }) response: ServerResponse,
  ) {
    return this.respond(response, async () => {
      const value = capability(request);
      const actor = await this.config.service.requireActive(value, "read");
      writeGuestCookie(response, value, this.config.secure);
      return guestSessionDto(actor, value);
    });
  }

  @Post("logout")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  logout(
    @Req() request: IncomingMessage,
    @Body() body: unknown,
    @Res({ passthrough: true }) response: ServerResponse,
  ) {
    return this.respond(response, async () => {
      const input = object(body);
      if (typeof input.confirmedResign !== "boolean") throw invalid();
      await this.config.service.logout(
        capability(request),
        input.confirmedResign,
      );
      clearGuestCookie(response, this.config.secure);
      return { ended: true as const };
    });
  }

  /** Chạy handler, xóa cookie khi server đã xác nhận Khách không còn hợp lệ, rồi chuẩn hóa lỗi. */
  private async respond<T>(
    response: ServerResponse,
    work: () => Promise<T>,
  ): Promise<T> {
    try {
      return await work();
    } catch (error) {
      if (
        error instanceof GuestError &&
        (error.code === "GUEST_INVALID" || error.code === "GUEST_EXPIRED")
      ) {
        clearGuestCookie(response, this.config.secure);
      }
      throw guestFailure(error);
    }
  }
}
