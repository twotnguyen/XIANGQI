import type { ReactNode } from "react";
import { Button } from "../../shared/ui/primitives.js";
import type { RoomView } from "./room-client.js";

export type SeatAction =
  "switch" | "swap-propose" | "swap-withdraw" | "swap-accept" | "swap-decline";

export function RoomSeats({
  room,
  userId,
  playingLayout,
  player,
  solo,
  writable,
  busy,
  swapNow,
  readyControl,
  onAction,
}: {
  room: RoomView["room"];
  userId: string;
  playingLayout: boolean;
  player: boolean;
  solo: boolean;
  writable: boolean;
  busy: boolean;
  swapNow: number;
  readyControl: ReactNode;
  onAction: (action: SeatAction) => void;
}) {
  return (
    <div className="xq-room-seats">
      {(["red", "black"] as const).map((side) => {
        const occupant = room.seats[side],
          label = side === "red" ? "Đỏ" : "Đen",
          ready = Boolean(occupant) && room.connected[side] && room.ready[side];
        return (
          <section
            className={`xq-room-seat ${side}`}
            key={side}
            data-ready={ready}
            aria-label={`Ghế ${label}`}
          >
            {!playingLayout && (
              <span className="xq-seat-side">
                Phe {label} ({side === "red" ? "Đi trước" : "Đi sau"})
              </span>
            )}
            <span className="xq-seat-piece" aria-hidden="true">
              {side === "red" ? "帥" : "將"}
            </span>
            <div className="xq-room-seat-player">
              <h2>
                {occupant
                  ? occupant === userId
                    ? `Bạn · ${label}`
                    : `Người chơi ${label}${occupant === room.hostId ? " · Chủ phòng" : ""}`
                  : `Ghế ${label} đang trống`}
              </h2>
              {occupant === userId && occupant === room.hostId && (
                <p>Chủ phòng</p>
              )}
            </div>
            <p className="xq-room-seat-state">
              {!occupant
                ? "Đang chờ kỳ hữu"
                : !room.connected[side]
                  ? "Mất kết nối · đang giữ ghế"
                  : room.ready[side]
                    ? "Đã sẵn sàng"
                    : "Chưa sẵn sàng"}
            </p>
            {!playingLayout && occupant === userId && readyControl}
            {!playingLayout && occupant !== userId && (
              <p className="xq-room-seat-hint">
                {occupant
                  ? ready
                    ? "Đối thủ đã sẵn sàng"
                    : "Đang chờ đối thủ sẵn sàng"
                  : "Mời kỳ hữu bằng mã phòng"}
              </p>
            )}
          </section>
        );
      })}
      {(!playingLayout || room.status === "WAITING") && (
        <div className="xq-room-versus">
          <span className="xq-room-vs" aria-hidden="true">
            VS
          </span>
          {room.status === "WAITING" && player && (
            <div className="xq-room-actions">
              {solo && room.hostId === userId && (
                <Button
                  variant="secondary"
                  loading={busy}
                  disabledReason={
                    !writable
                      ? "Cần kết nối và quyền điều khiển ghế."
                      : undefined
                  }
                  onClick={() => void onAction("switch")}
                >
                  Đổi ghế
                </Button>
              )}
              {!solo && !room.countdown && !room.swapOffer && (
                <Button
                  variant="secondary"
                  loading={busy}
                  disabledReason={
                    !writable
                      ? "Cần kết nối và quyền điều khiển ghế."
                      : undefined
                  }
                  onClick={() => void onAction("swap-propose")}
                >
                  Xin đổi bên
                </Button>
              )}
              {!solo && !room.countdown && room.swapOffer && (
                <div
                  className="xq-swap-prompt"
                  role="group"
                  aria-label="Đề nghị đổi bên"
                >
                  {room.swapOffer.responderId === userId ? (
                    <>
                      <p>
                        Đối thủ muốn đổi bên Đỏ ↔ Đen. Còn{" "}
                        {Math.max(
                          0,
                          Math.ceil(
                            (Date.parse(room.swapOffer.expiresAt) - swapNow) /
                              1000,
                          ),
                        )}{" "}
                        giây để trả lời.
                      </p>
                      <Button
                        loading={busy}
                        onClick={() => void onAction("swap-accept")}
                      >
                        Đồng ý
                      </Button>
                      <Button
                        variant="secondary"
                        loading={busy}
                        onClick={() => void onAction("swap-decline")}
                      >
                        Từ chối
                      </Button>
                    </>
                  ) : (
                    <>
                      <p>Đang chờ đối thủ trả lời đề nghị đổi bên…</p>
                      <Button
                        variant="secondary"
                        loading={busy}
                        onClick={() => void onAction("swap-withdraw")}
                      >
                        Rút đề nghị
                      </Button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
