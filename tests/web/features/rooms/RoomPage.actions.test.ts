// @vitest-environment jsdom
import { expect, it } from "vitest";
import { within, screen, act, fireEvent } from "@testing-library/react";
import {
  setup,
  playing,
  actionable,
  useRoomPageHooks,
} from "./RoomPage.test-helper.js";
useRoomPageHooks();

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
