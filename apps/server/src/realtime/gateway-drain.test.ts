import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { io, type Socket } from "socket.io-client";
import { describe, expect, it, vi } from "vitest";
import { attachRealtime } from "./gateway.js";
import { RealtimeError, type RealtimeConnection } from "./contracts.js";
import type { RealtimeStore } from "./store.js";
function gate() {
  let release!: () => void, enter!: () => void;
  const blocked = new Promise<void>((r) => (release = r)),
    entered = new Promise<void>((r) => (enter = r));
  return {
    entered,
    release,
    wait: async () => {
      enter();
      await blocked;
    },
  };
}
const turn = () => new Promise<void>((r) => setImmediate(r));
async function fixture() {
  const server = createServer(),
    roomId = randomUUID(),
    userId = randomUUID(),
    clients: Socket[] = [];
  const networkClosed = new Promise<void>((r) => server.once("close", r));
  let stage: (name: string, token: string) => Promise<void> = async () => {};
  const snapshot = {
    roomId,
    version: 1,
    control: { mode: "writable", generation: 1, reason: null },
  };
  const resolve = vi.fn(async (token: string) => {
    await stage("provider", token);
    return { userId, kind: "member" as const };
  });
  const command = vi.fn(async (c: RealtimeConnection) => {
    await stage("command", c.proof!.accessToken);
    return { status: "ok", commandId: randomUUID(), snapshot };
  });
  const read = vi.fn(async (c: RealtimeConnection) => {
    await stage("snapshot", c.proof!.accessToken);
    return snapshot;
  });
  const connect = vi.fn(async (c: RealtimeConnection, takeover?: boolean) => {
    if (takeover) await stage("takeover", c.proof!.accessToken);
    return snapshot;
  });
  const disconnect = vi.fn(async () => {});
  const gateway = attachRealtime(server, {
    store: {
      command,
      snapshot: read,
      connect,
      disconnect,
      cleanupExpiredReceipts: async () => 0,
    } as unknown as RealtimeStore,
    identities: { resolve },
    corsOrigins: [],
  });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const address = server.address();
  if (!address || typeof address === "string") throw Error("fixture");
  async function peer(token = randomUUID(), waitSnapshot = true) {
    const socket = io(`http://127.0.0.1:${address.port}`, {
      autoConnect: false,
      transports: ["websocket"],
      reconnection: false,
      auth: {
        accessToken: token,
        appSession: "x".repeat(43),
        roomId,
        tabId: randomUUID(),
      },
    });
    clients.push(socket);
    const ready = new Promise<void>((r, j) => {
      socket.once(waitSnapshot ? "room.snapshot" : "connect", () => r());
      socket.once("connect_error", j);
    });
    socket.connect();
    await ready;
    return { socket, token };
  }
  const input = () => ({
    commandId: randomUUID(),
    roomId,
    expectedVersion: 1,
    action: { type: "room.ready", payload: { ready: true } },
  });
  return {
    gateway,
    networkClosed,
    peer,
    command,
    read,
    connect,
    resolve,
    disconnect,
    roomId,
    userId,
    input,
    setStage: (fn: typeof stage) => (stage = fn),
    close: async () => {
      clients.forEach((c) => c.disconnect());
      await gateway.close();
    },
  };
}
describe("native gateway all-operation shutdown drain", () => {
  it.each(["provider", "command", "takeover"] as const)(
    "waits for accepted %s work and refuses new publication/actions during stopping",
    async (kind) => {
      const f = await fixture(),
        blocked = gate();
      try {
        const peer = await f.peer();
        f.setStage(async (stage) => {
          if (stage === kind) await blocked.wait();
        });
        peer.socket.emit(
          kind === "takeover" ? "session.takeover" : "room.command",
          ...(kind === "takeover" ? [() => {}] : [f.input(), () => {}]),
        );
        await blocked.entered;
        let done = false;
        const closing = f.gateway.close().then(() => (done = true));
        await turn();
        await turn();
        expect(done).toBe(false);
        const reads = f.read.mock.calls.length,
          commands = f.command.mock.calls.length,
          takeovers = f.connect.mock.calls.length;
        await expect(
          f.gateway.publishSnapshots(f.roomId),
        ).rejects.toMatchObject({ code: "REALTIME_UNAVAILABLE" });
        await expect(
          f.gateway.publishRoomClosed(f.roomId, [f.userId]),
        ).rejects.toMatchObject({ code: "REALTIME_UNAVAILABLE" });
        peer.socket.emit("room.command", f.input(), () => {});
        await turn();
        expect(f.command).toHaveBeenCalledTimes(commands);
        expect(f.connect).toHaveBeenCalledTimes(takeovers);
        expect(f.read).toHaveBeenCalledTimes(reads);
        blocked.release();
        await closing;
        expect(done).toBe(true);
        expect(f.disconnect).toHaveBeenCalledOnce();
      } finally {
        blocked.release();
        await f.close();
      }
    },
  );
  it("drains initial private snapshot before returning close", async () => {
    const f = await fixture(),
      blocked = gate();
    try {
      f.setStage(async (stage) => {
        if (stage === "snapshot") await blocked.wait();
      });
      await f.peer(randomUUID(), false);
      await blocked.entered;
      let done = false;
      const closing = f.gateway.close().then(() => (done = true));
      await f.networkClosed;
      await turn();
      expect(done).toBe(false);
      blocked.release();
      await closing;
      expect(done).toBe(true);
    } finally {
      blocked.release();
      await f.close();
    }
  });
  it("drains every peer branch after external publication rejects early", async () => {
    const f = await fixture(),
      blocked = gate();
    try {
      const first = await f.peer(),
        second = await f.peer();
      await turn();
      f.setStage(async (stage, token) => {
        if (stage === "provider") {
          if (token === first.token)
            throw new RealtimeError(
              "REALTIME_UNAVAILABLE",
              "PRIVATE_PROVIDER_SECRET",
            );
          if (token === second.token) await blocked.wait();
        }
      });
      const publishing = f.gateway.publishSnapshots(f.roomId);
      await blocked.entered;
      await expect(publishing).rejects.toMatchObject({
        code: "REALTIME_UNAVAILABLE",
      });
      let done = false;
      const closing = f.gateway.close().then(() => (done = true));
      await f.networkClosed;
      await turn();
      expect(done).toBe(false);
      blocked.release();
      await closing;
      expect(done).toBe(true);
    } finally {
      blocked.release();
      await f.close();
    }
  });
  it("drains safe closed-room publication provider work", async () => {
    const f = await fixture(),
      blocked = gate();
    try {
      await f.peer();
      f.setStage(async (stage) => {
        if (stage === "provider") await blocked.wait();
      });
      const publishing = f.gateway.publishRoomClosed(f.roomId, [f.userId]);
      await blocked.entered;
      let done = false;
      const closing = f.gateway.close().then(() => (done = true));
      await f.networkClosed;
      await turn();
      expect(done).toBe(false);
      blocked.release();
      await publishing;
      await closing;
      expect(done).toBe(true);
    } finally {
      blocked.release();
      await f.close();
    }
  });
  it("drains nested notifyPreviousTabs work without self-await deadlock", async () => {
    const f = await fixture(),
      blocked = gate();
    try {
      const first = await f.peer(),
        second = await f.peer();
      await turn();
      f.setStage(async (stage, token) => {
        if (stage === "snapshot" && token === first.token) await blocked.wait();
      });
      second.socket.emit("session.takeover", () => {});
      await blocked.entered;
      let done = false;
      const closing = f.gateway.close().then(() => (done = true));
      await f.networkClosed;
      await turn();
      expect(done).toBe(false);
      blocked.release();
      await closing;
      expect(done).toBe(true);
    } finally {
      blocked.release();
      await f.close();
    }
  });
});
