import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@xiangqi/engine": path.resolve(__dirname, "../../packages/engine/src/search.ts"),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules/livekit-client")) return "livekit";
        },
      },
    },
  },
});
