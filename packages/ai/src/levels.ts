/**
 * Difficulty levels configuration for AI player.
 * Spec:
 * - EASY: maxDepth 2, budget 300ms
 * - MEDIUM: maxDepth 4, budget 1000ms
 * - HARD: maxDepth 6, budget 3000ms
 */
import type { AiLevel } from '@xiangqi/contracts';

export interface LevelConfig {
  level: AiLevel;
  maxDepth: number;
  timeBudgetMs: number;
}

export const LEVEL_CONFIGS: Record<AiLevel, LevelConfig> = {
  EASY: {
    level: 'EASY',
    maxDepth: 2,
    timeBudgetMs: 300,
  },
  MEDIUM: {
    level: 'MEDIUM',
    maxDepth: 4,
    timeBudgetMs: 1000,
  },
  HARD: {
    level: 'HARD',
    maxDepth: 6,
    timeBudgetMs: 3000,
  },
};

export function getLevelConfig(level: AiLevel): LevelConfig {
  return LEVEL_CONFIGS[level];
}
