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
  expect(
    (screen.getByLabelText("Quyền truy cập") as HTMLSelectElement).value,
  ).toBe("CODE_ONLY");
  await user.click(screen.getByLabelText("15 phút"));
  await user.selectOptions(screen.getByLabelText("Người xem"), "3");
  await user.selectOptions(screen.getByLabelText("Quyền truy cập"), "PUBLIC");
  await user.click(screen.getByRole("button", { name: "Tạo phòng" }));
  expect(create).toHaveBeenCalledExactlyOnceWith({
    timeMinutes: 15,
    viewerLimit: 3,
    visibility: "PUBLIC",
  });
});
it("can switch back to code-only before creating", async () => {
  const create = vi.fn().mockResolvedValue(undefined);
  render(createElement(CreateRoomForm, { onCreate: create }));
  const user = userEvent.setup();
  const access = screen.getByLabelText("Quyền truy cập");
  await user.selectOptions(access, "PUBLIC");
  await user.selectOptions(access, "CODE_ONLY");
  await user.click(screen.getByRole("button", { name: "Tạo phòng" }));
  expect(create).toHaveBeenCalledOnce();
  expect(create).toHaveBeenCalledWith(
    expect.objectContaining({ visibility: "CODE_ONLY" }),
  );
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

it("shows and locks the original choices while recovering an uncertain room creation", async () => {
  const create = vi.fn().mockResolvedValue(undefined);
  const input = {
    timeMinutes: 15 as const,
    viewerLimit: 2,
    visibility: "PUBLIC" as const,
  };
  render(
    createElement(CreateRoomForm, { onCreate: create, recoveryInput: input }),
  );
  expect((screen.getByLabelText("15 phút") as HTMLInputElement).checked).toBe(
    true,
  );
  expect((screen.getByLabelText("Người xem") as HTMLSelectElement).value).toBe(
    "2",
  );
  expect(
    (screen.getByLabelText("Người xem") as HTMLSelectElement).disabled,
  ).toBe(true);
  expect(
    (screen.getByLabelText("Quyền truy cập") as HTMLSelectElement).value,
  ).toBe("PUBLIC");
  expect(screen.getByRole("status").textContent).toContain(
    "không tạo thêm phòng",
  );
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Tạo phòng" }));
  expect(create).toHaveBeenCalledExactlyOnceWith(input);
});
