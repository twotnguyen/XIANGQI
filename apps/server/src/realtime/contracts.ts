import type { PoolClient } from "pg";
import type {
  RealtimeErrorCode,
  RoomCommand,
  RoomStateSnapshot,
} from "@xiangqi/shared";

export interface RealtimeIdentity {
  userId: string;
  kind: "member" | "guest";
}
export interface IdentityResolver {
  resolve(accessToken: string): Promise<RealtimeIdentity>;
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
  ): Promise<RoomStateSnapshot>;
}
export interface RealtimeConnection {
  identity: RealtimeIdentity;
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
