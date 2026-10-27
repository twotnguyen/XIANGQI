// @vitest-environment jsdom
import { createElement, type ComponentProps } from "react";
import {
  cleanup,
  render,
  screen,
  waitFor,
  type RenderResult,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MediaPanel } from "@web/features/media/MediaPanel.js";
import type {
  MediaClient,
  MediaToken,
  ShareLevel,
} from "@web/features/media/media-client.js";

const live = vi.hoisted(() => {
  interface LocalTrack {
    kind: "video" | "audio";
    stopped: boolean;
    attach(): HTMLElement;
    stop(): void;
  }
  interface RoomRecord {
    url: string;
    token: string;
    connected: boolean;
    disconnected: boolean;
    camera: boolean;
    mic: boolean;
    tracks: LocalTrack[];
  }
  const state = {
    rooms: [] as RoomRecord[],
    // Mỗi Room mới đọc plan này khi connect; test thay plan để giữ/từ chối kết nối.
    connectPlan: undefined as
      ((token: string) => Promise<void> | void) | undefined,
  };
  // Mỗi instance sở hữu trạng thái riêng: không ghi nhầm sang phòng khác.
  class Room {
    readonly record: RoomRecord = {
      url: "",
      token: "",
      connected: false,
      disconnected: false,
      camera: false,
      mic: false,
      tracks: [],
    };
    private readonly handlers = new Map<string, unknown>();
    readonly localParticipant: {
      setCameraEnabled(
        enabled: boolean,
      ): Promise<{ track: LocalTrack } | undefined>;
      setMicrophoneEnabled(enabled: boolean): Promise<void>;
      getTrackPublications(): { track: LocalTrack }[];
    };
    constructor() {
      const record = this.record;
      state.rooms.push(record);
      const publish = (kind: "video" | "audio"): LocalTrack => {
        const track: LocalTrack = {
          kind,
          stopped: false,
          attach: () =>
            document.createElement(kind === "video" ? "video" : "audio"),
          stop() {
            track.stopped = true;
            if (kind === "video") record.camera = false;
            else record.mic = false;
          },
        };
        record.tracks.push(track);
        if (kind === "video") record.camera = true;
        else record.mic = true;
        return track;
      };
      this.localParticipant = {
        setCameraEnabled: async (enabled) =>
          enabled ? { track: publish("video") } : undefined,
        setMicrophoneEnabled: async (enabled) => {
          if (enabled) publish("audio");
        },
        getTrackPublications: () => record.tracks.map((track) => ({ track })),
      };
    }
    on(event: string, handler: unknown) {
      this.handlers.set(event, handler);
    }
    async connect(url: string, token: string) {
      this.record.url = url;
      this.record.token = token;
      await state.connectPlan?.(token);
      this.record.connected = true;
    }
    removeAllListeners() {
      this.handlers.clear();
    }
    async disconnect() {
      this.record.connected = false;
      this.record.disconnected = true;
    }
  }
  return { state, Room };
});

vi.mock("livekit-client", () => ({
  Room: live.Room,
  RoomEvent: {
    TrackSubscribed: "TrackSubscribed",
    TrackUnsubscribed: "TrackUnsubscribed",
  },
  Track: { Kind: { Video: "video", Audio: "audio" } },
}));

type Panel = ComponentProps<typeof MediaPanel>;
type Ticket = MediaToken;
type Role = Panel["role"];
type Boundary = "unmount" | "disconnect";

const URL = "wss://media.example.invalid";
const EXPIRES = "2026-10-11T00:10:00Z";

beforeEach(() => {
  // jsdom chưa hiện thực HTMLMediaElement.play; mô phỏng như trình duyệt: trả Promise đã resolve.
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  live.state.rooms.length = 0;
  live.state.connectPlan = undefined;
});

/** Vé giống máy chủ: khán giả vào phòng stage; kỳ thủ chỉ nhận stage khi ALL và có bật thiết bị. */
function serverTicket(role: Role, level: ShareLevel, devices: boolean): Ticket {
  if (role === "spectator")
    return {
      url: URL,
      token: "viewer-token",
      roomName: "room-stage",
      expiresAt: EXPIRES,
      stage: null,
    };
  return {
    url: URL,
    token: "private-token",
    roomName: "room-private",
    expiresAt: EXPIRES,
    stage:
      level === "ALL" && devices
        ? { token: "stage-token", roomName: "room-stage" }
        : null,
  };
}

