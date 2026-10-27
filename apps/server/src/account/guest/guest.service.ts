import { randomBytes, randomUUID, createHash } from "node:crypto";
import type { PoolClient } from "pg";
import { containsForbiddenName } from "@xiangqi/shared";
import type { ExpiryCursor, GuestStore } from "./guest.store.js";
import {
  GuestError,
  type GuestActor,
  type GuestPurpose,
  type GuestRoomPort,
  type GuestCoordinator,
  type GuestCommitEffect,
} from "./guest.types.js";
function hash(capability: unknown) {
  if (typeof capability !== "string" || !/^[A-Za-z0-9_-]{43}$/.test(capability))
    throw new GuestError("GUEST_INVALID", "Phiên Khách không hợp lệ");
  return createHash("sha256").update(capability).digest("hex");
}
function displayName(input: unknown) {
  if (typeof input !== "string")
    throw new GuestError(
      "GUEST_NAME_INVALID",
      "Tên Khách cần 2–20 ký tự hợp lệ",
      400,
    );
  const name = input.normalize("NFC").trim();
  const length = Array.from(name).length;
  if (
    length < 2 ||
    length > 20 ||
    Array.from(name).some((c) => {
      const n = c.codePointAt(0)!;
      return n < 32 || (n >= 127 && n <= 159);
    }) ||
    containsForbiddenName(name)
  )
    throw new GuestError(
      "GUEST_NAME_INVALID",
      "Tên Khách cần 2–20 ký tự hợp lệ",
      400,
    );
  return name;
}
/**
 * Dịch vụ quản lý người chơi Khách (Guest):
 * Xử lý tạo phiên ẩn danh tạm thời, xác thực quyền hạn (capability),
 * duy trì ván đấu đang chơi khi hết hạn (deferred mode), và thu hồi phiên khi rời bàn/đăng xuất.
 */
