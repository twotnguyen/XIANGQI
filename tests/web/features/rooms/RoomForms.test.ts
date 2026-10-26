// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateRoomForm, JoinRoomForm } from "@web/features/rooms/RoomForms.js";
afterEach(cleanup);
it("submits chosen room settings without a room name", async () => {
  const create = vi.fn().mockResolvedValue(undefined);
  render(createElement(CreateRoomForm, { onCreate: create }));
  const user = userEvent.setup();
  await user.click(screen.getByLabelText("15 phút"));
  await user.selectOptions(screen.getByLabelText("Người xem"), "3");
  await user.click(screen.getByRole("button", { name: "Tạo phòng" }));
  expect(create).toHaveBeenCalledExactlyOnceWith({
    timeMinutes: 15,
    viewerLimit: 3,
  });
});
it("keeps eight digits only and rejects letters", async () => {
  const join = vi.fn().mockResolvedValue(undefined);
  render(createElement(JoinRoomForm, { onJoin: join }));
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Mã phòng"), "7052-13AB48");
  await user.click(screen.getByRole("button", { name: "Vào phòng" }));
  expect(join).toHaveBeenCalledWith("70521348");
  await user.clear(screen.getByLabelText("Mã phòng"));
  await user.type(screen.getByLabelText("Mã phòng"), "OOOOOOOO");
  await user.click(screen.getByRole("button", { name: "Vào phòng" }));
  expect(join).toHaveBeenCalledTimes(1);
});
