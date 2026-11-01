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
  roomId = "",
  seats,
  selfId,
  feeds = [],
  onReceiveChange,
}: {
  roomId?: string;
  seats: { red: string | null; black: string | null };
  selfId: string;
  feeds?: MediaFeed[];
  onReceiveChange?: (mutedIdentities: readonly string[]) => void;
}) {
  const storageKey = `xiangqi-media-receive:${roomId}:${selfId}`;
  const [muted, setMuted] = useState<string[]>(() => {
    try {
      const value: unknown = JSON.parse(sessionStorage.getItem(storageKey) ?? "[]");
      return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
    } catch {
      return [];
    }
  });
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
              {video && !hidden ? (
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
                      : occupant
                        ? "Chưa có hình camera"
                        : "Đang chờ người chơi"}
                  </span>
                </div>
              )}
            </div>
            {opponent && occupant && (
              <Button
                variant="secondary"
                aria-label={hidden ? "Hiện hình/tiếng" : "Tắt nhận hình/tiếng"}
                aria-pressed={hidden}
                onClick={() => toggleReceive(occupant)}
              >
                {hidden ? "Hiện hình/tiếng" : "Tắt nhận hình/tiếng"}
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
            muted={muted.includes(feed.identity)}
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
