import { useState } from "react";
import { Button, Dialog } from "../ui/primitives.js";
export interface SpectatorSeat {
  userId: string;
  displayName: string;
}
export function SpectatorsPanel({
  spectators,
  limit,
  selfId,
  canMoveToSpectator,
  canInviteDown,
  canKick,
  downOfferInviteeId,
  busy,
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
  onMoveToSpectator: () => void;
  onInviteDown: (userId: string) => void;
  onKick: (userId: string) => void;
}) {
  const [pendingKick, setPendingKick] = useState<SpectatorSeat | null>(null);
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
                  onClick={() => onInviteDown(watcher.userId)}
                >
                  Mời xuống ghế
                </Button>
              )}{" "}
              {canKick && watcher.userId !== selfId && (
                <Button
                  variant="danger"
                  loading={busy}
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
        <Button variant="secondary" loading={busy} onClick={onMoveToSpectator}>
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
          if (target) onKick(target.userId);
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
