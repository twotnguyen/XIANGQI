import { RoomRequestError, type RoomView } from "./room-client.js";

/**
 * Chuyển đổi mã chế độ hiển thị phòng (PUBLIC, CODE_ONLY, LOCKED) thành nhãn tiếng Việt.
 */
export function visibilityLabel(visibility: RoomView["room"]["visibility"]) {
  return visibility === "PUBLIC"
    ? "Công khai"
    : visibility === "CODE_ONLY"
      ? "Theo mã mời"
      : "Đã khóa";
}

/**
 * Ánh xạ mã lỗi hoặc trạng thái hoán đổi ghế (swap) thành thông báo tiếng Việt dễ hiểu.
 */
export function swapMessage(code: string, fallback: string) {
  switch (code) {
    case "SWAP_COOLDOWN":
      return "Vừa bị từ chối hoặc hết hạn. Chờ 60 giây rồi gửi lại.";
    case "SWAP_ALREADY_PENDING":
      return "Đang có đề nghị đổi bên chờ trả lời.";
    case "SWAP_EXPIRED":
      return "Đề nghị đã hết hạn. Gửi đề nghị mới nếu muốn đổi bên.";
    case "SWAP_NOT_PENDING":
      return "Không còn đề nghị đổi bên nào.";
    case "SWAP_STALE":
      return "Thành phần phòng đã thay đổi. Đề nghị cũ đã huỷ.";
    default:
      return fallback;
  }
}

/**
 * Ánh xạ mã lỗi tái đấu (US-P2-09) thành thông báo tiếng Việt.
 */
export function rematchMessage(code: string, fallback: string) {
  switch (code) {
    case "REMATCH_ALREADY_PENDING":
      return "Đang có đề nghị tái đấu chờ trả lời.";
    case "REMATCH_NOT_PENDING":
      return "Không còn đề nghị tái đấu nào.";
    case "REMATCH_FORBIDDEN":
      return "Chỉ người được mời mới trả lời đề nghị này.";
    case "REMATCH_EXPIRED":
      return "Đề nghị tái đấu đã hết hạn (30 giây).";
    case "REMATCH_STALE":
      return "Thành phần phòng đã thay đổi. Đề nghị tái đấu đã huỷ.";
    case "REMATCH_DENIED":
      return "Phòng này chưa thể tái đấu. Chỉ phòng tùy chỉnh có hai thành viên sau ván kết thúc.";
    case "PLAYER_DISCONNECTED":
      return "Có người chơi chưa kết nối nên chưa thể bắt đầu tái đấu.";
    default:
      return fallback;
  }
}

/**
 * Chuyển đổi lỗi thao tác khán giả (đầy phòng, chủ phòng không thể xuống xem, cấm đuổi...) thành câu thông báo thân thiện.
 */
export function viewerActionMessage(error: unknown) {
  const generic =
    "Thao tác chưa thực hiện được. Kiểm tra trạng thái phòng rồi thử lại.";
  if (!(error instanceof RoomRequestError)) return generic;
  switch (error.code) {
    case "FRIEND_BUSY":
      return "Người này đang ở trong một ván/phòng khác.";
    case "ALREADY_SEATED":
      return "Bạn đang ở trong một ván/phòng khác.";
    case "ROOM_FULL":
      return "Phòng đã đầy chỗ xem.";
    case "SEAT_FULL":
      return "Ghế đã đủ hai người chơi.";
    case "HOST_STAYS":
      return "Chủ phòng không tự chuyển xuống xem.";
    case "KICK_DENIED":
      return "Chỉ người chơi được đuổi người xem.";
    case "SEAT_MOVE_DENIED":
      return "Không thể đổi chỗ khi ván đang diễn ra.";
    default:
      return generic;
  }
}
