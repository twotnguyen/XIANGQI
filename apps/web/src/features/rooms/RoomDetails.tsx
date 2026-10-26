import type { RoomView } from "./room-client.js";
import { visibilityLabel } from "./room-labels.js";

/**
 * Hiển thị thông số chi tiết của phòng cờ (thời gian mỗi bên, giới hạn người xem, chế độ hiển thị công khai/khóa).
 */
export function RoomDetails({ room }: { room: RoomView["room"] }) {
  return (
    <div className="xq-room-details">
      <h2>Phòng của kỳ hữu</h2>
      <dl>
        <dt>Mỗi bên</dt>
        <dd>{room.timeMinutes} phút</dd>
        <dt>Người xem tối đa</dt>
        <dd>{room.viewerLimit}</dd>
        <dt>Chế độ</dt>
        <dd>{visibilityLabel(room.visibility)}</dd>
      </dl>
      <p>Thời gian và trần người xem đã cố định.</p>
      {room.visibility === "LOCKED" && (
        <p>Mã mời đã bị khoá, người mới không vào được.</p>
      )}
    </div>
  );
}
