import type { Server as HttpServer } from "node:http";
import { Server, type Socket } from "socket.io";
import type { AiSnapshot } from "./ai-games.js";

export interface AiSocketSessionProof {
  accessToken: string;
  appSession: string;
}
export interface AiSocketProof extends AiSocketSessionProof {
  tabId: string;
}
export interface AiSocketControl {
  tabId: string;
  connectionId: string;
  generation: number;
  mode: "controller" | "readonly";
  gameId: string | null;
  graceUntil: string | null;
}
export interface AiSocketSnapshot {
  snapshot: Omit<AiSnapshot, "ownerId">;
  serverNow: string;
  control: {
    mode: "controller" | "readonly";
    reason: "other_tab" | null;
    generation: number;
  };
}
export interface AiSocketAdmission {
  connect(): Promise<AiSocketControl>;
  refresh(proof: AiSocketSessionProof): Promise<AiSocketControl>;
  takeover(): Promise<AiSocketControl>;
  watch(gameId: string): Promise<AiSocketSnapshot>;
  read(): Promise<AiSocketSnapshot | null>;
  close(): Promise<void>;
}
export interface AiSocketDependencies {
  corsOrigins: readonly string[];
  /** Trusted identity port; every command/read must check the fixed session and physical authority. */
  open(socket: Socket, proof: AiSocketProof): Promise<AiSocketAdmission>;
}
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const capability = /^[A-Za-z0-9_-]{43}$/;
const invalidSession = "Phiên chơi với máy không hợp lệ";
const unavailable = {
  code: "AI_UNAVAILABLE",
  message: "Chưa thể thực hiện thao tác với máy",
};
const inputInvalid = {
  code: "AI_INPUT_INVALID",
  message: "Thông tin ván với máy không hợp lệ",
};
const expired = { code: "AUTH_REQUIRED", message: invalidSession };
function object(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw Error();
  return value as Record<string, unknown>;
}
function exact(value: unknown, keys: string[]) {
  const row = object(value);
  if (
    Object.keys(row).length !== keys.length ||
    Object.keys(row).some((key) => !keys.includes(key))
  )
    throw Error();
  return row;
}
function proof(
  value: unknown,
  handshake: boolean,
): AiSocketSessionProof | AiSocketProof {
  const row = exact(
    value,
    handshake
      ? ["accessToken", "appSession", "tabId"]
      : ["accessToken", "appSession"],
  );
  if (
    typeof row.accessToken !== "string" ||
    !/^\S{1,8192}$/.test(row.accessToken) ||
    typeof row.appSession !== "string" ||
    !capability.test(row.appSession)
  )
    throw Error();
  const session = { accessToken: row.accessToken, appSession: row.appSession };
  if (!handshake) return Object.freeze(session);
  if (typeof row.tabId !== "string" || !uuid.test(row.tabId)) throw Error();
  return Object.freeze({ ...session, tabId: row.tabId.toLowerCase() });
}
function date(value: unknown): value is string {
  return (
    typeof value === "string" &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString() === value
  );
}
function generation(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value) && value > 0;
}
function authFailure(error: unknown) {
  return (
    !!error &&
    typeof error === "object" &&
    ((error as { status?: unknown }).status === 401 ||
      (error as { code?: unknown }).code === "AUTH_REQUIRED")
  );
}
function control(
  value: unknown,
  socket: Socket,
  tabId: string,
): AiSocketControl {
  const row = exact(value, [
    "tabId",
    "connectionId",
    "generation",
    "mode",
    "gameId",
    "graceUntil",
  ]);
  if (
    row.tabId !== tabId ||
    row.connectionId !== socket.id ||
    !generation(row.generation) ||
    !["controller", "readonly"].includes(row.mode as string) ||
    !(
      row.gameId === null ||
      (typeof row.gameId === "string" && uuid.test(row.gameId))
    ) ||
    !(row.graceUntil === null || date(row.graceUntil))
  )
    throw Error();
  return {
    tabId,
    connectionId: socket.id,
    generation: row.generation,
    mode: row.mode as AiSocketControl["mode"],
    gameId: row.gameId as string | null,
    graceUntil: row.graceUntil as string | null,
  };
}
/** Project trusted snapshots explicitly so private actor IDs or future port fields cannot leak. */
function publicSnapshot(value: unknown): AiSocketSnapshot {
  const row = object(value),
    s = object(row.snapshot),
    c = exact(row.control, ["mode", "reason", "generation"]);
  if (
    !date(row.serverNow) ||
    !generation(c.generation) ||
    !["controller", "readonly"].includes(c.mode as string) ||
    c.reason !== (c.mode === "readonly" ? "other_tab" : null) ||
    typeof s.id !== "string" ||
    !uuid.test(s.id) ||
    !["red", "black", "random"].includes(s.requestedSide as string) ||
    !["red", "black"].includes(s.actualSide as string) ||
    !["easy", "medium", "hard"].includes(s.level as string) ||
    typeof s.position !== "string" ||
    !Array.isArray(s.history) ||
    !s.history.every((item) => typeof item === "string") ||
    !generation(s.version) ||
    !Number.isSafeInteger(s.undoUsed) ||
    (s.undoUsed as number) < 0 ||
    (s.undoUsed as number) > 3 ||
    !["ACTIVE", "FINALIZING", "FINISHED", "ABANDONED"].includes(
      s.status as string,
    ) ||
    !["IDLE", "THINKING", "RETRY"].includes(s.engineState as string) ||
    ![null, "ENGINE_TIMEOUT", "ENGINE_BUSY"].includes(
      s.engineError as string | null,
    )
  )
    throw Error();
  let outcome: AiSocketSnapshot["snapshot"]["outcome"] = null;
  if (s.outcome !== null) {
    const end = object(s.outcome);
    if (
      ![
        "CHECKMATE",
        "STALEMATE",
        "PERPETUAL_CHECK",
        "DRAW_REPETITION",
        "DRAW_NO_CAPTURE",
        "RESIGN",
        "ENGINE_FAILURE",
      ].includes(end.reason as string) ||
      ![null, "red", "black"].includes(end.winner as string | null)
    )
      throw Error();
    outcome = { reason: end.reason, winner: end.winner } as NonNullable<
      AiSocketSnapshot["snapshot"]["outcome"]
    >;
  }
  return {
    snapshot: {
      id: s.id,
      requestedSide: s.requestedSide,
      actualSide: s.actualSide,
      level: s.level,
      position: s.position,
      history: [...s.history],
      version: s.version,
      undoUsed: s.undoUsed,
      status: s.status,
      engineState: s.engineState,
      engineError: s.engineError,
      outcome,
    } as AiSocketSnapshot["snapshot"],
    serverNow: row.serverNow,
    control: {
      mode: c.mode as AiSocketControl["mode"],
      reason: c.reason as "other_tab" | null,
      generation: c.generation,
    },
  };
}
/**
 * Khởi tạo cổng kết nối WebSocket chuyên biệt cho chế độ chơi với AI (namespace `/ai` trên đường dẫn `/ai/socket.io`):
 * - Xác thực handshake phiên đăng nhập và định danh tab client.
 * - Quản lý quyền điều khiển tab (`ai.control`) và cơ chế takeover tab.
 * - Phát cập nhật trạng thái ván cờ AI (`ai.snapshot`) và xử lý sự kiện `ai.watch`, `ai.refresh`.
 */
