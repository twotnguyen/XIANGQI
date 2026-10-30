// @vitest-environment jsdom
import { expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  snapshot,
  setup,
  playing,
  useRoomPageHooks,
} from "./RoomPage.test-helper.js";
useRoomPageHooks();

it("lets the controlling host move only the opponent into the audience", async () => {
  const fixture = setup();
  await fixture.ready();
  const red = screen.getByRole("region", { name: "Ghế Đỏ" });
  const black = screen.getByRole("region", { name: "Ghế Đen" });
  expect(
    within(red).queryByRole("button", { name: "Chuyển sang người xem" }),
  ).toBeNull();
  fixture.client.moveToSpectator.mockResolvedValue({
    ...snapshot,
    version: 4,
    room: {
      ...snapshot.room,
      seats: { red: "a", black: null },
      spectators: [{ userId: "b", displayName: "Người chơi Đen" }],
    },
  });
  await userEvent
    .setup()
    .click(
      within(black).getByRole("button", { name: "Chuyển sang người xem" }),
    );
  expect(fixture.client.moveToSpectator).toHaveBeenCalledExactlyOnceWith(
    "room",
    3,
    "b",
    fixture.control,
  );
  expect(fixture.client.toSpectator).not.toHaveBeenCalled();
});

it.each([0, 1])(
  "keeps the host action disabled when audience capacity %i is full",
  async (limit) => {
    const fixture = setup({
      ...snapshot,
      room: {
        ...snapshot.room,
        viewerLimit: limit,
        spectators: limit ? [{ userId: "w", displayName: "Người xem" }] : [],
      },
    });
    await fixture.ready();
    const button = screen.getByRole("button", {
      name: "Chuyển sang người xem",
    });
    expect(button.getAttribute("aria-disabled")).toBe("true");
    expect(
      document.getElementById(button.getAttribute("aria-describedby")!)
        ?.textContent,
    ).toBe("Phòng không còn chỗ cho người xem");
    await userEvent.setup().click(button);
    expect(fixture.client.moveToSpectator).not.toHaveBeenCalled();
  },
);

it("does not send the host action from a readonly tab", async () => {
  const fixture = setup({
    ...snapshot,
    control: { mode: "readonly", generation: 2, reason: "superseded" },
  });
  await fixture.ready();
  const button = screen.getByRole("button", { name: "Chuyển sang người xem" });
  expect(button.getAttribute("aria-disabled")).toBe("true");
  await userEvent.setup().click(button);
  expect(fixture.client.moveToSpectator).not.toHaveBeenCalled();
});

it.each(["non-host", "spectator", "playing", "countdown"] as const)(
  "hides the host action for %s",
  async (scenario) => {
    const state = scenario === "playing" ? playing() : snapshot;
    const fixture = setup({
      ...state,
      role: scenario === "spectator" ? "spectator" : "red",
      room: {
        ...state.room,
        hostId: scenario === "non-host" ? "b" : "a",
        countdown:
          scenario === "countdown"
            ? { token: "start", dueAt: "2026-10-11T00:00:03Z" }
            : null,
      },
    });
    await fixture.ready();
    expect(
      screen.queryByRole("button", { name: "Chuyển sang người xem" }),
    ).toBeNull();
  },
);
