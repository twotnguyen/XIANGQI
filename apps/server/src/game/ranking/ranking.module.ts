import { Controller, Get, Header, HttpException, Inject, Module, Req, type DynamicModule } from "@nestjs/common";
import type { IncomingMessage } from "node:http";
import { readMemberRoomProof } from "../room/room.controller.js";
import { RoomError } from "../room/room.types.js";
import { RankingHttpService } from "./ranking-http.service.js";

@Controller("rankings")
export class RankingController {
  constructor(@Inject("RANKING_HTTP_SERVICE") private readonly service: RankingHttpService) {}
  private async respond(work: () => Promise<unknown>) {
    try { return await work(); } catch (error) {
      const known = error instanceof RoomError && ["AUTH_REQUIRED", "AUTH_UNAVAILABLE", "RANKING_FORBIDDEN"].includes(error.code);
      const status = known ? error.status : 503;
      throw new HttpException({code:known ? error.code : "RANKING_UNAVAILABLE",message:known ? error.message : "Chưa thể đọc bảng xếp hạng"},status);
    }
  }
  @Get() @Header("Cache-Control", "no-store")
  list(@Req() request: IncomingMessage) { return this.respond(() => this.service.list(readMemberRoomProof(request))); }
  @Get("me") @Header("Cache-Control", "no-store")
  me(@Req() request: IncomingMessage) { return this.respond(() => this.service.me(readMemberRoomProof(request))); }
}
@Module({})
export class RankingModule {
  static forRoot(service: RankingHttpService): DynamicModule {
    return {module:RankingModule,controllers:[RankingController],providers:[{provide:"RANKING_HTTP_SERVICE",useValue:service}]};
  }
}
