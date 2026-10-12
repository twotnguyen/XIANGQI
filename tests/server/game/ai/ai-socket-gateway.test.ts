import { createServer } from "node:http";
import { randomUUID } from "node:crypto";
import { Server } from "socket.io";
import { io, type Socket as ClientSocket } from "socket.io-client";
import { afterEach, expect, it, vi } from "vitest";
import { initialPosition, serializePosition } from "@xiangqi/xiangqi-core";
import {
  attachAiSocketGateway,
  type AiSocketAdmission,
  type AiSocketControl,
  type AiSocketDependencies,
  type AiSocketSnapshot,
} from "@server/game/ai/ai-socket-gateway.js";

// Transport is native; admission and all private business ports are controlled fixtures.
const origin = "http://localhost:5173";
const proof = () => ({
  accessToken: "synthetic-token",
  appSession: "a".repeat(43),
  tabId: randomUUID(),
});
const clients: ClientSocket[] = [];
const cleanup: (() => Promise<void>)[] = [];
afterEach(async () => {
  clients.splice(0).forEach((client) => client.disconnect());
  for (const close of cleanup.splice(0).reverse()) await close();
});
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}
function once(client: ClientSocket, event: string): Promise<unknown> {
  return new Promise((resolve) => client.once(event, resolve));
}
function command(client: ClientSocket, event: string, ...args: unknown[]) {
  return new Promise((resolve) => client.emit(event, ...args, resolve));
}
function snapshot(
  control: AiSocketControl,
  position = serializePosition(initialPosition()),
): AiSocketSnapshot {
  return {
    snapshot: {
      id: control.gameId!,
      requestedSide: "red",
      actualSide: "red",
      level: "easy",
      position,
      history: [position],
      version: 1,
      status: "ACTIVE",
      engineState: "IDLE",
      engineError: null,
      outcome: null,
    },
    serverNow: new Date().toISOString(),
    control: {
      mode: control.mode,
      reason: control.mode === "readonly" ? "other_tab" : null,
      generation: control.generation,
    },
  };
}
async function fixture(custom?: AiSocketDependencies["open"]) {
  const http = createServer((_request, response) =>
    response.end("shared-http"),
  );
  const realtime = new Server(http, {
    path: "/realtime/socket.io",
    destroyUpgrade: false,
  });
  const ports: AiSocketAdmission[] = [];
  const open = vi.fn<AiSocketDependencies["open"]>(
    custom ??
      (async (socket, p) => {
        const control: AiSocketControl = {
          tabId: p.tabId,
          connectionId: socket.id,
          generation: 1,
          mode: "controller",
          gameId: randomUUID(),
          graceUntil: null,
        };
        const port = {
          connect: vi.fn(async () => control),
          refresh: vi.fn(async () => control),
          takeover: vi.fn(async () => control),
          watch: vi.fn(async () => snapshot(control)),
          read: vi.fn(async () => snapshot(control)),
          close: vi.fn(async () => {}),
        };
        ports.push(port);
        return port;
      }),
  );
  const gateway = attachAiSocketGateway(http, { corsOrigins: [origin], open });
  await new Promise<void>((resolve) => http.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${(http.address() as { port: number }).port}`;
  cleanup.push(async () => {
    await gateway.close();
    await new Promise<void>((resolve) => realtime.close(() => resolve()));
  });
  function client(
    auth: unknown = proof(),
    namespace = "/ai",
    requestOrigin = origin,
  ) {
    const socket = io(base + namespace, {
      path: "/ai/socket.io",
      transports: ["websocket"],
      forceNew: true,
      reconnection: false,
      auth: auth as Record<string, unknown>,
      extraHeaders: { Origin: requestOrigin },
      autoConnect: false,
    });
    clients.push(socket);
    return socket;
  }
  return { gateway, base, http, realtime, client, open, ports };
}
it("uses a native private namespace and keeps shared HTTP and realtime alive after close", async () => {
  const f = await fixture(),
    client = f.client(),
    control = once(client, "ai.control"),
    board = once(client, "ai.snapshot");
  client.connect();
  expect(await control).toMatchObject({
    connectionId: client.id,
    mode: "controller",
  });
  expect(await board).toMatchObject({ snapshot: { status: "ACTIVE" } });
  expect(f.ports[0]!.connect).toHaveBeenCalledOnce();
  await f.gateway.close();
  expect(await (await fetch(f.base)).text()).toBe("shared-http");
  const other = io(f.base, {
    path: "/realtime/socket.io",
    transports: ["websocket"],
    reconnection: false,
  });
  clients.push(other);
  await once(other, "connect");
  expect(other.connected).toBe(true);
  expect(f.ports[0]!.close).toHaveBeenCalledOnce();
});
it.each([
  {},
  { ...proof(), ownerId: randomUUID() },
  { ...proof(), accessToken: " " },
  { ...proof(), accessToken: "x".repeat(8193) },
  { ...proof(), appSession: "bad" },
  { ...proof(), tabId: "bad" },
])("rejects malformed handshake before admission", async (auth) => {
  const f = await fixture(),
    client = f.client(auth),
    rejected = once(client, "connect_error");
  client.connect();
  expect(((await rejected) as Error).message).toBe(
    "Phiên chơi với máy không hợp lệ",
  );
  expect(f.open).not.toHaveBeenCalled();
});
it("rejects unapproved origins and the root namespace", async () => {
  const f = await fixture();
  for (const client of [
    f.client(proof(), "/ai", "http://untrusted.invalid"),
    f.client(proof(), "/"),
  ]) {
    const rejected = once(client, "connect_error");
    client.connect();
    await rejected;
  }
  expect(f.open).not.toHaveBeenCalled();
});
it("rejects malformed commands before ports and freezes refresh proof", async () => {
  const f = await fixture(),
    client = f.client(),
    ready = once(client, "ai.snapshot");
  client.connect();
  await ready;
  for (const [event, value] of [
    ["ai.refresh", { ...proof() }],
    ["ai.watch", { gameId: "bad" }],
    ["ai.takeover", { ownerId: randomUUID() }],
  ])
    expect(await command(client, event as string, value)).toMatchObject({
      ok: false,
      code: "AI_INPUT_INVALID",
    });
  expect(f.ports[0]!.refresh).not.toHaveBeenCalled();
  expect(f.ports[0]!.watch).not.toHaveBeenCalled();
  expect(f.ports[0]!.takeover).not.toHaveBeenCalled();
  expect(
    await command(client, "ai.refresh", {
      accessToken: "refreshed",
      appSession: "b".repeat(43),
    }),
  ).toMatchObject({ ok: true });
  const supplied = vi.mocked(f.ports[0]!.refresh).mock.calls[0]![0];
  expect(Object.isFrozen(supplied)).toBe(true);
});
it("publishes each peer's own fresh private board and strips extra fields", async () => {
  const f = await fixture(),
    a = f.client(),
    b = f.client(),
    ar = once(a, "ai.snapshot"),
    br = once(b, "ai.snapshot");
  a.connect();
  b.connect();
  const av = (await ar) as AiSocketSnapshot,
    bv = (await br) as AiSocketSnapshot;
  expect(av.snapshot.id).not.toBe(bv.snapshot.id);
  const port = f.ports[0]!;
  vi.mocked(port.watch).mockRejectedValueOnce({
    status: 403,
    message: "secret-token",
    code: "AI_FORBIDDEN",
  });
  const failed = await command(a, "ai.watch", { gameId: randomUUID() });
  expect(failed).toMatchObject({ ok: false });
  expect(JSON.stringify(failed)).not.toContain("secret-token");
});
it("closes late disconnected admission exactly once without connecting its port", async () => {
  const gate = deferred<AiSocketAdmission>(),
    entered = deferred<void>();
  const f = await fixture(async () => {
      entered.resolve();
      return gate.promise;
    }),
    client = f.client();
  client.connect();
  await entered.promise;
  client.disconnect();
  const port = {
    connect: vi.fn(),
    refresh: vi.fn(),
    takeover: vi.fn(),
    watch: vi.fn(),
    read: vi.fn(),
    close: vi.fn(async () => {}),
  };
  gate.resolve(port);
  await f.gateway.close();
  expect(port.connect).not.toHaveBeenCalled();
  expect(port.close).toHaveBeenCalledOnce();
});
it("serializes pending refresh and close, drains late work and prevents stale publication", async () => {
  const f = await fixture(),
    client = f.client(),
    ready = once(client, "ai.snapshot");
  client.connect();
  await ready;
  const port = f.ports[0]!,
    gate = deferred<AiSocketControl>(),
    entered = deferred<void>();
  vi.mocked(port.refresh).mockImplementationOnce(async () => {
    entered.resolve();
    return gate.promise;
  });
  const boards = vi.fn();
  client.on("ai.snapshot", boards);
  client.emit("ai.refresh", {
    accessToken: "fresh",
    appSession: "b".repeat(43),
  });
  await entered.promise;
  client.emit("ai.takeover");
  const closing = f.gateway.close();
  expect(port.close).not.toHaveBeenCalled();
  const initial = await port.connect();
  gate.resolve(initial);
  await closing;
  expect(port.takeover).not.toHaveBeenCalled();
  expect(port.close).toHaveBeenCalledOnce();
  expect(boards).not.toHaveBeenCalled();
});
it("expires fixed sessions with a static message and disconnects", async () => {
  const f = await fixture(),
    client = f.client(),
    ready = once(client, "ai.snapshot");
  client.connect();
  await ready;
  vi.mocked(f.ports[0]!.read).mockRejectedValueOnce({
    status: 401,
    message: "private-token-provider-error",
  });
  const expired = once(client, "ai.sessionExpired"),
    disconnected = once(client, "disconnect");
  const failed = await command(client, "ai.takeover");
  expect(failed).toMatchObject({ ok: false, code: "AUTH_REQUIRED" });
  expect(await expired).toEqual({
    code: "AUTH_REQUIRED",
    message: "Phiên chơi với máy không hợp lệ",
  });
  await disconnected;
});
