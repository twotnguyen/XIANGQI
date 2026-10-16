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
import "./media.css";

interface Feed {
  key: string;
  label: string;
  element: HTMLVideoElement | HTMLAudioElement;
}
const LABELS: Record<ShareLevel, string> = {
  NONE: "Không chia sẻ",
  OPPONENT: "Chỉ đối thủ",
  ALL: "Cả đối thủ và người xem",
};

export function MediaPanel({
  roomId,
  role,
  client,
  connected,
}: {
  roomId: string;
  role: "red" | "black" | "spectator";
  client: MediaClient;
  connected: boolean;
}) {
  const [camera, setCamera] = useState(false);
  const [mic, setMic] = useState(false);
  const [level, setLevel] = useState<ShareLevel>("OPPONENT");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [feeds, setFeeds] = useState<Feed[]>([]);
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
        { key, label: participant.identity, element },
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
      if (publish.camera) await live.localParticipant.setCameraEnabled(true);
      if (publish.mic) await live.localParticipant.setMicrophoneEnabled(true);
      return live;
    },
    [attachTrack],
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
        await connect(ticket.url, ticket.token, ticket.roomName, {
          camera: next.camera && canPublishHere,
          mic: next.mic && canPublishHere,
        });
        if (epoch.current !== requestEpoch) return;
        const stage = ticket.stage;
        if (stage && role !== "spectator")
          await connect(ticket.url, stage.token, stage.roomName, {
            camera: next.camera,
            mic: next.mic,
          });
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
            message = "Bạn chưa cấp quyền truy cập Camera/Mic trên trình duyệt.";
          } else if (
            error.name === "NotFoundError" ||
            error.name === "DevicesNotFoundError"
          ) {
            message = "Không tìm thấy thiết bị Camera hoặc Microphone trên máy.";
          }
        }
        setStatus(message);
      } finally {
        if (epoch.current === requestEpoch) setBusy(false);
      }
    },
    [client, connect, connected, detach, role, roomId],
  );

  async function toggle(kind: "camera" | "mic") {
    if (busy) return;
    const next = {
      camera: kind === "camera" ? !camera : camera,
      mic: kind === "mic" ? !mic : mic,
      level,
    };
    setCamera(next.camera);
    setMic(next.mic);
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
      <h2>Hình tiếng</h2>
      {canPublish ? (
        <>
          <div className="xq-media-toggles">
            <Button
              variant={camera ? "primary" : "secondary"}
              aria-pressed={camera}
              loading={busy}
              onClick={() => void toggle("camera")}
            >
              {camera ? "Tắt camera" : "Bật camera"}
            </Button>
            <Button
              variant={mic ? "primary" : "secondary"}
              aria-pressed={mic}
              loading={busy}
              onClick={() => void toggle("mic")}
            >
              {mic ? "Tắt mic" : "Bật mic"}
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
      <div className="xq-media-feeds" aria-live="polite">
        {feeds.map((feed) => (
          <figure key={feed.key}>
            <figcaption>{feed.label}</figcaption>
            <MediaHost element={feed.element} />
          </figure>
        ))}
        {feeds.length === 0 && <p>Chưa có ai đang chia sẻ hình tiếng.</p>}
      </div>
    </section>
  );
}

function MediaHost({
  element,
}: {
  element: HTMLVideoElement | HTMLAudioElement;
}) {
  const host = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    const node = host.current;
    if (!node) return;
    node.appendChild(element);
    void element.play?.().catch(() => undefined);
    return () => {
      element.remove();
    };
  }, [element]);
  return <div ref={host} className="xq-media-feed" />;
}
