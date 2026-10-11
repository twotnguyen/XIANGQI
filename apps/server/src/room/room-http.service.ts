import { RoomError, type RoomActor, type RoomScope } from "./contracts.js";
import type { RoomStore } from "./room-store.js";
import type {
  RoomActorProof,
  RoomAuthorization,
  RoomTransactions,
} from "./room-transactions.js";
export interface MemberRoomRequestProof {
  accessToken: string;
  appSession: string;
}
export interface MemberRoomAuthorizer {
  resolve(proof: MemberRoomRequestProof): Promise<RoomActor>;
  authorize(
    proof: MemberRoomRequestProof,
    actorProof: RoomActorProof,
  ): Promise<RoomAuthorization>;
}
export class RoomHttpService {
  constructor(
    private readonly store: RoomStore,
    private readonly transactions: RoomTransactions,
    private readonly authorizer: MemberRoomAuthorizer,
  ) {}
  private async actor(proof: MemberRoomRequestProof) {
    const actor = await this.authorizer.resolve(proof);
    if (actor.kind !== "member")
      throw new RoomError(
        "ROOM_MEMBER_REQUIRED",
        "Phiên thành viên là bắt buộc",
        403,
      );
    return actor;
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
      work,
    );
    if (result.status === "ended")
      throw new RoomError("AUTH_REQUIRED", "Phiên đăng nhập không hợp lệ", 401);
    return result.value;
  }
  async create(
    proof: MemberRoomRequestProof,
    input: Parameters<RoomStore["create"]>[1],
  ) {
    return this.run<Awaited<ReturnType<RoomStore["create"]>>>(
      proof,
      await this.actor(proof),
      [],
      (scope) => this.store.create(scope, input),
    );
  }
  async join(
    proof: MemberRoomRequestProof,
    input: {
      commandId: string;
      code: string;
      preference: "auto" | "play" | "watch";
      expectedVersion?: number;
    },
  ) {
    const actor = await this.actor(proof);
    const roomId = await this.run<string>(proof, actor, [], (scope) =>
      this.store.resolveCode(scope.client, input.code),
    );
    return this.run<Awaited<ReturnType<RoomStore["join"]>>>(
      proof,
      actor,
      [roomId],
      async (scope) => {
        if ((await this.store.resolveCode(scope.client, input.code)) !== roomId)
          throw new RoomError("ROOM_CODE_CHANGED", "Mã phòng đã thay đổi", 409);
        const entry = await this.store.join(scope, {
          commandId: input.commandId,
          roomId,
          intent: input.preference,
          ...(input.expectedVersion === undefined
            ? {}
            : { expectedVersion: input.expectedVersion }),
        });
        return entry;
      },
    );
  }
  private async requireVersion(
    scope: RoomScope,
    roomId: string,
    expectedVersion: number,
  ) {
    const current = await this.store.snapshot(scope, roomId);
    if (current.version !== expectedVersion)
      throw new RoomError(
        "VERSION_STALE",
        "Phòng đã thay đổi, vui lòng thử lại",
        409,
      );
  }
  async switchSeat(
    proof: MemberRoomRequestProof,
    roomId: string,
    expectedVersion: number,
  ) {
    return this.run(proof, await this.actor(proof), [roomId], async (scope) => {
      await this.requireVersion(scope, roomId, expectedVersion);
      return this.store.switchSeat(scope, roomId);
    });
  }
  async leave(
    proof: MemberRoomRequestProof,
    roomId: string,
    expectedVersion: number,
  ) {
    return this.run(proof, await this.actor(proof), [roomId], async (scope) => {
      await this.requireVersion(scope, roomId, expectedVersion);
      await this.store.leave(scope, roomId);
      return { roomId, left: true as const };
    });
  }
  async snapshot(proof: MemberRoomRequestProof, roomId: string) {
    return this.run<Awaited<ReturnType<RoomStore["snapshot"]>>>(
      proof,
      await this.actor(proof),
      [roomId],
      (scope) => this.store.snapshot(scope, roomId),
    );
  }
}
