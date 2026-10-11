import { createHash } from "node:crypto";
import type { Pool, PoolClient } from "pg";
import type { GuestService } from "../guest/guest.service.js";
import {
  GuestError,
  type GuestActor,
  type GuestPurpose,
} from "../guest/contracts.js";
import { RoomError, type RoomActor } from "./contracts.js";
import type { RoomActorProof, RoomAuthorization } from "./room-transactions.js";
export interface GuestRoomRequestProof {
  capability: string;
}
export type GuestRoomMutationScope = Pick<
  RoomActorProof,
  "client" | "actor" | "lockedActorIds"
>;
const fingerprint = (cap: string) =>
  createHash("sha256").update(cap).digest("hex");
const required = () =>
  new RoomError("AUTH_REQUIRED", "Phiên Khách không hợp lệ", 401);
function checkedHash(proof: GuestRoomRequestProof) {
  if (
    !proof ||
    typeof proof.capability !== "string" ||
    !/^[A-Za-z0-9_-]{43}$/.test(proof.capability)
  )
    throw required();
  return fingerprint(proof.capability);
}
function sanitized(error: unknown): RoomError {
  if (error instanceof RoomError && error.code === "AUTH_REQUIRED")
    return required();
  if (error instanceof GuestError) {
    if (["GUEST_INVALID", "GUEST_EXPIRED"].includes(error.code))
      return required();
    if (error.code === "GUEST_DEFERRED")
      return new RoomError(
        "GUEST_DEFERRED",
        "Phiên Khách chỉ được tiếp tục ván đang giữ ghế",
        403,
      );
    if (error.code === "GUEST_ROOM_LIMIT")
      return new RoomError(
        "GUEST_ROOM_LIMIT",
        "Khách chỉ được tạo một phòng đang mở",
        409,
      );
  }
  return new RoomError(
    "AUTH_UNAVAILABLE",
    "Chưa thể xác thực phiên Khách",
    503,
  );
}
// The private proof object is request scoped, never a public room DTO.
export class GuestRoomAuthorizer {
  private readonly resolved = new WeakMap<
    GuestRoomRequestProof,
    { userId: string; hash: string }
  >();
  private readonly authorized = new WeakMap<
    PoolClient,
    { proof: GuestRoomRequestProof; actor: GuestActor }
  >();
  constructor(
    private readonly guests: GuestService,
    private readonly pool: Pool,
  ) {}
  async resolve(proof: GuestRoomRequestProof): Promise<RoomActor> {
    const hash = checkedHash(proof);
    this.resolved.delete(proof);
    let client: PoolClient | undefined;
    let broken = false;
    try {
      client = await this.pool.connect();
      await client.query("BEGIN READ ONLY");
      await client.query("SET LOCAL ROLE app_server");
      // Expiry is deliberately checked by GuestService under the full actor/room union.
      const row = (
        await client.query<{ guest_id: string }>(
          `SELECT s.guest_id FROM xiangqi_auth.guest_sessions s
         JOIN xiangqi_auth.principals p ON p.id=s.guest_id AND p.kind='guest'
         WHERE s.token_hash=$1 AND s.ended_at IS NULL`,
          [hash],
        )
      ).rows[0];
      if (!row || checkedHash(proof) !== hash) throw required();
      await client.query("COMMIT");
      this.resolved.set(proof, { userId: row.guest_id, hash });
      return { userId: row.guest_id, kind: "guest" };
    } catch (error) {
      if (client)
        await client.query("ROLLBACK").catch(() => {
          broken = true;
        });
      throw sanitized(error);
    } finally {
      client?.release(broken);
    }
  }
  private trusted(proof: GuestRoomRequestProof, scope: GuestRoomMutationScope) {
    const hash = checkedHash(proof),
      trusted = this.resolved.get(proof);
    if (
      !trusted ||
      trusted.hash !== hash ||
      scope.actor.kind !== "guest" ||
      scope.actor.userId !== trusted.userId ||
      !scope.lockedActorIds.has(trusted.userId)
    )
      throw required();
    return trusted;
  }
  async authorize(
    proof: GuestRoomRequestProof,
    actorProof: RoomActorProof,
    purpose: GuestPurpose = "read",
    contextId?: string,
  ): Promise<RoomAuthorization> {
    this.authorized.delete(actorProof.client);
    const trusted = this.trusted(proof, actorProof);
    try {
      // Refuse identity drift before GuestService can acquire a different actor lock.
      const row = (
        await actorProof.client.query<{ guest_id: string }>(
          "SELECT guest_id FROM xiangqi_auth.guest_sessions WHERE token_hash=$1 AND ended_at IS NULL FOR UPDATE",
          [trusted.hash],
        )
      ).rows[0];
      if (!row || row.guest_id !== trusted.userId) throw required();
      const result = await this.guests.requireActorInTransaction(
        actorProof.client,
        proof.capability,
        purpose,
        contextId,
      );
      if (result.status === "ended") return { status: "ended" };
      this.trusted(proof, actorProof);
      if (
        result.actor.userId !== trusted.userId ||
        result.actor.kind !== "guest"
      )
        throw required();
      this.authorized.set(actorProof.client, { proof, actor: result.actor });
      return {
        status: "active",
        actor: { userId: trusted.userId, kind: "guest" },
      };
    } catch (error) {
      throw sanitized(error);
    }
  }
  async finish(
    proof: GuestRoomRequestProof,
    scope: GuestRoomMutationScope,
  ): Promise<void> {
    const trusted = this.trusted(proof, scope),
      authorized = this.authorized.get(scope.client);
    this.authorized.delete(scope.client);
    if (
      !authorized ||
      authorized.proof !== proof ||
      authorized.actor.userId !== trusted.userId
    )
      throw required();
    try {
      await this.guests.finishActorMutation(scope.client, authorized.actor);
    } catch (error) {
      throw sanitized(error);
    }
  }
}
