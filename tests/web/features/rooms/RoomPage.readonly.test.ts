// @vitest-environment jsdom
import { expect, it } from "vitest";
import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { RoomSnapshot } from "@xiangqi/shared";
import {
  setup,
  snapshot,
  terminal,
  playing,
  useRoomPageHooks,
} from "./RoomPage.test-helper.js";
useRoomPageHooks();
const readonly = {
  mode: "readonly",
  generation: 2,
  reason: "superseded",
} as const;
it("disables room management, leaving, seat changes and spectator commands on a superseded player tab", async () => {
  const f = setup({
    ...snapshot,
    control: readonly,
    room: {
      ...snapshot.room,
      spectators: [{ userId: "viewer", displayName: "Người xem" }],
    },
  });
  await f.ready();
  expect(screen.queryByRole("button", { name: "Cài đặt phòng" })).toBeNull();
  const user = userEvent.setup();
  for (const name of [
    "Rời phòng",
    "Xin đổi bên",
    "Chuyển sang người xem",
    "Đuổi",
  ]) {
    const button = screen.getByRole("button", { name }) as HTMLButtonElement;
    expect(button.getAttribute("aria-disabled"), name).toBe("true");
    await user.click(button);
  }
  expect(f.getControl).not.toHaveBeenCalled();
  expect(f.client.leave).not.toHaveBeenCalled();
  expect(f.client.proposeSwap).not.toHaveBeenCalled();
  expect(f.client.moveToSpectator).not.toHaveBeenCalled();
  expect(f.client.kickViewer).not.toHaveBeenCalled();
});
it("stops an already-open settings submission when authority changes during getControl", async () => {
  const f = setup();
  await f.ready();
  let resolve!: (proof: typeof f.control) => void;
  f.getControl.mockImplementation(
    () =>
      new Promise((done) => {
        resolve = done;
      }),
  );
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Cài đặt phòng" }));
  await user.click(screen.getByRole("radio", { name: /Công khai/ }));
  await user.click(screen.getByRole("button", { name: "Lưu thay đổi" }));
  f.publish({ ...snapshot, version: 4, control: readonly });
  await act(async () => {
    resolve(f.control);
  });
  expect(f.client.changeVisibility).not.toHaveBeenCalled();
});
it.each([false, true])(
  "preserves spectator-owned leave and invitation controls; superseded=%s",
  async (superseded) => {
    const state: RoomSnapshot = {
      ...snapshot,
      role: "spectator",
      room: {
        ...snapshot.room,
        hostId: "b",
        seats: { red: "b", black: null },
        spectators: [{ userId: "a", displayName: "Người xem" }],
        downOffer: {
          id: "offer",
          inviteeId: "a",
          expiresAt: "2026-10-11T00:00:30Z",
        },
      },
      control: {
        mode: "readonly",
        generation: 1,
        reason: superseded ? "superseded" : "not_allowed",
      },
    };
    const f = setup(state);
    await f.ready();
    const leave = screen.getByRole("button", {
      name: "Rời phòng",
    }) as HTMLButtonElement;
    const accept = screen.getByRole("button", {
      name: "Chấp nhận",
    }) as HTMLButtonElement;
    expect(leave.getAttribute("aria-disabled")).toBe(String(superseded));
    expect(accept.getAttribute("aria-disabled")).toBe(String(superseded));
    if (superseded) {
      await userEvent.setup().click(accept);
      await userEvent.setup().click(leave);
      expect(f.getControl).not.toHaveBeenCalled();
      expect(f.client.respondDown).not.toHaveBeenCalled();
      expect(f.client.leave).not.toHaveBeenCalled();
    } else {
      f.client.respondDown.mockResolvedValue(state);
      await userEvent.setup().click(accept);
      expect(f.client.respondDown).toHaveBeenCalledExactlyOnceWith(
        "room",
        state.version,
        "offer",
        true,
        f.control,
      );
    }
  },
);
it("keeps the final result readable with leave disabled and local Stay available on a superseded tab", async () => {
  const f = setup(playing(), { isMember: true });
  await f.ready();
  f.publish({ ...terminal(), control: readonly });
  const modal = screen.getByRole("dialog", { name: "Bạn thắng!" });
  const leave = within(modal).getByRole("button", {
    name: "Rời phòng",
  }) as HTMLButtonElement;
  expect(leave.disabled).toBe(true);
  await userEvent.setup().click(leave);
  expect(f.client.leave).not.toHaveBeenCalled();
  await userEvent
    .setup()
    .click(within(modal).getByRole("button", { name: "Ở lại phòng" }));
  expect(screen.queryByRole("dialog")).toBeNull();
});
