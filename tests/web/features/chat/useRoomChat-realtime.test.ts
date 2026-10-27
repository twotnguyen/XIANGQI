// @vitest-environment jsdom
import { act, cleanup, waitFor } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import type { ChatChannel, ChatPage, RoomSnapshot } from "@xiangqi/shared";
import { page, snapshot, setup } from "./useRoomChat.test-helper.js";

afterEach(cleanup);

function playing(version = 4, matchVersion = 0): RoomSnapshot {
  const s = snapshot();
  return {
    ...s,
    version,
    room: { ...s.room, status: "PLAYING" },
    match: {
      id: "33333333-3333-4333-8333-333333333333",
      version: matchVersion,
      position: "authoritative position",
      lastMove: matchVersion
        ? { from: 54, to: 45, eventVersion: matchVersion }
        : null,
      turn: matchVersion % 2 ? "black" : "red",
      status: "ACTIVE",
      winner: null,
      endedAt: null,
      result: null,
    },
  };
}

it("keeps chat history and composers available during ordinary active moves", async () => {
  const f = setup();
  await f.start(playing());
  await waitFor(() =>
    expect(f.result.current.channels.PLAYERS_PRIVATE?.canSend).toBe(true),
  );
  f.readChat.mockRejectedValue(
    new Error("No chat refresh should accompany this move"),
  );
  act(() => f.result.current.update(playing(5, 1), true));
  expect(f.result.current.channels.PLAYERS_PRIVATE).toMatchObject({
    canSend: true,
    loading: false,
    error: null,
    messages: [expect.objectContaining({ content: "Tin 1" })],
  });
  expect(f.result.current.channels.ROOM_PUBLIC).toMatchObject({
    canSend: true,
    loading: false,
  });
});

it("accepts an already-authorized chat response when only the board advanced while it was in flight", async () => {
  const f = setup();
  let finish!: (p: ChatPage) => void;
  f.readChat.mockImplementation((channel: ChatChannel) =>
    channel === "ROOM_PUBLIC"
      ? Promise.resolve(page(channel))
      : new Promise<ChatPage>((resolve) => {
          finish = resolve;
        }),
  );
  await f.start(playing());
  act(() => f.result.current.update(playing(5, 1), true));
  act(() => f.result.current.update(playing(5, 1), true));
  await act(async () => finish(page("PLAYERS_PRIVATE")));
  expect(f.result.current.channels.PLAYERS_PRIVATE).toMatchObject({
    canSend: true,
    loading: false,
    error: null,
    messages: [expect.objectContaining({ content: "Tin 1" })],
  });
});

it("clears private history on a version gap even when the same pair and an active move are visible", async () => {
  const f = setup();
  await f.start(playing());
  let finish!: (p: ChatPage) => void;
  f.readChat.mockImplementation((channel: ChatChannel) =>
    channel === "ROOM_PUBLIC"
      ? Promise.resolve({ ...page(channel), roomVersion: 6 })
      : new Promise<ChatPage>((resolve) => {
          finish = resolve;
        }),
  );
  act(() => f.result.current.update(playing(6, 1), true));
  expect(f.result.current.channels.PLAYERS_PRIVATE).toMatchObject({
    messages: [],
    canSend: false,
  });
  await act(async () => finish({ ...page("PLAYERS_PRIVATE"), roomVersion: 6 }));
  expect(
    f.result.current.channels.PLAYERS_PRIVATE?.messages.map((m) => m.content),
  ).toEqual(["Tin 1"]);
});
