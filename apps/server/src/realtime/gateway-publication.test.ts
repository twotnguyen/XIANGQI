import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { io, type Socket } from "socket.io-client";
import { describe, expect, it, vi } from "vitest";
import { attachRealtime } from "./gateway.js";
import { RealtimeError } from "./contracts.js";
import { RoomError } from "../room/contracts.js";
import type { RealtimeConnection } from "./contracts.js";
import type { ChatReadRequest } from "@xiangqi/shared";
import type { RealtimeStore } from "./store.js";
import type { CommandAcknowledgement } from "@xiangqi/shared";
async function fixture(chatEnabled = false) {
  const roomId = randomUUID(),
    users = new Map<string, string>(),
    clients: Socket[] = [];
  let providerFailure = false,
    membership = false,
    snapshotFailure = false,
    failAfterCommit = false;
  const snapshot = {
    roomId,
    version: 1,
    control: { mode: "writable", generation: 1, reason: null },
  };
  const chatDenied = new Set<string>();
  const chatRead = vi.fn(
    async (connection: RealtimeConnection, input: ChatReadRequest) => {
      if (chatDenied.has(connection.identity.userId))
        throw new RoomError("CHAT_FORBIDDEN", "private denied", 403);
      return {
        roomId,
        channel: input.channel,
        roomVersion: 1,
        scopeToken: "a".repeat(64),
        canSend: true,
        messages: [
          {
            messageId: randomUUID(),
            roomId,
            sequence: 1,
            channel: input.channel,
            content: "PRIVATE_CHAT_BODY",
            createdAt: new Date().toISOString(),
            sender: {
              displayName: "Synthetic",
              isGuest: false,
              role: "red" as const,
            },
          },
        ],
        nextCursor: 1,
        hasMore: false,
      };
    },
  );
  const resolve = vi.fn(async (token: string) => {
    if (providerFailure)
      throw new RealtimeError(
        "REALTIME_UNAVAILABLE",
        "PRIVATE_PROVIDER_SECRET",
      );
    const id = users.get(token);
    if (!id) throw new RealtimeError("AUTH_REQUIRED", "private");
    return { userId: id, kind: "member" as const };
  });
  const read = vi.fn(async () => {
    if (membership)
      throw new RealtimeError("ROOM_FORBIDDEN", "private membership");
    if (snapshotFailure) throw new Error("PRIVATE_SQL_SECRET");
    return snapshot;
  });
  const command = vi.fn(async () => {
    if (failAfterCommit) providerFailure = true;
    return {
      status: "error",
      commandId: randomUUID(),
      error: { code: "MATCH_TIME_EXPIRED", message: "Đã hết thời gian" },
      snapshot,
    };
  });
  const store = {
    connect: async () => snapshot,
    snapshot: read,
    command,
    disconnect: async () => {},
    cleanupExpiredReceipts: async () => 0,
  } as unknown as RealtimeStore;
  const server = createServer(),
    gateway = attachRealtime(server, {
      store,
      identities: { resolve },
      corsOrigins: [],
      ...(chatEnabled
        ? {
            chat: {
              read: chatRead,
              send: async () => ({
                messageId: randomUUID(),
                sequence: 1,
                createdAt: new Date().toISOString(),
              }),
            },
          }
        : {}),
    });
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const address = server.address();
  if (!address || typeof address === "string") throw Error("fixture");
  async function peer(targetRoom = roomId) {
    const userId = randomUUID(),
      token = randomUUID();
    users.set(token, userId);
    const client = io(`http://127.0.0.1:${address.port}`, {
      autoConnect: false,
      reconnection: false,
      transports: ["websocket"],
      auth: {
        accessToken: token,
        appSession: "x".repeat(43),
        roomId: targetRoom,
        tabId: randomUUID(),
      },
    });
    clients.push(client);
    const initial = new Promise<void>((r) =>
      client.once("room.snapshot", () => r()),
    );
    client.connect();
    await initial;
    return { client, userId, token };
  }
  return {
    roomId,
    users,
    gateway,
    server,
    peer,
    read,
    command,
    snapshot,
    resolve,
    chatRead,
    chatDenied,
    setProvider: (b: boolean) => (providerFailure = b),
    setMembership: (b: boolean) => (membership = b),
    setSnapshot: (b: boolean) => (snapshotFailure = b),
    setAfterCommit: () => (failAfterCommit = true),
    close: async () => {
      clients.forEach((c) => c.disconnect());
      await gateway.close();
    },
  };
}
describe("native realtime publication outcomes", () => {
  it("delivers chat invalidation only after per-recipient authorization without broadcasting private content", async () => {
    const f = await fixture(true);
    try {
      const allowed = await f.peer(),
        denied = await f.peer(),
        elsewhere = await f.peer(randomUUID());
      f.chatDenied.add(denied.userId);
      const blocked: unknown[] = [];
      denied.client.on("chat.changed", (value) => blocked.push(value));
      elsewhere.client.on("chat.changed", (value) => blocked.push(value));
      const received = new Promise<unknown>((r) =>
        allowed.client.once("chat.changed", r),
      );
      await f.gateway.publishChat(f.roomId, "PLAYERS_PRIVATE");
      expect(await received).toEqual({
        roomId: f.roomId,
        channel: "PLAYERS_PRIVATE",
        roomVersion: 1,
        scopeToken: "a".repeat(64),
        canSend: true,
      });
      expect(blocked).toEqual([]);
      expect(f.chatRead).toHaveBeenCalledTimes(2);
      const response = await allowed.client
        .timeout(1000)
        .emitWithAck("chat.read", { channel: "PLAYERS_PRIVATE" });
      expect(response).toMatchObject({
        status: "ok",
        value: { messages: [{ content: "PRIVATE_CHAT_BODY" }] },
      });
    } finally {
      await f.close();
    }
  });
  it("rejects chat publication when unavailable so a durable outbox can retry", async () => {
    const f = await fixture(true);
    try {
      await f.peer();
      f.chatRead.mockRejectedValue(new Error("PRIVATE_SQL_CHAT"));
      await expect(
        f.gateway.publishChat(f.roomId, "ROOM_PUBLIC"),
      ).rejects.toMatchObject({ code: "REALTIME_UNAVAILABLE" });
      await expect(
        f.gateway.publishChat(f.roomId, "ROOM_PUBLIC"),
      ).rejects.not.toThrow("PRIVATE");
    } finally {
      await f.close();
    }
  });
  it.each(["provider", "SQL"])(
    "rejects transient %s publication with a sanitized failure for outbox retry",
    async (kind) => {
      const f = await fixture();
      try {
        await f.peer();
        if (kind === "provider") f.setProvider(true);
        else f.setSnapshot(true);
        await expect(
          f.gateway.publishSnapshots(f.roomId),
        ).rejects.toMatchObject({ code: "REALTIME_UNAVAILABLE" });
        await expect(f.gateway.publishSnapshots(f.roomId)).rejects.not.toThrow(
          "PRIVATE",
        );
      } finally {
        await f.close();
      }
    },
  );
  it("acknowledges a committed terminal error even if subsequent publication fails", async () => {
    const f = await fixture(),
      log = vi.spyOn(process.stderr, "write").mockImplementation(() => true);
    try {
      const p = await f.peer();
      f.setAfterCommit();
      const result = await new Promise<CommandAcknowledgement>(
        (resolve, reject) =>
          p.client.timeout(1000).emit(
            "room.command",
            {
              roomId: f.roomId,
              commandId: randomUUID(),
              expectedVersion: 1,
              action: { type: "room.ready", payload: { ready: true } },
            },
            (error: Error | null, response: CommandAcknowledgement) =>
              error ? reject(error) : resolve(response),
          ),
      );
      expect(result).toMatchObject({
        status: "error",
        error: { code: "MATCH_TIME_EXPIRED" },
        snapshot: { version: 1 },
      });
      expect(f.command).toHaveBeenCalledOnce();
      expect(log.mock.calls.flat().join(" ")).not.toContain("PRIVATE");
    } finally {
      log.mockRestore();
      await f.close();
    }
  });
  it("delivers only a literal terminal notice to trusted recipients after membership was removed", async () => {
    const f = await fixture();
    try {
      const recipient = await f.peer(),
        excluded = await f.peer(),
        otherRoom = await f.peer(randomUUID());
      const notices: unknown[] = [];
      excluded.client.on("room.closed", (n) => notices.push(n));
      otherRoom.client.on("room.closed", (n) => notices.push(n));
      const received = new Promise<unknown>((r) =>
        recipient.client.once("room.closed", r),
      );
      const reads = f.read.mock.calls.length;
      f.setMembership(true);
      await f.gateway.publishRoomClosed(f.roomId, [
        recipient.userId,
        otherRoom.userId,
      ]);
      expect(await received).toEqual({
        roomId: f.roomId,
        message: "Phòng đã đóng",
      });
      expect(f.read).toHaveBeenCalledTimes(reads);
      expect(notices).toEqual([]);
    } finally {
      await f.close();
    }
  });
  it("skips and disconnects a revoked recipient and retries an unavailable provider", async () => {
    const f = await fixture();
    try {
      const p = await f.peer();
      f.setMembership(true);
      f.setProvider(true);
      await expect(
        f.gateway.publishRoomClosed(f.roomId, [p.userId]),
      ).rejects.toMatchObject({ code: "REALTIME_UNAVAILABLE" });
      f.setProvider(false);
      f.users.delete(p.token);
      const closed = new Promise<void>((r) =>
        p.client.once("disconnect", () => r()),
      );
      const notices: unknown[] = [];
      p.client.on("room.closed", (n) => notices.push(n));
      await f.gateway.publishRoomClosed(f.roomId, [p.userId]);
      await closed;
      expect(notices).toEqual([]);
    } finally {
      await f.close();
    }
  });
});

