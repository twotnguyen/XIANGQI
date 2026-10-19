// @vitest-environment jsdom
import { createElement } from "react";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MediaPanel } from "@web/features/media/MediaPanel.js";
import type { MediaClient } from "@web/features/media/media-client.js";

const live = vi.hoisted(() => {
  const instances: {
    url: string;
    token: string;
    camera: boolean;
    mic: boolean;
  }[] = [];
  class Room {
    handlers = new Map<string, (...args: unknown[]) => void>();
    localParticipant = {
      setCameraEnabled: async (value: boolean) => {
        const last = instances[instances.length - 1];
        if (last) last.camera = value;
      },
      setMicrophoneEnabled: async (value: boolean) => {
        const last = instances[instances.length - 1];
        if (last) last.mic = value;
      },
    };
    constructor() {
      instances.push({ url: "", token: "", camera: false, mic: false });
    }
    on(event: string, handler: (...args: unknown[]) => void) {
      this.handlers.set(event, handler);
    }
    async connect(url: string, token: string) {
      const last = instances[instances.length - 1]!;
      last.url = url;
      last.token = token;
    }
    removeAllListeners() {
      this.handlers.clear();
    }
    async disconnect() {
      /* nothing */
    }
  }
  return { instances, Room };
});
vi.mock("livekit-client", () => ({
  Room: live.Room,
  RoomEvent: {
    TrackSubscribed: "TrackSubscribed",
    TrackUnsubscribed: "TrackUnsubscribed",
  },
  Track: { Kind: { Video: "video", Audio: "audio" } },
}));

afterEach(() => cleanup());

function client(overrides: Partial<MediaClient> = {}): MediaClient {
  return {
    token: vi.fn().mockResolvedValue({
      url: "wss://media.example.invalid",
      token: "tk",
      roomName: "xiangqi-room",
      expiresAt: "2026-10-11T00:10:00Z",
      stage: null,
    }),
    setShare: vi.fn().mockResolvedValue({ level: "OPPONENT" }),
    getShare: vi.fn().mockResolvedValue({ level: "OPPONENT" }),
    ...overrides,
  } as unknown as MediaClient;
}

describe("media panel", () => {
  it("keeps camera and mic off by default and requests tokens on toggle", async () => {
    live.instances.length = 0;
    const c = client();
    render(
      createElement(MediaPanel, {
        roomId: "room",
        role: "red",
        client: c,
        connected: true,
        seats: { red: "a", black: "b" },
        userId: "a",
      }),
    );
    expect(screen.getByRole("button", { name: "Bật camera" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Bật mic" })).toBeTruthy();
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Bật camera" }));
    await waitFor(() =>
      expect(c.token).toHaveBeenCalledWith("room", true, false),
    );
    await waitFor(() => expect(live.instances[0]!.token).toBe("tk"));
  });
  it("keeps viewers publish free and hides controls", async () => {
    live.instances.length = 0;
    const c = client();
    render(
      createElement(MediaPanel, {
        roomId: "room",
        role: "spectator",
        client: c,
        connected: true,
        seats: { red: "a", black: "b" },
        userId: "viewer",
      }),
    );
    expect(screen.queryByRole("button", { name: "Bật camera" })).toBeNull();
    expect(
      screen.getByText("Người xem chỉ nhận hình tiếng", { exact: false }),
    ).toBeTruthy();
  });
  it("publishes to the stage room only when sharing with everyone", async () => {
    live.instances.length = 0;
    const c = client({
      token: vi.fn().mockResolvedValue({
        url: "wss://media.example.invalid",
        token: "private-token",
        roomName: "xiangqi-room",
        expiresAt: "2026-10-11T00:10:00Z",
        stage: { token: "stage-token", roomName: "xiangqi-room-stage" },
      }),
    });
    render(
      createElement(MediaPanel, {
        roomId: "room",
        role: "red",
        client: c,
        connected: true,
        seats: { red: "a", black: "b" },
        userId: "a",
      }),
    );
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Bật camera" }));
    await waitFor(() => expect(live.instances.length).toBe(2));
    expect(live.instances.map((room) => room.token).sort()).toEqual([
      "private-token",
      "stage-token",
    ]);
  });
});