function harness({
  role = "red",
  level = "OPPONENT",
  setShare,
}: {
  role?: Role;
  level?: ShareLevel;
  setShare?: (
    roomId: string,
    next: ShareLevel,
  ) => Promise<{ level: ShareLevel }>;
} = {}) {
  const server = { level };
  const client = {
    token: vi.fn(async (_roomId: string, camera: boolean, mic: boolean) =>
      serverTicket(role, server.level, camera || mic),
    ),
    setShare: vi.fn(
      setShare ??
        (async (_roomId: string, next: ShareLevel) => {
          server.level = next;
          return { level: next };
        }),
    ),
    getShare: vi.fn(async () => ({ level: server.level })),
  };
  return { client: client as unknown as MediaClient, server, raw: client };
}

function panel(client: MediaClient, overrides: Partial<Panel> = {}) {
  return createElement(MediaPanel, {
    roomId: "room",
    role: "red",
    client,
    connected: true,
    seats: { red: "a", black: "b" },
    userId: "a",
    ...overrides,
  });
}

/** Rời phòng theo đúng biên: unmount component hoặc ngắt kết nối (connected=false). */
function leave(view: RenderResult, client: MediaClient, boundary: Boundary) {
  if (boundary === "unmount") view.unmount();
  else view.rerender(panel(client, { connected: false }));
}

const cameraButton = () => screen.getByRole("button", { name: /camera/ });
const select = () => screen.getByLabelText("Mức chia sẻ") as HTMLSelectElement;

/** Nhường microtask để chuỗi await của component chạy hết; không dùng thời gian thực. */
async function flush() {
  for (let tick = 0; tick < 20; tick++) await Promise.resolve();
}

