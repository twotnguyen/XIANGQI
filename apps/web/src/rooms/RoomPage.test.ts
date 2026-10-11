// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, expect, it, vi } from "vitest";
import {
  cleanup,
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
import type { RoomConnectionInput } from "./room-client.js";
afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.restoreAllMocks();
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
    leave: vi.fn().mockResolvedValue({ roomId: "room", left: true }),
    create: vi.fn(),
    join: vi.fn(),
  };
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
        return { command, close };
      },
    }),
  );
  return {
    client,
    command,
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
