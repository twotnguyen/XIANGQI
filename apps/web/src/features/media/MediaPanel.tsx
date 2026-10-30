import { useCallback, useEffect, useRef, useState } from "react";
import type { RoomControlProof } from "@xiangqi/shared";
import { RemoteParticipant, Room, RoomEvent, Track } from "livekit-client";
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
}) {
  const [switching, setSwitching] = useState(false);
  const [switchPending, setSwitchPending] = useState(false);
  const [camera, setCamera] = useState(false);
  const [mic, setMic] = useState(false);
  // Mức đang áp dụng: chỉ đổi khi máy chủ xác nhận; mặc định khớp máy chủ (OPPONENT).
  const [level, setLevel] = useState<ShareLevel>("OPPONENT");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [pendingDevices, setPendingDevices] = useState({
    camera: false,
    mic: false,
  });
  const devicePending = useRef({ camera: false, mic: false });
  const [feeds, setFeeds] = useState<MediaFeed[]>([]);
  const rooms = useRef<Room[]>([]);
  const publishReady = useRef(false);
  const epoch = useRef(0);
  const levelRef = useRef<ShareLevel>("OPPONENT");
  const shareVersion = useRef(0);
  const elements = useRef(new Map<string, HTMLElement>());

  const confirmLevel = useCallback((next: ShareLevel) => {
    levelRef.current = next;
    setLevel(next);
  }, []);

  // Đổi vòng đời hoặc cấp lại ticket làm tác vụ cũ thành stale và giải phóng phòng cũ.
  const invalidate = useCallback(() => {
    const id = ++epoch.current;
    const live = rooms.current;
    rooms.current = [];
    publishReady.current = false;
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
        if (active && version === shareVersion.current)
          confirmLevel(value.level);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [client, roomId, confirmLevel]);

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
    ) => {
      const current = () => epoch.current === id;
      const live = new Room({ adaptiveStream: true, dynacast: true });
      rooms.current.push(live);
      live.on(RoomEvent.TrackSubscribed, (track, _pub, participant) => {
        if (current()) attachTrack(track, participant, roomName);
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
      await live.connect(url, token);
      if (!current()) {
        releaseRoom(live);
        return;
      }
      // Track có thể được subscribe trước khi Room phát sự kiện ở trạng thái connected.
      for (const participant of live.remoteParticipants.values())
        for (const publication of participant.getTrackPublications())
          if (publication.track)
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
    [attachTrack, userId],
  );

  // Lấy ticket theo đúng quyền thiết bị đang yêu cầu rồi chỉ phát khi mức đã xác nhận cho phép.
  const run = useCallback(
    async (
      next: { camera: boolean; mic: boolean; level: ShareLevel },
      notice?: string,
    ) => {
      const id = invalidate();
      const current = () => epoch.current === id;
      setBusy(true);
      setStatus("");
      try {
        const ticket = await client.token(roomId, next.camera, next.mic, tabId);
        if (!current()) return;
        const enabled = next.camera || next.mic;
        const canPublish =
          enabled && role !== "spectator" && next.level !== "NONE";
        const stage = ticket.stage;
        await Promise.all([
          connect(id, ticket.url, ticket.token, ticket.roomName, {
            camera: next.camera && canPublish,
            mic: next.mic && canPublish,
          }),
          stage && canPublish && next.level === "ALL"
            ? connect(id, ticket.url, stage.token, stage.roomName, {
                camera: next.camera,
                mic: next.mic,
              })
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
        setCamera(false);
        setMic(false);
        setBusy(false);
        setStatus(mediaErrorMessage(error, next.camera || next.mic));
      } finally {
        if (current()) setBusy(false);
      }
    },
    [client, connect, invalidate, role, roomId, tabId],
  );

  // Vòng đời: join receive-only khi mount/kết nối lại; cleanup vô hiệu tác vụ đang chờ.
  useEffect(() => {
    if (!connected) {
      invalidate();
      setCamera(false);
      setMic(false);
      setBusy(false);
      setStatus("Chưa kết nối phòng, camera và mic tạm tắt.");
      return undefined;
    }
    // Đổi phòng/vai trò/client: thiết bị của phòng cũ không còn hợp lệ, tắt trước khi join lại.
    setCamera(false);
    setMic(false);
    void run({ camera: false, mic: false, level: levelRef.current });
    return () => {
      invalidate();
    };
  }, [connected, invalidate, run]);

  // Tab mất quyền điều khiển (tab khác chiếm): dừng camera/mic local, chỉ giữ nhận hình.
  useEffect(() => {
    if (writable || !connected) return;
    setCamera(false);
    setMic(false);
    void run({ camera: false, mic: false, level: levelRef.current });
  }, [writable, connected, run]);

  async function toggle(kind: "camera" | "mic") {
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
      // Không xác nhận được: tắt phát, giữ mức đã xác nhận và chỉ join receive-only (không stage).
      setCamera(false);
      setMic(false);
      const message = `Chưa thể đổi mức chia sẻ. Vẫn giữ "${LABELS[levelRef.current]}"; camera và mic đã tắt để không phát ngoài ý muốn.`;
      if (connected && (camera || mic))
        await run(
          { camera: false, mic: false, level: levelRef.current },
          message,
        );
      else {
        setStatus(message);
        setBusy(false);
      }
      return;
    }
    if (epoch.current !== id) return;
    confirmLevel(confirmed);
    // Mức mới cần ticket mới, kể cả khi cả hai thiết bị đang tắt.
    publishReady.current = false;
    if (connected && (camera || mic))
      await run({ camera, mic, level: confirmed });
    else setBusy(false);
  }

  const canPublish = role !== "spectator";
  return (
    <section className="xq-media" aria-label="Camera và mic">
      <h2>Camera và mic</h2>
      <MediaSeats seats={seats} selfId={userId} feeds={feeds} />
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
              {(["NONE", "OPPONENT", "ALL"] as ShareLevel[]).map((option) => (
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
