// @vitest-environment jsdom
import { expect, it } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { snapshot, setup, useRoomPageHooks } from "./RoomPage.test-helper.js";
useRoomPageHooks();

it("loads actual room chat in waiting, keeps private by default and exposes independent public chat", async () => {
  const f = setup();
  await f.ready();
  expect(
    await screen.findByRole("textbox", { name: "Tin nhắn Kênh riêng" }),
  ).toBeTruthy();
  expect(
    screen.queryByRole("textbox", { name: "Tin nhắn Kênh chung" }),
  ).toBeNull();
  await userEvent
    .setup()
    .click(screen.getByRole("button", { name: "Hiện Kênh chung" }));
  expect(
    screen.getByRole("textbox", { name: "Tin nhắn Kênh chung" }),
  ).toBeTruthy();
  expect(f.readChat).toHaveBeenCalledWith("PLAYERS_PRIVATE", 0);
  expect(f.readChat).toHaveBeenCalledWith("ROOM_PUBLIC", 0);
});
it("room chat retry retains raw draft and the command ID while messages remain server-owned", async () => {
  const f = setup();
  await f.ready();
  const user = userEvent.setup();
  await waitFor(() =>
    expect(
      (
        screen.getByRole("textbox", {
          name: "Tin nhắn Kênh riêng",
        }) as HTMLTextAreaElement
      ).disabled,
    ).toBe(false),
  );
  await user.type(
    await screen.findByRole("textbox", { name: "Tin nhắn Kênh riêng" }),
    "Tin thử",
  );
  f.sendChat.mockRejectedValueOnce(new Error("Bạn gửi quá nhanh"));
  await user.click(screen.getByRole("button", { name: "Gửi Kênh riêng" }));
  expect(await screen.findByText("Bạn gửi quá nhanh")).toBeTruthy();
  expect(
    (
      screen.getByRole("textbox", {
        name: "Tin nhắn Kênh riêng",
      }) as HTMLTextAreaElement
    ).value,
  ).toBe("Tin thử");
  await user.click(screen.getByRole("button", { name: "Thử lại Kênh riêng" }));
  expect(f.sendChat.mock.calls[0]![2]).toBe(f.sendChat.mock.calls[1]![2]);
  expect(f.sendChat.mock.calls[1]!.slice(0, 2)).toEqual([
    "PLAYERS_PRIVATE",
    "Tin thử",
  ]);
  expect(screen.queryByText("Tin thử", { selector: "li p" })).toBeNull();
  expect(await screen.findByText("Đã gửi")).toBeTruthy();
});
it("a readonly spectator can send canonical public chat without gaining game control or private access", async () => {
  const f = setup({
    ...snapshot,
    role: "spectator",
    control: { mode: "readonly", generation: 0, reason: "not_allowed" },
  });
  await f.ready();
  const user = userEvent.setup();
  await waitFor(() =>
    expect(
      (
        screen.getByRole("textbox", {
          name: "Tin nhắn Kênh chung",
        }) as HTMLTextAreaElement
      ).disabled,
    ).toBe(false),
  );
  await user.type(
    await screen.findByRole("textbox", { name: "Tin nhắn Kênh chung" }),
    "Chào kỳ hữu",
  );
  await user.click(screen.getByRole("button", { name: "Gửi Kênh chung" }));
  expect(f.sendChat).toHaveBeenCalledWith(
    "ROOM_PUBLIC",
    "Chào kỳ hữu",
    expect.any(String),
  );
  expect(f.readChat.mock.calls.every((call) => call[0] === "ROOM_PUBLIC")).toBe(
    true,
  );
  expect(screen.queryByText("Kênh riêng người chơi")).toBeNull();
  expect(f.command).not.toHaveBeenCalled();
});
it("failed initial chat loading offers a real readonly retry without inventing messages", async () => {
  const f = setup();
  f.readChat.mockRejectedValueOnce(new Error("private-provider-token"));
  await f.ready();
  const retry = await screen.findByRole("button", {
    name: "Tải lại Kênh chung",
  });
  expect(screen.queryByText("private-provider-token")).toBeNull();
  await userEvent.setup().click(retry);
  await waitFor(() =>
    expect(
      screen.queryByRole("button", { name: "Tải lại Kênh chung" }),
    ).toBeNull(),
  );
  expect(
    f.readChat.mock.calls.filter((call) => call[0] === "ROOM_PUBLIC"),
  ).toHaveLength(2);
  expect(f.sendChat).not.toHaveBeenCalled();
});
