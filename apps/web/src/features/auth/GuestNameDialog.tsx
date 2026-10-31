import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { isValidDisplayName, normalizeDisplayName } from "@xiangqi/shared";
import { Dialog, TextField } from "../../shared/ui/primitives.js";
import { GuestRequestError, useSession } from "./SessionProvider.js";

const invalidNameMessage = "Tên Khách cần 2–20 ký tự hợp lệ";

/**
 * Dùng cùng chuẩn hóa và quy tắc tên với máy chủ, giới hạn Khách ở 20 ký tự.
 * Trả về null nếu tên không hợp lệ để không gửi yêu cầu vô ích.
 */
function checkGuestName(raw: string): string | null {
  const name = normalizeDisplayName(raw);
  return isValidDisplayName(name, 20) ? name : null;
}

/**
 * Hộp thoại nhập tên hiển thị để vào chế độ Khách. Tên được kiểm tra trước rồi máy chủ kiểm tra lại;
 * lỗi `GUEST_NAME_INVALID` hiển thị ngay tại ô nhập.
 */
export function GuestNameDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const session = useSession();
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const pending = useRef<AbortController | null>(null);
  // Đóng hộp thoại hoặc unmount thì hủy lượt đang chờ: phiên Khách đến muộn không được cài.
  useEffect(() => {
    if (!open) pending.current?.abort();
  }, [open]);
  useEffect(() => () => pending.current?.abort(), []);
  const submit = async () => {
    if (pending.current) return;
    const displayName = checkGuestName(name);
    if (displayName === null) {
      setError(invalidNameMessage);
      return;
    }
    const controller = new AbortController();
    pending.current = controller;
    setBusy(true);
    setError("");
    try {
      await session.startGuest(displayName, controller.signal);
      // Thành công: guard của router chuyển /login sang điểm đến đã lưu (một lần).
      if (!controller.signal.aborted) onClose();
    } catch (failure) {
      if (controller.signal.aborted) return;
      setError(
        failure instanceof GuestRequestError &&
          failure.code === "GUEST_NAME_INVALID"
          ? invalidNameMessage
          : "Chưa thể vào chế độ Khách. Vui lòng thử lại.",
      );
    } finally {
      if (pending.current === controller) {
        pending.current = null;
        setBusy(false);
      }
    }
  };
  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    void submit();
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Chơi với tư cách Khách"
      onConfirm={() => void submit()}
      confirmLabel={busy ? "Đang vào…" : "Vào chơi"}
    >
      <TextField
        label="Tên hiển thị"
        value={name}
        onChange={(event) => setName(event.target.value)}
        onKeyDown={onKeyDown}
        error={error || undefined}
        disabled={busy}
        autoComplete="nickname"
      />
    </Dialog>
  );
}
