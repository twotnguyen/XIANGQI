import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { io } from "socket.io-client";
import { describe, expect, it, vi } from "vitest";
import { attachRealtime } from "./gateway.js";
import type { RealtimeStore } from "./store.js";
import type { RealtimeConnection } from "./contracts.js";
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
  const disconnected = vi.fn<(connection: RealtimeConnection) => Promise<void>>(
    async () => {
      cleaned.release();
      await cleanup.promise;
    },
  );
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
  it("retries a failed physical disconnect without credentials and clears it after success", async () => {
    const f = await fixture();
    const log = vi
      .spyOn(process.stderr, "write")
      .mockImplementation(() => true);
    f.disconnected.mockRejectedValueOnce(new Error("PRIVATE_DATABASE_SECRET"));
    f.connect.release();
    f.cleanup.release();
    const snapshot = new Promise<void>((r) =>
      f.client.once("room.snapshot", () => r()),
    );
    try {
      f.client.connect();
      await snapshot;
      f.client.disconnect();
      await f.networkClosed.promise;
      await new Promise((r) => setTimeout(r, 1100));
      expect(f.disconnected).toHaveBeenCalledTimes(2);
      expect(f.disconnected.mock.calls[0]![0]).not.toHaveProperty("proof");
      expect(log.mock.calls.flat().join(" ")).not.toContain(
        "PRIVATE_DATABASE_SECRET",
      );
      await f.gateway.close();
      expect(f.disconnected).toHaveBeenCalledTimes(2);
    } finally {
      log.mockRestore();
      f.cleanup.release();
      f.client.disconnect();
      await f.gateway.close();
    }
  });
  it("close drains a running retry and does not duplicate a successful cleanup", async () => {
    const f = await fixture();
    const log = vi
      .spyOn(process.stderr, "write")
      .mockImplementation(() => true);
    f.disconnected.mockRejectedValueOnce(new Error("PRIVATE_DATABASE_SECRET"));
    f.connect.release();
    const snapshot = new Promise<void>((r) =>
      f.client.once("room.snapshot", () => r()),
    );
    let closing: Promise<void> | undefined;
    try {
      f.client.connect();
      await snapshot;
      f.client.disconnect();
      await f.networkClosed.promise;
      await new Promise((r) => setTimeout(r, 1100));
      expect(f.disconnected).toHaveBeenCalledTimes(2);
      let closed = false;
      closing = f.gateway.close().then(() => {
        closed = true;
      });
      await turn();
      expect(closed).toBe(false);
      f.cleanup.release();
      await closing;
      await f.gateway.close();
      expect(f.disconnected).toHaveBeenCalledTimes(2);
    } finally {
      log.mockRestore();
      f.cleanup.release();
      f.client.disconnect();
      await (closing ?? f.gateway.close());
    }
  });
  it("close stops retry timers and attempts a persistent failure only once more", async () => {
    const f = await fixture();
    const log = vi
      .spyOn(process.stderr, "write")
      .mockImplementation(() => true);
    f.disconnected.mockRejectedValue(new Error("PRIVATE_DATABASE_SECRET"));
    f.connect.release();
    f.cleanup.release();
    const snapshot = new Promise<void>((r) =>
      f.client.once("room.snapshot", () => r()),
    );
    try {
      f.client.connect();
      await snapshot;
      f.client.disconnect();
      await f.networkClosed.promise;
      await turn();
      expect(f.disconnected).toHaveBeenCalledOnce();
      await f.gateway.close();
      await f.gateway.close();
      expect(f.disconnected).toHaveBeenCalledTimes(2);
      await new Promise((r) => setTimeout(r, 1100));
      expect(f.disconnected).toHaveBeenCalledTimes(2);
      expect(f.disconnected.mock.calls[0]![0]).not.toHaveProperty("proof");
      expect(log.mock.calls.flat().join(" ")).not.toContain(
        "PRIVATE_DATABASE_SECRET",
      );
    } finally {
      log.mockRestore();
      f.client.disconnect();
      await f.gateway.close();
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
