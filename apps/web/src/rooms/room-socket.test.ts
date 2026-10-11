import { afterEach, expect, it, vi } from "vitest";
import { connectRoom } from "./room-client.js";
import type { ChatPage } from "@xiangqi/shared";
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
  expect(onSnapshot).toHaveBeenCalledExactlyOnceWith({ ...state, draw: null });
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

function chatPage(): ChatPage {
  return {
    roomId,
    channel: "ROOM_PUBLIC",
    roomVersion: 4,
    scopeToken: "a".repeat(64),
    canSend: true,
    messages: [],
    nextCursor: 0,
    hasMore: false,
  };
}
function chatPeer(onChatChanged = vi.fn()) {
  return connectRoom({
    roomId,
    getProof: vi.fn(),
    onSnapshot: vi.fn(),
    onConnection: vi.fn(),
    onError: vi.fn(),
    onChatChanged,
  });
}
it.each(["room.snapshot", "room.sync", "room.command"])(
  "rejects an older private chat read after a validated %s snapshot",
  async (source) => {
    const peer = chatPeer();
    fixture.handlers.get("room.snapshot")?.(snapshot());
    let readAck!: (error: null, value: unknown) => void;
    const newer = { ...snapshot(), version: 5 };
    fixture.emit.mockImplementation((event, ...args) => {
      const callback = args.at(-1);
      if (event === "chat.read") readAck = callback;
      else callback(null, { status: "ok", snapshot: newer });
    });
    const pending = peer.readChat("PLAYERS_PRIVATE");
    const rejected = expect(pending).rejects.toThrow();
    if (source === "room.snapshot") fixture.handlers.get(source)?.(newer);
    else if (source === "room.sync") await peer.refresh();
    else
      await peer.command({ type: "room.ready", payload: { ready: true } }, 4);
    readAck(null, {
      status: "ok",
      value: { ...chatPage(), channel: "PLAYERS_PRIVATE" },
    });
    await rejected;
    peer.close();
  },
);
it.each(["pair", "role", "control"])(
  "invalidates chat grants and pending reads when same-version %s authority changes",
  async (change) => {
    const peer = chatPeer();
    fixture.handlers.get("room.snapshot")?.(snapshot());
    fixture.emit.mockImplementation((_event, _request, callback) =>
      callback(null, { status: "ok", value: chatPage() }),
    );
    await peer.readChat("ROOM_PUBLIC");
    let readAck!: (error: null, value: unknown) => void;
    fixture.emit.mockImplementation((event, _request, callback) => {
      if (event === "chat.read") readAck = callback;
      else
        callback(null, {
          status: "ok",
          value: {
            messageId: roomId,
            sequence: 1,
            createdAt: "2026-10-11T00:00:01Z",
          },
        });
    });
    const pending = peer.readChat("ROOM_PUBLIC");
    const rejected = expect(pending).rejects.toThrow();
    const next = {
      ...snapshot(),
      control: {
        mode: "writable",
        generation: 1,
        reason: null as string | null,
      },
    };
    if (change === "pair")
      next.room.seats.black = "44444444-4444-4444-8444-444444444444";
    else if (change === "role") next.role = "spectator";
    else
      next.control = { mode: "readonly", generation: 2, reason: "superseded" };
    fixture.handlers.get("room.snapshot")?.(next);
    readAck(null, { status: "ok", value: chatPage() });
    await rejected;
    fixture.emit.mockClear();
    await expect(peer.sendChat("ROOM_PUBLIC", "tin", roomId)).rejects.toThrow();
    expect(fixture.emit).not.toHaveBeenCalled();
    peer.close();
  },
);
it("preserves a known send grant across newer snapshots with unchanged chat authority", async () => {
  const peer = chatPeer();
  fixture.handlers.get("room.snapshot")?.(snapshot());
  fixture.emit.mockImplementation((event, _request, callback) =>
    callback(null, {
      status: "ok",
      value:
        event === "chat.read"
          ? chatPage()
          : {
              messageId: roomId,
              sequence: 1,
              createdAt: "2026-10-11T00:00:01Z",
            },
    }),
  );
  await peer.readChat("ROOM_PUBLIC");
  const next = snapshot();
  next.version = 5;
  next.role = "black";
  next.room.seats = { red: next.room.seats.black, black: next.room.seats.red };
  fixture.handlers.get("room.snapshot")?.(next);
  await expect(
    peer.sendChat("ROOM_PUBLIC", "tin", roomId),
  ).resolves.toMatchObject({ sequence: 1 });
  peer.close();
});
it.each(["room.snapshot", "room.sync", "room.command"])(
  "revokes an existing send grant after a same-version takeover from %s",
  async (source) => {
    const peer = chatPeer();
    fixture.handlers.get("room.snapshot")?.(snapshot());
    const next = {
      ...snapshot(),
      control: { mode: "readonly", generation: 2, reason: "superseded" },
    };
    fixture.emit.mockImplementation((event, ...args) => {
      const callback = args.at(-1);
      if (event === "chat.read")
        callback(null, { status: "ok", value: chatPage() });
      else if (event === "chat.send")
        callback(null, {
          status: "ok",
          value: {
            messageId: roomId,
            sequence: 1,
            createdAt: "2026-10-11T00:00:01Z",
          },
        });
      else callback(null, { status: "ok", snapshot: next });
    });
    await peer.readChat("ROOM_PUBLIC");
    if (source === "room.snapshot") fixture.handlers.get(source)?.(next);
    else if (source === "room.sync") await peer.refresh();
    else
      await peer.command({ type: "room.ready", payload: { ready: true } }, 4);
    fixture.emit.mockClear();
    await expect(peer.sendChat("ROOM_PUBLIC", "tin", roomId)).rejects.toThrow();
    expect(fixture.emit).not.toHaveBeenCalled();
    peer.close();
  },
);
it("invalidates pending chat and blocks further reads when the room closes", async () => {
  const peer = chatPeer();
  let readAck!: (error: null, value: unknown) => void;
  fixture.emit.mockImplementation((_event, _request, callback) => {
    readAck = callback;
  });
  const pending = peer.readChat("ROOM_PUBLIC");
  const rejected = expect(pending).rejects.toThrow();
  fixture.handlers.get("room.closed")?.({ roomId, message: "Phòng đã đóng" });
  readAck(null, { status: "ok", value: chatPage() });
  await rejected;
  fixture.emit.mockClear();
  await expect(peer.readChat("ROOM_PUBLIC")).rejects.toThrow();
  expect(fixture.emit).not.toHaveBeenCalled();
  peer.close();
});
it("reads chat on the authenticated room socket and submits raw content with the caller retry ID", async () => {
  const peer = chatPeer();
  fixture.handlers.get("session.read_only")?.();
  fixture.emit.mockImplementation((event, request, callback) => {
    if (event === "chat.read")
      callback(null, { status: "ok", value: chatPage() });
    else
      callback(null, {
        status: "ok",
        value: {
          messageId: roomId,
          sequence: 1,
          createdAt: "2026-10-11T00:00:01Z",
        },
      });
  });
  await expect(peer.readChat("ROOM_PUBLIC")).resolves.toEqual(chatPage());
  await expect(
    peer.sendChat("ROOM_PUBLIC", "RAW chửi chưa lọc", roomId),
  ).resolves.toMatchObject({ sequence: 1 });
  expect(fixture.emit.mock.calls[0]!.slice(0, 2)).toEqual([
    "chat.read",
    { channel: "ROOM_PUBLIC", after: 0 },
  ]);
  expect(fixture.emit.mock.calls[1]!.slice(0, 2)).toEqual([
    "chat.send",
    { channel: "ROOM_PUBLIC", content: "RAW chửi chưa lọc", commandId: roomId },
  ]);
  peer.close();
});
it("requires the latest page send grant and blocks malformed raw commands before emitting", async () => {
  const peer = chatPeer();
  await expect(peer.sendChat("ROOM_PUBLIC", "tin", roomId)).rejects.toThrow();
  fixture.emit.mockImplementation((_event, _request, callback) =>
    callback(null, { status: "ok", value: { ...chatPage(), canSend: false } }),
  );
  await peer.readChat("ROOM_PUBLIC");
  await expect(peer.sendChat("ROOM_PUBLIC", "tin", roomId)).rejects.toThrow();
  fixture.emit.mockImplementation((_event, _request, callback) =>
    callback(null, { status: "ok", value: chatPage() }),
  );
  await peer.readChat("ROOM_PUBLIC");
  fixture.emit.mockClear();
  for (const [content, id] of [
    ["😀".repeat(201), roomId],
    ["tin", "invalid"],
    ["   ", roomId],
  ])
    await expect(peer.sendChat("ROOM_PUBLIC", content!, id!)).rejects.toThrow();
  await expect(peer.readChat("ROOM_PUBLIC", -1)).rejects.toThrow();
  expect(fixture.emit).not.toHaveBeenCalled();
  fixture.emit.mockImplementation((_event, _request, callback) =>
    callback(null, {
      status: "ok",
      value: {
        messageId: roomId,
        sequence: 1,
        createdAt: "2026-10-11T00:00:01Z",
      },
    }),
  );
  await expect(
    peer.sendChat("ROOM_PUBLIC", "😀".repeat(200), roomId),
  ).resolves.toMatchObject({ sequence: 1 });
  peer.close();
});
it.each(["disconnect", "close", "scope"])(
  "rejects old chat reads after %s without returning cached private content",
  async (kind) => {
    const peer = chatPeer();
    let acknowledge!: (error: null, ack: unknown) => void;
    fixture.emit.mockImplementation((_event, _request, callback) => {
      acknowledge = callback;
    });
    const pending = peer.readChat("ROOM_PUBLIC");
    const rejected = expect(pending).rejects.toThrow();
    if (kind === "close") peer.close();
    else if (kind === "disconnect") {
      fixture.handlers.get("disconnect")?.();
      fixture.handlers.get("connect")?.();
    }
    // A real authority change notice is deliberately limited to its wire fields.
    if (kind === "scope")
      fixture.handlers.get("chat.changed")?.({
        roomId,
        channel: "ROOM_PUBLIC",
        roomVersion: 5,
        scopeToken: "b".repeat(64),
        canSend: false,
      });
    acknowledge(null, { status: "ok", value: chatPage() });
    await rejected;
    peer.close();
  },
);
it("forwards repeated same-version chat invalidations because distinct messages share authority, ignoring old and malformed notices", () => {
  const onChatChanged = vi.fn(),
    peer = chatPeer(onChatChanged);
  const notice = {
    roomId,
    channel: "ROOM_PUBLIC",
    roomVersion: 4,
    scopeToken: "a".repeat(64),
    canSend: true,
  };
  const handler = fixture.handlers.get("chat.changed")!;
  handler(notice);
  handler({ ...notice });
  handler({ ...notice, roomVersion: 3 });
  handler({ ...notice, roomId: "other" });
  handler({ ...notice, scopeToken: "secret" });
  expect(onChatChanged).toHaveBeenCalledTimes(2);
  expect(onChatChanged).toHaveBeenNthCalledWith(2, notice);
  peer.close();
});
it("sanitizes chat server errors and preserves the caller command ID for retry", async () => {
  const peer = chatPeer();
  fixture.emit.mockImplementation((_event, _request, callback) =>
    callback(null, { status: "ok", value: chatPage() }),
  );
  await peer.readChat("ROOM_PUBLIC");
  fixture.emit.mockImplementation((_event, _request, callback) =>
    callback(null, {
      status: "error",
      error: { code: "CHAT_RATE_LIMITED", message: "private-token" },
    }),
  );
  await expect(peer.sendChat("ROOM_PUBLIC", "tin", roomId)).rejects.toThrow(
    "Bạn gửi quá nhanh",
  );
  fixture.emit.mockImplementation((_event, _request, callback) =>
    callback(null, {
      status: "ok",
      value: {
        messageId: roomId,
        sequence: 2,
        createdAt: "2026-10-11T00:00:02Z",
      },
    }),
  );
  await peer.sendChat("ROOM_PUBLIC", "tin", roomId);
  expect(fixture.emit.mock.calls.at(-1)![1]).toEqual({
    commandId: roomId,
    channel: "ROOM_PUBLIC",
    content: "tin",
  });
  peer.close();
});

