import { Button, Dialog } from "../../shared/ui/primitives.js";

/**
 * Hộp thoại đề nghị đổi bên dành cho người được mời (AC02.2.2, Q5, Q7).
 * Chỉ nhận props; trạng thái mở, đếm ngược và hành động nằm ở RoomPage.
 * Esc/X/Thu gọn chỉ thu hộp thoại, không từ chối đề nghị.
 */
export function SwapPrompt({
  open,
  seconds,
  busy,
  onAccept,
  onDecline,
  onCollapse,
}: {
  open: boolean;
  seconds: number;
  busy: boolean;
  onAccept: () => void;
  onDecline: () => void;
  onCollapse: () => void;
}) {
  return (
    <Dialog
      open={open}
      onClose={onCollapse}
      title="Đề nghị đổi bên"
      cancelLabel="Thu gọn"
    >
      <p>Đối thủ muốn đổi bên Đỏ ↔ Đen. Còn {seconds} giây để trả lời.</p>
      <div className="xq-swap-prompt-actions">
        <Button loading={busy} onClick={onAccept}>
          Đồng ý
        </Button>
        <Button variant="secondary" loading={busy} onClick={onDecline}>
          Từ chối
        </Button>
      </div>
    </Dialog>
  );
}
