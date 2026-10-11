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

function authenticationFailure(error: unknown): RealtimeError {
  return error instanceof RealtimeError && error.code === "REALTIME_UNAVAILABLE"
    ? new RealtimeError(
        "REALTIME_UNAVAILABLE",
        "Chưa thể xác thực phiên đăng nhập",
      )
    : new RealtimeError(
        "AUTH_REQUIRED",
        "Phiên đăng nhập không hợp lệ hoặc đã hết hạn",
      );
}

export interface RealtimePublisher {
  publishSnapshots(roomId: string): Promise<void>;
  connections(roomId: string): RealtimeConnection[];
}
export interface RealtimeDependencies {
  store: RealtimeStore;
  identities: IdentityResolver;
  corsOrigins: string[];
  onAttached?: (publisher: RealtimePublisher) => void;
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
    appSession: string;
    version: number;
    generation: number;
    disconnect: () => Promise<void>;
  };
  const io = new Server<ClientRealtimeEvents, ServerRealtimeEvents>(
    httpServer,
    { cors: { origin: dependencies.corsOrigins }, maxHttpBufferSize: 16384 },
  );
  const peers = new Map<string, Peer>();
  const disconnects = new Set<Promise<void>>();
  const admissions = new Set<Promise<void>>();
  let stopping = false;
  function disconnect(connection: RealtimeConnection) {
    const cleanup = dependencies.store.disconnect(connection).catch(() => {
      process.stderr.write(
        logEvent("error", "realtime_disconnect_failed") + "\n",
      );
    });
    disconnects.add(cleanup);
    void cleanup.then(() => disconnects.delete(cleanup));
    return cleanup;
  }
  async function authorize(peer: Peer) {
    try {
      const proof = { accessToken: peer.token, appSession: peer.appSession };
      const current = await dependencies.identities.resolve(
        peer.token,
        peer.appSession,
        proof,
      );
      if (uuid(current.userId) !== peer.connection.identity.userId)
        throw new Error();
      return { ...peer.connection, identity: current, proof };
    } catch (error) {
      throw authenticationFailure(error);
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
  io.use((socket, next) => {
    const admission = (async () => {
      try {
        if (stopping)
          throw new RealtimeError("REALTIME_UNAVAILABLE", "Máy chủ đang dừng");
        const handshake = parseHandshake(socket.handshake.auth as unknown);
        const proof = {
          accessToken: handshake.accessToken,
          appSession: handshake.appSession,
        };
        let identity;
        try {
          identity = await dependencies.identities.resolve(
            handshake.accessToken,
            handshake.appSession,
            proof,
          );
        } catch (error) {
          throw authenticationFailure(error);
        }
        const connection: RealtimeConnection = {
          proof,
          identity: { ...identity, userId: uuid(identity.userId) },
          roomId: handshake.roomId,
          tabId: handshake.tabId,
          connectionId: socket.id,
        };
        let committed = false;
        let cleanup: Promise<void> | undefined;
        const disconnectOnce = () => (cleanup ??= disconnect(connection));
        // Engine transport may close before the namespace connection event.
        socket.conn.once("close", () => {
          peers.delete(socket.id);
          if (committed) void disconnectOnce();
        });
        await dependencies.store.connect(connection);
        committed = true;
        if (stopping || socket.conn.readyState !== "open") {
          await disconnectOnce();
          throw new RealtimeError("REALTIME_UNAVAILABLE", "Kết nối đã đóng");
        }
        peers.set(socket.id, {
          socket,
          connection,
          token: handshake.accessToken,
          appSession: handshake.appSession,
          version: -1,
          generation: -1,
          disconnect: disconnectOnce,
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
    })();
    admissions.add(admission);
    void admission.then(() => admissions.delete(admission));
  });
  io.on("connection", (socket) => {
    const peer = peers.get(socket.id)!;
    socket.on("disconnect", () => {
      peers.delete(socket.id);
      void peer.disconnect();
    });
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
      if (response.snapshot) await publishSnapshots(peer.connection.roomId);
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
  let maintenance: Promise<void> | null = null;
  const clean = () => {
    if (maintenance || stopping) return;
    maintenance = dependencies.store
      .cleanupExpiredReceipts()
      .then(
        () => {},
        () => {
          process.stderr.write(
            logEvent("error", "realtime_maintenance_failed") + "\n",
          );
        },
      )
      .finally(() => {
        maintenance = null;
      });
  };
  clean();
  const timer = setInterval(clean, 60000);
  timer.unref();
  let closing: Promise<void> | undefined;
  return {
    publishSnapshots,
    connections: (roomId: string): RealtimeConnection[] =>
      [...peers.values()]
        .filter(
          (peer) => peer.socket.connected && peer.connection.roomId === roomId,
        )
        .map((peer) => peer.connection),
    close: () =>
      (closing ??= new Promise<void>((resolve, reject) => {
        stopping = true;
        clearInterval(timer);
        io.close((error) => {
          void (async () => {
            await Promise.all([...admissions]);
            await Promise.all([...disconnects]);
            await maintenance;
            if (error) reject(error);
            else resolve();
          })().catch(reject);
        });
      })),
  };
}
