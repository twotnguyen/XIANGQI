import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["apps/**/*.test.ts", "packages/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["packages/xiangqi-core/src/**/*.ts"],
      thresholds: { lines: 90 },
    },
  },
});
