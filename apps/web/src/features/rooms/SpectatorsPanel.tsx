import { useEffect, useState } from "react";
import { Button, Dialog } from "../../shared/ui/primitives.js";
export interface SpectatorSeat {
  userId: string;
  displayName: string;
  guest?: boolean;
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
  moveToSpectatorReason,
  canInviteDown,
  canKick,
  downOfferInviteeId,
  inviteCooldownSeconds = 0,
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
  moveToSpectatorReason?: string;
  canInviteDown: boolean;
  canKick: boolean;
  downOfferInviteeId: string | null;
  inviteCooldownSeconds?: number;
  busy: boolean;
  writable?: boolean;
  onMoveToSpectator: () => void;
  onInviteDown: (userId: string) => void;
  onKick: (userId: string) => void;
}) {
  const [pendingKick, setPendingKick] = useState<SpectatorSeat | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => {
    if (!writable) setPendingKick(null);
  }, [writable]);
  return (
    <section className="xq-viewers" aria-label="Người xem">
      <h2>
        Người xem {spectators.length}/{limit}
      </h2>
      <div className="xq-viewer-slots" aria-label="Chỗ người xem">
        {Array.from({ length: limit }, (_, index) => {
          const watcher = spectators[index];
          if (!watcher && canMoveToSpectator) {
            return (
              <button
                key={`empty-${index}`}
                type="button"
                className="xq-viewer-slot xq-viewer-slot-button"
                aria-label={`Chuyển sang xem tại chỗ ${index + 1}`}
                aria-disabled={busy || !writable || Boolean(moveToSpectatorReason)}
                title={!writable ? BUSY : moveToSpectatorReason}
                onClick={() => {
                  if (!busy && writable && !moveToSpectatorReason) onMoveToSpectator();
                }}
              >
                +
              </button>
            );
          }
          if (watcher && (canInviteDown || (canKick && watcher.userId !== selfId))) {
            return (
              <button
                key={watcher.userId}
                type="button"
                className="xq-viewer-slot xq-viewer-slot-button is-occupied"
                aria-label={nameOf(watcher)}
                aria-expanded={selectedId === watcher.userId}
                title={nameOf(watcher)}
                onClick={() => setSelectedId(selectedId === watcher.userId ? null : watcher.userId)}
              >
                {Array.from(watcher.displayName.trim())[0]?.toUpperCase()}
              </button>
            );
          }
          return (
            <span
              key={watcher?.userId ?? `empty-${index}`}
              className={`xq-viewer-slot${watcher ? " is-occupied" : ""}`}
              aria-label={watcher ? nameOf(watcher) : `Chỗ xem trống ${index + 1}`}
              role="img"
              title={watcher ? nameOf(watcher) : "Chỗ xem trống"}
            >
              {watcher ? Array.from(watcher.displayName.trim())[0]?.toUpperCase() : "+"}
            </span>
          );
        })}
      </div>
      {spectators.some((watcher) => watcher.userId === selectedId) && (
        <ul className="xq-viewer-actions">
          {spectators.filter((watcher) => watcher.userId === selectedId).map((watcher) => (
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
