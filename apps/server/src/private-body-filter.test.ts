import { afterAll, beforeAll, expect, it } from "vitest";
import { createApp } from "./app.js";

let app: Awaited<ReturnType<typeof createApp>>, base: string;
beforeAll(async () => {
  app = await createApp();
  await app.listen(0, "127.0.0.1");
  base = `http://127.0.0.1:${app.getHttpServer().address().port}`;
});
afterAll(() => app.close());
it.each(["/ai", "/ai/current", "/history", "/history/ranked-summary"])(
  "sanitizes body-parser failures before %s controllers and disables caching",
  async (path) => {
    const response = await fetch(base + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: "fixture-private-password-not-json",
    });
    expect(response.status).toBe(400);
    expect(response.headers.get("cache-control")).toBe("no-store");
    expect(await response.json()).toEqual({
      code: path.startsWith("/ai")
        ? "AI_INPUT_INVALID"
        : "HISTORY_INPUT_INVALID",
      message: "Dữ liệu yêu cầu không hợp lệ",
    });
  },
);
it("preserves health behavior outside the protected API paths", async () => {
  const response = await fetch(base + "/health");
  expect(response.status).toBe(200);
  expect(await response.json()).toEqual({
    server: "ok",
    database: "not_connected",
    engine: "not_connected",
  });
});
it("does not classify /ai-other as the AI API", async () => {
  const response = await fetch(base + "/ai-other");
  expect(response.status).toBe(404);
  expect(response.headers.get("cache-control")).toBeNull();
});
