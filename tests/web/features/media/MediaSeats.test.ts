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

it("mutes both tracks per source across remounts without affecting another source", () => {
  sessionStorage.clear();
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  const video = document.createElement("video");
  const audio = document.createElement("audio");
  const other = document.createElement("audio");
  const props = {
    roomId: "room",
    seats: { red: "a", black: "b" },
    selfId: "viewer",
    feeds: [
      { key: "video-a", identity: "a", element: video },
      { key: "audio-a", identity: "a", element: audio },
      { key: "audio-b", identity: "b", element: other },
    ],
  };
  const view = render(createElement(MediaSeats, props));
  fireEvent.click(within(screen.getByRole("figure", { name: "Camera Phe Đỏ" })).getByRole("button", { name: "Tắt nhận hình/tiếng" }));
  expect(video.isConnected).toBe(false);
  expect(audio.muted).toBe(true);
  expect(other.muted).toBe(false);
  view.unmount();
  render(createElement(MediaSeats, props));
  expect(video.isConnected).toBe(false);
  expect(audio.muted).toBe(true);
  fireEvent.click(within(screen.getByRole("figure", { name: "Camera Phe Đỏ" })).getByRole("button", { name: "Hiện hình/tiếng" }));
  expect(video.isConnected).toBe(true);
  expect(audio.muted).toBe(false);
});
