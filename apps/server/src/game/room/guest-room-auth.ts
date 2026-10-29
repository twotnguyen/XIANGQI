import { createHash } from "node:crypto";
import type { Pool, PoolClient } from "pg";
import type { GuestService } from "../../account/guest/guest.service.js";
import {
  GuestError,
  type GuestActor,
  type GuestPurpose,
  type GuestCoordinator,
  type GuestLifecycle,
} from "../../account/guest/guest.types.js";
import {
  RoomError,
  RoomRosterChanged,
  type RoomActor,
  type RoomScope,
} from "./room.types.js";
import type {
  RoomActorProof,
  RoomAuthorization,
  RoomTransactions,
} from "./room-transactions.js";

// Strict guest proof: the Authorization: Guest <capability> value and nothing else.
export interface GuestRoomRequestProof {
  guestCapability: string;
}

export type GuestRoomMutationScope = Pick<
  RoomScope,
  "client" | "actor" | "lockedActorIds"
>;

const fingerprint = (cap: string) =>
  createHash("sha256").update(cap).digest("hex");

const required = () =>
  new RoomError("AUTH_REQUIRED", "Phiên Khách không hợp lệ", 401);

const GUEST_POLICY_CODES: Record<string, true> = {
  GUEST_DEFERRED: true,
  GUEST_ROOM_LIMIT: true,
  GUEST_RESIGN_CONFIRM_REQUIRED: true,
};

function checkedHash(proof: GuestRoomRequestProof) {
  if (
    !proof ||
    Object.keys(proof).join() !== "guestCapability" ||
    typeof proof.guestCapability !== "string" ||
    !/^[A-Za-z0-9_-]{43}$/.test(proof.guestCapability)
  )
    throw required();
  return fingerprint(proof.guestCapability);
}

function sanitized(error: unknown): RoomError {
  if (error instanceof RoomRosterChanged) return error;
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
        "Khách chỉ được mở 1 phòng cùng lúc",
        409,
      );
    if (error.code === "GUEST_RESIGN_CONFIRM_REQUIRED")
      return new RoomError(
        "GUEST_RESIGN_CONFIRM_REQUIRED",
        "Cần xác nhận đầu hàng trước khi đăng xuất",
        409,
      );
  }
  return new RoomError(
    "AUTH_UNAVAILABLE",
    "Chưa thể xác thực phiên Khách",
    503,
  );
}

