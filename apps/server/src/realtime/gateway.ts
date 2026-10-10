import type { Server as HttpServer } from "node:http";
import { randomUUID } from "node:crypto";
import { Server, type Socket } from "socket.io";
import type {
  ClientRealtimeEvents,
  ServerRealtimeEvents,
  RoomSnapshot,
} from "@xiangqi/shared";
import {
  RealtimeError,
  type IdentityResolver,
  type RealtimeConnection,
} from "./contracts.js";
import { errorAcknowledgement, type RealtimeStore } from "./store.js";
import { parseCommand, parseHandshake, uuid } from "./protocol.js";
import { logEvent } from "../logger.js";

export interface RealtimeDependencies {
  store: RealtimeStore;
  identities: IdentityResolver;
  corsOrigins: string[];
}
export function attachRealtime(
  httpServer: HttpServer,
  dependencies: RealtimeDependencies,
) {
  type PeerSocket = Socket<ClientRealtimeEvents, ServerRealtimeEvents>;
  type Peer = {
    socket: PeerSocket;
    connection: RealtimeConnection;
    token: string;
    version: number;
    generation: number;
  };
  const io = new Server<ClientRealtimeEvents, ServerRealtimeEvents>(
    httpServer,
    { cors: { origin: dependencies.corsOrigins }, maxHttpBufferSize: 16384 },
  );
  const peers = new Map<string, Peer>();
  async function authorize(peer: Peer) {
    try {
      const current = await dependencies.identities.resolve(peer.token);
      if (uuid(current.userId) !== peer.connection.identity.userId)
        throw new Error();
      return { ...peer.connection, identity: current };
    } catch {
      throw new RealtimeError(
        "AUTH_REQUIRED",
        "Phiên đăng nhập không hợp lệ hoặc đã hết hạn",
      );
    }
  }
  function sendSnapshot(peer: Peer, snapshot: RoomSnapshot) {
    if (
      snapshot.version < peer.version ||
      snapshot.control.generation < peer.generation
    )
      return;
    peer.version = snapshot.version;
    peer.generation = snapshot.control.generation;
    peer.socket.emit("room.snapshot", snapshot);
  }
  async function publishSnapshots(roomId: string) {
    await Promise.all(
      [...peers.values()]
        .filter(
          (peer) => peer.socket.connected && peer.connection.roomId === roomId,
        )
        .map(async (peer) => {
          try {
            const connection = await authorize(peer);
            sendSnapshot(peer, await dependencies.store.snapshot(connection));
          } catch {
            /* No membership or session: never fall back to a public room broadcast. */
          }
        }),
    );
  }
  async function notifyPreviousTabs(peer: Peer, snapshot: RoomSnapshot) {
    if (snapshot.control.mode !== "writable") {
      if (snapshot.control.reason === "superseded")
        peer.socket.emit("session.read_only", {
          message: "Phiên này đã được mở ở tab khác",
          stopMedia: true,
        });
      return;
    }
    for (const other of peers.values()) {
      if (
        other.socket.connected &&
        other.socket.id !== peer.socket.id &&
        other.connection.identity.userId === peer.connection.identity.userId &&
        other.connection.roomId === peer.connection.roomId
      ) {
        try {
          const connection = await authorize(other);
          const state = await dependencies.store.snapshot(connection);
          if (state.control.reason === "superseded") {
            other.socket.emit("session.read_only", {
              message: "Phiên này đã được mở ở tab khác",
              stopMedia: true,
            });
            sendSnapshot(other, state);
          }
        } catch {
          /* A revoked session does not receive private control events. */
        }
      }
    }
  }
  io.use(async (socket, next) => {
    try {
      const handshake = parseHandshake(socket.handshake.auth as unknown);
      let identity;
      try {
        identity = await dependencies.identities.resolve(handshake.accessToken);
      } catch {
        throw new RealtimeError(
          "AUTH_REQUIRED",
          "Phiên đăng nhập không hợp lệ hoặc đã hết hạn",
        );
      }
      const connection: RealtimeConnection = {
        identity: { ...identity, userId: uuid(identity.userId) },
        roomId: handshake.roomId,
        tabId: handshake.tabId,
        connectionId: socket.id,
      };
      await dependencies.store.connect(connection);
      peers.set(socket.id, {
        socket,
        connection,
        token: handshake.accessToken,
        version: -1,
        generation: -1,
      });
      next();
    } catch (error) {
      const failure = new Error(
        "Không thể mở kết nối thời gian thực",
      ) as Error & { data: { code: string } };
      const response = errorAcknowledgement(error);
      failure.data = {
        code:
          response.status === "error"
            ? response.error.code
            : "REALTIME_UNAVAILABLE",
      };
      next(failure);
    }
  });
  io.on("connection", (socket) => {
    const peer = peers.get(socket.id)!;
    socket.on("disconnect", () => peers.delete(socket.id));
    socket.on("room.command", async (input, acknowledge) => {
      if (typeof acknowledge !== "function") return;
      let response;
      try {
        const connection = await authorize(peer);
        response = await dependencies.store.command(
          connection,
          parseCommand(input as unknown),
        );
      } catch (error) {
        response = errorAcknowledgement(error);
      }
      if (response.status === "ok")
        await publishSnapshots(peer.connection.roomId);
      acknowledge(response);
    });
    socket.on("session.takeover", async (acknowledge) => {
      if (typeof acknowledge !== "function") return;
      try {
        const connection = await authorize(peer);
        const snapshot = await dependencies.store.connect(connection, true);
        await notifyPreviousTabs(peer, snapshot);
        sendSnapshot(peer, snapshot);
        acknowledge({ status: "ok", commandId: randomUUID(), snapshot });
      } catch (error) {
        acknowledge(errorAcknowledgement(error));
      }
    });
    void (async () => {
      try {
        const connection = await authorize(peer);
        const snapshot = await dependencies.store.snapshot(connection);
        sendSnapshot(peer, snapshot);
        await notifyPreviousTabs(peer, snapshot);
      } catch {
        socket.disconnect(true);
      }
    })();
  });
  let cleaning = false;
  const clean = async () => {
    if (cleaning) return;
    cleaning = true;
    try {
      await dependencies.store.cleanupExpiredReceipts();
    } catch {
      process.stderr.write(
        logEvent("error", "realtime_maintenance_failed") + "\n",
      );
    } finally {
      cleaning = false;
    }
  };
  void clean();
  const timer = setInterval(() => void clean(), 60000);
  timer.unref();
  let closing: Promise<void> | undefined;
  return {
    publishSnapshots,
    close: () =>
      (closing ??= new Promise<void>((resolve, reject) => {
        clearInterval(timer);
        io.close((error) => (error ? reject(error) : resolve()));
      })),
  };
}
