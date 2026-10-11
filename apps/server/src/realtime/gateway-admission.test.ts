import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { io } from "socket.io-client";
import { describe, expect, it, vi } from "vitest";
import { attachRealtime } from "./gateway.js";
import type { RealtimeStore } from "./store.js";
function gate() {
  let release!: () => void;
  const promise = new Promise<void>((resolve) => (release = resolve));
  return { promise, release };
}
async function fixture(maintenance = async () => 0) {
  const admitted = gate(),
    connect = gate(),
    cleaned = gate(),
    cleanup = gate();
  const roomId = randomUUID(),
    userId = randomUUID();
  const disconnected = vi.fn(async () => {
    cleaned.release();
    await cleanup.promise;
  });
  const snapshot = {
    version: 1,
    control: { mode: "writable", generation: 1, reason: null },
  };
  const store = {
    snapshot: vi.fn(async () => snapshot),
    connect: vi.fn(async () => {
      admitted.release();
      await connect.promise;
      return snapshot;
    }),
    disconnect: disconnected,
    cleanupExpiredReceipts: maintenance,
  } as unknown as RealtimeStore;
  const server = createServer(),
    networkClosed = gate();
  server.once("connection", (transport) =>
    transport.once("close", networkClosed.release),
  );
  const gateway = attachRealtime(server, {
    store,
    corsOrigins: [],
    identities: { resolve: async () => ({ userId, kind: "member" }) },
  });
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  const address = server.address();
  if (!address || typeof address === "string")
    throw new Error("Missing fixture address");
  const client = io(`http://127.0.0.1:${address.port}`, {
    autoConnect: false,
    reconnection: false,
    transports: ["websocket"],
    auth: {
      accessToken: "synthetic",
      appSession: "x".repeat(43),
      roomId,
      tabId: randomUUID(),
    },
  });
  client.on("connect_error", () => {});
  return {
    gateway,
    client,
    admitted,
    connect,
    cleaned,
    cleanup,
    disconnected,
    networkClosed,
    roomId,
  };
}
const turn = () => new Promise<void>((resolve) => setImmediate(resolve));
describe("native Socket.IO aborted admissions and shutdown drain", () => {
  it("cleans a committed admission after transport abort without registering a ghost peer", async () => {
    const f = await fixture();
    f.cleanup.release();
    try {
      f.client.connect();
      await f.admitted.promise;
      f.client.disconnect();
      await f.networkClosed.promise;
      f.connect.release();
      await turn();
      await turn();
      expect(f.disconnected).toHaveBeenCalledOnce();
      expect(f.gateway.connections(f.roomId)).toEqual([]);
    } finally {
      f.client.disconnect();
      f.connect.release();
      f.cleanup.release();
      await f.gateway.close();
    }
    expect(f.disconnected).toHaveBeenCalledOnce();
  });
  it("close waits for in-flight admission and its fenced cleanup before returning", async () => {
    const f = await fixture();
    f.client.connect();
    await f.admitted.promise;
    let closed = false;
    const closing = f.gateway.close().then(() => {
      closed = true;
    });
    try {
      await f.networkClosed.promise;
      await turn();
      expect(closed).toBe(false);
      f.connect.release();
      await turn();
      await turn();
      expect(f.disconnected).toHaveBeenCalledOnce();
      expect(closed).toBe(false);
      f.cleanup.release();
      await closing;
      expect(f.gateway.connections(f.roomId)).toEqual([]);
      expect(f.disconnected).toHaveBeenCalledOnce();
    } finally {
      f.connect.release();
      f.cleanup.release();
      f.client.disconnect();
      await closing;
    }
  });
  it("cleans a connected peer once across namespace and transport close and repeated shutdown", async () => {
    const f = await fixture();
    f.connect.release();
    const snapshot = new Promise<void>((resolve) =>
      f.client.once("room.snapshot", () => resolve()),
    );
    f.client.connect();
    await snapshot;
    let closed = false;
    const closing = f.gateway.close().then(() => {
      closed = true;
    });
    const repeated = f.gateway.close();
    try {
      await f.cleaned.promise;
      await turn();
      expect(f.disconnected).toHaveBeenCalledOnce();
      expect(closed).toBe(false);
      f.cleanup.release();
      await closing;
      await repeated;
      expect(f.disconnected).toHaveBeenCalledOnce();
      expect(f.gateway.connections(f.roomId)).toEqual([]);
    } finally {
      f.cleanup.release();
      f.client.disconnect();
      await closing;
    }
  });
  it("close drains initial receipt maintenance before a borrowed pool may be closed", async () => {
    const maintenance = gate(),
      f = await fixture(async () => {
        await maintenance.promise;
        return 0;
      });
    let closed = false;
    const closing = f.gateway.close().then(() => {
      closed = true;
    });
    try {
      await turn();
      await turn();
      expect(closed).toBe(false);
      maintenance.release();
      await closing;
    } finally {
      maintenance.release();
      f.client.disconnect();
      await closing;
    }
  });
});
