import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const src = (path: string) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  resolve: {
    // Chỉ dùng trong tests/: trỏ thẳng vào mã nguồn (mã nguồn vẫn import tương đối).
    alias: {
      "@server": src("./apps/server/src"),
      "@web": src("./apps/web/src"),
      "@core": src("./packages/xiangqi-core/src"),
      "@engine": src("./packages/engine/src"),
      "@shared": src("./packages/shared/src"),
    },
  },
  test: {
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      include: ["packages/xiangqi-core/src/**/*.ts"],
      thresholds: { lines: 90 },
    },
  },
});
