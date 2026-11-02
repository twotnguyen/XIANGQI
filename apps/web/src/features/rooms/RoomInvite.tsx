import { useState, type ReactNode } from "react";
import { Button, Dialog } from "../../shared/ui/primitives.js";

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
  const copyActions = (
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
  );
  return (
    <div className="xq-room-invite">
      <div className="xq-room-invite-code">
        <span className="xq-room-invite-label">Mã phòng</span>
        <strong>{code}</strong>
      </div>
      {copyActions}
      <p className="xq-room-invite-status" role="status" aria-live="polite">
        {copyStatus}
      </p>
      {friends && (
        <>
          <Button variant="secondary" onClick={() => setOpen(true)}>
            Mời bạn bè
          </Button>
          <Dialog open={open} onClose={() => setOpen(false)} title="Mời bạn bè">
            {open && friends}
          </Dialog>
        </>
      )}
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
