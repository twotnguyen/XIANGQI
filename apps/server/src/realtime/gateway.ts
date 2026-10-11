import type { Server as HttpServer } from "node:http";
import { randomUUID } from "node:crypto";
import { Server, type Socket } from "socket.io";
import type {
  ClientRealtimeEvents,
  ServerRealtimeEvents,
  RoomSnapshot,
  ChatChannel,
} from "@xiangqi/shared";
import { bindRoomChat, type RoomChatGateway } from "../chat/chat-gateway.js";
import { RoomError } from "../room/contracts.js";
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
  publishChat?(roomId: string, channel: ChatChannel): Promise<void>;
  publishSnapshots(roomId: string): Promise<void>;
  publishRoomClosed(
    roomId: string,
    recipientIds: readonly string[],
  ): Promise<void>;
  connections(roomId: string): RealtimeConnection[];
}
export interface RealtimeDependencies {
  chat?: RoomChatGateway["chat"];
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
  const operations = new Set<Promise<unknown>>();
  function track<T>(work: () => Promise<T>): Promise<T> {
    const operation = work();
    operations.add(operation);
    void operation.then(
      () => operations.delete(operation),
      () => operations.delete(operation),
    );
    return operation;
  }
  function failedOperation() {
    process.stderr.write(
      logEvent("error", "realtime_maintenance_failed") + "\n",
    );
  }

