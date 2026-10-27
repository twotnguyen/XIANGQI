import { useEffect, useRef } from "react";
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
  return (
    <div className="xq-media-feeds" aria-label="Camera hai người chơi">
      {(["red", "black"] as const).map((side) => {
        const occupant = seats[side];
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
              {video ? (
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
                    {occupant ? "Chưa có hình camera" : "Đang chờ người chơi"}
                  </span>
                </div>
              )}
            </div>
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
          <MediaHost key={feed.key} element={feed.element} />
        ))}
    </div>
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
    void element.play().catch(() => undefined);
    return () => element.remove();
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
