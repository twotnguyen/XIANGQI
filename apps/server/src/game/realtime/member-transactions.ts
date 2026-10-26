import type { PoolClient } from "pg";
import { RoomError, type RoomScope } from "../room/room.types.js";
import type { PostgresMemberRoomAuthorizer } from "../room/member-room-auth.js";
import type { RoomTransactions } from "../room/room-transactions.js";
import {
  RealtimeError,
  type RealtimeConnection,
  type RealtimeIdentity,
  type RealtimeAuthProof,
  type IdentityResolver,
  type RealtimeTransactions,
} from "./realtime.types.js";
function required(): never {
  throw new RealtimeError("AUTH_REQUIRED", "Phiên đăng nhập không hợp lệ");
}
function authError(error: unknown): never {
  if (error instanceof RoomError && error.code === "AUTH_REQUIRED") required();
  throw new RealtimeError(
    "REALTIME_UNAVAILABLE",
    "Chưa thể xác thực phiên đăng nhập",
  );
}
/**
 * Xác thực danh tính thành viên từ token/phiên đăng nhập và kiểm tra trạng thái hoạt động của phiên.
 */
export class MemberRealtimeIdentities implements IdentityResolver {
  constructor(
    private readonly authorizer: PostgresMemberRoomAuthorizer,
    private readonly checkSession?: (
      userId: string,
      appSession: string,
    ) => Promise<boolean>,
  ) {}
  /**
   * Kiểm tra xem phiên đăng nhập (app_session) của kết nối hiện tại có còn hoạt động không.
   */
  async sessionActive(connection: RealtimeConnection): Promise<boolean> {
    if (
      connection.identity.kind !== "member" ||
      !connection.proof ||
      !/^[A-Za-z0-9_-]{43}$/.test(connection.proof.appSession)
    )
      return false;
    if (!this.checkSession)
      throw new RealtimeError(
        "REALTIME_UNAVAILABLE",
        "Chưa thể xác thực phiên đăng nhập",
      );
    try {
      return await this.checkSession(
        connection.identity.userId,
        connection.proof.appSession,
      );
    } catch {
      throw new RealtimeError(
        "REALTIME_UNAVAILABLE",
        "Chưa thể xác thực phiên đăng nhập",
      );
    }
  }
  /**
   * Giải mã và xác thực thông tin danh tính người dùng từ access token và chuỗi app session.
   */
  async resolve(
    accessToken: string,
    appSession: string,
    proof?: RealtimeAuthProof,
  ): Promise<RealtimeIdentity> {
    if (
      !proof ||
      proof.accessToken !== accessToken ||
      proof.appSession !== appSession
    )
      required();
    try {
      return await this.authorizer.resolve(proof);
    } catch (error) {
      authError(error);
    }
  }
}
/**
 * Điều phối giao dịch realtime cho thành viên: khóa tài nguyên theo thứ tự an toàn và quản lý RoomScope.
 */
export class MemberRealtimeTransactions implements RealtimeTransactions {
  private readonly scopes = new WeakMap<PoolClient, RoomScope>();
  constructor(
    private readonly coordinator: RoomTransactions,
    private readonly authorizer: PostgresMemberRoomAuthorizer,
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
      identity.kind !== "member" ||
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
    if (!connection.proof || connection.identity.kind !== "member") required();
    const proof = connection.proof;
    const result = await this.coordinator.withRoom(
      { actor: { ...connection.identity }, roomIds: [connection.roomId] },
      async (actorProof) => {
        try {
          return await this.authorizer.authorize(proof, actorProof);
        } catch (error) {
          authError(error);
        }
      },
      async (scope) => {
        this.scopes.set(scope.client, scope);
        try {
          return await work(scope.client);
        } finally {
          this.scopes.delete(scope.client);
        }
      },
    );
    if (result.status === "ended") required();
    return result.value;
  }
}
