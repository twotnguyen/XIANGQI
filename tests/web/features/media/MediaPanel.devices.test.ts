// @vitest-environment jsdom
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import {
  deferred,
  flush,
  harness,
  leave,
  live,
  panel,
  settle,
  type Boundary,
} from "./MediaPanel.test-helper.js";

const cases = (["OPPONENT", "ALL"] as const).flatMap((level) =>
  (["camera", "mic"] as const).map((first) => ({ level, first })),
);

describe("independent media device updates", () => {
  it.each(cases)(
    "$level: keeps $first and the opponent stream running while toggling the other device",
    async ({ level, first }) => {
      const { client } = harness({ level });
      const view = render(panel(client));
      const user = userEvent.setup();
      await settle();
      await user.click(screen.getByRole("button", { name: `Bật ${first}` }));
      await settle();
      const rooms = live.state.rooms.filter((room) => room.connected);
      const tracks = rooms.map((room) => room.tracks[0]!);
      const localVideo = view.container.querySelector(
        '[aria-label="Camera của bạn"]',
      );
      let opponentVideo!: HTMLElement;
      await act(async () => {
        opponentVideo = live.state.instances[1]!.subscribe("video").element;
      });
      const other = first === "camera" ? "mic" : "camera";
      const gate = deferred<void>();
      live.state.devicePlan = (kind, enabled) =>
        enabled && kind === (other === "camera" ? "video" : "audio")
          ? gate.promise
          : undefined;
      await user.click(screen.getByRole("button", { name: `Bật ${other}` }));
      expect(rooms.every((room) => room.connected && room[first])).toBe(true);
      expect(tracks.every((track) => !track.stopped)).toBe(true);
      expect(view.container.contains(opponentVideo)).toBe(true);
      if (first === "camera")
        expect(
          view.container.querySelector('[aria-label="Camera của bạn"]'),
        ).toBe(localVideo);
      await act(async () => gate.resolve());
      await settle();
      expect(live.state.rooms.filter((room) => room.connected)).toEqual(rooms);
      expect(rooms.every((room) => room.camera && room.mic)).toBe(true);
      await user.click(screen.getByRole("button", { name: `Tắt ${other}` }));
      await settle();
      expect(rooms.every((room) => room[first] && !room[other])).toBe(true);
      expect(tracks.every((track) => !track.stopped)).toBe(true);
      await user.click(screen.getByRole("button", { name: `Tắt ${first}` }));
      await settle();
      await user.click(screen.getByRole("button", { name: `Bật ${first}` }));
      await settle();
      expect(rooms.every((room) => room.connected && room[first])).toBe(true);
      expect(rooms.every((room) => !room.disconnected)).toBe(true);
      expect(view.container.contains(opponentVideo)).toBe(true);
    },
  );

  it.each(cases)(
    "$level: can turn off $first while the other device is pending, without a spinner",
    async ({ level, first }) => {
      const { client } = harness({ level });
      const view = render(panel(client));
      const user = userEvent.setup();
      await settle();
      await user.click(screen.getByRole("button", { name: `Bật ${first}` }));
      await settle();
      const rooms = live.state.rooms.filter((room) => room.connected);
      const other = first === "camera" ? "mic" : "camera";
      const otherKind = other === "camera" ? "video" : "audio";
      const gate = deferred<void>();
      live.state.devicePlan = (kind, enabled) =>
        kind === otherKind && enabled ? gate.promise : undefined;
      await user.click(screen.getByRole("button", { name: `Bật ${other}` }));
      const pendingButton = screen.getByRole("button", {
        name: `Tắt ${other}`,
      });
      const firstButton = screen.getByRole("button", { name: `Tắt ${first}` });
      expect(pendingButton.getAttribute("aria-disabled")).toBe("true");
      expect(firstButton.getAttribute("aria-disabled")).toBe("false");
      expect(pendingButton.textContent).toBe("");
      expect(firstButton.textContent).toBe("");
      expect(view.container.querySelector(".xq-spinner")).toBeNull();
      await user.click(pendingButton);
      await user.click(firstButton);
      await act(flush);
      expect(rooms.every((room) => room.connected && !room[first])).toBe(true);
      await act(async () => gate.resolve());
      await settle();
      expect(rooms.every((room) => !room[first] && room[other])).toBe(true);
      expect(
        rooms.every(
          (room) =>
            room.tracks.filter((track) => track.kind === otherKind).length ===
            1,
        ),
      ).toBe(true);
      expect(live.state.rooms.filter((room) => room.connected)).toEqual(rooms);
    },
  );

  it.each(cases)(
    "$level: a failure enabling the other device leaves $first running",
    async ({ level, first }) => {
      const { client } = harness({ level });
      const view = render(panel(client));
      const user = userEvent.setup();
      await settle();
      await user.click(screen.getByRole("button", { name: `Bật ${first}` }));
      await settle();
      const rooms = live.state.rooms.filter((room) => room.connected);
      const tracks = rooms.map((room) => room.tracks[0]!);
      const video = view.container.querySelector(
        '[aria-label="Camera của bạn"]',
      );
      const other = first === "camera" ? "mic" : "camera";
      live.state.devicePlan = (kind, enabled, token) => {
        if (
          enabled &&
          kind === (other === "camera" ? "video" : "audio") &&
          (level !== "ALL" || token === "stage-token")
        ) {
          const error = new Error("permission denied");
          error.name = "NotAllowedError";
          throw error;
        }
      };
      await user.click(screen.getByRole("button", { name: `Bật ${other}` }));
      await settle();
      expect(
        rooms.every((room) => room.connected && room[first] && !room[other]),
      ).toBe(true);
      expect(tracks.every((track) => !track.stopped)).toBe(true);
      expect(
        screen
          .getByRole("button", { name: `Bật ${other}` })
          .getAttribute("aria-pressed"),
      ).toBe("false");
      expect(screen.getByText(/Bạn chưa cấp quyền/)).toBeTruthy();
      if (first === "camera")
        expect(
          view.container.querySelector('[aria-label="Camera của bạn"]'),
        ).toBe(video);
    },
  );

  it.each<Boundary>(["unmount", "disconnect"])(
    "stops a delayed device enable when the panel crosses %s",
    async (boundary) => {
      const { client } = harness({ level: "ALL" });
      const view = render(panel(client));
      const user = userEvent.setup();
      await settle();
      await user.click(screen.getByRole("button", { name: "Bật camera" }));
      await settle();
      const rooms = live.state.rooms.filter((room) => room.connected);
      const gate = deferred<void>();
      live.state.devicePlan = (kind, enabled) =>
        kind === "audio" && enabled ? gate.promise : undefined;
      await user.click(screen.getByRole("button", { name: "Bật mic" }));
      leave(view, client, boundary);
      await act(async () => {
        gate.resolve();
        await flush();
      });
      await waitFor(() =>
        expect(
          rooms.every((room) => room.disconnected && !room.camera && !room.mic),
        ).toBe(true),
      );
      expect(
        rooms.every((room) => room.tracks.every((track) => track.stopped)),
      ).toBe(true);
    },
  );
});
