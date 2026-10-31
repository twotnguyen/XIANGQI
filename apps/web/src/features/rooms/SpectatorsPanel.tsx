import { useEffect, useState } from "react";
import { Button, Dialog } from "../../shared/ui/primitives.js";
export interface SpectatorSeat {
  userId: string;
  displayName: string;
  guest?: boolean;
}
export interface SeatRequestRow {
  id: string;
  userId: string;
  seconds: number;
}

const BUSY = "Cần kết nối và quyền điều khiển phòng.";
const nameOf = (watcher: SpectatorSeat | undefined) =>
  `${watcher?.displayName || "Khách"}${watcher?.guest ? " (Khách)" : ""}`;

/**
 * Component hiển thị danh sách người xem (khán giả) trong phòng cờ cho mọi người trong phòng.
 * Hành động theo vai trò: người chơi chuyển xuống xem, Host mời người xem lên ghế hoặc duyệt yêu cầu xin ngồi,
 * người xem xin ngồi ghế, hai người chơi đuổi người xem (kèm popup xác nhận).
 */
export function SpectatorsPanel({
  spectators,
  limit,
  selfId,
  canMoveToSpectator,
  canInviteDown,
  canKick,
  downOfferInviteeId,
  inviteCooldownSeconds = 0,
  seatRequests = [],
  canRequestSeat = false,
  canRespondRequests = false,
  requestSeatReason,
  busy,
  writable = true,
  onMoveToSpectator,
  onInviteDown,
  onRequestSeat,
  onRespondRequest,
  onKick,
}: {
  spectators: SpectatorSeat[];
  limit: number;
  selfId: string;
  canMoveToSpectator: boolean;
  canInviteDown: boolean;
  canKick: boolean;
  downOfferInviteeId: string | null;
  inviteCooldownSeconds?: number;
  /** Host: mọi yêu cầu còn hạn; người xem: chỉ yêu cầu của chính mình. */
  seatRequests?: SeatRequestRow[];
  canRequestSeat?: boolean;
  canRespondRequests?: boolean;
  /** Có lý do thì nút Xin ngồi ghế bị khóa nhưng vẫn hiện. */
  requestSeatReason?: string;
  busy: boolean;
  writable?: boolean;
  onMoveToSpectator: () => void;
  onInviteDown: (userId: string) => void;
  onRequestSeat?: () => void;
  onRespondRequest?: (requestId: string, accept: boolean) => void;
  onKick: (userId: string) => void;
}) {
  const [pendingKick, setPendingKick] = useState<SpectatorSeat | null>(null);
  useEffect(() => {
    if (!writable) setPendingKick(null);
  }, [writable]);
  const mine = seatRequests.find((q) => q.userId === selfId);
  const byId = new Map(spectators.map((w) => [w.userId, w]));
  const hostRequests = canRespondRequests;
  return (
    <section className="xq-viewers" aria-label="Người xem">
      <h2>
        Người xem {spectators.length}/{limit}
      </h2>
      {spectators.length === 0 ? (
        <p>Chưa có người xem.</p>
      ) : (
        <ul>
          {spectators.map((watcher) => (
            <li key={watcher.userId}>
              <span>
                {nameOf(watcher)}
                {watcher.userId === selfId ? " (bạn)" : ""}
              </span>{" "}
              {canInviteDown && (
                <Button
                  variant="secondary"
                  loading={busy}
                  disabledReason={
                    !writable
                      ? BUSY
                      : downOfferInviteeId
                        ? "Đang có lời mời xuống ghế chờ trả lời."
                        : inviteCooldownSeconds > 0
                          ? `Chờ ${inviteCooldownSeconds} giây để mời lại.`
                          : undefined
                  }
                  onClick={() => onInviteDown(watcher.userId)}
                >
                  Mời xuống ghế
                </Button>
              )}{" "}
              {canKick && watcher.userId !== selfId && (
                <Button
                  variant="danger"
                  loading={busy}
                  disabledReason={!writable ? BUSY : undefined}
                  onClick={() => setPendingKick(watcher)}
                >
                  Đuổi
                </Button>
              )}
              {downOfferInviteeId === watcher.userId && (
                <span role="status"> · Đã mời xuống ghế, chờ trả lời</span>
              )}
            </li>
          ))}
        </ul>
      )}
      {hostRequests && seatRequests.length > 0 && (
        <ul aria-label="Yêu cầu xin ngồi ghế" className="xq-seat-requests">
          {seatRequests.map((q) => (
            <li key={q.id}>
              <span>
                {nameOf(byId.get(q.userId))} xin ngồi ghế · còn {q.seconds} giây
              </span>{" "}
              <Button
                loading={busy}
                disabledReason={!writable ? BUSY : undefined}
                onClick={() => onRespondRequest?.(q.id, true)}
              >
                Đồng ý
              </Button>{" "}
              <Button
                variant="secondary"
                loading={busy}
                disabledReason={!writable ? BUSY : undefined}
                onClick={() => onRespondRequest?.(q.id, false)}
              >
                Từ chối
              </Button>
            </li>
          ))}
        </ul>
      )}
      {canRequestSeat &&
        (mine ? (
          <p role="status">Đang chờ chủ phòng · còn {mine.seconds} giây</p>
        ) : (
          <Button
            variant="secondary"
            loading={busy}
            disabledReason={!writable ? BUSY : requestSeatReason}
            onClick={() => onRequestSeat?.()}
          >
            Xin ngồi ghế
          </Button>
        ))}
      {canMoveToSpectator && (
        <Button
          variant="secondary"
          loading={busy}
          disabledReason={
            !writable
              ? BUSY
              : spectators.length >= limit
                ? "Phòng không còn chỗ cho người xem"
                : undefined
          }
          onClick={onMoveToSpectator}
        >
          Chuyển sang xem
        </Button>
      )}
      <Dialog
        open={Boolean(pendingKick)}
        danger
        title="Đuổi người xem"
        confirmLabel="Đuổi khỏi phòng"
        cancelLabel="Huỷ"
        onClose={() => setPendingKick(null)}
        onConfirm={() => {
          const target = pendingKick;
          setPendingKick(null);
          if (target && writable && !busy) onKick(target.userId);
        }}
      >
        <p>
          Đuổi {nameOf(pendingKick ?? undefined)} khỏi phòng? Người này sẽ được
          đưa về Sảnh và không vào lại phòng được cho đến khi phòng đóng.
        </p>
      </Dialog>
    </section>
  );
}
