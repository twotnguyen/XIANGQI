import { useEffect, useRef, useState } from "react";
import { Button } from "../../shared/ui/primitives.js";
import "./media.css";

export function CameraIcon({ off }: { off?: boolean }) {
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

export function MicIcon({ off }: { off?: boolean }) {
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

export interface MediaFeed {
  key: string;
  identity: string;
  element: HTMLVideoElement | HTMLAudioElement;
}

/**
 * Component hiển thị khung hình camera và phát âm thanh tương ứng với 2 ghế Đỏ và Đen trong phòng cờ.
 */
export function MediaSeats({
  roomId = "",
  seats,
  selfId,
  feeds = [],
  onReceiveChange,
  defaultHidden = false,
}: {
  roomId?: string;
  seats: { red: string | null; black: string | null };
  selfId: string;
  feeds?: MediaFeed[];
  onReceiveChange?: (mutedIdentities: readonly string[]) => void;
  defaultHidden?: boolean;
}) {
  const storageKey = `xiangqi-media-receive:${roomId}:${selfId}`;
  const cameraKey = `${storageKey}:opponent-camera-hidden`;
  const [opponentCameraHidden, setOpponentCameraHidden] = useState(() => {
    try {
      return sessionStorage.getItem(cameraKey) === "true";
    } catch {
      return false;
    }
  });
  const micKey = `${storageKey}:opponent-mic-muted`;
  const [opponentMicMuted, setOpponentMicMuted] = useState(() => {
    try {
      return sessionStorage.getItem(micKey) === "true";
    } catch {
      return false;
    }
  });
  const [muted, setMuted] = useState<string[]>(() => {
    if (defaultHidden) return [seats.red, seats.black].filter((identity): identity is string => identity !== null && identity !== selfId);
    try {
      const value: unknown = JSON.parse(sessionStorage.getItem(storageKey) ?? "[]");
      return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
    } catch {
      return [];
    }
  });
  const viewerStored = (kind: string) => {
    try {
      const value = sessionStorage.getItem(`${storageKey}:viewer-${kind}`);
      const parsed: unknown = value === null ? muted : JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === "string") : [];
    } catch {
      return muted;
    }
  };
  const [viewerCameraHidden, setViewerCameraHidden] = useState<string[]>(() => viewerStored("camera"));
  const [viewerMicMuted, setViewerMicMuted] = useState<string[]>(() => viewerStored("mic"));
  useEffect(() => {
    try {
      sessionStorage.setItem(`${storageKey}:viewer-camera`, JSON.stringify(viewerCameraHidden));
      sessionStorage.setItem(`${storageKey}:viewer-mic`, JSON.stringify(viewerMicMuted));
    } catch { /* Storage may be unavailable. */ }
  }, [storageKey, viewerCameraHidden, viewerMicMuted]);
  const isPlayer = seats.red === selfId || seats.black === selfId;
  useEffect(() => {
    if (defaultHidden) return;
    const next = isPlayer
      ? (opponentCameraHidden && opponentMicMuted
          ? [seats.red, seats.black].filter((id): id is string => id !== null && id !== selfId)
          : [])
      : viewerCameraHidden.filter((id) => viewerMicMuted.includes(id) && (id === seats.red || id === seats.black));
    setMuted((previous) =>
      previous.length === next.length && previous.every((id) => next.includes(id)) ? previous : next,
    );
  }, [defaultHidden, isPlayer, opponentCameraHidden, opponentMicMuted, seats.red, seats.black, selfId, viewerCameraHidden, viewerMicMuted]);
  useEffect(() => {
    onReceiveChange?.(muted);
  }, [muted, onReceiveChange]);
  useEffect(() => {
    setMuted((previous) => {
      const next = previous.filter((identity) => identity === seats.red || identity === seats.black);
      try { sessionStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* Storage may be unavailable. */ }
      return next;
    });
  }, [seats.red, seats.black, storageKey]);
  function toggleReceive(identity: string) {
    setMuted((previous) => {
      const next = previous.includes(identity) ? previous.filter((item) => item !== identity) : [...previous, identity];
      try { sessionStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* Storage may be unavailable. */ }
      return next;
    });
  }
  const sides =
    seats.red === selfId
      ? (["black", "red"] as const)
      : (["red", "black"] as const);
  return (
    <div className="xq-media-feeds" aria-label="Camera hai người chơi">
      {sides.map((side) => {
        const occupant = seats[side];
        const opponent = occupant !== null && occupant !== selfId;
        const hidden = occupant !== null && muted.includes(occupant);
        const hideCamera = isPlayer
          ? occupant !== selfId && opponentCameraHidden
          : occupant !== null && viewerCameraHidden.includes(occupant);
        const label = `Phe ${side === "red" ? "Đỏ" : "Đen"}${occupant === selfId ? " (Bạn)" : ""}`;
        const video = occupant
          ? feeds.find(
              (feed) =>
                feed.identity === occupant && feed.element.tagName === "VIDEO",
            )
          : undefined;
        return (
          <figure key={side} aria-label={`Camera ${label}`}>
            <figcaption>{label}</figcaption>
            <div className="xq-media-feed">
              {video && !hidden && !hideCamera ? (
                <MediaHost element={video.element} />
              ) : (
                <div className="xq-media-placeholder">
                  <svg
                    viewBox="0 0 32 32"
                    width="32"
                    height="32"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <circle cx="16" cy="10" r="6" />
                    <path d="M5 29v-3a11 11 0 0 1 22 0v3Z" />
                  </svg>
                  <span>
                    {occupant && hidden
                      ? "Bạn đã tắt nhận hình/tiếng"
                      : hideCamera && occupant
                        ? "Bạn đã ẩn camera đối thủ"
                        : occupant
                        ? "Chưa có hình camera"
                        : "Đang chờ người chơi"}
                  </span>
                </div>
              )}
            </div>
            {isPlayer && occupant !== selfId && (
              <div className="xq-media-receive-controls">
                <Button
                  variant="secondary"
                  aria-label={opponentCameraHidden ? "Hiện camera đối thủ" : "Ẩn camera đối thủ"}
                  aria-pressed={!opponentCameraHidden}
                  title={opponentCameraHidden ? "Hiện camera đối thủ" : "Ẩn camera đối thủ"}
                  onClick={() => {
                    const next = !opponentCameraHidden;
                    setOpponentCameraHidden(next);
                    try { sessionStorage.setItem(cameraKey, String(next)); } catch { /* Storage may be unavailable. */ }
                  }}
                >
                  <CameraIcon off={opponentCameraHidden} />
                </Button>
                <Button
                  variant="secondary"
                  aria-label={opponentMicMuted ? "Bật tiếng đối thủ" : "Tắt tiếng đối thủ"}
                  aria-pressed={!opponentMicMuted}
                  title={opponentMicMuted ? "Bật tiếng đối thủ" : "Tắt tiếng đối thủ"}
                  onClick={() => {
                    const next = !opponentMicMuted;
                    setOpponentMicMuted(next);
                    try { sessionStorage.setItem(micKey, String(next)); } catch { /* Storage may be unavailable. */ }
                  }}
                >
                  <MicIcon off={opponentMicMuted} />
                </Button>
              </div>
            )}
            {!isPlayer && (
              <div className="xq-media-receive-controls">
                <Button
                  variant="secondary"
                  disabled={!occupant}
                  aria-label={`${hideCamera ? "Hiện" : "Ẩn"} camera ${label}`}
                  aria-pressed={!hideCamera}
                  onClick={() => {
                    if (occupant) setViewerCameraHidden((previous) =>
                      previous.includes(occupant) ? previous.filter((id) => id !== occupant) : [...previous, occupant]
                    );
                  }}
                >
                  <CameraIcon off={hideCamera} />
                </Button>
                <Button
                  variant="secondary"
                  disabled={!occupant}
                  aria-label={`${occupant && viewerMicMuted.includes(occupant) ? "Bật" : "Tắt"} tiếng ${label}`}
                  aria-pressed={!occupant || !viewerMicMuted.includes(occupant)}
                  onClick={() => {
                    if (occupant) setViewerMicMuted((previous) =>
                      previous.includes(occupant) ? previous.filter((id) => id !== occupant) : [...previous, occupant]
                    );
                  }}
                >
                  <MicIcon off={Boolean(occupant && viewerMicMuted.includes(occupant))} />
                </Button>
              </div>
            )}
            {opponent && occupant && defaultHidden && (
              <Button
                variant="secondary"
                aria-label={defaultHidden ? (hidden ? "Hiện hình/tiếng đối thủ" : "Tắt ngay") : (hidden ? "Hiện hình/tiếng" : "Tắt nhận hình/tiếng")}
                aria-pressed={hidden}
                onClick={() => toggleReceive(occupant)}
              >
                {defaultHidden ? (hidden ? "Hiện hình/tiếng đối thủ" : "Tắt ngay") : (hidden ? "Hiện hình/tiếng" : "Tắt nhận hình/tiếng")}
              </Button>
            )}
          </figure>
        );
      })}
      {feeds
        .filter(
          (feed) =>
            feed.element.tagName === "AUDIO" &&
            (feed.identity === seats.red || feed.identity === seats.black),
        )
        .map((feed) => (
          <MediaHost
            key={feed.key}
            element={feed.element}
            muted={muted.includes(feed.identity) || (isPlayer && feed.identity !== selfId && opponentMicMuted) || (!isPlayer && viewerMicMuted.includes(feed.identity))}
          />
        ))}
    </div>
  );
}

function MediaHost({
  element,
  muted,
}: {
  element: HTMLVideoElement | HTMLAudioElement;
  muted?: boolean;
}) {
  const host = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (muted !== undefined) element.muted = muted;
  }, [element, muted]);
  useEffect(() => {
    const node = host.current;
    if (!node) return;
    node.appendChild(element);
    void element.play().catch(() => undefined);
    return () => {
      element.pause();
      element.remove();
    };
  }, [element]);
  return (
    <div
      ref={host}
      className={
        element.tagName === "AUDIO" ? "xq-media-audio" : "xq-media-video"
      }
    />
  );
}
