// AI contracts — search input/result types.
// Populated by ISSUE-018+.

export type { Side, Position, Move } from './game.js';

export type SearchInput = {
  position: import('./game.js').Position;
  repetitionCounts: Record<string, number>;
  maxDepth: number;
  deadlineMonoMs: number;
  algorithm: 'MINIMAX' | 'ALPHA_BETA';
  seed: number;
};

export type SearchResult = {
  move: import('./game.js').Move | null;
  score: number;
  nodes: number;
  completedDepth: number;
  elapsedMs: number;
  pv: import('./game.js').Move[];
  aborted: boolean;
};
