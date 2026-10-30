import type { PoolClient } from "pg";
import type {
  RealtimeErrorCode,
  RoomCommand,
  RoomStateSnapshot,
  RoomSnapshot,
} from "@xiangqi/shared";
import type { RoomRequestProof } from "../room/room-session.js";

export interface RealtimeIdentity {
  userId: string;
  kind: "member" | "guest";
}
export interface IdentityResolver {
  // Liveness of the connection's own credential; never consults the bearer provider.
  sessionActive?(connection: RealtimeConnection): Promise<boolean>;
  // Resolves the canonical member-or-guest proof; the proof is never fabricated.
  resolve(proof: RoomRequestProof): Promise<RealtimeIdentity>;
}
export interface RealtimeTransactions {
  run<T>(
    connection: RealtimeConnection,
    work: (client: PoolClient) => Promise<T>,
  ): Promise<T>;
}
export interface RealtimePresence {
  connected(
    client: PoolClient,
    connection: RealtimeConnection,
    control: RoomSnapshot["control"],
  ): Promise<"ended" | void>;
  disconnected(connection: RealtimeConnection): Promise<void>;
}
export interface RoomExecutionResult {
  snapshot: RoomStateSnapshot;
  error?: { code: RealtimeErrorCode; message: string };
}
export interface RoomAccess {
  canControl: boolean;
  // Authoritative room version read from the same locked member state as the authorization.
  version: number;
}
export interface RoomCollaborator {
  authorize(
    client: PoolClient,
    identity: RealtimeIdentity,
    roomId: string,
  ): Promise<RoomAccess>;
  // Recheck membership under the transaction's locks and return this identity's authoritative role.
  snapshot(
    client: PoolClient,
    identity: RealtimeIdentity,
    roomId: string,
  ): Promise<RoomStateSnapshot>;
  execute(
    client: PoolClient,
    identity: RealtimeIdentity,
    command: RoomCommand,
  ): Promise<RoomStateSnapshot | RoomExecutionResult>;
  // Queues media.revoke-user for the identity's old publisher, in the caller's transaction and scope.
  queueMediaRevoke(
    client: PoolClient,
    identity: RealtimeIdentity,
    roomId: string,
  ): Promise<void>;
}
export interface RealtimeConnection {
  identity: RealtimeIdentity;
  // Private physical credential for server-side authorization only; never projected.
  proof: RoomRequestProof;
  roomId: string;
  tabId: string;
  connectionId: string;
}
export class RealtimeError extends Error {
  constructor(
    public readonly code: RealtimeErrorCode,
    message: string,
  ) {
    super(message);
  }
}
