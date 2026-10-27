import type { PoolClient } from "pg";
import { GuestService } from "@server/account/guest/guest.service.js";
import type { GuestStore } from "@server/account/guest/guest.store.js";
import {
  GuestError,
  type GuestActor,
  type GuestCoordinator,
  type GuestLifecycle,
  type GuestPurpose,
  type GuestRoomPort,
} from "@server/account/guest/guest.types.js";

// Harness in-memory: GuestService thật, store/room/coordinator giả. Rollback DB do test DB phủ.
const CLIENT = {} as PoolClient;

interface Row {
  userId: string;
  displayName: string;
  tokenHash: string;
  createdAt: Date;
  expiresAt: Date;
}

export type Seat =
  { kind: "room"; roomId: string } | { kind: "ai"; matchId: string };

export class MemoryGuestStore {
  readonly rows = new Map<string, Row>();
  insertFailure: Error | undefined;
  transaction<T>(work: (c: PoolClient) => Promise<T>): Promise<T> {
    return work(CLIENT);
  }
  async insertGuest(_c: PoolClient, row: Row): Promise<void> {
    if (this.insertFailure) throw this.insertFailure;
    this.rows.set(row.tokenHash, { ...row });
  }
  async findSessionOwner(_c: PoolClient, tokenHash: string) {
    return this.rows.get(tokenHash)?.userId;
  }
  async findActiveGuest(_c: PoolClient, tokenHash: string) {
    const row = this.rows.get(tokenHash);
    return row ? { ...row } : undefined;
  }
  async ownsOpenRoom(): Promise<boolean> {
    return false;
  }
  async activeSessionExpiry(_c: PoolClient, userId: string) {
    return [...this.rows.values()].find((row) => row.userId === userId)
      ?.expiresAt;
  }
  async clearGuest(_c: PoolClient, userId: string): Promise<void> {
    for (const [key, row] of this.rows) {
      if (row.userId === userId) this.rows.delete(key);
    }
  }
  async expiredSessions() {
    return [];
  }
}

export class MemoryRooms implements GuestRoomPort {
  readonly seats = new Map<string, Seat>();
  // Ván online đang diễn ra: logout phải xác nhận đầu hàng.
  readonly liveGames = new Set<string>();
  readonly ended: string[] = [];
  failure: Error | undefined;
  async seatedSeat(_c: PoolClient, guestId: string) {
    return this.seats.get(guestId) ?? null;
  }
  async end(
    _c: PoolClient,
    guestId: string,
    input: { reason: "expiry" | "logout"; confirmedResign: boolean },
  ): Promise<void> {
    if (this.failure) throw this.failure;
    if (
      input.reason === "logout" &&
      this.liveGames.has(guestId) &&
      !input.confirmedResign
    )
      throw new GuestError(
        "GUEST_RESIGN_CONFIRM_REQUIRED",
        "Ván đang diễn ra cần xác nhận đầu hàng",
        409,
      );
    this.seats.delete(guestId);
    this.liveGames.delete(guestId);
    this.ended.push(guestId);
  }
}

const coordinator: GuestCoordinator = {
  async run<T>(
    guests: GuestLifecycle,
    tokenHash: string,
    purpose: GuestPurpose,
    roomId: string | undefined,
    work: (c: PoolClient, actor: GuestActor) => Promise<T>,
  ) {
    const owner = await guests.ownerOf(tokenHash);
    if (!owner) return { status: "ended" as const };
    const result = await guests.authorizeHash(
      CLIENT,
      tokenHash,
      purpose,
      roomId,
      new Set([owner]),
    );
    if (result.status === "ended") {
      // Production GuestRoomCoordinator runs expiry cleanup under the same lock before reporting ended.
      await guests.expireIfDue(CLIENT, owner);
      return { status: "ended" as const };
    }
    return {
      status: "active" as const,
      value: await work(CLIENT, result.actor),
    };
  },
};

export function memoryGuests(now: () => Date) {
  const store = new MemoryGuestStore();
  const rooms = new MemoryRooms();
  const service = new GuestService(
    store as unknown as GuestStore,
    rooms,
    now,
    coordinator,
  );
  return { store, rooms, service };
}
