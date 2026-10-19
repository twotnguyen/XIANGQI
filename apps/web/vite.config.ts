import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: {
    allowedHosts:
      loadEnv(mode, process.cwd(), "DEV_")
        .DEV_ALLOWED_HOSTS?.split(",")
        .map((host) => host.trim())
        .filter(Boolean) ?? [],
  },
  resolve: {
    alias: {
      "@xiangqi/engine": path.resolve(
        __dirname,
        "../../packages/engine/src/search.ts",
      ),
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
}));
