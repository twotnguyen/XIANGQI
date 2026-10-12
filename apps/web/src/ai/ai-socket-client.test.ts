import { afterEach, expect, it, vi } from "vitest";
import { initialPosition, serializePosition } from "@xiangqi/xiangqi-core";
import { connectAi } from "./ai-socket-client.js";

const fixture = vi.hoisted(() => ({
  handlers: new Map<string, (...args: unknown[]) => void>(),
  auth: null as null | ((done: (proof: unknown) => void) => void),
  emit: vi.fn(),
  socket: {
    id: "socket_one",
    connected: true,
    connect: vi.fn(),
    disconnect: vi.fn(),
    removeAllListeners: vi.fn(),
  },
  io: vi.fn(),
}));
vi.mock("socket.io-client", () => ({
  io: fixture.io.mockImplementation((_url, options) => {
    fixture.auth = options.auth;
    return {
      ...fixture.socket,
      on: (event: string, callback: (...args: unknown[]) => void) => {
        fixture.handlers.set(event, callback);
      },
      timeout: () => ({ emit: fixture.emit }),
    };
  }),
}));
const id = "11111111-1111-4111-8111-111111111111";
const other = "22222222-2222-4222-8222-222222222222";
const fen = serializePosition(initialPosition());
const peers: Array<ReturnType<typeof connectAi>> = [];
async function observer(getProof = vi.fn().mockResolvedValue({ accessToken: "token", appSession: "cap" })) {
  const onControl = vi.fn(), onSnapshot = vi.fn(), onConnection = vi.fn(), onError = vi.fn();
  const peer = connectAi({ getProof, onControl, onSnapshot, onConnection, onError });
  peers.push(peer);
  const done = vi.fn();
  fixture.auth!(done);
  await Promise.resolve();
  const tabId = done.mock.calls[0]?.[0].tabId as string;
  const control = { tabId, connectionId: "socket_one", generation: 1, mode: "controller", gameId: id, graceUntil: null };
  return { peer, onControl, onSnapshot, onConnection, onError, control, done };
}
function envelope(version = 0, gameId = id, generation = 1) {
  return {
    snapshot: { id: gameId, requestedSide: "red", actualSide: "red", level: "easy", position: fen, history: [fen], version, status: "ACTIVE", engineState: "IDLE", engineError: null, outcome: null },
    serverNow: "2026-10-11T01:00:00.000Z",
    control: { mode: "controller", reason: null, generation },
  };
}
function deliver(event: string, value?: unknown) { fixture.handlers.get(event)?.(value); }
function success() { fixture.emit.mockImplementation((_event, ...args) => args.at(-1)(null, { ok: true })); }
afterEach(() => {
  peers.splice(0).forEach((peer) => peer.disconnect());
  fixture.handlers.clear();
  vi.clearAllMocks();
  fixture.emit.mockReset();
});
it("uses an isolated authenticated namespace with one tab identity and fresh handshakes", async () => {
  const proof = vi.fn().mockResolvedValueOnce({ accessToken: "first", appSession: "cap" }).mockResolvedValueOnce({ accessToken: "rotated", appSession: "cap" });
  const f = await observer(proof);
  expect(fixture.io).toHaveBeenCalledWith("http://localhost:3000/ai", expect.objectContaining({ path: "/ai/socket.io", transports: ["websocket"], withCredentials: true, autoConnect: false }));
  fixture.auth!(f.done);
  await Promise.resolve();
  expect(f.done.mock.calls.map((call) => call[0])).toEqual([
    { accessToken: "first", appSession: "cap", tabId: f.control.tabId },
    { accessToken: "rotated", appSession: "cap", tabId: f.control.tabId },
  ]);
});
it("waits for this socket's valid control and allows readonly proof for REST reads", async () => {
  const f = await observer();
  deliver("connect");
  expect(f.onConnection).not.toHaveBeenCalledWith(true);
  const pending = f.peer.getControl();
  deliver("ai.control", { ...f.control, connectionId: "foreign" });
  deliver("ai.control", { ...f.control, tabId: other });
  expect(f.onControl).not.toHaveBeenCalled();
  deliver("ai.control", { ...f.control, mode: "readonly" });
  await expect(pending).resolves.toEqual({ tabId: f.control.tabId, connectionId: "socket_one", generation: 1 });
  expect(f.onConnection).toHaveBeenLastCalledWith(true);
});
it.each([
  { generation: 0 }, { generation: 1.5 }, { generation: Number.MAX_SAFE_INTEGER + 1 },
  { gameId: "invalid" }, { graceUntil: "2026-02-30T01:00:00Z" }, { mode: "writable" }, { ownerId: id },
])("rejects malformed control without granting authority", async (patch) => {
  const f = await observer();
  deliver("ai.control", { ...f.control, ...patch });
  expect(f.onControl).not.toHaveBeenCalled();
  expect(f.onConnection).not.toHaveBeenCalledWith(true);
  expect(f.onError).toHaveBeenCalledOnce();
});
it("watches only a canonical game, filters stale versions and mismatched generation or game", async () => {
  const f = await observer();
  deliver("ai.control", f.control);
  success();
  await f.peer.watch(id.toUpperCase());
  deliver("ai.snapshot", envelope(3));
  deliver("ai.snapshot", envelope(2));
  deliver("ai.snapshot", envelope(4, other));
  deliver("ai.snapshot", envelope(4, id, 2));
  deliver("ai.snapshot", { ...envelope(4), privateOwner: id });
  expect(f.onSnapshot).toHaveBeenCalledExactlyOnceWith(envelope(3));
  expect(fixture.emit.mock.calls[0]!.slice(0, 2)).toEqual(["ai.watch", { gameId: id }]);
  await expect(f.peer.watch("invalid")).rejects.toThrow();
});
it("rejects old watch acknowledgements and snapshots when another game is watched", async () => {
  const f = await observer(); deliver("ai.control", f.control);
  const acks: Array<(error: null, ack: unknown) => void> = [];
  fixture.emit.mockImplementation((_event, ...args) => acks.push(args.at(-1)));
  const old = f.peer.watch(id), rejected = expect(old).rejects.toThrow();
  const fresh = f.peer.watch(other);
  deliver("ai.control", { ...f.control, gameId: other });
  acks[1]!(null, { ok: true });
  await fresh;
  acks[0]!(null, { ok: true, control: f.control });
  await rejected;
  deliver("ai.snapshot", envelope(9));
  deliver("ai.snapshot", envelope(0, other));
  expect(f.onSnapshot).toHaveBeenCalledExactlyOnceWith(envelope(0, other));
});
it("refreshes with current proof and takeover emits no client authority metadata", async () => {
  const proof = vi.fn().mockResolvedValue({ accessToken: "first", appSession: "cap" });
  const f = await observer(proof); deliver("ai.control", f.control); success();
  proof.mockResolvedValue({ accessToken: "renewed", appSession: "cap" });
  await f.peer.refresh();
  deliver("ai.control", f.control);
  await f.peer.takeover();
  expect(fixture.emit.mock.calls.map((call) => call.slice(0, -1))).toEqual([
    ["ai.refresh", { accessToken: "renewed", appSession: "cap" }], ["ai.takeover"],
  ]);
});
it("cancels pending proof and late callbacks on final disconnect", async () => {
  let finish!: (proof: { accessToken: string; appSession: string }) => void;
  const f = await observer(vi.fn(() => new Promise((resolve) => { finish = resolve; })));
  const pending = f.peer.getControl(), rejected = expect(pending).rejects.toThrow();
  f.peer.disconnect();
  const counts = [f.onError.mock.calls.length, f.onConnection.mock.calls.length];
  finish({ accessToken: "late", appSession: "cap" }); await Promise.resolve();
  deliver("connect"); deliver("ai.control", f.control); deliver("ai.snapshot", envelope());
  await rejected;
  expect(f.done).not.toHaveBeenCalled(); expect(f.onControl).not.toHaveBeenCalled();
  expect([f.onError.mock.calls.length, f.onConnection.mock.calls.length]).toEqual(counts);
});
it("invalidates authority on network loss and never accepts a late ACK after reconnect", async () => {
  const f = await observer(); deliver("ai.control", f.control);
  let ack!: (error: null, value: unknown) => void;
  fixture.emit.mockImplementation((_event, callback) => { ack = callback; });
  const pending = f.peer.takeover(), rejected = expect(pending).rejects.toThrow();
  deliver("disconnect"); deliver("connect");
  ack(null, { ok: true, control: f.control }); await rejected;
  expect(f.onConnection).toHaveBeenLastCalledWith(false);
  deliver("ai.control", { ...f.control, generation: 2 });
  await expect(f.peer.getControl()).resolves.toMatchObject({ generation: 2 });
});
it("contains server errors and terminal session expiry clears authority", async () => {
  const f = await observer(); deliver("ai.control", f.control);
  fixture.emit.mockImplementation((_event, callback) => callback(null, { ok: false, code: "AUTH_REQUIRED", message: "private-token" }));
  await expect(f.peer.takeover()).rejects.toThrow("Phiên đăng nhập");
  expect(f.onError.mock.calls.flat().join()).not.toContain("private-token");
  expect(fixture.socket.disconnect).toHaveBeenCalledOnce();
  await expect(f.peer.getControl()).rejects.toThrow();
});
