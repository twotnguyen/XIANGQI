import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  HttpException,
  Inject,
  Module,
  Post,
  Req,
  Res,
  type DynamicModule,
} from "@nestjs/common";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { Session } from "../auth/contracts.js";
import { RegistrationError } from "../auth/contracts.js";
import { GoogleError } from "./contracts.js";
import type { GoogleService } from "./google.service.js";
import {
  readGoogleCookie,
  writeGoogleCookie,
  clearGoogleCookies,
  writeGoogleMemberCookies,
} from "./http-cookies.js";
export type GoogleHttpService = Pick<
  GoogleService,
  "beginChallenge" | "authenticate" | "onboarding" | "complete"
>;
export type GoogleRefreshProvider = (refreshToken: string) => Promise<Session>;
interface Configuration {
  service: GoogleHttpService;
  refreshProvider: GoogleRefreshProvider;
  secure: boolean;
  now: () => Date;
}
function invalid() {
  return new GoogleError(
    "GOOGLE_INVALID",
    "Phiên xác thực Google không hợp lệ",
    401,
  );
}
function cookie(
  request: IncomingMessage,
  name: Parameters<typeof readGoogleCookie>[1],
) {
  const value = readGoogleCookie(request.headers.cookie, name);
  if (!value) throw invalid();
  return value;
}
function object(body: unknown): Record<string, unknown> {
  if (!body || typeof body !== "object" || Array.isArray(body))
    throw new GoogleError(
      "INPUT_INVALID",
      "Thông tin xác thực Google không hợp lệ",
    );
  return body as Record<string, unknown>;
}
function publicMember(
  result: Awaited<ReturnType<GoogleHttpService["complete"]>>,
) {
  return {
    kind: "member" as const,
    access_token: result.access_token,
    refresh_token: result.refresh_token,
    expires_in: result.expires_in,
    appSession: result.appSession,
    expiresAt: result.expiresAt,
    userId: result.userId,
    username: result.username,
    remember: result.remember,
  };
}
@Controller("auth/google")
class GoogleController {
  constructor(
    @Inject("GOOGLE_HTTP_CONFIGURATION") private readonly config: Configuration,
  ) {}
  private async respond<T>(work: () => Promise<T>): Promise<T> {
    try {
      return await work();
    } catch (error) {
      if (error instanceof GoogleError || error instanceof RegistrationError)
        throw new HttpException(
          { code: error.code, message: error.message },
          error.status,
        );
      throw new HttpException(
        {
          code: "GOOGLE_UNAVAILABLE",
          message: "Chưa thể xác thực Google, vui lòng thử lại",
        },
        503,
      );
    }
  }
  @Post("challenge")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  challenge(@Res({ passthrough: true }) response: ServerResponse) {
    return this.respond(async () => {
      const result = await this.config.service.beginChallenge();
      writeGoogleCookie(
        response,
        "xiangqi_google_challenge",
        result.capability,
        result.expiresAt,
        this.config.secure,
        this.config.now(),
      );
      return {
        nonce: result.nonce,
        clientId: result.clientId,
        expiresAt: result.expiresAt,
      };
    });
  }
  @Post("authenticate")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  authenticate(
    @Req() request: IncomingMessage,
    @Body() body: unknown,
    @Res({ passthrough: true }) response: ServerResponse,
  ) {
    return this.respond(async () => {
      const input = object(body),
        capability = cookie(request, "xiangqi_google_challenge");
      const result = await this.config.service.authenticate(
        input.credential,
        capability,
        input.remember === undefined ? true : (input.remember as boolean),
      );
      if (result.kind === "pending") {
        writeGoogleCookie(
          response,
          "xiangqi_google_onboarding",
          result.capability,
          result.expiresAt,
          this.config.secure,
          this.config.now(),
        );
        writeGoogleCookie(
          response,
          "xiangqi_google_refresh",
          result.session.refresh_token,
          result.expiresAt,
          this.config.secure,
          this.config.now(),
        );
        clearGoogleCookies(response, this.config.secure, [
          "xiangqi_google_challenge",
        ]);
        return { kind: "pending" as const, expiresAt: result.expiresAt };
      }
      writeGoogleMemberCookies(
        response,
        result,
        this.config.secure,
        this.config.now(),
      );
      return publicMember(result);
    });
  }
  @Get("onboarding")
  @Header("Cache-Control", "no-store")
  onboarding(@Req() request: IncomingMessage) {
    return this.respond(async () => {
      const result = await this.config.service.onboarding(
        cookie(request, "xiangqi_google_onboarding"),
      );
      return {
        kind: "pending" as const,
        expiresAt: result.expiresAt,
        recovering: result.recovering,
        email: result.email,
        avatar: { kind: "initials" as const, text: result.avatar.text },
      };
    });
  }
  @Post("complete")
  @HttpCode(200)
  @Header("Cache-Control", "no-store")
  complete(
    @Req() request: IncomingMessage,
    @Body() body: unknown,
    @Res({ passthrough: true }) response: ServerResponse,
  ) {
    return this.respond(async () => {
      const input = object(body),
        capability = cookie(request, "xiangqi_google_onboarding"),
        refresh = cookie(request, "xiangqi_google_refresh");
      const pending = await this.config.service.onboarding(capability);
      let proof: Session;
      try {
        proof = await this.config.refreshProvider(refresh);
      } catch (error) {
        if ((error as { status?: number })?.status === 401) throw invalid();
        throw error;
      }
      // Refresh token rotation is already committed upstream. Preserve it even if finalization fails.
      writeGoogleCookie(
        response,
        "xiangqi_google_refresh",
        proof.refresh_token,
        pending.expiresAt,
        this.config.secure,
        this.config.now(),
      );
      const member = await this.config.service.complete(capability, proof, {
        username: input.username,
        password: input.password,
      });
      writeGoogleMemberCookies(
        response,
        member,
        this.config.secure,
        this.config.now(),
      );
      return publicMember(member);
    });
  }
}
@Module({})
export class GoogleModule {
  static forRoot(
    service: GoogleHttpService,
    refreshProvider: GoogleRefreshProvider,
    secure = true,
    now = () => new Date(),
  ): DynamicModule {
    return {
      module: GoogleModule,
      controllers: [GoogleController],
      providers: [
        {
          provide: "GOOGLE_HTTP_CONFIGURATION",
          useValue: {
            service,
            refreshProvider,
            secure,
            now,
          } satisfies Configuration,
        },
      ],
    };
  }
}
