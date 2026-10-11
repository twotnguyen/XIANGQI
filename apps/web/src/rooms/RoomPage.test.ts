// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import {
  cleanup,
  within,
  render,
  screen,
  act,
  fireEvent,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { CommandAcknowledgement, RoomSnapshot } from "@xiangqi/shared";
import {
  initialPosition,
  serializePosition,
  playMove,
} from "@xiangqi/xiangqi-core";
import { RoomPage } from "./RoomPage.js";
import * as gameAudio from "./game-audio.js";
import { RoomRequestError, type RoomConnectionInput } from "./room-client.js";
const originalDialogShow = Object.getOwnPropertyDescriptor(
  HTMLDialogElement.prototype,
  "showModal",
);
const originalDialogClose = Object.getOwnPropertyDescriptor(
  HTMLDialogElement.prototype,
  "close",
);
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
const snapshot: RoomSnapshot = {
  serverNow: "2026-10-11T00:00:00Z",
  roomId: "room",
  version: 3,
  role: "red",
  room: {
    name: "Kỳ hữu",
    status: "WAITING",
    hostId: "a",
    visibility: "CODE_ONLY",
    inviteCode: "K7M2XQP4",

    timeMinutes: 10,
    viewerLimit: 5,
    seats: { red: "a", black: "b" },
    ready: { red: false, black: false },
    connected: { red: true, black: true },
    graceUntil: { red: null, black: null },
    countdown: null,
  },
  match: null,
  clocks: null,
  control: { mode: "writable", generation: 1, reason: null },
};
function setup(state = snapshot) {
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
    changeVisibility: vi.fn(),
    leave: vi.fn().mockResolvedValue({ roomId: "room", left: true }),
    create: vi.fn(),
    join: vi.fn(),
  };
  const refresh = vi.fn().mockResolvedValue(state);
  const close = vi.fn();
  const onLeft = vi.fn();
  const rendered = render(
    createElement(RoomPage, {
      roomId: "room",
      userId: "a",
      client,
      getProof: vi.fn(),
      onLeft,
      connect: (input) => {
        handlers = input;
        return {
          command,
          close,
          refresh,
          readChat: vi.fn(),
          sendChat: vi.fn(),
        };
      },
    }),
  );
  return {
    client,
    command,
    refresh,
    close,
    onLeft,
    unmount: rendered.unmount,
    closed: () => act(() => handlers.onClosed?.("Phòng đã đóng")),
    ready: async () => {
      await screen.findByRole("heading", { name: "Kỳ hữu" });
      act(() => {
        handlers.onConnection(true);
        handlers.onSnapshot(state);
      });
    },
    publish: (value: RoomSnapshot) => act(() => handlers.onSnapshot(value)),
    disconnect: () => act(() => handlers.onConnection(false)),
    reconnect: () => act(() => handlers.onConnection(true)),
  };
}
it("returns to the lobby on trusted closure and ignores closure after unmount", async () => {
  const fixture = setup();
  await fixture.ready();
  fixture.closed();
  expect(fixture.onLeft).toHaveBeenCalledExactlyOnceWith("Phòng đã đóng");
  fixture.unmount();
  fixture.closed();
  expect(fixture.onLeft).toHaveBeenCalledTimes(1);
  expect(fixture.close).toHaveBeenCalledOnce();
});
it("Ready sends current version and remains server-controlled until acknowledgement", async () => {
  const fixture = setup();
  await fixture.ready();
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Sẵn sàng" }));
  expect(fixture.command).toHaveBeenCalledWith(
    { type: "room.ready", payload: { ready: true } },
    3,
  );
  expect(
    await screen.findByRole("button", { name: "Huỷ sẵn sàng" }),
  ).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Đổi ghế" })).toBeNull();
});
it("spectators and superseded tabs cannot issue Ready", async () => {
  const fixture = setup({
    ...snapshot,
    role: "spectator",
    control: { mode: "readonly", generation: 2, reason: "not_allowed" },
  });
  await fixture.ready();
  expect(screen.queryByRole("button", { name: "Sẵn sàng" })).toBeNull();
  expect(fixture.command).not.toHaveBeenCalled();
});
it("solo host switch uses room CAS and never gives itself a seat optimistically", async () => {
  const state = {
    ...snapshot,
    room: { ...snapshot.room, seats: { red: "a", black: null } },
  };
  const fixture = setup(state);
  await fixture.ready();
  fixture.client.switchSeat.mockRejectedValue(new Error("stale"));
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Đổi ghế" }));
  expect(fixture.client.switchSeat).toHaveBeenCalledWith("room", 3);
  expect(fixture.client.switchSeat).toHaveBeenCalledTimes(1);
  expect(screen.getByText("Bạn · Đỏ")).toBeTruthy();
});
it("countdown expiry never creates a local game and disconnect removes the stale count", async () => {
  const fixture = setup({
    ...snapshot,
    room: {
      ...snapshot.room,
      ready: { red: true, black: true },
      countdown: { token: "start", dueAt: "2026-10-11T00:00:03Z" },
    },
  });
  await fixture.ready();
  vi.useFakeTimers();
  fixture.publish({
    ...snapshot,
    room: {
      ...snapshot.room,
      ready: { red: true, black: true },
      countdown: { token: "second", dueAt: "2026-10-11T00:00:03Z" },
    },
  });
  await act(async () => {
    await vi.advanceTimersByTimeAsync(4000);
  });
  expect(screen.getByText("Đang chờ máy chủ xác nhận bắt đầu…")).toBeTruthy();
  expect(screen.queryByLabelText("Bàn cờ đang thi đấu")).toBeNull();
  fixture.disconnect();
  expect(screen.queryByLabelText("Đếm ngược bắt đầu ván")).toBeNull();
  fixture.reconnect();
  expect(screen.queryByLabelText("Đếm ngược bắt đầu ván")).toBeNull();
  expect(fixture.command).not.toHaveBeenCalled();
});
it("rejects late snapshots and updates host/seat only from newer server data", async () => {
  const fixture = setup();
  await fixture.ready();
  fixture.publish({
    ...snapshot,
    version: 5,
    room: { ...snapshot.room, hostId: "b", seats: { red: null, black: "b" } },
  });
  fixture.publish({ ...snapshot, version: 2 });
  expect(screen.getByText("Ghế Đỏ đang trống")).toBeTruthy();
  expect(screen.getByText("Người chơi Đen · Chủ phòng")).toBeTruthy();
});
it("a late socket snapshot cannot undo a newer HTTP seat switch", async () => {
  const solo = {
    ...snapshot,
    room: { ...snapshot.room, seats: { red: "a", black: null } },
  };
  const fixture = setup(solo);
  await fixture.ready();
  fixture.client.switchSeat.mockResolvedValue({
    ...solo,
    version: 4,
    role: "black",
    room: { ...solo.room, seats: { red: null, black: "a" } },
  });
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Đổi ghế" }));
  expect(screen.getByText("Bạn · Đen")).toBeTruthy();
  fixture.publish(solo);
  expect(screen.getByText("Bạn · Đen")).toBeTruthy();
});