export function attachAiSocketGateway(
  httpServer: HttpServer,
  dependencies: AiSocketDependencies,
) {
  const events = ["request", "upgrade", "close", "listening"] as const;
  const previous = events.map((event) => httpServer.listeners(event));
  const io = new Server(httpServer, {
    path: "/ai/socket.io",
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
  const namespace = io.of("/ai");
  type Peer = {
    socket: Socket;
    tabId: string;
    port?: AiSocketAdmission;
    state?: AiSocketControl;
    queue: Promise<void>;
    ended: boolean;
    epoch: number;
    polling: boolean;
    closed?: Promise<void>;
  };
  const peers = new Set<Peer>(),
    admitted = new WeakMap<Socket, Peer>(),
    pending = new Set<Promise<unknown>>();
  let stopping = false,
    closing: Promise<void> | undefined;
  function track<T>(operation: Promise<T>): Promise<T> {
    pending.add(operation);
    void operation.finally(() => pending.delete(operation)).catch(() => {});
    return operation;
  }
  function closePeer(peer: Peer): Promise<void> {
    peer.ended = true;
    peer.epoch++;
    if (!peer.port) return Promise.resolve();
    if (peer.closed) return peer.closed;
    peer.closed = track(
      peer.queue
        .then(async () => {
          for (let attempt = 0; ; attempt++) {
            try {
              await peer.port!.close();
              break;
            } catch (error) {
              if (attempt === 2) throw error;
            }
          }
        })
        .finally(() => peers.delete(peer)),
    );
    void peer.closed.catch(() => {});
    return peer.closed;
  }
  function alive(peer: Peer, epoch: number) {
    return (
      !stopping && !peer.ended && peer.epoch === epoch && peer.socket.connected
    );
  }
  function failure(peer: Peer, error: unknown) {
    if (authFailure(error)) {
      peer.socket.emit("ai.sessionExpired", expired);
      peer.socket.disconnect(true);
      return expired;
    }
    return unavailable;
  }
  function publishControl(peer: Peer, next: AiSocketControl) {
    if (peer.state && next.generation < peer.state.generation) throw Error();
    const changed = JSON.stringify(peer.state) !== JSON.stringify(next);
    peer.state = next;
    if (changed) peer.socket.emit("ai.control", next);
  }
  function publish(peer: Peer, supplied: unknown, watched?: string) {
    const value = publicSnapshot(supplied);
    if (
      !peer.state ||
      value.control.generation < peer.state.generation ||
      (watched && value.snapshot.id !== watched)
    )
      throw Error();
    publishControl(peer, {
      ...peer.state,
      mode: value.control.mode,
      generation: value.control.generation,
      gameId: value.snapshot.id,
    });
    peer.socket.emit("ai.snapshot", value);
  }
  function enqueue(
    peer: Peer,
    work: (epoch: number) => Promise<void>,
    ack?: (value: unknown) => void,
  ) {
    const epoch = peer.epoch;
    peer.queue = track(
      peer.queue.then(async () => {
        if (!alive(peer, epoch)) return;
        try {
          await work(epoch);
        } catch (error) {
          if (!alive(peer, epoch)) return;
          const safe = authFailure(error) ? expired : unavailable;
          ack?.({ ok: false, ...safe });
          failure(peer, error);
        }
      }),
    );
  }
  async function read(peer: Peer, epoch: number) {
    const value = await peer.port!.read();
    if (!alive(peer, epoch)) return;
    if (value !== null) publish(peer, value);
  }
  namespace.use((socket, next) => {
    const admission = (async () => {
      let p: AiSocketProof;
      try {
        p = proof(socket.handshake.auth, true) as AiSocketProof;
      } catch {
        next(Error(invalidSession));
        return;
      }
      const peer: Peer = {
        socket,
        tabId: p.tabId,
        queue: Promise.resolve(),
        ended: false,
        epoch: 0,
        polling: false,
      };
      peers.add(peer);
      socket.conn.once("close", () => {
        void closePeer(peer);
      });
      try {
        if (stopping) throw Error();
        peer.port = await dependencies.open(socket, p);
        for (const method of [
          "connect",
          "refresh",
          "takeover",
          "watch",
          "read",
          "close",
        ] as const)
          if (typeof peer.port?.[method] !== "function") throw Error();
        if (stopping || peer.ended || socket.conn.readyState === "closed") {
          await closePeer(peer);
          return;
        }
        admitted.set(socket, peer);
        next();
      } catch (error) {
        await closePeer(peer).catch(() => {});
        next(Error(authFailure(error) ? invalidSession : unavailable.message));
      }
    })();
    track(admission);
  });
  namespace.on("connection", (socket) => {
    const peer = admitted.get(socket);
    if (!peer || stopping || peer.ended) {
      socket.disconnect(true);
      return;
    }
    socket.once("disconnect", () => {
      void closePeer(peer);
    });
    enqueue(peer, async (epoch) => {
      const next = control(await peer.port!.connect(), socket, peer.tabId);
      if (!alive(peer, epoch)) return;
      publishControl(peer, next);
      await read(peer, epoch);
    });
    for (const event of ["ai.refresh", "ai.takeover", "ai.watch"] as const) {
      socket.on(event, (...args: unknown[]) => {
        const ack =
          typeof args.at(-1) === "function"
            ? (args.pop() as (value: unknown) => void)
            : undefined;
        let command: AiSocketSessionProof | string | undefined;
        try {
          if (event === "ai.takeover") {
            if (args.length) throw Error();
          } else {
            if (args.length !== 1) throw Error();
            if (event === "ai.refresh") command = proof(args[0], false);
            else {
              const row = exact(args[0], ["gameId"]);
              if (typeof row.gameId !== "string" || !uuid.test(row.gameId))
                throw Error();
              command = row.gameId.toLowerCase();
            }
          }
        } catch {
          ack?.({ ok: false, ...inputInvalid });
          return;
        }
        enqueue(
          peer,
          async (epoch) => {
            if (event === "ai.watch") {
              const value = await peer.port!.watch(command as string);
              if (!alive(peer, epoch)) return;
              publish(peer, value, command as string);
            } else {
              const next = control(
                await (event === "ai.refresh"
                  ? peer.port!.refresh(command as AiSocketSessionProof)
                  : peer.port!.takeover()),
                socket,
                peer.tabId,
              );
              if (!alive(peer, epoch)) return;
              publishControl(peer, next);
              await read(peer, epoch);
            }
            if (alive(peer, epoch)) ack?.({ ok: true, control: peer.state });
          },
          ack,
        );
      });
    }
  });
  const timer = setInterval(() => {
    for (const peer of peers) {
      if (peer.polling || !peer.state || !alive(peer, peer.epoch)) continue;
      peer.polling = true;
      enqueue(peer, async (epoch) => {
        try {
          await read(peer, epoch);
        } finally {
          peer.polling = false;
        }
      });
    }
  }, 1000);
  timer.unref();
  return {
    close(): Promise<void> {
      if (closing) return closing;
      stopping = true;
      clearInterval(timer);
      namespace.disconnectSockets(true);
      io.engine.close();
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
        const closes = [...peers].map(closePeer);
        while (pending.size) await Promise.allSettled([...pending]);
        const results = await Promise.allSettled(closes);
        await namespace.adapter.close();
        if (results.some((result) => result.status === "rejected"))
          throw Error(unavailable.message);
      })();
      return closing;
    },
  };
}
