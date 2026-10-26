// @vitest-environment jsdom
import { expect, it, vi } from "vitest";
import { screen, act, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { CommandAcknowledgement, RoomSnapshot } from "@xiangqi/shared";
import {
  initialPosition,
  serializePosition,
  playMove,
} from "@xiangqi/xiangqi-core";
import * as gameAudio from "@web/features/rooms/game-audio.js";
import {
  snapshot,
  setup,
  playing,
  useRoomPageHooks,
} from "./RoomPage.test-helper.js";
useRoomPageHooks();

it("sends a canonical move once and updates the board optimistically until server acknowledgement", async () => {
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
    screen.getByRole("img", { name: "Tốt đỏ, cột 1 hàng 6" }),
  ).toBeTruthy();
  expect(
    screen.queryByRole("img", { name: "Tốt đỏ, cột 1 hàng 7" }),
  ).toBeNull();
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
  await vi.waitFor(() => {
    expect(
      screen.getByRole("button", { name: "Tốt đỏ, cột 1 hàng 7" }),
    ).toBeTruthy();
  });
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
      screen.getByRole("img", { name: "Tốt đỏ, cột 1 hàng 6" }),
    ).toBeTruthy();
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
