import { useEffect, useState } from "react";
import { Button, Dialog } from "../../shared/ui/primitives.js";
export interface SpectatorSeat {
  userId: string;
  displayName: string;
}

/**
 * Component hiển thị danh sách người xem (khán giả) trong phòng cờ.
 * Hỗ trợ các hành động: người chơi chuyển xuống làm người xem,
 * chủ phòng mời người xem lên ghế chơi cờ, hoặc đuổi người xem khỏi phòng (kèm popup xác nhận).
 */
export function SpectatorsPanel({
  spectators,
  limit,
  selfId,
  canMoveToSpectator,
  canInviteDown,
  canKick,
  downOfferInviteeId,
  busy,
  writable = true,
  onMoveToSpectator,
  onInviteDown,
  onKick,
}: {
  spectators: SpectatorSeat[];
  limit: number;
  selfId: string;
  canMoveToSpectator: boolean;
  canInviteDown: boolean;
  canKick: boolean;
  downOfferInviteeId: string | null;
  busy: boolean;
  writable?: boolean;
  onMoveToSpectator: () => void;
  onInviteDown: (userId: string) => void;
  onKick: (userId: string) => void;
}) {
  const [pendingKick, setPendingKick] = useState<SpectatorSeat | null>(null);
  useEffect(() => {
    if (!writable) setPendingKick(null);
  }, [writable]);
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
                {watcher.displayName || "Khách"}
                {watcher.userId === selfId ? " (bạn)" : ""}
              </span>{" "}
              {canInviteDown && (
                <Button
                  variant="secondary"
                  loading={busy}
                  disabledReason={
                    !writable
                      ? "Cần kết nối và quyền điều khiển phòng."
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
                  disabledReason={
                    !writable
                      ? "Cần kết nối và quyền điều khiển phòng."
                      : undefined
                  }
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
      {canMoveToSpectator && (
        <Button
          variant="secondary"
          loading={busy}
          disabledReason={
            !writable
              ? "Cần kết nối và quyền điều khiển phòng."
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
          Đuổi {pendingKick?.displayName || "Khách"} khỏi phòng? Người này sẽ
          được đưa về Sảnh và không vào lại phòng được.
        </p>
      </Dialog>
    </section>
  );
}