function playing(): RoomSnapshot {
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
    },
    clocks: {
      redMs: 600000,
      blackMs: 600000,
      running: "red",
      asOf: snapshot.serverNow,
    },
  };
}
it("sends a canonical move once and keeps the original board until server acknowledgement", async () => {
  const state = playing();
  const f = setup(state);
  await f.ready();
  let finish!: (value: unknown) => void;
  f.command.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Tốt đỏ, cột 1 hàng 7" }));
  fireEvent.click(screen.getByRole("button", { name: "Trống, cột 1 hàng 6" }));
  expect(f.command).toHaveBeenCalledExactlyOnceWith(
    {
      type: "match.move",
      payload: { matchId: state.match!.id, matchVersion: 0, from: 54, to: 45 },
    },
    state.version,
  );
  expect(
    screen
      .getByRole("button", { name: "Tốt đỏ, cột 1 hàng 7" })
      .getAttribute("aria-disabled"),
  ).toBe("true");
  const next = {
    ...state,
    version: 4,
    match: {
      ...state.match!,
      version: 1,
      turn: "black" as const,
      position: serializePosition(
        playMove(initialPosition(), { from: 54, to: 45 }),
      ),
      lastMove: { from: 54, to: 45, eventVersion: 1 },
    },
  };
  await act(async () =>
    finish({ status: "ok", commandId: "move", snapshot: next }),
  );
  expect(
    screen.queryByRole("button", { name: "Tốt đỏ, cột 1 hàng 7" }),
  ).toBeNull();
  expect(
    screen.getByRole("img", { name: "Tốt đỏ, cột 1 hàng 6" }),
  ).toBeTruthy();
  expect(
    screen.queryByRole("img", { name: "Tốt đỏ, cột 1 hàng 7" }),
  ).toBeNull();
});
it("preserves canonical position on rejected moves and disables input while disconnected", async () => {
  const state = playing();
  const f = setup(state);
  await f.ready();
  f.command.mockResolvedValue({
    status: "error",
    error: { code: "MATCH_VERSION_CONFLICT", message: "PRIVATE_PROVIDER_BODY" },
    snapshot: state,
  });
  fireEvent.click(screen.getByRole("button", { name: "Tốt đỏ, cột 1 hàng 7" }));
  fireEvent.click(screen.getByRole("button", { name: "Trống, cột 1 hàng 6" }));
  expect(
    screen.getByRole("button", { name: "Tốt đỏ, cột 1 hàng 7" }),
  ).toBeTruthy();
  expect(screen.queryByText("PRIVATE_PROVIDER_BODY")).toBeNull();
  f.disconnect();
  expect(
    screen.queryByRole("button", { name: "Tốt đỏ, cột 1 hàng 7" }),
  ).toBeNull();
  expect(f.command).toHaveBeenCalledOnce();
});

