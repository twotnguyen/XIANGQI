// @vitest-environment jsdom
import { act, cleanup, renderHook, waitFor } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import type { ChatChannel, ChatPage, RoomSnapshot } from "@xiangqi/shared";
import { useRoomChat } from "./useRoomChat.js";
const roomId = "11111111-1111-4111-8111-111111111111";
afterEach(cleanup);
function page(channel: ChatChannel, sequence = 1): ChatPage {
  return {
    roomId,
    channel,
    roomVersion: 4,
    scopeToken: (channel === "ROOM_PUBLIC" ? "a" : "b").repeat(64),
    canSend: true,
    messages: [
      {
        messageId: `22222222-2222-4222-8222-${String(sequence).padStart(12, "0")}`,
        roomId,
        channel,
        sequence,
        content: `Tin ${sequence}`,
        createdAt: "2026-10-11T00:00:00Z",
        sender: { displayName: "Kỳ hữu", isGuest: false, role: "red" },
      },
    ],
    nextCursor: sequence,
    hasMore: false,
  };
}
function snapshot(): RoomSnapshot {
  return {
    roomId,
    role: "red",
    version: 4,
    serverNow: "2026-10-11T00:00:00Z",
    room: {
      name: "Kỳ hữu",
      status: "WAITING",
      visibility: "PUBLIC",
      hostId: roomId,
      inviteCode: null,
      timeMinutes: 10,
      viewerLimit: 5,
      seats: { red: "a", black: "b" },
      ready: { red: false, black: false },
      connected: { red: true, black: true },
      graceUntil: { red: null, black: null },
      countdown: null,
    },
    control: { mode: "writable", generation: 1, reason: null },
    match: null,
    clocks: null,
  };
}
function setup() {
  const readChat = vi
    .fn()
    .mockImplementation(async (channel: ChatChannel) => page(channel));
  const sendChat = vi.fn().mockResolvedValue({
    messageId: roomId,
    sequence: 2,
    createdAt: "2026-10-11T00:00:01Z",
  });
  const connection = {
    current: {
      readChat,
      sendChat,
      refresh: vi.fn(),
      command: vi.fn(),
      close: vi.fn(),
    },
  };
  const hook = renderHook(() => useRoomChat(roomId, connection));
  return {
    ...hook,
    readChat,
    sendChat,
    connection,
    start: async (state = snapshot()) => {
      act(() => hook.result.current.update(state, true));
      await waitFor(() =>
        expect(hook.result.current.channels.ROOM_PUBLIC.messages).toHaveLength(
          1,
        ),
      );
    },
  };
}
it("reads both player channels once and retains history through status changes and same-pair side swaps", async () => {
  const f = setup();
  await f.start();
  expect(f.readChat).toHaveBeenCalledTimes(2);
  act(() =>
    f.result.current.update(
      {
        ...snapshot(),
        role: "black",
        room: {
          ...snapshot().room,
          status: "PLAYING",
          seats: { red: "b", black: "a" },
        },
      },
      true,
    ),
  );
  expect(
    f.result.current.channels.PLAYERS_PRIVATE?.messages[0]?.sender.role,
  ).toBe("red");
  expect(f.readChat).toHaveBeenCalledTimes(2);
});
it("spectators read only public chat even with a readonly room controller", async () => {
  const f = setup();
  await f.start({
    ...snapshot(),
    role: "spectator",
    control: { mode: "readonly", generation: 0, reason: "not_allowed" },
  });
  expect(f.readChat).toHaveBeenCalledExactlyOnceWith("ROOM_PUBLIC", 0);
  expect(f.result.current.channels.PLAYERS_PRIVATE).toBeUndefined();
  expect(f.result.current.channels.ROOM_PUBLIC.canSend).toBe(true);
});
it("coalesces repeated same-metadata notices while ignoring the superseded response", async () => {
  const f = setup();
  await f.start();
  let finish!: (page: ChatPage) => void;
  f.readChat.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const notice = {
    roomId,
    channel: "ROOM_PUBLIC" as const,
    roomVersion: 4,
    scopeToken: "a".repeat(64),
    canSend: true,
  };
  act(() => {
    f.result.current.changed(notice);
    f.result.current.changed(notice);
    f.result.current.changed(notice);
  });
  expect(f.readChat).toHaveBeenCalledTimes(3);
  f.readChat.mockImplementation(async (channel: ChatChannel) =>
    page(channel, 2),
  );
  await act(async () => finish(page("ROOM_PUBLIC", 2)));
  await waitFor(() => expect(f.readChat).toHaveBeenCalledTimes(4));
  expect(
    f.result.current.channels.ROOM_PUBLIC.messages.map((m) => m.sequence),
  ).toEqual([1, 2]);
});
it("flushes private history immediately on pair replacement and ignores old reads", async () => {
  const f = setup();
  await f.start();
  let finish!: (p: ChatPage) => void;
  f.readChat.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  act(() =>
    f.result.current.changed({
      roomId,
      channel: "PLAYERS_PRIVATE",
      roomVersion: 4,
      scopeToken: "b".repeat(64),
      canSend: true,
    }),
  );
  f.readChat.mockImplementation(async (channel: ChatChannel) => ({
    ...page(channel, 3),
    roomVersion: 5,
    scopeToken: "c".repeat(64),
  }));
  act(() =>
    f.result.current.update(
      {
        ...snapshot(),
        version: 5,
        room: { ...snapshot().room, seats: { red: "a", black: "c" } },
      },
      true,
    ),
  );
  expect(f.result.current.channels.PLAYERS_PRIVATE?.messages).toEqual([]);
  await act(async () => finish(page("PLAYERS_PRIVATE", 2)));
  await waitFor(() =>
    expect(
      f.result.current.channels.PLAYERS_PRIVATE?.messages.map(
        (m) => m.sequence,
      ),
    ).toEqual([3]),
  );
});
it("retries the same raw draft with the same command ID until ACK, then reads authoritative publication", async () => {
  const f = setup();
  await f.start();
  f.sendChat.mockRejectedValueOnce(new Error("Bạn gửi quá nhanh"));
  await expect(
    f.result.current.onSend("PLAYERS_PRIVATE", "RAW tin"),
  ).rejects.toThrow("Bạn gửi quá nhanh");
  f.readChat.mockImplementation(async (channel: ChatChannel) =>
    page(channel, 2),
  );
  await act(async () => f.result.current.onSend("PLAYERS_PRIVATE", "RAW tin"));
  expect(f.sendChat.mock.calls[0]![2]).toBe(f.sendChat.mock.calls[1]![2]);
  expect(f.sendChat.mock.calls[1]!.slice(0, 2)).toEqual([
    "PLAYERS_PRIVATE",
    "RAW tin",
  ]);
  await waitFor(() =>
    expect(
      f.result.current.channels.PLAYERS_PRIVATE?.messages.map(
        (m) => m.sequence,
      ),
    ).toEqual([1, 2]),
  );
});
it("pagination uses the last authoritative cursor and connection loss fences late private content", async () => {
  const f = setup();
  await f.start();
  let finish!: (p: ChatPage) => void;
  f.readChat.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  let loading!: Promise<void>;
  act(() => {
    loading = f.result.current.onLoadMore("PLAYERS_PRIVATE");
  });
  expect(f.readChat).toHaveBeenLastCalledWith("PLAYERS_PRIVATE", 1);
  act(() => f.result.current.update(null, false));
  expect(f.result.current.channels.PLAYERS_PRIVATE?.messages).toEqual([]);
  await act(async () => {
    finish(page("PLAYERS_PRIVATE", 2));
    await loading;
  });
  expect(f.result.current.channels.PLAYERS_PRIVATE?.messages).toEqual([]);
});
it("a captured notice callback releases a superseded pending send immediately and fences its late ACK", async () => {
  const f = setup(),
    changed = f.result.current.changed;
  await f.start();
  let finish!: () => void;
  f.sendChat.mockImplementationOnce(
    () =>
      new Promise<void>((resolve) => {
        finish = resolve;
      }),
  );
  let sending!: Promise<void>;
  act(() => {
    sending = f.result.current.onSend("PLAYERS_PRIVATE", "Tin cặp cũ");
  });
  const rejected = expect(sending).rejects.toThrow(
    "Quyền đọc chat đã thay đổi",
  );
  f.readChat.mockImplementation(async (channel: ChatChannel) => ({
    ...page(channel, 3),
    scopeToken: "c".repeat(64),
  }));
  act(() =>
    changed({
      roomId,
      channel: "PLAYERS_PRIVATE",
      roomVersion: 4,
      scopeToken: "c".repeat(64),
      canSend: true,
    }),
  );
  expect(f.result.current.pendingSend).toBeNull();
  expect(f.result.current.channels.PLAYERS_PRIVATE?.messages).toEqual([]);
  await act(async () => finish());
  await rejected;
});
it("never publishes a page below the accepted room snapshot version", async () => {
  const f = setup();
  f.readChat.mockImplementation(async (channel: ChatChannel) => ({
    ...page(channel),
    roomVersion: 3,
  }));
  act(() => f.result.current.update(snapshot(), true));
  await waitFor(() =>
    expect(f.result.current.channels.ROOM_PUBLIC.error).toBe(
      "Quyền đọc chat đã thay đổi",
    ),
  );
  expect(f.result.current.channels.PLAYERS_PRIVATE?.messages).toEqual([]);
  expect(f.result.current.channels.PLAYERS_PRIVATE?.canSend).toBe(false);
});
function historyPage(
  channel: ChatChannel,
  after: number,
  count: number,
): ChatPage {
  const messages = Array.from(
    { length: Math.min(50, Math.max(0, count - after)) },
    (_, index) => page(channel, after + index + 1).messages[0]!,
  );
  return {
    ...page(channel),
    messages,
    nextCursor: messages.at(-1)?.sequence ?? after,
    hasMore: after + messages.length < count,
  };
}
it.each(["notice", "send"])(
  "catches up all authoritative pages after %s so a new message beyond 151 old messages is visible",
  async (cause) => {
    const f = setup();
    let count = 151;
    f.readChat.mockImplementation(
      async (channel: ChatChannel, after: number) =>
        channel === "PLAYERS_PRIVATE"
          ? historyPage(channel, after, count)
          : page(channel),
    );
    await f.start();
    await waitFor(() =>
      expect(f.result.current.channels.PLAYERS_PRIVATE?.messages).toHaveLength(
        50,
      ),
    );
    count = 152;
    if (cause === "send")
      await act(async () =>
        f.result.current.onSend("PLAYERS_PRIVATE", "tin 152"),
      );
    else
      act(() =>
        f.result.current.changed({
          roomId,
          channel: "PLAYERS_PRIVATE",
          roomVersion: 4,
          scopeToken: "b".repeat(64),
          canSend: true,
        }),
      );
    await waitFor(() =>
      expect(f.result.current.channels.PLAYERS_PRIVATE?.messages).toHaveLength(
        152,
      ),
    );
    expect(
      f.result.current.channels.PLAYERS_PRIVATE?.messages.at(-1)?.sequence,
    ).toBe(152);
    expect(
      f.readChat.mock.calls
        .filter((call) => call[0] === "PLAYERS_PRIVATE")
        .map((call) => call[1]),
    ).toEqual([0, 50, 100, 150]);
  },
);
it("stops live catch-up safely if a malformed continuation makes no cursor progress", async () => {
  const f = setup();
  await f.start();
  const before = f.readChat.mock.calls.length;
  f.readChat.mockResolvedValueOnce({
    ...page("PLAYERS_PRIVATE"),
    messages: [],
    nextCursor: 1,
    hasMore: true,
  });
  act(() =>
    f.result.current.changed({
      roomId,
      channel: "PLAYERS_PRIVATE",
      roomVersion: 4,
      scopeToken: "b".repeat(64),
      canSend: true,
    }),
  );
  await waitFor(() =>
    expect(f.result.current.channels.PLAYERS_PRIVATE?.error).toBeTruthy(),
  );
  expect(f.readChat.mock.calls.length).toBe(before + 1);
});
it("keeps already paginated same-pair history while refreshing a changed controller grant", async () => {
  const f = setup();
  let version = 4,
    canSend = true;
  f.readChat.mockImplementation(async (channel: ChatChannel, after: number) =>
    channel === "PLAYERS_PRIVATE"
      ? { ...historyPage(channel, after, 100), roomVersion: version, canSend }
      : page(channel),
  );
  await f.start();
  await act(async () => f.result.current.onLoadMore("PLAYERS_PRIVATE"));
  expect(f.result.current.channels.PLAYERS_PRIVATE?.messages).toHaveLength(100);
  version = 5;
  canSend = false;
  act(() =>
    f.result.current.update(
      {
        ...snapshot(),
        version: 5,
        control: { mode: "readonly", generation: 2, reason: "superseded" },
      },
      true,
    ),
  );
  expect(f.result.current.channels.PLAYERS_PRIVATE?.canSend).toBe(false);
  await waitFor(() =>
    expect(f.result.current.channels.PLAYERS_PRIVATE?.loading).toBe(false),
  );
  expect(f.result.current.channels.PLAYERS_PRIVATE?.messages).toHaveLength(100);
  expect(
    f.readChat.mock.calls
      .filter((call) => call[0] === "PLAYERS_PRIVATE")
      .at(-1)![1],
  ).toBe(100);
});
it.each([false, true])(
  "hides private cache on a higher room version until scope is revalidated (controller changes: %s)",
  async (controllerChanges) => {
    const f = setup();
    await f.start();
    let finish!: (p: ChatPage) => void;
    f.readChat.mockImplementation((channel: ChatChannel, after: number) =>
      channel === "ROOM_PUBLIC"
        ? Promise.resolve({
            ...page(channel),
            roomVersion: 5,
            messages: [],
            nextCursor: after,
          })
        : new Promise((resolve) => {
            finish = resolve;
          }),
    );
    act(() =>
      f.result.current.update(
        {
          ...snapshot(),
          version: 5,
          control: controllerChanges
            ? { mode: "readonly", generation: 1, reason: "superseded" }
            : snapshot().control,
        },
        true,
      ),
    );
    expect(f.result.current.channels.PLAYERS_PRIVATE?.messages).toEqual([]);
    expect(f.result.current.channels.PLAYERS_PRIVATE?.canSend).toBe(false);
    expect(f.result.current.channels.PLAYERS_PRIVATE?.scopeToken).toBe(
      "b".repeat(64),
    );
    await act(async () =>
      finish({
        ...page("PLAYERS_PRIVATE"),
        roomVersion: 5,
        messages: [],
        nextCursor: 1,
      }),
    );
    await waitFor(() =>
      expect(
        f.result.current.channels.PLAYERS_PRIVATE?.messages.map(
          (m) => m.sequence,
        ),
      ).toEqual([1]),
    );
  },
);
it("a collapsed A-B to A-C to A-B pair cycle discards the old scope and restarts reading from zero", async () => {
  const f = setup();
  await f.start();
  let finish!: (p: ChatPage) => void;
  f.readChat.mockImplementation(async (channel: ChatChannel, after: number) => {
    if (channel === "ROOM_PUBLIC")
      return {
        ...page(channel),
        roomVersion: 5,
        messages: [],
        nextCursor: after,
      };
    if (after === 1)
      return {
        ...page(channel, 3),
        roomVersion: 5,
        scopeToken: "c".repeat(64),
      };
    return new Promise((resolve) => {
      finish = resolve;
    });
  });
  act(() => f.result.current.update({ ...snapshot(), version: 5 }, true));
  expect(f.result.current.channels.PLAYERS_PRIVATE?.messages).toEqual([]);
  await waitFor(() =>
    expect(f.readChat).toHaveBeenLastCalledWith("PLAYERS_PRIVATE", 0),
  );
  expect(f.result.current.channels.PLAYERS_PRIVATE?.messages).toEqual([]);
  await act(async () =>
    finish({
      ...page("PLAYERS_PRIVATE", 3),
      roomVersion: 5,
      scopeToken: "c".repeat(64),
    }),
  );
  expect(
    f.result.current.channels.PLAYERS_PRIVATE?.messages.map((m) => m.sequence),
  ).toEqual([3]);
});
it("authoritative chat read denial removes private cache immediately while transient failures retain it", async () => {
  const f = setup();
  await f.start();
  f.readChat.mockRejectedValueOnce(new Error("Chat tạm thời không dùng được"));
  await act(async () => {
    await f.result.current.onLoadMore("PLAYERS_PRIVATE").catch(() => {});
  });
  expect(f.result.current.channels.PLAYERS_PRIVATE?.messages).toHaveLength(1);
  f.readChat.mockRejectedValueOnce(
    new Error("Bạn không có quyền truy cập kênh chat này"),
  );
  await act(async () => {
    await f.result.current.onLoadMore("PLAYERS_PRIVATE").catch(() => {});
  });
  expect(f.result.current.channels.PLAYERS_PRIVATE?.messages).toEqual([]);
  expect(f.result.current.channels.PLAYERS_PRIVATE?.canSend).toBe(false);
  expect(f.result.current.channels.ROOM_PUBLIC.messages).toHaveLength(1);
});
it("TAB_READ_ONLY send denial revokes both player composers while retaining authorized history", async () => {
  const f = setup();
  await f.start();
  f.sendChat.mockRejectedValueOnce(new Error("Tab này chỉ có thể xem"));
  await act(async () => {
    await f.result.current.onSend("PLAYERS_PRIVATE", "tin").catch(() => {});
  });
  expect(f.result.current.channels.PLAYERS_PRIVATE?.canSend).toBe(false);
  expect(f.result.current.channels.ROOM_PUBLIC.canSend).toBe(false);
  expect(f.result.current.channels.PLAYERS_PRIVATE?.messages).toHaveLength(1);
});
