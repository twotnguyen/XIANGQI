import type { PoolClient } from "pg";
import {
  RoomError,
  type RoomActor,
  type RoomScope,
} from "../room/room.types.js";
import type {
  RoomRequestProof,
  RoomSessionAuthorizer,
} from "../room/room-session.js";
import type { RoomTransactions } from "../room/room-transactions.js";
import {
  RealtimeError,
  type RealtimeConnection,
  type RealtimeIdentity,
  type IdentityResolver,
  type RealtimeTransactions,
} from "./realtime.types.js";

function required(): never {
  throw new RealtimeError("AUTH_REQUIRED", "Phiên đăng nhập không hợp lệ");
}
function unavailable(): never {
  throw new RealtimeError(
    "REALTIME_UNAVAILABLE",
    "Chưa thể xác thực phiên đăng nhập",
  );
}
function authError(error: unknown): never {
  if (error instanceof RoomError && error.code === "AUTH_REQUIRED") required();
  unavailable();
}
async function liveness(check: () => Promise<boolean>): Promise<boolean> {
  try {
    return await check();
  } catch {
    unavailable();
  }
}

/**
 * Xác thực danh tính realtime (thành viên HOẶC khách) từ proof đã phân giải qua bộ xác thực phòng tổng hợp.
 */
export class RoomRealtimeIdentities implements IdentityResolver {
  constructor(
    private readonly authorizer: RoomSessionAuthorizer,
    private readonly checkMemberSession?: (
      userId: string,
      appSession: string,
    ) => Promise<boolean>,
    private readonly checkGuestSession?: (
      guestCapability: string,
    ) => Promise<boolean>,
  ) {}

  /**
   * Kiểm tra liveness của credential kết nối: phiên thành viên (app_session) hoặc phiên khách.
   * Kết nối có kind không khớp với proof bị coi là không hoạt động.
   */
  async sessionActive(connection: RealtimeConnection): Promise<boolean> {
    const { proof, identity } = connection;
    if ("guestCapability" in proof) {
      if (identity.kind !== "guest") return false;
      const check = this.checkGuestSession;
      if (!check) unavailable();
      return liveness(() => check(proof.guestCapability));
    }
    if (identity.kind !== "member") return false;
    if (!/^[A-Za-z0-9_-]{43}$/.test(proof.appSession)) return false;
    const check = this.checkMemberSession;
    if (!check) unavailable();
    return liveness(() => check(identity.userId, proof.appSession));
  }

  /**
   * Phân giải proof tiêu chuẩn thành danh tính; không bao giờ tạo proof giả.
   */
  async resolve(proof: RoomRequestProof): Promise<RealtimeIdentity> {
    try {
      const actor = await this.authorizer.resolve(proof);
      return { userId: actor.userId, kind: actor.kind };
    } catch (error) {
      authError(error);
    }
  }
}

/**
 * Điều phối giao dịch realtime cho thành viên và khách: mỗi lệnh phân giải lại proof,
 * tái xác thực trong transaction đã khóa theo phòng hiện tại, và hoàn tất (finish) sau khi làm việc.
 */
export class RoomRealtimeTransactions implements RealtimeTransactions {
  private readonly scopes = new WeakMap<PoolClient, RoomScope>();

  constructor(
    private readonly coordinator: RoomTransactions,
    private readonly authorizer: RoomSessionAuthorizer,
  ) {}

  /**
   * Lấy phạm vi thực thi `RoomScope` hiện tại được gắn với client kết nối trong giao dịch.
   */
  getScope(
    client: PoolClient,
    identity: RealtimeIdentity,
    roomId: string,
  ): RoomScope {
    const scope = this.scopes.get(client);
    if (
      !scope ||
      scope.client !== client ||
      scope.actor.kind !== identity.kind ||
      scope.actor.userId !== identity.userId ||
      !scope.lockedActorIds.has(identity.userId) ||
      !scope.lockedRoomIds.has(roomId)
    )
      required();
    return scope;
  }

  /**
   * Thực thi khối công việc trong giao dịch có kiểm tra quyền và khóa phòng/người dùng.
   */
  async run<T>(
    connection: RealtimeConnection,
    work: (client: PoolClient) => Promise<T>,
  ): Promise<T> {
    const { proof, roomId, identity } = connection;
    // The gateway re-resolves a fresh copy of the proof for every command (JWT + session), and
    // authorize() binds it to that exact object, its fingerprints and the actor, so a copied,
    // mutated or re-identified proof is rejected under the room locks.
    const actor: RoomActor = { userId: identity.userId, kind: identity.kind };
    const result = await this.coordinator.withRoom(
      { actor, roomIds: [roomId] },
      async (actorProof) => {
        try {
          return await this.authorizer.authorize(
            proof,
            actorProof,
            "existing-room",
            roomId,
          );
        } catch (error) {
          authError(error);
        }
      },
      async (scope) => {
        this.scopes.set(scope.client, scope);
        try {
          const value = await work(scope.client);
          try {
            await this.authorizer.finish(proof, scope);
          } catch (error) {
            authError(error);
          }
          return value;
        } finally {
          this.scopes.delete(scope.client);
        }
      },
    );
    if (result.status === "ended") {
      await this.authorizer.settleEnded(proof);
      required();
    }
    return result.value;
  }
}
