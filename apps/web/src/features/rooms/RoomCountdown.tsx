import { useEffect, useRef, useState } from "react";

/**
 * Hiển thị đếm ngược 3 giây trước khi bắt đầu trận cờ, đồng bộ theo thời gian server và kích hoạt âm thanh tick.
 */
export function Countdown({
  dueAt,
  serverNow,
  sound,
}: {
  dueAt: string;
  serverNow: string;
  sound: () => void;
}) {
  const [count, setCount] = useState(() =>
    Math.max(
      0,
      Math.min(
        3,
        Math.ceil((Date.parse(dueAt) - Date.parse(serverNow)) / 1000),
      ),
    ),
  );
  const sounded = useRef<number | null>(null);
  const play = useRef(sound);
  play.current = sound;
  useEffect(() => {
    const received = Date.now(),
      remaining = Date.parse(dueAt) - Date.parse(serverNow);
    function update() {
      setCount(
        Math.max(
          0,
          Math.min(3, Math.ceil((remaining - (Date.now() - received)) / 1000)),
        ),
      );
    }
    update();
    const timer = setInterval(update, 100);
    return () => clearInterval(timer);
  }, [dueAt, serverNow]);
  useEffect(() => {
    if (count > 0 && sounded.current !== count) {
      sounded.current = count;
      play.current();
    }
  }, [count]);
  return (
    <div
      className="xq-room-countdown"
      role="status"
      aria-label="Đếm ngược bắt đầu ván"
    >
      {count > 0 ? (
        <>
          <p>Hai bên đã sẵn sàng</p>
          <strong>{count}</strong>
        </>
      ) : (
        <p>Đang chờ máy chủ xác nhận bắt đầu…</p>
      )}
    </div>
  );
}
