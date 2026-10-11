import { afterEach, expect, it, vi } from "vitest";
import { connectRoom } from "./room-client.js";
it("does not pass a late credential result to a socket that has been closed", async () => {
  let finish!: (value: { accessToken: string; appSession: string }) => void;
  const peer = connectRoom({
    roomId: "room",
    getProof: () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
    onSnapshot: vi.fn(),
    onConnection: vi.fn(),
    onError: vi.fn(),
  });
  const done = vi.fn();
  fixture.options!.auth(done);
  peer.close();
  finish({ accessToken: "late", appSession: "cap" });
  await Promise.resolve();
  expect(done).not.toHaveBeenCalled();
});
const fixture = vi.hoisted(() => ({
  handlers: new Map<string, (...args: unknown[]) => void>(),
  options: null as null | { auth: (done: (proof: unknown) => void) => void },
  emit: vi.fn(),
  socket: {
    connected: true,
    connect: vi.fn(),
    disconnect: vi.fn(),
    removeAllListeners: vi.fn(),
  },
}));
vi.mock("socket.io-client", () => ({
  io: vi.fn((_base, options) => {
    fixture.options = options;
    return {
      ...fixture.socket,
      on: (event: string, callback: (...args: unknown[]) => void) =>
        fixture.handlers.set(event, callback),
      timeout: () => ({ emit: fixture.emit }),
    };
  }),
}));
afterEach(() => {
  vi.clearAllMocks();
  fixture.handlers.clear();
});
it("accepts room closure only for this room with the fixed public notice", () => {
  const onClosed = vi.fn();
  const peer = connectRoom({
    roomId: "room",
    getProof: vi.fn(),
    onSnapshot: vi.fn(),
    onConnection: vi.fn(),
    onError: vi.fn(),
    onClosed,
  });
  fixture.handlers.get("room.closed")?.({
    roomId: "other",
    message: "Phòng đã đóng",
  });
  fixture.handlers.get("room.closed")?.({
    roomId: "room",
    message: "private error",
  });
  expect(onClosed).not.toHaveBeenCalled();
  fixture.handlers.get("room.closed")?.({
    roomId: "room",
    message: "Phòng đã đóng",
  });
  fixture.handlers.get("room.closed")?.({
    roomId: "room",
    message: "Phòng đã đóng",
  });
  expect(onClosed).toHaveBeenCalledExactlyOnceWith("Phòng đã đóng");
  peer.close();
});
it("obtains fresh in-memory proof on every handshake and reuses the same tab identity", async () => {
  const proof = vi
    .fn()
    .mockResolvedValueOnce({ accessToken: "first", appSession: "cap" })
    .mockResolvedValueOnce({ accessToken: "renewed", appSession: "cap" });
  const peer = connectRoom({
    roomId: "room",
    getProof: proof,
    onSnapshot: vi.fn(),
    onConnection: vi.fn(),
    onError: vi.fn(),
  });
  const done = vi.fn();
  fixture.options!.auth(done);
  await Promise.resolve();
  fixture.options!.auth(done);
  await Promise.resolve();
  expect(done.mock.calls[0]![0]).toMatchObject({
    accessToken: "first",
    roomId: "room",
    appSession: "cap",
    tabId: expect.stringMatching(/^[0-9a-f-]{36}$/),
  });
  expect(done.mock.calls[1]![0]).toMatchObject({
    accessToken: "renewed",
    tabId: done.mock.calls[0]![0].tabId,
  });
  peer.close();
  expect(fixture.socket.disconnect).toHaveBeenCalledOnce();
});
it("sends Ready only through versioned command and rejects ambiguous acknowledgements without retry", async () => {
  const peer = connectRoom({
    roomId: "room",
    getProof: vi.fn(),
    onSnapshot: vi.fn(),
    onConnection: vi.fn(),
    onError: vi.fn(),
  });
  fixture.emit.mockImplementation((_event, _command, callback) =>
    callback(new Error("timeout")),
  );
  await expect(
    peer.command({ type: "room.ready", payload: { ready: true } }, 7),
  ).rejects.toThrow("Chưa nhận được xác nhận");
  expect(fixture.emit).toHaveBeenCalledTimes(1);
  expect(fixture.emit.mock.calls[0]![1]).toEqual({
    commandId: expect.any(String),
    roomId: "room",
    expectedVersion: 7,
    action: { type: "room.ready", payload: { ready: true } },
  });
  peer.close();
});

