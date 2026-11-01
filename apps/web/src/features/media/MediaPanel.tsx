import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { RoomControlProof } from "@xiangqi/shared";
import {
  RemoteParticipant,
  Room,
  RoomEvent,
  Track,
  type RemoteTrackPublication,
} from "livekit-client";
import { Button, Dialog, Notice } from "../../shared/ui/primitives.js";
import {
  MediaRequestError,
  type MediaClient,
  type ShareLevel,
} from "./media-client.js";
import { MediaSeats, type MediaFeed } from "./MediaSeats.js";
const LABELS: Record<ShareLevel, string> = {
  NONE: "Không chia sẻ",
  OPPONENT: "Chỉ đối thủ",
  ALL: "Cả đối thủ và người xem",
};

function CameraIcon({ off }: { off?: boolean }) {
  if (off) {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="xq-media-icon"
      >
        <line x1="2" y1="2" x2="22" y2="22" />
        <path d="M10.41 10.41a2 2 0 0 0 2.83 2.83" />
        <path d="M16 16v1a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h2" />
        <path d="m22 7-5 4v2l5 4V7z" />
      </svg>
    );
  }
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="xq-media-icon"
    >
      <path d="m22 7-5 4v6l5 4V7z" />
      <rect x="2" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  );
}

function MicIcon({ off }: { off?: boolean }) {
  if (off) {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="xq-media-icon"
      >
        <line x1="2" y1="2" x2="22" y2="22" />
        <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
        <path d="M5 10v2a7 7 0 0 0 12 5" />
        <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
        <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
        <line x1="12" y1="19" x2="12" y2="22" />
      </svg>
    );
  }
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="xq-media-icon"
    >
      <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}

const DEFAULT_MEDIA_ERROR = "Chưa thể kết nối hình tiếng. Vui lòng thử lại.";

function mediaErrorMessage(error: unknown, devices: boolean): string {
  const insecure =
    typeof window !== "undefined" &&
    !window.isSecureContext &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1";
  if (devices && insecure)
    return "Trình duyệt chỉ cho phép Camera/Mic qua HTTPS hoặc localhost. Để dùng qua IP mạng khác, cần truy cập qua HTTPS.";
  if (error instanceof MediaRequestError)
    return devices
      ? "Chưa thể bật camera hoặc mic. Kiểm tra quyền trình duyệt."
      : DEFAULT_MEDIA_ERROR;
  if (error instanceof Error) {
    if (
      error.name === "NotAllowedError" ||
      error.name === "PermissionDeniedError"
    )
      return "Bạn chưa cấp quyền truy cập Camera/Mic trên trình duyệt.";
    if (error.name === "NotFoundError" || error.name === "DevicesNotFoundError")
      return "Không tìm thấy thiết bị Camera hoặc Microphone trên máy.";
  }
  return DEFAULT_MEDIA_ERROR;
}

/** Ngắt phòng LiveKit và dừng mọi track local đang giữ thiết bị; gọi lại nhiều lần vẫn an toàn. */
function releaseRoom(room: Room) {
  room.removeAllListeners();
  for (const publication of room.localParticipant.getTrackPublications())
    publication.track?.stop();
  void room.disconnect();
}

/** Tắt/bật nhận đúng nguồn ở tầng subscription; xuất bản của participant từ xa luôn là RemoteTrackPublication. */
function receive(participant: RemoteParticipant, enabled: boolean) {
  for (const publication of participant.getTrackPublications())
    (publication as RemoteTrackPublication).setSubscribed(enabled);
}

/**
 * Bảng điều khiển Facecam và Micro LiveKit trong phòng cờ (bật/tắt thiết bị, thiết lập phạm vi chia sẻ và kết nối phòng LiveKit).
 */
