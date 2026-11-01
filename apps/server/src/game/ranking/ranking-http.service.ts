import { RoomError, type RoomScope } from "../room/room.types.js";
import type { MemberRoomAuthorizer, MemberRoomRequestProof } from "../room/room-http.service.js";
import type { RoomTransactions } from "../room/room-transactions.js";
import { readLeaderboard, readRatings } from "./ranked.store.js";

export class RankingHttpService {
  constructor(private readonly transactions: Pick<RoomTransactions, "withRoom">, private readonly authorizer: MemberRoomAuthorizer, private readonly minimumGames = 5) {
    if (!Number.isSafeInteger(minimumGames) || minimumGames < 1 || minimumGames > 5 || (minimumGames < 5 && process.env.NODE_ENV === "production")) throw new Error("Invalid leaderboard minimum");
  }
  private async run<T>(proof: MemberRoomRequestProof, work: (scope: RoomScope) => Promise<T>): Promise<T> {
    if (!proof || typeof proof.accessToken !== "string" || !proof.accessToken || /\s/.test(proof.accessToken) || typeof proof.appSession !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(proof.appSession)) throw new RoomError("AUTH_REQUIRED", "Phiên đăng nhập không hợp lệ", 401);
    const privateProof = Object.freeze({accessToken:proof.accessToken,appSession:proof.appSession});
    const actor = await this.authorizer.resolve(privateProof);
    if (actor.kind !== "member") throw new RoomError("RANKING_FORBIDDEN", "Bảng xếp hạng chỉ dành cho thành viên", 403);
    const result = await this.transactions.withRoom({actor,roomIds:[]}, p => this.authorizer.authorize(privateProof,p), work);
    if (result.status === "ended") throw new RoomError("AUTH_REQUIRED", "Phiên đăng nhập không hợp lệ", 401);
    return result.value;
  }
  list(proof: MemberRoomRequestProof) { return this.run(proof, s => readLeaderboard(s.client,s.actor.userId,this.minimumGames)); }
  me(proof: MemberRoomRequestProof) { return this.run(proof, async s => {
    const rating = (await readRatings(s.client,[s.actor.userId],this.minimumGames)).get(s.actor.userId);
    if (!rating) throw new RoomError("RANKING_FORBIDDEN", "Bảng xếp hạng chỉ dành cho thành viên", 403);
    return rating;
  }); }
}