/** Chờ thao tác trước đó xong (select bị khoá khi busy). */
async function settle() {
  await waitFor(() => expect(select().disabled).toBe(false));
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

describe("media panel joins and receives", () => {
  it("subscribes spectators receive-only on the primary room without publishing", async () => {
    const { client } = harness({ role: "spectator", level: "ALL" });
    render(panel(client, { role: "spectator", userId: "viewer" }));
    await waitFor(() => expect(live.state.rooms[0]?.connected).toBe(true));
    const [room] = live.state.rooms;
    expect(client.token).toHaveBeenCalledWith("room", false, false);
    expect(room!.token).toBe("viewer-token");
    expect(room!.camera || room!.mic).toBe(false);
    expect(room!.tracks).toHaveLength(0);
    expect(screen.queryByRole("button", { name: "Bật camera" })).toBeNull();
    expect(
      screen.getByText("Người xem chỉ nhận hình tiếng", { exact: false }),
    ).toBeTruthy();
  });

  it("lets a player with both devices off receive on the private room", async () => {
    const { client } = harness({ level: "OPPONENT" });
    render(panel(client));
    await waitFor(() => expect(live.state.rooms[0]?.connected).toBe(true));
    expect(client.token).toHaveBeenCalledWith("room", false, false);
    const [room] = live.state.rooms;
    expect(room!.token).toBe("private-token");
    expect(room!.camera || room!.mic).toBe(false);
    expect(cameraButton().getAttribute("aria-pressed")).toBe("false");
    expect(await screen.findByText("Camera và mic đang tắt.")).toBeTruthy();
  });

  it("rejoins receive-only after reconnect without enabling devices", async () => {
    const { client } = harness();
    const view = render(panel(client));
    await waitFor(() => expect(live.state.rooms[0]?.connected).toBe(true));
    view.rerender(panel(client, { connected: false }));
    await waitFor(() => expect(live.state.rooms[0]?.disconnected).toBe(true));
    view.rerender(panel(client, { connected: true }));
    await waitFor(() => expect(live.state.rooms).toHaveLength(2));
    await waitFor(() => expect(live.state.rooms[1]?.connected).toBe(true));
    expect(client.token).toHaveBeenNthCalledWith(2, "room", false, false);
    expect(live.state.rooms[1]!.camera || live.state.rooms[1]!.mic).toBe(false);
  });

  it("resets a camera that was on when the room changes and rejoins receive-only", async () => {
    const { client } = harness();
    const view = render(panel(client));
    await waitFor(() => expect(live.state.rooms[0]?.connected).toBe(true));
    await settle();
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Bật camera" }));
    await waitFor(() => expect(live.state.rooms[1]?.camera).toBe(true));
    await settle();
    view.rerender(panel(client, { roomId: "room-2" }));
    await waitFor(() => expect(live.state.rooms).toHaveLength(3));
    await waitFor(() => expect(live.state.rooms[2]?.connected).toBe(true));
    expect(client.token).toHaveBeenLastCalledWith("room-2", false, false);
    expect(live.state.rooms[2]!.camera).toBe(false);
    expect(cameraButton().getAttribute("aria-pressed")).toBe("false");
  });
});

describe("media panel publishing", () => {
  it("publishes only after an explicit click and stays on the private room at OPPONENT", async () => {
    const { client } = harness({ level: "OPPONENT" });
    render(panel(client));
    await waitFor(() => expect(live.state.rooms[0]?.connected).toBe(true));
    await settle();
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Bật camera" }));
    await waitFor(() => expect(live.state.rooms[1]?.camera).toBe(true));
    expect(client.token).toHaveBeenLastCalledWith("room", true, false);
    expect(live.state.rooms.some((room) => room.token === "stage-token")).toBe(
      false,
    );
    expect(live.state.rooms[0]!.camera).toBe(false);
    expect(await screen.findByText("Đang chia sẻ hình tiếng.")).toBeTruthy();
  });

  it("publishes camera to private and stage rooms when confirmed ALL", async () => {
    const { client } = harness({ level: "ALL" });
    render(panel(client));
    await waitFor(() => expect(live.state.rooms[0]?.connected).toBe(true));
    await settle();
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Bật camera" }));
    await waitFor(() =>
      expect(live.state.rooms.filter((room) => room.camera)).toHaveLength(2),
    );
    const publishing = live.state.rooms.filter((room) => room.camera);
    expect(publishing.map((room) => room.token).sort()).toEqual([
      "private-token",
      "stage-token",
    ]);
  });

  it("keeps successful toggles and an ALL share change working", async () => {
    const { client } = harness();
    render(panel(client));
    await waitFor(() => expect(live.state.rooms[0]?.connected).toBe(true));
    const user = userEvent.setup();
    await settle();
    await user.click(screen.getByRole("button", { name: "Bật camera" }));
    await waitFor(() => expect(live.state.rooms[1]?.camera).toBe(true));
    await settle();
    await user.click(screen.getByRole("button", { name: "Tắt camera" }));
    await waitFor(() => expect(live.state.rooms[1]?.disconnected).toBe(true));
    expect(live.state.rooms[1]!.tracks.every((track) => track.stopped)).toBe(
      true,
    );
    await waitFor(() => expect(live.state.rooms[2]?.connected).toBe(true));
    expect(live.state.rooms[2]!.camera).toBe(false);
    await settle();
    await user.click(screen.getByRole("button", { name: "Bật mic" }));
    await waitFor(() => expect(live.state.rooms[3]?.mic).toBe(true));
    await settle();
    await user.selectOptions(select(), "ALL");
    expect(client.setShare).toHaveBeenCalledWith("room", "ALL");
    await waitFor(() =>
      expect(
        live.state.rooms.some(
          (room) => room.token === "stage-token" && room.mic,
        ),
      ).toBe(true),
    );
    expect(select().value).toBe("ALL");
  });
});

describe("media panel share failures", () => {
  it.each<ShareLevel>(["NONE", "OPPONENT"])(
    "failed ALL -> %s write stops publishing and never reconnects publicly",
    async (target) => {
      const { client } = harness({
        level: "ALL",
        setShare: async () => {
          throw new Error("offline");
        },
      });
      render(panel(client));
      await waitFor(() => expect(live.state.rooms[0]?.connected).toBe(true));
      const user = userEvent.setup();
      await settle();
      await user.click(screen.getByRole("button", { name: "Bật camera" }));
      await waitFor(() =>
        expect(live.state.rooms.filter((room) => room.camera)).toHaveLength(2),
      );
      const publishing = live.state.rooms.slice(1);
      await settle();
      await user.selectOptions(select(), target);
      expect(client.setShare).toHaveBeenCalledWith("room", target);
      expect(await screen.findByText(/Chưa thể đổi mức chia sẻ/)).toBeTruthy();
      expect(select().value).toBe("ALL");
      expect(screen.getByRole("button", { name: "Bật camera" })).toBeTruthy();
      await waitFor(() =>
        expect(publishing.every((room) => room.disconnected)).toBe(true),
      );
      expect(
        publishing.every((room) => room.tracks.every((t) => t.stopped)),
      ).toBe(true);
      const rejoined = live.state.rooms.slice(3);
      expect(client.token).toHaveBeenLastCalledWith("room", false, false);
      expect(rejoined.some((room) => room.camera || room.mic)).toBe(false);
      expect(rejoined.some((room) => room.token === "stage-token")).toBe(false);
    },
  );

  it.each<Boundary>(["unmount", "disconnect"])(
    "ignores a share save that resolves after %s and keeps the next confirmed level",
    async (boundary) => {
      const save = deferred<{ level: ShareLevel }>();
      const { client } = harness({ setShare: () => save.promise });
      const view = render(panel(client));
      await waitFor(() => expect(live.state.rooms[0]?.connected).toBe(true));
      await settle();
      await userEvent.setup().selectOptions(select(), "ALL");
      expect(client.setShare).toHaveBeenCalledWith("room", "ALL");
      leave(view, client, boundary);
      save.resolve({ level: "ALL" });
      await flush();
      if (boundary === "disconnect") expect(select().value).toBe("OPPONENT");
    },
  );

  it("does not apply a share save that resolves after the room changed", async () => {
    const save = deferred<{ level: ShareLevel }>();
    const { client } = harness({ setShare: () => save.promise });
    const view = render(panel(client));
    await waitFor(() => expect(live.state.rooms[0]?.connected).toBe(true));
    await settle();
    await userEvent.setup().selectOptions(select(), "ALL");
    view.rerender(panel(client, { roomId: "room-2" }));
    save.resolve({ level: "ALL" });
    await flush();
    expect(select().value).toBe("OPPONENT");
  });
});

describe("media panel lifecycle", () => {
  it.each<Boundary>(["unmount", "disconnect"])(
    "drops a token resolved after %s without publishing",
    async (boundary) => {
      const { client } = harness();
      const view = render(panel(client));
      await waitFor(() => expect(live.state.rooms[0]?.connected).toBe(true));
      await settle();
      const pending = deferred<Ticket>();
      vi.mocked(client.token).mockImplementationOnce(() => pending.promise);
      await userEvent
        .setup()
        .click(screen.getByRole("button", { name: "Bật camera" }));
      expect(client.token).toHaveBeenLastCalledWith("room", true, false);
      leave(view, client, boundary);
      pending.resolve(serverTicket("red", "ALL", true));
      await flush();
      expect(live.state.rooms).toHaveLength(1);
      expect(live.state.rooms[0]!.camera).toBe(false);
    },
  );

  it.each<Boundary>(["unmount", "disconnect"])(
    "releases a connect that finishes after %s and never publishes",
    async (boundary) => {
      const { client } = harness();
      const view = render(panel(client));
      await waitFor(() => expect(live.state.rooms[0]?.connected).toBe(true));
      await settle();
      const gate = deferred<void>();
      live.state.connectPlan = () => gate.promise;
      await userEvent
        .setup()
        .click(screen.getByRole("button", { name: "Bật camera" }));
      await waitFor(() => expect(live.state.rooms).toHaveLength(2));
      leave(view, client, boundary);
      gate.resolve();
      await flush();
      const room = live.state.rooms[1]!;
      expect(room.disconnected).toBe(true);
      expect(room.camera).toBe(false);
      expect(room.tracks).toHaveLength(0);
    },
  );

  it("stops every opened room and track when a stage connect fails midway", async () => {
    const { client } = harness({ level: "ALL" });
    render(panel(client));
    await waitFor(() => expect(live.state.rooms[0]?.connected).toBe(true));
    await settle();
    live.state.connectPlan = (token) =>
      token === "stage-token"
        ? Promise.reject(new Error("stage down"))
        : undefined;
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Bật camera" }));
    expect(
      await screen.findByText("Chưa thể kết nối hình tiếng. Vui lòng thử lại."),
    ).toBeTruthy();
    const opened = live.state.rooms.slice(1);
    await waitFor(() =>
      expect(opened.every((room) => room.disconnected && !room.camera)).toBe(
        true,
      ),
    );
    expect(opened.every((room) => room.tracks.every((t) => t.stopped))).toBe(
      true,
    );
    expect(screen.getByRole("button", { name: "Bật camera" })).toBeTruthy();
  });
});
