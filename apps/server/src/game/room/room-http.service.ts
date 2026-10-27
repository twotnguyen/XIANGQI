import type { GuestPurpose } from "../../account/guest/guest.types.js";
import type {
  RoomRequestProof,
  RoomSessionAuthorizer,
} from "./room-session.js";
import {
  RoomError,
  type RoomActor,
  type RoomScope,
  type RoomView,
} from "./room.types.js";
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
/**
 * Dịch vụ điều phối nghiệp vụ phòng chơi cờ thông qua các lệnh HTTP:
 * Quản lý vòng đời phòng, vào/rời phòng, phân bổ ghế, đổi bên và điều chỉnh quyền truy cập.
 */
export class RoomHttpService {
  constructor(
    private readonly store: RoomStore,
    private readonly transactions: RoomTransactions,
    private readonly authorizer: RoomSessionAuthorizer,
    private readonly withScope: <T>(
      scope: RoomScope,
      work: () => Promise<T>,
    ) => Promise<T> = (_scope, work) => work(),
  ) {}
  private async actor(proof: RoomRequestProof) {
    // Member and guest actors are both valid; the session authorizer picks the proof kind.
    return this.authorizer.resolve(proof);
  }
  private async run<T>(
    proof: RoomRequestProof,
    actor: RoomActor,
    roomIds: string[],
    work: (scope: RoomScope) => Promise<T>,
    purpose: GuestPurpose = "existing-room",
  ) {
    const result = await this.transactions.withRoom(
      { actor, roomIds },
      (actorProof) =>
        this.authorizer.authorize(proof, actorProof, purpose, roomIds[0]),
      (scope) =>
        this.withScope(scope, async () => {
          const value = await work(scope);
          await this.authorizer.finish(proof, scope);
          return value;
        }),
    );
    if (result.status === "ended") {
      await this.authorizer.settleEnded(proof);
      throw new RoomError("AUTH_REQUIRED", "Phiên đăng nhập không hợp lệ", 401);
    }
    return result.value;
  }
  /**
   * Tạo phòng chơi mới với cấu hình thời gian thi đấu và giới hạn số lượng khán giả.
   */
  async create(
    proof: RoomRequestProof,
    input: Parameters<RoomStore["create"]>[1],
  ) {
    return this.run<Awaited<ReturnType<RoomStore["create"]>>>(
      proof,
      await this.actor(proof),
      [],
      (scope) => this.store.create(scope, input),
      "new-room",
    );
  }
  /**
   * Tham gia vào phòng chơi theo mã mời 8 chữ số, phân bổ vào ghế đấu hoặc khán giả tùy tình trạng phòng.
   */
  async join(
    proof: RoomRequestProof,
    input: {
      commandId: string;
      code: string;
      preference: "auto" | "play" | "watch";
      expectedVersion?: number;
    },
  ) {
    const actor = await this.actor(proof);
    const roomId = await this.run<string>(
      proof,
      actor,
      [],
      (scope) => this.store.resolveCode(scope.client, input.code),
      "join-room",
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
      "join-room",
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
  /**
   * Đổi ghế đấu (Đỏ <-> Đen) khi chủ phòng đang ngồi một mình chờ đối thủ.
   */
  async switchSeat(
    proof: RoomRequestProof,
    roomId: string,
    expectedVersion: number,
  ) {
    return this.run(proof, await this.actor(proof), [roomId], async (scope) => {
      await this.requireVersion(scope, roomId, expectedVersion);
      return this.store.switchSeat(scope, roomId);
    });
  }
  /**
   * Người chơi tự nguyện rời ghế thi đấu để chuyển xuống làm khán giả.
   */
  async toSpectator(
    proof: RoomRequestProof,
    roomId: string,
    expectedVersion: number,
  ) {
    return this.run(proof, await this.actor(proof), [roomId], async (scope) => {
      await this.requireVersion(scope, roomId, expectedVersion);
      return this.store.toSpectator(scope, roomId);
    });
  }
  /**
   * Chủ phòng chuyển một người chơi khác xuống làm khán giả xem phòng.
   */
  async moveToSpectator(
    proof: RoomRequestProof,
    roomId: string,
    expectedVersion: number,
    targetId: string,
  ) {
    return this.run(proof, await this.actor(proof), [roomId], async (scope) => {
      await this.requireVersion(scope, roomId, expectedVersion);
      return this.store.moveToSpectator(scope, roomId, targetId);
    });
  }
  /**
   * Chủ phòng mời một khán giả đang xem xuống ghế trống để thi đấu.
   */
  async inviteDown(
    proof: RoomRequestProof,
    roomId: string,
    expectedVersion: number,
    targetId: string,
  ) {
    return this.run(proof, await this.actor(proof), [roomId], async (scope) => {
      await this.requireVersion(scope, roomId, expectedVersion);
      return this.store.inviteDown(scope, roomId, targetId);
    });
  }
  /**
   * Khán giả phản hồi chấp nhận hoặc từ chối lời mời xuống ghế thi đấu từ chủ phòng.
   */
  async respondDown(
    proof: RoomRequestProof,
    roomId: string,
    expectedVersion: number,
    accept: boolean,
  ) {
    return this.run(proof, await this.actor(proof), [roomId], async (scope) => {
      await this.requireVersion(scope, roomId, expectedVersion);
      return this.store.respondDown(scope, roomId, accept);
    });
  }
  /**
   * Đuổi một khán giả ra khỏi phòng cờ và đưa vào danh sách chặn của phòng.
   */
  async kickViewer(
    proof: RoomRequestProof,
    roomId: string,
    expectedVersion: number,
    targetId: string,
  ) {
    return this.run(proof, await this.actor(proof), [roomId], async (scope) => {
      await this.requireVersion(scope, roomId, expectedVersion);
      return this.store.kickViewer(scope, roomId, targetId);
    });
  }
  /**
   * Rời khỏi phòng cờ, xử thua nếu đang trong ván hoặc đóng phòng nếu là người cuối cùng rời đi.
   */
  async leave(
    proof: RoomRequestProof,
    roomId: string,
    expectedVersion: number,
  ) {
    return this.run(proof, await this.actor(proof), [roomId], async (scope) => {
      await this.requireVersion(scope, roomId, expectedVersion);
      await this.store.leave(scope, roomId);
      return { roomId, left: true as const };
    });
  }
  /**
   * Gửi đề nghị đổi bên (Đỏ <-> Đen) cho đối thủ cùng phòng.
   */
  async proposeSwap(
    proof: RoomRequestProof,
    roomId: string,
    expectedVersion: number,
  ) {
    return this.run(proof, await this.actor(proof), [roomId], async (scope) => {
      await this.requireVersion(scope, roomId, expectedVersion);
      return this.store.proposeSwap(scope, roomId);
    });
  }
  /**
   * Rút lại đề nghị đổi bên khi đối thủ chưa phản hồi.
   */
  async withdrawSwap(
    proof: RoomRequestProof,
    roomId: string,
    expectedVersion: number,
  ) {
    return this.run(proof, await this.actor(proof), [roomId], async (scope) => {
      await this.requireVersion(scope, roomId, expectedVersion);
      return this.store.withdrawSwap(scope, roomId);
    });
  }
  /**
   * Phản hồi đồng ý hoặc từ chối đề nghị đổi bên từ đối thủ.
   */
  async respondSwap(
    proof: RoomRequestProof,
    roomId: string,
    expectedVersion: number,
    accept: boolean,
  ) {
    return this.run(proof, await this.actor(proof), [roomId], async (scope) => {
      await this.requireVersion(scope, roomId, expectedVersion);
      return this.store.respondSwap(scope, roomId, accept);
    });
  }
  /**
   * Thay đổi chế độ hiển thị phòng cờ (PUBLIC, CODE_ONLY, LOCKED).
   */
  async changeVisibility(
    proof: RoomRequestProof,
    roomId: string,
    expectedVersion: number,
    visibility: RoomView["room"]["visibility"],
  ) {
    return this.run(proof, await this.actor(proof), [roomId], (scope) =>
      this.store.changeVisibility(scope, roomId, expectedVersion, visibility),
    );
  }
  /**
   * Lấy ảnh chụp trạng thái đầy đủ (snapshot) của phòng cờ.
   */
  async snapshot(proof: RoomRequestProof, roomId: string) {
    return this.run<Awaited<ReturnType<RoomStore["snapshot"]>>>(
      proof,
      await this.actor(proof),
      [roomId],
      (scope) => this.store.snapshot(scope, roomId),
    );
  }
}
