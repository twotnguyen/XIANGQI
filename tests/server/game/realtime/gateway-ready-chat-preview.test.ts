import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { randomUUID } from "node:crypto";
import { io, type Socket } from "socket.io-client";
import { describe, expect, it } from "vitest";
import type {
  ChatSent,
  CommandAcknowledgement,
  RoomSnapshot,
} from "@xiangqi/shared";
import { attachRealtime } from "@server/game/realtime/gateway.js";
import type { RealtimeConnection } from "@server/game/realtime/realtime.types.js";
import type { RealtimeStore } from "@server/game/realtime/store.js";

type Role = "red" | "black" | "spectator";
const roomId = randomUUID(),
  hostId = randomUUID();
function once(socket: Socket, event: string) {
  const { promise, resolve } = Promise.withResolvers<unknown>();
  socket.once(event, resolve);
  return promise;
}

async function setup(outcome: "ok" | "error") {
  const roles = new Map<string, Role>(),
    users = new Map<string, string>();
  const gate = Promise.withResolvers<void>();
  const snapshotFor = (userId: string) => {
    const role = roles.get(userId)!;
    return {
      roomId,
      version: 1,
      role,
      room: {
        status: "WAITING",
        hostId,
        countdown: null,
        seatPlayers: {
          red: { userId: hostId, displayName: "Chủ phòng", guest: false },
          black: { userId: "b", displayName: "Khách mời", guest: false },
        },
        spectators: [],
      },
      control: { mode: "writable", generation: 1, reason: null },
      match: null,
    } as unknown as RoomSnapshot;
  };
  const store = {
    connect: async (c: RealtimeConnection) => snapshotFor(c.identity.userId),
    snapshot: async (c: RealtimeConnection) => snapshotFor(c.identity.userId),
    command: async (c: RealtimeConnection): Promise<CommandAcknowledgement> => {
      await gate.promise;
      return outcome === "ok"
        ? {
            status: "ok",
            commandId: randomUUID(),
            snapshot: snapshotFor(c.identity.userId),
          }
        : {
            status: "error",
            error: { code: "READY_DENIED", message: "từ chối" },
          };
    },
    disconnect: async () => {},
    cleanupExpiredReceipts: async () => 0,
  } as unknown as RealtimeStore;
  const server = createServer(),
    gateway = attachRealtime(server, {
      store,
      identities: {
        resolve: async (proof) => ({
          userId: users.get("accessToken" in proof ? proof.accessToken : "")!,
          kind: "member" as const,
        }),
      },
      corsOrigins: [],
      chat: {
        read: async () => {
          throw new Error("không dùng");
        },
        send: async (): Promise<ChatSent> => {
          await gate.promise;
          if (outcome === "error") throw new Error("lỗi lưu");
          return { messageId: randomUUID(), sequence: 1, createdAt: "t" };
        },
      },
    });
  const listening = Promise.withResolvers<void>();
  server.listen(0, "127.0.0.1", listening.resolve);
  await listening.promise;
  const port = (server.address() as AddressInfo).port,
    clients: Socket[] = [];
  async function peer(role: Role) {
    const userId = role === "red" ? hostId : randomUUID(),
      token = randomUUID();
    users.set(token, userId);
    roles.set(userId, role);
    const client = io(`http://127.0.0.1:${port}`, {
      reconnection: false,
      transports: ["websocket"],
      auth: {
        accessToken: token,
        appSession: "a".repeat(43),
        roomId,
        tabId: randomUUID(),
      },
    });
    clients.push(client);
    await once(client, "room.snapshot");
    return client;
  }
  return {
    peer,
    release: gate.resolve,
    async close() {
      gate.resolve();
      clients.forEach((c) => c.close());
      await gateway.close();
    },
  };
}
const readyCommand = (ready: boolean) => ({
  commandId: randomUUID(),
  roomId,
  expectedVersion: 1,
  action: { type: "room.ready", payload: { ready } },
});
const chatInput = (channel: string, content: string) => ({
  commandId: randomUUID(),
  channel,
  content,
});

