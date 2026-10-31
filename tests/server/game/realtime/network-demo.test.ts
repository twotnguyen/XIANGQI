import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { Server } from "socket.io";
import { io, type Socket } from "socket.io-client";
import { describe, expect, it } from "vitest";
import { bindNetworkDemo } from "@server/game/realtime/network-demo.js";

async function fixture(env: Record<string, string | undefined>) {
  const server = createServer();
  const gateway = new Server(server);
  gateway.on("connection", (socket) => {
    bindNetworkDemo(socket, {
      env,
      authorize: async () => ({
        role: socket.handshake.auth.role,
        control: { mode: "writable" },
        match: { status: "ACTIVE" },
      }),
    });
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string") throw Error("address");
  const port = address.port;
  const clients: Socket[] = [];
  async function peer(role = "red") {
    const socket = io(`http://127.0.0.1:${port}`, {
      auth: { role },
      forceNew: true,
    });
    clients.push(socket);
    await new Promise<void>((resolve, reject) => {
      socket.once("connect", resolve);
      socket.once("connect_error", reject);
    });
    return socket;
  }
  return {
    peer,
    close: async () => {
      clients.forEach((socket) => socket.disconnect());
      await new Promise<void>((resolve) => gateway.close(() => resolve()));
    },
  };
}

function request(
  socket: Socket,
  event: string,
  payload?: unknown,
): Promise<unknown> {
  return new Promise((resolve, reject) =>
    socket
      .timeout(2000)
      .emit(event, payload, (error: Error | null, value: unknown) =>
        error ? reject(error) : resolve(value),
      ),
  );
}

describe("network demo socket boundary", () => {
  for (const env of [
    { NODE_ENV: "development" },
    { NODE_ENV: "production", NETWORK_DEMO: "true" },
  ]) {
    it(`rejects a direct command when disabled (${JSON.stringify(env)})`, async () => {
      const f = await fixture(env);
      try {
        const socket = await f.peer();
        expect(await request(socket, "demo.capability")).toEqual({
          enabled: false,
        });
        expect(
          await request(socket, "demo.disconnect", { target: randomUUID() }),
        ).toEqual({ ok: false });
        expect(socket.connected).toBe(true);
      } finally {
        await f.close();
      }
    });
  }
  it("disconnects only its own socket, waits for explicit reconnect, and preserves other sockets", async () => {
    const f = await fixture({ NODE_ENV: "development", NETWORK_DEMO: "true" });
    try {
      const actor = await f.peer(),
        sameActor = await f.peer(),
        opponent = await f.peer("black");
      expect(await request(actor, "demo.capability")).toEqual({
        enabled: true,
      });
      const disconnected = new Promise<string>((resolve) =>
        actor.once("disconnect", resolve),
      );
      expect(
        await request(actor, "demo.disconnect", { target: opponent.id }),
      ).toEqual({ ok: true });
      expect(await disconnected).toBe("io server disconnect");
      // Real Socket.IO reconnect timers must elapse to verify that no retry occurs.
      await new Promise((resolve) => setTimeout(resolve, 1200));
      expect(actor.connected).toBe(false);
      expect(sameActor.connected).toBe(true);
      expect(opponent.connected).toBe(true);
      const reconnected = new Promise<void>((resolve) =>
        actor.once("connect", resolve),
      );
      actor.connect();
      await reconnected;
      expect(actor.connected).toBe(true);
    } finally {
      await f.close();
    }
  });
  it("does not let spectators use the command", async () => {
    const f = await fixture({ NODE_ENV: "development", NETWORK_DEMO: "true" });
    try {
      const socket = await f.peer("spectator");
      expect(await request(socket, "demo.capability")).toEqual({
        enabled: false,
      });
      expect(await request(socket, "demo.disconnect")).toEqual({ ok: false });
      expect(socket.connected).toBe(true);
    } finally {
      await f.close();
    }
  });
});
