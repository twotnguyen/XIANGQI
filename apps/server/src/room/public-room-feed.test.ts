import { createServer, type Server } from "node:http";
import { io, type Socket } from "socket.io-client";
import { Server as SocketServer } from "socket.io";
import { afterEach, expect, test, vi } from "vitest";
import {
  attachPublicRoomFeed,
  parsePublicFeedProof,
} from "./public-room-feed.js";
import type { PublicRoomView } from "./public-room-store.js";
const origin = "http://localhost:5174";
const proof = {
  kind: "member",
  accessToken: "test-bearer",
  appSession: "a".repeat(43),
};
const room = (index = 1): PublicRoomView => ({
  roomId: `00000000-0000-4000-8000-${String(index).padStart(12, "0")}`,
  name: `Phòng ${index}`,
  host: { displayName: "Người chơi", isGuest: false },
  timeMinutes: 10,
  status: "waiting",
  spectators: 0,
  viewerLimit: 5,
  emptySeats: 1,
  canPlay: true,
  canWatch: true,
  publicOpenedAt: "2026-10-11T00:00:00.000Z",
});
let server: Server;
let existingGateway: SocketServer | undefined;
let feed: ReturnType<typeof attachPublicRoomFeed>;
const sockets: Socket[] = [];
async function setup(
  open: Parameters<typeof attachPublicRoomFeed>[1]["open"],
  withGateway = false,
) {
  server = createServer((_req, res) => res.end("healthy"));
  await new Promise<void>((r) => server.listen(0, "127.0.0.1", r));
  if (withGateway) {
    existingGateway = new SocketServer(server);
    existingGateway.on("connection", (socket) =>
      socket.on("probe", () => socket.emit("reply", "still alive")),
    );
  }
  feed = attachPublicRoomFeed(server, { corsOrigins: [origin], open });
  const address = server.address();
  if (!address || typeof address === "string") throw Error("address");
  return `http://127.0.0.1:${address.port}`;
}
function connect(url: string, auth: unknown = proof, clientOrigin = origin) {
  const socket = io(`${url}/public-rooms`, {
    path: "/public-rooms/socket.io",
    auth: auth as object,
    extraHeaders: { Origin: clientOrigin },
    transports: ["websocket"],
    reconnection: false,
    autoConnect: false,
  });
  sockets.push(socket);
  return socket;
}
function event(socket: Socket, name: string): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(Error(`missing ${name}`)), 4000);
    socket.once(name, (value) => {
      clearTimeout(timeout);
      resolve(value);
    });
  });
}
afterEach(async () => {
  sockets.splice(0).forEach((s) => s.disconnect());
  if (feed) await feed.close();
  if (existingGateway) {
    await existingGateway.close();
    existingGateway = undefined;
  }
  if (server?.listening)
    await new Promise<void>((r) => server.close(() => r()));
});
test("strict proof rejects authority injection, mixed proof, missing fields and oversized bearer", () => {
  expect(parsePublicFeedProof(proof)).toEqual(proof);
  expect(
    parsePublicFeedProof({ kind: "guest", guestCapability: "g".repeat(43) }),
  ).toEqual({ kind: "guest", guestCapability: "g".repeat(43) });
  for (const value of [
    null,
    {},
    { ...proof, userId: "private" },
    { ...proof, guestCapability: "g".repeat(43) },
    { ...proof, appSession: "bad" },
    { ...proof, accessToken: "x".repeat(8193) },
    { kind: "guest", guestCapability: "g".repeat(43), role: "player" },
  ])
    expect(() => parsePublicFeedProof(value)).toThrow();
});
test("native socket initial/refill snapshot preserves full50 and strips private fields", async () => {
  let rooms = Array.from({ length: 50 }, (_, i) => ({
    ...room(i + 1),
    inviteCode: "PRIVATE",
    host: { ...room().host, userId: "PRIVATE" },
  }));
  const url = await setup(async (received) => {
    expect(received).toEqual(proof);
    return { read: async () => rooms };
  });
  const socket = connect(url);
  const initial = event(socket, "public.rooms");
  socket.connect();
  const first = (await initial) as {
    rooms: PublicRoomView[];
    serverNow: string;
  };
  expect(first.rooms).toHaveLength(50);
  expect(JSON.stringify(first)).not.toContain("PRIVATE");
  expect(Date.parse(first.serverNow)).toBeGreaterThan(0);
  const next = event(socket, "public.rooms");
  const changedAt = performance.now();
  rooms = Array.from({ length: 50 }, (_, i) => ({
    ...room(i + 2),
    inviteCode: "PRIVATE",
    host: { ...room().host, userId: "PRIVATE" },
  }));
  expect(
    ((await next) as { rooms: PublicRoomView[] }).rooms.map((r) => r.roomId),
  ).toEqual(rooms.map((r) => r.roomId));
  expect(performance.now() - changedAt).toBeLessThanOrEqual(2000);
  const listener = vi.fn();
  socket.on("public.rooms", listener);
  await new Promise((r) => setTimeout(r, 1100));
  expect(listener).not.toHaveBeenCalled();
}, 10000);
test("admission rejects malformed proof and forbidden websocket origin without opening auth", async () => {
  const open = vi.fn(async () => ({ read: async () => [] }));
  const url = await setup(open);
  const bad = connect(url, { ...proof, role: "member" });
  const error = event(bad, "connect_error");
  bad.connect();
  expect(((await error) as Error).message).toBe("Phiên truy cập không hợp lệ");
  const denied = connect(url, proof, "https://foreign.invalid");
  const deniedError = event(denied, "connect_error");
  denied.connect();
  await deniedError;
  expect(open).not.toHaveBeenCalled();
});
test("503 retries without stale snapshot; later401 emits sanitized error and disconnects", async () => {
  let failure = 0;
  const url = await setup(async () => ({
    read: async () => {
      if (failure) throw Object.assign(Error("SECRET"), { status: failure });
      return [room()];
    },
  }));
  const socket = connect(url);
  const first = event(socket, "public.rooms");
  socket.connect();
  await first;
  const snapshots = vi.fn();
  socket.on("public.rooms", snapshots);
  failure = 503;
  const outage = event(socket, "public.error");
  expect(await outage).toEqual({
    code: "PUBLIC_ROOMS_UNAVAILABLE",
    message: "Không thể tải danh sách phòng",
  });
  expect(socket.connected).toBe(true);
  expect(snapshots).not.toHaveBeenCalled();
  const recovered = event(socket, "public.rooms");
  failure = 0;
  expect(((await recovered) as { rooms: PublicRoomView[] }).rooms).toEqual([
    room(),
  ]);
  expect(snapshots).toHaveBeenCalledTimes(1);
  snapshots.mockClear();
  failure = 401;
  const expired = event(socket, "public.error");
  const disconnected = event(socket, "disconnect");
  expect(await expired).toEqual({
    code: "AUTH_REQUIRED",
    message: "Phiên truy cập không hợp lệ",
  });
  await disconnected;
}, 10000);
test("held peer is singleflight and cannot starve another; close drains read and preserves HTTP", async () => {
  let release!: (value: PublicRoomView[]) => void;
  let calls = 0;
  let fastRooms = [room()];
  const held = new Promise<PublicRoomView[]>((r) => {
    release = r;
  });
  const url = await setup(async (value) => ({
    read: async () => {
      if (value.kind === "guest") {
        calls++;
        return held;
      }
      return fastRooms;
    },
  }));
  const slow = connect(url, { kind: "guest", guestCapability: "g".repeat(43) });
  slow.connect();
  const fast = connect(url);
  const initial = event(fast, "public.rooms");
  fast.connect();
  await initial;
  fastRooms = [room(2)];
  const updated = (await event(fast, "public.rooms")) as {
    rooms: PublicRoomView[];
  };
  expect(updated.rooms[0]?.roomId).toBe(room(2).roomId);
  expect(calls).toBe(1);
  let closed = false;
  const closing = feed.close().then(() => {
    closed = true;
  });
  await new Promise((r) => setTimeout(r, 20));
  expect(closed).toBe(false);
  release([room()]);
  await closing;
  expect(await (await fetch(`${url}/health`)).text()).toBe("healthy");
});
test("malformed authoritative rows fail closed rather than leaking/rendering wrong DTO", async () => {
  const url = await setup(async () => ({
    read: async () => [{ ...room(), spectators: 6 }],
  }));
  const socket = connect(url);
  const snapshots = vi.fn();
  socket.on("public.rooms", snapshots);
  const error = event(socket, "public.error");
  socket.connect();
  await error;
  expect(snapshots).not.toHaveBeenCalled();
});
test("closing pending admission drains auth and never starts read", async () => {
  let release!: () => void;
  const admission = new Promise<void>((r) => {
    release = r;
  });
  const read = vi.fn(async () => [room()]);
  let entered!: () => void;
  const opening = new Promise<void>((r) => {
    entered = r;
  });
  const url = await setup(async () => {
    entered();
    await admission;
    return { read };
  });
  const socket = connect(url);
  socket.connect();
  await opening;
  let done = false;
  const closing = feed.close().then(() => {
    done = true;
  });
  await new Promise((r) => setTimeout(r, 20));
  expect(done).toBe(false);
  release();
  await closing;
  expect(read).not.toHaveBeenCalled();
});

