import type { ReactNode } from "react";
import { Button } from "../../shared/ui/primitives.js";
import type { RoomView } from "./room-client.js";

export type SeatAction =
  "switch" | "swap-propose" | "swap-withdraw" | "swap-accept" | "swap-decline";

/**
 * Component hiển thị khu vực hai ghế người chơi (Đỏ và Đen) trong phòng cờ.
 * Bao gồm thông tin người chơi, trạng thái kết nối, trạng thái sẵn sàng,
 * các nút đổi ghế (khi trống) hoặc yêu cầu hoán đổi ghế (khi cả 2 đã ngồi),
 * và nút sẵn sàng/bắt đầu ván.
 */
export function RoomSeats({
  room,
  userId,
  playingLayout,
  player,
  solo,
  writable,
  busy,
  swapCooldownSeconds,
  swapReopenSeconds,
  onSwapReopen,
  readyControl,
  onAction,
  onMoveToSpectator,
}: {
  room: RoomView["room"];
  userId: string;
  playingLayout: boolean;
  player: boolean;
  solo: boolean;
  writable: boolean;
  busy: boolean;
  swapCooldownSeconds: number;
  swapReopenSeconds: number | null;
  onSwapReopen: () => void;
  readyControl: ReactNode;
  onAction: (action: SeatAction) => void;
  onMoveToSpectator?: (userId: string) => void;
}) {
  return (
    <div className="xq-room-seats">
      {(["red", "black"] as const).map((side) => {
        const occupant = room.seats[side],
          label = side === "red" ? "Đỏ" : "Đen",
          ready = Boolean(occupant) && room.connected[side] && room.ready[side],
          canMoveOpponent = Boolean(
            player &&
            room.hostId === userId &&
            room.status === "WAITING" &&
            !room.countdown &&
            occupant &&
            occupant !== userId &&
            onMoveToSpectator,
          );
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
            {!playingLayout &&
              occupant !== userId &&
              (canMoveOpponent ? (
                <Button
                  variant="secondary"
                  loading={busy}
                  disabledReason={
                    !writable
                      ? "Cần kết nối và quyền điều khiển ghế."
                      : (room.spectators?.length ?? 0) >= room.viewerLimit
                        ? "Phòng không còn chỗ cho người xem"
                        : undefined
                  }
                  onClick={() => {
                    if (occupant) onMoveToSpectator?.(occupant);
                  }}
                >
                  Chuyển sang người xem
                </Button>
              ) : (
                <p className="xq-room-seat-hint">
                  {occupant
                    ? ready
                      ? "Đối thủ đã sẵn sàng"
                      : "Đang chờ đối thủ sẵn sàng"
                    : "Mời kỳ hữu bằng mã phòng"}
                </p>
              ))}
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
                      : swapCooldownSeconds > 0
                        ? `Có thể xin đổi bên lại sau ${swapCooldownSeconds} giây.`
                        : undefined
                  }
                  onClick={() => void onAction("swap-propose")}
                >
                  Xin đổi bên
                </Button>
              )}
              {!solo &&
                !room.countdown &&
                room.swapOffer &&
                room.swapOffer.responderId !== userId && (
                  <div
                    className="xq-swap-prompt"
                    role="group"
                    aria-label="Đề nghị đổi bên"
                  >
                    <p>Đang chờ đối thủ trả lời đề nghị đổi bên…</p>
                    <Button
                      variant="secondary"
                      loading={busy}
                      disabledReason={
                        !writable
                          ? "Cần kết nối và quyền điều khiển ghế."
                          : undefined
                      }
                      onClick={() => void onAction("swap-withdraw")}
                    >
                      Rút đề nghị
                    </Button>
                  </div>
                )}
              {swapReopenSeconds !== null && (
                <Button variant="secondary" onClick={onSwapReopen}>
                  Xem đề nghị đổi bên ({swapReopenSeconds} giây)
                </Button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
