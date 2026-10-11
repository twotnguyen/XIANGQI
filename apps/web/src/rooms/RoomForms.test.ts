// @vitest-environment jsdom
import { createElement } from "react";
import { afterEach, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CreateRoomForm, JoinRoomForm } from "./RoomForms.js";
afterEach(cleanup);
it("refuses empty, long and banned names without making a request", async () => {
  const create = vi.fn();
  render(createElement(CreateRoomForm, { onCreate: create }));
  const user = userEvent.setup();
  const name = screen.getByLabelText("Tên phòng");
  await user.click(screen.getByRole("button", { name: "Tạo phòng" }));
  expect(name.getAttribute("aria-invalid")).toBe("true");
  await user.type(name, "x".repeat(61));
  await user.click(screen.getByRole("button", { name: "Tạo phòng" }));
  await user.clear(name);
  await user.type(name, "fuck");
  await user.click(screen.getByRole("button", { name: "Tạo phòng" }));
  expect(create).not.toHaveBeenCalled();
});
it("submits normalized name with 10 minute and 5 viewer defaults", async () => {
  const create = vi.fn().mockResolvedValue(undefined);
  render(createElement(CreateRoomForm, { onCreate: create }));
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Tên phòng"), "  Kỳ hữu  ");
  await user.click(screen.getByRole("button", { name: "Tạo phòng" }));
  expect(create).toHaveBeenCalledWith({
    name: "Kỳ hữu",
    timeMinutes: 10,
    viewerLimit: 5,
  });
});
it("normalizes the formatted room code but rejects ambiguous characters", async () => {
  const join = vi.fn().mockResolvedValue(undefined);
  render(createElement(JoinRoomForm, { onJoin: join }));
  const user = userEvent.setup();
  await user.type(screen.getByLabelText("Mã phòng"), "k7m2-xqp4");
  await user.click(screen.getByRole("button", { name: "Vào phòng" }));
  expect(join).toHaveBeenCalledWith("K7M2XQP4");
  await user.clear(screen.getByLabelText("Mã phòng"));
  await user.type(screen.getByLabelText("Mã phòng"), "OOOOOOOO");
  await user.click(screen.getByRole("button", { name: "Vào phòng" }));
  expect(join).toHaveBeenCalledTimes(1);
});
