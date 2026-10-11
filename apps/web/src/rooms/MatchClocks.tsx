import { useEffect, useState } from "react";
import type { RoomStateSnapshot } from "@xiangqi/shared";
import "./MatchClocks.css";

export interface MatchClocksProps {
  clocks: RoomStateSnapshot["clocks"];
  matchStatus: NonNullable<RoomStateSnapshot["match"]>["status"] | null;
  connected?: boolean;
}

function formatTime(milliseconds: number) {
  const seconds = Math.ceil(Math.max(0, milliseconds) / 1000);
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

export function MatchClocks({
  clocks,
  matchStatus,
  connected = true,
}: MatchClocksProps) {
  const [sample, setSample] = useState(() => {
    const now = performance.now();
    return { clocks, receivedAt: now, now };
  });
  const running = matchStatus === "ACTIVE" ? clocks?.running : null;
  useEffect(() => {
    const now = performance.now();
    setSample({ clocks, receivedAt: now, now });
    if (!running) return;
    const redraw = () =>
      setSample((previous) => ({ ...previous, now: performance.now() }));
    const timer = window.setInterval(redraw, 200);
    document.addEventListener("visibilitychange", redraw);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", redraw);
    };
  }, [clocks, running]);

  if (!clocks)
    return <p className="match-clocks__notice">Chưa có đồng hồ thi đấu.</p>;
  // The server already projected both balances at asOf. Only local elapsed
  // time since receiving this sample is deducted; wall-clock dates are unused.
  const elapsed =
    sample.clocks === clocks ? Math.max(0, sample.now - sample.receivedAt) : 0;
  const remaining = {
    red: Math.max(0, clocks.redMs - (running === "red" ? elapsed : 0)),
    black: Math.max(0, clocks.blackMs - (running === "black" ? elapsed : 0)),
  };
  return (
    <section className="match-clocks" aria-label="Đồng hồ thi đấu">
      <div className="match-clocks__pair">
        {(["red", "black"] as const).map((side) => {
          const label = side === "red" ? "Đỏ" : "Đen";
          const active = running === side;
          return (
            <div
              key={side}
              role="group"
              aria-label={label}
              className={`match-clocks__side${active ? " match-clocks__side--running" : ""}`}
            >
              <span className="match-clocks__label">{label}</span>
              <span
                className="match-clocks__time"
                role="timer"
                aria-label={`Thời gian ${label}`}
                aria-live="off"
              >
                {formatTime(remaining[side])}
              </span>
              <span className="match-clocks__turn">
                {active ? "Đang lượt" : "\u00a0"}
              </span>
            </div>
          );
        })}
      </div>
      {running && remaining[running] === 0 && (
        <p className="match-clocks__notice">
          Đang chờ máy chủ xác nhận hết giờ.
        </p>
      )}
      {!connected && (
        <p className="match-clocks__notice">
          Đang chờ đồng bộ kết nối.
          {running && " Đồng hồ vẫn tiếp tục chạy."}
        </p>
      )}
    </section>
  );
}
