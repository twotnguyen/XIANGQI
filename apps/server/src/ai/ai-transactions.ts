import type { AiSnapshot } from "./ai-games.js";
import type { MemberRoomRequestProof } from "../room/room-http.service.js";

/** Internal origins; only the HTTP boundary may construct a human operation. */
export type AiOrigin =
  | {
      kind: "human";
      proof: MemberRoomRequestProof;
      tab: { tabId: string; connectionId: string; generation: number };
    }
  | { kind: "internal" };

export interface AiTransaction {
  reserve(gameId: string): Promise<void>;
  check(gameId: string): Promise<void>;
  finish(snapshot: AiSnapshot): Promise<void>;
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