async function sync(client: Socket) {
  return new Promise<CommandAcknowledgement>((resolve, reject) =>
    client
      .timeout(250)
      .emit(
        "room.sync",
        (error: Error | null, response: CommandAcknowledgement) =>
          error ? reject(error) : resolve(response),
      ),
  );
}
it("resynchronizes a readonly peer from a freshly authorized snapshot without executing a command", async () => {
  const f = await fixture();
  try {
    const peer = await f.peer();
    f.snapshot.version = 9;
    f.snapshot.control.mode = "readonly";
    const resolves = f.resolve.mock.calls.length;
    const response = await sync(peer.client);
    expect(response).toMatchObject({
      status: "ok",
      snapshot: { roomId: f.roomId, version: 9, control: { mode: "readonly" } },
    });
    expect(f.resolve.mock.calls.length).toBeGreaterThan(resolves);
    expect(f.command).not.toHaveBeenCalled();
  } finally {
    await f.close();
  }
});
it.each(["provider", "SQL", "membership"])(
  "sanitizes %s failures when resynchronizing instead of returning a stale snapshot",
  async (kind) => {
    const f = await fixture();
    try {
      const peer = await f.peer();
      if (kind === "provider") f.setProvider(true);
      else if (kind === "SQL") f.setSnapshot(true);
      else f.setMembership(true);
      const response = await sync(peer.client);
      expect(response.status).toBe("error");
      expect(response).not.toHaveProperty("snapshot");
      expect(JSON.stringify(response)).not.toContain("PRIVATE");
      expect(f.command).not.toHaveBeenCalled();
    } finally {
      await f.close();
    }
  },
);

it("drains an in-flight snapshot resynchronization before closing its service", async () => {
  const f = await fixture();
  let release!: () => void;
  let entered!: () => void;
  const barrier = new Promise<void>((resolve) => {
    release = resolve;
  });
  const started = new Promise<void>((resolve) => {
    entered = resolve;
  });
  const peer = await f.peer();
  f.read.mockImplementationOnce(async () => {
    entered();
    await barrier;
    return f.snapshot;
  });
  const pending = sync(peer.client).catch(() => null);
  await started;
  let closed = false;
  const transportClosed = new Promise<void>((resolve) =>
    f.server.once("close", resolve),
  );
  const closing = f.close().then(() => {
    closed = true;
  });
  try {
    await transportClosed;
    await Promise.resolve();
    expect(closed).toBe(false);
  } finally {
    release();
    await closing;
    await pending;
  }
  expect(closed).toBe(true);
});
