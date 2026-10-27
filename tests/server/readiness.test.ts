import { expect, it } from "vitest";
import { createApp } from "@server/app.js";

it("reports ready without configured dependencies and keeps /health as liveness", async () => {
  const app = await createApp();
  try {
    await app.listen(0, "127.0.0.1");
    const base = await app.getUrl();
    const ready = await fetch(`${base}/ready`);
    expect(ready.status).toBe(200);
    expect(await ready.json()).toEqual({
      status: "ready",
      database: "not_connected",
      runtime: "not_connected",
    });
    const health = await fetch(`${base}/health`);
    expect(health.status).toBe(200);
  } finally {
    await app.close();
  }
});

it("returns 503 from /ready when the database probe fails without leaking its message", async () => {
  const app = await createApp(undefined, [], async () => {
    throw new Error("fake-private-error");
  });
  try {
    await app.listen(0, "127.0.0.1");
    const response = await fetch(`${await app.getUrl()}/ready`);
    expect(response.status).toBe(503);
    const body = await response.json();
    expect(body).toEqual({
      status: "not_ready",
      database: "error",
      runtime: "not_connected",
    });
    expect(JSON.stringify(body)).not.toContain("fake-private-error");
  } finally {
    await app.close();
  }
});

it("returns 503 from /ready when the runtime is not ready and rejects mutations while /health stays 200", async () => {
  let ready = false;
  const app = await createApp(undefined, [], null, null, null, async () => {
    if (!ready) throw new Error("Room runtime is not ready");
  });
  try {
    await app.listen(0, "127.0.0.1");
    const base = await app.getUrl();
    const notReady = await fetch(`${base}/ready`);
    expect(notReady.status).toBe(503);
    expect(await notReady.json()).toEqual({
      status: "not_ready",
      database: "not_connected",
      runtime: "error",
    });
    const mutation = await fetch(`${base}/anything`, { method: "POST" });
    expect(mutation.status).toBe(503);
    expect(await mutation.json()).toMatchObject({
      code: "RUNTIME_UNAVAILABLE",
    });
    expect((await fetch(`${base}/health`)).status).toBe(200);

    ready = true;
    const recovered = await fetch(`${base}/ready`);
    expect(recovered.status).toBe(200);
    expect(await recovered.json()).toEqual({
      status: "ready",
      database: "not_connected",
      runtime: "ok",
    });
  } finally {
    await app.close();
  }
});
