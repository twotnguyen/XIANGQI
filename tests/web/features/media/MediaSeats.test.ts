// @vitest-environment jsdom
import { createElement } from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { MediaSeats } from "@web/features/media/MediaSeats.js";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

it("follows the participant when seats swap and removes their video when they leave", () => {
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  const video = document.createElement("video");
  video.setAttribute("aria-label", "Video kỳ hữu");
  const feeds = [{ key: "track-a", identity: "a", element: video }];
  const view = render(
    createElement(MediaSeats, {
      seats: { red: "a", black: "b" },
      selfId: "a",
      feeds,
    }),
  );
  const red = () => screen.getByRole("figure", { name: "Camera Phe Đỏ (Bạn)" });
  expect(within(red()).getByLabelText("Video kỳ hữu")).toBe(video);

  view.rerender(
    createElement(MediaSeats, {
      seats: { red: "b", black: "a" },
      selfId: "a",
      feeds,
    }),
  );
  const black = screen.getByRole("figure", { name: "Camera Phe Đen (Bạn)" });
  expect(within(black).getByLabelText("Video kỳ hữu")).toBe(video);
  expect(
    within(
      screen.getByRole("figure", { name: "Camera Phe Đỏ" }),
    ).queryByLabelText("Video kỳ hữu"),
  ).toBeNull();

  view.rerender(
    createElement(MediaSeats, {
      seats: { red: "b", black: null },
      selfId: "a",
      feeds,
    }),
  );
  expect(screen.queryByLabelText("Video kỳ hữu")).toBeNull();
  expect(screen.getByText("Đang chờ người chơi")).toBeTruthy();
});
