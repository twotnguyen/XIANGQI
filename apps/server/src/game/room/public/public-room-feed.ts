import type { Server as HttpServer } from "node:http";
import { Server, type Socket } from "socket.io";
import type { PublicRoomView } from "./public-room-store.js";
import type { PublicRoomAuthProof } from "@xiangqi/shared";
export type PublicFeedProof = PublicRoomAuthProof;
export type PublicRoomFeedDependencies = {
  corsOrigins: readonly string[];
  /** Opens trusted identity once; every read must reauthorize its fixed session deadline. */
  open(proof: PublicFeedProof): Promise<{ read(): Promise<PublicRoomView[]> }>;
};
const capability = /^[A-Za-z0-9_-]{43}$/;
const invalidSession = "Phiên truy cập không hợp lệ";
const unavailable = {
  code: "PUBLIC_ROOMS_UNAVAILABLE",
  message: "Không thể tải danh sách phòng",
};
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw Error("Invalid payload");
  return value as Record<string, unknown>;
}
export function parsePublicFeedProof(value: unknown): PublicFeedProof {
  const data = object(value);
  if (
    data.kind === "member" &&
    Object.keys(data).length === 3 &&
    typeof data.accessToken === "string" &&
    data.accessToken.length > 0 &&
    data.accessToken.length <= 8192 &&
    typeof data.appSession === "string" &&
    capability.test(data.appSession)
  )
    return {
      kind: "member",
      accessToken: data.accessToken,
      appSession: data.appSession,
    };
  if (
    data.kind === "guest" &&
    Object.keys(data).length === 2 &&
    typeof data.guestCapability === "string" &&
    capability.test(data.guestCapability)
  )
    return { kind: "guest", guestCapability: data.guestCapability };
  throw Error(invalidSession);
}
function safeRooms(value: unknown): PublicRoomView[] {
  if (!Array.isArray(value) || value.length > 50)
    throw Error("Invalid public rooms");
  const ids = new Set<string>();
  return value.map((item) => {
    const row = object(item),
      host = object(row.host);
    const bounded = (v: unknown, max: number) =>
      typeof v === "number" && Number.isSafeInteger(v) && v >= 0 && v <= max;
    if (
      typeof row.roomId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        row.roomId,
      ) ||
      ids.has(row.roomId) ||
      typeof row.name !== "string" ||
      row.name.length < 1 ||
      row.name.length > 60 ||
      typeof host.displayName !== "string" ||
      host.displayName.length < 1 ||
      host.displayName.length > 30 ||
      typeof host.isGuest !== "boolean" ||
      ![5, 10, 15].includes(row.timeMinutes as number) ||
      !["waiting", "playing"].includes(row.status as string) ||
      !bounded(row.spectators, 5) ||
      !bounded(row.viewerLimit, 5) ||
      (row.spectators as number) > (row.viewerLimit as number) ||
      !bounded(row.emptySeats, 2) ||
      typeof row.canPlay !== "boolean" ||
      typeof row.canWatch !== "boolean" ||
      !(
        row.publicOpenedAt === null ||
        (typeof row.publicOpenedAt === "string" &&
          Number.isFinite(Date.parse(row.publicOpenedAt)))
      )
    )
      throw Error("Invalid public rooms");
    ids.add(row.roomId);
    return {
      roomId: row.roomId,
      name: row.name,
      host: { displayName: host.displayName, isGuest: host.isGuest },
      timeMinutes: row.timeMinutes as number,
      status: row.status as "waiting" | "playing",
      spectators: row.spectators as number,
      viewerLimit: row.viewerLimit as number,
      emptySeats: row.emptySeats as number,
      canPlay: row.canPlay,
      canWatch: row.canWatch,
      publicOpenedAt: row.publicOpenedAt as string | null,
    };
  });
}
function authFailure(error: unknown) {
  return (
    !!error &&
    typeof error === "object" &&
    ((error as { status?: unknown }).status === 401 ||
      (error as { code?: unknown }).code === "AUTH_REQUIRED")
  );
}
/** Attach after other Engine.IO gateways; close before closing the shared HTTP server. */
export function attachPublicRoomFeed(
  httpServer: HttpServer,
  dependencies: PublicRoomFeedDependencies,
) {
  const events = ["request", "upgrade", "close", "listening"] as const;
  const previous = events.map((event) => httpServer.listeners(event));
  const io = new Server(httpServer, {
    path: "/public-rooms/socket.io",
    serveClient: false,
    maxHttpBufferSize: 16384,
    destroyUpgrade: false,
    cors: { origin: [...dependencies.corsOrigins], credentials: true },
    allowRequest: (request, done) =>
      done(
        null,
        typeof request.headers.origin === "string" &&
          dependencies.corsOrigins.includes(request.headers.origin),
      ),
  });
  const added = events.map((event, index) =>
    httpServer
      .listeners(event)
      .filter((listener) => !previous[index]!.includes(listener)),
  );
  io.use((_socket, next) => next(Error(invalidSession)));
  const namespace = io.of("/public-rooms");
  type Peer = {
    socket: Socket;
    read: () => Promise<PublicRoomView[]>;
    busy: boolean;
    prior?: string;
  };
  const readers = new WeakMap<Socket, () => Promise<PublicRoomView[]>>();
  const peers = new Set<Peer>(),
    pending = new Set<Promise<unknown>>();
  let stopping = false,
    closing: Promise<void> | undefined;
  function track<T>(operation: Promise<T>) {
    pending.add(operation);
    void operation.finally(() => pending.delete(operation)).catch(() => {});
    return operation;
  }
  namespace.use((socket, next) => {
    const admission = (async () => {
      let proof: PublicFeedProof;
      try {
        proof = parsePublicFeedProof(socket.handshake.auth);
      } catch {
        next(Error(invalidSession));
        return;
      }
      try {
        if (stopping) throw Error("Closed");
        const source = await dependencies.open(proof);
        if (stopping) {
          next(Error(unavailable.message));
          return;
        }
        readers.set(socket, () => source.read());
        next();
      } catch (error) {
        next(Error(authFailure(error) ? invalidSession : unavailable.message));
      }
    })();
    track(admission);
  });
  function read(peer: Peer) {
    if (stopping || peer.busy || !peer.socket.connected) return;
    peer.busy = true;
    track(
      (async () => {
        try {
          const rooms = safeRooms(await peer.read());
          if (stopping || !peer.socket.connected) return;
          const identity = JSON.stringify(rooms);
          if (identity !== peer.prior) {
            peer.prior = identity;
            peer.socket.emit("public.rooms", {
              rooms,
              serverNow: new Date().toISOString(),
            });
          }
        } catch (error) {
          if (stopping || !peer.socket.connected) return;
          if (authFailure(error)) {
            peer.socket.emit("public.error", {
              code: "AUTH_REQUIRED",
              message: invalidSession,
            });
            peer.socket.disconnect(true);
          } else {
            peer.prior = undefined;
            peer.socket.emit("public.error", unavailable);
          }
        } finally {
          peer.busy = false;
        }
      })(),
    );
  }
  namespace.on("connection", (socket) => {
    const source = readers.get(socket);
    if (stopping || !source) {
      socket.disconnect(true);
      return;
    }
    const peer: Peer = { socket, read: source, busy: false };
    peers.add(peer);
    socket.on("disconnect", () => peers.delete(peer));
    read(peer);
  });
  const timer = setInterval(() => {
    for (const peer of peers) read(peer);
  }, 1000);
  timer.unref();
  return {
    close(): Promise<void> {
      if (closing) return closing;
      stopping = true;
      clearInterval(timer);
      namespace.disconnectSockets(true);
      io.engine.close();
      // Socket.IO close() would close the shared HTTP server. Detach only this attachment.
      events.forEach((event, index) =>
        added[index]!.forEach((listener) =>
          httpServer.removeListener(
            event,
            listener as (...args: unknown[]) => void,
          ),
        ),
      );
      for (const listener of previous[0]!)
        if (!httpServer.listeners("request").includes(listener))
          httpServer.on("request", listener as (...args: unknown[]) => void);
      closing = (async () => {
        while (pending.size) await Promise.allSettled([...pending]);
        await namespace.adapter.close();
      })();
      return closing;
    },
  };
}
