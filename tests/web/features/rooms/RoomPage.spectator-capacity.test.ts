// @vitest-environment jsdom
import { expect, it } from "vitest";
import { screen } from "@testing-library/react";
import {
  snapshot,
  setup,
  playing,
  useRoomPageHooks,
} from "./RoomPage.test-helper.js";
useRoomPageHooks();

it.each([0, 1])(
  "offers no empty audience places when capacity %i is full",
  async (limit) => {
    const fixture = setup({
      ...snapshot,
      room: {
        ...snapshot.room,
        hostId: "b",
        viewerLimit: limit,
        spectators: limit ? [{ userId: "w1", displayName: "Kỳ hữu xem" }] : [],
      },
    });
    await fixture.ready();
    expect(screen.queryByRole("button", { name: /Chuyển sang xem tại chỗ/ })).toBeNull();
    expect(fixture.client.toSpectator).not.toHaveBeenCalled();
  },
);

it.each(["active", "spectator"] as const)(
  "keeps moving to the audience hidden for %s",
  async (scenario) => {
    const state = scenario === "active" ? playing() : snapshot;
    const fixture = setup({
      ...state,
      role: scenario === "spectator" ? "spectator" : "red",
      room: { ...state.room, hostId: "b" },
    });
    await fixture.ready();
    expect(
      screen.queryByRole("button", { name: /Chuyển sang xem tại chỗ/ }),
    ).toBeNull();
  },
);
