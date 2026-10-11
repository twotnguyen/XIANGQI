import type { PoolClient } from "pg";
import { RoomError, type RoomScope } from "../room/contracts.js";
import type { PostgresMemberRoomAuthorizer } from "../room/member-room-auth.js";
import type { RoomTransactions } from "../room/room-transactions.js";
import {
  RealtimeError,
  type RealtimeConnection,
  type RealtimeIdentity,
  type RealtimeAuthProof,
  type IdentityResolver,
  type RealtimeTransactions,
} from "./contracts.js";
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
export class MemberRealtimeIdentities implements IdentityResolver {
  constructor(private readonly authorizer: PostgresMemberRoomAuthorizer) {}
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
export class MemberRealtimeTransactions implements RealtimeTransactions {
  private readonly scopes = new WeakMap<PoolClient, RoomScope>();
  constructor(
    private readonly coordinator: RoomTransactions,
    private readonly authorizer: PostgresMemberRoomAuthorizer,
  ) {}
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
