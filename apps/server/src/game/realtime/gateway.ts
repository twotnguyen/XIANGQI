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
import { RoomError } from "../room/room.types.js";
import {
  RealtimeError,
  type IdentityResolver,
  type RealtimeConnection,
} from "./realtime.types.js";
import { errorAcknowledgement, type RealtimeStore } from "./store.js";
import {
  handshakeProof,
  parseCommand,
  parseHandshake,
  uuid,
} from "./protocol.js";
import type { RoomRequestProof } from "../room/room-session.js";
import { logEvent } from "../../core/logger.js";
import { bindNetworkDemo } from "./network-demo.js";

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
  publishSnapshots(roomId: string, minimumVersion?: number): Promise<void>;
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
/**
 * Khởi tạo cổng kết nối WebSocket (Socket.IO) cho phòng cờ và chat:
 * - Xác thực phiên người dùng từ handshake auth.
 * - Quản lý kết nối nhiều tab và cơ chế chiếm quyền điều khiển (takeover).
 * - Lắng nghe các sự kiện `room.command`, `room.sync`, `session.takeover`, và chat.
 * - Phát broadcast snapshot và thông báo phòng đóng tới các client liên quan.
 */
export function attachRealtime(
  httpServer: HttpServer,
  dependencies: RealtimeDependencies,
) {
  type PeerSocket = Socket<ClientRealtimeEvents, ServerRealtimeEvents>;
  type Peer = {
    socket: PeerSocket;
    connection: RealtimeConnection;
    proof: RoomRequestProof;
    initialSnapshot?: RoomSnapshot;
    version: number;
    generation: number;
    disconnect: () => Promise<void>;
  };
  const io = new Server<ClientRealtimeEvents, ServerRealtimeEvents>(
    httpServer,
    {
      cors: { origin: dependencies.corsOrigins, credentials: true },
      maxHttpBufferSize: 16384,
    },
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
      connection: { ...connection, identity: { ...connection.identity } },
      failures: 0,
    };
    pendingDisconnects.add(entry);
    return attemptDisconnect(entry);
  }
  async function authorize(peer: Peer) {
    // Each request gets its own proof object: the resolver binds trust to that object only,
    // and the same object travels with the connection into the command transaction.
    const proof = { ...peer.proof };
    try {
      const current = await dependencies.identities.resolve(proof);
      if (
        uuid(current.userId) !== peer.connection.identity.userId ||
        current.kind !== peer.connection.identity.kind
      )
        throw new Error();
      return { ...peer.connection, identity: current, proof };
    } catch (error) {
      throw authenticationFailure(error);
    }
  }
  function recordDelivered(peer: Peer, snapshot: RoomSnapshot): boolean {
    if (
      snapshot.version < peer.version ||
      snapshot.control.generation < peer.generation
    )
      return false;
    peer.version = snapshot.version;
    peer.generation = snapshot.control.generation;
    return true;
  }
  function sendSnapshot(peer: Peer, snapshot: RoomSnapshot) {
    if (recordDelivered(peer, snapshot))
      peer.socket.emit("room.snapshot", snapshot);
  }
  // Per room: at most one publication pass runs and at most one follow-up pass
  // is queued. A pass re-authorizes and re-reads every recipient, so a caller
  // may only join a pass that has not yet started reading; a trigger that
  // arrives during a running pass always gets a fresh follow-up pass.
  // A version floor lets a pass skip recipients already at that version without
  // authorizing them (no private data is emitted for them). "all" (no floor)
  // authorizes and reads every recipient.
  type Floor = number | "all";
  type RoomPublication = {
    running?: Promise<void>;
    queued?: Promise<void>;
    queuedFloor?: Floor;
  };
  const roomPublications = new Map<string, RoomPublication>();
  function mergeFloor(a: Floor, b: Floor): Floor {
    return a === "all" || b === "all" ? "all" : Math.max(a, b);
  }
  function publishSnapshots(
    roomId: string,
    minimumVersion?: number,
  ): Promise<void> {
    if (stopping) return Promise.reject(publicationFailure());
    const floor: Floor = minimumVersion ?? "all";
    const slot = roomPublications.get(roomId) ?? {};
    roomPublications.set(roomId, slot);
    if (slot.queued) {
      slot.queuedFloor = mergeFloor(slot.queuedFloor ?? floor, floor);
      return slot.queued;
    }
    if (!slot.running) return startPublication(roomId, slot, floor);
    const previous = slot.running;
    slot.queuedFloor = floor;
    const queued: Promise<void> = track(async () => {
      await previous.catch(() => undefined);
      if (stopping) {
        slot.queued = undefined;
        slot.queuedFloor = undefined;
        throw publicationFailure();
      }
      return startPublication(roomId, slot, slot.queuedFloor ?? floor);
    });
    slot.queued = queued;
    return queued;
  }
  function startPublication(
    roomId: string,
    slot: RoomPublication,
    floor: Floor,
  ) {
    slot.queued = undefined;
    slot.queuedFloor = undefined;
    const pass: Promise<void> = track(() =>
      doPublishSnapshots(roomId, floor),
    ).finally(() => {
      if (slot.running === pass) slot.running = undefined;
      if (
        !slot.running &&
        !slot.queued &&
        roomPublications.get(roomId) === slot
      )
        roomPublications.delete(roomId);
    });
    slot.running = pass;
    return pass;
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
  async function doPublishSnapshots(roomId: string, floor: Floor) {
    await Promise.all(
      [...peers.values()]
        .filter(
          (peer) =>
            peer.socket.connected &&
            peer.connection.roomId === roomId &&
            // Already at the floor: no authorization, read, or emit is needed.
            !(floor !== "all" && peer.version >= floor),
        )
        .map((peer) =>
          track(async () => {
            try {
              const connection = await authorize(peer);
              // Re-checked after authorization: an ack or an earlier pass may
              // have delivered the floor while this recipient was verified.
              if (floor !== "all" && peer.version >= floor) return;
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
    if (snapshot.control.reason === "superseded") {
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
        const proof = handshakeProof(handshake);
        let identity;
        try {
          identity = await dependencies.identities.resolve(proof);
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
        const initialSnapshot = await dependencies.store.connect(connection);
        committed = true;
        if (stopping || socket.conn.readyState !== "open") {
          await disconnectOnce();
          throw new RealtimeError("REALTIME_UNAVAILABLE", "Kết nối đã đóng");
        }
        peers.set(socket.id, {
          socket,
          connection,
          proof,
          initialSnapshot,
          version: initialSnapshot?.version ?? -1,
          generation: initialSnapshot?.control.generation ?? -1,
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
    bindNetworkDemo(socket as unknown as Socket, {
      env: process.env,
      authorize: async () => {
        if (stopping) throw publicationFailure();
        const connection = await authorize(peer);
        const snapshot = await dependencies.store.snapshot(connection);
        if (stopping) throw publicationFailure();
        return snapshot;
      },
    });
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
        // The command transaction has committed; publication is an independent
        // side effect and must not delay delivery of its durable receipt.
        acknowledge(response);
        if (response.snapshot && !stopping) {
          // The ack delivered this snapshot to the origin; recording it lets the
          // version floor skip the origin, while other recipients are re-read.
          if (peer.socket.connected) recordDelivered(peer, response.snapshot);
          void publishSnapshots(
            peer.connection.roomId,
            response.snapshot.version,
          ).catch(failedOperation);
        }
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
      const snapshot = peer.initialSnapshot;
      if (!snapshot) return;
      peer.initialSnapshot = undefined;
      sendSnapshot(peer, snapshot);
      await notifyPreviousTabs(peer, snapshot);
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
  const sessionTimer = setInterval(
    scanSessions,
    process.env.NODE_ENV === "test" ? 1000 : 10000,
  );
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
