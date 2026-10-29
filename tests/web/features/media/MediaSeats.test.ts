// @vitest-environment jsdom
import { createElement } from "react";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, it, vi } from "vitest";
import { MediaSeats } from "@web/features/media/MediaSeats.js";

beforeEach(() => {
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
});
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
  expect(screen.getAllByRole("figure")[1]).toBe(red());

  view.rerender(
    createElement(MediaSeats, {
      seats: { red: "b", black: "a" },
      selfId: "a",
      feeds,
    }),
  );
  const black = screen.getByRole("figure", { name: "Camera Phe Đen (Bạn)" });
  expect(within(black).getByLabelText("Video kỳ hữu")).toBe(video);
  expect(screen.getAllByRole("figure")[1]).toBe(black);
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

it("hides only the opponent video and keeps incoming audio muted until enabled again", () => {
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  const ownVideo = document.createElement("video");
  const video = document.createElement("video");
  const audio = document.createElement("audio");
  const feeds = [
    { key: "self", identity: "a", element: ownVideo },
    { key: "opponent-video", identity: "b", element: video },
    { key: "opponent-audio", identity: "b", element: audio },
  ];
  const props = { seats: { red: "a", black: "b" }, selfId: "a", feeds };
  const view = render(
    createElement(MediaSeats, {
      ...props,
      seats: { red: "a", black: null },
    }),
  );
  fireEvent.click(screen.getByRole("button", { name: "Ẩn camera đối thủ" }));
  fireEvent.click(screen.getByRole("button", { name: "Tắt tiếng đối thủ" }));
  expect(screen.getByText("Đang chờ người chơi")).toBeTruthy();
  view.rerender(createElement(MediaSeats, props));
  expect(video.isConnected).toBe(false);
  expect(ownVideo.isConnected).toBe(true);
  expect(audio.muted).toBe(true);

  const replacement = document.createElement("audio");
  view.rerender(
    createElement(MediaSeats, {
      ...props,
      seats: { red: "b", black: "a" },
      feeds: [
        ...feeds.filter((feed) => feed.key !== "opponent-audio"),
        { key: "new-audio", identity: "b", element: replacement },
      ],
    }),
  );
  expect(replacement.muted).toBe(true);
  expect(video.isConnected).toBe(false);
  expect(ownVideo.isConnected).toBe(true);
  fireEvent.click(screen.getByRole("button", { name: "Hiện camera đối thủ" }));
  fireEvent.click(screen.getByRole("button", { name: "Bật tiếng đối thủ" }));
  expect(video.isConnected).toBe(true);
  expect(replacement.muted).toBe(false);
});
