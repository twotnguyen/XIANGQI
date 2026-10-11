import { record, uuid } from "../match/position-codec.js";
import {
  RoomError,
  type RoomActor,
  type RoomEntry,
  type RoomScope,
} from "./contracts.js";
import type {
  MemberRoomAuthorizer,
  MemberRoomRequestProof,
} from "./room-http.service.js";
import type { PublicRoomStore } from "./public-room-store.js";
import type { RoomTransactions } from "./room-transactions.js";
export type PublicRoomJoinInput = {
  commandId: string;
  preference: "play" | "watch";
};
export type PublicRoomEntry = Omit<RoomEntry, "inviteCode">;
/** Member-only public discovery; the runtime owns HTTP/feed and guest integration. */
export class PublicRoomService {
  constructor(
    private readonly store: Pick<PublicRoomStore, "list" | "join">,
    private readonly transactions: Pick<RoomTransactions, "withRoom">,
    private readonly authorizer: MemberRoomAuthorizer,
    private readonly withScope: <T>(
      scope: RoomScope,
      work: () => Promise<T>,
    ) => Promise<T>,
  ) {}
  private async resolved(proof: MemberRoomRequestProof) {
    if (
      !proof ||
      typeof proof.accessToken !== "string" ||
      typeof proof.appSession !== "string"
    )
      throw new RoomError("AUTH_REQUIRED", "Phiên đăng nhập không hợp lệ", 401);
    // WeakMap-bound authorizers must see this same private, unchanged object on every read.
    const privateProof = Object.freeze({
      accessToken: proof.accessToken,
      appSession: proof.appSession,
    });
    const actor = await this.authorizer.resolve(privateProof);
    if (actor.kind !== "member")
      throw new RoomError(
        "ROOM_MEMBER_REQUIRED",
        "Phiên thành viên là bắt buộc",
        403,
      );
    return { proof: privateProof, actor };
  }
  private async run<T>(
    proof: MemberRoomRequestProof,
    actor: RoomActor,
    roomIds: string[],
    work: (scope: RoomScope) => Promise<T>,
  ) {
    const result = await this.transactions.withRoom(
      { actor, roomIds },
      (actorProof) => this.authorizer.authorize(proof, actorProof),
      (scope) => this.withScope(scope, () => work(scope)),
    );
    if (result.status === "ended")
      throw new RoomError("AUTH_REQUIRED", "Phiên đăng nhập không hợp lệ", 401);
    return result.value;
  }
  async open(proof: MemberRoomRequestProof) {
    const trusted = await this.resolved(proof);
    return {
      read: () =>
        this.run(trusted.proof, trusted.actor, [], (scope) =>
          this.store.list(scope),
        ),
    };
  }
  async list(proof: MemberRoomRequestProof) {
    return (await this.open(proof)).read();
  }
  async join(
    proof: MemberRoomRequestProof,
    roomId: string,
    input: PublicRoomJoinInput,
  ): Promise<PublicRoomEntry> {
    if (
      typeof roomId !== "string" ||
      !uuid.test(roomId) ||
      !record(input) ||
      Object.keys(input).length !== 2 ||
      typeof input.commandId !== "string" ||
      !uuid.test(input.commandId) ||
      !["play", "watch"].includes(input.preference)
    )
      throw new RoomError(
        "ROOM_INPUT_INVALID",
        "Thông tin phòng không hợp lệ",
        400,
      );
    const id = roomId.toLowerCase(),
      command = {
        commandId: input.commandId.toLowerCase(),
        preference: input.preference,
      };
    const trusted = await this.resolved(proof);
    return this.run(trusted.proof, trusted.actor, [id], async (scope) => {
      const entry = await this.store.join(scope, id, command);
      return {
        roomId: entry.roomId,
        version: entry.version,
        role: entry.role,
        ...(entry.notice === undefined ? {} : { notice: entry.notice }),
      };
    });
  }
}