it.each(["move", "ready"] as const)(
  "ignores %s ACK after disconnect and establishes a silent reconnect baseline",
  async (action) => {
    const playback = gameAudio.createGameAudio();
    const accept = vi.spyOn(playback, "accept");
    vi.spyOn(gameAudio, "createGameAudio").mockReturnValue(playback);
    const state = action === "move" ? playing() : snapshot;
    const f = setup(state);
    await f.ready();
    let finish!: (ack: CommandAcknowledgement) => void;
    f.command.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    if (action === "move") {
      fireEvent.click(
        screen.getByRole("button", { name: "Tốt đỏ, cột 1 hàng 7" }),
      );
      fireEvent.click(
        screen.getByRole("button", { name: "Trống, cột 1 hàng 6" }),
      );
    } else fireEvent.click(screen.getByRole("button", { name: "Sẵn sàng" }));
    const next: RoomSnapshot =
      action === "move"
        ? {
            ...state,
            version: 4,
            match: {
              ...state.match!,
              version: 1,
              turn: "black",
              position: serializePosition(
                playMove(initialPosition(), { from: 54, to: 45 }),
              ),
              lastMove: { from: 54, to: 45, eventVersion: 1 },
            },
          }
        : {
            ...state,
            version: 4,
            room: {
              ...state.room,
              ready: { red: true, black: true },
              countdown: { token: "late", dueAt: "2026-10-11T00:00:03Z" },
            },
          };
    accept.mockClear();
    f.disconnect();
    await act(async () =>
      finish({ status: "ok", commandId: "late", snapshot: next }),
    );
    expect(screen.queryByLabelText("Bàn cờ đang thi đấu")).toBeNull();
    expect(screen.queryByLabelText("Đếm ngược bắt đầu ván")).toBeNull();
    expect(accept).not.toHaveBeenCalled();
    f.reconnect();
    f.publish(next);
    expect(accept).toHaveBeenCalledExactlyOnceWith(null, next);
  },
);
it("a pre-disconnect ACK remains fenced after reconnect, before its fresh snapshot", async () => {
  const f = setup(playing());
  await f.ready();
  let finish!: (ack: CommandAcknowledgement) => void;
  f.command.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Tốt đỏ, cột 1 hàng 7" }));
  fireEvent.click(screen.getByRole("button", { name: "Trống, cột 1 hàng 6" }));
  f.disconnect();
  f.reconnect();
  await act(async () =>
    finish({ status: "ok", commandId: "old", snapshot: playing() }),
  );
  expect(screen.queryByLabelText("Bàn cờ đang thi đấu")).toBeNull();
});
it.each(["resolve", "reject"] as const)(
  "new Match ID releases old pending input and fences its late %s including finally",
  async (outcome) => {
    const state = playing(),
      f = setup(state);
    await f.ready();
    let finishOld!: (ack: CommandAcknowledgement) => void,
      failOld!: (error: Error) => void;
    f.command.mockImplementationOnce(
      () =>
        new Promise((resolve, reject) => {
          finishOld = resolve;
          failOld = reject;
        }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Tốt đỏ, cột 1 hàng 7" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Trống, cột 1 hàng 6" }),
    );
    const fresh: RoomSnapshot = {
      ...state,
      version: 5,
      match: { ...state.match!, id: "87654321-1234-4234-8234-123456789abc" },
    };
    f.publish(fresh);
    expect(
      screen
        .getByRole("button", { name: "Tốt đỏ, cột 1 hàng 7" })
        .getAttribute("aria-disabled"),
    ).toBe("false");
    let finishFresh!: (ack: CommandAcknowledgement) => void;
    f.command.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finishFresh = resolve;
        }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Tốt đỏ, cột 1 hàng 7" }),
    );
    fireEvent.click(
      screen.getByRole("button", { name: "Trống, cột 1 hàng 6" }),
    );
    expect(f.command).toHaveBeenCalledTimes(2);
    await act(async () => {
      if (outcome === "reject") failOld(new Error("old"));
      else
        finishOld({
          status: "ok",
          commandId: "old",
          snapshot: { ...state, version: 100 },
        });
    });
    expect(
      screen.queryByText(
        "Chưa nhận được xác nhận nước đi. Kiểm tra bàn cờ máy chủ trước khi thao tác lại.",
      ),
    ).toBeNull();
    expect(
      screen
        .getByRole("button", { name: "Tốt đỏ, cột 1 hàng 7" })
        .getAttribute("aria-disabled"),
    ).toBe("true");
    await act(async () =>
      finishFresh({
        status: "ok",
        commandId: "fresh",
        snapshot: {
          ...fresh,
          version: 6,
          match: {
            ...fresh.match!,
            version: 1,
            turn: "black",
            position: serializePosition(
              playMove(initialPosition(), { from: 54, to: 45 }),
            ),
            lastMove: { from: 54, to: 45, eventVersion: 1 },
          },
        },
      }),
    );
    expect(
      screen.queryByRole("img", { name: "Tốt đỏ, cột 1 hàng 7" }),
    ).toBeNull();
    expect(
      screen.getByRole("img", { name: "Tốt đỏ, cột 1 hàng 6" }),
    ).toBeTruthy();
  },
);
it("a superseded control proof fences an earlier move rejection", async () => {
  const state = playing(),
    f = setup(state);
  await f.ready();
  let fail!: (error: Error) => void;
  f.command.mockImplementationOnce(
    () =>
      new Promise((_, reject) => {
        fail = reject;
      }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Tốt đỏ, cột 1 hàng 7" }));
  fireEvent.click(screen.getByRole("button", { name: "Trống, cột 1 hàng 6" }));
  f.publish({
    ...state,
    control: { mode: "readonly", generation: 2, reason: "superseded" },
  });
  await act(async () => fail(new Error("old")));
  expect(
    screen.queryByText(
      "Chưa nhận được xác nhận nước đi. Kiểm tra bàn cờ máy chủ trước khi thao tác lại.",
    ),
  ).toBeNull();
  expect(
    screen.getByText("Phiên này đã được mở ở tab khác. Tab hiện tại chỉ xem."),
  ).toBeTruthy();
});

it("a canonical ACK that introduces a new match clears its previous request pending state", async () => {
  const f = setup();
  await f.ready();
  f.command.mockResolvedValueOnce({
    status: "ok",
    commandId: "start",
    snapshot: { ...playing(), version: 4 },
  });
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Sẵn sàng" }));
  expect(
    screen
      .getByRole("button", { name: "Tốt đỏ, cột 1 hàng 7" })
      .getAttribute("aria-disabled"),
  ).toBe("false");
});

function clockState(): RoomSnapshot {
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
async function visibility(state: "visible" | "hidden") {
  vi.spyOn(document, "visibilityState", "get").mockReturnValue(state);
  await act(async () => {
    fireEvent(document, new Event("visibilitychange"));
  });
}
it("shows both server clocks and readonly visibility refresh rebases a spectator without issuing a command", async () => {
  const state = { ...clockState(), role: "spectator" as const };
  const f = setup(state);
  await f.ready();
  expect(screen.getByRole("timer", { name: "Thời gian Đỏ" }).textContent).toBe(
    "05:00",
  );
  await visibility("hidden");
  expect(f.refresh).not.toHaveBeenCalled();
  f.refresh.mockResolvedValue({
    ...state,
    serverNow: "2026-10-11T00:01:00Z",
    clocks: { ...state.clocks!, redMs: 240000, asOf: "2026-10-11T00:01:00Z" },
  });
  await visibility("visible");
  expect(f.refresh).toHaveBeenCalledOnce();
  expect(screen.getByRole("timer", { name: "Thời gian Đỏ" }).textContent).toBe(
    "04:00",
  );
  expect(f.command).not.toHaveBeenCalled();
});
it("keeps the running clock during physical disconnection and does not refresh while disconnected", async () => {
  let now = 1000;
  vi.spyOn(performance, "now").mockImplementation(() => now);
  vi.useFakeTimers({ toFake: ["setInterval", "clearInterval"] });
  const f = setup(clockState());
  await f.ready();
  f.disconnect();
  act(() => {
    now += 2000;
    vi.advanceTimersByTime(2000);
  });
  expect(screen.getByRole("timer", { name: "Thời gian Đỏ" }).textContent).toBe(
    "04:58",
  );
  await visibility("visible");
  expect(f.refresh).not.toHaveBeenCalled();
  expect(f.command).not.toHaveBeenCalled();
});
it.each(["reconnect", "new-match", "unmount"] as const)(
  "fences a visibility response after %s",
  async (change) => {
    const state = clockState(),
      f = setup(state);
    await f.ready();
    let finish!: (value: RoomSnapshot) => void;
    f.refresh.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          finish = resolve;
        }),
    );
    await visibility("visible");
    if (change === "reconnect") {
      f.disconnect();
      f.reconnect();
      f.publish({
        ...state,
        serverNow: "2026-10-11T00:00:20Z",
        clocks: {
          ...state.clocks!,
          redMs: 280000,
          asOf: "2026-10-11T00:00:20Z",
        },
      });
    } else if (change === "new-match") {
      f.publish({
        ...state,
        version: 5,
        match: { ...state.match!, id: "87654321-1234-4234-8234-123456789abc" },
        clocks: { ...state.clocks!, redMs: 600000 },
      });
    } else f.unmount();
    await act(async () =>
      finish({
        ...state,
        version: 100,
        serverNow: "2026-10-11T00:02:00Z",
        clocks: { ...state.clocks!, redMs: 180000 },
      }),
    );
    if (change !== "unmount")
      expect(
        screen.getByRole("timer", { name: "Thời gian Đỏ" }).textContent,
      ).toBe(change === "reconnect" ? "04:40" : "10:00");
    else expect(screen.queryByRole("timer")).toBeNull();
    expect(f.command).not.toHaveBeenCalled();
  },
);
it("retains the fresher clock when a same-version snapshot has an older server timestamp", async () => {
  const state = clockState(),
    f = setup(state);
  await f.ready();
  const fresh = {
    ...state,
    serverNow: "2026-10-11T00:00:30Z",
    clocks: { ...state.clocks!, redMs: 270000, asOf: "2026-10-11T00:00:30Z" },
  };
  f.publish(fresh);
  f.refresh.mockResolvedValue(state);
  await visibility("visible");
  expect(screen.getByRole("timer", { name: "Thời gian Đỏ" }).textContent).toBe(
    "04:30",
  );
  f.publish(state);
  expect(screen.getByRole("timer", { name: "Thời gian Đỏ" }).textContent).toBe(
    "04:30",
  );
});
it("sanitizes a refresh failure and permits another readonly refresh", async () => {
  const f = setup(clockState());
  await f.ready();
  f.refresh.mockRejectedValueOnce(new Error("PRIVATE_PROVIDER_PAYLOAD"));
  await visibility("visible");
  expect(
    screen.getByText("Chưa thể đồng bộ đồng hồ. Kiểm tra kết nối rồi thử lại."),
  ).toBeTruthy();
  expect(screen.queryByText("PRIVATE_PROVIDER_PAYLOAD")).toBeNull();
  await visibility("hidden");
  await visibility("visible");
  expect(f.refresh).toHaveBeenCalledTimes(2);
  expect(
    screen.queryByText(
      "Chưa thể đồng bộ đồng hồ. Kiểm tra kết nối rồi thử lại.",
    ),
  ).toBeNull();
  expect(f.command).not.toHaveBeenCalled();
});

