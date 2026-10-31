import { createElement, type ReactNode } from "react";
import { afterEach, beforeEach, vi } from "vitest";
import {
  cleanup,
  render,
  screen,
  act,
  fireEvent,
} from "@testing-library/react";
import type { RoomSnapshot, ChatChannel, ChatPage } from "@xiangqi/shared";
import { initialPosition, serializePosition } from "@xiangqi/xiangqi-core";
import { RoomPage } from "@web/features/rooms/RoomPage.js";
import { type RoomConnectionInput } from "@web/features/rooms/room-client.js";

export const originalDialogShow = Object.getOwnPropertyDescriptor(
  HTMLDialogElement.prototype,
  "showModal",
);
export const originalDialogClose = Object.getOwnPropertyDescriptor(
  HTMLDialogElement.prototype,
  "close",
);
export const snapshot: RoomSnapshot = {
  serverNow: "2026-10-11T00:00:00Z",
  roomId: "room",
  version: 3,
  role: "red",
  room: {
    name: "Kỳ hữu",
    status: "WAITING",
    hostId: "a",
    visibility: "CODE_ONLY",
    inviteCode: "70521348",

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
  match: null,
  clocks: null,
  control: { mode: "writable", generation: 1, reason: null },
};
export function setup(
  state = snapshot,
  extra: { chat?: ReactNode; isMember?: boolean; userId?: string } = {},
) {
  let handlers: RoomConnectionInput;
  const command = vi.fn().mockResolvedValue({
    status: "ok",
    commandId: "c",
    snapshot: {
      ...state,
      version: 4,
      room: { ...state.room, ready: { red: true, black: false } },
    },
  });
  const client = {
    snapshot: vi.fn().mockResolvedValue(state),
    switchSeat: vi.fn(),
    transferHost: vi.fn(),
    changeVisibility: vi.fn(),
    leave: vi.fn().mockResolvedValue({ roomId: "room", left: true }),
    proposeSwap: vi.fn(),
    withdrawSwap: vi.fn(),
    respondSwap: vi.fn(),
    proposeRematch: vi.fn(),
    respondRematch: vi.fn(),
    toSpectator: vi.fn(),
    moveToSpectator: vi.fn(),
    inviteDown: vi.fn(),
    respondDown: vi.fn(),
    kickViewer: vi.fn(),
    create: vi.fn(),
    join: vi.fn(),
  };
  const refresh = vi.fn().mockResolvedValue(state);
  const close = vi.fn();
  const control = {
    tabId: "11111111-1111-4111-8111-111111111111",
    connectionId: "test-connection",
    generation: 1,
  };
  const getControl = vi.fn().mockResolvedValue(control);
  const readChat = vi
    .fn()
    .mockImplementation(async (channel: ChatChannel): Promise<ChatPage> => ({
      roomId: "room",
      channel,
      roomVersion: state.version,
      scopeToken: (channel === "ROOM_PUBLIC" ? "a" : "b").repeat(64),
      canSend: true,
      messages: [],
      nextCursor: 0,
      hasMore: false,
    }));
  const sendChat = vi.fn().mockResolvedValue({
    messageId: "22222222-2222-4222-8222-222222222222",
    sequence: 1,
    createdAt: "2026-10-11T00:00:01Z",
  });
  const onLeft = vi.fn();
  const rendered = render(
    createElement(RoomPage, {
      roomId: "room",
      userId: "a",
      client,
      getProof: vi.fn(),
      onLeft,
      ...extra,
      connect: (input) => {
        handlers = input;
        return {
          command,
          close,
          refresh,
          readChat,
          sendChat,
          tabId: control.tabId,
          getControl,
          takeover: vi.fn().mockResolvedValue(undefined),
        };
      },
    }),
  );
  return {
    client,
    control,
    getControl,
    command,
    refresh,
    close,
    readChat,
    sendChat,
    chatChanged: (
      notice: Parameters<NonNullable<RoomConnectionInput["onChatChanged"]>>[0],
    ) => act(() => handlers.onChatChanged?.(notice)),
    onLeft,
    unmount: rendered.unmount,
    closed: () => act(() => handlers.onClosed?.("Phòng đã đóng")),
    ready: async () => {
      await act(async () => {
        handlers.onConnection(true);
        handlers.onSnapshot(state);
      });
      await screen.findByRole("heading", { name: "Kỳ hữu" });
    },
    publish: (value: RoomSnapshot) => act(() => handlers.onSnapshot(value)),
    error: (message: string) => act(() => handlers.onError(message)),
    disconnect: () => act(() => handlers.onConnection(false)),
    reconnect: () => act(() => handlers.onConnection(true)),
  };
}

export function playing(): RoomSnapshot {
  return {
    ...snapshot,
    room: { ...snapshot.room, status: "PLAYING" },
    match: {
      id: "12345678-1234-4234-8234-123456789abc",
      version: 0,
      position: serializePosition(initialPosition()),
      turn: "red",
      status: "ACTIVE",
      winner: null,
      endedAt: null,
      result: null,
      lastMove: null,
      canAbort: true,
    },
    clocks: {
      redMs: 600000,
      blackMs: 600000,
      running: "red",
      asOf: snapshot.serverNow,
    },
  };
}

export function clockState(): RoomSnapshot {
  return {
    ...playing(),
    clocks: {
      redMs: 300000,
      blackMs: 300000,
      running: "red",
      asOf: snapshot.serverNow,
    },
  };
}
export async function visibility(state: "visible" | "hidden") {
  vi.spyOn(document, "visibilityState", "get").mockReturnValue(state);
  await act(async () => {
    fireEvent(document, new Event("visibilitychange"));
  });
}

export function terminal(state = playing()): RoomSnapshot {
  return {
    ...state,
    version: state.version + 2,
    room: {
      ...state.room,
      status: "WAITING",
      ready: { red: false, black: false },
    },
    match: {
      ...state.match!,
      status: "FINISHED",
      result: "TIMEOUT",
      winner: "red",
      endedAt: state.serverNow,
    },
    clocks: { ...state.clocks!, running: null },
  };
}
export function nativeDialogStub() {
  Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.setAttribute("open", "");
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, "close", {
    configurable: true,
    value: function (this: HTMLDialogElement) {
      this.removeAttribute("open");
    },
  });
}

export function actionable(): RoomSnapshot {
  return {
    ...playing(),
    draw: { offers: [], remainingMoves: { red: 0, black: 0 } },
  };
}
export function useRoomPageHooks() {
  beforeEach(nativeDialogStub);

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
    vi.restoreAllMocks();
    for (const [name, descriptor] of [
      ["showModal", originalDialogShow],
      ["close", originalDialogClose],
    ] as const) {
      if (descriptor)
        Object.defineProperty(HTMLDialogElement.prototype, name, descriptor);
      else Reflect.deleteProperty(HTMLDialogElement.prototype, name);
    }
  });
}
