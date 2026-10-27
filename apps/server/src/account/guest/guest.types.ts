import type { PoolClient } from "pg";
import type { GuestService } from "./guest.service.js";
export type GuestPurpose =
  "read" | "existing-room" | "new-room" | "join-room" | "existing-ai";
export interface GuestActor {
  kind: "guest";
  userId: string;
  displayName: string;
  expiresAt: string;
  deferred: boolean;
}
// Deferred work of a staged AI termination. commit() runs only AFTER the outer
// room transaction COMMITs; rollback() runs on any error and only releases gates.
export interface GuestCommitEffect {
  commit(): void;
  rollback(): void;
}
export interface GuestRoomEndInput {
  reason: "expiry" | "logout";
  confirmedResign: boolean;
  // Registers a staged effect immediately, before any fallible write runs.
  stageCommit(effect: GuestCommitEffect): void;
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
  // Atomic room leave + scoped structured PII scrub (rooms the guest holds or has held).
  // Preserves opponent history; display labels become the generic Khách via profile.
  end(
    client: PoolClient,
    guestId: string,
    input: GuestRoomEndInput,
  ): Promise<void>;
}
export type GuestLifecycle = Pick<
  GuestService,
  | "ownerOf"
  | "authorizeHash"
  | "expireIfDue"
  | "commitStaged"
  | "rollbackStaged"
>;
// Runs guest work only after the caller has locked the guest's full roster
// (actors sorted before rooms). Implementations MUST NOT lock the guest actor alone.
export interface GuestCoordinator {
  run<T>(
    guests: GuestLifecycle,
    tokenHash: string,
    purpose: GuestPurpose,
    roomId: string | undefined,
    work: (c: PoolClient, actor: GuestActor) => Promise<T>,
  ): Promise<{ status: "active"; value: T } | { status: "ended" }>;
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
