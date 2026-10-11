import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { io, type Socket } from "socket.io-client";
import { describe, expect, it, vi } from "vitest";
import { attachRealtime } from "./gateway.js";
import { RealtimeError, type RealtimeConnection } from "./contracts.js";
import type { RealtimeStore } from "./store.js";
async function waitFor(read: () => boolean, timeout = 3500) {
  const until = Date.now() + timeout;
  while (Date.now() < until) {
    if (read()) return;
    await new Promise((r) => setTimeout(r, 20));
  }
  throw new Error("Synthetic session wait timed out");
}
async function fixture(check: (c: RealtimeConnection) => Promise<boolean>) {
  const roomId = randomUUID(),
    userId = randomUUID(),
    clients: Socket[] = [];
  const snapshot = {
    roomId,
    version: 1,
    control: { mode: "writable", generation: 1, reason: null },
  };
  const disconnected = vi.fn(async () => {}),
    read = vi.fn(async () => snapshot),
    resolve = vi.fn(async () => ({
      userId,
      kind: "member" as const,
    }));
  const server = createServer(),
    gateway = attachRealtime(server, {
      store: {
        connect: async () => snapshot,
        snapshot: read,
        disconnect: disconnected,
        cleanupExpiredReceipts: async () => 0,
      } as unknown as RealtimeStore,
      identities: { resolve, sessionActive: check },
      corsOrigins: [],
    });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const address = server.address();
  if (!address || typeof address === "string") throw Error("fixture");
  async function peer() {
    const socket = io(`http://127.0.0.1:${address.port}`, {
      autoConnect: false,
      transports: ["websocket"],
      reconnection: false,
      auth: {
        accessToken: "synthetic-bearer",
        appSession: "x".repeat(43),
        roomId,
        tabId: randomUUID(),
      },
    });
    clients.push(socket);
    const initial = new Promise<void>((r, j) => {
      socket.once("room.snapshot", () => r());
      socket.once("connect_error", j);
    });
    socket.connect();
    await initial;
    return socket;
  }
  return {
    gateway,
    peer,
    disconnected,
    read,
    resolve,
    clients,
    close: async () => {
      clients.forEach((c) => c.disconnect());
      await gateway.close();
    },
  };
}
describe("native gateway fixed appSession maintenance", () => {
  it("physically disconnects ended sessions and invokes existing presence cleanup", async () => {
    let active = true;
    const check = vi.fn(async () => active),
      f = await fixture(check);
    try {
      const socket = await f.peer();
      active = false;
      await waitFor(() => !socket.connected);
      await waitFor(() => f.disconnected.mock.calls.length === 1);
      expect(check).toHaveBeenCalled();
    } finally {
      await f.close();
    }
  }, 6000);
  it("keeps peers on SQL outage and never authorizes a private snapshot through the checker", async () => {
    const check = vi.fn(async () => {
        throw new RealtimeError("REALTIME_UNAVAILABLE", "PRIVATE_SQL_SECRET");
      }),
      f = await fixture(check);
    try {
      const socket = await f.peer();
      const reads = f.read.mock.calls.length,
        resolves = f.resolve.mock.calls.length;
      await waitFor(() => check.mock.calls.length > 0);
      expect(socket.connected).toBe(true);
      expect(f.disconnected).not.toHaveBeenCalled();
      expect(f.read).toHaveBeenCalledTimes(reads);
      expect(f.resolve).toHaveBeenCalledTimes(resolves);
    } finally {
      await f.close();
    }
  }, 6000);
  it("drains in-flight session SQL before close completes", async () => {
    let enter!: () => void, release!: () => void;
    const entered = new Promise<void>((r) => (enter = r)),
      blocked = new Promise<void>((r) => (release = r));
    const f = await fixture(async () => {
      enter();
      await blocked;
      return false;
    });
    try {
      await f.peer();
      await Promise.race([
        entered,
        new Promise((_, j) =>
          setTimeout(() => j(Error("No session scan")), 3500),
        ),
      ]);
      let done = false;
      const closing = f.gateway.close().then(() => (done = true));
      await new Promise((r) => setTimeout(r, 30));
      expect(done).toBe(false);
      release();
      await closing;
      expect(done).toBe(true);
    } finally {
      release();
      await f.close();
    }
  }, 6000);
  it("advances past fifty unavailable peers to a later ended session", async () => {
    let endedId = "";
    const check = vi.fn(async (connection: RealtimeConnection) => {
      if (connection.connectionId === endedId) return false;
      throw new Error("PRIVATE_SQL_SECRET");
    });
    const output = vi
      .spyOn(process.stderr, "write")
      .mockImplementation(() => true);
    const f = await fixture(check);
    try {
      for (let i = 0; i < 51; i++) await f.peer();
      // All peers share this native fixture room; get the actual Socket.io IDs.
      endedId = f.clients
        .map((c) => c.id!)
        .sort()
        .at(-1)!;
      await waitFor(() => check.mock.calls.length >= 50);
      expect(check.mock.calls.length).toBe(50);
      expect(f.disconnected).not.toHaveBeenCalled();
      await waitFor(() => f.disconnected.mock.calls.length === 1);
      expect(check.mock.calls.length).toBe(51);
      expect(f.clients.filter((c) => c.connected)).toHaveLength(50);
      expect(
        output.mock.calls.every(
          (call) => !String(call[0]).includes("PRIVATE_SQL_SECRET"),
        ),
      ).toBe(true);
    } finally {
      await f.close();
      output.mockRestore();
    }
  }, 7000);
});
