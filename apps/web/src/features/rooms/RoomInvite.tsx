import { useState, type ReactNode } from "react";
import { Button, Dialog, Tabs } from "../../shared/ui/primitives.js";

/**
 * Nút mở hộp thoại mời vào phòng: mã phòng, đường dẫn (có thể chọn để sao chép thủ công) và tab bạn bè khi được truyền vào.
 */
export function RoomInvite({
  code,
  copying,
  copied,
  copyStatus,
  onCopy,
  onCopyLink,
  friends,
}: {
  code: string;
  copying: boolean;
  copied: "code" | "link" | null;
  copyStatus: string;
  onCopy: () => void;
  onCopyLink: () => void;
  friends?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const link = `${window.location.origin}/rooms/join?token=${encodeURIComponent(code)}`;
  const linkTab = (
    <div className="xq-room-share-content">
      <div className="xq-room-invite-code">
        <span className="xq-room-invite-label">Mã phòng</span>
        <strong>{code}</strong>
      </div>
      <label className="xq-room-invite-label" htmlFor="room-invite-link">
        Đường dẫn
      </label>
      <input
        id="room-invite-link"
        className="xq-room-invite-link"
        readOnly
        value={link}
        onFocus={(event) => event.currentTarget.select()}
      />
      <p className="xq-room-invite-hint">
        Chia sẻ mã hoặc đường dẫn để mời người khác vào chơi hay xem.
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
    </div>
  );
  return (
    <div className="xq-room-invite">
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Mời vào phòng
      </Button>
      <Dialog open={open} onClose={() => setOpen(false)} title="Mời vào phòng">
        {friends ? (
          <Tabs
            label="Cách mời"
            items={[
              { id: "link", label: "Mã và link", content: linkTab },
              { id: "friends", label: "Bạn bè", content: friends },
            ]}
          />
        ) : (
          linkTab
        )}
      </Dialog>
    </div>
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
