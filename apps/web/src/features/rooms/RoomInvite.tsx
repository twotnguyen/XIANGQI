import { Button } from "../../shared/ui/primitives.js";

/**
 * Khung hiển thị mã mời phòng cờ và đường dẫn chia sẻ kèm nút sao chép nhanh vào clipboard.
 */
export function RoomInvite({
  code,
  copying,
  copied,
  copyStatus,
  onCopy,
  onCopyLink,
}: {
  code: string;
  copying: boolean;
  copied: "code" | "link" | null;
  copyStatus: string;
  onCopy: () => void;
  onCopyLink: () => void;
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
        <Button
          variant="secondary"
          disabled={copying}
          onClick={onCopy}
          aria-label="Sao chép mã"
        >
          <CopyFeedback copied={copied === "code"} label="Sao chép mã" />
        </Button>
        <Button
          variant="secondary"
          disabled={copying}
          onClick={onCopyLink}
          aria-label="Sao chép link"
        >
          <CopyFeedback copied={copied === "link"} label="Sao chép link" />
        </Button>
      </div>
      <p className="xq-room-invite-status" role="status" aria-live="polite">
        {copyStatus}
      </p>
    </section>
  );
}

function CopyFeedback({ copied, label }: { copied: boolean; label: string }) {
  return (
    <span className={`xq-copy-feedback${copied ? " is-copied" : ""}`}>
      <span className="xq-copy-label">{label}</span>
      {copied && (
        <svg
          className="xq-copy-check"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          role="img"
          aria-label="Sao chép thành công"
        >
          <path d="m5 12 4 4L19 6" />
        </svg>
      )}
    </span>
  );
}
