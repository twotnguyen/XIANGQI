import type { PoolClient } from "pg";
import type {
  RealtimeErrorCode,
  RoomCommand,
  RoomStateSnapshot,
  RoomSnapshot,
} from "@xiangqi/shared";

export interface RealtimeIdentity {
  userId: string;
  kind: "member" | "guest";
}
// Internal credentials are never projected into snapshots, receipts or events.
export interface RealtimeAuthProof {
  accessToken: string;
  appSession: string;
}
export interface IdentityResolver {
  // SQL-only fixed appSession validity; never consult the bearer provider.
  sessionActive?(connection: RealtimeConnection): Promise<boolean>;
  resolve(
    accessToken: string,
    appSession: string,
    proof?: RealtimeAuthProof,
  ): Promise<RealtimeIdentity>;
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
export interface RoomCollaborator {
  authorize(
    client: PoolClient,
    identity: RealtimeIdentity,
    roomId: string,
  ): Promise<{ canControl: boolean }>;
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
}
export interface RealtimeConnection {
  identity: RealtimeIdentity;
  proof?: RealtimeAuthProof;
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
