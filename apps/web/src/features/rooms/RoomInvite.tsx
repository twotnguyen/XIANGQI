import { Button } from "../../shared/ui/primitives.js";

/**
 * Khung hiển thị mã mời phòng cờ và đường dẫn chia sẻ kèm nút sao chép nhanh vào clipboard.
 */
export function RoomInvite({
  code,
  copying,
  copyStatus,
  onCopy,
}: {
  code: string;
  copying: boolean;
  copyStatus: string;
  onCopy: () => void;
}) {
  return (
    <section className="xq-room-invite" aria-label="Mời người vào phòng">
      <div className="xq-room-invite-code">
        <span className="xq-room-invite-label">Mã phòng</span>
        <strong>{code}</strong>
      </div>
      <p className="xq-room-invite-hint">
        Chia sẻ mã hoặc đường dẫn để mời kỳ hữu vào chơi hay xem.
      </p>
      <div className="xq-room-invite-actions">
        <Button variant="secondary" loading={copying} onClick={onCopy}>
          Sao chép mã
        </Button>
        <a
          className="xq-room-invite-link"
          href={`/rooms/join?token=${encodeURIComponent(code)}`}
        >
          Đường dẫn mời vào phòng
        </a>
      </div>
      {copyStatus && (
        <p className="xq-room-invite-status" role="status" aria-live="polite">
          {copyStatus}
        </p>
      )}
    </section>
  );
}
