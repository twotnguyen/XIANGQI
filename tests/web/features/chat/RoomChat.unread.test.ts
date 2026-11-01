// @vitest-environment jsdom
import { createElement } from "react";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, expect, it } from "vitest";
import type { ChatChannel } from "@xiangqi/shared";
import { RoomChat } from "@web/features/chat/RoomChat.js";
import { page, roomId, setup, snapshot } from "./useRoomChat.test-helper.js";

afterEach(cleanup);
it.each(["seat", "viewer", "opponent"] as const)(
  "keeps public unread while %s changes without changing public scope",
  async (transition) => {
    const f = setup();
    const initial = {
      ...snapshot(),
      role: transition === "seat" ? ("spectator" as const) : ("red" as const),
    };
    await f.start(initial);
    const chat = () =>
      createElement(RoomChat, {
        viewerRole: "red",
        userId: roomId,
        connected: true,
        panelVisible: false,
        ...f.result.current,
      });
    const view = render(chat());
    f.readChat.mockImplementation(async (channel: ChatChannel) => ({
      ...page(channel, 2),
      roomVersion: 5,
      messages: [{ ...page(channel, 2).messages[0]!, senderId: "other" }],
    }));
    act(() =>
      f.result.current.changed({
        roomId,
        channel: "ROOM_PUBLIC",
        roomVersion: 4,
        scopeToken: "a".repeat(64),
        canSend: true,
      }),
    );
    await waitFor(() =>
      expect(
        f.result.current.channels.ROOM_PUBLIC.messages.at(-1)?.sequence,
      ).toBe(2),
    );
    view.rerender(chat());
    expect(screen.getByLabelText("1 tin chưa xem")).toBeTruthy();
    const next = {
      ...initial,
      version: 5,
      role: transition === "viewer" ? ("spectator" as const) : ("red" as const),
      room: {
        ...initial.room,
        seats: {
          ...initial.room.seats,
          black: transition === "opponent" ? "c" : "b",
        },
      },
    };
    act(() => f.result.current.update(next, true));
    view.rerender(chat());
    expect(screen.getByLabelText("1 tin chưa xem")).toBeTruthy();
    await waitFor(() =>
      expect(f.result.current.channels.ROOM_PUBLIC.loading).toBe(false),
    );
    view.rerender(chat());
    expect(screen.getByLabelText("1 tin chưa xem")).toBeTruthy();
    expect(f.result.current.channels.ROOM_PUBLIC.historyThrough).toBe(1);
  },
);
