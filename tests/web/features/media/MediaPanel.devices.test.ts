// @vitest-environment jsdom
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
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
  it("keeps a stop control outside the hidden camera panel without interrupting capture", async () => {
    const { client } = harness();
    const host = document.createElement("div");
    document.body.append(host);
    const view = render(panel(client));
    const user = userEvent.setup();
    await settle();
    await user.click(screen.getByRole("button", { name: "Bật camera" }));
    await settle();
    const tracks = live.state.rooms.flatMap((room) => room.tracks);
    view.rerender(panel(client, { controlsHost: host }));
    view.container.hidden = true;
    try {
      expect(host.textContent).toContain("Đang phát camera");
      expect(tracks.some((track) => !track.stopped)).toBe(true);
      await user.click(
        screen.getByRole("button", { name: "Tắt camera và mic" }),
      );
      expect(tracks.every((track) => track.stopped)).toBe(true);
      expect(host.textContent).toBe("");
    } finally {
      view.unmount();
      host.remove();
    }
  });

  it("does not silently restart the microphone after retrying source discovery", async () => {
    const { client, raw } = harness();
    render(panel(client));
    const user = userEvent.setup();
    await settle();
    await user.click(screen.getByRole("button", { name: "Bật mic" }));
    await settle();
    raw.sources.mockRejectedValue(new Error("discovery offline"));
    await screen.findByRole(
      "button",
      { name: "Thử lại camera/mic" },
      { timeout: 2500 },
    );
    await user.click(
      screen.getByRole("button", { name: "Thử lại camera/mic" }),
    );
    await settle();
    expect(screen.getByRole("button", { name: "Bật mic" })).toBeTruthy();
    await user.click(screen.getByRole("button", { name: "Bật camera" }));
    await settle();
    expect(
      live.state.rooms
        .filter((room) => room.connected)
        .every((room) => !room.mic),
    ).toBe(true);
  });

  it("stops both devices when sharing becomes NONE", async () => {
    const { client } = harness();
    render(panel(client));
    const user = userEvent.setup();
    await settle();
    await user.click(screen.getByRole("button", { name: "Bật camera" }));
    await settle();
    await user.click(screen.getByRole("button", { name: "Bật mic" }));
    await settle();
    const rooms = [...live.state.rooms];
    await user.selectOptions(screen.getByLabelText("Mức chia sẻ"), "NONE");
    await settle();
    expect(
      rooms.every((room) => room.tracks.every((track) => track.stopped)),
    ).toBe(true);
    expect(screen.getByRole("button", { name: "Bật camera" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Bật mic" })).toBeTruthy();
  });

  it("stops capture when the document becomes hidden", async () => {
    const { client } = harness();
    render(panel(client));
    const user = userEvent.setup();
    await settle();
    await user.click(screen.getByRole("button", { name: "Bật camera" }));
    await settle();
    const rooms = [...live.state.rooms];
    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    await act(async () =>
      document.dispatchEvent(new Event("visibilitychange")),
    );
    expect(
      rooms.every((room) => room.tracks.every((track) => track.stopped)),
    ).toBe(true);
    expect(screen.getByRole("button", { name: "Bật camera" })).toBeTruthy();
  });

  it("keeps capture on a side swap but stops it when the opponent changes", async () => {
    const { client } = harness();
    const view = render(panel(client));
    const user = userEvent.setup();
    await settle();
    await user.click(screen.getByRole("button", { name: "Bật camera" }));
    await settle();
    const tracks = live.state.rooms.flatMap((room) => room.tracks);
    view.rerender(panel(client, { seats: { red: "b", black: "a" } }));
    expect(tracks.some((track) => !track.stopped)).toBe(true);
    view.rerender(panel(client, { seats: { red: "c", black: "a" } }));
    expect(tracks.every((track) => track.stopped)).toBe(true);
  });
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
