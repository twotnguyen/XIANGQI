import { expect, it, vi } from "vitest";
import {
  fixture,
  roomId,
  snapshot,
  chatPage,
  chatPeer,
} from "./room-socket.test-helper.js";
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

it.each(["room.snapshot", "room.sync", "room.command"])(
  "keeps an in-flight private read valid across a single active move from %s",
  async (source) => {
    const peer = chatPeer();
    fixture.handlers.get("room.snapshot")?.(snapshot());
    let readAck!: (error: null, value: unknown) => void;
    const next = snapshot({ from: 54, to: 45, eventVersion: 4 });
    next.version = 5;
    next.match.version = 4;
    next.match.turn = "black";
    next.match.position =
      "rnbakabnr/9/1c5c1/p1p1p1p1p/9/P8/2P1P1P1P/1C5C1/9/RNBAKABNR b - - 0 1";
    next.clocks.running = "black";
    fixture.emit.mockImplementation((event, ...args) => {
      const callback = args.at(-1);
      if (event === "chat.read") readAck = callback;
      else callback(null, { status: "ok", snapshot: next });
    });
    const pending = peer.readChat("PLAYERS_PRIVATE");
    if (source === "room.snapshot") fixture.handlers.get(source)?.(next);
    else if (source === "room.sync") await peer.refresh();
    else
      await peer.command(
        {
          type: "match.move",
          payload: {
            matchId: next.match.id,
            matchVersion: 3,
            from: 54,
            to: 45,
          },
        },
        4,
      );
    fixture.handlers.get("room.snapshot")?.(next);
    readAck(null, {
      status: "ok",
      value: { ...chatPage(), channel: "PLAYERS_PRIVATE" },
    });
    await expect(pending).resolves.toMatchObject({
      channel: "PLAYERS_PRIVATE",
      roomVersion: 4,
      canSend: true,
      scopeToken: "a".repeat(64),
    });
    peer.close();
  },
);
