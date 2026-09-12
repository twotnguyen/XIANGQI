import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    include: ['tests/unit/**/*.test.ts'],
    globals: false,
  },
  resolve: {
    alias: {
      '@xiangqi/contracts': path.resolve(__dirname, 'packages/contracts/src'),
      '@xiangqi/game-rules': path.resolve(__dirname, 'packages/game-rules/src'),
      '@xiangqi/ai': path.resolve(__dirname, 'packages/ai/src'),
    },
  },
});