export class GuestService {
  private expiryCursor: ExpiryCursor | null = null;
  private readonly staged = new WeakMap<PoolClient, GuestCommitEffect[]>();
  constructor(
    private readonly store: GuestStore,
    private readonly rooms?: GuestRoomPort,
    private readonly now = () => new Date(),
    private readonly coordinator?: GuestCoordinator,
  ) {}
  /**
   * Khởi tạo phiên khách mới: tạo ngẫu nhiên userId, capability token và lưu thông tin profile.
   */
  async create(input: unknown) {
    const name = displayName(input),
      userId = randomUUID(),
      capability = randomBytes(32).toString("base64url"),
      created = this.now();
    const expires = new Date(created.getTime() + 12 * 3600000);
    try {
      await this.store.transaction((c) =>
        this.store.insertGuest(c, {
          userId,
          displayName: name,
          tokenHash: hash(capability),
          createdAt: created,
          expiresAt: expires,
        }),
      );
    } catch {
      throw new GuestError(
        "GUEST_UNAVAILABLE",
        "Chưa thể tạo phiên Khách",
        503,
      );
    }
    return {
      kind: "guest" as const,
      userId,
      displayName: name,
      capability,
      expiresAt: expires.toISOString(),
      deferred: false,
    };
  }
  private unavailable() {
    return new GuestError(
      "GUEST_UNAVAILABLE",
      "Chức năng Khách chưa sẵn sàng",
      503,
    );
  }
  private async end(
    c: PoolClient,
    guest: { userId: string },
    reason: "expiry" | "logout",
    confirmedResign = false,
  ) {
    if (!this.rooms) throw this.unavailable();
    await this.rooms.end(c, guest.userId, {
      reason,
      confirmedResign,
      stageCommit: (effect) => this.stage(c, effect),
    });
    await this.store.clearGuest(c, guest.userId, this.now());
  }
  // Effects are staged per client and settled only by GuestRoomCoordinator after the room COMMIT.
  private stage(c: PoolClient, effect: GuestCommitEffect) {
    this.staged.set(c, [...(this.staged.get(c) ?? []), effect]);
  }
  private takeStaged(c: PoolClient): GuestCommitEffect[] {
    const effects = this.staged.get(c) ?? [];
    this.staged.delete(c);
    return effects;
  }
  /** Runs staged commits after a successful room COMMIT; a failed commit rolls back the rest. */
  commitStaged(c: PoolClient): void {
    const effects = this.takeStaged(c);
    effects.forEach((effect, i) => {
      try {
        effect.commit();
      } catch (error) {
        for (const rest of effects.slice(i + 1)) rest.rollback();
        throw error;
      }
    });
  }
  /** Releases every staged gate after the room transaction failed. */
  rollbackStaged(c: PoolClient): void {
    for (const effect of this.takeStaged(c)) effect.rollback();
  }
  /**
   * Thực thi khối công việc trong transaction với actor khách đã được xác thực và phân quyền.
   */
  async withActor<T>(
    capability: unknown,
    purpose: GuestPurpose,
    roomId: string | undefined,
    work: (c: PoolClient, actor: GuestActor) => Promise<T>,
  ): Promise<T> {
    return this.withHash(hash(capability), purpose, roomId, work);
  }
  private async withHash<T>(
    tokenHash: string,
    purpose: GuestPurpose,
    roomId: string | undefined,
    work: (c: PoolClient, actor: GuestActor) => Promise<T>,
  ): Promise<T> {
    if (!this.rooms || !this.coordinator) throw this.unavailable();
    try {
      // The coordinator locks actors then rooms in sorted order BEFORE the guest
      // actor is authorized; finish runs under that same roster lock.
      const result = await this.coordinator.run(
        this,
        tokenHash,
        purpose,
        roomId,
        async (c, actor) => {
          const value = await work(c, actor);
          const ended = await this.finishActorMutation(c, actor);
          return { value, ended };
        },
      );
      if (result.status === "ended")
        throw new GuestError("GUEST_EXPIRED", "Phiên Khách đã hết hạn");
      // Cleanup committed with the roster lock; an expired session is never reported as active.
      if (result.value.ended)
        throw new GuestError("GUEST_EXPIRED", "Phiên Khách đã hết hạn");
      return result.value.value;
    } catch (error) {
      if (error instanceof GuestError) throw error;
      throw this.unavailable();
    }
  }
  /**
   * Thẩm định và lấy thông tin actor khách bên trong transaction sẵn có của caller trước khi khóa phòng.
   */
  async requireActorInTransaction(
    c: PoolClient,
    capability: unknown,
    purpose: GuestPurpose = "read",
    contextId: string | undefined,
    lockedActorIds: ReadonlySet<string>,
  ) {
    return this.authorizeHash(
      c,
      hash(capability),
      purpose,
      contextId,
      lockedActorIds,
    );
  }
  /**
   * Tra cứu guest_id sở hữu token (chỉ đọc, không khóa) để coordinator biết roster cần khóa.
   */
  async ownerOf(tokenHash: string): Promise<string | undefined> {
    return this.store.transaction((c) =>
      this.store.findSessionOwner(c, tokenHash),
    );
  }
  // Caller MUST hold the roster lock of every actor in lockedActorIds (see GuestCoordinator).
  // Pure decision: no writes here; expiry cleanup runs only in finishActorMutation.
  async authorizeHash(
    c: PoolClient,
    tokenHash: string,
    purpose: GuestPurpose,
    contextId: string | undefined,
    lockedActorIds: ReadonlySet<string>,
  ): Promise<{ status: "active"; actor: GuestActor } | { status: "ended" }> {
    if (!this.rooms) throw this.unavailable();
    const guest = await this.store.findActiveGuest(c, tokenHash);
    if (!guest || !lockedActorIds.has(guest.userId))
      throw new GuestError("GUEST_INVALID", "Phiên Khách không hợp lệ");
    const seat = await this.rooms.seatedSeat(c, guest.userId),
      expired = guest.expiresAt.getTime() <= this.now().getTime();
    const matches =
      seat &&
      ((purpose === "existing-room" &&
        seat.kind === "room" &&
        seat.roomId === contextId) ||
        (purpose === "existing-ai" &&
          seat.kind === "ai" &&
          seat.matchId === contextId));
    if (expired && !seat) return { status: "ended" };
    if (expired && purpose !== "read" && !matches)
      throw new GuestError(
        "GUEST_DEFERRED",
        "Phiên Khách chỉ được tiếp tục ván đang giữ ghế",
        403,
      );
    if (
      purpose === "new-room" &&
      (await this.store.ownsOpenRoom(c, guest.userId))
    )
      throw new GuestError(
        "GUEST_ROOM_LIMIT",
        "Khách chỉ được tạo một phòng đang mở",
        409,
      );
    return {
      status: "active",
      actor: {
        kind: "guest",
        userId: guest.userId,
        displayName: guest.displayName,
        expiresAt: guest.expiresAt.toISOString(),
        deferred: expired,
      },
    };
  }
  /**
   * Dọn phiên Khách đã hết hạn và không còn giữ ghế; caller phải đang giữ khóa actor này.
   */
  async expireIfDue(c: PoolClient, userId: string): Promise<boolean> {
    if (!this.rooms) throw this.unavailable();
    const expiresAt = await this.store.activeSessionExpiry(c, userId);
    if (
      expiresAt &&
      expiresAt.getTime() <= this.now().getTime() &&
      !(await this.rooms.seatedSeat(c, userId))
    ) {
      await this.end(c, { userId }, "expiry");
      return true;
    }
    return false;
  }
  /**
   * Kiểm tra dọn dẹp phiên khách sau khi biến đổi trạng thái phòng/trận đấu nếu phiên đã hết hạn và không còn giữ ghế.
   */
  finishActorMutation(c: PoolClient, actor: GuestActor): Promise<boolean> {
    return this.expireIfDue(c, actor.userId);
  }
  /**
   * Kiểm tra capability token còn hiệu lực và trả về thông tin actor khách.
   */
  async requireActive(
    capability: unknown,
    purpose: GuestPurpose = "read",
    roomId?: string,
  ): Promise<GuestActor> {
    return this.withActor(
      capability,
      purpose,
      roomId,
      async (_c, actor) => actor,
    );
  }
  /**
   * Khách chủ động đăng xuất: rời ghế, xử thua nếu đang trong trận và xóa phiên làm việc.
   */
  async logout(capability: unknown, confirmedResign = false) {
    return this.withActor(capability, "read", undefined, async (c, actor) =>
      this.end(c, { userId: actor.userId }, "logout", confirmedResign),
    );
  }
  /**
   * Quét và xử lý hết hạn cho các phiên khách quá hạn (thu hồi ghế và giải phóng tài nguyên).
   */
  async expireDue() {
    const candidates = await this.store.expiredSessions(
      this.now(),
      this.expiryCursor,
    );
    for (const candidate of candidates) {
      try {
        await this.withHash(
          candidate.token_hash,
          "read",
          undefined,
          async () => undefined,
        );
      } catch (error) {
        if (
          !(error instanceof GuestError) ||
          !["GUEST_INVALID", "GUEST_EXPIRED"].includes(error.code)
        )
          throw error;
      }
    }
    const last = candidates.at(-1);
    this.expiryCursor =
      candidates.length === 100 && last
        ? { expiresAt: last.expires_at, tokenHash: last.token_hash }
        : null;
  }
}
