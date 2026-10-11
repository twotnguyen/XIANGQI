import type { MatchEnding, Move, Side } from "@xiangqi/xiangqi-core";
export type EngineLevel = "easy" | "medium" | "hard";
export interface EngineRequest {
  position: string;
  side: Side;
  level: EngineLevel;
  /** Server-owned effective branch, ending at position; never accept client history. */
  history?: readonly string[];
}
export interface EngineResult {
  move: Move | null;
  terminal: MatchEnding | null;
  completedDepth: number;
  targetDepth: number;
  elapsedMs: number;
  nodes: number;
  timedOut: boolean;
}
export const ENGINE_LIMITS = {
  easy: { depth: 2, milliseconds: 300 },
  medium: { depth: 4, milliseconds: 1000 },
  hard: { depth: 6, milliseconds: 3000 },
} as const;
export class EngineError extends Error {
  constructor(
    public readonly code:
      | "ENGINE_INPUT_INVALID"
      | "ENGINE_BUSY"
      | "ENGINE_TIMEOUT"
      | "ENGINE_FAILED"
      | "ENGINE_CANCELLED"
      | "ENGINE_CLOSED",
  ) {
    super(code);
  }
}
