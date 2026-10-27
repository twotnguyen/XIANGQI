/**
 * Dữ liệu hiển thị của một phòng cờ công khai trên danh sách phòng ngoài Sảnh:
 * Thông tin mã phòng, tên phòng, chủ phòng, thời gian thi đấu, trạng thái (chờ/đang chơi),
 * số người xem hiện tại, giới hạn người xem, số ghế trống và các quyền tham gia (canPlay, canWatch).
 */
export interface PublicRoomView {
  roomId: string;
  name: string;
  host: { displayName: string; isGuest: boolean };
  timeMinutes: number;
  status: "waiting" | "playing";
  spectators: number;
  viewerLimit: number;
  emptySeats: number;
  canPlay: boolean;
  canWatch: boolean;
  publicOpenedAt: string | null;
}

/**
 * Bằng chứng xác thực danh tính để đăng ký nhận feed danh sách phòng công khai theo thời gian thực:
 * - Thành viên: `accessToken` và mã phiên `appSession`.
 * - Khách: chuỗi năng lực `guestCapability`.
 */
export type PublicRoomAuthProof =
  | { kind: "member"; accessToken: string; appSession: string }
  | { kind: "guest"; guestCapability: string };
