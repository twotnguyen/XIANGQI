import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { Server } from "socket.io";
import { io } from "socket.io-client";
import { expect, it, vi } from "vitest";
import { RoomError } from "../room/contracts.js";
import type { RealtimeConnection } from "../realtime/contracts.js";
import { bindRoomChat } from "./chat-gateway.js";

async function fixture() {
  const server = createServer(),
    sockets = new Server(server);
  const connection: RealtimeConnection = {
    identity: { userId: randomUUID(), kind: "member" },
    roomId: randomUUID(),
    tabId: randomUUID(),
    connectionId: "trusted-connection",
  };
  const sent = {
    messageId: randomUUID(),
    sequence: 1,
    createdAt: new Date().toISOString(),
  };
  const page = {
    roomId: connection.roomId,
    channel: "ROOM_PUBLIC" as const,
    roomVersion: 1,
    scopeToken: "a".repeat(64),
    canSend: true,
    messages: [],
    nextCursor: 0,
    hasMore: false,
  };
  const authorize = vi.fn(async () => connection),
    read = vi.fn(async () => page),
    send = vi.fn(async () => sent),
    changed = vi.fn(async () => {});
  let stopping = false;
  const operations = new Set<Promise<unknown>>();
  sockets.on("connection", (socket) =>
    bindRoomChat(socket, {
      authorize,
      chat: { read, send },
      changed,
      stopping: () => stopping,
      track: (work) => {
        const p = work();
        operations.add(p);
        void p.finally(() => operations.delete(p));
        return p;
      },
    }),
  );
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  const address = server.address();
  if (!address || typeof address === "string") throw Error("fixture");
  const client = io(`http://127.0.0.1:${address.port}`, {
    transports: ["websocket"],
    reconnection: false,
  });
  await new Promise<void>((r) => client.once("connect", r));
  return {
    client,
    connection,
    sent,
    page,
    authorize,
    read,
    send,
    changed,
    stop: () => {
      stopping = true;
    },
    close: async () => {
      client.disconnect();
      await Promise.allSettled(operations);
      await new Promise<void>((r) => sockets.close(() => r()));
    },
  };
}
it("binds reads and writes to the trusted connection and returns canonical committed values", async () => {
  const f = await fixture();
  try {
    const input = { channel: "ROOM_PUBLIC", after: 0 };
    expect(
      await f.client.timeout(1000).emitWithAck("chat.read", input),
    ).toEqual({ status: "ok", value: f.page });
    expect(f.read).toHaveBeenCalledWith(f.connection, input);
    const command = {
      channel: "ROOM_PUBLIC",
      content: "xin chào",
      commandId: randomUUID(),
    };
    expect(
      await f.client.timeout(1000).emitWithAck("chat.send", command),
    ).toEqual({ status: "ok", value: f.sent });
    expect(f.send).toHaveBeenCalledWith(f.connection, command);
    expect(f.authorize).toHaveBeenCalledTimes(2);
  } finally {
    await f.close();
  }
});
it("never acknowledges an uncommitted send and preserves its committed ACK during publication failure", async () => {
  const f = await fixture();
  let commit!: () => void;
  const committed = new Promise<void>((r) => {
    commit = r;
  });
  f.send.mockImplementation(async () => {
    await committed;
    return f.sent;
  });
  f.changed.mockRejectedValue(new Error("PRIVATE_PUBLICATION_PAYLOAD"));
  try {
    let acknowledged = false;
    const response = f.client
      .timeout(1000)
      .emitWithAck("chat.send", {
        channel: "ROOM_PUBLIC",
        content: "private content",
        commandId: randomUUID(),
      })
      .then((r) => {
        acknowledged = true;
        return r;
      });
    await vi.waitFor(() => expect(f.send).toHaveBeenCalledOnce());
    expect(acknowledged).toBe(false);
    commit();
    expect(await response).toEqual({ status: "ok", value: f.sent });
    await vi.waitFor(() =>
      expect(f.changed).toHaveBeenCalledWith(
        f.connection.roomId,
        "ROOM_PUBLIC",
      ),
    );
  } finally {
    commit();
    await f.close();
  }
});
it.each(["chat.read", "chat.send"])(
  "sanitizes unknown failures and reauthorizes %s",
  async (event) => {
    const f = await fixture();
    try {
      f.authorize.mockRejectedValue(new Error("PRIVATE_TOKEN_AND_CHAT"));
      const response = await f.client.timeout(1000).emitWithAck(event, {});
      expect(response).toEqual({
        status: "error",
        error: { code: "REALTIME_UNAVAILABLE", message: "Chat chưa sẵn sàng" },
      });
      expect(f.read).not.toHaveBeenCalled();
      expect(f.send).not.toHaveBeenCalled();
    } finally {
      await f.close();
    }
  },
);
it("returns safe rate errors without publishing or leaking raw error details", async () => {
  const f = await fixture();
  try {
    f.send.mockRejectedValue(
      new RoomError("CHAT_RATE_LIMITED", "PRIVATE_RAW_MESSAGE", 429),
    );
    expect(await f.client.timeout(1000).emitWithAck("chat.send", {})).toEqual({
      status: "error",
      error: { code: "CHAT_RATE_LIMITED", message: "Bạn gửi quá nhanh" },
    });
    expect(f.changed).not.toHaveBeenCalled();
  } finally {
    await f.close();
  }
});
it("rejects shutdown work before authorization and ignores requests without an ACK callback", async () => {
  const f = await fixture();
  try {
    f.client.emit("chat.send", {});
    f.stop();
    expect(
      await f.client.timeout(1000).emitWithAck("chat.read", {}),
    ).toMatchObject({ status: "error" });
    expect(f.authorize).not.toHaveBeenCalled();
  } finally {
    await f.close();
  }
});
