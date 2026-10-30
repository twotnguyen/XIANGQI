// @vitest-environment jsdom
import { expect, it } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RoomRequestError } from "@web/features/rooms/room-client.js";
import {
  setup,
  playing,
  terminal,
  useRoomPageHooks,
} from "./RoomPage.test-helper.js";
useRoomPageHooks();

it.each(["SWAP", "KEEP"] as const)(
  "offers %s from the result modal and keeps one panel while waiting for the opponent",
  async (side) => {
    const state = terminal();
    const fixture = setup(playing(), { isMember: true });
    await fixture.ready();
    fixture.publish(state);
    const modal = screen.getByRole("dialog", { name: "Bạn thắng!" });
    const choice = within(modal).getByRole("radio", { name: "Đổi phe" });
    expect((choice as HTMLInputElement).checked).toBe(true);
    const user = userEvent.setup();
    if (side === "KEEP")
      await user.click(within(modal).getByRole("radio", { name: "Giữ phe" }));
    fixture.client.proposeRematch.mockResolvedValue({
      ...state,
      version: state.version + 1,
      room: {
        ...state.room,
        rematchOffer: {
          id: "offer",
          proposerId: "a",
          responderId: "b",
          side,
          expiresAt: "2026-10-11T00:00:30Z",
        },
      },
    });
    await user.click(
      within(modal).getByRole("button", { name: "Đề nghị tái đấu" }),
    );
    expect(fixture.client.proposeRematch).toHaveBeenCalledExactlyOnceWith(
      "room",
      state.version,
      side,
    );
    expect(
      await within(modal).findByText(/Đang chờ đối thủ trả lời/),
    ).toBeTruthy();
    expect(document.querySelectorAll(".xq-rematch-panel")).toHaveLength(1);
    expect(screen.getByRole("dialog")).toBe(modal);
  },
);

it("accepts an incoming side choice inside the result and reveals the authoritative countdown", async () => {
  const completed = terminal();
  const state = {
    ...completed,
    room: {
      ...completed.room,
      rematchOffer: {
        id: "offer",
        proposerId: "b",
        responderId: "a",
        side: "KEEP" as const,
        expiresAt: "2026-10-11T00:00:30Z",
      },
    },
  };
  const fixture = setup(playing(), { isMember: true });
  await fixture.ready();
  fixture.publish(state);
  const modal = screen.getByRole("dialog", { name: "Bạn thắng!" });
  expect(
    within(modal).getByText(/Đối thủ đề nghị tái đấu: Giữ phe/),
  ).toBeTruthy();
  fixture.client.respondRematch.mockResolvedValue({
    ...state,
    version: state.version + 1,
    room: {
      ...state.room,
      rematchOffer: null,
      countdown: { token: "next-game", dueAt: "2026-10-11T00:00:03Z" },
    },
  });
  await userEvent
    .setup()
    .click(within(modal).getByRole("button", { name: "Đồng ý" }));
  expect(fixture.client.respondRematch).toHaveBeenCalledExactlyOnceWith(
    "room",
    state.version,
    true,
  );
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(
    screen.getByRole("status", { name: "Đếm ngược bắt đầu ván" }),
  ).toBeTruthy();
  expect(fixture.command).not.toHaveBeenCalled();
});

it("retains a single rematch panel in the waiting room after Stay", async () => {
  const fixture = setup(playing(), { isMember: true });
  await fixture.ready();
  fixture.publish(terminal());
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Ở lại phòng" }));
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(document.querySelectorAll(".xq-rematch-panel")).toHaveLength(1);
  expect(screen.getByRole("button", { name: "Đề nghị tái đấu" })).toBeTruthy();
  expect(fixture.client.proposeRematch).not.toHaveBeenCalled();
});

it("keeps rematch available for a locked custom room without exposing the invite code", async () => {
  const live = playing();
  live.room = { ...live.room, visibility: "LOCKED", inviteCode: null };
  const fixture = setup(live, { isMember: true });
  await fixture.ready();
  fixture.publish(terminal(live));
  expect(
    within(screen.getByRole("dialog")).getByRole("button", {
      name: "Đề nghị tái đấu",
    }),
  ).toBeTruthy();
  expect(screen.queryByText("70521348")).toBeNull();
});

it("shows a rejected rematch inside the result without closing it", async () => {
  const fixture = setup(playing(), { isMember: true });
  await fixture.ready();
  fixture.publish(terminal());
  fixture.client.proposeRematch.mockRejectedValue(
    new RoomRequestError("PLAYER_DISCONNECTED", 409),
  );
  const modal = screen.getByRole("dialog");
  await userEvent
    .setup()
    .click(within(modal).getByRole("button", { name: "Đề nghị tái đấu" }));
  expect(within(modal).getByRole("alert").textContent).toContain(
    "Có người chơi chưa kết nối",
  );
  expect(screen.getByRole("dialog")).toBe(modal);
});

it("keeps the rematch action out of a guest result", async () => {
  const fixture = setup(playing(), { isMember: false });
  await fixture.ready();
  fixture.publish(terminal());
  expect(screen.getByRole("dialog")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Đề nghị tái đấu" })).toBeNull();
});