export function MediaPanel({
  roomId,
  role,
  client,
  connected,
  writable,
  tabId,
  onTakeover,
  getControl,
  seats,
  userId,
  controlsHost,
  kind = "CUSTOM",
}: {
  roomId: string;
  role: "red" | "black" | "spectator";
  client: MediaClient;
  connected: boolean;
  // Tab hiện tại đang giữ quyền điều khiển phòng (snapshot máy chủ).
  writable: boolean;
  tabId: string;
  // Chuyển quyền điều khiển sang tab này qua máy chủ; ném lỗi nếu thất bại.
  onTakeover: () => Promise<void>;
  getControl?: () => Promise<RoomControlProof>;
  seats: { red: string | null; black: string | null };
  userId: string;
  controlsHost?: HTMLElement | null;
  kind?: "CUSTOM" | "CASUAL" | "RANKED";
}) {
  const player = role !== "spectator";
  const [switching, setSwitching] = useState(false);
  const [switchPending, setSwitchPending] = useState(false);
  const [camera, setCamera] = useState(false);
  const [mic, setMic] = useState(false);
  // Mức đang áp dụng: chỉ đổi khi máy chủ xác nhận; mặc định khớp máy chủ (OPPONENT).
  const [level, setLevel] = useState<ShareLevel>("OPPONENT");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [mediaFailed, setMediaFailed] = useState(false);
  const [incoming, setIncoming] = useState(false);
  const [visibilityVersion, setVisibilityVersion] = useState(0);
  const incomingRef = useRef(false);
  const setDemand = useCallback((available: boolean) => {
    incomingRef.current = available;
    setIncoming(available);
  }, []);
  const [pendingDevices, setPendingDevices] = useState({
    camera: false,
    mic: false,
  });
  const devicePending = useRef({ camera: false, mic: false });
  const [feeds, setFeeds] = useState<MediaFeed[]>([]);
  const rooms = useRef<Room[]>([]);
  const publishReady = useRef(false);
  const epoch = useRef(0);
  const intent = useRef({ camera: false, mic: false });
  const generation = useRef<string | null>(null);
  const recover = useRef<(id: number, previous: string) => void>(() => {});
  const authority = useRef({
    connected,
    writable,
    player,
    roomId,
    pair: "",
    visible: true,
  });
  const pair = [seats.red, seats.black].filter(Boolean).sort().join(":");
  authority.current = {
    connected,
    writable,
    player,
    roomId,
    pair,
    visible: document.visibilityState !== "hidden",
  };
  const stopIntent = useCallback(() => {
    intent.current = { camera: false, mic: false };
    setCamera(false);
    setMic(false);
  }, []);
  const levelRef = useRef<ShareLevel>("OPPONENT");
  const shareVersion = useRef(0);
  const elements = useRef(new Map<string, HTMLElement>());
  const running = useRef(false);
  const receiverMuted = useRef<readonly string[]>(kind === "RANKED" ? [seats.red, seats.black].filter((identity): identity is string => identity !== null && identity !== userId) : []);
  const receiveRoom = useRef<Room | null>(null);
  const applyReceiverChoice = useCallback((identities: readonly string[]) => {
    receiverMuted.current = identities;
    if (receiveRoom.current)
      for (const participant of receiveRoom.current.remoteParticipants.values())
        receive(participant, !identities.includes(participant.identity));
  }, []);

  const confirmLevel = useCallback((next: ShareLevel) => {
    levelRef.current = next;
    setLevel(next);
  }, []);

  // Đổi vòng đời hoặc cấp lại ticket làm tác vụ cũ thành stale và giải phóng phòng cũ.
  const invalidate = useCallback(() => {
    const id = ++epoch.current;
    const live = rooms.current;
    rooms.current = [];
    receiveRoom.current = null;
    running.current = false;
    publishReady.current = false;
    generation.current = null;
    devicePending.current = { camera: false, mic: false };
    setPendingDevices(devicePending.current);
    setFeeds([]);
    elements.current.clear();
    for (const room of live) releaseRoom(room);
    return id;
  }, []);

  useEffect(() => {
    let active = true;
    const version = shareVersion.current;
    void client
      .getShare(roomId)
      .then((value) => {
        if (active && version === shareVersion.current) {
          confirmLevel(value.level);
          if (
            value.level === "NONE" &&
            (intent.current.camera || intent.current.mic)
          ) {
            invalidate();
            stopIntent();
            setBusy(false);
          }
        }
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [client, roomId, confirmLevel, invalidate, stopIntent]);

  const attachTrack = useCallback(
    (track: Track, participant: RemoteParticipant, roomName: string) => {
      if (track.kind !== Track.Kind.Video && track.kind !== Track.Kind.Audio)
        return;
      const sid = track.sid ?? `${participant.identity}-${track.kind}`;
      const key = `${roomName}:${participant.identity}:${sid}`;
      if (elements.current.has(key)) return;
      const element = track.attach();
      // Video phát im lặng; âm thanh đối thủ đi qua track audio riêng.
      if (track.kind === Track.Kind.Video) element.muted = true;
      element.setAttribute(
        "aria-label",
        `${track.kind === Track.Kind.Video ? "Hình" : "Tiếng"} của ${participant.identity}`,
      );
      element.setAttribute("playsinline", "true");
      setFeeds((previous) => [
        ...previous,
        { key, identity: participant.identity, element },
      ]);
      elements.current.set(key, element);
    },
    [],
  );

  const connect = useCallback(
    async (
      id: number,
      url: string,
      token: string,
      roomName: string,
      publish: { camera: boolean; mic: boolean },
      canReceive: boolean,
    ) => {
      const current = () => epoch.current === id;
      const live = new Room({ adaptiveStream: true, dynacast: true });
      rooms.current.push(live);
      if (canReceive) receiveRoom.current = live;
      live.on(RoomEvent.Disconnected, () => {
        if (!current()) return;
        const previous = generation.current;
        const recoveryId = invalidate();
        setBusy(true);
        if (previous) recover.current(recoveryId, previous);
        else {
          setBusy(false);
          stopIntent();
          setMediaFailed(true);
          setStatus("Camera/mic tạm thời không dùng được");
        }
      });
      const subscribe = () => {
        if (!current() || !canReceive) return;
        for (const participant of live.remoteParticipants.values())
          receive(
            participant,
            !receiverMuted.current.includes(participant.identity),
          );
      };
      live.on(RoomEvent.TrackPublished, subscribe);
      live.on(RoomEvent.ParticipantConnected, subscribe);
      live.on(RoomEvent.Reconnected, subscribe);
      live.on(RoomEvent.TrackSubscribed, (track, _publication, participant) => {
        if (!current() || !canReceive) return;
        if (receiverMuted.current.includes(participant.identity)) {
          receive(participant, false);
          return;
        }
        attachTrack(track, participant, roomName);
      });
      live.on(RoomEvent.TrackUnsubscribed, (track, _pub, participant) => {
        if (!current()) return;
        const sid = track.sid ?? `${participant.identity}-${track.kind}`;
        const key = `${roomName}:${participant.identity}:${sid}`;
        const element = elements.current.get(key);
        elements.current.delete(key);
        track.detach();
        if (element) element.remove();
        setFeeds((previous) => previous.filter((feed) => feed.key !== key));
      });
      await live.connect(url, token, { autoSubscribe: false });
      if (!current()) {
        releaseRoom(live);
        return;
      }
      subscribe();
      // Track có thể được subscribe trước khi Room phát sự kiện ở trạng thái connected.
      for (const participant of live.remoteParticipants.values())
        for (const publication of participant.getTrackPublications())
          if (
            publication.track &&
            canReceive &&
            !receiverMuted.current.includes(participant.identity)
          )
            attachTrack(publication.track, participant, roomName);
      if (publish.camera) {
        const publication = await live.localParticipant.setCameraEnabled(true);
        if (!current()) {
          releaseRoom(live);
          return;
        }
        if (publication?.track) {
          const element = publication.track.attach();
          element.muted = true;
          element.setAttribute("playsinline", "true");
          element.setAttribute("aria-label", "Camera của bạn");
          element.style.transform = "scaleX(-1)";
          setFeeds((previous) => [
            ...previous.filter((feed) => feed.identity !== userId),
            { key: `local:${userId}`, identity: userId, element },
          ]);
        }
      }
      if (publish.mic) {
        await live.localParticipant.setMicrophoneEnabled(true);
        if (!current()) releaseRoom(live);
      }
    },
    [attachTrack, invalidate, stopIntent, userId],
  );

  // Lấy ticket theo đúng quyền thiết bị đang yêu cầu rồi chỉ phát khi mức đã xác nhận cho phép.
  const run = useCallback(
    async (
      next: { camera: boolean; mic: boolean; level: ShareLevel },
      notice?: string,
    ) => {
      const id = invalidate();
      running.current = true;
      const current = () => epoch.current === id;
      setBusy(true);
      setMediaFailed(false);
      setStatus("");
      try {
        const ticket = await client.token(roomId, next.camera, next.mic, tabId);
        if (!current()) return;
        generation.current = ticket.generation;
        const enabled = next.camera || next.mic;
        const canPublish = enabled && player && next.level !== "NONE";
        const stage = ticket.stage;
        await Promise.all([
          connect(
            id,
            ticket.url,
            ticket.token,
            ticket.roomName,
            {
              camera: next.camera && canPublish,
              mic: next.mic && canPublish,
            },
            true,
          ),
          stage && canPublish && next.level === "ALL"
            ? connect(
                id,
                ticket.url,
                stage.token,
                stage.roomName,
                {
                  camera: next.camera,
                  mic: next.mic,
                },
                false,
              )
            : Promise.resolve(),
        ]);
        if (!current()) return;
        publishReady.current = canPublish;
        setStatus(
          notice ??
            (enabled
              ? canPublish
                ? "Đang chia sẻ hình tiếng."
                : "Đã bật thiết bị nhưng mức chia sẻ là Không chia sẻ."
              : ""),
        );
      } catch (error) {
        if (!current()) return;
        // Lỗi một phần: dừng mọi phòng/track đã mở, không giữ publish dở dang.
        invalidate();
        stopIntent();
        setBusy(false);
        setMediaFailed(true);
        setStatus(mediaErrorMessage(error, next.camera || next.mic));
      } finally {
        if (current()) {
          running.current = false;
          setBusy(false);
        }
      }
    },
    [client, connect, invalidate, player, roomId, stopIntent, tabId],
  );

  recover.current = (id, previous) => {
    const expected = authority.current;
    void client
      .sources(roomId)
      .then((result) => {
        const now = authority.current;
        if (
          epoch.current !== id ||
          !now.connected ||
          !now.visible ||
          now.roomId !== expected.roomId ||
          now.pair !== expected.pair ||
          now.player !== expected.player ||
          now.writable !== expected.writable
        )
          return;
        setDemand(result.available);
        setBusy(false);
        const devices = intent.current;
        if (
          result.generation !== previous &&
          (devices.camera || devices.mic
            ? now.player && now.writable && levelRef.current !== "NONE"
            : result.available)
        ) {
          void run({ ...devices, level: levelRef.current });
        } else if (
          result.generation !== previous &&
          !devices.camera &&
          !devices.mic
        ) {
          stopIntent();
        } else {
          stopIntent();
          setMediaFailed(true);
          setStatus("Camera/mic tạm thời không dùng được");
        }
      })
      .catch(() => {
        if (epoch.current !== id) return;
        setBusy(false);
        stopIntent();
        setMediaFailed(true);
        setStatus("Camera/mic tạm thời không dùng được");
      });
  };

  // Vòng đời: join receive-only khi mount/kết nối lại; cleanup vô hiệu tác vụ đang chờ.
  useEffect(() => {
    if (!connected) {
      setDemand(false);
      invalidate();
      stopIntent();
      setBusy(false);
      setStatus("Chưa kết nối phòng, camera và mic tạm tắt.");
      return undefined;
    }
    // Đổi phòng/vai trò/client: thiết bị của phòng cũ không còn hợp lệ, tắt trước khi join lại.
    stopIntent();
    setDemand(false);
    return () => {
      stopIntent();
      invalidate();
    };
  }, [connected, invalidate, run, setDemand, stopIntent]);

  useEffect(() => {
    const stopWhenHidden = () => {
      if (document.visibilityState !== "hidden") {
        setVisibilityVersion((version) => version + 1);
        return;
      }
      invalidate();
      stopIntent();
      setBusy(false);
      setStatus("Camera và mic đã tắt khi trang ở chế độ nền.");
    };
    document.addEventListener("visibilitychange", stopWhenHidden);
    return () =>
      document.removeEventListener("visibilitychange", stopWhenHidden);
  }, [invalidate, stopIntent]);

  const previousPair = useRef(pair);
  useEffect(() => {
    if (previousPair.current === pair) return;
    previousPair.current = pair;
    setDemand(false);
    invalidate();
    stopIntent();
    setBusy(false);
  }, [pair, invalidate, setDemand, stopIntent]);

  // Tab mất quyền điều khiển (tab khác chiếm): dừng camera/mic local, chỉ giữ nhận hình.
  useEffect(() => {
    if (writable || !connected) return;
    setDemand(false);
    stopIntent();
    setBusy(false);
    invalidate();
  }, [writable, connected, invalidate, setDemand, stopIntent]);
  useEffect(() => {
    if (!connected) return;
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const poll = async () => {
      const id = epoch.current;
      const before = generation.current;
      try {
        const result = await client.sources(roomId);
        if (active && epoch.current === id) {
          setDemand(result.available);
          if (
            before &&
            generation.current === before &&
            result.generation !== before
          ) {
            const devices = intent.current;
            if (
              (devices.camera || devices.mic) &&
              authority.current.player &&
              authority.current.writable &&
              authority.current.visible &&
              levelRef.current !== "NONE"
            )
              void run({ ...devices, level: levelRef.current });
            else if (result.available && authority.current.visible)
              void run({ camera: false, mic: false, level: levelRef.current });
            else {
              invalidate();
              setBusy(false);
            }
          }
        }
      } catch {
        if (active && epoch.current === id) {
          invalidate();
          stopIntent();
          setBusy(false);
          setDemand(false);
          setMediaFailed(true);
          setStatus("Camera/mic tạm thời không dùng được");
        }
      }
      if (active) timer = setTimeout(() => void poll(), 1000);
    };
    void poll();
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [
    client,
    roomId,
    connected,
    pair,
    writable,
    invalidate,
    run,
    setDemand,
    stopIntent,
  ]);

  useEffect(() => {
    if (
      !connected ||
      document.visibilityState === "hidden" ||
      busy ||
      running.current ||
      mediaFailed ||
      camera ||
      mic ||
      devicePending.current.camera ||
      devicePending.current.mic
    )
      return;
    if (incoming && incomingRef.current && rooms.current.length === 0) {
      void run({ camera: false, mic: false, level: levelRef.current });
    } else if (!incoming && rooms.current.length) {
      invalidate();
    }
  }, [
    incoming,
    visibilityVersion,
    camera,
    mic,
    connected,
    pair,
    writable,
    level,
    busy,
    pendingDevices,
    mediaFailed,
    run,
    invalidate,
  ]);

  async function toggle(kind: "camera" | "mic") {
    if (document.visibilityState === "hidden") {
      setStatus("Hãy mở lại trang trước khi bật camera hoặc mic.");
      return;
    }
    if (level === "NONE") {
      setStatus("Hãy chọn mức chia sẻ trước khi bật camera hoặc mic.");
      return;
    }
    if (busy || devicePending.current[kind]) return;
    // Tab chỉ xem: không bật thiết bị trực tiếp, hỏi xác nhận chuyển thiết bị sang tab này.
    if (!writable) {
      setSwitching(true);
      return;
    }
    if (!connected) {
      setStatus("Chưa kết nối phòng, camera và mic tạm tắt.");
      return;
    }
    const next = {
      camera: kind === "camera" ? !camera : camera,
      mic: kind === "mic" ? !mic : mic,
      level,
    };
    intent.current = { camera: next.camera, mic: next.mic };
    if (kind === "camera") setCamera(next.camera);
    else setMic(next.mic);
    if (!publishReady.current) {
      await run(next);
      return;
    }
    const id = epoch.current;
    const liveRooms = rooms.current;
    devicePending.current = { ...devicePending.current, [kind]: true };
    setPendingDevices(devicePending.current);
    setStatus("");
    const update = async (live: Room, enabled: boolean) => {
      const publication =
        kind === "camera"
          ? await live.localParticipant.setCameraEnabled(enabled)
          : await live.localParticipant.setMicrophoneEnabled(enabled);
      if (epoch.current !== id) {
        releaseRoom(live);
        return;
      }
      if (kind !== "camera" || live !== liveRooms[0]) return;
      if (enabled && publication?.track) {
        const element = publication.track.attach();
        element.muted = true;
        element.setAttribute("playsinline", "true");
        element.setAttribute("aria-label", "Camera của bạn");
        element.style.transform = "scaleX(-1)";
        setFeeds((previous) => [
          ...previous.filter((feed) => feed.key !== `local:${userId}`),
          { key: `local:${userId}`, identity: userId, element },
        ]);
      } else {
        setFeeds((previous) =>
          previous.filter((feed) => feed.key !== `local:${userId}`),
        );
      }
    };
    try {
      const results = await Promise.allSettled(
        liveRooms.map((live) => update(live, next[kind])),
      );
      if (epoch.current !== id) return;
      const failure = results.find((result) => result.status === "rejected");
      if (failure?.status === "rejected") throw failure.reason;
      setStatus(
        `${kind === "camera" ? "Camera" : "Mic"} đã ${next[kind] ? "bật" : "tắt"}.`,
      );
    } catch (error) {
      if (epoch.current !== id) return;
      await Promise.allSettled(liveRooms.map((live) => update(live, false)));
      if (epoch.current !== id) return;
      const trackKind = kind === "camera" ? Track.Kind.Video : Track.Kind.Audio;
      for (const live of liveRooms)
        for (const publication of live.localParticipant.getTrackPublications())
          if (publication.track?.kind === trackKind) publication.track.stop();
      intent.current = { ...intent.current, [kind]: false };
      if (kind === "camera") {
        setCamera(false);
        setFeeds((previous) =>
          previous.filter((feed) => feed.key !== `local:${userId}`),
        );
      } else setMic(false);
      setStatus(mediaErrorMessage(error, true));
    } finally {
      if (epoch.current === id) {
        devicePending.current = { ...devicePending.current, [kind]: false };
        setPendingDevices(devicePending.current);
      }
    }
  }

  // Hủy hoặc Esc: đóng hộp thoại, không gọi máy chủ.
  function cancelSwitch() {
    if (!switchPending) setSwitching(false);
  }

  // Chỉ xác nhận của người dùng mới chuyển quyền điều khiển; thiết bị tab mới luôn bắt đầu tắt.
  async function confirmSwitch() {
    if (switchPending) return;
    setSwitchPending(true);
    try {
      await onTakeover();
      setSwitching(false);
      setStatus("Đã chuyển thiết bị sang tab này. Camera và mic đang tắt.");
    } catch {
      setSwitching(false);
      setStatus("Chưa thể chuyển thiết bị sang tab này. Vui lòng thử lại.");
    } finally {
      setSwitchPending(false);
    }
  }

  async function share(next: ShareLevel) {
    if (
      !writable ||
      busy ||
      devicePending.current.camera ||
      devicePending.current.mic
    )
      return;
    const devices = { camera, mic };
    invalidate();
    intent.current = { camera: false, mic: false };
    setCamera(false);
    setMic(false);
    const id = epoch.current;
    shareVersion.current += 1;
    setBusy(true);
    let confirmed: ShareLevel;
    try {
      if (!getControl) throw new Error("Room control unavailable");
      const control = await getControl();
      if (epoch.current !== id) return;
      confirmed = (await client.setShare(roomId, next, control)).level;
    } catch {
      if (epoch.current !== id) return;
      const current = invalidate();
      setCamera(false);
      setMic(false);
      setBusy(false);
      setMediaFailed(true);
      setStatus(
        "Chưa thể xác nhận mức chia sẻ; camera và mic đã tắt. Vui lòng thử lại.",
      );
      try {
        const value = await client.getShare(roomId);
        if (epoch.current === current) confirmLevel(value.level);
      } catch {
        // Trạng thái chưa xác định; không tự tiếp tục phát.
      }
      return;
    }
    if (epoch.current !== id) return;
    confirmLevel(confirmed);
    if (confirmed === "NONE") {
      invalidate();
      setCamera(false);
      setMic(false);
      setBusy(false);
      setStatus("Camera và mic đã tắt.");
      return;
    }
    // Mức mới cần ticket mới, kể cả khi cả hai thiết bị đang tắt.
    publishReady.current = false;
    if (connected && (devices.camera || devices.mic)) {
      intent.current = devices;
      setCamera(devices.camera);
      setMic(devices.mic);
      await run({ ...devices, level: confirmed });
    } else setBusy(false);
  }

  const canPublish = role !== "spectator";
  return (
    <section className="xq-media" aria-label="Camera và mic">
      {controlsHost &&
        (camera || mic) &&
        createPortal(
          <div
            className="xq-media-live-controls"
            role="group"
            aria-label="Media đang bật"
          >
            <span role="status">
              {busy || pendingDevices.camera || pendingDevices.mic
                ? "Đang kết nối camera/mic…"
                : `Đang phát ${camera && mic ? "camera và mic" : camera ? "camera" : "mic"}`}
            </span>
            <Button
              variant="secondary"
              onClick={() => {
                invalidate();
                stopIntent();
                setBusy(false);
                setStatus("Camera và mic đã tắt.");
              }}
            >
              Tắt camera và mic
            </Button>
          </div>,
          controlsHost,
        )}
      <h2>Camera và mic</h2>
      <MediaSeats
        key={`${roomId}:${userId}`}
        roomId={roomId}
        seats={seats}
        selfId={userId}
        feeds={feeds}
        onReceiveChange={applyReceiverChoice}
        defaultHidden={kind === "RANKED"}
      />
      {canPublish ? (
        <>
          <div className="xq-media-toggles">
            <Button
              variant={camera ? "primary" : "secondary"}
              aria-pressed={camera}
              aria-label={camera ? "Tắt camera" : "Bật camera"}
              title={camera ? "Tắt camera" : "Bật camera"}
              disabled={busy || pendingDevices.camera}
              disabledReason={!connected ? "Chưa kết nối phòng." : undefined}
              onClick={() => void toggle("camera")}
              className={`xq-media-btn ${camera ? "is-active" : ""}`}
            >
              <CameraIcon off={!camera} />
            </Button>
            <Button
              variant={mic ? "primary" : "secondary"}
              aria-pressed={mic}
              aria-label={mic ? "Tắt mic" : "Bật mic"}
              title={mic ? "Tắt mic" : "Bật mic"}
              disabled={busy || pendingDevices.mic}
              disabledReason={!connected ? "Chưa kết nối phòng." : undefined}
              onClick={() => void toggle("mic")}
              className={`xq-media-btn ${mic ? "is-active" : ""}`}
            >
              <MicIcon off={!mic} />
            </Button>
          </div>
          <label className="xq-media-share">
            Mức chia sẻ
            <select
              value={level}
              disabled={
                busy || !writable || pendingDevices.camera || pendingDevices.mic
              }
              onChange={(event) => void share(event.target.value as ShareLevel)}
            >
              {(kind === "CUSTOM" ? (["NONE", "OPPONENT", "ALL"] as ShareLevel[]) : (["NONE", "OPPONENT"] as ShareLevel[])).map((option) => (
                <option key={option} value={option}>
                  {LABELS[option]}
                </option>
              ))}
            </select>
          </label>
        </>
      ) : (
        <p>Người xem chỉ nhận hình tiếng theo mức chia sẻ của người chơi.</p>
      )}
      {canPublish && !writable && (
        <Notice message="Tab này chỉ có thể xem. Camera và mic đang tắt; bật lại sẽ hỏi chuyển thiết bị sang tab này." />
      )}
      {status && <Notice message={status} />}
      {mediaFailed && (
        <Button
          variant="secondary"
          loading={busy}
          disabledReason={!connected ? "Chưa kết nối phòng." : undefined}
          onClick={() => {
            stopIntent();
            if (incoming && document.visibilityState !== "hidden")
              void run({ camera: false, mic: false, level: levelRef.current });
            else setMediaFailed(false);
          }}
        >
          Thử lại camera/mic
        </Button>
      )}
      <Dialog
        open={switching}
        onClose={cancelSwitch}
        title="Chuyển thiết bị sang tab này?"
        dismissible={!switchPending}
        onConfirm={() => void confirmSwitch()}
        confirmLabel="Chuyển thiết bị sang tab này"
        cancelLabel="Hủy bỏ"
      >
        <div data-modal="MODAL-MEDIA-TAB-SWITCH">
          <p>
            Camera và mic đang dùng ở tab khác sẽ bị tắt. Tab này sẽ nhận quyền
            điều khiển, media mặc định tắt và bật theo quyền của bạn.
          </p>
        </div>
      </Dialog>
    </section>
  );
}
