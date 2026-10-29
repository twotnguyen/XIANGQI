import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const proxy = {
    "/api": {
      target: `http://127.0.0.1:${env.PORT || "3000"}`,
      ws: true,
      rewrite: (url: string) => url.replace(/^\/api(?=\/|$)/, ""),
      cookiePathRewrite: { "/auth/google": "/api/auth/google" },
    },
  };
  return {
    plugins: [react()],
    server: {
      proxy,
      allowedHosts:
        env.DEV_ALLOWED_HOSTS?.split(",")
          .map((host) => host.trim())
          .filter(Boolean) ?? [],
    },
    preview: { proxy },
    resolve: {
      alias: {
        "@xiangqi/xiangqi-core": path.resolve(
          __dirname,
          "../../packages/xiangqi-core/src/index.ts",
        ),
        "@xiangqi/shared": path.resolve(
          __dirname,
          "../../packages/shared/src/index.ts",
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
  };
});
