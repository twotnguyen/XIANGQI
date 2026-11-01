// @vitest-environment jsdom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, it } from "vitest";
import { harness, live, panel, settle } from "./MediaPanel.test-helper.js";

it("plays opponent audio only from private while publishing ALL and toggling reception", async () => {
  const { client } = harness({ level: "ALL" });
  const view = render(panel(client));
  const user = userEvent.setup();
  await settle();
  live.state.connectPlan = () => {
    live.state.instances.at(-1)!.subscribe("audio", false);
  };
  await user.click(screen.getByRole("button", { name: "Bật mic" }));
  await settle();
  expect(
    live.state.rooms.filter((room) => room.connected).every((room) => room.mic),
  ).toBe(true);
  expect(view.container.querySelectorAll("audio")).toHaveLength(1);
  await user.click(screen.getByRole("button", { name: "Tắt nhận hình/tiếng" }));
  await waitFor(() =>
    expect(view.container.querySelectorAll("audio")).toHaveLength(0),
  );
  await user.click(screen.getByRole("button", { name: "Hiện hình/tiếng" }));
  await waitFor(() =>
    expect(view.container.querySelectorAll("audio")).toHaveLength(1),
  );
});
