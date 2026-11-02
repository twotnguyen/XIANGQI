import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { randomUUID } from "node:crypto";
import { io, type Socket } from "socket.io-client";
import { describe, expect, it } from "vitest";
import { initialPosition, serializePosition } from "@xiangqi/xiangqi-core";
import type { CommandAcknowledgement, RoomSnapshot } from "@xiangqi/shared";
import { attachRealtime } from "@server/game/realtime/gateway.js";
import type { RealtimeConnection } from "@server/game/realtime/realtime.types.js";
import type { RealtimeStore } from "@server/game/realtime/store.js";

const roomId = randomUUID(),
  matchId = randomUUID();
const snapshotFor = (role: "red" | "black") =>
  ({
    roomId,
    version: 1,
    role,
    room: { status: "PLAYING" },
    control: { mode: "writable", generation: 1, reason: null },
    match: {
      id: matchId,
      version: 0,
      status: "ACTIVE",
      turn: "red",
      position: serializePosition(initialPosition()),
    },
  }) as unknown as RoomSnapshot;
function once(socket: Socket, event: string) {
  const { promise, resolve } = Promise.withResolvers<unknown>();
  socket.once(event, resolve);
  return promise;
}

async function setup(outcome: "ok" | "error") {
  const sides = new Map<string, "red" | "black">();
  const gate = Promise.withResolvers<void>();
  const store = {
    connect: async (c: RealtimeConnection) =>
      snapshotFor(sides.get(c.identity.userId)!),
    snapshot: async (c: RealtimeConnection) =>
      snapshotFor(sides.get(c.identity.userId)!),
    command: async (): Promise<CommandAcknowledgement> => {
      await gate.promise;
      return outcome === "ok"
        ? {
            status: "ok",
            commandId: randomUUID(),
            snapshot: snapshotFor("red"),
          }
        : {
            status: "error",
            error: { code: "MATCH_TIME_EXPIRED", message: "hết giờ" },
          };
    },
    disconnect: async () => {},
    cleanupExpiredReceipts: async () => 0,
  } as unknown as RealtimeStore;
  const users = new Map<string, string>(),
    server = createServer(),
    gateway = attachRealtime(server, {
      store,
      identities: {
        resolve: async (proof) => ({
          userId: users.get("accessToken" in proof ? proof.accessToken : "")!,
          kind: "member" as const,
        }),
      },
      corsOrigins: [],
    });
  const listening = Promise.withResolvers<void>();
  server.listen(0, "127.0.0.1", listening.resolve);
  await listening.promise;
  const port = (server.address() as AddressInfo).port,
    clients: Socket[] = [];
  async function peer(side: "red" | "black") {
    const userId = randomUUID(),
      token = randomUUID();
    users.set(token, userId);
    sides.set(userId, side);
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
const move = (from: number, to: number) => ({
  commandId: randomUUID(),
  roomId,
  expectedVersion: 1,
  action: {
    type: "match.move",
    payload: { matchId, matchVersion: 0, from, to },
  },
});

describe("nước đi tạm qua gateway", () => {
  it("báo ngay cho đối thủ khi nước hợp lệ, trước khi lệnh được lưu, và hoàn tác khi lưu lỗi", async () => {
    const f = await setup("error");
    try {
      const red = await f.peer("red"),
        black = await f.peer("black");
      const preview = once(black, "room.move.preview");
      const revert = once(black, "room.move.revert");
      // 54 → 45: tốt đỏ tiến lên; lệnh chưa được lưu vì store đang chờ cổng.
      const ack = red.emitWithAck("room.command", move(54, 45));
      expect(await preview).toEqual({
        roomId,
        matchId,
        matchVersion: 0,
        from: 54,
        to: 45,
      });
      f.release();
      expect(await revert).toEqual({ roomId, matchId, matchVersion: 0 });
      expect(await ack).toMatchObject({ status: "error" });
    } finally {
      await f.close();
    }
  });

  it("không báo nước sai luật hoặc sai lượt", async () => {
    const f = await setup("ok");
    try {
      const red = await f.peer("red"),
        black = await f.peer("black");
      const seen: unknown[] = [];
      black.on("room.move.preview", (p) => seen.push(p));
      f.release();
      // 0 → 10: xe đen không thể đi như vậy ở thế khởi đầu; đen cũng chưa đến lượt.
      await red.emitWithAck("room.command", move(0, 10));
      await black.emitWithAck("room.command", move(0, 9));
      expect(seen).toEqual([]);
    } finally {
      await f.close();
    }
  });
});
