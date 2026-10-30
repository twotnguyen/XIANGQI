import { expect, it, vi } from "vitest";
import { fixture, snapshot, observer } from "./room-socket.test-helper.js";
import { connectRoom } from "@web/features/rooms/room-client.js";
it("does not pass a late credential result to a socket that has been closed", async () => {
  let finish!: (value: {
    kind: "member";
    accessToken: string;
    appSession: string;
  }) => void;
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
  finish({ kind: "member", accessToken: "late", appSession: "cap" });
  await Promise.resolve();
  expect(fixture.socket.connect).not.toHaveBeenCalled();
  expect(done).not.toHaveBeenCalled();
});
it("skips a StrictMode-disposed socket before connecting the live room socket", async () => {
  const input = {
    roomId: "room",
    getProof: vi.fn(),
    onSnapshot: vi.fn(),
    onConnection: vi.fn(),
    onError: vi.fn(),
  };
  const discarded = connectRoom(input);
  discarded.close();
  const live = connectRoom(input);
  expect(fixture.socket.connect).not.toHaveBeenCalled();
  await Promise.resolve();
  expect(fixture.socket.connect).toHaveBeenCalledOnce();
  live.close();
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
    .mockResolvedValueOnce({
      kind: "member",
      accessToken: "first",
      appSession: "cap",
    })
    .mockResolvedValueOnce({
      kind: "member",
      accessToken: "renewed",
      appSession: "cap",
    });
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

it.each([
  null,
  { from: 54, to: 45, eventVersion: 1 },
  { from: 0, to: 89, eventVersion: 3 },
])("passes nullable or bounded canonical lastMove unchanged", (lastMove) => {
  const { peer, onSnapshot, onError } = observer();
  const state = snapshot(lastMove);
  fixture.handlers.get("room.snapshot")?.(state);
  expect(onSnapshot).toHaveBeenCalledExactlyOnceWith({ ...state, draw: null });
  expect(onError).not.toHaveBeenCalled();
  peer.close();
});
it.each(["ACTIVE", "FINISHED"])(
  "accepts %s unlimited snapshots without fabricated clocks",
  (status) => {
    const { peer, onSnapshot, onError } = observer();
    const base = snapshot();
    const state = {
      ...base,
      room: { ...base.room, timeMinutes: 0 },
      match: {
        ...base.match,
        status,
        inactivity:
          status === "ACTIVE"
            ? {
                promptAt: "2026-10-11T00:03:00Z",
                expiresAt: "2026-10-11T00:03:30Z",
                confirmsLeft: 2,
              }
            : null,
      },
      clocks: null,
    };
    fixture.handlers.get("room.snapshot")?.(state);
    expect(onSnapshot).toHaveBeenCalledExactlyOnceWith({
      ...state,
      draw: null,
    });
    expect(onError).not.toHaveBeenCalled();
    peer.close();
  },
);
it("rejects an unlimited active snapshot without an authoritative inactivity deadline", () => {
  const { peer, onSnapshot, onError } = observer();
  const base = snapshot();
  fixture.handlers.get("room.snapshot")?.({
    ...base,
    room: { ...base.room, timeMinutes: 0 },
    clocks: null,
  });
  expect(onSnapshot).not.toHaveBeenCalled();
  expect(onError).toHaveBeenCalledWith(
    "Phản hồi phòng không hợp lệ. Vui lòng tải lại.",
  );
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
  ).resolves.toEqual({
    ...acknowledgement,
    snapshot: { ...state, draw: null },
  });
  peer.close();
});
it("accepts a waiting snapshot with no match and ignores closed connection deliveries", () => {
  const { peer, onSnapshot } = observer();
  const state = { ...snapshot(), match: null, clocks: null };
  state.room.status = "WAITING";
  fixture.handlers.get("room.snapshot")?.(state);
  expect(onSnapshot).toHaveBeenCalledExactlyOnceWith({ ...state, draw: null });
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

it.each([
  null,
  undefined,
  { redMs: -1, blackMs: 600000, running: "red", asOf: "2026-10-11T00:00:00Z" },
  { redMs: 600000, blackMs: NaN, running: "red", asOf: "2026-10-11T00:00:00Z" },
  {
    redMs: 600000,
    blackMs: 600000,
    running: "black",
    asOf: "2026-10-11T00:00:00Z",
  },
  {
    redMs: 600000,
    blackMs: 600000,
    running: null,
    asOf: "2026-10-11T00:00:00Z",
  },
  { redMs: 600000, blackMs: 600000, running: "red", asOf: "invalid" },
])("rejects unusable active clocks before rendering", (clocks) => {
  const { peer, onSnapshot, onError } = observer();
  fixture.handlers.get("room.snapshot")?.({ ...snapshot(), clocks });
  expect(onSnapshot).not.toHaveBeenCalled();
  expect(onError).toHaveBeenCalledOnce();
  peer.close();
});
it("requests a fresh readonly snapshot without issuing a game command", async () => {
  const { peer } = observer();
  const state = snapshot();
  state.control.mode = "readonly";
  fixture.emit.mockImplementation((event, callback) => {
    expect(event).toBe("room.sync");
    callback(null, { status: "ok", commandId: "sync", snapshot: state });
  });
  await expect(peer.refresh()).resolves.toEqual({ ...state, draw: null });
  expect(fixture.emit).toHaveBeenCalledOnce();
  peer.close();
});
it("rejects malformed refresh clocks and never retries", async () => {
  const { peer } = observer();
  fixture.emit.mockImplementation((_event, callback) =>
    callback(null, { status: "ok", snapshot: { ...snapshot(), clocks: null } }),
  );
  await expect(peer.refresh()).rejects.toThrow("Phản hồi phòng không hợp lệ");
  expect(fixture.emit).toHaveBeenCalledOnce();
  peer.close();
});
it("rejects unavailable refresh with a fixed message rather than a provider body", async () => {
  const { peer } = observer();
  fixture.emit.mockImplementation((_event, callback) =>
    callback(null, {
      status: "error",
      error: { code: "PRIVATE", message: "PRIVATE_PROVIDER" },
    }),
  );
  await expect(peer.refresh()).rejects.toThrow("Chưa thể đồng bộ phòng");
  peer.close();
});
const validDraw = {
  offers: [
    {
      id: "44444444-4444-4444-8444-444444444444",
      sender: "black",
      expiresAt: "2026-10-11T00:00:30Z",
    },
  ],
  remainingMoves: { red: 5, black: 0 },
};
it("accepts and whitelists actual draw fields while legacy absent draw normalizes null", () => {
  const { peer, onSnapshot } = observer();
  fixture.handlers.get("room.snapshot")?.({
    ...snapshot(),
    draw: {
      ...validDraw,
      secret: "private",
      offers: [{ ...validDraw.offers[0], private: "not public" }],
    },
  });
  expect(onSnapshot.mock.calls[0]![0].draw).toEqual(validDraw);
  fixture.handlers.get("room.snapshot")?.(snapshot());
  expect(onSnapshot.mock.calls[1]![0].draw).toBeNull();
  peer.close();
});
it.each([
  {
    offers: [
      ...validDraw.offers,
      { ...validDraw.offers[0], id: "55555555-5555-4555-8555-555555555555" },
    ],
    remainingMoves: { red: 0, black: 0 },
  },
  {
    offers: [...validDraw.offers, { ...validDraw.offers[0], sender: "red" }],
    remainingMoves: { red: 0, black: 0 },
  },
  {
    offers: [...validDraw.offers, ...validDraw.offers, ...validDraw.offers],
    remainingMoves: { red: 0, black: 0 },
  },
  {
    offers: [...validDraw.offers, ...validDraw.offers],
    remainingMoves: { red: 0, black: 0 },
  },
  {
    offers: [{ ...validDraw.offers[0], id: "bad" }],
    remainingMoves: { red: 0, black: 0 },
  },
  {
    offers: [{ ...validDraw.offers[0], sender: "WHITE" }],
    remainingMoves: { red: 0, black: 0 },
  },
  {
    offers: [{ ...validDraw.offers[0], expiresAt: "invalid" }],
    remainingMoves: { red: 0, black: 0 },
  },
  { offers: [], remainingMoves: { red: 6, black: 0 } },
  { offers: [], remainingMoves: { red: -1, black: 0 } },
  { offers: [], remainingMoves: { red: 0.5, black: 0 } },
  { offers: [], remainingMoves: { red: "0", black: 0 } },
  { offers: [], remainingMoves: { red: 0 } },
])(
  "rejects malformed draw projection without delivering a snapshot",
  (draw) => {
    const { peer, onSnapshot, onError } = observer();
    fixture.handlers.get("room.snapshot")?.({ ...snapshot(), draw });
    expect(onSnapshot).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledExactlyOnceWith(
      "Phản hồi phòng không hợp lệ. Vui lòng tải lại.",
    );
    peer.close();
  },
);
it.each(["spectator", "FINISHED", "INTERRUPTED", "no-match"])(
  "rejects draw attached to unauthorized or terminal %s snapshot",
  (state) => {
    const { peer, onSnapshot, onError } = observer(),
      base = snapshot();
    const value =
      state === "spectator"
        ? { ...base, role: "spectator" }
        : state === "no-match"
          ? { ...base, match: null, clocks: null }
          : {
              ...base,
              match: { ...base.match, status: state },
              clocks: { ...base.clocks, running: null },
            };
    fixture.handlers.get("room.snapshot")?.({ ...value, draw: validDraw });
    expect(onSnapshot).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledOnce();
    peer.close();
  },
);
it("sync and command acknowledgements reject malformed draws through the same parser", async () => {
  const { peer } = observer();
  const value = {
    ...snapshot(),
    draw: { offers: [], remainingMoves: { red: 99, black: 0 } },
  };
  fixture.emit.mockImplementation((_event, ...args) => {
    const cb = args.at(-1) as (error: null, value: unknown) => void;
    cb(null, { status: "ok", commandId: "c", snapshot: value });
  });
  await expect(peer.refresh()).rejects.toThrow("Phản hồi phòng không hợp lệ");
  await expect(
    peer.command(
      {
        type: "match.draw.offer",
        payload: { matchId: snapshot().match.id, matchVersion: 3 },
      },
      2,
    ),
  ).rejects.toThrow("Phản hồi phòng không hợp lệ");
  peer.close();
});

it("authorizes a guest room socket with the capability and no member token", async () => {
  const guestCapability = "guest-capability-synthetic-0123456789abcdefghijk";
  connectRoom({
    roomId: "room",
    getProof: async () => ({ kind: "guest", guestCapability }),
    onSnapshot: vi.fn(),
    onConnection: vi.fn(),
    onError: vi.fn(),
  });
  const done = vi.fn();
  fixture.options!.auth(done);
  await vi.waitFor(() => expect(done).toHaveBeenCalledOnce());
  const payload = done.mock.calls[0]![0] as Record<string, unknown>;
  expect(payload).toMatchObject({ guestCapability, roomId: "room" });
  expect(payload).not.toHaveProperty("accessToken");
  expect(payload).not.toHaveProperty("appSession");
});

it("keeps a member room socket on the member handshake without the guest capability", async () => {
  connectRoom({
    roomId: "room",
    getProof: async () => ({
      kind: "member",
      accessToken: "synthetic-bearer",
      appSession: "a".repeat(43),
    }),
    onSnapshot: vi.fn(),
    onConnection: vi.fn(),
    onError: vi.fn(),
  });
  const done = vi.fn();
  fixture.options!.auth(done);
  await vi.waitFor(() => expect(done).toHaveBeenCalledOnce());
  const payload = done.mock.calls[0]![0] as Record<string, unknown>;
  expect(payload).toMatchObject({
    accessToken: "synthetic-bearer",
    roomId: "room",
  });
  expect(payload).not.toHaveProperty("guestCapability");
});
