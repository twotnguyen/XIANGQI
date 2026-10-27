import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { randomUUID } from "node:crypto";
import { io, type Socket } from "socket.io-client";
import { vi } from "vitest";
import { attachRealtime } from "@server/game/realtime/gateway.js";
import { RealtimeError } from "@server/game/realtime/realtime.types.js";
import { RoomError } from "@server/game/room/room.types.js";
import type { RealtimeConnection } from "@server/game/realtime/realtime.types.js";
import type { ChatReadRequest, RoomSnapshot } from "@xiangqi/shared";
import type { RealtimeStore } from "@server/game/realtime/store.js";
import type { RoomRequestProof } from "@server/game/room/room-session.js";
export async function fixture(chatEnabled = false, viewerTabOwnership = false) {
  const roomId = randomUUID(),
    users = new Map<string, string>(),
    clients: Socket[] = [];
  let providerFailure = false,
    membership = false,
    snapshotFailure = false,
    failAfterCommit = false,
    snapshotGate: Promise<void> | null = null;
  const snapshot = {
    roomId,
    version: 1,
    control: { mode: "writable", generation: 1, reason: null },
  };
  let ownerConnectionId: string | null = null;
  const forConnection = (connection: RealtimeConnection) =>
    viewerTabOwnership
      ? {
          ...snapshot,
          control: {
            mode: "readonly",
            generation: 1,
            reason:
              ownerConnectionId === connection.connectionId
                ? "not_allowed"
                : "superseded",
          },
        }
      : snapshot;
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
  const resolve = vi.fn(async (proof: RoomRequestProof) => {
    if (providerFailure)
      throw new RealtimeError(
        "REALTIME_UNAVAILABLE",
        "PRIVATE_PROVIDER_SECRET",
      );
    if (!("accessToken" in proof))
      throw new RealtimeError("AUTH_REQUIRED", "private");
    const id = users.get(proof.accessToken);
    if (!id) throw new RealtimeError("AUTH_REQUIRED", "private");
    return { userId: id, kind: "member" as const };
  });
  const read = vi.fn(async (connection: RealtimeConnection) => {
    if (membership)
      throw new RealtimeError("ROOM_FORBIDDEN", "private membership");
    if (snapshotFailure) throw new Error("PRIVATE_SQL_SECRET");
    if (snapshotGate) await snapshotGate;
    return forConnection(connection);
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
    connect: async (connection: RealtimeConnection) => {
      if (viewerTabOwnership) ownerConnectionId = connection.connectionId;
      return forConnection(connection);
    },
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
  async function peer(targetRoom = roomId, existingUserId?: string) {
    const userId = existingUserId ?? randomUUID(),
      token = randomUUID();
    users.set(token, userId);
    const client = io(`http://127.0.0.1:${(address as AddressInfo).port}`, {
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
    const initial = new Promise<RoomSnapshot>((r) =>
      client.once("room.snapshot", r),
    );
    client.connect();
    const initialSnapshot = await initial;
    return { client, userId, token, initialSnapshot };
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
    setSnapshotGate: (gate: Promise<void> | null) => (snapshotGate = gate),
    setAfterCommit: () => (failAfterCommit = true),
    close: async () => {
      clients.forEach((c) => c.disconnect());
      await gateway.close();
    },
  };
}
