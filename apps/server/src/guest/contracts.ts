import type { PoolClient } from "pg";
export type GuestPurpose =
  "read" | "existing-room" | "new-room" | "join-room" | "existing-ai";
export interface GuestActor {
  kind: "guest";
  userId: string;
  displayName: string;
  expiresAt: string;
  deferred: boolean;
}
export interface GuestRoomPort {
  // Called only under actor lock, inside the caller-owned transaction.
  // Room code must acquire this same actor lock before sorted room locks/mutations.
  seatedSeat(
    client: PoolClient,
    guestId: string,
  ): Promise<
    { kind: "room"; roomId: string } | { kind: "ai"; matchId: string } | null
  >;
  // Atomic room resign/leave + structured receipts/events/chat/media PII scrub.
  // Preserve opponent match history, replace historical display labels with Khách.
  // Throw until every required lifecycle/privacy operation is integrated.
  end(
    client: PoolClient,
    guestId: string,
    input: { reason: "expiry" | "logout"; confirmedResign: boolean },
  ): Promise<void>;
}
export class GuestError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 401,
  ) {
    super(message);
  }
}
