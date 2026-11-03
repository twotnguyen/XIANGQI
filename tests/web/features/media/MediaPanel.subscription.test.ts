// @vitest-environment jsdom
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { harness, live, panel, settle } from "./MediaPanel.test-helper.js";

it("defaults ranked opponent media to hidden and limits the sharing audience", async () => {
  const { client } = harness();
  render(panel(client, { kind: "RANKED" }));
  await settle();
  expect(screen.getByRole("button", { name: "Hiện hình/tiếng đối thủ" })).toBeTruthy();
  expect(screen.queryByRole("option", { name: "Cả đối thủ và người xem" })).toBeNull();
  await userEvent.setup().click(screen.getByRole("button", { name: "Hiện hình/tiếng đối thủ" }));
  expect(screen.getByRole("button", { name: "Tắt ngay" })).toBeTruthy();
});

it("plays opponent audio only from private while publishing ALL and toggling reception", async () => {
  const { client } = harness({ level: "ALL" });
  const view = render(panel(client));
  const user = userEvent.setup();
  await settle();
  await waitFor(() => expect(live.state.rooms[0]?.connected).toBe(true));
  await act(async () => { live.state.instances[0]!.subscribe("audio"); });
  await user.click(screen.getByRole("button", { name: "Bật mic" }));
  await settle();
  expect(
    live.state.rooms.filter((room) => room.connected && room.tracks.length > 0).every((room) => room.mic),
  ).toBe(true);
  expect(view.container.querySelectorAll("audio")).toHaveLength(1);
  await user.click(screen.getByRole("button", { name: "Ẩn camera đối thủ" }));
  await user.click(screen.getByRole("button", { name: "Tắt tiếng đối thủ" }));
  await waitFor(() =>
    expect(view.container.querySelectorAll("audio")).toHaveLength(0),
  );
  await user.click(screen.getByRole("button", { name: "Hiện camera đối thủ" }));
  await waitFor(() =>
    expect(view.container.querySelectorAll("audio")).toHaveLength(1),
  );
});
