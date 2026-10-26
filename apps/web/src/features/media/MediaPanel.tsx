import { useCallback, useEffect, useRef, useState } from "react";
import {
  RemoteTrack,
  RemoteParticipant,
  Room,
  RoomEvent,
  Track,
} from "livekit-client";
import { Button, Notice } from "../../shared/ui/primitives.js";
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

export function MediaPanel({
  roomId,
  role,
  client,
  connected,
  seats,
  userId,
}: {
  roomId: string;
  role: "red" | "black" | "spectator";
  client: MediaClient;
  connected: boolean;
  seats: { red: string | null; black: string | null };
  userId: string;
}) {
  const [camera, setCamera] = useState(false);
  const [mic, setMic] = useState(false);
  const [level, setLevel] = useState<ShareLevel>("OPPONENT");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [feeds, setFeeds] = useState<MediaFeed[]>([]);
  const rooms = useRef<Room[]>([]);
  const epoch = useRef(0);

  const detach = useCallback(() => {
    const live = rooms.current;
    rooms.current = [];
    setFeeds([]);
    for (const room of live) {
      room.removeAllListeners();
      void room.disconnect();
    }
  }, []);

  useEffect(() => {
    void client
      .getShare(roomId)
      .then((value) => setLevel(value.level))
      .catch(() => undefined);
  }, [client, roomId]);

  useEffect(() => () => detach(), [detach]);

  useEffect(() => {
    if (!connected) {
      detach();
      setCamera(false);
      setMic(false);
      setStatus("Chưa kết nối phòng, camera và mic tạm tắt.");
    } else {
      setStatus((previous) =>
        previous === "Chưa kết nối phòng, camera và mic tạm tắt."
          ? ""
          : previous,
      );
    }
  }, [connected, detach]);

  const elements = useRef(new Map<string, HTMLElement>());
  const attachTrack = useCallback(
    (track: RemoteTrack, participant: RemoteParticipant, roomName: string) => {
      if (track.kind !== Track.Kind.Video && track.kind !== Track.Kind.Audio)
        return;
      const element = track.attach();
      element.setAttribute(
        "aria-label",
        `${track.kind === Track.Kind.Video ? "Hình" : "Tiếng"} của ${participant.identity}`,
      );
      element.setAttribute("playsinline", "true");
      const sid = track.sid ?? `${participant.identity}-${track.kind}`;
      const key = `${roomName}:${participant.identity}:${sid}`;
      elements.current.set(sid, element);
      setFeeds((previous) => [
        ...previous,
        { key, identity: participant.identity, element },
      ]);
    },
    [],
  );

  const connect = useCallback(
    async (
      url: string,
      token: string,
      roomName: string,
      publish: { camera: boolean; mic: boolean },
    ) => {
      const live = new Room({ adaptiveStream: true, dynacast: true });
      rooms.current.push(live);
      live.on(RoomEvent.TrackSubscribed, (track, _pub, participant) =>
        attachTrack(track, participant, roomName),
      );
      live.on(RoomEvent.TrackUnsubscribed, (track) => {
        const sid = track.sid ?? `${roomName}-unnamed`;
        const element =
          elements.current.get(sid) ?? elements.current.get(track.sid ?? "");
        elements.current.delete(sid);
        if (element) element.remove();
        setFeeds((previous) =>
          previous.filter((feed) => feed.element !== element),
        );
      });
      await live.connect(url, token);
      if (publish.camera) {
        const publication = await live.localParticipant.setCameraEnabled(true);
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
      if (publish.mic) await live.localParticipant.setMicrophoneEnabled(true);
      return live;
    },
    [attachTrack, userId],
  );

  const sync = useCallback(
    async (next: { camera: boolean; mic: boolean; level: ShareLevel }) => {
      const requestEpoch = ++epoch.current;
      detach();
      if (!connected) {
        setStatus("Chưa kết nối phòng, camera và mic tạm tắt.");
        return;
      }
      const enabled = next.camera || next.mic;
      setBusy(true);
      setStatus("");
      try {
        const ticket = await client.token(roomId, next.camera, next.mic);
        if (epoch.current !== requestEpoch) return;
        const canPublishHere = role !== "spectator" && next.level !== "NONE";
        const stage = ticket.stage;
        const connectPrivate = connect(
          ticket.url,
          ticket.token,
          ticket.roomName,
          {
            camera: next.camera && canPublishHere,
            mic: next.mic && canPublishHere,
          },
        );
        const connectStage =
          stage && role !== "spectator"
            ? connect(ticket.url, stage.token, stage.roomName, {
                camera: next.camera,
                mic: next.mic,
              })
            : Promise.resolve();
        await Promise.all([connectPrivate, connectStage]);
        if (epoch.current !== requestEpoch) return;
        setStatus(
          enabled
            ? canPublishHere
              ? "Đang chia sẻ hình tiếng."
              : "Đã bật thiết bị nhưng mức chia sẻ là Không chia sẻ."
            : "Camera và mic đang tắt.",
        );
      } catch (error) {
        if (epoch.current !== requestEpoch) return;
        if (next.camera && !camera) setCamera(false);
        if (next.mic && !mic) setMic(false);

        let message = "Chưa thể kết nối hình tiếng. Vui lòng thử lại.";
        if (
          typeof window !== "undefined" &&
          !window.isSecureContext &&
          window.location.hostname !== "localhost" &&
          window.location.hostname !== "127.0.0.1"
        ) {
          message =
            "Trình duyệt chỉ cho phép Camera/Mic qua HTTPS hoặc localhost. Để dùng qua IP mạng khác, cần truy cập qua HTTPS.";
        } else if (error instanceof MediaRequestError) {
          message = "Chưa thể bật camera hoặc mic. Kiểm tra quyền trình duyệt.";
        } else if (error instanceof Error) {
          if (
            error.name === "NotAllowedError" ||
            error.name === "PermissionDeniedError"
          ) {
            message =
              "Bạn chưa cấp quyền truy cập Camera/Mic trên trình duyệt.";
          } else if (
            error.name === "NotFoundError" ||
            error.name === "DevicesNotFoundError"
          ) {
            message =
              "Không tìm thấy thiết bị Camera hoặc Microphone trên máy.";
          }
        }
        setStatus(message);
      } finally {
        if (epoch.current === requestEpoch) setBusy(false);
      }
    },
    [camera, client, connect, connected, detach, mic, role, roomId],
  );

  async function toggle(kind: "camera" | "mic") {
    if (busy) return;
    if (!connected) {
      setStatus("Chưa kết nối phòng, camera và mic tạm tắt.");
      return;
    }
    const nextCamera = kind === "camera" ? !camera : camera;
    const nextMic = kind === "mic" ? !mic : mic;
    const next = {
      camera: nextCamera,
      mic: nextMic,
      level,
    };
    setCamera(nextCamera);
    setMic(nextMic);
    await sync(next);
  }

  async function share(next: ShareLevel) {
    if (busy) return;
    setLevel(next);
    try {
      await client.setShare(roomId, next);
    } catch {
      setStatus("Chưa thể đổi mức chia sẻ.");
    }
    await sync({ camera, mic, level: next });
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
              loading={busy}
              disabledReason={!connected ? "Chưa kết nối phòng." : undefined}
              onClick={() => void toggle("camera")}
              className={`xq-media-btn ${camera ? "is-active" : ""}`}
            >
              <CameraIcon off={!camera} />
              <span>{camera ? "Tắt camera" : "Bật camera"}</span>
            </Button>
            <Button
              variant={mic ? "primary" : "secondary"}
              aria-pressed={mic}
              loading={busy}
              disabledReason={!connected ? "Chưa kết nối phòng." : undefined}
              onClick={() => void toggle("mic")}
              className={`xq-media-btn ${mic ? "is-active" : ""}`}
            >
              <MicIcon off={!mic} />
              <span>{mic ? "Tắt mic" : "Bật mic"}</span>
            </Button>
          </div>
          <label className="xq-media-share">
            Mức chia sẻ
            <select
              value={level}
              disabled={busy}
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
      {status && <Notice message={status} />}
      <p className="xq-media-privacy">
        Chỉ trực tiếp — không ghi âm, không ghi hình.
      </p>
    </section>
  );
}