const roomId = "11111111-1111-4111-8111-111111111111";
function snapshot(lastMove: unknown = null) {
  return {
    roomId,
    version: 4,
    serverNow: "2026-10-11T00:00:00Z",
    role: "red",
    room: {
      name: "Kỳ hữu",
      status: "PLAYING",
      hostId: roomId,
      visibility: "PUBLIC",
      inviteCode: null,
      timeMinutes: 10,
      viewerLimit: 5,
      seats: { red: roomId, black: "22222222-2222-4222-8222-222222222222" },
      ready: { red: true, black: true },
      connected: { red: true, black: true },
      graceUntil: { red: null, black: null },
      countdown: null,
    },
    match: {
      id: "33333333-3333-4333-8333-333333333333",
      version: 3,
      position:
        "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1",
      lastMove,
      turn: "red",
      status: "ACTIVE",
      winner: null,
      endedAt: null,
      result: null,
    },
    clocks: {
      redMs: 600000,
      blackMs: 600000,
      running: "red",
      asOf: "2026-10-11T00:00:00Z",
    },
    control: { mode: "writable", generation: 1, reason: null },
  };
}
function observer() {
  const onSnapshot = vi.fn(),
    onError = vi.fn();
  const peer = connectRoom({
    roomId,
    getProof: vi.fn(),
    onSnapshot,
    onError,
    onConnection: vi.fn(),
  });
  return { peer, onSnapshot, onError };
}
it.each([
  null,
  { from: 54, to: 45, eventVersion: 1 },
  { from: 0, to: 89, eventVersion: 3 },
])("passes nullable or bounded canonical lastMove unchanged", (lastMove) => {
  const { peer, onSnapshot, onError } = observer();
  const state = snapshot(lastMove);
  fixture.handlers.get("room.snapshot")?.(state);
  expect(onSnapshot).toHaveBeenCalledExactlyOnceWith(state);
  expect(onError).not.toHaveBeenCalled();
  peer.close();
});
const badMoves = [
  undefined,
  {},
  [],
  { from: -1, to: 45, eventVersion: 1 },
  { from: 54, to: 90, eventVersion: 1 },
  { from: 54.5, to: 45, eventVersion: 1 },
  { from: "54", to: 45, eventVersion: 1 },
  { from: 54, to: 54, eventVersion: 1 },
  { from: 54, to: 45, eventVersion: 0 },
  { from: 54, to: 45, eventVersion: -1 },
  { from: 54, to: 45, eventVersion: 1.5 },
  { from: 54, to: 45, eventVersion: "1" },
  { from: 54, to: 45, eventVersion: 4 },
  { from: 54, to: 45, eventVersion: Number.MAX_SAFE_INTEGER + 1 },
];
it.each(badMoves)(
  "rejects malformed lastMove without calling the rendering callback",
  (lastMove) => {
    const { peer, onSnapshot, onError } = observer();
    const state = snapshot(lastMove);
    if (lastMove === undefined)
      delete (state.match as { lastMove?: unknown }).lastMove;
    expect(() => fixture.handlers.get("room.snapshot")?.(state)).not.toThrow();
    expect(onSnapshot).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledExactlyOnceWith(
      "Phản hồi phòng không hợp lệ. Vui lòng tải lại.",
    );
    peer.close();
  },
);
it.each(["ok", "error"])(
  "rejects malformed lastMove on %s acknowledgement without retry",
  async (status) => {
    const { peer } = observer();
    fixture.emit.mockImplementation((_event, _command, callback) =>
      callback(null, {
        status,
        commandId: "command",
        error: { code: "VERSION_STALE", message: "private" },
        snapshot: snapshot({ from: 54, to: 45, eventVersion: 4 }),
      }),
    );
    await expect(
      peer.command({ type: "room.ready", payload: { ready: true } }, 4),
    ).rejects.toThrow("Phản hồi phòng không hợp lệ");
    expect(fixture.emit).toHaveBeenCalledOnce();
    peer.close();
  },
);
it("preserves valid acknowledgement snapshots including finished moves whose result has a later version", async () => {
  const { peer } = observer();
  const base = snapshot({ from: 54, to: 45, eventVersion: 1 });
  const state = {
    ...base,
    room: {
      ...base.room,
      status: "WAITING",
      ready: { red: false, black: false },
    },
    match: {
      ...base.match,
      version: 2,
      position:
        "rnbakabnr/9/1c5c1/p1p1p1p1p/9/P8/2P1P1P1P/1C5C1/9/RNBAKABNR b - - 1 1",
      turn: "black",
      status: "FINISHED",
      result: "RESIGN",
      winner: "red",
      endedAt: "2026-10-11T00:00:00Z",
    },
    clocks: { ...base.clocks, running: null },
  };
  const acknowledgement = {
    status: "ok",
    commandId: "command",
    snapshot: state,
  };
  fixture.emit.mockImplementation((_event, _command, callback) =>
    callback(null, acknowledgement),
  );
  await expect(
    peer.command({ type: "room.ready", payload: { ready: true } }, 4),
  ).resolves.toBe(acknowledgement);
  peer.close();
});
it("accepts a waiting snapshot with no match and ignores closed connection deliveries", () => {
  const { peer, onSnapshot } = observer();
  const state = { ...snapshot(), match: null, clocks: null };
  state.room.status = "WAITING";
  fixture.handlers.get("room.snapshot")?.(state);
  expect(onSnapshot).toHaveBeenCalledExactlyOnceWith(state);
  peer.close();
  fixture.handlers.get("room.snapshot")?.(state);
  expect(onSnapshot).toHaveBeenCalledOnce();
});
it("keeps typed domain error acknowledgements without a snapshot", async () => {
  const { peer } = observer();
  const acknowledgement = {
    status: "error",
    error: { code: "MATCH_NOT_YOUR_TURN", message: "Chưa đến lượt" },
  };
  fixture.emit.mockImplementation((_event, _command, callback) =>
    callback(null, acknowledgement),
  );
  await expect(
    peer.command({ type: "room.ready", payload: { ready: true } }, 4),
  ).resolves.toBe(acknowledgement);
  peer.close();
});
