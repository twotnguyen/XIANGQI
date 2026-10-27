import { randomBytes, randomUUID, createHash } from "node:crypto";
import type { PoolClient } from "pg";
import { containsForbiddenName } from "@xiangqi/shared";
import type { ExpiryCursor, GuestStore, StoredGuest } from "./guest.store.js";
import {
  GuestError,
  type GuestActor,
  type GuestPurpose,
  type GuestRoomPort,
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
  constructor(
    private readonly store: GuestStore,
    private readonly rooms?: GuestRoomPort,
    private readonly now = () => new Date(),
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
    guest: StoredGuest,
    reason: "expiry" | "logout",
    confirmedResign = false,
  ) {
    if (!this.rooms) throw this.unavailable();
    await this.rooms.end(c, guest.userId, { reason, confirmedResign });
    await this.store.clearGuest(c, guest.userId, this.now());
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
    if (!this.rooms) throw this.unavailable();
    try {
      const result = await this.store.transaction(async (c) => {
        const authorization = await this.authorizeHash(
          c,
          tokenHash,
          purpose,
          roomId,
        );
        if (authorization.status === "ended") return { expired: true as const };
        const value = await work(c, authorization.actor);
        await this.finishActorMutation(c, authorization.actor);
        return { expired: false as const, value };
      });
      if (result.expired)
        throw new GuestError("GUEST_EXPIRED", "Phiên Khách đã hết hạn");
      return result.value;
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
    contextId?: string,
  ) {
    return this.authorizeHash(c, hash(capability), purpose, contextId);
  }
  private async authorizeHash(
    c: PoolClient,
    tokenHash: string,
    purpose: GuestPurpose,
    contextId?: string,
  ): Promise<{ status: "active"; actor: GuestActor } | { status: "ended" }> {
    if (!this.rooms) throw this.unavailable();
    const ownerId = await this.store.findSessionOwner(c, tokenHash);
    if (!ownerId)
      throw new GuestError("GUEST_INVALID", "Phiên Khách không hợp lệ");
    await this.store.lockActor(c, ownerId);
    const guest = await this.store.findActiveGuest(c, tokenHash);
    if (!guest)
      throw new GuestError("GUEST_INVALID", "Phiên Khách không hợp lệ");
    const seat = await this.rooms.seatedSeat(c, guest.userId),
      expired = guest.expiresAt.getTime() <= this.now().getTime();
    if (expired && !seat) {
      await this.end(c, guest, "expiry");
      return { status: "ended" };
    }
    const matches =
      seat &&
      ((purpose === "existing-room" &&
        seat.kind === "room" &&
        seat.roomId === contextId) ||
        (purpose === "existing-ai" &&
          seat.kind === "ai" &&
          seat.matchId === contextId));
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
   * Kiểm tra dọn dẹp phiên khách sau khi biến đổi trạng thái phòng/trận đấu nếu phiên đã hết hạn và không còn giữ ghế.
   */
  async finishActorMutation(c: PoolClient, actor: GuestActor) {
    if (!this.rooms) throw this.unavailable();
    const expiresAt = await this.store.activeSessionExpiry(c, actor.userId);
    if (
      expiresAt &&
      expiresAt.getTime() <= this.now().getTime() &&
      !(await this.rooms.seatedSeat(c, actor.userId))
    )
      await this.end(c, { ...actor, expiresAt }, "expiry");
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
      this.end(
        c,
        { ...actor, expiresAt: new Date(actor.expiresAt) },
        "logout",
        confirmedResign,
      ),
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
