// @vitest-environment jsdom
import { expect, it } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  snapshot,
  setup,
  playing,
  useRoomPageHooks,
} from "./RoomPage.test-helper.js";
useRoomPageHooks();

it.each([0, 1])(
  "explains why a waiting player cannot move to a %i-capacity full audience",
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
    const button = screen.getByRole("button", { name: "Chuyển sang xem" });
    expect(button.getAttribute("aria-disabled")).toBe("true");
    const reason = document.getElementById(
      button.getAttribute("aria-describedby")!,
    );
    expect(reason?.textContent).toBe("Phòng không còn chỗ cho người xem");
    await userEvent.setup().click(button);
    expect(fixture.client.toSpectator).not.toHaveBeenCalled();
  },
);

it.each(["host", "active", "spectator"] as const)(
  "keeps moving to the audience hidden for %s",
  async (scenario) => {
    const state = scenario === "active" ? playing() : snapshot;
    const fixture = setup({
      ...state,
      role: scenario === "spectator" ? "spectator" : "red",
      room: { ...state.room, hostId: scenario === "host" ? "a" : "b" },
    });
    await fixture.ready();
    expect(
      screen.queryByRole("button", { name: "Chuyển sang xem" }),
    ).toBeNull();
  },
);
