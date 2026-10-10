import { expect, it } from "vitest";
import { createApp } from "./app.js";

it("serves real HTTP health without claiming database or engine connectivity", async () => {
  const app = await createApp();
  try {
    await app.listen(0, "127.0.0.1");
    const response = await fetch(`${await app.getUrl()}/health`);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      server: "ok",
      database: "not_connected",
      engine: "not_connected",
    });
  } finally {
    await app.close();
  }
});

it("denies Socket.IO handshake until realtime authentication is integrated", async () => {
  const app = await createApp();
  try {
    await app.listen(0, "127.0.0.1");
    const response = await fetch(
      `${await app.getUrl()}/socket.io/?EIO=4&transport=polling`,
    );
    expect(response.status).toBe(403);
  } finally {
    await app.close();
  }
});
