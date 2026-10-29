import { createServer } from "node:http";
import { once } from "node:events";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import { afterEach, expect, it, vi } from "vitest";
import { createServer as createViteServer, type ViteDevServer } from "vite";

afterEach(() => vi.unstubAllEnvs());

it("keeps Google cookies on the public API path and forwards the original origin", async () => {
  const backend = createServer((request, response) => {
    if (request.url === "/auth/google/challenge") {
      response.setHeader(
        "Set-Cookie",
        "xiangqi_google_challenge=proof; Path=/auth/google; HttpOnly; SameSite=Lax",
      );
      response.end();
      return;
    }
    response.setHeader("Content-Type", "application/json");
    response.end(
      JSON.stringify({
        path: request.url,
        origin: request.headers.origin,
        cookie: request.headers.cookie,
      }),
    );
  });
  const listening = once(backend, "listening");
  backend.listen(0, "127.0.0.1");
  await listening;
  const address = backend.address();
  if (!address || typeof address === "string") throw new Error("Missing port");
  vi.stubEnv("PORT", String(address.port));
  const webRoot = fileURLToPath(new URL("../../../apps/web/", import.meta.url));
  let web: ViteDevServer | undefined;
  try {
    web = await createViteServer({
      root: webRoot,
      configFile: `${webRoot}vite.config.ts`,
      server: { host: "127.0.0.1", port: 0, hmr: false, watch: null },
      logLevel: "silent",
    });
    await web.listen();
    const webAddress = web.httpServer!.address();
    if (!webAddress || typeof webAddress === "string")
      throw new Error("Missing web port");
    const origin = `http://127.0.0.1:${webAddress.port}`;
    const challenge = await fetch(`${origin}/api/auth/google/challenge`, {
      method: "POST",
      headers: { Origin: origin },
    });
    expect(challenge.headers.get("set-cookie")).toBe(
      "xiangqi_google_challenge=proof; Path=/api/auth/google; HttpOnly; SameSite=Lax",
    );
    await challenge.text();
    const authentication = await fetch(
      `${origin}/api/auth/google/authenticate`,
      {
        method: "POST",
        headers: { Origin: origin, Cookie: "xiangqi_google_challenge=proof" },
      },
    );
    expect(await authentication.json()).toEqual({
      path: "/auth/google/authenticate",
      origin,
      cookie: "xiangqi_google_challenge=proof",
    });
  } finally {
    await web?.close();
    const closed = promisify(backend.close.bind(backend))();
    backend.closeAllConnections();
    await closed;
  }
});
