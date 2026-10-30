import { afterEach, vi } from "vitest";
import { connectRoom } from "@web/features/rooms/room-client.js";
import type { ChatPage } from "@xiangqi/shared";

export { fixture, roomId, snapshot, observer, chatPage, chatPeer };
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
      swapOffer: null,
      rematchOffer: null,
      downOffer: null,
      spectators: [],
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