function terminal(state = playing()): RoomSnapshot {
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
function nativeDialogStub() {
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
it("keeps the authoritative final board and stops moves when the result arrives", async () => {
  nativeDialogStub();
  const f = setup(playing());
  await f.ready();
  f.publish(terminal());
  expect(screen.getByRole("dialog", { name: "Bạn thắng!" })).toBeTruthy();
  expect(
    screen.getByRole("group", { name: "Bàn cờ tướng — Đỏ ở phía dưới" }),
  ).toBeTruthy();
  expect(
    screen.queryByRole("button", { name: "Tốt đỏ, cột 1 hàng 7" }),
  ).toBeNull();
  expect(screen.getByRole("timer", { name: "Thời gian Đỏ" }).textContent).toBe(
    "10:00",
  );
  expect(f.command).not.toHaveBeenCalled();
});
it("Stay closes only this result and a duplicate or reconnect cannot reopen it", async () => {
  nativeDialogStub();
  const state = terminal();
  const f = setup(state);
  await f.ready();
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Ở lại phòng" }));
  expect(screen.queryByRole("dialog")).toBeNull();
  f.publish({ ...state, version: state.version + 1 });
  f.disconnect();
  f.reconnect();
  f.publish({ ...state, version: state.version + 2 });
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(f.client.leave).not.toHaveBeenCalled();
  expect(f.command).not.toHaveBeenCalled();
  f.publish({
    ...state,
    version: state.version + 3,
    match: { ...state.match!, id: "second-match" },
  });
  expect(screen.getByRole("dialog", { name: "Bạn thắng!" })).toBeTruthy();
});
it("result Leave waits for HTTP acknowledgement and uses the terminal room version", async () => {
  nativeDialogStub();
  const state = terminal();
  const f = setup(state);
  await f.ready();
  let finish!: (v: unknown) => void;
  f.client.leave.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  await userEvent
    .setup()
    .click(screen.getByRole("dialog").querySelectorAll("button")[1]!);
  expect(f.client.leave).toHaveBeenCalledExactlyOnceWith("room", state.version);
  expect(f.onLeft).not.toHaveBeenCalled();
  expect(
    screen
      .getByRole("button", { name: "Ở lại phòng" })
      .getAttribute("aria-disabled"),
  ).toBe("true");
  await act(async () => finish({ left: true }));
  expect(f.onLeft).toHaveBeenCalledOnce();
});
it("failed result Leave keeps the modal and reports the safe error inside it", async () => {
  nativeDialogStub();
  const f = setup(terminal());
  await f.ready();
  f.client.leave.mockRejectedValue(new Error("private-server-detail"));
  await userEvent
    .setup()
    .click(screen.getByRole("dialog").querySelectorAll("button")[1]!);
  expect(
    screen.getByRole("dialog").querySelector('[role="alert"]')?.textContent,
  ).toContain("Thao tác chưa thực hiện được");
  expect(screen.queryByText("private-server-detail")).toBeNull();
  expect(f.onLeft).not.toHaveBeenCalled();
});
it("spectator sees a neutral inline result and has no player Stay action", async () => {
  const state = terminal();
  const f = setup({
    ...state,
    role: "spectator",
    control: { mode: "readonly", generation: 0, reason: "not_allowed" },
  });
  await f.ready();
  expect(screen.getByRole("region", { name: "Kết quả ván cờ" })).toBeTruthy();
  expect(screen.getByRole("heading", { name: "Đỏ thắng" })).toBeTruthy();
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(screen.queryByRole("button", { name: "Ở lại phòng" })).toBeNull();
  expect(f.command).not.toHaveBeenCalled();
});
it("a disconnected client waits for a fresh authoritative result before opening the modal", async () => {
  nativeDialogStub();
  const f = setup(playing());
  await f.ready();
  f.disconnect();
  f.publish(terminal());
  expect(screen.queryByRole("dialog", { name: "Bạn thắng!" })).toBeNull();
  f.reconnect();
  expect(screen.queryByRole("dialog", { name: "Bạn thắng!" })).toBeNull();
  f.publish(terminal());
  expect(screen.getByRole("dialog", { name: "Bạn thắng!" })).toBeTruthy();
});

it("a stale result Leave keeps the final board and modal until fresh realtime sync", async () => {
  nativeDialogStub();
  const state = terminal();
  const f = setup(state);
  await f.ready();
  f.client.leave.mockRejectedValue(new RoomRequestError("VERSION_STALE", 409));
  f.client.snapshot.mockResolvedValue({ ...state, version: state.version + 1 });
  let sync!: (value: RoomSnapshot) => void;
  f.refresh.mockImplementation(
    () =>
      new Promise((resolve) => {
        sync = resolve;
      }),
  );
  await userEvent
    .setup()
    .click(screen.getByRole("dialog").querySelectorAll("button")[1]!);
  expect(screen.getByRole("dialog", { name: "Bạn thắng!" })).toBeTruthy();
  expect(
    screen.getByRole("group", { name: "Bàn cờ tướng — Đỏ ở phía dưới" }),
  ).toBeTruthy();
  expect(f.refresh).toHaveBeenCalledOnce();
  expect(f.onLeft).not.toHaveBeenCalled();
  await act(async () => sync({ ...state, version: state.version + 1 }));
  expect(screen.getByRole("dialog")).toBeTruthy();
});
it("keeps the reconnect modal through bare transport reconnection until a fresh snapshot arrives", async () => {
  nativeDialogStub();
  const state = playing();
  const f = setup(state);
  await f.ready();
  f.disconnect();
  expect(
    screen.getByRole("dialog", { name: "Đang kết nối lại…" }),
  ).toBeTruthy();
  expect(screen.getByRole("timer", { name: "Thời gian Đỏ" })).toBeTruthy();
  f.reconnect();
  expect(
    screen.getByRole("dialog", { name: "Đang kết nối lại…" }),
  ).toBeTruthy();
  expect(
    screen.queryByRole("button", { name: "Tốt đỏ, cột 1 hàng 7" }),
  ).toBeNull();
  f.publish({ ...state, version: state.version + 1 });
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(
    screen.getByRole("button", { name: "Tốt đỏ, cột 1 hàng 7" }),
  ).toBeTruthy();
});
it("opponent reconnect notice uses canonical grace while the local board remains enabled", async () => {
  const state = playing();
  state.room.connected.black = false;
  state.room.graceUntil.black = "2026-10-11T00:01:00Z";
  const f = setup(state);
  await f.ready();
  expect(
    screen.getByRole("region", { name: "Trạng thái nối lại" }),
  ).toBeTruthy();
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(
    screen
      .getByRole("button", { name: "Tốt đỏ, cột 1 hàng 7" })
      .getAttribute("aria-disabled"),
  ).toBe("false");
  f.publish({
    ...state,
    version: state.version + 1,
    room: {
      ...state.room,
      connected: { red: true, black: true },
      graceUntil: { red: null, black: null },
    },
  });
  expect(
    screen.queryByRole("region", { name: "Trạng thái nối lại" }),
  ).toBeNull();
});

it("only the connected host sees room settings, including during a match", async () => {
  const f = setup(clockState());
  await f.ready();
  expect(screen.getByRole("button", { name: "Cài đặt phòng" })).toBeTruthy();
  f.publish({
    ...clockState(),
    version: 4,
    room: { ...clockState().room, hostId: "b" },
  });
  expect(screen.queryByRole("button", { name: "Cài đặt phòng" })).toBeNull();
});
it("mode save uses current CAS, waits for canonical HTTP and hides the old invite on lock", async () => {
  const f = setup();
  await f.ready();
  let finish!: (value: typeof snapshot) => void;
  f.client.changeVisibility.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const u = userEvent.setup();
  await u.click(screen.getByRole("button", { name: "Cài đặt phòng" }));
  await u.click(screen.getByRole("radio", { name: /Khóa phòng/ }));
  await u.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
  await u.click(screen.getByRole("button", { name: "Khóa phòng" }));
  expect(f.client.changeVisibility).toHaveBeenCalledExactlyOnceWith(
    "room",
    3,
    "LOCKED",
  );
  expect(screen.getByText("K7M2XQP4")).toBeTruthy();
  await act(async () =>
    finish({
      ...snapshot,
      version: 4,
      room: { ...snapshot.room, visibility: "LOCKED", inviteCode: null },
    }),
  );
  expect(screen.queryByText("K7M2XQP4")).toBeNull();
  expect(f.refresh).toHaveBeenCalledOnce();
  expect(f.command).not.toHaveBeenCalled();
});
it("an obsolete settings ACK cannot overwrite a newer host or mode", async () => {
  const f = setup();
  await f.ready();
  let finish!: (value: typeof snapshot) => void;
  f.client.changeVisibility.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const u = userEvent.setup();
  await u.click(screen.getByRole("button", { name: "Cài đặt phòng" }));
  await u.click(screen.getByRole("radio", { name: /Công khai/ }));
  await u.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
  f.publish({
    ...snapshot,
    version: 5,
    room: {
      ...snapshot.room,
      hostId: "b",
      visibility: "LOCKED",
      inviteCode: null,
    },
  });
  await act(async () =>
    finish({
      ...snapshot,
      version: 4,
      room: { ...snapshot.room, visibility: "PUBLIC" },
    }),
  );
  expect(screen.queryByText("K7M2XQP4")).toBeNull();
  expect(screen.queryByRole("button", { name: "Cài đặt phòng" })).toBeNull();
});
it("unlock displays only the new server invite", async () => {
  const f = setup({
    ...snapshot,
    room: { ...snapshot.room, visibility: "LOCKED", inviteCode: null },
  });
  await f.ready();
  f.client.changeVisibility.mockResolvedValue({
    ...snapshot,
    version: 4,
    room: { ...snapshot.room, inviteCode: "NEW8CODE" },
  });
  const u = userEvent.setup();
  await u.click(screen.getByRole("button", { name: "Cài đặt phòng" }));
  await u.click(screen.getByRole("radio", { name: /Chỉ qua mã/ }));
  await u.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
  expect(await screen.findByText("NEW8CODE")).toBeTruthy();
  expect(screen.queryByText("K7M2XQP4")).toBeNull();
});

it("settings uses the latest room version while open and preserves the mode on a failed save", async () => {
  const f = setup();
  await f.ready();
  const u = userEvent.setup();
  await u.click(screen.getByRole("button", { name: "Cài đặt phòng" }));
  f.publish({ ...snapshot, version: 7 });
  f.client.changeVisibility.mockRejectedValue(
    new RoomRequestError("VERSION_STALE", 409),
  );
  f.refresh.mockResolvedValue({ ...snapshot, version: 8 });
  await u.click(screen.getByRole("radio", { name: /Công khai/ }));
  await u.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
  expect(f.client.changeVisibility).toHaveBeenCalledExactlyOnceWith(
    "room",
    7,
    "PUBLIC",
  );
  expect(await screen.findByText(/Chế độ hiện tại: Chỉ qua mã/)).toBeTruthy();
  expect(screen.getByRole("dialog").textContent).toContain("Phòng đã thay đổi");
  expect(screen.getByText("K7M2XQP4")).toBeTruthy();
});
it("a settings ACK after disconnect is ignored even after bare reconnect", async () => {
  const f = setup();
  await f.ready();
  let finish!: (v: typeof snapshot) => void;
  f.client.changeVisibility.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  const u = userEvent.setup();
  await u.click(screen.getByRole("button", { name: "Cài đặt phòng" }));
  await u.click(screen.getByRole("radio", { name: /Công khai/ }));
  await u.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
  f.disconnect();
  f.reconnect();
  await act(async () =>
    finish({
      ...snapshot,
      version: 4,
      room: { ...snapshot.room, visibility: "PUBLIC" },
    }),
  );
  expect(screen.queryByText("Đã cập nhật chế độ phòng.")).toBeNull();
  expect(f.refresh).not.toHaveBeenCalled();
  expect(screen.getByText(/Chế độ hiện tại: Chỉ qua mã/)).toBeTruthy();
});

it("closes settings when the authoritative match result arrives", async () => {
  const f = setup(playing());
  await f.ready();
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Cài đặt phòng" }));
  f.publish(terminal());
  expect(screen.getByRole("dialog", { name: "Bạn thắng!" })).toBeTruthy();
  expect(screen.queryByRole("dialog", { name: "Cài đặt phòng" })).toBeNull();
});

function actionable(): RoomSnapshot {
  return {
    ...playing(),
    draw: { offers: [], remainingMoves: { red: 0, black: 0 } },
  };
}
it("draw sends both canonical versions once and waits for the server proposal", async () => {
  const state = actionable(),
    f = setup(state);
  await f.ready();
  let finish!: (value: unknown) => void;
  f.command.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Xin hòa" }));
  fireEvent.click(screen.getByRole("button", { name: "Xin hòa" }));
  expect(f.command).toHaveBeenCalledExactlyOnceWith(
    {
      type: "match.draw.offer",
      payload: { matchId: state.match!.id, matchVersion: 0 },
    },
    3,
  );
  expect(screen.queryByText("Bạn đang xin hòa")).toBeNull();
  await act(async () =>
    finish({
      status: "ok",
      commandId: "draw",
      snapshot: {
        ...state,
        version: 4,
        match: { ...state.match!, version: 1 },
        draw: {
          offers: [
            {
              id: "22345678-1234-4234-8234-123456789abc",
              sender: "red",
              expiresAt: "2026-10-11T00:00:30Z",
            },
          ],
          remainingMoves: { red: 0, black: 0 },
        },
      },
    }),
  );
  expect(screen.getByText("Bạn đang xin hòa")).toBeTruthy();
});
it("resigning out of turn requires confirmation and keeps the active board until ACK", async () => {
  const state = {
      ...actionable(),
      match: { ...playing().match!, turn: "black" as const },
    },
    f = setup(state);
  await f.ready();
  f.command.mockImplementation(() => new Promise(() => {}));
  fireEvent.click(screen.getByRole("button", { name: "Đầu hàng" }));
  expect(f.command).not.toHaveBeenCalled();
  fireEvent.click(
    within(screen.getByRole("dialog", { name: "Đầu hàng?" })).getByRole(
      "button",
      { name: "Đầu hàng" },
    ),
  );
  expect(f.command).toHaveBeenCalledExactlyOnceWith(
    {
      type: "match.resign",
      payload: { matchId: state.match.id, matchVersion: 0 },
    },
    3,
  );
  expect(screen.getByLabelText("Bàn cờ đang thi đấu")).toBeTruthy();
  expect(screen.queryByText("Bạn thua")).toBeNull();
});
it("terminal push invalidates a pending draw error without reopening actions", async () => {
  const state = actionable(),
    f = setup(state);
  await f.ready();
  let fail!: (reason: unknown) => void;
  f.command.mockImplementation(
    () =>
      new Promise((_resolve, reject) => {
        fail = reject;
      }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Xin hòa" }));
  f.publish({
    ...state,
    version: 4,
    room: { ...state.room, status: "WAITING" },
    match: {
      ...state.match!,
      status: "FINISHED",
      winner: "black",
      endedAt: "2026-10-11T00:00:01Z",
      result: "RESIGN",
      version: 1,
    },
    draw: null,
  });
  await act(async () => fail(Error("private-provider-detail")));
  expect(screen.queryByRole("button", { name: "Xin hòa" })).toBeNull();
  expect(
    screen.queryByText(/Chưa nhận được xác nhận thao tác ván cờ/),
  ).toBeNull();
  expect(screen.queryByText("private-provider-detail")).toBeNull();
});
it("read-only and offline players cannot issue match actions", async () => {
  const state = actionable(),
    f = setup({
      ...state,
      control: { mode: "readonly", generation: 2, reason: "superseded" },
    });
  await f.ready();
  expect(
    (screen.getByRole("button", { name: "Xin hòa" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Xin hòa" }));
  f.disconnect();
  expect(f.command).not.toHaveBeenCalled();
});

it("draw conflict consumes only the authoritative ACK snapshot and keeps a safe conflict message", async () => {
  const state = actionable(),
    f = setup(state);
  await f.ready();
  f.command.mockResolvedValue({
    status: "error",
    commandId: "x",
    error: { code: "MATCH_VERSION_CONFLICT", message: "private-provider" },
    snapshot: {
      ...state,
      version: 4,
      match: { ...state.match!, version: 1 },
      draw: { offers: [], remainingMoves: { red: 5, black: 0 } },
    },
  });
  fireEvent.click(screen.getByRole("button", { name: "Xin hòa" }));
  expect(
    await screen.findByText(
      "Ván cờ đã thay đổi. Kiểm tra trạng thái mới rồi thử lại.",
    ),
  ).toBeTruthy();
  expect(
    screen.getByText("Cần đi thêm 5 nước của bạn để xin hòa lại."),
  ).toBeTruthy();
  expect(screen.queryByText("private-provider")).toBeNull();
  expect(f.command).toHaveBeenCalledTimes(1);
});
it("pre-disconnect draw ACK cannot overwrite a fresh match or clear its pending action", async () => {
  const state = actionable(),
    f = setup(state);
  await f.ready();
  let first!: (value: unknown) => void;
  f.command.mockImplementationOnce(
    () =>
      new Promise((resolve) => {
        first = resolve;
      }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Xin hòa" }));
  f.disconnect();
  f.reconnect();
  const next = {
    ...state,
    version: 5,
    match: { ...state.match!, id: "32345678-1234-4234-8234-123456789abc" },
  };
  f.publish(next);
  f.command.mockImplementationOnce(() => new Promise(() => {}));
  fireEvent.click(screen.getByRole("button", { name: "Xin hòa" }));
  await act(async () =>
    first({
      status: "ok",
      commandId: "old",
      snapshot: { ...state, version: 99 },
    }),
  );
  expect(
    (screen.getByRole("button", { name: "Xin hòa" }) as HTMLButtonElement)
      .disabled,
  ).toBe(true);
  expect(f.command).toHaveBeenCalledTimes(2);
  expect(f.command.mock.calls[1]).toEqual([
    {
      type: "match.draw.offer",
      payload: { matchId: next.match.id, matchVersion: 0 },
    },
    5,
  ]);
});

it("active player Leave warns before HTTP, Stay preserves the game, confirmation waits for ACK", async () => {
  const state = actionable(),
    f = setup(state);
  await f.ready();
  fireEvent.click(screen.getByRole("button", { name: "Rời phòng" }));
  expect(f.client.leave).not.toHaveBeenCalled();
  expect(
    screen.getByText(
      "Rời phòng lúc này được tính là đầu hàng. Bạn sẽ thua ván này.",
    ),
  ).toBeTruthy();
  fireEvent.click(
    within(screen.getByRole("dialog", { name: "Rời phòng?" })).getByRole(
      "button",
      { name: "Ở lại" },
    ),
  );
  expect(f.client.leave).not.toHaveBeenCalled();
  fireEvent.click(screen.getByRole("button", { name: "Rời phòng" }));
  let finish!: (value: unknown) => void;
  f.client.leave.mockImplementation(
    () =>
      new Promise((resolve) => {
        finish = resolve;
      }),
  );
  fireEvent.click(
    within(screen.getByRole("dialog", { name: "Rời phòng?" })).getByRole(
      "button",
      { name: "Rời phòng" },
    ),
  );
  expect(f.client.leave).toHaveBeenCalledExactlyOnceWith("room", 3);
  expect(f.onLeft).not.toHaveBeenCalled();
  await act(async () => finish({ roomId: "room", left: true }));
  expect(f.onLeft).toHaveBeenCalledOnce();
});
it("spectators Leave without claiming resignation or opening player confirmation", async () => {
  const f = setup({ ...actionable(), role: "spectator", draw: null });
  await f.ready();
  fireEvent.click(screen.getByRole("button", { name: "Rời phòng" }));
  expect(f.client.leave).toHaveBeenCalledExactlyOnceWith("room", 3);
  expect(screen.queryByRole("dialog", { name: "Rời phòng?" })).toBeNull();
});

it("initial HTTP PLAYING view cannot resign before the fresh socket match and confirmation", async () => {
  const f = setup(actionable());
  await screen.findByRole("heading", { name: "Kỳ hữu" });
  fireEvent.click(screen.getByRole("button", { name: "Rời phòng" }));
  expect(f.client.leave).not.toHaveBeenCalled();
});
