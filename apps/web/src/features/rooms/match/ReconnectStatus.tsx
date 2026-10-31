import { useEffect, useId, useRef, useState } from "react";
import type { RoomStateSnapshot } from "@xiangqi/shared";
import { Button } from "../../../shared/ui/primitives.js";
import "../../../shared/styles/tokens.css";
import "./ReconnectStatus.css";

export interface ReconnectStatusProps {
  connected: boolean;
  waitingForSnapshot: boolean;
  ownRole: RoomStateSnapshot["role"];
  matchStatus: NonNullable<RoomStateSnapshot["match"]>["status"] | null;
  opponentGraceUntil: string | null;
  serverNow: string;
  onReconnect?: () => void;
}
function formatTime(milliseconds: number) {
  const seconds = Math.ceil(Math.max(0, milliseconds) / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

/**
 * Component hiển thị thông báo và đếm ngược thời gian ân hạn (grace period) khi mất kết nối:
 * - Khi chính người chơi mất kết nối: hiển thị modal chặn thao tác và đếm ngược ước tính thời gian kết nối lại.
 * - Khi đối thủ mất kết nối: hiển thị panel đếm ngược thời gian chờ đối thủ quay lại trước khi bị xử thua.
 * - Khi là khán giả: hiển thị thông báo trạng thái kết nối nhẹ nhàng.
 */
export function ReconnectStatus({
  connected,
  waitingForSnapshot,
  ownRole,
  matchStatus,
  opponentGraceUntil,
  serverNow,
  onReconnect,
}: ReconnectStatusProps) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const unsynced = !connected || waitingForSnapshot;
  const active = matchStatus === "ACTIVE";
  const ownBlocked = active && ownRole !== "spectator" && unsynced;
  const serverRemaining = opponentGraceUntil
    ? Date.parse(opponentGraceUntil) - Date.parse(serverNow)
    : null;
  const opponentWaiting =
    active &&
    !unsynced &&
    serverRemaining !== null &&
    Number.isFinite(serverRemaining);
  // Own countdown is informational: an offline tab has no server deadline.
  // Its key stays stable across a bare reconnect or identical props.
  const key = ownBlocked
    ? "own-estimate"
    : opponentWaiting
      ? `${opponentGraceUntil}/${serverNow}`
      : null;
  const [sample, setSample] = useState(() => {
    const now = performance.now();
    return { key, receivedAt: now, now };
  });
  useEffect(() => {
    const now = performance.now();
    setSample({ key, receivedAt: now, now });
    if (!key) return;
    const redraw = () =>
      setSample((prior) => ({ ...prior, now: performance.now() }));
    const timer = window.setInterval(redraw, 200);
    document.addEventListener("visibilitychange", redraw);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", redraw);
    };
  }, [key]);
  useEffect(() => {
    const element = dialog.current;
    if (!ownBlocked || !element) return;
    const priorFocus = document.activeElement as HTMLElement | null;
    element.showModal();
    element.focus();
    return () => {
      element.close();
      if (priorFocus?.isConnected) priorFocus.focus();
    };
  }, [ownBlocked]);
  const elapsed =
    sample.key === key ? Math.max(0, sample.now - sample.receivedAt) : 0;
  const remaining = Math.max(
    0,
    (ownBlocked ? 60000 : (serverRemaining ?? 0)) - elapsed,
  );
  const countdown = (
    <>
      <span
        role="timer"
        aria-live="off"
        aria-label="Thời gian chờ nối lại"
        className="reconnect-status__time"
      >
        {formatTime(remaining)}
      </span>
      {remaining === 0 && (
        <p role="status">Đang chờ máy chủ xác nhận trạng thái ván.</p>
      )}
    </>
  );
  if (ownBlocked)
    return (
      <dialog
        ref={dialog}
        className="xq-ui reconnect-status reconnect-status--blocking"
        tabIndex={-1}
        aria-labelledby={`${id}-title`}
        aria-describedby={`${id}-description`}
        onCancel={(event) => event.preventDefault()}
        onKeyDown={(event) => {
          if (event.key === "Escape") event.preventDefault();
          if (event.key === "Tab" && !onReconnect) {
            event.preventDefault();
            event.currentTarget.focus();
          }
        }}
      >
        <h2 id={`${id}-title`}>Đang kết nối lại…</h2>
        <p id={`${id}-description`}>
          {connected
            ? "Đã kết nối. Đang đồng bộ trạng thái máy chủ…"
            : "Kết nối đang gián đoạn. Đồng hồ ván vẫn tiếp tục chạy."}
        </p>
        <p>Thời gian chờ ước tính</p>
        {countdown}
        <p>Hạn giữ ván thực tế sẽ được xác nhận từ máy chủ khi nối lại.</p>
        {onReconnect && (
          <Button variant="secondary" onClick={onReconnect}>
            Nối lại
          </Button>
        )}
      </dialog>
    );
  if (unsynced)
    return (
      <section
        className="xq-ui reconnect-status"
        aria-label="Trạng thái kết nối"
        role="status"
      >
        {connected
          ? "Đã kết nối. Đang đồng bộ trạng thái máy chủ…"
          : ownRole === "spectator"
            ? "Đang nối lại kết nối xem phòng."
            : "Đang nối lại phòng. Trạng thái sẽ được đồng bộ từ máy chủ."}
      </section>
    );
  if (!opponentWaiting) return null;
  return (
    <section className="xq-ui reconnect-status" aria-label="Trạng thái nối lại">
      <p>
        {ownRole === "spectator"
          ? "Người chơi đang mất kết nối. Thời gian chờ:"
          : "Đối thủ đang mất kết nối. Thời gian chờ:"}
      </p>
      {countdown}
    </section>
  );
}