describe("Sẵn sàng tạm qua gateway", () => {
  it("báo ngay cho đối thủ trước khi lưu và hoàn tác khi lưu lỗi", async () => {
    const f = await setup("error");
    try {
      const host = await f.peer("red"),
        guest = await f.peer("black");
      const preview = once(host, "room.ready.preview");
      const revert = once(host, "room.ready.revert");
      const ack = guest.emitWithAck("room.command", readyCommand(true));
      expect(await preview).toEqual({
        roomId,
        side: "black",
        ready: true,
        version: 1,
      });
      f.release();
      expect(await revert).toEqual({ roomId, side: "black", version: 1 });
      expect(await ack).toMatchObject({ status: "error" });
    } finally {
      await f.close();
    }
  });

  it("không báo Sẵn sàng của chủ phòng", async () => {
    const f = await setup("ok");
    try {
      const host = await f.peer("red"),
        guest = await f.peer("black");
      const seen: unknown[] = [];
      guest.on("room.ready.preview", (p) => seen.push(p));
      f.release();
      await host.emitWithAck("room.command", readyCommand(true));
      expect(seen).toEqual([]);
    } finally {
      await f.close();
    }
  });
});

describe("chat tạm qua gateway", () => {
  it("kênh riêng chỉ tới người chơi, nội dung được che từ cấm, và hoàn tác khi lưu lỗi", async () => {
    const f = await setup("error");
    try {
      const host = await f.peer("red"),
        guest = await f.peer("black"),
        viewer = await f.peer("spectator");
      const seenByViewer: unknown[] = [];
      viewer.on("chat.preview", (p) => seenByViewer.push(p));
      const preview = once(host, "chat.preview");
      const revert = once(host, "chat.preview.revert");
      const input = chatInput("PLAYERS_PRIVATE", "xin chào");
      const ack = guest.emitWithAck("chat.send", input);
      expect(await preview).toMatchObject({
        roomId,
        channel: "PLAYERS_PRIVATE",
        commandId: input.commandId,
        content: "xin chào",
        sender: { displayName: "Khách mời", role: "black" },
      });
      f.release();
      expect(await revert).toEqual({
        roomId,
        channel: "PLAYERS_PRIVATE",
        commandId: input.commandId,
      });
      expect(await ack).toMatchObject({ status: "error" });
      expect(seenByViewer).toEqual([]);
    } finally {
      await f.close();
    }
  });

  it("kênh chung tới cả người xem; tin sai định dạng không được báo", async () => {
    const f = await setup("ok");
    try {
      const guest = await f.peer("black"),
        viewer = await f.peer("spectator");
      const seen: unknown[] = [];
      viewer.on("chat.preview", (p) => seen.push(p));
      f.release();
      await guest.emitWithAck("chat.send", chatInput("ROOM_PUBLIC", "   "));
      await guest.emitWithAck(
        "chat.send",
        chatInput("ROOM_PUBLIC", ":khong-co:"),
      );
      expect(seen).toEqual([]);
      const input = chatInput("ROOM_PUBLIC", "chào cả phòng");
      const preview = once(viewer, "chat.preview");
      await guest.emitWithAck("chat.send", input);
      expect(await preview).toMatchObject({
        channel: "ROOM_PUBLIC",
        content: "chào cả phòng",
      });
    } finally {
      await f.close();
    }
  });

  it("chỉ báo tạm tối đa 5 tin trong 10 giây, cùng quota gửi tin", async () => {
    const f = await setup("ok");
    try {
      const guest = await f.peer("black"),
        viewer = await f.peer("spectator");
      const seen: unknown[] = [];
      viewer.on("chat.preview", (p) => seen.push(p));
      f.release();
      for (let i = 0; i < 7; i++)
        await guest.emitWithAck(
          "chat.send",
          chatInput("ROOM_PUBLIC", `tin ${i}`),
        );
      // Ack của viewer đi sau mọi preview đã phát trên cùng socket đó.
      await viewer.emitWithAck("chat.read", {});
      expect(seen).toHaveLength(5);
    } finally {
      await f.close();
    }
  });
});