  type PendingDisconnect = {
    connection: RealtimeConnection;
    failures: number;
    timer?: ReturnType<typeof setTimeout>;
  };
  const pendingDisconnects = new Set<PendingDisconnect>();
  function attemptDisconnect(entry: PendingDisconnect) {
    const cleanup = dependencies.store.disconnect(entry.connection).then(
      () => {
        pendingDisconnects.delete(entry);
      },
      () => {
        process.stderr.write(
          logEvent("error", "realtime_disconnect_failed") + "\n",
        );
        if (!stopping) {
          const delay = Math.min(
            15000,
            1000 * 2 ** Math.min(entry.failures++, 4),
          );
          entry.timer = setTimeout(() => {
            entry.timer = undefined;
            void attemptDisconnect(entry);
          }, delay);
          entry.timer.unref();
        }
      },
    );
    disconnects.add(cleanup);
    void cleanup.then(() => disconnects.delete(cleanup));
    return cleanup;
  }
  function disconnect(connection: RealtimeConnection) {
    const entry: PendingDisconnect = {
      connection: {
        identity: { ...connection.identity },
        roomId: connection.roomId,
        tabId: connection.tabId,
        connectionId: connection.connectionId,
      },
      failures: 0,
    };
    pendingDisconnects.add(entry);
    return attemptDisconnect(entry);
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
  function publishSnapshots(roomId: string): Promise<void> {
    if (stopping) return Promise.reject(publicationFailure());
    return track(() => doPublishSnapshots(roomId));
  }
  function publishChat(roomId: string, channel: ChatChannel): Promise<void> {
    if (stopping || !dependencies.chat)
      return Promise.reject(publicationFailure());
    const chat = dependencies.chat;
    return track(async () => {
      await Promise.all(
        [...peers.values()]
          .filter(
            (peer) =>
              peer.socket.connected && peer.connection.roomId === roomId,
          )
          .map(async (peer) => {
            try {
              const connection = await authorize(peer);
              const page = await chat.read(connection, { channel });
              if (
                stopping ||
                !peer.socket.connected ||
                peers.get(peer.socket.id) !== peer
              )
                return;
              // Invalidation contains no message body. Reads always recheck the current pair/entry scope.
              peer.socket.emit("chat.changed", {
                roomId: page.roomId,
                channel: page.channel,
                roomVersion: page.roomVersion,
                scopeToken: page.scopeToken,
                canSend: page.canSend,
              });
            } catch (error) {
              if (
                denied(error) ||
                (error instanceof RoomError &&
                  ["CHAT_FORBIDDEN", "AUTH_REQUIRED"].includes(error.code))
              )
                return;
              throw publicationFailure();
            }
          }),
      );
    });
  }
  async function doPublishSnapshots(roomId: string) {
    await Promise.all(
      [...peers.values()]
        .filter(
          (peer) => peer.socket.connected && peer.connection.roomId === roomId,
        )
        .map((peer) =>
          track(async () => {
            try {
              const connection = await authorize(peer);
              sendSnapshot(peer, await dependencies.store.snapshot(connection));
            } catch (error) {
              if (!denied(error)) throw publicationFailure();
              // Revoked membership/session never receives a private fallback.
            }
          }),
        ),
    );
  }
  function denied(error: unknown) {
    return (
      error instanceof RealtimeError &&
      ["AUTH_REQUIRED", "ROOM_FORBIDDEN"].includes(error.code)
    );
  }
  function publicationFailure() {
    return new RealtimeError(
      "REALTIME_UNAVAILABLE",
      "Chưa thể đồng bộ trạng thái phòng",
    );
  }
  function publishRoomClosed(
    roomId: string,
    recipientIds: readonly string[],
  ): Promise<void> {
    if (stopping) return Promise.reject(publicationFailure());
    return track(() => doPublishRoomClosed(roomId, recipientIds));
  }
  async function doPublishRoomClosed(
    roomId: string,
    recipientIds: readonly string[],
  ) {
    const room = uuid(roomId),
      recipients = new Set(recipientIds.map(uuid));
    await Promise.all(
      [...peers.values()]
        .filter(
          (peer) =>
            peer.socket.connected &&
            peer.connection.roomId === room &&
            recipients.has(peer.connection.identity.userId),
        )
        .map((peer) =>
          track(async () => {
            try {
              await authorize(peer);
              peer.socket.emit("room.closed", {
                roomId: room,
                message: "Phòng đã đóng",
              });
            } catch (error) {
              if (!denied(error)) throw publicationFailure();
              peer.socket.disconnect(true);
            }
          }),
        ),
    );
  }
  function notifyPreviousTabs(
    peer: Peer,
    snapshot: RoomSnapshot,
  ): Promise<void> {
    if (stopping) return Promise.resolve();
    return track(() => doNotifyPreviousTabs(peer, snapshot));
  }
  async function doNotifyPreviousTabs(peer: Peer, snapshot: RoomSnapshot) {
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
    const peer = peers.get(socket.id);
    if (!peer || stopping) {
      socket.disconnect(true);
      return;
    }
    if (dependencies.chat)
      bindRoomChat(socket, {
        authorize: () => authorize(peer),
        chat: dependencies.chat,
        changed: publishChat,
        stopping: () => stopping,
        track,
      });
    socket.on("disconnect", () => {
      peers.delete(socket.id);
      void peer.disconnect();
    });
    socket.on("room.command", (input, acknowledge) => {
      if (typeof acknowledge !== "function") return;
      if (stopping) {
        acknowledge(errorAcknowledgement(publicationFailure()));
        return;
      }
      void track(async () => {
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
        if (response.snapshot && !stopping) {
          try {
            await publishSnapshots(peer.connection.roomId);
          } catch {
            failedOperation();
          }
        }
        // A committed result is never replaced by a shutdown/publication failure.
        acknowledge(response);
      }).catch(failedOperation);
    });
    socket.on("room.sync", (acknowledge) => {
      if (typeof acknowledge !== "function") return;
      if (stopping) {
        acknowledge(errorAcknowledgement(publicationFailure()));
        return;
      }
      void track(async () => {
        try {
          const connection = await authorize(peer);
          if (stopping) throw publicationFailure();
          const snapshot = await dependencies.store.snapshot(connection);
          acknowledge({ status: "ok", commandId: randomUUID(), snapshot });
        } catch (error) {
          acknowledge(errorAcknowledgement(error));
        }
      }).catch(failedOperation);
    });
    socket.on("session.takeover", (acknowledge) => {
      if (typeof acknowledge !== "function") return;
      if (stopping) {
        acknowledge(errorAcknowledgement(publicationFailure()));
        return;
      }
      void track(async () => {
        try {
          const connection = await authorize(peer);
          if (stopping) throw publicationFailure();
          const snapshot = await dependencies.store.connect(connection, true);
          if (!stopping) {
            await notifyPreviousTabs(peer, snapshot);
            sendSnapshot(peer, snapshot);
          }
          acknowledge({ status: "ok", commandId: randomUUID(), snapshot });
        } catch (error) {
          acknowledge(errorAcknowledgement(error));
        }
      }).catch(failedOperation);
    });
    void track(async () => {
      try {
        const connection = await authorize(peer);
        if (stopping) return;
        const snapshot = await dependencies.store.snapshot(connection);
        if (!stopping) {
          sendSnapshot(peer, snapshot);
          await notifyPreviousTabs(peer, snapshot);
        }
      } catch {
        socket.disconnect(true);
      }
    }).catch(failedOperation);
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
  let sessionMaintenance: Promise<void> | null = null;
  let sessionCursor: string | null = null;
  const scanSessions = () => {
    if (
      sessionMaintenance ||
      stopping ||
      !dependencies.identities.sessionActive
    )
      return;
    const check = dependencies.identities.sessionActive.bind(
      dependencies.identities,
    );
    sessionMaintenance = (async () => {
      const batch = [...peers.values()]
        .filter(
          (peer) =>
            peer.socket.connected &&
            (sessionCursor === null || peer.socket.id > sessionCursor),
        )
        .sort((a, b) =>
          a.socket.id < b.socket.id ? -1 : a.socket.id > b.socket.id ? 1 : 0,
        )
        .slice(0, 50);
      for (const peer of batch) {
        if (stopping) break;
        try {
          const active = await check(peer.connection);
          if (
            !active &&
            !stopping &&
            peers.get(peer.socket.id) === peer &&
            peer.socket.connected
          )
            peer.socket.disconnect(true);
        } catch {
          process.stderr.write(
            logEvent("error", "realtime_maintenance_failed") + "\n",
          );
        }
      }
      sessionCursor = batch.length === 50 ? batch[49]!.socket.id : null;
    })().finally(() => {
      sessionMaintenance = null;
    });
  };
  const sessionTimer = setInterval(scanSessions, 1000);
  sessionTimer.unref();
  let closing: Promise<void> | undefined;
  return {
    publishChat,
    publishSnapshots,
    publishRoomClosed,
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
        clearInterval(sessionTimer);
        for (const entry of pendingDisconnects) clearTimeout(entry.timer);
        io.close((error) => {
          void (async () => {
            await Promise.all([...admissions]);
            while (operations.size) await Promise.allSettled([...operations]);
            await Promise.all([...disconnects]);
            await maintenance;
            await sessionMaintenance;
            await Promise.all([...pendingDisconnects].map(attemptDisconnect));
            pendingDisconnects.clear();
            if (error) reject(error);
            else resolve();
          })().catch(reject);
        });
      })),
  };
}
