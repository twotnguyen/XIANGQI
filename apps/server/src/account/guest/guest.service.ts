import { randomBytes, randomUUID, createHash } from "node:crypto";
import type { Pool, PoolClient } from "pg";
import { containsForbiddenName } from "@xiangqi/shared";
import { actorLock, transaction } from "../google/postgres.js";
import {
  GuestError,
  type GuestActor,
  type GuestPurpose,
  type GuestRoomPort,
} from "./contracts.js";
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
interface StoredGuest {
  userId: string;
  displayName: string;
  expiresAt: Date;
}
export class GuestService {
  private expiryCursor: { expiresAt: Date; tokenHash: string } | null = null;
  constructor(
    private readonly pool: Pool,
    private readonly rooms?: GuestRoomPort,
    private readonly now = () => new Date(),
  ) {}
  async create(input: unknown) {
    const name = displayName(input),
      userId = randomUUID(),
      capability = randomBytes(32).toString("base64url"),
      created = this.now();
    const expires = new Date(created.getTime() + 12 * 3600000);
    try {
      await transaction(this.pool, async (c) => {
        await c.query(
          "INSERT INTO xiangqi_auth.principals(id,kind) VALUES($1,'guest')",
          [userId],
        );
        await c.query(
          "INSERT INTO public.profiles(user_id,username,display_name) VALUES($1,$2,$3)",
          [userId, "g" + userId.replaceAll("-", "").slice(0, 19), name],
        );
        await c.query(
          "INSERT INTO xiangqi_auth.guest_sessions(token_hash,guest_id,created_at,expires_at) VALUES($1,$2,$3,$4)",
          [hash(capability), userId, created, expires],
        );
      });
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
    await c.query(
      "UPDATE public.profiles SET display_name='Khách',updated_at=$2 WHERE user_id=$1",
      [guest.userId, this.now()],
    );
    await c.query("DELETE FROM xiangqi_auth.guest_sessions WHERE guest_id=$1", [
      guest.userId,
    ]);
  }
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
      const result = await transaction(this.pool, async (c) => {
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
  // Caller MUST own an open transaction and call this BEFORE acquiring any room lock.
  // An ended outcome includes committed-intent cleanup; caller must commit, then reject the command.
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
    const initial = (
      await c.query(
        "SELECT guest_id FROM xiangqi_auth.guest_sessions WHERE token_hash=$1",
        [tokenHash],
      )
    ).rows[0];
    if (!initial)
      throw new GuestError("GUEST_INVALID", "Phiên Khách không hợp lệ");
    await actorLock(c, initial.guest_id);
    const guest: StoredGuest | undefined = (
      await c.query(
        `SELECT s.guest_id AS "userId",s.expires_at AS "expiresAt",p.display_name AS "displayName" FROM xiangqi_auth.guest_sessions s JOIN xiangqi_auth.principals a ON a.id=s.guest_id AND a.kind='guest' JOIN public.profiles p ON p.user_id=s.guest_id WHERE s.token_hash=$1 AND s.ended_at IS NULL FOR UPDATE OF s`,
        [tokenHash],
      )
    ).rows[0];
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
      (
        await c.query(
          "SELECT 1 FROM public.rooms WHERE owner_id=$1 AND closed_at IS NULL LIMIT 1",
          [guest.userId],
        )
      ).rowCount
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
  // Call after room/AI mutation, before the same transaction commits.
  async finishActorMutation(c: PoolClient, actor: GuestActor) {
    if (!this.rooms) throw this.unavailable();
    const row = (
      await c.query(
        "SELECT expires_at FROM xiangqi_auth.guest_sessions WHERE guest_id=$1 AND ended_at IS NULL",
        [actor.userId],
      )
    ).rows[0];
    if (
      row &&
      row.expires_at.getTime() <= this.now().getTime() &&
      !(await this.rooms.seatedSeat(c, actor.userId))
    )
      await this.end(c, { ...actor, expiresAt: row.expires_at }, "expiry");
  }
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
  async expireDue() {
    const candidates = await transaction(
      this.pool,
      async (c) =>
        (
          await c.query(
            "SELECT token_hash,expires_at FROM xiangqi_auth.guest_sessions WHERE expires_at<=$1 AND ended_at IS NULL AND ($2::timestamptz IS NULL OR (expires_at,token_hash)>($2,$3)) ORDER BY expires_at,token_hash LIMIT 100",
            [
              this.now(),
              this.expiryCursor?.expiresAt ?? null,
              this.expiryCursor?.tokenHash ?? null,
            ],
          )
        ).rows,
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
