import { useEffect, useState } from "react";
import type { RoomStateSnapshot } from "@xiangqi/shared";
import "./InactivityBanner.css";

export interface InactivityBannerProps {
  match: RoomStateSnapshot["match"];
  role: RoomStateSnapshot["role"];
  serverNow: string;
  busy?: boolean;
  canAct?: boolean;
  onStillHere: () => Promise<void>;
}

/**
 * Banner không modal, chỉ hiện cho bên đang đến lượt khi ván không giới hạn
 * đã im lặng đủ lâu. Không khóa focus và không che bàn cờ hay nút Đầu hàng.
 * Mốc thời gian lấy từ server; đồng hồ máy khách chỉ dùng để đếm lùi hiển thị.
 */
export function InactivityBanner({
  match,
  role,
  serverNow,
  busy = false,
  canAct = true,
  onStillHere,
}: InactivityBannerProps) {
  const inactivity = match?.inactivity ?? null;
  const clockKey =
    match && inactivity && match.status === "ACTIVE" && match.turn === role
      ? `${match.id}/${serverNow}/${inactivity.promptAt}/${inactivity.expiresAt}`
      : null;
  const [sample, setSample] = useState(() => {
    const now = performance.now();
    return { key: clockKey, receivedAt: now, now };
  });

  useEffect(() => {
    const now = performance.now();
    setSample({ key: clockKey, receivedAt: now, now });
    if (!clockKey) return;
    const redraw = () =>
      setSample((previous) => ({ ...previous, now: performance.now() }));
    const id = window.setInterval(redraw, 500);
    document.addEventListener("visibilitychange", redraw);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", redraw);
    };
  }, [clockKey]);

  if (!match || !inactivity || !clockKey) return null;

  // Anchor each authoritative snapshot once, then advance with monotonic elapsed time.
  // Recomputing skew against the ticking time would freeze the warning deadline.
  const elapsed =
    sample.key === clockKey ? Math.max(0, sample.now - sample.receivedAt) : 0;
  const serverTime = Date.parse(serverNow) + elapsed;
  if (serverTime < Date.parse(inactivity.promptAt)) return null;

  const left = Math.ceil(
    Math.max(0, Date.parse(inactivity.expiresAt) - serverTime) / 1000,
  );
  const canConfirm = inactivity.confirmsLeft > 0;

  return (
    <section
      className="inactivity-banner"
      aria-labelledby="inactivity-banner-title"
      role="status"
    >
      <p id="inactivity-banner-title" className="inactivity-banner__text">
        Bạn đã im lặng lâu. Ván sẽ kết thúc sau <strong>{left}s</strong> nếu
        không có nước đi.
      </p>
      {canConfirm ? (
        <button
          type="button"
          className="inactivity-banner__action"
          disabled={busy || !canAct}
          onClick={() => void onStillHere()}
        >
          Tôi còn đây
        </button>
      ) : null}
    </section>
  );
}