/**
 * Xác thực và phân quyền cho người chơi Khách (Guest) trong các giao dịch phòng cờ.
 *
 * Quy tắc:
 * - resolve() chỉ đọc (không khóa) để biết actor cần khóa; kết quả gắn với đúng object proof.
 * - authorize() chạy trong transaction sau khi đã khóa toàn bộ roster (actor trước phòng);
 *   từ chối nếu danh tính trong phiên không khớp actor đã khóa.
 * - finish() chạy sau mutation dưới cùng roster lock để dọn phiên hết hạn không còn ghế.
 */
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

  /**
   * Tra cứu danh tính khách từ capability mà không khóa actor.
   */
  async resolve(proof: GuestRoomRequestProof): Promise<RoomActor> {
    const hash = checkedHash(proof);
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
      if (!row) throw required();
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

  private trusted(
    proof: GuestRoomRequestProof,
    scope: Pick<RoomScope, "actor" | "lockedActorIds">,
  ) {
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

  /**
   * Xác thực khách trong transaction đã khóa roster. Không ghi dữ liệu ở đây:
   * việc dọn phiên hết hạn chỉ diễn ra trong finish() dưới cùng khóa.
   */
  async authorize(
    proof: GuestRoomRequestProof,
    actorProof: RoomActorProof,
    purpose: GuestPurpose = "read",
    contextId?: string,
  ): Promise<RoomAuthorization> {
    this.authorized.delete(actorProof.client);
    const trusted = this.trusted(proof, actorProof);
    try {
      const row = (
        await actorProof.client.query<{ guest_id: string }>(
          "SELECT guest_id FROM xiangqi_auth.guest_sessions WHERE token_hash=$1 AND ended_at IS NULL FOR UPDATE",
          [trusted.hash],
        )
      ).rows[0];
      if (!row || row.guest_id !== trusted.userId) throw required();
      const result = await this.guests.authorizeHash(
        actorProof.client,
        trusted.hash,
        purpose,
        contextId,
        actorProof.lockedActorIds,
      );
      if (result.status === "ended") return { status: "ended" };
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

  /**
   * Hoàn tất mutation: dọn phiên Khách nếu đã hết hạn và không còn giữ ghế (cùng roster lock).
   */
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

  /**
   * Sau khi withRoom đã COMMIT kết quả `ended`: chạy dọn dẹp qua coordinator (khóa roster đầy đủ,
   * COMMIT) để phiên hết hạn không còn ở lại sau 401. Lỗi hết hạn/không hợp lệ là kết quả mong đợi.
   */
  async settleEnded(proof: GuestRoomRequestProof): Promise<void> {
    checkedHash(proof);
    try {
      await this.guests.requireActive(proof.guestCapability, "read");
    } catch (error) {
      if (
        error instanceof GuestError &&
        ["GUEST_EXPIRED", "GUEST_INVALID"].includes(error.code)
      )
        return;
      throw sanitized(error);
    }
  }
}

/**
 * Khóa roster đầy đủ (actor trước phòng) qua RoomTransactions, rồi mới chạy work của khách.
 * Kết quả trả về trực tiếp từ withRoom, không bọc thêm lớp trạng thái.
 */
export class GuestRoomCoordinator implements GuestCoordinator {
  constructor(
    private readonly transactions: RoomTransactions,
    private readonly withScope: <T>(
      scope: RoomScope,
      work: () => Promise<T>,
    ) => Promise<T>,
  ) {}

  async run<T>(
    guests: GuestLifecycle,
    tokenHash: string,
    purpose: GuestPurpose,
    roomId: string | undefined,
    work: (c: PoolClient, actor: GuestActor) => Promise<T>,
  ): Promise<{ status: "active"; value: T } | { status: "ended" }> {
    const owner = await this.resolveOwner(guests, tokenHash);
    let outcome:
      { status: "active"; actor: GuestActor } | { status: "ended" } | undefined;
    // Object holder: the callback assigns the client, which TypeScript cannot track across await.
    const staging: { client?: PoolClient } = {};
    try {
      const result = await this.transactions.withRoom(
        {
          actor: { userId: owner, kind: "guest" },
          roomIds: roomId ? [roomId] : [],
        },
        async (proof) => {
          staging.client = proof.client;
          outcome = await guests.authorizeHash(
            proof.client,
            tokenHash,
            purpose,
            roomId,
            proof.lockedActorIds,
          );
          if (outcome.status === "active" && outcome.actor.userId !== owner)
            throw required();
          return { status: "active", actor: proof.actor };
        },
        (scope) =>
          this.withScope(scope, async () => {
            if (!outcome) throw required();
            if (outcome.status === "ended") {
              // Cleanup commits under the same roster lock before the caller sees ended.
              await guests.expireIfDue(scope.client, owner);
              return { status: "ended" as const };
            }
            return {
              status: "active" as const,
              value: await work(scope.client, outcome.actor),
            };
          }),
      );
      // Room COMMIT succeeded: only now may staged AI effects drop RAM / release gates.
      if (staging.client) guests.commitStaged(staging.client);
      return result.status === "ended" ? result : result.value;
    } catch (error) {
      if (staging.client) guests.rollbackStaged(staging.client);
      // Guest policy codes are emitted as RoomError by sanitized(); GuestService must see them as GuestError, not as an internal failure.
      if (error instanceof RoomError && GUEST_POLICY_CODES[error.code] === true)
        throw new GuestError(error.code, error.message, error.status);
      throw error;
    }
  }

  private async resolveOwner(guests: GuestLifecycle, tokenHash: string) {
    const owner = await guests.ownerOf(tokenHash);
    if (!owner)
      throw new GuestError("GUEST_INVALID", "Phiên Khách không hợp lệ");
    return owner;
  }
}
