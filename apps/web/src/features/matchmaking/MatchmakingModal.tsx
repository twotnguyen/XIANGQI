import { Button, Dialog } from "../../shared/ui/primitives.js";
import type { Matchmaking } from "./useMatchmaking.js";

export function MatchmakingModal({ matchmaking: queue }: { matchmaking: Matchmaking }) {
  if (!queue.open) return null;
  const status = queue.state?.status;
  const active = status === "SEARCHING" || status === "CONFIRMING" || status === "WAITING" || status === "COUNTDOWN";
  const blocked = queue.pending || !queue.connected;
  return (
    <Dialog open={queue.open} title="Tìm trận" onClose={queue.dismiss} dismissible={(!active || !queue.connected) && !queue.pending} cancelLabel="Đóng">
      <div role="status" aria-live="polite">
        {queue.error ? <p>{queue.error}</p> : status === "SEARCHING" ? <p>Đang tìm đối thủ…</p> : status === "CONFIRMING" ? <p>Đã tìm thấy đối thủ. Hãy xác nhận để bắt đầu.</p> : status === "WAITING" ? <p>Đã xác nhận. Đang chờ đối thủ…</p> : status === "COUNTDOWN" ? <p>Trận đấu sắp bắt đầu.</p> : status === "MATCHED" ? <p>Đã ghép trận.</p> : status === "TIMED_OUT" ? <p>Không tìm được đối thủ, vui lòng tìm lại sau.</p> : status === "CANCELLED" ? <p>{queue.state?.reason || "Hàng đợi đã bị huỷ."}</p> : <p>Đang kết nối tìm trận…</p>}
        {!queue.connected && active && <p>Đang kết nối lại…</p>}
      </div>
        {queue.seconds !== null && active && <p>Thời gian còn lại: {queue.seconds} giây</p>}
      {status === "SEARCHING" && <Button variant="secondary" disabled={blocked} onClick={queue.cancel}>Hủy tìm trận</Button>}
      {status === "CONFIRMING" && <><Button disabled={blocked} onClick={queue.confirm}>Xác nhận</Button> <Button variant="secondary" disabled={blocked} onClick={queue.decline}>Từ chối</Button></>}
      {queue.error || status === "TIMED_OUT" || status === "CANCELLED" || (status === "IDLE" && queue.connected) ? <Button disabled={queue.pending} onClick={queue.retry}>Thử lại</Button> : null}
    </Dialog>
  );
}
