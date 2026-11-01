import { createHash } from "node:crypto";
import { parsePublicFeedProof } from "../room/public/public-room-feed.js";
import type { RoomSessionAuthorizer } from "../room/room-session.js";
import type { QueueIdentity } from "./matchmaking-queue.js";

export class MatchmakingService {
  constructor(private readonly authorizer: RoomSessionAuthorizer) {}
  async identity(input: unknown): Promise<QueueIdentity> {
    const parsed = parsePublicFeedProof(input);
    const proof = parsed.kind === "member" ? {accessToken:parsed.accessToken,appSession:parsed.appSession} : {guestCapability:parsed.guestCapability};
    const actor = await this.authorizer.resolve(proof);
    const capability = parsed.kind === "member" ? parsed.appSession : parsed.guestCapability;
    return {actor,proof,sessionKey:createHash("sha256").update(capability).digest("hex")};
  }
}
