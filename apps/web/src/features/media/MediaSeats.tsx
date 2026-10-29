import { useEffect, useRef, useState } from "react";
import { Button } from "../../shared/ui/primitives.js";
import "./media.css";

export interface MediaFeed {
  key: string;
  identity: string;
  element: HTMLVideoElement | HTMLAudioElement;
}

/**
 * Component hiển thị khung hình camera và phát âm thanh tương ứng với 2 ghế Đỏ và Đen trong phòng cờ.
 */
export function MediaSeats({
  seats,
  selfId,
  feeds = [],
}: {
  seats: { red: string | null; black: string | null };
  selfId: string;
  feeds?: MediaFeed[];
}) {
  const [hideOpponent, setHideOpponent] = useState(false);
  const [muteOpponent, setMuteOpponent] = useState(false);
  const isPlayer = seats.red === selfId || seats.black === selfId;
  const sides =
    seats.red === selfId
      ? (["black", "red"] as const)
      : (["red", "black"] as const);
  return (
    <div className="xq-media-feeds" aria-label="Camera hai người chơi">
      {sides.map((side) => {
        const occupant = seats[side];
        const opponent = isPlayer && occupant !== selfId;
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
              {video && !(opponent && hideOpponent) ? (
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
                    {occupant && opponent && hideOpponent
                      ? "Bạn đã ẩn camera đối thủ"
                      : occupant
                        ? "Chưa có hình camera"
                        : "Đang chờ người chơi"}
                  </span>
                </div>
              )}
            </div>
            {opponent && (
              <div
                className="xq-media-receive-controls"
                aria-label="Hình tiếng đối thủ"
              >
                <Button
                  variant="secondary"
                  aria-label={
                    hideOpponent ? "Hiện camera đối thủ" : "Ẩn camera đối thủ"
                  }
                  title={
                    hideOpponent ? "Hiện camera đối thủ" : "Ẩn camera đối thủ"
                  }
                  aria-pressed={hideOpponent}
                  onClick={() => setHideOpponent((hidden) => !hidden)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <rect x="2" y="5" width="14" height="14" rx="2" />
                    <path d="m16 10 6-4v12l-6-4" />
                    {hideOpponent && <path d="m2 2 20 20" />}
                  </svg>
                </Button>
                <Button
                  variant="secondary"
                  aria-label={
                    muteOpponent ? "Bật tiếng đối thủ" : "Tắt tiếng đối thủ"
                  }
                  title={
                    muteOpponent ? "Bật tiếng đối thủ" : "Tắt tiếng đối thủ"
                  }
                  aria-pressed={muteOpponent}
                  onClick={() => setMuteOpponent((muted) => !muted)}
                >
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    aria-hidden="true"
                  >
                    <path d="m11 4-6 5H2v6h3l6 5V4Z" />
                    {muteOpponent ? (
                      <path d="m16 9 6 6m0-6-6 6" />
                    ) : (
                      <path d="M15 8a6 6 0 0 1 0 8m3-12a11 11 0 0 1 0 16" />
                    )}
                  </svg>
                </Button>
              </div>
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
            muted={isPlayer && feed.identity !== selfId && muteOpponent}
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
