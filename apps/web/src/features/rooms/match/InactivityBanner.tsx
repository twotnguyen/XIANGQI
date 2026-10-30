import { useEffect, useState } from "react";
import type { RoomStateSnapshot } from "@xiangqi/shared";
import "./InactivityBanner.css";

export interface InactivityBannerProps {
  match: RoomStateSnapshot["match"];
  role: RoomStateSnapshot["role"];
  serverNow: string;
  busy?: boolean;
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
  onStillHere,
}: InactivityBannerProps) {
  const inactivity = match?.inactivity ?? null;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (!inactivity) return;
    const id = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(id);
  }, [inactivity]);

  if (!match || !inactivity) return null;
  if (role === "spectator" || match.status !== "ACTIVE") return null;
  if (match.turn !== role) return null;

  // Lệch đồng hồ máy khách so với server, để đếm lùi đúng theo server.
  const skew = Date.parse(serverNow) - now;
  const promptAt = Date.parse(inactivity.promptAt) - skew;
  if (now < promptAt) return null;

  const expiresAt = Date.parse(inactivity.expiresAt) - skew;
  const left = Math.ceil(Math.max(0, expiresAt - now) / 1000);
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
          disabled={busy}
          onClick={() => void onStillHere()}
        >
          Tôi còn đây
        </button>
      ) : null}
    </section>
  );
}