test("feed close leaves the existing room gateway available for current and new sockets", async () => {
  const url = await setup(async () => ({ read: async () => [] }), true);
  const other = io(url, {
    transports: ["websocket"],
    autoConnect: false,
    reconnection: false,
  });
  sockets.push(other);
  const connected = event(other, "connect");
  other.connect();
  await connected;
  await feed.close();
  const reply = event(other, "reply");
  other.emit("probe");
  expect(await reply).toBe("still alive");
  const newcomer = io(url, {
    transports: ["websocket"],
    autoConnect: false,
    reconnection: false,
  });
  sockets.push(newcomer);
  const newConnection = event(newcomer, "connect");
  newcomer.connect();
  await newConnection;
  const secondReply = event(newcomer, "reply");
  newcomer.emit("probe");
  expect(await secondReply).toBe("still alive");
});
test("polling CORS allows exact origin with credentials and rejects another origin", async () => {
  const url = await setup(async () => ({ read: async () => [] }));
  const path = `${url}/public-rooms/socket.io/?EIO=4&transport=polling`;
  const allowed = await fetch(path, { headers: { Origin: origin } });
  expect(allowed.status).toBe(200);
  expect(allowed.headers.get("access-control-allow-origin")).toBe(origin);
  expect(allowed.headers.get("access-control-allow-credentials")).toBe("true");
  await allowed.text();
  const denied = await fetch(path, {
    headers: { Origin: "https://foreign.invalid" },
  });
  expect(denied.status).toBe(403);
  expect(denied.headers.get("access-control-allow-origin")).toBeNull();
});
test.each([
  ["more than50", Array.from({ length: 51 }, (_, i) => room(i + 1))],
  ["duplicate roomID", [room(), room()]],
  ["invalid name", [{ ...room(), name: "x".repeat(61) }]],
  ["private status", [{ ...room(), status: "locked" }]],
])("authoritative %s is rejected safely", async (_name, rows) => {
  const url = await setup(async () => ({
    read: async () => rows as PublicRoomView[],
  }));
  const socket = connect(url);
  const snapshots = vi.fn();
  socket.on("public.rooms", snapshots);
  const error = event(socket, "public.error");
  socket.connect();
  expect(await error).toEqual({
    code: "PUBLIC_ROOMS_UNAVAILABLE",
    message: "Không thể tải danh sách phòng",
  });
  expect(snapshots).not.toHaveBeenCalled();
});

test("recovery from SQL503 publishes a fresh successful snapshot even when rooms are unchanged", async () => {
  let failed = false;
  const url = await setup(async () => ({
    read: async () => {
      if (failed)
        throw Object.assign(Error("private-database"), { status: 503 });
      return [room()];
    },
  }));
  const socket = connect(url),
    initial = event(socket, "public.rooms");
  socket.connect();
  await initial;
  failed = true;
  const outage = event(socket, "public.error");
  expect(await outage).toEqual({
    code: "PUBLIC_ROOMS_UNAVAILABLE",
    message: "Không thể tải danh sách phòng",
  });
  expect(socket.connected).toBe(true);
  const recovered = event(socket, "public.rooms");
  failed = false;
  expect(((await recovered) as { rooms: PublicRoomView[] }).rooms).toEqual([
    room(),
  ]);
}, 8000);
