// @vitest-environment jsdom
import { expect, it, vi } from "vitest";
import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  setup,
  playing,
  terminal,
  useRoomPageHooks,
} from "./RoomPage.test-helper.js";
useRoomPageHooks();
it.each(["CASUAL", "RANKED"] as const)("hides custom-room controls in %s rooms", async (kind) => {
  const state = playing();
  state.room = { ...state.room, kind };
  const fixture = setup(state, { isMember: true });
  await fixture.ready();
  expect(screen.queryByText("70521348")).toBeNull();
  expect(screen.queryByRole("button", { name: "Cài đặt phòng" })).toBeNull();
  expect(screen.queryByText(/Kênh chung/)).toBeNull();
});

it.each(["CASUAL", "RANKED"] as const)("shows a finished %s match without waiting or readiness labels", async (kind) => {
  const state = playing();
  state.room = { ...state.room, kind };
  const fixture = setup(state, { isMember: true });
  await fixture.ready();
  const finished = terminal(state);
  finished.room = { ...finished.room, kind, status: "FINISHED" };
  fixture.publish(finished);
  expect(screen.getByText("Ván cờ đã kết thúc")).toBeTruthy();
  expect(screen.queryByText("Phòng chờ thi đấu")).toBeNull();
  expect(screen.queryByText("Chưa sẵn sàng")).toBeNull();
  expect(screen.queryByText("Đã sẵn sàng")).toBeNull();
});

it("notifies once when a ranked match reaches its terminal snapshot", async () => {
  const state = playing();
  state.room = { ...state.room, kind: "RANKED" };
  const onRankedFinished = vi.fn();
  const fixture = setup(state, { isMember: true, onRankedFinished });
  await fixture.ready();
  expect(onRankedFinished).not.toHaveBeenCalled();
  const finished = terminal(state);
  finished.room = { ...finished.room, kind: "RANKED", status: "FINISHED" };
  fixture.publish(finished);
  fixture.publish(finished);
  expect(onRankedFinished).toHaveBeenCalledOnce();
});

it("hides rematch in the result and retains it after staying in a casual room", async () => {
  const state = playing();
  state.room = { ...state.room, kind: "CASUAL" };
  const fixture = setup(state, { isMember: true });
  await fixture.ready();
  const finished = terminal(state);
  finished.match = { ...finished.match!, winner: null, result: "DRAW_AGREEMENT" };
  finished.room = { ...finished.room, kind: "CASUAL", status: "FINISHED" };
  fixture.publish(finished);
  const modal = screen.getByRole("dialog");
  expect(within(modal).queryByRole("button", { name: "Đề nghị tái đấu" })).toBeNull();
  await userEvent.setup().click(within(modal).getByRole("button", { name: "Ở lại phòng" }));
  expect(screen.getByRole("button", { name: "Đề nghị tái đấu" })).toBeTruthy();
});

it("shows ranked opponent identity and actual rating", async () => {
  const state = playing();
  state.room = { ...state.room, kind: "RANKED", seatPlayers: { red: null, black: { userId: "b", displayName: "Kỳ thủ", guest: false, username: "kythu", avatarUrl: "/avatar.png", rating: { elo: 1420, tier: "Trung cấp", completed: 6, wins: 3, draws: 1, losses: 2, rank: 5, remaining: 0 } } } };
  const fixture = setup(state, { isMember: true });
  await fixture.ready();
  expect(screen.getByText("Kỳ thủ")).toBeTruthy();
  expect(screen.getByText("@kythu")).toBeTruthy();
  expect(screen.getByText("Elo 1420 · Trung cấp")).toBeTruthy();
  expect(screen.getByRole("img", { name: "Ảnh đại diện Kỳ thủ" })).toBeTruthy();
});

it("shows an initial avatar when the ranked opponent has no image", async () => {
  const state = playing();
  state.room = { ...state.room, kind: "RANKED", seatPlayers: { red: null, black: { userId: "b", displayName: "Kỳ thủ", guest: false, username: "kythu", avatarUrl: null, rating: null } } };
  const fixture = setup(state, { isMember: true });
  await fixture.ready();
  expect(screen.getByRole("img", { name: "Ảnh đại diện Kỳ thủ" }).textContent).toBe("K");
});



it("accepts an incoming rematch after leaving the result and reveals the authoritative countdown", async () => {
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
  expect(within(modal).queryByText(/Đối thủ đề nghị tái đấu/)).toBeNull();
  await userEvent.setup().click(within(modal).getByRole("button", { name: "Ở lại phòng" }));
  expect(screen.getByText(/Đối thủ đề nghị tái đấu: Giữ phe/)).toBeTruthy();
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
    .click(screen.getByRole("button", { name: "Đồng ý" }));
  expect(fixture.client.respondRematch).toHaveBeenCalledExactlyOnceWith(
    "room",
    state.version,
    true,
    fixture.control,
  );
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(
    screen.getByRole("status", { name: "Đếm ngược bắt đầu ván" }),
  ).toBeTruthy();
  expect(fixture.command).not.toHaveBeenCalled();
});

it("returns to the waiting room after Stay without a new rematch proposal panel", async () => {
  const fixture = setup(playing(), { isMember: true });
  await fixture.ready();
  fixture.publish(terminal());
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Ở lại phòng" }));
  expect(screen.queryByRole("dialog")).toBeNull();
  expect(document.querySelector(".xq-rematch-panel")).toBeNull();
  expect(screen.queryByRole("button", { name: "Đề nghị tái đấu" })).toBeNull();
  expect(fixture.client.proposeRematch).not.toHaveBeenCalled();
});

it("keeps the result free of rematch controls in a locked custom room", async () => {
  const live = playing();
  live.room = { ...live.room, visibility: "LOCKED", inviteCode: null };
  const fixture = setup(live, { isMember: true });
  await fixture.ready();
  fixture.publish(terminal(live));
  const modal = screen.getByRole("dialog");
  expect(within(modal).queryByRole("button", { name: "Đề nghị tái đấu" })).toBeNull();
  expect(screen.queryByText("70521348")).toBeNull();
});


it("keeps the rematch action out of a guest result", async () => {
  const fixture = setup(playing(), { isMember: false });
  await fixture.ready();
  fixture.publish(terminal());
  expect(screen.getByRole("dialog")).toBeTruthy();
  expect(screen.queryByRole("button", { name: "Đề nghị tái đấu" })).toBeNull();
});
