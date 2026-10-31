import type { AiSnapshot } from "./ai-games.js";
import type { RoomRequestProof } from "../room/room-session.js";

/** Internal origins; only the HTTP boundary may construct a human operation. */
export type AiOrigin =
  | {
      kind: "human";
      proof: RoomRequestProof;
      tab: { tabId: string; connectionId: string; generation: number };
    }
  | { kind: "internal" }
  /** Quét nền: thu hồi boot hết hạn hoặc kết thúc ván hết ân hạn, không yêu cầu owner còn active. */
  | { kind: "sweep" };

export interface AiTransaction {
  reserve(gameId: string): Promise<void>;
  check(gameId: string): Promise<void>;
  finish(snapshot: AiSnapshot): Promise<void>;
  drop(gameId: string): Promise<void>;
  /** Sweep only: recheck the physical grace, persist a canonical terminal and release the exact slot. */
  expire(
    gameId: string,
    snapshot: AiSnapshot | null,
    abandonedBy?: "DISCONNECT",
  ): Promise<boolean>;
  reclaim(gameId: string, expiredBootId: string): Promise<boolean>;
}

export interface AiCommit<T> {
  value: T;
  /** Synchronous canonical RAM publication, called only after SQL COMMIT. */
  install(): void;
}

/** Holds actor -> room -> owner gate through SQL COMMIT and RAM install. */
export interface AiTransactions {
  run<T>(
    ownerId: string,
    origin: AiOrigin,
    work: (transaction: AiTransaction) => Promise<AiCommit<T>>,
  ): Promise<T>;
}
