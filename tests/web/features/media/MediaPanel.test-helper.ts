import { createElement, type ComponentProps } from "react";
import {
  cleanup,
  screen,
  waitFor,
  type RenderResult,
} from "@testing-library/react";
import { afterEach, beforeEach, expect, vi } from "vitest";
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
    subscriptions: boolean[];
  }
  const state = {
    rooms: [] as RoomRecord[],
    instances: [] as Room[],
    // Mỗi Room mới đọc plan này khi connect; test thay plan để giữ/từ chối kết nối.
    connectPlan: undefined as
      ((token: string) => Promise<void> | void) | undefined,
    devicePlan: undefined as
      | ((
          kind: "video" | "audio",
          enabled: boolean,
          token: string,
        ) => Promise<void> | void)
      | undefined,
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
      subscriptions: [],
    };
    private readonly handlers = new Map<string, unknown>();
    readonly remoteParticipants = new Map<
      string,
      {
        identity: string;
        getTrackPublications(): {
          track: LocalTrack;
          setSubscribed(enabled: boolean): void;
        }[];
      }
    >();
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
      state.instances.push(this);
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
        setCameraEnabled: async (enabled) => {
          await state.devicePlan?.("video", enabled, record.token);
          if (enabled) return { track: publish("video") };
          for (const track of record.tracks)
            if (track.kind === "video") track.stop();
          return undefined;
        },
        setMicrophoneEnabled: async (enabled) => {
          await state.devicePlan?.("audio", enabled, record.token);
          if (enabled) publish("audio");
          else
            for (const track of record.tracks)
              if (track.kind === "audio") track.stop();
        },
        getTrackPublications: () => record.tracks.map((track) => ({ track })),
      };
    }
    on(event: string, handler: unknown) {
      this.handlers.set(event, handler);
    }
    subscribe(kind: "video" | "audio", notify = true) {
      const record = this.record;
      const element = document.createElement(kind);
      const track = {
        kind,
        sid: `remote-${kind}`,
        stopped: false,
        attach: () => element,
        detach: () => element.remove(),
        stop() {},
      };
      const previous =
        this.remoteParticipants.get("b")?.getTrackPublications() ?? [];
      const handlers = this.handlers;
      const publication = {
        track,
        setSubscribed(enabled: boolean) {
          record.subscriptions.push(enabled);
          const handler = handlers.get(
            enabled ? "TrackSubscribed" : "TrackUnsubscribed",
          ) as
            | ((track: unknown, pub: unknown, participant: unknown) => void)
            | undefined;
          handler?.(track, publication, participant);
        },
      };
      const participant = {
        identity: "b",
        getTrackPublications: () => [...previous, publication],
      };
      this.remoteParticipants.set("b", participant);
      const emit = () => {
        const handler = this.handlers.get("TrackSubscribed") as
          | ((track: unknown, pub: unknown, participant: unknown) => void)
          | undefined;
        handler?.(track, publication, participant);
      };
      if (notify) emit();
      return { element, emit };
    }
    emitDisconnected() {
      this.record.connected = false;
      const handler = this.handlers.get("Disconnected") as
        (() => void) | undefined;
      handler?.();
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
    Disconnected: "Disconnected",
    TrackPublished: "TrackPublished",
    ParticipantConnected: "ParticipantConnected",
    Reconnected: "Reconnected",
  },
  Track: { Kind: { Video: "video", Audio: "audio" } },
}));

type Panel = ComponentProps<typeof MediaPanel>;
type Ticket = MediaToken;
type Role = Panel["role"];
type Boundary = "unmount" | "disconnect";

const URL = "wss://media.example.invalid";
const EXPIRES = "2026-10-11T00:10:00Z";
const GENERATION = "11111111-1111-4111-8111-111111111111";

beforeEach(() => {
  // jsdom chưa hiện thực play/pause của HTMLMediaElement.
  vi.spyOn(HTMLMediaElement.prototype, "play").mockResolvedValue();
  vi.spyOn(HTMLMediaElement.prototype, "pause").mockImplementation(() => {});
});

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  live.state.rooms.length = 0;
  live.state.instances.length = 0;
  live.state.connectPlan = undefined;
  live.state.devicePlan = undefined;
});

/** Vé giống máy chủ: khán giả vào phòng stage; kỳ thủ chỉ nhận stage khi ALL và có bật thiết bị. */
function serverTicket(role: Role, level: ShareLevel, devices: boolean): Ticket {
  if (role === "spectator")
    return {
      url: URL,
      token: "viewer-token",
      roomName: "room-stage",
      expiresAt: EXPIRES,
      generation: GENERATION,
      stage: null,
    };
  return {
    url: URL,
    token: "private-token",
    roomName: "room-private",
    expiresAt: EXPIRES,
    generation: GENERATION,
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
  const server = { level, generation: GENERATION };
  const client = {
    sources: vi.fn(async () => ({
      available: true,
      generation: server.generation,
    })),
    token: vi.fn(async (_roomId: string, camera: boolean, mic: boolean) => ({
      ...serverTicket(role, server.level, camera || mic),
      generation: server.generation,
    })),
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
    writable: true,
    tabId: "tab",
    onTakeover: async () => {},
    getControl: async () => ({
      tabId: "tab",
      connectionId: "socket-a",
      generation: 1,
    }),
    ...overrides,
  });
}

/** Rời phòng theo đúng biên: unmount component hoặc ngắt kết nối (connected=false). */
function leave(view: RenderResult, client: MediaClient, boundary: Boundary) {
  if (boundary === "unmount") view.unmount();
  else view.rerender(panel(client, { connected: false }));
}

const cameraButton = () =>
  screen.getByRole("button", { name: /^(Bật|Tắt) camera$/ });
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

export {
  GENERATION,
  cameraButton,
  deferred,
  flush,
  harness,
  leave,
  live,
  panel,
  select,
  serverTicket,
  settle,
  type Boundary,
};