it("rejects malformed successful chat ACKs without returning data or granting sending", async () => {
  const peer = chatPeer();
  fixture.emit.mockImplementation((_event, _request, callback) =>
    callback(null, {
      status: "ok",
      value: { ...chatPage(), scopeToken: "secret" },
    }),
  );
  await expect(peer.readChat("ROOM_PUBLIC")).rejects.toThrow(
    "Phản hồi chat không hợp lệ",
  );
  await expect(peer.sendChat("ROOM_PUBLIC", "tin", roomId)).rejects.toThrow(
    "Không có quyền",
  );
  fixture.emit.mockImplementation((_event, _request, callback) =>
    callback(null, { status: "ok", value: chatPage() }),
  );
  await peer.readChat("ROOM_PUBLIC");
  fixture.emit.mockImplementation((_event, _request, callback) =>
    callback(null, {
      status: "ok",
      value: {
        messageId: roomId,
        sequence: 0,
        createdAt: "2026-10-11T00:00:00Z",
      },
    }),
  );
  await expect(peer.sendChat("ROOM_PUBLIC", "tin", roomId)).rejects.toThrow(
    "Phản hồi chat không hợp lệ",
  );
  peer.close();
});
it.each(["disconnect", "close", "scope"])(
  "rejects a late send receipt after %s and emits no local chat message",
  async (kind) => {
    const peer = chatPeer();
    fixture.emit.mockImplementation((_event, _request, callback) =>
      callback(null, { status: "ok", value: chatPage() }),
    );
    await peer.readChat("ROOM_PUBLIC");
    let acknowledge!: (error: null, ack: unknown) => void;
    fixture.emit.mockImplementation((_event, _request, callback) => {
      acknowledge = callback;
    });
    const pending = peer.sendChat("ROOM_PUBLIC", "tin", roomId),
      rejected = expect(pending).rejects.toThrow();
    if (kind === "close") peer.close();
    else if (kind === "disconnect") {
      fixture.handlers.get("disconnect")?.();
      fixture.handlers.get("connect")?.();
    } else
      fixture.handlers.get("chat.changed")?.({
        roomId,
        channel: "ROOM_PUBLIC",
        roomVersion: 5,
        scopeToken: "b".repeat(64),
        canSend: true,
      });
    acknowledge(null, {
      status: "ok",
      value: {
        messageId: roomId,
        sequence: 1,
        createdAt: "2026-10-11T00:00:00Z",
      },
    });
    await rejected;
    peer.close();
  },
);
it("contains timeout and unknown server details without retrying commands automatically", async () => {
  const peer = chatPeer();
  fixture.emit.mockImplementation((_event, _request, callback) =>
    callback(new Error("private-connection-detail")),
  );
  await expect(peer.readChat("ROOM_PUBLIC")).rejects.toThrow(
    "Chat tạm thời không dùng được",
  );
  fixture.emit.mockImplementation((_event, _request, callback) =>
    callback(null, {
      status: "error",
      error: { code: "private-provider", message: "private-token" },
    }),
  );
  await expect(peer.readChat("ROOM_PUBLIC")).rejects.toThrow(
    "Chat tạm thời không dùng được",
  );
  expect(fixture.emit).toHaveBeenCalledTimes(2);
  peer.close();
});
it("a newer read wins and a late earlier page cannot replace authority", async () => {
  const peer = chatPeer(),
    acks: Array<(error: null, ack: unknown) => void> = [];
  fixture.emit.mockImplementation((_event, _request, callback) =>
    acks.push(callback),
  );
  const old = peer.readChat("ROOM_PUBLIC"),
    rejected = expect(old).rejects.toThrow();
  const fresh = peer.readChat("ROOM_PUBLIC");
  acks[1]!(null, { status: "ok", value: chatPage() });
  await expect(fresh).resolves.toEqual(chatPage());
  acks[0]!(null, { status: "ok", value: { ...chatPage(), canSend: false } });
  await rejected;
  peer.close();
});
