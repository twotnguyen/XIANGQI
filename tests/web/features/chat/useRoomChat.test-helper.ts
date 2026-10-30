import { act, renderHook, waitFor } from "@testing-library/react";
import { expect, vi } from "vitest";
import type { ChatChannel, ChatPage, RoomSnapshot } from "@xiangqi/shared";
import { useRoomChat } from "@web/features/chat/useRoomChat.js";

export { roomId, page, snapshot, setup };
const roomId = "11111111-1111-4111-8111-111111111111";
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
      swapOffer: null,
      rematchOffer: null,
      downOffer: null,
      spectators: [],
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
      tabId: "chat-tab",
      takeover: vi.fn(async () => {}),
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
