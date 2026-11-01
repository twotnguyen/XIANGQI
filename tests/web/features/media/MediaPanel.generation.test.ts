// @vitest-environment jsdom
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { MediaToken as Ticket } from "@web/features/media/media-client.js";
import {
  cameraButton,
  deferred,
  flush,
  harness,
  live,
  panel,
  select,
  serverTicket,
  settle,
} from "./MediaPanel.test-helper.js";
describe("media generation fencing", () => {
  it("resumes reception on visible without restoring local capture", async () => {
    const { client } = harness();
    render(panel(client));
    await settle();
    await userEvent.setup().click(cameraButton());
    await settle();
    const visibility = vi.spyOn(document, "visibilityState", "get");
    visibility.mockReturnValue("hidden");
    await act(async () =>
      document.dispatchEvent(new Event("visibilitychange")),
    );
    expect(
      live.state.rooms.every((room) => !room.connected && !room.camera),
    ).toBe(true);
    visibility.mockReturnValue("visible");
    await act(async () =>
      document.dispatchEvent(new Event("visibilitychange")),
    );
    await waitFor(
      () => expect(live.state.rooms.some((room) => room.connected)).toBe(true),
      { timeout: 2500 },
    );
    expect(
      live.state.rooms
        .filter((room) => room.connected)
        .every((room) => !room.camera && !room.mic),
    ).toBe(true);
  });

  it("clears pending connection state when a rotation has no remaining source", async () => {
    const { client, raw, server } = harness();
    const gate = deferred<void>();
    live.state.connectPlan = () => gate.promise;
    render(panel(client));
    await waitFor(() => expect(live.state.rooms).toHaveLength(1));
    server.generation = "22222222-2222-4222-8222-222222222222";
    raw.sources.mockResolvedValue({
      available: false,
      generation: server.generation,
    });
    await waitFor(() => expect(live.state.rooms[0]?.disconnected).toBe(true), {
      timeout: 2500,
    });
    await act(async () => {
      gate.resolve();
      await flush();
    });
    await waitFor(() => expect(select().disabled).toBe(false));
    raw.sources.mockResolvedValue({
      available: true,
      generation: server.generation,
    });
    await waitFor(
      () =>
        expect(
          live.state.rooms.some((room) => room.connected && !room.disconnected),
        ).toBe(true),
      { timeout: 2500 },
    );
  });

  it.each(["poll", "disconnect"] as const)(
    "preserves both devices after rotation detected by %s",
    async (detection) => {
      const { client, server } = harness();
      render(panel(client));
      const user = userEvent.setup();
      await settle();
      await user.click(screen.getByRole("button", { name: "Bật camera" }));
      await settle();
      await user.click(screen.getByRole("button", { name: "Bật mic" }));
      await settle();
      const old = live.state.instances.at(-1)!;
      server.generation = "22222222-2222-4222-8222-222222222222";
      if (detection === "disconnect")
        await act(async () => old.emitDisconnected());
      await waitFor(() => expect(old.record.disconnected).toBe(true), {
        timeout: 2500,
      });
      await waitFor(
        () =>
          expect(
            live.state.rooms.some(
              (room) => room.connected && room.camera && room.mic,
            ),
          ).toBe(true),
        { timeout: 2500 },
      );
      expect(
        live.state.rooms
          .filter((room) => room.connected)
          .every((room) => room.camera && room.mic),
      ).toBe(true);
    },
  );

  it("keeps a muted remote source unsubscribed after rotation", async () => {
    sessionStorage.clear();
    const { client, server } = harness();
    const view = render(panel(client));
    await settle();
    await waitFor(() => expect(live.state.rooms[0]?.connected).toBe(true));
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Tắt nhận hình/tiếng" }));
    server.generation = "22222222-2222-4222-8222-222222222222";
    live.state.connectPlan = () => {
      const room = live.state.instances.at(-1)!;
      room.subscribe("video", false);
      room.subscribe("audio", false);
    };
    await act(async () => live.state.instances[0]!.emitDisconnected());
    await waitFor(() => expect(live.state.rooms[1]?.connected).toBe(true));
    expect(
      live.state.rooms[1]!.subscriptions.every((enabled) => !enabled),
    ).toBe(true);
    expect(live.state.rooms[1]!.subscriptions.length).toBeGreaterThan(0);
    expect(view.container.querySelectorAll("video,audio")).toHaveLength(0);
    sessionStorage.clear();
  });

  it("ignores a delayed recovery token after control is lost", async () => {
    const { client, raw, server } = harness();
    const view = render(panel(client));
    await settle();
    await userEvent.setup().click(cameraButton());
    await settle();
    const token = deferred<Ticket>();
    raw.token.mockImplementationOnce(() => token.promise);
    server.generation = "22222222-2222-4222-8222-222222222222";
    await act(async () => live.state.instances.at(-1)!.emitDisconnected());
    await waitFor(() =>
      expect(raw.token).toHaveBeenLastCalledWith("room", true, false, "tab"),
    );
    view.rerender(panel(client, { writable: false }));
    await act(async () => {
      token.resolve({
        ...serverTicket("red", "OPPONENT", true),
        generation: server.generation,
      });
      await flush();
    });
    expect(live.state.rooms.every((room) => !room.camera && !room.mic)).toBe(
      true,
    );
  });

  it.each(["disconnect", "controller", "pair", "hidden", "unmount"] as const)(
    "does not restore devices when %s interrupts a generation lookup",
    async (boundary) => {
      const { client, raw, server } = harness();
      const view = render(panel(client));
      await settle();
      await userEvent.setup().click(cameraButton());
      await settle();
      const gate = deferred<{ available: boolean; generation: string }>();
      raw.sources.mockImplementationOnce(() => gate.promise);
      await act(async () => live.state.instances.at(-1)!.emitDisconnected());
      if (boundary === "disconnect")
        view.rerender(panel(client, { connected: false }));
      if (boundary === "controller")
        view.rerender(panel(client, { writable: false }));
      if (boundary === "pair")
        view.rerender(panel(client, { seats: { red: "a", black: "c" } }));
      if (boundary === "hidden") {
        vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
        await act(async () =>
          document.dispatchEvent(new Event("visibilitychange")),
        );
      }
      if (boundary === "unmount") view.unmount();
      server.generation = "22222222-2222-4222-8222-222222222222";
      await act(async () => {
        gate.resolve({ available: true, generation: server.generation });
        await flush();
      });
      expect(live.state.rooms.every((room) => !room.camera && !room.mic)).toBe(
        true,
      );
    },
  );
});
